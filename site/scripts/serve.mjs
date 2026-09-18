#!/usr/bin/env bun
/**
 * agentic-workflow docs serve — interactive menu for local docs preview + sharing.
 *
 *   bun run serve                 — interactive menu
 *   bun run serve dev             — Astro dev server with HMR (localhost)
 *   bun run serve preview         — build docs + serve dist (localhost)
 *   bun run serve build           — docs build only → site/dist
 *   bun run serve tailscale       — build + static serve + share via Tailscale
 *   bun run serve dev-share       — Astro dev (HMR) + tier-file watcher + Tailscale share
 *                                   (live updates reflect on phone browser via tailnet)
 *
 * Pattern adapted from cybersader/portagenty's docs/scripts/serve.mjs.
 * Cloudflare public-tunnel option intentionally omitted — repo stays private
 * until PII audit clears. Tailscale = tailnet only.
 */

import { spawn, execSync } from "node:child_process";
import { existsSync, rmSync, statSync, watch } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, "..");
const distDir = resolve(siteDir, "dist");
const repoRoot = resolve(siteDir, "..");

const DOCS_PORT = 4321;
const PREFIX = "/agentic-workflow-and-tech-stack";
const isWindows = process.platform === "win32";

let staticServer = null;

const mode = process.argv[2] || "interactive";
const children = [];

function log(msg) {
  console.log(`  ${msg}`);
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", timeout: 30000, shell: true })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

function hasCmd(name) {
  return isWindows
    ? !!run(`where ${name} 2>nul`)
    : !!run(`which ${name} 2>/dev/null`);
}

// Rollup ships its native binary as a per-platform optional dep. If
// site/node_modules was installed on a different OS (e.g. WSL → Windows),
// the wrong binary is present and astro dev crashes with
// "Cannot find module @rollup/rollup-<platform>". Detect and force a clean
// reinstall when that happens.
function rollupNativePkg() {
  const { platform, arch } = process;
  if (platform === "win32" && arch === "x64")
    return "@rollup/rollup-win32-x64-msvc";
  if (platform === "win32" && arch === "arm64")
    return "@rollup/rollup-win32-arm64-msvc";
  if (platform === "linux" && arch === "x64")
    return "@rollup/rollup-linux-x64-gnu";
  if (platform === "linux" && arch === "arm64")
    return "@rollup/rollup-linux-arm64-gnu";
  if (platform === "darwin" && arch === "x64") return "@rollup/rollup-darwin-x64";
  if (platform === "darwin" && arch === "arm64")
    return "@rollup/rollup-darwin-arm64";
  return null;
}

function ensureSiteDeps() {
  const nodeModules = resolve(siteDir, "node_modules");
  let needsInstall = false;
  let needsNuke = false;

  if (!existsSync(nodeModules)) {
    needsInstall = true;
  } else {
    const expectedRollup = rollupNativePkg();
    if (expectedRollup && !existsSync(resolve(nodeModules, expectedRollup))) {
      log(
        `site/node_modules is missing ${expectedRollup} — likely installed on a different OS.`,
      );
      needsNuke = true;
      needsInstall = true;
    }
  }

  if (needsNuke) {
    log("Removing stale site/node_modules...");
    rmSync(nodeModules, { recursive: true, force: true });
    const lock = resolve(siteDir, "bun.lock");
    if (existsSync(lock)) {
      log("Removing site/bun.lock...");
      rmSync(lock, { force: true });
    }
  }

  if (needsInstall) {
    log("Installing site/ dependencies (bun install)...");
    execSync("bun install", { cwd: siteDir, stdio: "inherit", shell: true });
    log("site dependencies installed.");
  }
}

function runSync() {
  // The sync script pulls from 01-kernel/, 02-stack/, 03-work/ into
  // site/src/content/docs/. Must run before any dev/build.
  log("Syncing content from tiers → site/src/content/docs/...");
  execSync("bun scripts/sync-content.mjs", {
    cwd: siteDir,
    stdio: "inherit",
    shell: true,
  });
}

function getTailscale() {
  if (hasCmd("tailscale")) return "tailscale";
  if (hasCmd("tailscale.exe")) return "tailscale.exe";
  return null;
}

function track(child) {
  children.push(child);
  return child;
}

function cleanup() {
  for (const c of children) {
    try { c.kill(); } catch {}
  }
  if (staticServer) {
    try { staticServer.stop(true); } catch {}
    staticServer = null;
  }
  const ts = getTailscale();
  // `reset` is the modern (1.50+) verb to tear down all serves; the older
  // `serve off` was deprecated and errors with "handler does not exist"
  // when nothing is currently being served.
  if (ts) run(`${ts} serve reset 2>/dev/null`);
}

// MIME / static-server pair shared by tailscale share mode.
// Bun.serve is reliable on WSL where astro preview can be silent.
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
function contentType(p) {
  return MIME[p.slice(p.lastIndexOf("."))] || "application/octet-stream";
}

function startStaticServer(port) {
  log(`Starting static server (Bun.serve) on http://127.0.0.1:${port}...`);
  staticServer = Bun.serve({
    hostname: "127.0.0.1",
    port,
    fetch(req) {
      const url = new URL(req.url);
      let pathname = decodeURIComponent(url.pathname);
      // Strip the configured Astro base so local paths mirror what GitHub
      // Pages does in production (Astro emits absolute URLs with the base
      // prefix, but writes files to dist/ without it).
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
        return new Response(Bun.file(filePath), {
          headers: { "Content-Type": contentType(filePath) },
        });
      } catch (err) {
        return new Response(`Error: ${err.message}`, { status: 500 });
      }
    },
  });
  log(`Static server ready.`);
}

