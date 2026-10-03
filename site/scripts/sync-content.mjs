#!/usr/bin/env bun
/**
 * Sync Content — copy-on-build for the Starlight site.
 *
 * Reads from the three tier folders (01-kernel/, 02-stack/, 03-work/) and
 * copies markdown into site/src/content/docs/ with appropriate frontmatter
 * normalization.
 *
 * Design goals:
 *   - Cross-platform (no symlinks)
 *   - Deterministic (same inputs → same outputs)
 *   - Non-destructive to source (never writes back into tier folders)
 *   - Frontmatter-aware (adds title/description/stratum where missing)
 *   - Reports wikilink issues (targets that don't resolve)
 *
 * Usage:
 *   bun scripts/sync-content.mjs            → full sync
 *   bun scripts/sync-content.mjs --dry-run  → print plan, don't write
 */

import { readdir, readFile, writeFile, stat, mkdir, rm } from "node:fs/promises";
import { join, relative, dirname, basename, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SITE_ROOT = join(__dirname, "..");
const REPO_ROOT = join(SITE_ROOT, "..");
const DOCS_OUT = join(SITE_ROOT, "src/content/docs");

const DRY_RUN = process.argv.includes("--dry-run");

// ───────────────────────────────────────────────────────────────────────────
// Sync rules — (source glob pattern → target directory under DOCS_OUT)
// ───────────────────────────────────────────────────────────────────────────

const SYNC_RULES = [
  // Philosophy → Start section
  { from: "01-kernel/PHILOSOPHY.md", to: "start/philosophy.md" },

  // Principles pages — 10 + index
  { from: "01-kernel/principles/", to: "principles/", recursive: true },

  // Patterns (currently empty but scaffold directory — ready for Phase 2/4 content)
  { from: "01-kernel/patterns/", to: "patterns/", recursive: true, optional: true },

  // Kernel reference
  { from: "01-kernel/README.md", to: "kernel/index.md" },
  { from: "01-kernel/ARCHITECTURE.md", to: "kernel/architecture.md" },
  { from: "01-kernel/PHILOSOPHICAL-ALIGNMENT.md", to: "start/philosophical-alignment.md" },

  // Root ROADMAP — surfaced under /kernel/roadmap/ (and remapped from /ROADMAP/)
  { from: "ROADMAP.md", to: "kernel/roadmap.md", optional: true },

  // Stack — index + all layer folders + patterns + decisions
  { from: "02-stack/README.md", to: "stack/index.md" },
  { from: "02-stack/01-ai-coding/", to: "stack/01-ai-coding/", recursive: true, optional: true },
  { from: "02-stack/02-terminal/", to: "stack/02-terminal/", recursive: true, optional: true },
  { from: "02-stack/03-cross-device/", to: "stack/03-cross-device/", recursive: true, optional: true },
  { from: "02-stack/04-knowledge-mgmt/", to: "stack/04-knowledge-mgmt/", recursive: true, optional: true },
  { from: "02-stack/05-homelab/", to: "stack/05-homelab/", recursive: true, optional: true },
  { from: "02-stack/06-dev-infra/", to: "stack/06-dev-infra/", recursive: true, optional: true },
  { from: "02-stack/07-editor-ext/", to: "stack/07-editor-ext/", recursive: true, optional: true },
  { from: "02-stack/patterns/", to: "stack/patterns/", recursive: true, optional: true },
  { from: "02-stack/decisions/", to: "stack/decisions/", recursive: true, optional: true },
  { from: "02-stack/profiles/", to: "stack/profiles/", recursive: true, optional: true },

  // Work — index + project-types + memory + rebuild + homelab + references
  { from: "03-work/README.md", to: "work/index.md" },
  { from: "03-work/project-types/", to: "work/project-types/", recursive: true, optional: true },
  { from: "03-work/memory/", to: "work/memory/", recursive: true, optional: true },
  { from: "03-work/rebuild/", to: "work/rebuild/", recursive: true, optional: true },
  { from: "03-work/homelab/", to: "work/homelab/", recursive: true, optional: true },
  { from: "03-work/references/", to: "work/references/", recursive: true, optional: true },

  // Agent context / research section — modeled on cyberbaser + crosswalker
  { from: "03-work/agent-context/", to: "agent-context/", recursive: true, optional: true },

  // Research attribution — also surfaced at top-level "research" sidebar for prominence
  { from: "03-work/memory/research/", to: "research/", recursive: true, optional: true },

  // Skills (one file each from subdirectory/SKILL.md)
  { from: "01-kernel/skills/", to: "skills/", skillTransform: true, optional: true },

  // Agents
  { from: "01-kernel/agents/", to: "agents/", recursive: true, optional: true },
];

// Files to skip within recursive walks
const SKIP_FILES = new Set([".DS_Store", ".gitkeep"]);

// ───────────────────────────────────────────────────────────────────────────
// Link normalization
// ───────────────────────────────────────────────────────────────────────────

// starlight-site-graph parses raw markdown and resolves link paths relative
// to the site root rather than the current page. Starlight's own renderer
// resolves them relative to the current page. That mismatch means links
// like `[x](02-temperature-gradient.md)` render correctly in the browser
// but appear as disconnected in the graph.
//
// Fix: during sync, convert relative `.md` links into **site-absolute**
// paths based on where the file is being synced to. Starlight still
// handles them fine (absolute paths work); the graph plugin now resolves
// them to the correct slug.
//
// Source files remain Obsidian-compatible (relative `.md` links work in
// Obsidian). Synced copies have resolved absolute paths.

// Match any markdown link `[text](path)` - we'll filter inside the callback.
// Captures: pre=`](`, path, post=`)` (with optional `#anchor` inside path).
const ANY_LINK_RX = /(\]\()([^)\s]+?)(\))/g;
// Override via SITE_BASE env var (e.g. "/docs" for Dokploy build). Default
// keeps the GitHub Pages public-mirror path. Mirrors the astro.config.mjs
// `base` resolution so internal markdown links match the actual site URLs.
const SITE_BASE = process.env.SITE_BASE ?? "/agentic-workflow-and-tech-stack";

