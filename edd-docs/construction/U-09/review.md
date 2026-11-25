# U-09 SEO (with the MWG pass, the #top fix and F-35): review (EDD stage 2.3)

- **Date:** 2026-11-25 · **Reviewer:** independent principal-engineer review (not the author) · **Range:** `152b495..c231ae9` (7 commits, 35 files, +792/-54). Line numbers below are at `c231ae9`.
- **Precondition NOT met:** `edd-docs/construction/U-09/gates.md` does not exist. The in-flight gate run in the worktree `%TEMP%\tijo-wt-u09` (at `c231ae9`) is **red**:
  - **CG5_coverage FAIL:** diff branches are 66.7 % (22/33), below the 70 % floor.
  - **e2e: 2 failures in `seo.spec.ts`,** both from that worktree's `test-results/.last-run.json`.
  - **Everything else passes.** The other 22 gates PASS, including lighthouse: median perf 99, a11y 100, BP 96, SEO 100, CLS 0, LCP 917 ms, TBT 122 ms.
  - **How I used it:** I read that run's artefacts and its `.next` build output (read only; I built and ran nothing) as evidence for the findings below.
- **Moving tree:** during the review, commit `4eb03c8` (F-35 content) and uncommitted edits appeared in the main checkout. Neither is reviewed here. The edits are to `page.tsx`, `sitemap.ts`, `seo.spec.ts`, the tests and a new `src/lib/sitemap-urls.ts`. They appear to address #1, #2 and part of #3; see the Status column.
- **Verdict: CHANGES REQUESTED.** 1 blocker, 2 major, 6 minor, 5 nit.

