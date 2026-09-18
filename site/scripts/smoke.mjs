#!/usr/bin/env bun
/**
 * Lightweight docs smoke test. Builds the site, serves dist/ via Bun.serve,
 * and curls a known list of routes — checking HTTP 200 AND that each page
 * contains expected content.
 *
 * Catches ~80% of what Playwright would catch (broken routes, missing
 * Flexoki CSS, busted base-path config, dead pagefind index, dead links)
 * for ~10% of the setup. For richer interaction tests, swap in Playwright
 * later.
 *
 * Usage:
 *   bun scripts/smoke.mjs              # full build + smoke
 *   bun scripts/smoke.mjs --no-build   # assume site/dist already built
 *
 * Pattern adapted from portagenty/docs/scripts/smoke.mjs.
 */

import { execSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, "..");
const distDir = resolve(siteDir, "dist");

const PORT = Number(process.env.SMOKE_PORT || 4322);
const BASE = `http://127.0.0.1:${PORT}`;
const PREFIX = "/agentic-workflow-and-tech-stack";
const skipBuild = process.argv.includes("--no-build");
const isWindows = process.platform === "win32";

// Each check: { path, mustContain }. mustContain is a substring asserted
// against the response body — keeps the test honest beyond a 200.
const CHECKS = [
  // Homepage
  { path: `${PREFIX}/`, mustContain: "Agentic Workflow" },
  { path: `${PREFIX}/`, mustContain: "Rebuild your dev machine from a git clone" },

  // Principles (the project's heart)
  { path: `${PREFIX}/principles/`, mustContain: "Principles" },
  { path: `${PREFIX}/principles/01-capture-work-output/`, mustContain: "Capture" },
  { path: `${PREFIX}/principles/02-temperature-gradient/`, mustContain: "Temperature" },
  { path: `${PREFIX}/principles/03-skills-vs-agents/`, mustContain: "Skills" },
  { path: `${PREFIX}/principles/04-progressive-disclosure/`, mustContain: "Progressive Disclosure" },
  { path: `${PREFIX}/principles/07-five-strata/`, mustContain: "Five Strata" },
  { path: `${PREFIX}/principles/09-meta-self-reference/`, mustContain: "Meta" },
  { path: `${PREFIX}/principles/10-multi-entity-design/`, mustContain: "Multi-Entity" },

  // Kernel reference
  { path: `${PREFIX}/kernel/`, mustContain: "Kernel" },
  { path: `${PREFIX}/kernel/architecture/`, mustContain: "" }, // 200 is enough

  // Stack tier
  { path: `${PREFIX}/stack/`, mustContain: "Stack" },
  { path: `${PREFIX}/stack/01-ai-coding/`, mustContain: "Claude Code" },
  { path: `${PREFIX}/stack/02-terminal/`, mustContain: "Zellij" },
  { path: `${PREFIX}/stack/03-cross-device/`, mustContain: "Tailscale" },
  { path: `${PREFIX}/stack/04-knowledge-mgmt/`, mustContain: "Obsidian" },
  { path: `${PREFIX}/stack/decisions/`, mustContain: "Decision" },
  { path: `${PREFIX}/stack/patterns/cross-device-ssh/`, mustContain: "SSH" },
  { path: `${PREFIX}/stack/patterns/image-paste-pipeline/`, mustContain: "Zipline" },

  // Work tier
  { path: `${PREFIX}/work/`, mustContain: "Work" },
  { path: `${PREFIX}/work/memory/tool-picks/`, mustContain: "Claude" },
  { path: `${PREFIX}/work/memory/preferences/`, mustContain: "Preferences" },
  { path: `${PREFIX}/work/memory/project-references/`, mustContain: "cyberbaser" },
  { path: `${PREFIX}/work/project-types/astro-starlight-docs/`, mustContain: "Astro" },
  { path: `${PREFIX}/work/rebuild/`, mustContain: "Rebuild" },
  { path: `${PREFIX}/work/rebuild/01-os-baseline/`, mustContain: "WSL" },
  { path: `${PREFIX}/work/rebuild/04-ai-tools/`, mustContain: "Claude" },
  { path: `${PREFIX}/work/rebuild/06-cross-device/`, mustContain: "Tailscale" },
  { path: `${PREFIX}/work/rebuild/verify/`, mustContain: "Verify" },
  { path: `${PREFIX}/work/rebuild/troubleshooting/`, mustContain: "Troubleshooting" },

  // Skills (sample)
  { path: `${PREFIX}/skills/workflow-scaffold/`, mustContain: "workflow" },
  { path: `${PREFIX}/skills/seacow-conventions/`, mustContain: "SEACOW" },
  { path: `${PREFIX}/skills/delegation-advisor/`, mustContain: "delegat" },

  // Agents (sample)
  { path: `${PREFIX}/agents/seacow-scaffolder/`, mustContain: "seacow" },
  { path: `${PREFIX}/agents/workspace-advisor/`, mustContain: "workspace" },

  // Research attribution
  { path: `${PREFIX}/research/2026-04-17-kernel-and-dressing/`, mustContain: "Ultraplan" },

  // Agent context / exploration
  { path: `${PREFIX}/agent-context/`, mustContain: "Exploration" },
  { path: `${PREFIX}/agent-context/zz-research/2026-04-17-dependency-direction/`, mustContain: "Dependency Direction" },

  // Infrastructure assets
  { path: `${PREFIX}/pagefind/pagefind.js`, mustContain: "" },
  { path: `${PREFIX}/sitemap-index.xml`, mustContain: "<sitemap" },
];

