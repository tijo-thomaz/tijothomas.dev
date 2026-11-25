# SEO and crawlability
Status: Approved (PG1 2026-11-23; amended after PG3 2026-11-23; amended 2026-11-24: `src/` layout)
Prefix: SEO
Traces: FR-050–FR-057, FR-068, NFR-001–NFR-003, NFR-010, NFR-020, NFR-022, NFR-040; US-16–US-20; SEC-09, SEC-23

## Acceptance criteria
- **SEO-AC-01** — Given the exported `metadata` for `/`, when inspected, then `title.length < 60`, `description.length` is 70–160, `alternates.canonical` is `<siteUrl>/`, OG images are set, `twitter.card === 'summary_large_image'`, and `twitter.creator` is undefined. _Traces: FR-050, US-16 · Verify: unit_
- **SEO-AC-02** — Given `GET /opengraph-image`, when requested, then the response is 200, `image/png`, 1200×630. _Traces: FR-051, US-16 · Verify: e2e_
- **SEO-AC-03** — Given the site layout `viewport`, when inspected, then `maximumScale` is undefined and `userScalable` is not `false`. _Traces: FR-057, NFR-018, US-16 · Verify: unit_
- **SEO-AC-04** — Given `sitemap()`, when called, then it contains `<siteUrl>/` and every published post or case-study URL, and no `/terminal`, `/v2` or `noindex` placeholder. _Traces: FR-052, US-17 · Verify: unit_
- **SEO-AC-05** — Given `robots()`, when called, then it allows `*` and `sitemap` is `<siteUrl>/sitemap.xml`. _Traces: FR-053, US-17 · Verify: unit_
- **SEO-AC-06** — Given `/`, when its `application/ld+json` is parsed, then it is a `Person` with `name`, `jobTitle`, `url`, `sameAs` (only confirmed, non-empty URLs) and `knowsAbout` from `profile.ts`, and any `<` in the data is serialised as the JSON unicode escape for U+003C (backslash, `u`, `003c`), so the raw HTML has no `<` inside the block (wording fixed 2026-11-25: the escape had been lost in an earlier edit). _Traces: FR-054, US-18 · Verify: unit_
- **SEO-AC-07** — Given the placeholder slug of `/work/[slug]` and `/writing/[slug]`, when requested, then 200 with robots `noindex`. Given an unknown slug, then 404. _Traces: FR-056, US-19 · Verify: e2e_
- **SEO-AC-08** — Given the `/writing/<placeholder>` page, when its JSON-LD is parsed, then `@type` is `TechArticle` with `headline` and `author.@type === 'Person'`. _Traces: FR-055, US-19 · Verify: unit_
- **SEO-AC-09** — Given `next start` and `curl /` with no JS, when compared with `src/content/*.ts`, then 100% of the strings rendered on `/` (respecting `SHOW_PLANNED`) are present in the HTML. The gate names any missing string. _Traces: NFR-020, FR-068, US-20 · Verify: gate_
- **SEO-AC-10** — Given `next start`, when Lighthouse mobile runs 3 times on `/`, then the median Performance, Accessibility, Best Practices and SEO are each ≥ 95, CLS ≤ 0.05, LCP ≤ 2.5 s and TBT ≤ 150 ms. _Traces: NFR-001–NFR-003, NFR-010, NFR-022, NFR-040, FR-068, US-20 · Verify: gate_
- **SEO-AC-11** — Given the `Person` JSON-LD and the exported `metadata` of `/`, when inspected, then neither has an `email`, `telephone` or `contactPoint` property, and no string value contains `@`. _Traces: SEC-23, FR-054, US-18 · Verify: unit_
