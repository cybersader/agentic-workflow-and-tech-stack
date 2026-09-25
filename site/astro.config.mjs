// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightThemeFlexoki from "starlight-theme-flexoki";
import starlightImageZoom from "starlight-image-zoom";
import starlightSiteGraph from "starlight-site-graph";
import rehypeExternalLinks from "rehype-external-links";
import rehypeRaw from "rehype-raw";
import remarkObsidianCallout from "remark-obsidian-callout";
import remarkWikiLink from "remark-wiki-link";

// Mermaid intentionally omitted for MVP — adds a playwright dependency (~150MB).
// Add later via rehype-mermaid (strategy: 'pre-mermaid') + client-side mermaid.js when
// diagrams are actually needed in content.

// https://astro.build/config
export default defineConfig({
  site: "https://cybersader.github.io",
  // Override via SITE_BASE env var (e.g. "/docs" for the Dokploy tier-3 build).
  // Default keeps the GitHub Pages public-mirror path unchanged.
  base: process.env.SITE_BASE ?? "/agentic-workflow-and-tech-stack",

  vite: {
    // starlight-site-graph's bundled deps (chroma-js, micromatch, etc.)
    // reference Node's `process` global. Without these defines, browsers
    // throw "process is not defined" and the graph component fails to
    // initialize. Pattern from cybersader/crosswalker.
    define: {
      "process.platform": '"browser"',
      "process.version": '"v0.0.0"',
      "process.env": "{}",
    },
    server: {
      // Allow access from Docker / Tailscale / LAN / cross-machine previews.
      // Vite 6+ blocks non-localhost Host headers by default.
      allowedHosts: true,
      // WSL workaround: inotify doesn't fire reliably for files on /mnt/c/.
      // Polling is slower but actually detects edits. If you move this repo
      // to Linux-native (/home/... instead of /mnt/c/...), remove `watch`.
      watch: { usePolling: true, interval: 300 },
    },
  },

  markdown: {
    // Allow raw HTML in .md files (inline <div style="...">, etc.)
    // rehype-raw is what actually turns raw-html nodes into real HTML nodes
    // so downstream rehype plugins can see and transform them.
    remarkRehype: { allowDangerousHtml: true },
    remarkPlugins: [
      remarkObsidianCallout,
      [remarkWikiLink, { aliasDivider: "|" }],
    ],
    rehypePlugins: [
      rehypeRaw,
      [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
    ],
  },

  integrations: [
    starlight({
      title: "02 — Agentic Workflow & Tech Stack",
      description:
        "A portable progressive-disclosure scaffold and agent-memory system for filesystem-based AI agent workflows. Rebuild your dev machine from a git clone.",
      logo: {
        src: "./src/assets/logo.svg",
        alt: "Agentic Workflow",
        replacesTitle: true,
      },
      favicon: "/favicon.svg",
      lastUpdated: true,

      editLink: {
        baseUrl:
          "https://github.com/cybersader/agentic-workflow-and-tech-stack/edit/main/",
      },

      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/cybersader/agentic-workflow-and-tech-stack",
        },
      ],

      components: {
        PageTitle: "./src/components/PageTitle.astro",
      },

      head: [
        {
          // starlight-site-graph bug workaround: the <graph-component>
          // element gets `data-slug="path/without/trailing/slash"`, but
          // the sitemap.json keys all end with `/`. Result: the graph's
          // sitemap lookup for the current page fails → empty graph.
          //
          // Backlinks on the same page work because the backlinks panel
          // uses the correctly slash-terminated slug.
          //
          // This script normalizes the graph's data-slug BEFORE the
          // graph script reads it on DOMContentLoaded.
          tag: "script",
          content: [
            "document.addEventListener('DOMContentLoaded', () => {",
            "  for (const c of document.querySelectorAll('graph-component[data-slug]')) {",
            "    const slug = c.getAttribute('data-slug');",
            "    if (slug && !slug.endsWith('/')) c.setAttribute('data-slug', slug + '/');",
            "  }",
            "});",
          ].join("\n"),
        },
        {
          // remark-obsidian-callout only emits data-expandable / data-expanded
          // attributes on collapsible callouts; it doesn't add interaction.
          // This script toggles data-expanded when the callout title is clicked,
          // which the CSS in global.css turns into the visual collapse/expand.
          tag: "script",
          content: [
            "document.addEventListener('DOMContentLoaded', () => {",
            "  document.querySelectorAll('[data-expandable=\"true\"]').forEach((cb) => {",
            "    const title = cb.querySelector('.callout-title');",
            "    if (!title) return;",
            "    title.addEventListener('click', () => {",
            "      const expanded = cb.getAttribute('data-expanded') === 'true';",
            "      cb.setAttribute('data-expanded', expanded ? 'false' : 'true');",
            "    });",
            "  });",
            "});",
          ].join("\n"),
        },
      ],

      plugins: [
        starlightThemeFlexoki(),
        starlightImageZoom(),
        starlightSiteGraph(),
        // starlight-tags intentionally omitted — needs tags.yml config; add in Phase 7
      ],

      customCss: ["./src/styles/global.css", "./src/styles/brand.css"],

      sidebar: [
        {
          label: "Start here",
          autogenerate: { directory: "start" },
        },
        {
          label: "Principles & Foundations",
          autogenerate: { directory: "principles" },
        },
        {
          label: "Patterns",
          autogenerate: { directory: "patterns" },
          collapsed: true,
        },
        {
          label: "Tech Stack",
          autogenerate: { directory: "stack" },
          collapsed: true,
        },
        {
          label: "My Work",
          autogenerate: { directory: "work" },
          collapsed: true,
        },
        {
          label: "Kernel Reference",
          autogenerate: { directory: "kernel" },
          collapsed: true,
        },
        {
          label: "Skills",
          autogenerate: { directory: "skills" },
          collapsed: true,
        },
        {
          label: "Agents",
          autogenerate: { directory: "agents" },
          collapsed: true,
        },
        {
          label: "Research Attribution",
          autogenerate: { directory: "research" },
          collapsed: true,
        },
        {
          label: "Agent Context & Exploration",
          autogenerate: { directory: "agent-context" },
          collapsed: true,
        },
      ],
    }),
  ],
});
