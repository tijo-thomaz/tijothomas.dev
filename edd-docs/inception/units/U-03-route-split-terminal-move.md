# U-03 Restructure into `src/`: route groups, terminal move, `/v2` redirect
Stories: US-03, US-24 (primary); US-02, US-16 (part)     Depends on: U-01     Next: U-02
Flags: **critical** (R9: the move could hide a behaviour change; R17: CSS classes lost when globs change) · hot-path: no · ai: no
Estimate: M (mechanical, but many files)
Amended 2026-11-24: owner chose the `src/` layout, and this unit now runs **before** the Next 16 upgrade (on Next 14.2.30). Unit IDs are unchanged. TERM-AC-06 moved to U-02, because it needs the lazy Supabase client.

## Goal
Move all app code under `src/`, split it into `src/app/(site)` and `src/app/(terminal)` with two root layouts, and move every module `/terminal` still uses into `src/terminal/` without changing it. `/` becomes a hello-world site page that runs through the new layout. Doing this before the upgrade means the upgrade and its codemods only touch the final layout once.

## ACs covered
PLAT-AC-06, PLAT-AC-08, PLAT-AC-09, PLAT-AC-10, TERM-AC-01, TERM-AC-02, TERM-AC-03, TERM-AC-04, TERM-AC-05, HOME-AC-04, HOME-AC-05, SEO-AC-03

Re-verified here (owned by U-00/U-01; their check scripts now read `src/` paths): PLAT-AC-05, PLAT-AC-11, PLAT-AC-12, PLAT-AC-13, PLAT-AC-14, PLAT-AC-16.

## Scope
1. **Commit A, `git mv` only (record the hash for PLAT-AC-10):**
   - `app/api/*` → `src/app/api/*`.
   - `app/page.tsx` → `src/terminal/page.tsx` (the old terminal page).
   - Every module it reaches → `src/terminal/<old relative path>` (RQ-18 a: e.g. `src/terminal/components/Terminal.tsx`, `src/terminal/features/chat-assistant/…`, `src/terminal/widgets/…`, `src/terminal/shared/…`). Terminal-only libs (`supabase`, `simple-analytics`, `tutorial-manager`, `version`, `sounds`, terminal `utils`) → `src/terminal/lib/`.
   - `app/layout.tsx` and `app/globals.css` → `src/terminal/` as the start of the terminal layout.
2. **Commit B, path and config fixes only:**
   - `tsconfig.json` `paths` `@/*` → `./src/*` and `vitest.config.ts` alias `@` → `./src`.
   - Import-path fixes where a module's position relative to `src/` changed.
   - `scripts/paths.mjs` switched to `src/…`.
   - Oxlint `legacy-terminal` override → exactly `src/terminal/**`.
   - Tailwind `content` → `./src/app/**`, `./src/components/**`, `./src/terminal/**`, `./src/content/**`. **Remove the temporary U-00 globs** `./features/**`, `./widgets/**`, `./shared/**`.
   - Vitest `include` → `src/{app,components,terminal,content,lib}/**/*.test.{ts,tsx}` (+ `scripts/`). **Remove the temporary `{features,widgets,shared}/**` glob.**
3. **Commit C, route groups:**
   - `src/app/(terminal)/layout.tsx` (ThemeProvider, JetBrains Mono, terminal CSS, `<Analytics/>`, terminal viewport) and `src/app/(terminal)/terminal/page.tsx` (renders `src/terminal/page.tsx`). Metadata `robots: { index: false, follow: true }`, canonical `/terminal`.
   - `src/app/(site)/layout.tsx`: `<html lang="en">`, Space Grotesk + Inter via `next/font`, `metadataBase`, `<Analytics/>`, site CSS. Viewport without `maximumScale`/`userScalable`. No ThemeProvider, no hidden SEO block.
   - `src/app/(site)/page.tsx`: hello-world placeholder (one `main`, no facts) until U-06.
