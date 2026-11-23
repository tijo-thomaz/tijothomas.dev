# U-09 SEO: metadata, OG image, sitemap, robots, JSON-LD, `/work` and `/writing` scaffolds
Stories: US-16, US-17, US-18, US-19, US-20 (primary)     Depends on: U-08
Flags: hot-path: no · critical: no · ai: no
Estimate: M

## Goal
Make `/` discoverable and shareable, scaffold the two article routes, and switch the Lighthouse ≥ 95 gate to enforce.

## ACs covered
SEO-AC-01, SEO-AC-02, SEO-AC-04, SEO-AC-05, SEO-AC-06, SEO-AC-07, SEO-AC-08, SEO-AC-10, SEO-AC-11, PLAT-AC-23

## Scope
1. `metadata` for `/` from `profile.seo` (title < 60, description 70–160 per C-17, canonical, OG + Twitter `summary_large_image`, no `twitter.creator`, no email/telephone).
2. `app/(site)/opengraph-image.tsx` via `next/og`, 1200×630, confirmed name + headline, **local bundled font** (no network fetch, T-56/R8).
3. `app/sitemap.ts` (data-driven from published items; excludes `/terminal`, `/v2`, noindex placeholders), `app/robots.ts`.
4. `lib/json-ld.ts`: `serializeJsonLd(obj)` = `JSON.stringify` + `<` → `<` (SEC-09); `Person` on `/` (`sameAs` = confirmed LinkedIn + GitHub only).
5. `app/(site)/work/[slug]/page.tsx`, `app/(site)/writing/[slug]/page.tsx`: one placeholder slug each from content, `generateStaticParams`, `dynamicParams = false` (unknown → 404), `robots: noindex`; `TechArticle` JSON-LD on writing.
6. Oxlint `react/no-danger` as error with a single override for `lib/json-ld.ts` (PLAT-AC-23).
7. Switch the Lighthouse gate to **enforce** (median of 3, mobile, RQ-15 a).

Out of scope: `/privacy` (U-10), headers/CSP (U-11).

## Files touched
`app/(site)/page.tsx` (metadata + JSON-LD), `app/(site)/opengraph-image.tsx`, `app/(site)/fonts/*` (local font file), `app/sitemap.ts`, `app/robots.ts`, `app/(site)/work/[slug]/page.tsx`, `app/(site)/writing/[slug]/page.tsx`, `lib/json-ld.ts` + test, `content/posts.ts`/`work.ts` (placeholder entries flagged `noindex`), `.oxlintrc.json`, `gates.yml`, tests, `e2e/seo.spec.ts`, `CHANGELOG.md`.

## Interfaces
- `serializeJsonLd(data: Record<string, unknown>): string`.
- Placeholder slugs exported from content (e.g. `placeholderSlug`).

## Definition of Done
- ACs pass; `npm run gates` green with **Lighthouse enforced** (≥ 95 ×4, CLS ≤ 0.05, LCP ≤ 2.5 s, TBT ≤ 150 ms).
- Manual: OG image has no missing glyphs (`·`, `–`), screenshot saved; Rich Results test 0 errors (after owner-approved preview).
- Review clean; CHANGELOG.

## Patterns used
- Output encoding for the only raw-HTML sink (JSON-LD helper).
- Static generation with a closed param set (`dynamicParams = false` → 404).
- Next Metadata API as the single place for head tags.