## What I ran myself (main checkout at `c231ae9`, before the uncommitted edits appeared)
| Check | Result |
|---|---|
| `npx vitest run` | 37 files, 351/351 pass |
| `node --test scripts/*.test.mjs` | 234/234 pass |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0; warnings only, all in `src/terminal/**` |
| `node scripts/check-literals.mjs` | PASS (22 files) |
| `node scripts/check-use-client.mjs --no-build` | PASS (33 modules) |
| `node scripts/check-unreachable.mjs` | PASS, 128/128 reachable (new entries: opengraph-image, the placeholder pages, robots, sitemap) |
| `npm audit --omit=dev` | 0 vulnerabilities. No dependency added in the range. |
| Built `/` head (gate worktree `.next/server/app/index.html`) | A single `og:image`, `https://tijothomas.dev/opengraph-image`, which is **not a route** (#1). Canonical and og:url are `https://tijothomas.dev` with no slash (#2). No email or phone. No `twitter:creator`. Favicon `/favicon.svg`. Exactly 1 Person JSON-LD. |
| Built route manifests | The OG route is `/opengraph-image-12o0cb`. Next suffixes metadata routes inside a route group. |
| Built placeholder pages | `noindex, follow` and their own canonical. Their og:image/twitter:image are the correct hashed `/opengraph-image-12o0cb?…`, inherited from the file convention. Landmarks are main and contentinfo. One h1. |
| Built `sitemap.xml` / `robots.txt` | Only `https://tijothomas.dev/`, with no lastmod. `User-Agent: *`, `Allow: /`, `Sitemap: https://tijothomas.dev/sitemap.xml`. |
| e2e artefacts (gate worktree) | `SEO-AC-02 GET /opengraph-image`: expected 200, received **404**. `SEO-AC-01` canonical: expected `/\/$/`, received `"https://tijothomas.dev"`. |

## Findings
| # | Severity | File:line | Finding | Recommendation | Status |
|---|---|---|---|---|---|
| 1 | **blocker** | `src/app/(site)/page.tsx:25`, `:38`, `:44` | **The share image on `/` points at a 404.** `ogImage.url` is hard-coded to `/opengraph-image`. The image file sits in the `(site)` route group, so Next serves it at `/opengraph-image-12o0cb`. Page-level `openGraph.images` and `twitter.images` override the file-convention tag from the parent segment. So `/` emits only the broken URL, and LinkedIn and X shares of the home page show no image. **SEO-AC-02 fails** (e2e 404). Nothing caught this because the SEO-AC-01 unit test (`seo.test.tsx:34`) required `og.images` in the config object, which pushed the author to hard-code the URL. | Remove `ogImage` and both `images` arrays; the file convention then emits the hashed URL, as the placeholder pages already show. In e2e, read `og:image` and `twitter:image` from `/` and GET those URLs (expect 200, PNG, 1200×630); do not fetch a fixed path. Planner and owner: SEO-AC-02's "`GET /opengraph-image`" and SEO-AC-01's "OG images are set" (on the exported object) need rewording to "the rendered og:image resolves to a 200 PNG". | Fix in progress (uncommitted `page.tsx` and `seo.spec.ts` edits); re-verify on the gate run |
| 2 | major | `e2e/seo.spec.ts:16`; `src/app/(site)/seo.test.tsx:32` | **The root canonical renders without its trailing slash, so the SEO-AC-01 e2e test fails.** Next normalises `alternates.canonical` and `og:url` from `https://tijothomas.dev/` to `https://tijothomas.dev`. The unit test passes only because it checks the config object. This is not an SEO defect: the two are the same URL (RFC 3986 §6.2.3). But the AC's literal `<siteUrl>/`, the e2e regex and the rendered head disagree. The JSON-LD `url` and the sitemap `<loc>` keep the slash. | Accept the normalisation: e2e should assert `new URL(href).href === siteUrl + '/'`, or `/^https:\/\/tijothomas\.dev\/?$/`, and note it in SEO-AC-01. Do not add `trailingSlash: true` for this; it changes every route. | Fix in progress (uncommitted `seo.spec.ts:23`) |
| 3 | major | `src/app/(site)/work/[slug]/page.tsx:25`, `:37`; `writing/[slug]/page.tsx:25`, `:37`, `:22`; `src/components/Placeholder.tsx:26`; `src/app/(site)/opengraph-image.tsx` (0/31 lines) | **CG5 is red (diff branches 66.7 % < 70 %).** It reflects a real gap: no unit test covers the negative paths. Nothing tests that an unknown slug gives `generateMetadata → {}` and `notFound()`, that a published post has no badge, or that a Placeholder can render without a badge. `opengraph-image.tsx` is not exercised at all. | Add the unknown/planned-slug tests (assert the `notFound` throw and `{}` metadata), a Placeholder-without-badge render, and a test that calls `OpengraphImage()` and checks its `size`/`contentType`/`alt` exports and that it renders `profile.name` and `profile.headline`. Do not lower the threshold or exclude files. | Partly in progress (uncommitted `placeholders.test.tsx`, `opengraph-image.test.tsx`); needs the gate re-run |
| 4 | minor | `e2e/seo.spec.ts:18` | The SEO-AC-01 e2e test checks `og:image` with `.first()` and a regex `/opengraph-image/`. It passed while the URL was a 404, and `.first()` would hide a duplicate tag. | Assert `toHaveCount(1)` for `og:image` and `twitter:image`, then fetch the URL (see #1). | Appears addressed in uncommitted edit (`toHaveCount(1)`) |
| 5 | minor | `src/app/sitemap.ts:15` | Case-study URLs are taken from **every** work item, `planned` ones included, whereas posts are filtered to `published`. A planned item gaining an on-site `caseStudyUrl` would be listed in the sitemap while `SHOW_PLANNED` is off, a planned-content leak (CONT-AC-03 spirit). The inclusion path is also untested: the sitemap tests only assert absence, which is vacuous with today's content. | Filter work through the same visibility rule as `/` (`status !== 'planned'`, or `visible()` with the build flag). Add a fixture test with an on-site published post, an external URL, a planned item and a duplicate. | Open (the uncommitted `sitemap-urls.ts` makes it testable but keeps the planned-work path) |
| 6 | minor | `src/lib/json-ld.ts:7`; `specs/seo.md:12` (SEO-AC-06); `edd-docs/inception/units/U-09-seo.md:16` | **The literal `<` was lost in docs.** At some point it was decoded to a bare `<`, so the comment reads "Every "<" is therefore escaped as <", and the AC reads "any `<` in the data is serialised as `<`". Both are meaningless. The spec and unit text predate this range; the code comment is new. | Restore `<` in all three. The spec edit needs the usual spec-amendment record. | Open |
| 7 | minor | `scripts/seo-gates.test.mjs:32` | The Lighthouse budget check `[/95/, /0\.05/, /2500/, /150/]` matches the digits anywhere in `lighthouse.mjs`, for example `1500` or a comment. It cannot fail for a loosened budget such as `MIN_SCORE = 90` while "95" stays in the header comment. | Match the definitions: `/MIN_SCORE = 95\b/`, `/cls: 0\.05\b/`, `/lcpMs: 2500\b/`, `/tbtMs: 150\b/`. | Open |
| 8 | minor | `src/app/(site)/opengraph-image.tsx:7`, `:33-34` | **The OG image font has three problems.** next/og bundles only `Geist-Regular.ttf`, so `fontWeight: 700` renders regular: Satori cannot fake bold. The comment's glyph claim is moot, because neither `·` nor `–` is drawn: only the name and headline are. And @vercel/og's `loadDynamicAsset` fetches from `fonts.googleapis.com` for any glyph Geist lacks. The "no network fetch" property (T-56/R8) holds only while the name and headline stay inside Geist's coverage, which today they do: they are ASCII. | Either bundle a local bold font (as the unit's "Files touched" planned) or drop the weights. Reword the comment to state the coverage dependency. Add a unit check that `profile.name` and `headline` are within the Latin range. | Open |
| 9 | minor | `edd-docs/construction/U-09/` | **Two DoD manual items have no evidence.** The OG image screenshot, with no missing glyphs, is not saved. The Rich Results test is not recorded. | Save the screenshot of the hashed OG route after #1, and record the Rich Results outcome, or defer it to the owner-approved preview. | Open |
| 10 | nit | `src/app/(site)/globals.css:94-96` | **`#top { scroll-margin-block-start: 100dvh }` is safe but indirect.** It works because the snap target, the hero top minus one viewport, clamps to 0 whenever the hero starts within one viewport of the page top, which is always true here. It affects only scrolls to `#top`, and the e2e test covers it. A future layout change that pushes `#top` more than a viewport down would silently break it. | Optional: point the brand at a top-level target (`id="top"` on the header or body wrapper) and drop the margin trick. Otherwise, keep the comment. | Open |
| 11 | nit | `scripts/check-use-client.mjs:32` | `next/navigation` is allowed as a whole specifier. It also exports client hooks (`useRouter`, `usePathname`). The risk is small: hooks throw in a server component, and `"use client"` is banned on the site. Still, the allow-list is wider than the stated use (`notFound`). | Optional: allow `next/navigation` only for the named imports `notFound` and `redirect`. `next/og` is justified as is: server-only, prerendered to PNG, no client JS. | Open |
| 12 | nit | `src/app/(site)/opengraph-image.tsx:12-15` | The hard-coded colours equal the tokens `--ink`, `--mint`, `--accent` and `--green` (verified). They are intentional, because CSS variables are unavailable in Satori, but nothing ties them together. | Add a comment that names the tokens, or a small test that reads `globals.css` and compares. | Open |
| 13 | nit | `src/app/(site)/globals.css:785` | `.tile` already has a 1 px border, so the forced-colours rule is redundant for it. That is harmless: the browser already maps border colours. `.badge` grows 2 px in forced-colours mode only. | None needed; optionally drop `.tile` from the list. | Open |
| 14 | nit | `e2e/seo.spec.ts:43` | `expect(baseURL).toBeTruthy()` asserts nothing about the AC. | Remove it. | Open |

## Checked and found correct
- **JSON-LD escaping.** The HTML tokenizer's script-data state reacts only to `<`, for `</script`, `<!--` and the double-escaped `<script`. Escaping every `<` as `<` therefore closes both the early-close and the escaped-state paths.
  - **`>`:** harmless once `<` is gone, because `-->` matters only after `<!--`.
  - **`&`:** has no meaning in raw text, since there are no character references there.
  - **U+2028/2029:** a hazard only when the block is parsed as JavaScript. `application/ld+json` is not executed, and JSON allows both.
  - **Lone surrogates:** escaped by `JSON.stringify` (well-formed stringify).
  - **Conclusion:** escaping `<` alone is sufficient for this sink. The data is from `src/content` only.
- **Only raw-HTML sink.** `dangerouslySetInnerHTML` appears outside `src/terminal` only at `src/lib/json-ld.ts:16`. `.oxlintrc.json:27` sets `react/no-danger` to error, and the single `off` override is `:118` for that file (PLAT-AC-23).
- **No PII.** There is no email, telephone, contactPoint or `@` in the built head, the Person, the TechArticle or the OG image text. `twitter:creator` is absent. CG10_pii_scan PASS.
- **Titles.** `/` uses `absolute`, which gives "Tijo Thomas · Lead Software Engineer" (36 characters). The placeholders get "`<item>` · Tijo Thomas" from the template. The layout favicon is declared.
- **Placeholder routes.** `dynamicParams = false` with a single slug from content. `itemFor`/`postFor` guard on the exact slug. The planned `fde-mcp-gateway` is not routable, and the placeholder items are not `planned`. Pages are `noindex, follow` with a self canonical.
  - **Structure:** one h1 from content, a home link, then `main` and the reused `footer` (contentinfo). No header or nav, so no skip link is needed. The heading order is trivially valid. All strings come from content (check-literals PASS).
  - **Badges:** the badge tone mapping matches the home cards.
- **Sitemap and robots.** No `lastModified` (no invented dates). Only `<siteUrl>/` today. `/terminal`, `/v2` and the placeholders are excluded. Robots is `*` / `Allow: /` with the sitemap URL.
- **Content boundary.** `src/content` changes are data plus two exported slug constants, with no runtime imports. No `"use client"` (check-use-client PASS).
- **F-35.** The two bullets match the owner wording recorded in `1.1-facts-resolved.md` character for character. The F-35 withheld entry is removed and the facts test is updated.
- **Gates not weakened.** Lighthouse moved from report-only to enforced. `gates.test.mjs` now requires every gate to be enforced, which is stricter. The check-use-client additions are exact specifiers with reasons.
- **MWG pass:**
  - **Reduced motion (HOME-AC-21).** The only motion sources on `/` are `.work-card` (border-color), `.city-building-body` (transform), `.city-label-bg` (fill) and `.city-car` (animation). All four are switched off under `reduce`, at equal specificity and later in the cascade. No Tailwind `transition-*` or `animate-*` classes are used on the site. The e2e test scans every element's `transitionDuration` and `document.getAnimations()`, so a new, unlisted transition would fail it. Smooth scrolling is gated on `no-preference`. HOME-AC-21 still holds.
  - **Forced colours.** The `CanvasText` border is the correct system keyword for background-only shapes. Preflight's `border-box` keeps the fixed-size monogram and step number the same size.
  - **Logical properties.** Each replacement (`inline-size`, `block-size`, `padding-block-*`, `margin-block-start`, `border-block-start`) is identical in `horizontal-tb`. The site is LTR English only, so there is no regression.
  - **`flex-wrap: balance`.** It follows `flex-wrap: wrap`, so engines without it keep `wrap`.
  - **Car at 5 s.** HOME-AC-20 is amended and the e2e test is updated (owner decision D1).

## AC status (at `c231ae9`)
| AC | Status | Evidence |
|---|---|---|
| SEO-AC-01 | **Fail (rendered)** | The unit test passes on the config. The rendered canonical has no slash (#2), and `og:image` resolves to a 404 (#1). |
| SEO-AC-02 | **Fail** | `/opengraph-image` returns 404. The image exists at `/opengraph-image-12o0cb` (PNG, 1200×630 per the route meta). See #1. |
| SEO-AC-04 | Pass (weakly tested) | The built sitemap is correct. The inclusion path is untested, and planned work is not filtered (#5). |
| SEO-AC-05 | Pass | Unit test and the built `robots.txt`. |
| SEO-AC-06 | Pass | Unit tests and the built JSON-LD. Escaping is sufficient. AC text is corrupted (#6). |
| SEO-AC-07 | Pass in the build; e2e status not separable | Built pages are noindex. Only 2 seo tests failed, and neither is AC-07. Negative unit paths are missing (#3). |
| SEO-AC-08 | Pass | Unit test and the built TechArticle (no dates). |
| SEO-AC-10 | Pass | Lighthouse gate enforced and PASS (median 99/100/96/100, CLS 0, LCP 917 ms, TBT 122 ms). The test for it is weak (#7). |
| SEO-AC-11 | Pass | Unit tests, built head, CG10_pii_scan. |
| PLAT-AC-23 | Pass | `.oxlintrc.json:27`, `:118`; `seo-gates.test.mjs`; my grep. |
| HOME-AC-11 (#top fix) | Pass, given the e2e run | The CSS is correct. The `home-viewport` test was not among the e2e failures. |
| HOME-AC-20 (amended 5 s) | Pass, given the e2e run | The CSS is `5s`, and the e2e test expects 5000 ms. |
| HOME-AC-21 | Pass, given the e2e run | Analysis above. The e2e test scans all elements. |

## To approve
1. Fix #1, #2 and #3, and add the tests they need.
2. Get a fresh gate run with all gates PASS, CG5 included, and the full e2e suite green against prod.
3. Write `gates.md`.
4. Fix or explicitly defer #4 to #9.
