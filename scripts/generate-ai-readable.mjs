// generate-ai-readable.mjs — Homelab AI-readable site files.
//
// Single source of truth for the site's AI-readable surface. Reads the
// public HTML (index.html, about.html) and regenerates, from it:
//   index.md, about.md, posts.md, llms.txt, llms-full.txt, ai.txt,
//   robots.txt, sitemap.xml, api/md/_catalog.json
//
// GATED POSTS: full posts under /posts/ require sign-in
// (functions/posts/_middleware.js). This generator NEVER reads a post
// file's body. posts.md lists only the titles + snippets already public
// on the homepage, with a plain note that the full post needs sign-in.
//
// Usage:
//   node scripts/generate-ai-readable.mjs          # regenerate
//   node scripts/generate-ai-readable.mjs --check  # fail if output is stale,
//                                                   # or a public page has no renderer
// No dependencies.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const SITE = {
  name: "Homelab",
  url: "https://homelab.dvaughnhouse.com",
  // NOTE: homelab.dvaughnhouse.com is the host in the WorkOS fallback in
  // functions/auth/login.js; no deploy config in this repo confirms it,
  // so treat it as the canonical URL on file, not a verified deployment.
  description:
    "Homelab is a build log by D'Vaughn House, Independent AI Orchestrator, about running AI on his own hardware — real builds, real benchmarks, no cloud bill.",
  aiSummary:
    "Homelab is D'Vaughn House's build log for running AI on his own hardware: a Mac Studio serving local models and a 2017 iMac as a 24/7 server. The homepage lists 20 builds as public snippets; full posts require sign-in.",
  updated: "2026-11-05",
};

// Lastmod per page, from file mtimes (this repo has no git history).
const PAGES = [
  {
    slug: "index",
    path: "/",
    mdPath: "/index.md",
    title: "Homelab — by D'Vaughn House",
    summary: "Run AI on your own hardware. Real builds, real benchmarks, no cloud bill.",
    updated: "2026-11-05",
    section: "Core pages",
  },
  {
    slug: "about",
    path: "/about.html",
    mdPath: "/about.md",
    title: "About — Homelab by D'Vaughn House",
    summary:
      "Homelab is a build log by D'Vaughn House, Independent AI Orchestrator, about running AI on his own hardware.",
    updated: "2026-10-21",
    section: "Core pages",
  },
  {
    slug: "posts",
    path: "/posts.md",
    mdPath: "/posts.md",
    title: "Builds — Homelab",
    summary:
      "All 20 Homelab builds, listed as public titles and snippets. Full posts require sign-in and are not included here.",
    updated: "2026-11-05",
    section: "Builds",
  },
];

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ");
}

function mdEscape(s) {
  return decodeEntities(s).trim().replace(/\s+/g, " ");
}

// --- Read the public homepage: hero + the 20 public post cards (snippets only).
const indexHtml = readFileSync(join(root, "index.html"), "utf8");
const cardRe =
  /<div class="post-card">\s*<h3><a href="([^"]+)">([^<]+)<\/a><\/h3>\s*<p>([^<]+)<\/p>/g;
const posts = [];
let m;
while ((m = cardRe.exec(indexHtml)) !== null) {
  posts.push({ href: m[1], title: mdEscape(m[2]), snippet: mdEscape(m[3]) });
}
if (posts.length !== 20) {
  throw new Error(`generate-ai-readable: expected 20 post cards on the homepage, found ${posts.length}`);
}

// --- Read the public about page article.
const aboutHtml = readFileSync(join(root, "about.html"), "utf8");
const articleMatch = aboutHtml.match(/<article class="post">([\s\S]*?)<\/article>/);
if (!articleMatch) throw new Error("generate-ai-readable: about article not found");
const aboutBody = articleMatch[1]
  .replace(/<h1>[^<]*<\/h1>/, "")
  .replace(/<p class="meta">[^<]*<\/p>/, "")
  .replace(/<p>/g, "\n\n")
  .replace(/<\/p>/g, "")
  .replace(/<strong>/g, "**")
  .replace(/<\/strong>/g, "**")
  .replace(/<em>/g, "*")
  .replace(/<\/em>/g, "*")
  .replace(/<a href="([^"]+)">([^<]+)<\/a>/g, "[$2]($1)")
  .replace(/<[^>]+>/g, "")
  .split("\n")
  .map((l) => mdEscape(l))
  .filter(Boolean)
  .join("\n\n");

