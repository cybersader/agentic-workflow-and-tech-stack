#!/usr/bin/env bun
/**
 * Preflight: cross-platform binary-stub resolver.
 *
 * When switching between WSL (Linux) and Windows PowerShell without reinstalling,
 * `bun install` leaves behind platform-specific binary stubs (shell scripts on
 * Linux, `.cmd`/`.ps1` on Windows). The `astro` binary then appears "missing"
 * to the opposite platform.
 *
 * Logic:
 * 1. Detect current process.platform (linux vs win32)
 * 2. Check if node_modules/.platform marker matches current platform
 * 3. Check if astro binary exists for the current platform
 * 4. If missing/mismatched, run bun install to regenerate binaries
 * 5. Write platform marker
 *
 * Adapted from cyberbaser/docs/scripts/preflight.mjs.
 */

import { existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_ROOT = join(__dirname, "..");

const platform = process.platform;
const markerPath = join(SITE_ROOT, "node_modules/.platform");
const astroBin = platform === "win32"
  ? join(SITE_ROOT, "node_modules/.bin/astro.cmd")
  : join(SITE_ROOT, "node_modules/.bin/astro");

function isAstroUsable() {
  if (!existsSync(astroBin)) return false;
  if (platform !== "win32") {
    // On Linux, verify it's a script (not a Windows stub)
    try {
      const first = readFileSync(astroBin, "utf8").slice(0, 80);
      if (first.includes("@echo off") || first.includes("SETLOCAL")) return false;
    } catch {
      return false;
    }
  }
  return true;
}

function markerMatches() {
  if (!existsSync(markerPath)) return false;
  try {
    return readFileSync(markerPath, "utf8").trim() === platform;
  } catch {
    return false;
  }
}

function needsReinstall() {
  if (!existsSync(join(SITE_ROOT, "node_modules"))) return true;
  if (!markerMatches()) return true;
  if (!isAstroUsable()) return true;
  return false;
}

function writeMarker() {
  try {
    writeFileSync(markerPath, platform);
  } catch {
    // Non-fatal — just means the next preflight will check again
  }
}

if (needsReinstall()) {
  console.log(`[preflight] Platform changed or astro stub missing → running bun install (${platform})`);
  try {
    execSync("bun install", { cwd: SITE_ROOT, stdio: "inherit" });
    writeMarker();
    console.log("[preflight] Install complete.");
  } catch (err) {
    console.error("[preflight] bun install failed:", err.message);
    process.exit(1);
  }
} else {
  // Happy path — cached
  // console.log(`[preflight] ✓ ${platform} binaries present.`);
}
