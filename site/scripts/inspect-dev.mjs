#!/usr/bin/env bun
/**
 * Lightweight Playwright inspector pointed at the RUNNING dev server.
 *
 * Unlike visual.mjs (which serves dist/), this assumes `bun run serve` is
 * already running on localhost:4321 and just drives Chromium against it.
 *
 * Usage:
 *   bun scripts/inspect-dev.mjs                               # /principles/07-five-strata/
 *   bun scripts/inspect-dev.mjs /stack/02-terminal/stack/
 *
 * Reports:
 *   - HTTP status
 *   - h1 count + text
 *   - stratum/status/date badges (element tag, href if <a>, text)
 *   - Obsidian callouts (<details> = collapsible, <aside> = static)
 *   - console errors from the page
 */

import { chromium } from "playwright";

const PATH = process.argv[2] || "/principles/07-five-strata/";
const BASE_URL = "http://localhost:4321/agentic-workflow-and-tech-stack";
const url = `${BASE_URL}${PATH}`;

console.log(`Target: ${url}\n`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

const consoleLogs = [];
const pageErrors = [];
page.on("console", (msg) => consoleLogs.push({ type: msg.type(), text: msg.text() }));
page.on("pageerror", (err) => pageErrors.push(err.message));

const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });

const report = await page.evaluate(() => {
  const h1s = Array.from(document.querySelectorAll("h1")).map((el) => ({
    id: el.id,
    text: el.textContent?.trim().slice(0, 80),
  }));

  const stratumBadge = document.querySelector(".stratum-badge");
  const badge = stratumBadge
    ? {
        tag: stratumBadge.tagName.toLowerCase(),
        href: stratumBadge.getAttribute("href"),
        class: stratumBadge.className,
        text: stratumBadge.textContent?.trim(),
      }
    : null;

  const statusBadge = document.querySelector(".status-badge");
  const dateBadge = document.querySelector(".date-badge");

  // remark-obsidian-callout renders as <blockquote data-callout="..." data-expandable data-expanded>
  // The content paragraphs are direct children (no .callout-content wrapper).
  const callouts = Array.from(document.querySelectorAll("blockquote[data-callout]")).map((el) => {
    const pEl = el.querySelector(":scope > p");
    const pStyle = pEl ? getComputedStyle(pEl) : null;
    return {
      type: el.getAttribute("data-callout"),
      expandable: el.getAttribute("data-expandable"),
      expanded: el.getAttribute("data-expanded"),
      title: el.querySelector(".callout-title")?.textContent?.trim().slice(0, 80),
      firstParagraphDisplay: pStyle?.display,
      firstParagraphVisible: pStyle ? pStyle.display !== "none" : null,
      directChildrenCount: el.children.length,
      directChildrenTags: Array.from(el.children).map((c) => c.tagName + (c.className ? "." + c.className.split(" ")[0] : "")),
    };
  });
  const strataCards = Array.from(document.querySelectorAll(".strata-card")).map((el) => ({
    level: el.querySelector(".strata-level")?.textContent?.trim(),
    name: el.querySelector(".strata-name")?.textContent?.trim(),
    href: el.getAttribute("href"),
  }));

  return {
    h1Count: h1s.length,
    h1s,
    badge,
    hasStatusBadge: !!statusBadge,
    hasDateBadge: !!dateBadge,
    callouts,
    strataCards,
  };
});

console.log(`HTTP: ${response?.status()}`);
console.log(`h1 count: ${report.h1Count}`);
console.log(`h1 texts:`, report.h1s);
console.log(`\nStratum badge:`, report.badge);
console.log(`Status badge present: ${report.hasStatusBadge}`);
console.log(`Date badge present:   ${report.hasDateBadge}`);
console.log(`\nCallouts: ${report.callouts.length}`);
report.callouts.forEach((c, i) => {
  console.log(`  ${i + 1}. [${c.type}] expandable=${c.expandable} expanded=${c.expanded}`);
  console.log(`      title: "${c.title}"`);
  console.log(`      direct children: ${c.directChildrenCount} → ${c.directChildrenTags.join(", ")}`);
  console.log(`      first <p> display: ${c.firstParagraphDisplay} → visible=${c.firstParagraphVisible}`);
});
console.log(`\nStrata diagram cards: ${report.strataCards.length}`);
report.strataCards.forEach((c) => console.log(`  ${c.level} · ${c.name} → ${c.href}`));

// Simulate clicking the callout title + re-check
if (report.callouts.length > 0) {
  console.log(`\n-- Simulating click on callout title --`);
  await page.click("blockquote[data-callout] .callout-title");
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => {
    const el = document.querySelector("blockquote[data-callout]");
    const p = el?.querySelector(":scope > p");
    const pStyle = p ? getComputedStyle(p) : null;
    return {
      expanded: el?.getAttribute("data-expanded"),
      firstPDisplay: pStyle?.display,
    };
  });
  console.log(`After click: expanded=${after.expanded}, first <p> display=${after.firstPDisplay}`);
}

if (pageErrors.length) {
  console.log(`\n⚠ Page errors (${pageErrors.length}):`);
  pageErrors.forEach((e) => console.log(`  - ${e}`));
}
const errorLogs = consoleLogs.filter((l) => l.type === "error");
if (errorLogs.length) {
  console.log(`\n⚠ Console errors (${errorLogs.length}):`);
  errorLogs.slice(0, 10).forEach((l) => console.log(`  - ${l.text}`));
}

await browser.close();
