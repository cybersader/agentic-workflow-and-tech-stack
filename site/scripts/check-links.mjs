#!/usr/bin/env bun
/**
 * Link checker for the built site.
 *
 * Walks site/dist/ after `astro build`, parses every HTML page for
 * internal <a href> links, and reports:
 *
 *   - broken links        → target page/file doesn't exist in dist/
 *   - broken fragments    → #anchor doesn't exist in the target page
 *   - orphan pages        → page exists but nothing links to it (warning only)
 *
 * Wikilink issues are handled separately by sync-content.mjs (→
 * scripts/wikilink-issues.md). This script covers regular `[text](path)`
 * links that survive into the rendered HTML.
 *
 * Usage:
 *   bun scripts/check-links.mjs            # assumes dist/ exists
 *   bun scripts/check-links.mjs --build    # run `astro build` first
 *   bun scripts/check-links.mjs --json     # machine output
 *
 * Exit codes:
 *   0 = no broken links (orphans still allowed)
 *   1 = broken links or fragments found
 *   2 = script error (missing dist/, etc.)
 *
 * Report: scripts/link-report.md
 */

import { existsSync, statSync, readFileSync } from "node:fs";
import { writeFile, readdir } from "node:fs/promises";
import { resolve, dirname, join, relative, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, "..");
const distDir = resolve(siteDir, "dist");
const reportPath = resolve(__dirname, "link-report.md");

const PREFIX = "/agentic-workflow-and-tech-stack"; // matches astro.config.mjs `base`
const SHOULD_BUILD = process.argv.includes("--build");
const JSON_OUT = process.argv.includes("--json");

// ── Optional build step ──────────────────────────────────────────────
if (SHOULD_BUILD) {
  console.log("→ running `astro build` first");
  execSync("bun x astro build", { cwd: siteDir, stdio: "inherit" });
}

if (!existsSync(distDir)) {
  console.error(`✗ ${distDir} does not exist. Run \`bun run build\` first or pass --build.`);
  process.exit(2);
}

// ── Walk dist/ recursively for .html files ───────────────────────────
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) results.push(...(await walk(full)));
    else if (e.isFile() && e.name.endsWith(".html")) results.push(full);
  }
  return results;
}

const htmlFiles = await walk(distDir);
console.log(`→ scanning ${htmlFiles.length} html files`);

// ── Parse: extract headings (ids) + links from each page ─────────────
const pageData = new Map(); // distRelPath → { ids: Set, links: [{ href, raw }] }