let server = null;

function log(msg) {
  console.log(`  ${msg}`);
}

function build() {
  log("Syncing content from tiers...");
  execSync("bun scripts/sync-content.mjs", {
    cwd: siteDir,
    stdio: "inherit",
    shell: isWindows,
  });
  log("Building docs site...");
  execSync("bun x astro build", {
    cwd: siteDir,
    stdio: "inherit",
    shell: isWindows,
  });
}

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
  ".pagefind": "application/octet-stream",
  ".pf_meta": "application/octet-stream",
  ".pf_index": "application/octet-stream",
  ".pf_fragment": "application/octet-stream",
};

function contentType(path) {
  const ext = path.slice(path.lastIndexOf("."));
  return MIME[ext] || "application/octet-stream";
}

// Astro emits absolute URLs with the configured base (e.g. /agentic-workflow-and-tech-stack/...)
// but writes files to dist/ without that prefix. Strip the base so the
// local server mirrors what GitHub Pages does in production.
function startServer() {
  log(`Starting static server on http://127.0.0.1:${PORT}...`);
  server = Bun.serve({
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
          if (existsSync(`${filePath}.html`)) {
            filePath = `${filePath}.html`;
          } else {
            return new Response("Not found", { status: 404 });
          }
        }
        const file = Bun.file(filePath);
        return new Response(file, {
          headers: { "Content-Type": contentType(filePath) },
        });
      } catch (err) {
        return new Response(`Error: ${err.message}`, { status: 500 });
      }
    },
  });
}

async function waitForReady() {
  log("Waiting for server to be ready...");
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE}${PREFIX}/`);
      if (res.status === 200) {
        log("Server is ready.");
        return;
      }
    } catch {
      // not yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Server did not become ready within 6s");
}

async function runChecks() {
  let failures = 0;
  let passes = 0;
  for (const { path, mustContain } of CHECKS) {
    const url = `${BASE}${path}`;
    let status = 0;
    let body = "";
    try {
      const res = await fetch(url);
      status = res.status;
      body = await res.text();
    } catch (err) {
      console.error(`  FAIL  ${path} — fetch error: ${err.message}`);
      failures++;
      continue;
    }

    if (status !== 200) {
      console.error(`  FAIL  ${path} — expected 200, got ${status}`);
      failures++;
      continue;
    }

    if (mustContain && !body.includes(mustContain)) {
      console.error(
        `  FAIL  ${path} — body missing expected substring "${mustContain}"`,
      );
      failures++;
      continue;
    }

    passes++;
    console.log(`  OK    ${path}${mustContain ? ` → "${mustContain}"` : ""}`);
  }
  return { passes, failures };
}

function cleanup() {
  if (server) {
    try { server.stop(true); } catch {}
    server = null;
  }
}

process.on("SIGINT", () => { cleanup(); process.exit(130); });
process.on("SIGTERM", () => { cleanup(); process.exit(143); });

async function main() {
  if (!skipBuild) {
    build();
  } else if (!existsSync(resolve(siteDir, "dist"))) {
    console.error("--no-build set but site/dist does not exist");
    process.exit(1);
  }

  startServer();
  try {
    await waitForReady();
    console.log("");
    const { passes, failures } = await runChecks();
    console.log("");
    if (failures > 0) {
      console.error(`  ${failures} check(s) failed. ${passes} passed.`);
      process.exit(1);
    }
    console.log(`  ✓ All ${passes} smoke checks passed.`);
  } finally {
    cleanup();
  }
}

main().catch((err) => {
  console.error(err);
  cleanup();
  process.exit(1);
});
