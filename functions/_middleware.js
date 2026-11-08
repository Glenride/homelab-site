/**
 * AI-readable markdown handler (ScrollLaunch Prompt 1).
 *
 * - GET /index.md, /about.md, /posts.md -> static markdown file.
 * - GET / or /about.html with `Accept: text/markdown` (q-value higher than
 *   text/html) -> the markdown version. any Accept or no Accept -> HTML.
 * - GET /api/md/<slug> -> markdown; GET /api/md/_catalog -> JSON catalog.
 * - Unknown .md / unknown /api/md/<slug> -> markdown 404, never HTML.
 *
 * Everything else passes through untouched — in particular this never
 * touches /posts/*.html, so the sign-in gate in functions/posts/
 * _middleware.js still applies to every full post. /posts/<slug>.md
 * returns a markdown 404; there is intentionally no markdown version
 * of any gated post.
 */

const PAGES = {
  index: { asset: "/index.md", html: "/", lastmod: "2026-11-05" },
  about: { asset: "/about.md", html: "/about.html", lastmod: "2026-10-21" },
  posts: { asset: "/posts.md", html: "/posts.md", lastmod: "2026-11-05" },
};

const HTML_TO_MD = { "/": "index", "/about.html": "about", "/about": "about" };
const DESCRIBEDBY =
  '</llms.txt>; rel="describedby", </llms-full.txt>; rel="describedby", </ai.txt>; rel="describedby"';

function parseAccept(header) {
  const out = {};
  for (const part of (header || "").split(",")) {
    const [type, ...params] = part.trim().split(";");
    let q = 1;
    for (const p of params) {
      const m = p.trim().match(/^q=([0-9.]+)$/);
      if (m) q = parseFloat(m[1]);
    }
    out[type.trim().toLowerCase()] = q;
  }
  return out;
}

function mdHeaders(body, lastmod) {
  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Markdown-Tokens": String(Math.ceil(body.length / 4)),
    "X-Robots-Tag": "noindex, follow",
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    "Access-Control-Allow-Origin": "*",
  });
  if (lastmod) headers.set("Last-Modified", new Date(`${lastmod}T00:00:00Z`).toUTCString());
  return headers;
}

async function serveMd(env, request, slug) {
  const page = PAGES[slug];
  if (!page) return md404(request);
  const asset = await env.ASSETS.fetch(new URL(page.asset, request.url));
  if (!asset.ok) return md404(request);
  const body = await asset.text();
  const headers = mdHeaders(body, page.lastmod);
  headers.set("Content-Location", `https://homelab.dvaughnhouse.com${page.html}`);
  headers.set("Link", `<https://homelab.dvaughnhouse.com${page.html}>; rel="canonical"`);
  headers.set("Vary", "Accept");
  if (request.method === "HEAD") return new Response(null, { status: 200, headers });
  return new Response(body, { status: 200, headers });
}

function md404(request) {
  const body =
    "# Not found\n\n> This page does not have a markdown version.\n\n" +
    "Canonical: https://homelab.dvaughnhouse.com/\n";
  const headers = mdHeaders(body, null);
  headers.set("Content-Location", "https://homelab.dvaughnhouse.com/");
  if (request.method === "HEAD") return new Response(null, { status: 404, headers });
  return new Response(body, { status: 404, headers });
}

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Accept",
      },
    });
  }

  // .md suffix
  if (path.endsWith(".md")) {
    const slug = path.slice(1, -3) || "index";
    return serveMd(env, request, slug);
  }

  // Direct backend URL
  if (path === "/api/md/_catalog" || path === "/api/md/_catalog.json") {
    const asset = await env.ASSETS.fetch(new URL("/api/md/_catalog.json", request.url));
    const body = await asset.text();
    const headers = new Headers({
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    });
    if (request.method === "HEAD") return new Response(null, { status: 200, headers });
    return new Response(body, { status: 200, headers });
  }
  if (path.startsWith("/api/md/")) {
    const slug = path.slice("/api/md/".length);
    return serveMd(env, request, slug);
  }

  // Content negotiation — only for the two public HTML pages.
  const slug = HTML_TO_MD[path];
  if (slug) {
    const accept = parseAccept(request.headers.get("Accept"));
    const mdQ = accept["text/markdown"] ?? 0;
    const htmlQ = accept["text/html"] ?? (accept["*/*"] ?? 0);
    const wantsMd = mdQ > 0 && mdQ > htmlQ;
    // A bare `*/*` (or missing Accept) must always get HTML.
    const hasExplicitMd = "text/markdown" in accept;
    if (wantsMd && hasExplicitMd) return serveMd(env, request, slug);
    const res = await next();
    const headers = new Headers(res.headers);
    headers.append("Link", DESCRIBEDBY);
    return new Response(res.body, { status: res.status, headers });
  }

  return next();
}