// Permissive but bounded matchers; the built HTML is well-formed so regex is OK.
const HREF_RX = /<a\s+[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;
// Matches both id="x" and id='x' on heading + anchor elements
const ID_RX = /<(?:h[1-6]|a)[^>]*\sid\s*=\s*["']([^"']+)["']/gi;

for (const file of htmlFiles) {
  const rel = "/" + relative(distDir, file).replace(/\\/g, "/");
  const html = readFileSync(file, "utf8");

  const ids = new Set();
  let m;
  ID_RX.lastIndex = 0;
  while ((m = ID_RX.exec(html)) !== null) ids.add(m[1]);

  const links = [];
  HREF_RX.lastIndex = 0;
  while ((m = HREF_RX.exec(html)) !== null) {
    const href = m[1];
    links.push({ href, raw: m[0].slice(0, 120) });
  }

  pageData.set(rel, { ids, links });
}

// ── Build: distRelPath → same page's canonical URL path (no index.html) ─
function toUrlPath(distRelPath) {
  // "/foo/bar/index.html" → "/foo/bar/"
  // "/foo/bar.html"       → "/foo/bar/"
  if (distRelPath.endsWith("/index.html")) return distRelPath.slice(0, -"index.html".length);
  return distRelPath.replace(/\.html$/, "/");
}

const distUrls = new Set();
for (const rel of pageData.keys()) distUrls.add(toUrlPath(rel));

// ── Validate links ───────────────────────────────────────────────────
const broken = [];      // { src, href, reason } — real broken content links, fail CI
const wikiMiss = [];    // { src, href, reason } — unresolved wikilinks (#/page/...), report only
const orphans = [];     // URLs nothing links to
const incoming = new Map(); // targetUrl → Set(sourceUrl)

function isExternal(href) {
  return /^(https?:|mailto:|tel:|data:)/i.test(href);
}
function stripPrefix(url) {
  return url.startsWith(PREFIX) ? url.slice(PREFIX.length) || "/" : url;
}
function normalizeUrl(href, sourceUrl) {
  // Returns [pathPart, fragment]
  const [p, frag = ""] = href.split("#");
  let path = p;
  if (!path) path = sourceUrl;          // bare "#anchor"
  else if (path.startsWith("/")) path = stripPrefix(path);
  else {
    // relative — resolve against source
    const srcDir = sourceUrl.endsWith("/") ? sourceUrl : sourceUrl.replace(/[^/]*$/, "");
    path = posix.normalize(srcDir + path);
  }
  if (!path.endsWith("/") && !/\.[a-z0-9]+$/i.test(path)) path += "/";
  return [path, frag];
}

for (const [srcRel, data] of pageData) {
  const srcUrl = toUrlPath(srcRel);
  for (const { href, raw } of data.links) {
    if (isExternal(href)) continue;
    // Starlight-site-graph uses `#/page/<path>` for backlink fallbacks when a
    // wikilink doesn't resolve. Treat these as wikilink-misses, not broken
    // content links — sync-content.mjs already reports them to wikilink-issues.md.
    if (href.startsWith("#/page/")) {
      wikiMiss.push({ src: srcUrl, href, reason: "unresolved wikilink target" });
      continue;
    }
    if (href.startsWith("#")) {
      // Same-page fragment
      if (href === "#") continue;
      const frag = href.slice(1);
      if (!data.ids.has(frag)) broken.push({ src: srcUrl, href, reason: `fragment #${frag} not found on same page` });
      continue;
    }
    if (href.startsWith("javascript:") || href.startsWith("?")) continue;

    const [targetPath, fragment] = normalizeUrl(href, srcUrl);

    // Track incoming edges (for orphan detection) — only for actual pages
    if (distUrls.has(targetPath)) {
      if (!incoming.has(targetPath)) incoming.set(targetPath, new Set());
      incoming.get(targetPath).add(srcUrl);
    }

    // Asset file?  (.png, .pdf, .svg, .xml, etc.)
    if (/\.[a-z0-9]+$/i.test(targetPath) && !targetPath.endsWith(".html")) {
      const assetDist = resolve(distDir, "." + targetPath);
      if (!existsSync(assetDist)) broken.push({ src: srcUrl, href, reason: `asset not found: ${targetPath}` });
      continue;
    }

    // Page
    if (!distUrls.has(targetPath)) {
      broken.push({ src: srcUrl, href, reason: `page not found: ${targetPath}` });
      continue;
    }
    // Fragment on target page
    if (fragment) {
      const targetRel =
        Array.from(pageData.keys()).find((r) => toUrlPath(r) === targetPath) || null;
      if (targetRel) {
        const targetIds = pageData.get(targetRel).ids;
        if (!targetIds.has(fragment))
          broken.push({ src: srcUrl, href, reason: `fragment #${fragment} not found on ${targetPath}` });
      }
    }
  }
}

// ── Orphans ──────────────────────────────────────────────────────────
const rootSkips = new Set([
  "/",
  PREFIX + "/",
  stripPrefix(PREFIX + "/"),
  "/404/",
]);
for (const url of distUrls) {
  if (rootSkips.has(url)) continue;
  if (!incoming.has(url) || incoming.get(url).size === 0) orphans.push(url);
}

// ── Report ───────────────────────────────────────────────────────────
const summary = {
  pages: htmlFiles.length,
  brokenCount: broken.length,
  wikiMissCount: wikiMiss.length,
  orphanCount: orphans.length,
};

if (JSON_OUT) {
  console.log(JSON.stringify({ summary, broken, wikiMiss, orphans }, null, 2));
} else {
  console.log(`\n=== Link check summary ===`);
  console.log(`  Pages scanned:            ${summary.pages}`);
  console.log(`  Broken links (fail CI):   ${summary.brokenCount}`);
  console.log(`  Wikilink misses (warn):   ${summary.wikiMissCount}`);
  console.log(`  Orphan pages (warn):      ${summary.orphanCount}`);

  if (broken.length) {
    console.log(`\n--- Broken ---`);
    broken.slice(0, 30).forEach((b) => console.log(`  ✗ ${b.src}  →  ${b.href}   (${b.reason})`));
    if (broken.length > 30) console.log(`  … and ${broken.length - 30} more`);
  }
  if (wikiMiss.length) {
    console.log(`\n--- Wikilink misses (informational) ---`);
    const bySource = new Map();
    for (const w of wikiMiss) {
      if (!bySource.has(w.src)) bySource.set(w.src, 0);
      bySource.set(w.src, bySource.get(w.src) + 1);
    }
    [...bySource.entries()].slice(0, 10).forEach(([src, n]) => console.log(`  · ${src}  (${n} unresolved)`));
    if (bySource.size > 10) console.log(`  … and ${bySource.size - 10} more source pages`);
  }
  if (orphans.length) {
    console.log(`\n--- Orphans (informational) ---`);
    orphans.slice(0, 20).forEach((o) => console.log(`  · ${o}`));
    if (orphans.length > 20) console.log(`  … and ${orphans.length - 20} more`);
  }
}

// Markdown report for the repo
const reportLines = [
  `# Link report`,
  ``,
  `Generated: ${new Date().toISOString()}`,
  ``,
  `| Metric | Count | CI |`,
  `|---|---|---|`,
  `| Pages scanned | ${summary.pages} | — |`,
  `| Broken links | ${summary.brokenCount} | **fails** |`,
  `| Wikilink misses | ${summary.wikiMissCount} | warn |`,
  `| Orphan pages | ${summary.orphanCount} | warn |`,
  ``,
];
if (broken.length) {
  reportLines.push(`## Broken links`, ``, `Real broken content links — these fail CI.`, ``, `| Source page | Link | Reason |`, `|---|---|---|`);
  for (const b of broken.slice(0, 500)) {
    reportLines.push(`| \`${b.src}\` | \`${b.href.replace(/\|/g, "\\|")}\` | ${b.reason.replace(/\|/g, "\\|")} |`);
  }
  reportLines.push(``);
}
if (wikiMiss.length) {
  reportLines.push(`## Wikilink misses`, ``, `Unresolved wikilinks surfaced by starlight-site-graph as \`#/page/...\` fallback fragments. See \`scripts/wikilink-issues.md\` from \`sync-content.mjs\` for the authored-side view. Warning-only; doesn't fail CI.`, ``);
  const bySource = new Map();
  for (const w of wikiMiss) {
    if (!bySource.has(w.src)) bySource.set(w.src, []);
    bySource.get(w.src).push(w.href);
  }
  for (const [src, hrefs] of bySource) {
    reportLines.push(`- \`${src}\` — ${hrefs.length} unresolved`);
  }
  reportLines.push(``);
}
if (orphans.length) {
  reportLines.push(`## Orphan pages`, ``, `Pages with no incoming links from any other page. Often intentional (deep-linked from external sources), sometimes forgotten. Warning-only; doesn't fail CI.`, ``);
  for (const o of orphans.slice(0, 200)) reportLines.push(`- \`${o}\``);
  reportLines.push(``);
}
await writeFile(reportPath, reportLines.join("\n"));
console.log(`\n  Report: ${relative(siteDir, reportPath)}`);

process.exit(broken.length > 0 ? 1 : 0);
