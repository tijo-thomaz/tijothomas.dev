# Project hosting contract: mini projects under tijothomas.dev/play/<slug>

Every mini project keeps its own repo and its own Vercel project (free tier, no custom domain).
Visitors only ever see `https://tijothomas.dev/...` URLs: the portfolio serves `/play/<slug>` from
the project's deployment through a Next.js multi-zone rewrite. This file is the contract each
project follows. Specs: `specs/projects.md` (PROJ-AC-01..16).

## How the portfolio side works
- **Registry:** `src/content/work.ts`. A project with a demo sets `playOriginEnv` (for example
  `'SLUICE_ORIGIN'`), plus `wasm: true` if it runs WebAssembly. Every value cites a fact row in
  `edd-docs/questions/2.0-projects-facts.md`.
- **Env var set** (Vercel → portfolio project → Settings → Environment Variables), e.g.
  `SLUICE_ORIGIN=https://sluice-xyz.vercel.app`: `/play/sluice` and `/play/sluice/*` are rewritten
  to `https://sluice-xyz.vercel.app/play/sluice/*` (`beforeFiles`, so they win over the in-site page).
- **Env var unset:** `/play/<slug>` is the in-site "Demo coming soon" page with a link to the case
  study (and the repo, once it is public). Never a broken link.
- **Bad value** (not a bare `https://<name>.vercel.app` origin): the portfolio build fails and names
  the env var. Use the project's **production** domain (Vercel → project → Domains), not a
  per-deployment URL: those sit behind Vercel's login. Env changes take effect on the next portfolio
  deployment (redeploy after setting the var).
- **No trailing slash.** The portfolio redirects `/play/<slug>/` to `/play/<slug>` (308) before any
  rewrite, so the demo's entry URL is `/play/<slug>`. Deep paths (`/play/<slug>/assets/x.js`) are
  proxied as they are.
- **Links** from the portfolio to a demo are plain `<a href="/play/<slug>">`, never `next/link`:
  client-side navigation would not leave the portfolio's app.

## The contract (every mini project)
1. **Base path `/play/<slug>/`, static Vite build.** Every route and asset lives under it, including
   a direct reload of a deep route. Next.js zones are not supported: the zone CSP below blocks the
   inline scripts Next needs.
   - `vite.config.ts`: `base: '/play/<slug>/'` and `build.outDir: 'dist/play/<slug>'`, so the files
     really sit under that path on the zone's deployment (Vercel output directory: `dist`).
   - `vercel.json` on the zone: `{ "trailingSlash": false, "rewrites": [
     { "source": "/play/<slug>", "destination": "/play/<slug>/index.html" },
     { "source": "/play/<slug>/((?!assets/).*)", "destination": "/play/<slug>/index.html" } ] }`.
     This serves the entry without a slash (no redirect loop with the portfolio) and sends every
     deep route to the SPA. Never add a redirect that appends a slash.
2. **Static or client-side only.** No server code, no secrets, no API keys, no paid APIs, no
   keep-alive jobs. Anything a visitor's browser can download is public.
3. **Same origin only.** The portfolio sends this CSP on `/play/<slug>/*`: scripts, styles, images,
   fonts, workers and connections from `'self'` only; `'wasm-unsafe-eval'` only when the registry
   item has `wasm: true`; no inline or eval script; no frames; `frame-ancestors 'none'`. Bundle
   everything; load nothing from another host (no CDN fonts or scripts).
4. **Send no CSP of your own** (or one at least as permissive): browsers enforce both policies.
5. **Header link** "← tijothomas.dev" to `https://tijothomas.dev/` and, when it exists, a link to
   the case study `/work/<slug>`.
6. **Same favicon** as the portfolio (`public/favicon.svg` from the portfolio repo, copied into the project).
7. **No analytics, cookies or trackers of your own.** Local browser storage (e.g. IndexedDB) only
   for the visitor's own data, with a "Clear" control; nothing leaves the browser.
8. **`noindex` by default.** The portfolio adds `X-Robots-Tag: noindex` on `/play/<slug>/*`. Only a
   project that ships its own title, description and canonical may set `indexPlay: true`.
9. **No invented numbers.** Any metric shown comes from the project's own eval report, with its date.

## Adding a new project (checklist)
1. Add the fact rows (P-xx) and the registry item in `src/content/work.ts` (`slug`, `playOriginEnv`,
   `wasm` if needed, `caseStudy` once `/work/<slug>` exists).
2. Deploy the project as its own Vercel project with the base path above; check
   `https://<project>.vercel.app/play/<slug>` loads, including a deep-route reload.
3. Set `<NAME>_ORIGIN=https://<project>.vercel.app` on the portfolio's Vercel project (Production
   and Preview), redeploy, then check `https://tijothomas.dev/play/<slug>` and
   `curl -I https://tijothomas.dev/play/<slug>`: it must show the portfolio's `X-Robots-Tag: noindex`
   and the zone CSP (one `Content-Security-Policy` header).
