# U-03 Route groups, terminal move to `/terminal`, `/v2` redirect
Stories: US-03, US-24 (primary); US-02, US-16 (part)     Depends on: U-02
Flags: **critical** (R9: the move could hide a behaviour change) · hot-path: no · ai: no
Estimate: M (mechanical, but many files)

## Goal
Split the app into `app/(site)` and `app/(terminal)` with two root layouts, move every module `/terminal` still uses into `terminal/` without changing it, and give `/` a hello-world site page that runs through the new layout.

## ACs covered
PLAT-AC-06, PLAT-AC-08, PLAT-AC-09, PLAT-AC-10, TERM-AC-01, TERM-AC-02, TERM-AC-03, TERM-AC-04, TERM-AC-05, TERM-AC-06, HOME-AC-04, HOME-AC-05, SEO-AC-03

## Scope
1. **Commit A, `git mv` only:** move `app/page.tsx` and every module it reaches into `terminal/`, keeping relative paths (RQ-18 a: e.g. `terminal/components/Terminal.tsx`, `terminal/features/chat-assistant/...`, `terminal/widgets/...`, terminal-only libs into `terminal/lib/`). Record the commit hash for PLAT-AC-10.
2. **Commit B, import-path fixes only.**
3. `app/(terminal)/layout.tsx` (ThemeProvider, JetBrains Mono, terminal CSS, `<Analytics/>`, terminal viewport) and `app/(terminal)/terminal/page.tsx`; metadata `robots: { index: false, follow: true }`, canonical `/terminal`.
4. `app/(site)/layout.tsx`: `<html lang="en">`, Space Grotesk + Inter via `next/font`, `metadataBase`, `<Analytics/>`, site CSS; viewport without `maximumScale`/`userScalable`. No ThemeProvider, no hidden SEO block. `app/(site)/page.tsx`: hello-world placeholder (one `main`, no facts) until U-06.
5. VersionSelector "v1" → `/terminal`; `/v2` → `/terminal` 308 in `next.config` `redirects()`.
6. Tailwind `content`: `app/`, `components/`, `terminal/`, `content/`.
7. Gates: import-direction rules in `scripts/check-imports.mjs` (CG9; `(site)` graph never reaches `terminal/` or Supabase), rename-similarity gate (`scripts/check-renames.mjs` with `scripts/rename-exceptions.json`, empty for now), folder test; narrow the Oxlint warning override to `terminal/`.

Out of scope: any edit to terminal behaviour, text or data (U-04, U-10).

## Files touched
`app/layout.tsx`, `app/page.tsx`, `app/globals.css` (moved/split), `app/(site)/{layout,page}.tsx`, `app/(site)/globals.css`, `app/(terminal)/layout.tsx`, `app/(terminal)/terminal/page.tsx`, `terminal/**` (renames), `next.config.js`, `tailwind.config.js`, `.oxlintrc.json`, `scripts/check-imports.mjs`, `scripts/check-renames.mjs`, `scripts/rename-exceptions.json`, `scripts/folders.test.mjs`, `e2e/terminal.spec.ts`, `e2e/v2-redirect.spec.ts`, `app/(site)/layout.test.tsx`, `CHANGELOG.md`, `README.md` (folder rules).

## Interfaces
- Route table: `/` (site, static), `/terminal` (terminal, noindex), `/v2` → 308.
- `lib/site.ts`: `export const siteUrl = 'https://tijothomas.dev'` (F-69).

## Definition of Done
- ACs pass; `npm run gates` green; `specs/pending.txt` updated.
- Robustness: TERM-AC-01/02/06 e2e plus manual checklist (theme, chat opens, zoom, sounds) with screenshots.
- `git diff -M` evidence of the move commit saved.
- Review clean; README folder rules; CHANGELOG.

## Patterns used
- Route groups with two root layouts (bulkhead: terminal styles and state cannot leak into `/`).
- Move-then-fix in two commits (provable "unchanged").
- Strangler fig: the old app keeps running behind `/terminal` while the new `/` grows.
- Permanent redirect for the retired `/v2` URL.