function pageShell(page, body) {
  return `# ${page.title}\n\n> ${page.summary}\n\nCanonical: ${SITE.url}${page.path}\nLast updated: ${page.updated}\n\n${body}\n`;
}

function postsList() {
  return posts
    .map(
      (p) =>
        `- [${p.title}](${SITE.url}${p.href}) — ${p.snippet}`,
    )
    .join("\n");
}

const indexMd = pageShell(
  PAGES[0],
  `Run AI on *your own* hardware. Real builds, real benchmarks, no cloud bill.\n\nBy D'Vaughn House · Cincinnati, Ohio\n\n> This page shows snippets — sign in to read a full post. Full posts are not included in any markdown version of this site.\n\n## Latest builds\n\n${postsList()}\n\n## The Homelab Dispatch\n\nOne email a week: the newest builds, one benchmark, one config worth copying. No spam, no fluff. Your address is only used for this newsletter; unsubscribe anytime.\n\n## Related\n\n- [The Dispatch](https://blog.dvaughnhouse.com)\n- [Reynard's — the Den](https://den.dvaughnhouse.com)\n`,
);

const aboutMd = pageShell(PAGES[1], `${aboutBody}\n\n## Related\n\n- [Homelab](https://homelab.dvaughnhouse.com/)\n- [The Dispatch](https://blog.dvaughnhouse.com)\n`);

const postsMd = pageShell(
  PAGES[2],
  `Homelab lists ${posts.length} builds. Each entry below is the title and the snippet already shown in public on the homepage.\n\n> Full posts require sign-in and are not included in this file, in llms-full.txt, or anywhere else in the markdown version of this site.\n\n${postsList()}\n\n## Related\n\n- [Homelab](https://homelab.dvaughnhouse.com/)\n- [About](https://homelab.dvaughnhouse.com/about.html)\n`,
);

const docs = { "index.md": indexMd, "about.md": aboutMd, "posts.md": postsMd };

function llmsTxt() {
  const lines = [
    `# ${SITE.name}`,
    ``,
    `> ${SITE.description}`,
    ``,
    `Homelab is the build log of D'Vaughn House, Independent AI Orchestrator in Cincinnati, Ohio. Every post is something he actually set up, with the hardware, the software, what broke, and whether it is worth copying. No benchmark gets published unless he ran it. Full posts require sign-in; the homepage shows public snippets.`,
    ``,
    `## Core pages`,
    ...PAGES.filter((p) => p.section === "Core pages").map(
      (p) => `- [${p.title}](${SITE.url}${p.mdPath}): ${p.summary}`,
    ),
    ``,
    `## Builds`,
    `- [Builds](${SITE.url}/posts.md): all ${posts.length} Homelab builds as public titles and snippets — full posts require sign-in and are not included.`,
    ``,
    `## Machine-readable`,
    `- [Full content](${SITE.url}/llms-full.txt): every public page concatenated`,
    `- [Markdown catalog](${SITE.url}/api/md/_catalog)`,
    `- [Sitemap](${SITE.url}/sitemap.xml)`,
    `- [AI usage policy](${SITE.url}/ai.txt)`,
    ``,
    `<!-- keep in sync with robots.txt and ai.txt -->`,
    ``,
  ];
  return lines.join("\n");
}

function llmsFullTxt() {
  const parts = [
    `# ${SITE.name} - full content`,
    ``,
    `> ${SITE.description}`,
    ``,
    `Generated: ${SITE.updated}`,
    ``,
  ];
  for (const page of PAGES) {
    parts.push(`---`, ``, `<!-- source: ${SITE.url}${page.path} -->`, ``, docs[page.mdPath.slice(1)]);
  }
  return parts.join("\n");
}

