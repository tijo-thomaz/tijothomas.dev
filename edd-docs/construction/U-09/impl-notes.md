# U-09 SEO: implementation notes (EDD 2.2)

- **Commits:**
  - `c9a2af3`: tests (red).
  - `7023726`: implementation.
  - `71cde5b` (og:image fix and coverage), `375909b` (review minors) and `28d9fad` (fixture): fixes.
- **Base:** `152b495`. The range also holds:
  - the modern-web-guidance pass (`1becf49`, `9f81337`, see `../mwg-pass.md`);
  - the `#top` fix (`5b49883`, `5749eec`);
  - the owner-supplied Opteamix bullets (`c231ae9`, `4eb03c8`).

## What was built
- **`/` metadata** (`page.tsx`), all from `profile.seo`:
  - absolute title, so the layout's `%s · <name>` template does not apply;
  - description and canonical;
  - Open Graph (`type: profile`) and a Twitter `summary_large_image` card;
  - no creator, no email and no phone.
- **Layout:**
  - a title template for sub-pages;
  - `icons: /favicon.svg` (the U-03 finding).
- **`opengraph-image.tsx`:** the name and headline at 1200×630 through `next/og`, which has a bundled font, so the build makes no network fetch.
  - Next serves it at a hashed path (`/opengraph-image-12o0cb?…`).
  - The `og:image` and `twitter:image` tags come from the file convention. Naming the URL by hand broke it: see the review blocker.
  - Evidence: `screenshots/opengraph-image.png`.
- **`sitemap.ts`** (logic in `src/lib/sitemap-urls.ts`) and **`robots.ts`**:
  - the sitemap lists `/` plus published posts and non-planned case studies hosted on the site;
  - there is no `lastModified`.
- **`src/lib/json-ld.ts`:** the only raw-HTML sink (PLAT-AC-23). It escapes `<`, builds the Person from `profile` (`sameAs` = LinkedIn and GitHub), and builds the TechArticle without dates.
- **`/work/[slug]` and `/writing/[slug]`:**
  - one prerendered placeholder each (`placeholderWorkSlug` and `placeholderPostSlug` in content), with `dynamicParams = false`, so unknown and planned slugs return 404;
  - noindex, follow, with their own canonical;
  - one `h1`;
  - built from the `Placeholder` component, all copy from content.
- **Gates:**
  - `lighthouse` is enforced;
  - `check-use-client` allows `next/og` and `next/navigation` (server use);
  - `scripts/seo-gates.test.mjs` pins the exact Lighthouse budgets and PLAT-AC-23.

## Review (`review.md`, pinned to `c231ae9`): changes-requested → all resolved
- **Blocker #1 (og:image was a 404):** fixed. The explicit `images` were dropped, and the e2e test now follows the rendered tags to a 200 response with a 1200×630 PNG.
- **Major #2 (root canonical without its trailing slash):** Next normalises it, and it is the same URL. The e2e test accepts both forms.
- **Major #3 (CG5 branches at 66.7 %):** tests were added for the OG image, the sitemap rules and the unknown or planned slug 404s. Coverage is now 95.3 % of branches and 99.5 % of lines.
- **Minors:**
  - #4: the `.first()` call removed; the test asserts exactly one `og:image`.
  - #5: planned work is excluded from the sitemap, with a test.
  - #6: the escape wording is restored in the comment, `specs/seo.md` and the threat model.
  - #7: exact budget pins.
  - #8: an ASCII guard on the OG text.
  - #9: an OG screenshot is saved. The **Rich Results test is an owner action**: it needs a public URL.
- **Nits:** the filler assertion was removed. The rest are kept on purpose:
  - the `#top` technique is a deliberate, tested CSS-only clamp;
  - the OG colours are literals, because next/og cannot read CSS variables.

## Self-heal
- **CG4 failed once:** the RCA-01 GitHub guard caught a fake `github.com/x` in a new sitemap fixture. Fixed in `28d9fad`.
- **Process note:** before that commit only the SEO script tests were run, not the full node suite. The full suites now pass locally (node 234, vitest 361).

## Owner decisions
1. **Share image font.** The bundled next/og font is regular weight only, so the image is not bold. For bold Space Grotesk, a font file (OFL licence) would be committed under `src/app/(site)/fonts/`. Options:
   - (a) keep as is;
   - (b) add the font.
2. **Rich Results test:** run Google's Rich Results Test on a preview deployment (it needs a public URL). This is added to the release owner actions.
