# U-09 SEO: test plan (EDD stage 2.1)

- **Date:** 2026-11-25 · **Branch:** `redesign-home` · **Base:** `152b495` (`base.txt`). The diff also covers the modern-web-guidance pass commits (`5b49883` … `9f81337`), so this unit's gate run is their gate run too. · **Unit:** `edd-docs/inception/units/U-09-seo.md`
- **ACs (10):** SEO-AC-01, 02, 04, 05, 06, 07, 08, 10, 11 · PLAT-AC-23. All are removed from `specs/pending.txt` (18 → 8).

## Traceability
| AC | Test file | What the tests check | Level |
|---|---|---|---|
| SEO-AC-01 | `src/app/(site)/seo.test.tsx`, `e2e/seo.spec.ts` | Title equals `profile.seo.title` and is under 60 characters. Description equals `profile.seo.description` and is 70–160 characters. Canonical is `<siteUrl>/`. OG has images and url `<siteUrl>/`. Twitter card is `summary_large_image` with images and no creator. In the built page: a canonical link, a meta description, `og:image` pointing at `/opengraph-image`, and the twitter card. | unit, e2e |
| SEO-AC-02 | `e2e/seo.spec.ts` | `/opengraph-image` returns 200 as `image/png`, and its IHDR chunk says 1200×630. | e2e |
| SEO-AC-04 | `src/app/sitemap.test.ts`, e2e | The sitemap holds `<siteUrl>/`. It has no `/terminal`, `/v2`, `/work/` or `/writing/` placeholders, only absolute URLs on the site origin, each once, and no invented `lastModified`. `/sitemap.xml` is served. | unit, e2e |
| SEO-AC-05 | `src/app/sitemap.test.ts`, e2e | robots allows `*` on `/`, and its sitemap is `<siteUrl>/sitemap.xml`. `/robots.txt` is served. | unit, e2e |
| SEO-AC-06 | `src/lib/json-ld.test.ts`, `seo.test.tsx` | `serializeJsonLd` escapes every `<` and the output still round-trips. `JsonLd` renders one `ld+json` script. The Person has `@context`, name, jobTitle, url, `knowsAbout` from `profile.ts`, and `sameAs` = LinkedIn and GitHub only. `/` has exactly one JSON-LD block, which contains no `<`. | unit |
| SEO-AC-07 | `src/app/(site)/placeholders.test.tsx`, e2e | `generateStaticParams` returns only the placeholder slug from content, and `dynamicParams = false`. The placeholder pages are noindex (follow), with their own canonical, one `h1` from content and a link home. The placeholder items are not `planned`. In e2e: both placeholders return 200 with robots noindex, and unknown slugs return 404, including the planned `/work/fde-mcp-gateway`. | unit, e2e |
| SEO-AC-08 | `json-ld.test.ts`, `placeholders.test.tsx` | `TechArticle` with headline, description, url and a Person author. There is no `datePublished` (dates are not invented). The placeholder post page renders it. | unit |
| SEO-AC-10 | `scripts/seo-gates.test.mjs`, `gates.test.mjs` | The lighthouse gate is enforced with `--runs 3`, and the script has the budgets 95, 0.05, 2500 and 150. No gate is report-only any more. | gate |
| SEO-AC-11 | `json-ld.test.ts`, `seo.test.tsx` | Neither the Person nor the metadata has an email, telephone, contactPoint or creator key, and no string value in either contains `@`. | unit |
| PLAT-AC-23 | `scripts/seo-gates.test.mjs` | `react/no-danger` is an error, and the only override that switches it off is for `src/lib/json-ld.ts`. Outside the terminal, `dangerouslySetInnerHTML` appears only in that file. | gate |

## Also covered
- **Favicon:** the `(site)` layout's `metadata.icons` declares `/favicon.svg` (U-03 review finding, carried in the U-09 DoD).

## Red run
- 4 vitest files fail because their modules are missing, or `metadata` is not exported yet.
- 3 node tests fail: a report-only gate still exists, the JSON-LD helper is missing, and Lighthouse is not enforced.
