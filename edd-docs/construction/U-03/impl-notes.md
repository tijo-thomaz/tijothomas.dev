# U-03 Restructure into `src/`: implementation notes (EDD stage 2.2)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Base:** `2535185` · **Tests:** `a488e02` · Next stays 14.2.30 (upgrade is U-02).

## Commits
| # | Hash | What |
|---|------|------|
| A | `0e8b4e9` | `git mv` only: 96 renames, all R100 (`commit-a-renames.txt`). `moveCommit` in `scripts/rename-exceptions.json` |
| B | `0a3642f` | `@/*` → `./src/*` (tsconfig, vitest); 39 import lines `@/x/` → `@/terminal/x/` in 19 files; Tailwind `content` and vitest `include`/`coverage.include` only under `src/` (temporary U-00 globs removed); `scripts/paths.mjs` → `src/` + `layers`; Oxlint legacy override exactly `src/terminal/**`; `repo-graph` resolves `@/` through tsconfig; `.gitkeep` in `src/components`, `src/content` |
| C | `92b3cfd` | `(terminal)` and `(site)` root layouts, `/terminal` page (noindex, follow; canonical), hello-world `/`, `src/lib/site.ts`, `/api` entry re-exports |
| D | `50870fb` | `AVAILABLE_VERSIONS` v1 → `/terminal`; `next.config.js` `redirects()` `/v2` → `/terminal` (308) |
| E | `1566c9c` | `check-imports.mjs` (CG9), `check-renames.mjs` + `rename-exceptions.json` (new enforced `renames` gate), `css-diff.mjs`; README folder rules, CHANGELOG |
| — | `992b6ba` | Tests for CG5: every moved terminal module loads; `/api` entries re-export the terminal handlers; `/terminal` renders the terminal app. `.gitignore` for U-03 smoke PNGs |

