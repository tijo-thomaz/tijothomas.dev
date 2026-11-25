# U-02 Next 16.4.6 + React 19 upgrade
Stories: US-01, US-02 (primary)     Depends on: U-03, SP-01     Next: U-04
Flags: **critical** (R1: terminal regressions under React 19) · hot-path: no · ai: no
Estimate: M
Amended 2026-11-24: this unit now runs **after** the restructure (U-03), on the `src/` layout. It also owns TERM-AC-06, which moved here from U-03 because the lazy Supabase client lands here.

## Goal
Close the critical Next advisories and make the build work with no env vars, while `/terminal` and the hello-world `/` keep working.

## ACs covered
PLAT-AC-01, PLAT-AC-02, PLAT-AC-03, PLAT-AC-04, PLAT-AC-07, TERM-AC-06

## Scope
1. Install `next@16.4.6`, `react@19`, `react-dom@19` and the matching `@types/react*`. Run `@next/codemod` over `src/` (async request APIs, removed APIs). Do not use `--force` or `--legacy-peer-deps`. Fix peer conflicts with a compatible version or by removing the unused dependency (US-01).
2. Non-major dev bumps so CG10 passes (RQ-08 a): vitest and coverage to the 3.2.x patch, `@playwright/test` ≥ 1.55.1.
3. Lazy, guarded Supabase client in `src/terminal/lib/supabase.ts`: created on first server use. Missing env → analytics no-op, no throw (F-07).
4. Remove the `images` block from `next.config.js` (F-22).
5. Fix the type errors the upgrade causes (e.g. `useRef` typing), in `src/terminal/**` only where the upgrade forces it. Terminal behaviour stays unchanged. Every file touched here that was moved in U-03 is added to `scripts/rename-exceptions.json`, because the upgrade is allowed to change terminal code.

Out of scope: headers and `poweredByHeader` (U-11).

## Files touched
- `package.json`, `package-lock.json`, `next.config.js`, and `tsconfig.json` if Next 16 requires it.
- `src/terminal/lib/supabase.ts`, `src/app/api/analytics/route.ts` (calls the lazy getter).
- Files under `src/` that the codemod touches.
- `scripts/rename-exceptions.json`.
- `next.config.test.ts` (PLAT-AC-07), `e2e/terminal-no-env.spec.ts` (TERM-AC-06).
- `CHANGELOG.md`.

## Commits (small)
1. `build(U-02): next 16.4.6 + react 19` (lockfile + codemod output only)
2. `fix(U-02): react 19 type fixes`
3. `fix(U-02): lazy supabase client; build without env`
4. `chore(U-02): drop images config; dev tool bumps`

## Interfaces
- `getSupabase(): SupabaseClient | null` (server only; `null` when env is missing).

## Definition of Done
- The ACs pass. `npm run gates` is green, with CG1 now run in an empty env.
- Robustness check (critical):
  - TERM-AC-01/02/04/05 still pass.
  - The U-03 smoke (`/terminal` at 1280 and 360 px: load, `help`, theme, chat) passes, with a pixel diff against the U-03 screenshots showing animation frames only.
  - The CSS diff against U-03 shows 0 missing classes.
- The SP-02 rule-parity notes still hold under Next 16.
- Review clean. CHANGELOG entry added.

## Patterns used
- Codemod-driven migration, with mechanical changes kept separate from hand fixes.
- Lazy initialisation with a null fallback, so an optional dependency fails soft.
