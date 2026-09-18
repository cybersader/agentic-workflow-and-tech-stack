#!/usr/bin/env bun
/**
 * check-frontmatter.mjs — fast schema-violation guard
 *
 * Validates `status:` and `stratum:` frontmatter fields across all
 * candidate-publishing markdown files in the repo against the enum
 * declared in `site/src/content.config.ts`. Exits non-zero on any
 * violation so a pre-commit hook (or CI) can block the commit.
 *
 * Why this exists: Astro Content Collections halt on the first
 * schema-mismatched file at build time, which means a single bad
 * `status: foo` crashes the entire site build and an unrelated
 * sidebar section silently disappears. Catching it pre-commit costs
 * <2s; catching it after deploy is a confusing rendering bug.
 *
 * Usage:
 *   bun scripts/check-frontmatter.mjs           (from site/)
 *   bun run check                               (via package.json)
 *
 * Exit codes:
 *   0 — clean
 *   1 — schema violation found (details on stderr)
 *   2 — internal error (e.g., schema couldn't be parsed)
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_ROOT = join(__dirname, "..");
const REPO_ROOT = join(SITE_ROOT, "..");

// Source dirs that get synced into the site OR shipped via the agentic
// extractor. Validating at the source side means errors surface before
// the sync runs and before extract-public.sh runs — earliest possible
// catch.
const SCAN_DIRS = [
  "01-kernel",
  "02-stack",
  "03-work",
  "research",
  "examples",
  "knowledge-base",
];

// Files at the repo root that may have frontmatter (rare, but covered).
const SCAN_ROOT_FILES = [
  "README.md",
  "ROADMAP.md",
  "CLAUDE.md",
  "AGENTS.md",
  "CONTRIBUTING.md",
];

const SKIP_PATH_PARTS = new Set([
  "node_modules",
  ".git",
  "target",
  "dist",
  ".astro",
  "site",  // synced from elsewhere; validate the SOURCES, not the mirror
]);

// ─────────────────────────────────────────────────────────────────
// Schema extraction — read content.config.ts and pull the enums.
// Keeps this script honest with whatever the schema currently says,
// rather than hardcoding a separate copy that can drift.
// ─────────────────────────────────────────────────────────────────

async function loadSchemaEnums() {
  const path = join(SITE_ROOT, "src/content.config.ts");
  const src = await readFile(path, "utf8");

  // Find the status enum. Tolerates multi-line `z.enum([...])`.
  const statusMatch = src.match(
    /status:\s*z\.enum\(\[([\s\S]*?)\]\)\.optional\(\)/
  );
  if (!statusMatch) throw new Error("could not find status enum in content.config.ts");
  const statusValues = [...statusMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

  // Stratum is z.literal(1)..z.literal(5) OR z.enum(["1".."5"]).
  // Both shapes accept the digits 1-5 — keep as a fixed set.
  const stratumValues = ["1", "2", "3", "4", "5", 1, 2, 3, 4, 5];

  if (statusValues.length === 0) throw new Error("status enum is empty");
  return { status: new Set(statusValues), stratum: new Set(stratumValues) };
}

// ─────────────────────────────────────────────────────────────────
// Frontmatter parsing — minimal YAML reader for the fields we care about.
// ─────────────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  // Match leading `---\n…\n---\n`. Tolerant of CRLF.
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return null;
  const body = m[1];
  const fields = {};
  for (const line of body.split(/\r?\n/)) {
    const fm = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (!fm) continue;
    let [, key, value] = fm;
    value = value.trim();
    // Strip surrounding quotes for simple scalars.
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    fields[key] = value;
  }
  return fields;
}

// ─────────────────────────────────────────────────────────────────
// Walker — yields every .md/.mdx file under the scan roots.
// ─────────────────────────────────────────────────────────────────

async function* walk(root) {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP_PATH_PARTS.has(e.name)) continue;
    const path = join(root, e.name);
    if (e.isDirectory()) yield* walk(path);
    else if (e.isFile() && /\.(md|mdx)$/.test(e.name)) yield path;
  }
}

// ─────────────────────────────────────────────────────────────────
// Main check loop.
// ─────────────────────────────────────────────────────────────────

async function main() {
  let enums;
  try {
    enums = await loadSchemaEnums();
  } catch (err) {
    console.error(`✗ schema load failed: ${err.message}`);
    process.exit(2);
  }

  const errors = [];
  let checked = 0;

  const targets = [];
  for (const sub of SCAN_DIRS) {
    const root = join(REPO_ROOT, sub);
    try { await stat(root); } catch { continue; }
    for await (const p of walk(root)) targets.push(p);
  }
  for (const f of SCAN_ROOT_FILES) {
    const p = join(REPO_ROOT, f);
    try { await stat(p); targets.push(p); } catch {}
  }

  for (const file of targets) {
    let content;
    try { content = await readFile(file, "utf8"); }
    catch { continue; }
    const fm = parseFrontmatter(content);
    if (!fm) continue;
    checked++;

    const rel = relative(REPO_ROOT, file);

    if ("status" in fm && !enums.status.has(fm.status)) {
      errors.push(`  ${rel}: status: "${fm.status}" — must be one of: ${[...enums.status].join(", ")}`);
    }
    if ("stratum" in fm) {
      // YAML may give us a string or a number; both fine if in set.
      const v = fm.stratum;
      if (!enums.stratum.has(v) && !enums.stratum.has(Number(v))) {
        errors.push(`  ${rel}: stratum: "${v}" — must be 1, 2, 3, 4, or 5`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`✗ ${errors.length} frontmatter violation(s) (checked ${checked} files):`);
    for (const e of errors) console.error(e);
    console.error("");
    console.error(`Schema lives at site/src/content.config.ts`);
    console.error(`Fix the offending files (or extend the schema if a new value is genuinely needed).`);
    process.exit(1);
  }

  console.log(`✓ frontmatter clean (${checked} files checked)`);
}

main().catch((err) => {
  console.error(`✗ check-frontmatter crashed: ${err.message}`);
  process.exit(2);
});
