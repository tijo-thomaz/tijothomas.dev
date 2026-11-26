# Projects platform
Status: Approved (owner, 2026-11-26: "Approve, start")
Prefix: PROJ
Traces: `docs/ai/PLATFORM_PROMPT.md` (owner brief, 2026-11-26); facts P-01..P-12 in `edd-docs/questions/2.0-projects-facts.md`

Every project value comes from a P-xx or F-xx row the owner answered. `/play/<slug>` is served from the project's own deployment through a rewrite; the visitor's URL stays on tijothomas.dev.

## Acceptance criteria
- **PROJ-AC-01** — Given the work registry, when validated, then every `slug` is unique and matches `/^[a-z0-9]+(-[a-z0-9]+)*$/`. _Traces: P-01 · Verify: unit_
- **PROJ-AC-02** — Given a registry item with `playOriginEnv`, when validated, then the name matches `/^[A-Z][A-Z0-9_]*_ORIGIN$/`, and a set value that is not an `https://` origin with no path, query or hash makes the config throw. _Traces: P-08 · Verify: unit_
- **PROJ-AC-03** — Given `SLUICE_ORIGIN` is unset, when `rewrites()` runs, then it returns 0 rules whose source starts with `/play/sluice`. _Traces: P-08 · Verify: unit_
- **PROJ-AC-04** — Given `SLUICE_ORIGIN=https://sluice-example.vercel.app`, when `rewrites()` runs, then `beforeFiles` holds exactly `/play/sluice` → `https://sluice-example.vercel.app/play/sluice` and `/play/sluice/:path*` → `https://sluice-example.vercel.app/play/sluice/:path*`. _Traces: P-08 · Verify: unit_
- **PROJ-AC-05** — Given `SLUICE_ORIGIN` is unset, when `/play/sluice` is requested, then it returns 200 with one `h1`, the text "Demo coming soon" and a link to `/work/sluice`; a repo link appears only when `repoUrl` is set. _Traces: P-07, P-08 · Verify: e2e_
- **PROJ-AC-06** — Given any request to `/work/promptshield`, when served, then the response is 308 with `Location: /work/sluice`. _Traces: P-02 · Verify: e2e_
- **PROJ-AC-07** — Given the registry, when `/projects` renders, then each visible item is one card with its name, status badge and summary; "Play" shows only when the item's origin is set, and "Case study" only when `caseStudy` is true. _Traces: P-09 · Verify: unit_
- **PROJ-AC-08** — Given the Sluice case study with no eval report, when `/work/sluice` renders, then it has the sections Problem, Why it matters, Architecture, Evaluation and Trade-offs, and the Evaluation section reads "Evaluation in progress" and contains no `%` and no table. _Traces: P-10, P-11 · Verify: unit_
- **PROJ-AC-09** — Given the case study's source links, when validated, then each is `https://`, cites a P-xx row, and renders with `rel` containing `noopener` and `noreferrer`. _Traces: P-12, SEC-11 · Verify: unit_
- **PROJ-AC-10** — Given a work card on `/`, when it renders, then "Case study" links to `/work/<slug>` only when `caseStudy` is true, and "Play" links to `/play/<slug>` only when the origin is set. _Traces: P-09, F-71 (superseded by P-09) · Verify: unit_
- **PROJ-AC-11** — Given the headers config, when `/play/sluice` and `/play/sluice/x` are matched, then the effective headers include `X-Robots-Tag: noindex`, unless the item sets `indexPlay: true`. _Traces: P-08 · Verify: unit_
- **PROJ-AC-12** — Given the headers config, when `/play/<slug>/*` is matched, then its CSP allows only `'self'` sources, and `script-src` contains `'wasm-unsafe-eval'` only for an item with `wasm: true`; no site route gets `'wasm-unsafe-eval'`. _Traces: P-08, ADR-P1 · Verify: unit_
- **PROJ-AC-13** — Given the Sluice registry item, when its card or case study renders, then the name reads "Sluice", "formerly PromptShield" is shown, and no metric row renders while `metric` is null. _Traces: P-01, P-02, P-03 · Verify: unit_
- **PROJ-AC-14** — Given a production build, when `/projects`, `/work/sluice` and the `/play/sluice` fallback are checked, then each is prerendered static, imports no `"use client"` module, and loads no script from another host. _Traces: HOME-AC-03 · Verify: gate_
- **PROJ-AC-15** — Given `next start`, when Lighthouse mobile runs 3 times on `/projects` and `/work/sluice`, then each median category is ≥ 95, CLS ≤ 0.05, LCP ≤ 2.5 s and TBT ≤ 150 ms. _Traces: SEO-AC-10 · Verify: gate_
- **PROJ-AC-16** — Given `/projects` (title and `h1` "Projects") and `/work/sluice`, when rendered, then each has a unique `<title>`, a meta description, a canonical URL and is indexable; `sitemap.xml` lists both and no `/play/` URL. _Traces: SEO-AC-01, SEO-AC-05 · Verify: unit_