process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanup();
  process.exit(0);
});

async function prompt() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ts = getTailscale();

  console.log("\n  ━━━ agentic-workflow docs serve ━━━\n");
  console.log(`  1) Dev server (HMR)         http://localhost:${DOCS_PORT}${PREFIX}/`);
  console.log(`  2) Preview built site       http://localhost:${DOCS_PORT}${PREFIX}/`);
  console.log(`  3) Build only               → site/dist`);
  console.log(
    `  4) Share built via Tailscale       ${ts ? "static, tailnet only" : "(not installed)"}`,
  );
  console.log(
    `  5) Share dev via Tailscale (live)  ${ts ? "HMR + tier watcher — edits show up on phone" : "(not installed)"}\n`,
  );

  return new Promise((res) => {
    rl.question("  Choose [1-5, default 1]: ", (a) => {
      rl.close();
      const map = {
        1: "dev",
        2: "preview",
        3: "build",
        4: "tailscale",
        5: "dev-share",
      };
      res(map[a.trim()] || "dev");
    });
  });
}

// Watch tier folders; when a markdown file changes, re-run the sync script.
// Astro dev server watches site/src/content/docs/ and HMR fires automatically
// after sync writes into it.
function startTierWatcher() {
  const tierDirs = [
    join(repoRoot, "01-kernel"),
    join(repoRoot, "02-stack"),
    join(repoRoot, "03-work"),
  ];
  let pending = false;
  let debounceTimer = null;

  const resync = () => {
    if (pending) return;
    pending = true;
    try {
      execSync("bun scripts/sync-content.mjs", {
        cwd: siteDir,
        stdio: "inherit",
        shell: true,
      });
    } catch (err) {
      log(`Sync failed: ${err.message}`);
    } finally {
      pending = false;
    }
  };

  for (const dir of tierDirs) {
    if (!existsSync(dir)) continue;
    log(`Watching ${dir.replace(repoRoot + "/", "")} for changes...`);
    try {
      // Recursive watch works on Darwin + Windows + recent Linux kernels via
      // inotify. Bun / Node both support it. If a platform doesn't, the
      // watcher just reports nothing — not fatal.
      watch(dir, { recursive: true }, (eventType, filename) => {
        if (!filename) return;
        if (!filename.endsWith(".md")) return;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          log(`Tier change: ${filename} → re-syncing...`);
          resync();
        }, 300);
      });
    } catch (err) {
      log(`Watch failed on ${dir}: ${err.message}`);
    }
  }
}