// Source-tier → site-route remapping rules. Mirrors the sync rules so that
// cross-tier links resolve to the same URL Starlight produces.
// Longer prefixes must come first (greedy match).
const TIER_REMAP = [
  // Tier 1 — special files promoted to top-level or sub-section (exact slugs)
  { from: /^01-kernel\/PHILOSOPHY$/, to: "start/philosophy" },
  { from: /^01-kernel\/PHILOSOPHICAL-ALIGNMENT$/, to: "start/philosophical-alignment" },
  { from: /^01-kernel\/ARCHITECTURE$/, to: "kernel/architecture" },
  { from: /^01-kernel\/README$/, to: "kernel" },
  { from: /^01-kernel\/principles$/, to: "principles" },
  { from: /^01-kernel\/patterns$/, to: "patterns" },
  { from: /^01-kernel\/skills$/, to: "skills" },
  { from: /^01-kernel\/agents$/, to: "agents" },
  { from: /^01-kernel\/tutorials$/, to: "tutorials" },
  { from: /^01-kernel\/commands$/, to: "commands" },
  // Tier 1 — subpath prefixes
  { from: /^01-kernel\/principles\//, to: "principles/" },
  { from: /^01-kernel\/patterns\//, to: "patterns/" },
  { from: /^01-kernel\/skills\/([^/]+)\/SKILL$/, to: "skills/$1" },
  { from: /^01-kernel\/skills\/([^/]+)$/, to: "skills/$1" },
  { from: /^01-kernel\/skills\//, to: "skills/" },
  { from: /^01-kernel\/agents\//, to: "agents/" },
  { from: /^01-kernel\/tutorials\//, to: "tutorials/" },
  { from: /^01-kernel\/commands\//, to: "commands/" },
  { from: /^01-kernel$/, to: "kernel" }, // bare tier
  { from: /^01-kernel\//, to: "kernel/" },

  // Tier 2
  { from: /^02-stack\/README$/, to: "stack" },
  { from: /^02-stack$/, to: "stack" }, // bare tier
  { from: /^02-stack\//, to: "stack/" },

  // Tier 3
  { from: /^03-work\/README$/, to: "work" },
  { from: /^03-work\/memory\/research\//, to: "research/" },
  { from: /^03-work\/memory\//, to: "work/memory/" },
  { from: /^03-work\/rebuild\//, to: "work/rebuild/" },
  { from: /^03-work\/homelab\//, to: "work/homelab/" },
  { from: /^03-work\/project-types\//, to: "work/project-types/" },
  { from: /^03-work\/references\//, to: "work/references/" },
  // agent-context is PROMOTED to top-level (matches SYNC_RULES above)
  { from: /^03-work\/agent-context\/?$/, to: "agent-context" },
  { from: /^03-work\/agent-context\//, to: "agent-context/" },
  { from: /^03-work$/, to: "work" }, // bare tier
  { from: /^03-work\//, to: "work/" },

  // Root files
  { from: /^ROADMAP$/, to: "kernel/roadmap" },
  { from: /^roadmap$/, to: "kernel/roadmap" },
  { from: /^README$/, to: "" }, // root readme → site index (handled upstream, not broken-link-worthy)

  // ─── Post-tier-strip remaps ──────────────────────────────────────────
  // If a link resolves to `kernel/principles/...` it means relative
  // resolution happened within the kernel synced folder — but principles
  // are PROMOTED to top-level in Starlight routes. Same for patterns,
  // skills, agents, etc.
  { from: /^kernel\/PHILOSOPHY$/, to: "start/philosophy" },
  { from: /^kernel\/philosophy$/, to: "start/philosophy" },
  { from: /^kernel\/README$/, to: "kernel" },
  { from: /^kernel\/index$/, to: "kernel" },
  { from: /^kernel\/principles\/index$/, to: "principles" },
  { from: /^kernel\/principles$/, to: "principles" },
  { from: /^kernel\/principles\//, to: "principles/" },
  { from: /^kernel\/patterns$/, to: "patterns" },
  { from: /^kernel\/patterns\//, to: "patterns/" },
  { from: /^kernel\/skills$/, to: "skills" },
  { from: /^kernel\/skills\/([^/]+)\/SKILL$/, to: "skills/$1" },
  { from: /^kernel\/skills\//, to: "skills/" },
  { from: /^kernel\/agents$/, to: "agents" },
  { from: /^kernel\/agents\//, to: "agents/" },
  { from: /^kernel\/tutorials$/, to: "tutorials" },
  { from: /^kernel\/tutorials\//, to: "tutorials/" },
  { from: /^kernel\/templates\//, to: "patterns/" }, // templates not published — best effort

  // Fix the `work/agent-context/...` case that can occur if another pass
  // already relocated `03-work/` → `work/` before specific agent-context rule fired.
  { from: /^work\/agent-context\/?$/, to: "agent-context" },
  { from: /^work\/agent-context\//, to: "agent-context/" },

  // Strip trailing `/index` segment — when source links `foo/bar/index.md`,
  // Starlight collapses that to `foo/bar/`. Without this rule the link
  // becomes `foo/bar/index/` which 404s.
  { from: /\/index$/, to: "" },
];

function applyTierRemap(slug) {
  // First: strip trailing `/index` — applies regardless of which tier rule matches.
  // Starlight collapses `foo/bar/index.md` to `/foo/bar/`, not `/foo/bar/index/`.
  let result = slug.replace(/\/index$/, "");

  for (const rule of TIER_REMAP) {
    if (rule.from.test(result)) {
      result = result.replace(rule.from, rule.to);
      break;
    }
  }
  // Run index-strip again in case the remap re-introduced one (e.g. via subdirectory rewrite).
  result = result.replace(/\/index$/, "");
  return result;
}

/**
 * Resolve a link's `.md` path to a site-absolute Starlight-slug URL.
 *
 * @param {string} body        - markdown body content
 * @param {string} targetRel   - the target file path relative to DOCS_OUT (e.g. "principles/01-capture-work-output.md")
 */
function normalizeMdLinks(body, targetRel) {
  // Directory containing the synced file, relative to DOCS_OUT
  const targetDir = dirname(targetRel).split(sep).join("/");

  return body.replace(ANY_LINK_RX, (match, pre, rawPath, post) => {
    // Separate anchor
    const [pathOnly, ...anchorParts] = rawPath.split("#");
    const anchor = anchorParts.length ? `#${anchorParts.join("#")}` : "";
    let path = pathOnly;

    // Skip obvious non-targets
    if (!path) return match;
    if (/^(https?:|ftp:|mailto:|tel:|data:)/.test(path)) return match;
    if (path.startsWith("#")) return match; // already pure anchor

    // Skip if already site-absolute (starts with `/` and already has base)
    if (path.startsWith("/")) {
      // Strip `.md` extension if present — Starlight and graph both prefer
      // trailing-slash URLs without `.md`
      const cleaned = path.replace(/\.md$/, "");
      return `${pre}${cleaned}${anchor ? anchor : ""}${post}`;
    }

    // Skip non-navigational file references (shell scripts, images, etc.)
    // Only markdown + bare paths should be treated as navigation.
    if (/\.(sh|mjs|js|ts|tsx|astro|svg|png|jpg|jpeg|gif|webp|css|json|yaml|yml|toml|kdl)$/i.test(path)) {
      return match;
    }

    // Strip trailing `.md` if present
    path = path.replace(/\.md$/, "");

    // Strip trailing slash for uniform parts-joining
    const hadTrailingSlash = path.endsWith("/");
    if (hadTrailingSlash) path = path.slice(0, -1);

    // Relative path. Resolve against the synced file's directory.
    // Drop leading "./" if present.
    let rel = path.replace(/^\.\//, "");

    // Resolve `../` segments against the target directory.
    const parts = (targetDir === "." ? [] : targetDir.split("/"));
    for (const seg of rel.split("/")) {
      if (seg === "..") parts.pop();
      else if (seg === "" || seg === ".") continue;
      else parts.push(seg);
    }

    const resolvedSlug = parts.join("/");
    if (!resolvedSlug) return match;

    // Apply tier → site-route remapping.
    const remapped = applyTierRemap(resolvedSlug);

    const absolute = `${SITE_BASE}/${remapped}/`.replace(/\/+/g, "/");
    return `${pre}${absolute}${anchor}${post}`;
  });
}

// ───────────────────────────────────────────────────────────────────────────
// Wikilink tracking
// ───────────────────────────────────────────────────────────────────────────

const wikilinkIssues = [];
const WIKILINK_RX = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;

// ───────────────────────────────────────────────────────────────────────────
// Frontmatter handling
// ───────────────────────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  if (!content.startsWith("---\n")) return { data: {}, body: content, hadFrontmatter: false };
  const end = content.indexOf("\n---\n", 4);
  if (end === -1) return { data: {}, body: content, hadFrontmatter: false };
  const raw = content.slice(4, end);
  const body = content.slice(end + 5);
  const data = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (m) {
      let [, key, val] = m;
      val = val.trim();
      // Strip simple quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  }
  return { data, body, hadFrontmatter: true, raw };
}

function serializeFrontmatter(data, body, rawFrontmatter) {
  // If we have original raw frontmatter and only added fields, preserve original + add missing
  if (rawFrontmatter) {
    const lines = rawFrontmatter.split("\n").filter(Boolean);
    const keysPresent = new Set(lines.map(l => l.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):/)?.[1]).filter(Boolean));
    const additions = [];
    for (const [k, v] of Object.entries(data)) {
      if (!keysPresent.has(k) && v != null) {
        additions.push(`${k}: ${formatYamlValue(v)}`);
      }
    }
    const finalLines = [...lines, ...additions];
    return `---\n${finalLines.join("\n")}\n---\n${body}`;
  }
  // No existing frontmatter — build fresh
  const lines = Object.entries(data).filter(([, v]) => v != null).map(([k, v]) => `${k}: ${formatYamlValue(v)}`);
  return `---\n${lines.join("\n")}\n---\n${body}`;
}

function formatYamlValue(v) {
  if (typeof v === "string" && (v.includes(":") || v.includes("#") || v.includes("[") || v.includes("&"))) {
    return `"${v.replace(/"/g, '\\"')}"`;
  }
  return String(v);
}

function extractTitleFromBody(body) {
  const m = body.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : null;
}

function extractDescriptionFromBody(body) {
  // Skip H1, find first real paragraph
  const withoutH1 = body.replace(/^#\s+.+$/m, "").trim();
  const firstPara = withoutH1.split(/\n\s*\n/)[0]?.trim();
  if (!firstPara) return null;
  // Strip markdown emphasis, links
  const clean = firstPara
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\n/g, " ")
    .trim();
  // First sentence, max 200 chars
  const firstSentence = clean.split(/\.(?:\s|$)/)[0];
  return (firstSentence.length > 200 ? firstSentence.slice(0, 197) + "..." : firstSentence);
}

function normalizeFrontmatter(data, body, sourcePath) {
  const out = { ...data };

  // Ensure title
  if (!out.title) {
    out.title = extractTitleFromBody(body) || basename(sourcePath, ".md");
  }

  // Ensure description
  if (!out.description) {
    const desc = extractDescriptionFromBody(body);
    if (desc) out.description = desc;
  }

  // Ensure status
  if (!out.status) {
    out.status = "research";
  }

  // Infer stratum from path if missing
  if (!out.stratum) {
    if (sourcePath.includes("principles/") || sourcePath === "01-kernel/PHILOSOPHY.md" || sourcePath.endsWith("ARCHITECTURE.md")) {
      out.stratum = "1";
    } else if (sourcePath.includes("patterns/") || sourcePath.includes("/skills/") || sourcePath.includes("/agents/")) {
      out.stratum = "2";
    } else if (sourcePath.includes("templates/")) {
      out.stratum = "3";
    } else if (sourcePath.includes("scripts/")) {
      out.stratum = "4";
    } else if (sourcePath.startsWith("03-work/")) {
      out.stratum = "5";
    }
  }

  return out;
}

// ───────────────────────────────────────────────────────────────────────────
// Wikilink scanning
// ───────────────────────────────────────────────────────────────────────────

function scanWikilinks(content, sourcePath) {
  let m;
  while ((m = WIKILINK_RX.exec(content)) !== null) {
    const target = m[1].trim();
    wikilinkIssues.push({ source: sourcePath, target, raw: m[0] });
  }
}

// ───────────────────────────────────────────────────────────────────────────
// File operations
// ───────────────────────────────────────────────────────────────────────────

async function pathExists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function walkDir(dir, visitor) {
  if (!(await pathExists(dir))) return;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (SKIP_FILES.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(full, visitor);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      await visitor(full);
    }
  }
}

async function processFile(sourceAbs, targetAbs, sourceRelRepo) {
  const content = await readFile(sourceAbs, "utf8");
  scanWikilinks(content, sourceRelRepo);

  const { data, body, raw } = parseFrontmatter(content);
  const normalized = normalizeFrontmatter(data, body, sourceRelRepo);
  // Resolve relative `.md` links to site-absolute paths so
  // starlight-site-graph links up correctly. See normalizeMdLinks.
  const targetRel = relative(DOCS_OUT, targetAbs).split(sep).join("/");
  const transformedBody = normalizeMdLinks(body, targetRel);
  const output = serializeFrontmatter(normalized, transformedBody, raw);

  if (DRY_RUN) {
    console.log(`  [dry-run] ${sourceRelRepo} → ${relative(SITE_ROOT, targetAbs)}`);
    return { source: sourceRelRepo, target: relative(SITE_ROOT, targetAbs), addedFields: Object.keys(normalized).filter(k => !data[k]) };
  }

  await mkdir(dirname(targetAbs), { recursive: true });
  await writeFile(targetAbs, output);
  return { source: sourceRelRepo, target: relative(SITE_ROOT, targetAbs), addedFields: Object.keys(normalized).filter(k => !data[k]) };
}

// ───────────────────────────────────────────────────────────────────────────
// Main sync loop
// ───────────────────────────────────────────────────────────────────────────

async function syncRule(rule) {
  const sourceAbs = join(REPO_ROOT, rule.from);
  const targetRoot = join(DOCS_OUT, rule.to);

  if (!(await pathExists(sourceAbs))) {
    if (rule.optional) return [];
    console.warn(`[sync] WARNING: required source missing: ${rule.from}`);
    return [];
  }

  const sourceStat = await stat(sourceAbs);

  // Single file mapping
  if (sourceStat.isFile()) {
    return [await processFile(sourceAbs, targetRoot, rule.from)];
  }

  // Directory mapping
  const results = [];

  if (rule.skillTransform) {
    // Skills live at <name>/SKILL.md — flatten to <name>.md under target.
    // Also copy top-level files (README.md → index.md, index.md, etc.)
    // so the skills/ section can have an overview page.
    const entries = await readdir(sourceAbs, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillFile = join(sourceAbs, entry.name, "SKILL.md");
        if (await pathExists(skillFile)) {
          const targetFile = join(targetRoot, `${entry.name}.md`);
          const sourceRel = relative(REPO_ROOT, skillFile);
          results.push(await processFile(skillFile, targetFile, sourceRel));
        }
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const sourceFile = join(sourceAbs, entry.name);
        // README.md → index.md (so it becomes the section's index route)
        const targetName = /^README\.md$/i.test(entry.name) ? "index.md" : entry.name;
        const targetFile = join(targetRoot, targetName);
        const sourceRel = relative(REPO_ROOT, sourceFile);
        results.push(await processFile(sourceFile, targetFile, sourceRel));
      }
    }
    return results;
  }

  // Recursive directory walk — preserve structure
  await walkDir(sourceAbs, async (sourceFile) => {
    const relFromSource = relative(sourceAbs, sourceFile);
    // Rename README.md → index.md so the file becomes the directory's
    // index route in Starlight (otherwise it renders at /.../readme/).
    const renamedRel = relFromSource.replace(/(^|[\/\\])README\.md$/i, "$1index.md");
    const targetFile = join(targetRoot, renamedRel);
    const sourceRel = relative(REPO_ROOT, sourceFile);
    results.push(await processFile(sourceFile, targetFile, sourceRel));
  });

  return results;
}

async function main() {
  console.log(`[sync] ${DRY_RUN ? "DRY RUN — " : ""}Starting content sync...\n`);

  if (!DRY_RUN) {
    // Clean output directories the sync manages (but not the hand-authored root index.mdx)
    const managedDirs = ["start", "principles", "patterns", "stack", "work", "kernel", "skills", "agents", "research"];
    for (const d of managedDirs) {
      const p = join(DOCS_OUT, d);
      if (await pathExists(p)) {
        await rm(p, { recursive: true, force: true });
      }
    }
  }

  const allResults = [];
  for (const rule of SYNC_RULES) {
    const ruleResults = await syncRule(rule);
    allResults.push(...ruleResults);
  }

  // Report
  console.log(`\n[sync] ✓ Synced ${allResults.length} files.`);

  const addedCounts = {};
  for (const r of allResults) {
    for (const f of r.addedFields) {
      addedCounts[f] = (addedCounts[f] || 0) + 1;
    }
  }
  if (Object.keys(addedCounts).length > 0) {
    console.log(`[sync]   Frontmatter auto-added: ${Object.entries(addedCounts).map(([k, v]) => `${k}×${v}`).join(", ")}`);
  }

  // Write wikilink report
  if (wikilinkIssues.length > 0) {
    const reportPath = join(__dirname, "wikilink-issues.md");
    const lines = [
      "# Wikilink Resolution Report",
      "",
      `Generated: ${new Date().toISOString()}`,
      `Total wikilinks found: ${wikilinkIssues.length}`,
      "",
      "| Source | Target | Raw |",
      "|---|---|---|",
      ...wikilinkIssues.slice(0, 200).map(w => `| \`${w.source}\` | \`${w.target}\` | \`${w.raw.replace(/\|/g, "\\|")}\` |`),
    ];
    if (!DRY_RUN) await writeFile(reportPath, lines.join("\n"));
    console.log(`[sync]   ${wikilinkIssues.length} wikilinks detected (report: scripts/wikilink-issues.md)`);
  }

  // Write sync report
  const reportPath = join(__dirname, "sync-report.md");
  const reportLines = [
    "# Content Sync Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${DRY_RUN ? "dry-run" : "write"}`,
    `Files synced: ${allResults.length}`,
    "",
    "## Files",
    "",
    "| Source | Target | Added frontmatter |",
    "|---|---|---|",
    ...allResults.map(r => `| \`${r.source}\` | \`${r.target}\` | ${r.addedFields.length > 0 ? r.addedFields.join(", ") : "—"} |`),
  ];
  if (!DRY_RUN) await writeFile(reportPath, reportLines.join("\n"));

  console.log(`[sync] Report: scripts/sync-report.md`);
}

main().catch((err) => {
  console.error("[sync] Error:", err);
  process.exit(1);
});
