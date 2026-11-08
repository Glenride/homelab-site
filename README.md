# Homelab

Build log by D'Vaughn House: running AI on his own hardware. Real builds,
real benchmarks, no cloud bill.

- Live (on file, not confirmed by a deploy config in this repo):
  https://homelab.dvaughnhouse.com
- Static HTML (`index.html`, `about.html`, `posts/*.html`) + Cloudflare
  Pages Functions (`functions/`). No build step.

## Sign-in gate

Every full post under `/posts/` requires sign-in
(`functions/posts/_middleware.js`, WorkOS, `hb_session` cookie). The
homepage stays public with snippets. The markdown / AI-readable surface
respects the same line: it exposes only the homepage snippets and the
About page, never a full gated post.

## AI-readable site (ScrollLaunch Prompt 1)

Regenerate after editing `index.html` or `about.html`:

```bash
node scripts/generate-ai-readable.mjs          # regenerate
node scripts/generate-ai-readable.mjs --check  # fail if output is stale
```

The generator reads only the two public pages and writes `index.md`,
`about.md`, `posts.md` (titles + public snippets only), `llms.txt`,
`llms-full.txt`, `ai.txt`, `robots.txt`, `sitemap.xml`, and
`api/md/_catalog.json`. `functions/_middleware.js` serves `.md` suffixes,
`Accept: text/markdown` negotiation (q-value aware; `*/*` or no Accept
always gets HTML), and `/api/md/<slug>` / `/api/md/_catalog`.

Adding a public page = one entry in `PAGES` in
`scripts/generate-ai-readable.mjs` (+ one entry in
`functions/_middleware.js`). A gated post never gets a markdown version:
`/posts/<slug>.md` returns a markdown 404.
