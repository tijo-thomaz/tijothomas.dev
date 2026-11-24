# U-06 Home shell: implementation notes (EDD 2.2)

- **Commits:** `5993553` (tests, red) → `be87034` (implementation) → follow-ups below. Base `813ab51`. Done by the orchestrator in the main session.
- **Visible result:** `/` on the owner's dev server (`localhost:3000`) now shows the nav, hero, highlights, contact and footer. Screenshots: `screenshots/home-360.png` and `screenshots/home-1440.png`. At both widths `scrollWidth` equals the viewport width (no horizontal scroll).

## What was built
- **Server components** in `src/components/`: `SkipLink`, `Nav`, `Hero`, `Highlights`, `Contact` and `Footer`. None has `"use client"`. Each takes typed props from `src/content/`, and `src/app/(site)/page.tsx` wires content into them. The footer year is `new Date().getFullYear()`, which is fixed at build time because `/` is prerendered.
- **CSS** (`src/app/(site)/globals.css`):
  - tokens from `Main.dc.html`, including accent `#ff7a33` and focus `#1d4ed8`;
  - rem sizes;
  - `clamp()` for the h1 and h2;
  - `text-wrap: balance` on headings and `pretty` on paragraphs;
  - a `:focus-visible` outline of 3px with an offset;
  - a skip link that stays off-screen until it is focused;
  - 44px touch targets on coarse pointers.
- **Content:** `profile.labels` gains `skipLink`, `highlights`, `availability`, `linkedin`, `github` and `terminalMode`. Each value cites a row or a spec AC, and `facts.test.ts` now accepts spec AC references and checks that each one exists.
- **Gates:**
  - `use_client` (HOME-AC-03) walks the site layers and their local imports. It allows only the next, react, react-dom and @vercel/analytics packages, and checks that `/` is in `prerender-manifest.json`.
  - `literals` (CONT-AC-12) reports JSX text and string literals longer than 3 words in `src/components`. It skips `className`, comments and tests, and allow-list entries need a reason. The allow-list is empty.

## Decisions and deviations
1. **Page test location:** the page test is `src/app/(site)/page.test.tsx`, not `src/components/page.test.tsx`, because components must not import `src/app/`.
2. **`role="list"` on the Highlights and Contact lists.** Oxlint flags this as redundant. The modern-web-guidance accessibility guide says Safari removes list semantics from a styled `<ul>` outside `<nav>`, so `role="list"` is needed there. Both lines carry an `oxlint-disable-next-line` with that reason. The nav list has no role, because it sits inside `<nav>`.
3. **Contact links** open in a new tab with `rel="me noopener noreferrer"`. HOME-AC-17 requires `me` and `noopener`.
4. **Headings are bold (700).** The mockup relies on the browser's default bold for headings, and the Tailwind reset removes it. This was found in the first screenshot and fixed.
5. **Nav anchors `#work`, `#experience` and `#writing` have no target yet.** U-07 adds those sections. HOME-AC-09 (every anchor resolves) belongs to U-07/U-08.
6. **The hero's right column is empty** until U-08 adds the CityMap, so the hero is a single column for now.
7. **`e2e/site-home.spec.ts`:** a test title still called `/` the hello-world page. The title was renamed. The test's assertions are unchanged.