function startDev() {
  ensureSiteDeps();
  runSync();
  log("Starting Astro dev server (HMR, --host 0.0.0.0)...");
  const child = track(
    spawn(
      "bun",
      [
        "x",
        "astro",
        "dev",
        "--host",
        "0.0.0.0",
        "--port",
        String(DOCS_PORT),
      ],
      { cwd: siteDir, stdio: "inherit", shell: isWindows },
    ),
  );
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n  Dev server exited with code ${code}`);
      cleanup();
      process.exit(code);
    }
  });
  return child;
}

function startPreview() {
  ensureSiteDeps();
  runSync();
  log("Building docs site...");
  const build = spawn("bun", ["x", "astro", "build"], {
    cwd: siteDir,
    stdio: "inherit",
    shell: isWindows,
  });
  return new Promise((res, rej) => {
    build.on("exit", (code) => {
      if (code !== 0) return rej(new Error(`build failed (exit ${code})`));
      log("Starting preview server (--host 0.0.0.0)...");
      track(
        spawn(
          "bun",
          [
            "x",
            "astro",
            "preview",
            "--host",
            "0.0.0.0",
            "--port",
            String(DOCS_PORT),
          ],
          { cwd: siteDir, stdio: "inherit", shell: isWindows },
        ),
      );
      res();
    });
  });
}

function runBuild() {
  ensureSiteDeps();
  runSync();
  log("Building docs site → site/dist...");
  return new Promise((res, rej) => {
    const p = spawn("bun", ["x", "astro", "build"], {
      cwd: siteDir,
      stdio: "inherit",
      shell: isWindows,
    });
    p.on("exit", (code) => {
      if (code !== 0) return rej(new Error(`build failed (exit ${code})`));
      log("Build complete.");
      res();
    });
  });
}

async function waitForLocalReady(port, timeoutMs) {
  const url = `http://127.0.0.1:${port}${PREFIX}/`;
  const deadline = Date.now() + timeoutMs;
  log(`Waiting for server at ${url}...`);
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (res.status >= 200 && res.status < 500) {
        log(`Server is ready (HTTP ${res.status}).`);
        return;
      }
    } catch {
      // not yet
    }
    await sleep(300);
  }
  log(`WARNING: server didn't respond within ${timeoutMs}ms; continuing anyway.`);
}

async function tailscaleServe(port) {
  const ts = getTailscale();
  if (!ts) {
    log("Tailscale not found. Install it from https://tailscale.com.");
    return;
  }
  // Tear down any existing serve handlers, then daemonize a new one. `--bg`
  // runs serve in the background without holding the foreground.
  run(`${ts} serve reset 2>/dev/null`);
  run(`${ts} serve --bg ${port}`);
  await sleep(1500);
  const status = run(`${ts} serve status 2>/dev/null`);
  const url = status.match(/(https:\/\/[^\s]+\.ts\.net)/)?.[1];
  const ip = run(`${ts} ip -4 2>/dev/null`);
  console.log("");
  if (url) log(`Tailnet HTTPS: ${url}${PREFIX}/`);
  if (ip) log(`Tailnet HTTP:  http://${ip}:${port}${PREFIX}/`);
  if (!url && !ip) log(`http://localhost:${port}${PREFIX}/`);
  log(`Stop sharing: tailscale serve reset`);
}

async function main() {
  const chosen = mode === "interactive" ? await prompt() : mode;

  switch (chosen) {
    case "dev":
      startDev();
      break;
    case "preview":
      await startPreview();
      break;
    case "build":
      await runBuild();
      process.exit(0);
    case "tailscale":
      // Build the site fresh, then serve dist via Bun.serve, then expose via
      // tailscale serve. Bun.serve is reliable where `astro preview` can be
      // silent on WSL + Astro 6.
      await runBuild();
      startStaticServer(DOCS_PORT);
      await waitForLocalReady(DOCS_PORT, 10_000);
      await tailscaleServe(DOCS_PORT);
      log("Press Ctrl+C to stop sharing.");
      await new Promise(() => {});
      break;

    case "dev-share":
      // Astro dev server (HMR) + tier-file watcher + Tailscale share.
      // Edits to 01-kernel/, 02-stack/, 03-work/ trigger re-sync;
      // Astro's file watcher picks up the synced copies and HMR fires.
      // Tailscale proxies HTTP + WebSocket so HMR works over the tailnet.
      ensureSiteDeps();
      runSync();
      startTierWatcher();
      log("Starting Astro dev server (HMR, --host 0.0.0.0)...");
      track(
        spawn(
          "bun",
          [
            "x",
            "astro",
            "dev",
            "--host",
            "0.0.0.0",
            "--port",
            String(DOCS_PORT),
          ],
          { cwd: siteDir, stdio: "inherit", shell: isWindows },
        ),
      );
      await waitForLocalReady(DOCS_PORT, 15_000);
      await tailscaleServe(DOCS_PORT);
      log("Live-updating across the tailnet. Edit any tier file — phone updates via HMR.");
      log("Press Ctrl+C to stop.");
      await new Promise(() => {});
      break;

    default:
      console.error(`Unknown mode: ${chosen}`);
      console.error(
        "Use one of: dev, preview, build, tailscale, dev-share (or no arg for menu)",
      );
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  cleanup();
  process.exit(1);
});
