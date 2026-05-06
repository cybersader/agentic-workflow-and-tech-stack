#!/usr/bin/env bun
// Rewrites the hardcoded GitHub Pages base path in synced markdown to whatever
// SITE_BASE is set to. Idempotent — no-op when SITE_BASE matches the default.
//
// Why: index.mdx, kernel roadmap, and a handful of synced docs hardcode the
// GitHub Pages URL prefix `/agentic-workflow-and-tech-stack/` in markdown body
// content. Astro's `base` config doesn't rewrite raw URLs in markdown bodies,
// only in framework-generated links (CSS, asset, nav). For non-default bases
// (e.g. /docs for the Dokploy build) those raw URLs 404. This script closes
// that gap.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const HARDCODED = "/agentic-workflow-and-tech-stack";
const TARGET = process.env.SITE_BASE ?? HARDCODED;

if (TARGET === HARDCODED) {
  console.log("[rewrite-base] SITE_BASE matches default — no-op");
  process.exit(0);
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) yield* walk(p);
    else if (/\.(md|mdx)$/i.test(ent.name)) yield p;
  }
}

let count = 0;
const root = "src/content/docs";
for await (const path of walk(root)) {
  const content = await readFile(path, "utf-8");
  if (content.includes(HARDCODED)) {
    await writeFile(path, content.replaceAll(HARDCODED, TARGET));
    count++;
  }
}

console.log(`[rewrite-base] Rewrote ${count} files: ${HARDCODED} -> ${TARGET}`);
