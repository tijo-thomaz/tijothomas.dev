# U-02 Next 16.4.6 + React 19 upgrade
Stories: US-01, US-02 (primary)     Depends on: U-01, SP-01
Flags: **critical** (R1: terminal regressions under React 19) · hot-path: no · ai: no
Estimate: M

## Goal
Close the critical Next advisories and get an env-independent build, with the old terminal still working.

## ACs covered
PLAT-AC-01, PLAT-AC-02, PLAT-AC-03, PLAT-AC-04, PLAT-AC-07

## Scope
1. `next@16.4.6`, `react@19`, `react-dom@19`, matching `@types/react*`; run `@next/codemod` (async request APIs, removed APIs). No `--force` or `--legacy-peer-deps`; peer conflicts are fixed by a compatible version or by removing the unused dep (US-01).
2. Non-major dev bumps so CG10 passes (RQ-08 a): vitest/coverage 3.2.x patch, Playwright ≥ 1.55.1.
3. Lazy, guarded Supabase client (`lib/supabase.ts`): created on first server use; missing env → analytics no-op, no throw (F-07).
4. Remove the `images` block from `next.config.js` (F-22).
5. Fix type errors the upgrade causes in product code (e.g. `useRef` typing). Terminal behaviour unchanged.

Out of scope: route groups (U-03), headers (U-11), `poweredByHeader` (U-11).

## Files touched
`package.json`, `package-lock.json`, `next.config.js`, `lib/supabase.ts`, `app/api/analytics/route.ts` (call the lazy getter), files the codemod touches, `tsconfig.json` if required by Next 16, `next.config.test.ts` (new, PLAT-AC-07), `CHANGELOG.md`.

## Commits (small)
1. `build(U-02): next 16.4.6 + react 19` (lockfile + codemod output only)
2. `fix(U-02): react 19 type fixes`
3. `fix(U-02): lazy supabase client; build without env`
4. `chore(U-02): drop images config; dev tool bumps`

## Interfaces
- `getSupabase(): SupabaseClient | null` (server only; `null` when env is missing).

## Definition of Done
- ACs pass; `npm run gates` green with CG1 in an empty env.
- Robustness check (critical): Playwright smoke of the old terminal `/` passes; manual checklist (theme persists, chat opens, `help`) with screenshots.
- Rule-parity notes from SP-02 still hold under Next 16.
- Review clean; CHANGELOG.

## Patterns used
- Codemod-driven migration (mechanical changes separated from hand fixes).
- Lazy initialisation with a null fallback (fail-soft optional dependency).
