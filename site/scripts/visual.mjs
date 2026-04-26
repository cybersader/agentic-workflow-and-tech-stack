#!/usr/bin/env bun
/**
 * Visual iteration harness — serves dist/ statically, launches chromium,
 * navigates to a page, inspects the DOM, and screenshots the graph + full page.
 *
 * Usage:
 *   bun scripts/visual.mjs                               # default: stack page, mobile
 *   bun scripts/visual.mjs /principles/07-five-strata/   # specific page
 *   bun scripts/visual.mjs /stack/ desktop               # desktop viewport
 *   bun scripts/visual.mjs /stack/ mobile keep           # keep open, dont quit
 *
 * Outputs to /tmp/visual-<timestamp>/:
 *   - full.png        Full-page screenshot
 *   - graph.png       Graph container only
 *   - report.md       DOM inspection, console logs, errors
 */

import { existsSync, statSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, "..");
const distDir = resolve(siteDir, "dist");

const PATH = process.argv[2] || "/stack/";
const VIEWPORT_MODE = process.argv[3] || "mobile";
const KEEP = process.argv.includes("keep");

const PORT = 4323; // different from smoke/dev
const PREFIX = "/agentic-workflow-and-tech-stack";

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },   // iPhone 13 / Pixel 6
  tablet: { width: 768, height: 1024 },
  narrow: { width: 1024, height: 768 },
  desktop: { width: 1440, height: 900 },
};

const viewport = VIEWPORTS[VIEWPORT_MODE] || VIEWPORTS.mobile;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};
const contentType = (p) => MIME[p.slice(p.lastIndexOf("."))] || "application/octet-stream";

// ── Start static server ──────────────────────────────────────────────
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === PREFIX || pathname.startsWith(`${PREFIX}/`)) {
      pathname = pathname.slice(PREFIX.length) || "/";
    }
    let filePath = join(distDir, pathname);
    try {
      if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        filePath = join(filePath, "index.html");
      }
      if (!existsSync(filePath)) {
        if (existsSync(`${filePath}.html`)) filePath = `${filePath}.html`;
        else return new Response("Not found", { status: 404 });
      }
      return new Response(Bun.file(filePath), {
        headers: { "Content-Type": contentType(filePath) },
      });
    } catch (err) {
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  },
});

console.log(`  Static server on http://127.0.0.1:${PORT}`);
console.log(`  Target: ${PATH} @ ${VIEWPORT_MODE} (${viewport.width}x${viewport.height})`);

// ── Output dir ──────────────────────────────────────────────────────
const outDir = `/tmp/visual-${Date.now()}`;
mkdirSync(outDir, { recursive: true });
console.log(`  Output: ${outDir}`);

// ── Launch browser + inspect ────────────────────────────────────────
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport });
const page = await context.newPage();

const consoleLogs = [];
const pageErrors = [];
page.on("console", (msg) => {
  consoleLogs.push({ type: msg.type(), text: msg.text() });
});
page.on("pageerror", (err) => pageErrors.push(err.message));

const url = `http://127.0.0.1:${PORT}${PREFIX}${PATH}`;
console.log(`  Navigating to ${url}`);
await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

// Give the graph some time to hydrate (it uses requestIdleCallback + PixiJS init)
await page.waitForTimeout(3000);

// ── DOM inspection ─────────────────────────────────────────────────
const inspection = await page.evaluate(() => {
  const result = {};

  // Graph component
  const gc = document.querySelector("graph-component");
  if (gc) {
    result.graphComponent = {
      found: true,
      tagName: gc.tagName,
      slug: gc.getAttribute("data-slug"),
      sitemapSize: (gc.getAttribute("data-sitemap") || "").length,
      sitemapPreview: (gc.getAttribute("data-sitemap") || "").slice(0, 100),
      childrenCount: gc.children.length,
      innerHTML_length: gc.innerHTML.length,
      innerHTML_preview: gc.innerHTML.slice(0, 400),
      dimensions: gc.getBoundingClientRect(),
    };
  } else {
    result.graphComponent = { found: false };
  }

  // Graph container
  const gcont = document.querySelector(".slsg-graph-container");
  if (gcont) {
    const rect = gcont.getBoundingClientRect();
    const computed = getComputedStyle(gcont);
    result.graphContainer = {
      found: true,
      width: rect.width,
      height: rect.height,
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity,
      childrenCount: gcont.children.length,
      childTags: Array.from(gcont.children).map(c => c.tagName),
      hasCanvas: !!gcont.querySelector("canvas"),
      hasSvg: !!gcont.querySelector("svg"),
    };
  } else {
    result.graphContainer = { found: false };
  }

  // Canvas specifically (PixiJS renders to canvas)
  const canvas = document.querySelector(".slsg-graph-container canvas");
  if (canvas) {
    result.canvas = {
      found: true,
      width: canvas.width,
      height: canvas.height,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
    };
  } else {
    result.canvas = { found: false };
  }

  // Graph skeleton class (present = still loading / failed)
  result.hasSkeletonClass = !!document.querySelector(".slsg-graph-skeleton");

  // Backlinks (sanity check on the same panel system)
  const backlinks = document.querySelectorAll(".slsg-backlinks li");
  result.backlinks = { count: backlinks.length };

  return result;
});

console.log(`\n  === Inspection ===`);
console.log(JSON.stringify(inspection, null, 2));

// ── Screenshots ────────────────────────────────────────────────────
await page.screenshot({ path: join(outDir, "full.png"), fullPage: true });
console.log(`  Saved: ${outDir}/full.png`);

const graphEl = await page.$(".slsg-graph-panel");
if (graphEl) {
  await graphEl.screenshot({ path: join(outDir, "graph.png") });
  console.log(`  Saved: ${outDir}/graph.png`);
}

// ── Report ─────────────────────────────────────────────────────────
const report = [
  `# Visual Report`,
  ``,
  `- URL: ${url}`,
  `- Viewport: ${VIEWPORT_MODE} (${viewport.width}x${viewport.height})`,
  `- Timestamp: ${new Date().toISOString()}`,
  ``,
  `## Graph component`,
  `\`\`\`json`,
  JSON.stringify(inspection.graphComponent, null, 2),
  `\`\`\``,
  ``,
  `## Graph container`,
  `\`\`\`json`,
  JSON.stringify(inspection.graphContainer, null, 2),
  `\`\`\``,
  ``,
  `## Canvas`,
  `\`\`\`json`,
  JSON.stringify(inspection.canvas, null, 2),
  `\`\`\``,
  ``,
  `## Backlinks rendered`,
  `- count: ${inspection.backlinks.count}`,
  ``,
  `## Skeleton state`,
  `- has skeleton class: ${inspection.hasSkeletonClass}`,
  ``,
  `## Page errors`,
  ...(pageErrors.length ? pageErrors.map((e) => `- ${e}`) : ["(none)"]),
  ``,
  `## Console logs`,
  `Total: ${consoleLogs.length}`,
  ...consoleLogs.slice(0, 30).map((l) => `- [${l.type}] ${l.text}`),
].join("\n");

await writeFile(join(outDir, "report.md"), report);
console.log(`  Saved: ${outDir}/report.md`);

// ── Teardown ───────────────────────────────────────────────────────
if (!KEEP) {
  await browser.close();
  server.stop(true);
  console.log(`  Done.`);
} else {
  console.log(`  (keeping browser open; Ctrl+C to exit)`);
  await new Promise(() => {});
}