4. **Commit D:** VersionSelector "v1" → `/terminal`. `/v2` → `/terminal` 308 in `next.config.js` `redirects()`; this also fixes the known U-00 regression where the `/v2` option gave 404. `src/lib/site.ts` (`siteUrl`).
5. **Commit E, gates:**
   - `scripts/check-imports.mjs` (PLAT-AC-09, HOME-AC-04).
   - `scripts/check-renames.mjs` + `scripts/rename-exceptions.json` (empty for now).
   - Folder test (PLAT-AC-08).
   - `scripts/css-diff.mjs`, generalised from U-00's `smoke/cssdiff.mjs`.

Out of scope: any edit to terminal behaviour, text or data (U-04, U-10); the Next upgrade and the lazy Supabase client (U-02). Builds in this unit still need the placeholder Supabase env (as in U-00).

## Files touched
`app/**` → `src/app/**` and `src/terminal/**` (renames); `components/**`, `features/**`, `widgets/**`, `shared/**`, `lib/**` → `src/terminal/**` (renames); `src/app/(site)/{layout,page}.tsx`, `src/app/(site)/globals.css`, `src/app/(terminal)/layout.tsx`, `src/app/(terminal)/terminal/page.tsx`, `src/lib/site.ts`, `tsconfig.json`, `vitest.config.ts`, `tailwind.config.js`, `next.config.js`, `.oxlintrc.json`, `scripts/paths.mjs`, `scripts/check-imports.mjs`, `scripts/check-renames.mjs`, `scripts/rename-exceptions.json`, `scripts/css-diff.mjs`, `scripts/folders.test.mjs`, `e2e/terminal.spec.ts`, `e2e/v2-redirect.spec.ts`, `src/app/(site)/layout.test.tsx`, `README.md` (folder rules, `@/*` → `./src/*`), `CHANGELOG.md`.

## Interfaces
- Route table: `/` (site, static), `/terminal` (terminal, noindex), `/v2` → 308, `/api/analytics`, `/api/chat` (until U-04).
- `@/*` → `./src/*` everywhere (tsconfig, vitest).
- `src/lib/site.ts`: `export const siteUrl = 'https://tijothomas.dev'` (F-69).

## Definition of Done
- The ACs above pass. The re-verified U-00/U-01 checks pass on `src/` paths. `npm run gates` is green and `specs/pending.txt` is updated.
- **Temporary globs removed:** `tailwind.config.js` and `vitest.config.ts` contain no `features`, `widgets` or `shared` glob, and no glob outside `src/` (vitest also allows `scripts/`). The check prints PLAT-AC-06 / PLAT-AC-05.
- **CSS-diff evidence (U-00 review lesson):**
  - Build the Tailwind CSS at the last pre-U-03 commit and at HEAD in scratchpad worktrees, not in the repo `.next`, because the owner's dev server on :3100 uses it.
  - Extract the class selectors from both builds. Report removed classes that a reachable module under `src/` still uses: the result must be **0 missing**.
  - Added classes are listed and checked in the smoke.
  - Output goes to `edd-docs/construction/U-03/css-diff.txt`.
- Robustness (critical):
  - Run TERM-AC-01/02 e2e.
  - Run the U-00 smoke script against `/terminal` (base `/` vs HEAD `/terminal`) at 1280 and 360 px: load, `help`, theme, chat. The pixel diff may show animation frames only.
  - Manual check of zoom and sounds.
- `git diff -M --stat` of commit A is saved (all renames ≥ 90%).
- Review clean. README folder rules updated, CHANGELOG entry added.

## Patterns used
- Route groups with two root layouts (bulkhead: terminal styles and state cannot leak into `/`).
- `src/` source root with a single path alias (`@/*` → `./src/*`) and a single path registry for gates (`scripts/paths.mjs`).
- Move-then-fix in separate commits, so "unchanged" can be proven.
- Strangler fig: the old app keeps running behind `/terminal` while the new `/` grows.
- Before/after artefact diff (generated CSS) for changes that import graphs cannot see.