## Deviations from the unit file (for review)
1. **API handlers live in `src/terminal/api/`, not `src/app/api/`.** Commit A moved `app/api/{analytics,chat}/route.ts` to `src/terminal/api/…`; commit C adds 3-line `src/app/api/*/route.ts` files that `export { GET, POST }` from there. Reason: PLAT-AC-14 and `folders.test.mjs` require the legacy override to be **exactly** `src/terminal/**`, while the two handlers carry 5 legacy warnings (complexity, function length, depth). Listing them in the override (the brief's suggestion) fails PLAT-AC-14; refactoring them would change behaviour and break the ≥ 90 % rename rule. The build shows both as `ƒ` routes and `routes.test.ts` proves the exports are the same functions. `/api/chat` is deleted in U-04 either way.
2. **`check-unreachable.mjs` PLAT-AC-12 now scans test files under `paths.srcRoots` only.** The new node:test files embed fixture source (`import … from './a'`) in string literals, which the regex scanner read as broken imports. App tests are what PLAT-AC-12 is about; `e2e/` specs import only `@playwright/test`.
3. **`scripts/lib/repo-graph.mjs`** gains `aliasPrefix(root)` (reads `paths['@/*'][0]` from `<root>/tsconfig.json`, cached) and exports `isRouteFile`. Contract §3.1.
4. **`check-renames.mjs`** treats a moved file that is later *deleted* (old path `D`, new path absent at HEAD) as passing check 2: no code is left in which a change could hide. U-04 relies on this when it deletes `src/terminal/api/chat/route.ts`; if the reviewer prefers, U-04 can list it as an exception instead.
5. The aliasProbe stays at `src/terminal/lib/vitest-alias.test.ts` (moved with `lib/`, import retargeted to `@/terminal/lib/utils`). Its header comment still says "under lib/"; it was left unchanged to keep the file a ≥ 90 % rename (R091). U-05 retargets it to `@/content/profile`.

## Behaviour of `/terminal` (critical: R9)
- `src/terminal/layout.tsx` is unchanged apart from one import line (ThemeProvider path). `(terminal)/layout.tsx` re-exports its default, `metadata` and `viewport`, so the ThemeProvider, JetBrains Mono, terminal CSS, hidden SEO block and `maximumScale: 1` stay exactly as on the old `/`.
- `(terminal)/terminal/page.tsx` adds only metadata: `metadataBase` = `siteUrl`, `robots { index: false, follow: true }` (replaces the layout's `index: true` + googleBot, as Next merges top-level keys shallowly), `alternates.canonical: '/terminal'`.
- `VersionDropdown` still maps `/v1` → `/`; that branch is now dead because the route is `/terminal`. Left untouched (scope: no terminal edits beyond the AC).

## CSS diff (R17), `css-diff.txt`
Tailwind CLI (`-c tailwind.config.js`) in scratchpad worktrees: base `2535185` input `app/globals.css`; HEAD `1566c9c` inputs `src/terminal/globals.css` + `src/app/(site)/globals.css`, concatenated. Result: base 693, HEAD 695, **removed 0, removed-but-used 0**; added `antialiased` (the site body) and `block`. `block` comes from the word "block" in a layout comment (Tailwind scans raw text). No terminal file uses a bare `block` class (only `md:block`, `lg:block`, `inline-block`), and in Tailwind's order `.block` precedes `.hidden` and the responsive variants, so `hidden md:block` is unaffected. The smoke shows no layout change.
Note: both CSS entry points include every utility used anywhere under `src/`, so `/` currently ships the terminal's utilities too. This is harmless for the placeholder; scope the site CSS when U-05/U-06 add real site code.

## Smoke + pixel diff (`smoke/`)
- Servers: `next start` from scratchpad worktree builds, base `2535185` on :3211 (`/`), HEAD on :3212 (`/terminal`), placeholder Supabase env. Only those two processes were stopped afterwards; :3100 untouched.
- `smoke/smoke.cjs` (U-00 script with targets as arguments, installed Chrome): load, `help`, theme (2nd of 4 items, body bg `rgb(15,15,15)` → `rgb(255,255,255)` on both), chat trigger click. Both viewports: status 200, all steps ok, **0 page errors** on base and HEAD (`smoke-results.json`).
- `smoke/pixdiff.txt` (RGB Δ > 30): mobile 360 all four steps **0 px**; desktop chat step 0 px; desktop load 621 px, help 809 px, theme 1687 px. Every differing pixel of load/help is at x ≤ 55 (the left-edge chat trigger running `animate-bounce`); theme adds 52 px at x ≈ 456, y ≈ 648 (the `animate-pulse` dot of the "New here?" pill). These are the same animation-frame differences U-00 recorded. **No visual regression.** Screenshots are local only (git-ignored).
- **Zoom and sounds** (scripted in place of the manual check, same on base `/` and HEAD `/terminal`): zoom label 100 % → 130 % (2× Zoom In) → 115 % (Zoom Out), `localStorage['tijothomas-zoom']='115'`; sound button "Enable Sound" → "Disable Sound", `localStorage['tijothomas-sounds']='true'`; 0 page errors. Audio output itself was not listened to; the owner may want to confirm it by ear.

## Tests and gates
- node:test 129/129; Vitest 187/187 (10 files; +96 from the moved-modules test); tsc 0 errors (excluding the owner's stale `.next/types` in the repo checkout, see below); Oxlint 0 errors, 109 warnings (ceiling 109, all in `src/terminal/**`); spec:check PASS (23 cited, 69 pending); e2e 13/13. Full gate run: `gates.md`.

## Notes for the orchestrator
- The owner's `next dev` on :3100 must be restarted: `app/` no longer exists. Until it regenerates, the repo's `.next/types/app/*.ts` still point at `app/layout.js` etc., so `npm run type-check` **in the repo checkout** reports 6 TS2307 errors from `.next/types`. In a clean worktree CG3 passes. Restarting `next dev` (or deleting `.next/`) clears them.
- No new dependencies. `vite/client` types are referenced in one test (`import.meta.glob`); `vite` is already installed through `vitest`.