function aiTxt() {
  return [
    `[identity]`,
    `name: ${SITE.name}`,
    `url: ${SITE.url}`,
    `description: ${SITE.description}`,
    `contact: ${SITE.url}`,
    ``,
    `[permissions]`,
    `allowed: summarise, quote with attribution, cite, index for search/answers`,
    ``,
    `[restrictions]`,
    `no fabricated quotes`,
    `no fake reviews/ratings`,
    `no presenting our content as the model's own`,
    `no training on user-generated private data`,
    `no reproducing full gated posts — only the public snippets on the homepage and in posts.md`,
    ``,
    `[attribution]`,
    `cite as: Homelab by D'Vaughn House, plus the canonical HTML URL`,
    ``,
    `[scope]`,
    `included: /, /about.html, /posts.md (titles and snippets only)`,
    `excluded: /posts/* (full posts require sign-in), /api/*, /auth/*`,
    ``,
    `[contact]`,
    `url: ${SITE.url}`,
    ``,
    `Last updated: ${SITE.updated}`,
    ``,
    `<!-- keep in sync with robots.txt and llms.txt -->`,
    ``,
  ].join("\n");
}

function robotsTxt() {
  return [
    `# Homelab — AI crawlers. Keep in sync with llms.txt and ai.txt.`,
    `# Full posts under /posts/ require sign-in, so they are disallowed for all crawlers.`,
    `User-agent: OAI-SearchBot`,
    `User-agent: ChatGPT-User`,
    `User-agent: Claude-SearchBot`,
    `User-agent: Claude-User`,
    `User-agent: PerplexityBot`,
    `User-agent: Perplexity-User`,
    `Allow: /`,
    `Disallow: /posts/`,
    `Disallow: /api/`,
    `Disallow: /auth/`,
    ``,
    `User-agent: *`,
    `Allow: /`,
    `Disallow: /posts/`,
    `Disallow: /api/`,
    `Disallow: /auth/`,
    ``,
    `# Training crawlers (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended,`,
    `# CCBot, Bytespider) are not named here: no decision to allow them was given.`,
    `# Blocking training does not stop citations from the search bots named above.`,
    `# See /llms.txt and /ai.txt.`,
    `Sitemap: ${SITE.url}/sitemap.xml`,
    ``,
  ].join("\n");
}

function sitemapXml() {
  const urls = PAGES.filter((p) => p.slug !== "posts")
    .map(
      (p) =>
        `  <url>\n    <loc>${SITE.url}${p.path}</loc>\n    <lastmod>${p.updated}</lastmod>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function catalogJson() {
  return JSON.stringify(
    {
      site: SITE.name,
      url: SITE.url,
      generated: SITE.updated,
      routes: PAGES.map((p) => ({
        path: p.path,
        markdown: p.mdPath,
        title: p.title,
        summary: p.summary,
        updated: p.updated,
      })),
      note: "Full posts under /posts/ require sign-in and have no markdown version; /posts.md lists public titles and snippets only.",
    },
    null,
    2,
  ) + "\n";
}

const outputs = new Map([
  ["index.md", indexMd],
  ["about.md", aboutMd],
  ["posts.md", postsMd],
  ["llms.txt", llmsTxt()],
  ["llms-full.txt", llmsFullTxt()],
  ["ai.txt", aiTxt()],
  ["robots.txt", robotsTxt()],
  ["sitemap.xml", sitemapXml()],
  [join("api", "md", "_catalog.json"), catalogJson()],
]);

const check = process.argv.includes("--check");
let stale = false;
for (const [rel, content] of outputs) {
  const abs = join(root, rel);
  if (check) {
    if (!existsSync(abs) || readFileSync(abs, "utf8") !== content) {
      console.error(`STALE: ${rel} — run: node scripts/generate-ai-readable.mjs`);
      stale = true;
    }
  } else {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
    console.log(`wrote ${rel} (${content.length} chars)`);
  }
}
if (check) {
  // A public page with no renderer fails the check.
  for (const page of PAGES) {
    if (!docs[page.mdPath.slice(1)]) {
      console.error(`MISSING RENDERER: ${page.path}`);
      stale = true;
    }
  }
  if (stale) process.exit(1);
  console.log(`OK: ${PAGES.length} pages, ${posts.length} public post snippets, llms/robots/sitemap/ai.txt in sync.`);
}
