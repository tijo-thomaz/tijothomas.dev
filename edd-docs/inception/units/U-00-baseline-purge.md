# U-00 Baseline purge (dead code, `/v2`-only code, Storybook)
Stories: US-25, US-27 (primary); US-02 (part)     Depends on: SP-01 (findings only)
Flags: **critical** (a wrongly deleted module could break the terminal; R7) · hot-path: no · ai: no
Estimate: M

## Goal
Make the baseline green by deleting code that never runs, together with its tests, then fix the tests that remain. Nothing new is built.

## ACs covered
PLAT-AC-05, PLAT-AC-11, PLAT-AC-12, PLAT-AC-13, PLAT-AC-17

## Scope
1. Re-run the import graph on the branch from the real entry points (`app/page.tsx`, `app/layout.tsx`, `app/api/*`), **treating `app/v2/page.tsx` as removed** (RQ-16 a). Save the final list to `edd-docs/construction/U-00/unreachable.txt` (it will be longer than the 58 baseline entries). Keep any module that is loaded by string or `next/dynamic` and record it (R7).
2. Delete `app/v2/page.tsx`, the 58 baseline modules and the `/v2`-only modules, with their tests and stories. `/v2` returns 404 on this branch until U-03 adds the redirect (branch only; nothing is deployed).
3. Delete Storybook: `.storybook/`, `stories/`, every `*.stories.*`, the `storybook`/`build-storybook` scripts, `storybook`, `@storybook/*`, `@chromatic-com/storybook`, `eslint-plugin-storybook`, and `@vitest/browser` if nothing else uses it.
4. `vitest.config.ts`: `@/` alias, include `{app,components,terminal,content,lib}/**/*.test.{ts,tsx}`, no Storybook plugin; `npm run test` = `vitest run`.
5. Fix the remaining failing tests (assertions only; no product-code changes beyond what a test exposes as a real bug, which is logged).
6. Remove dependencies the usage check reports as unused (RQ-22 a; e.g. `gsap`, `zustand`).

Out of scope: moving files (U-03), Next upgrade (U-02), ESLint removal (U-01), Tailwind globs (U-03, needs `terminal/`).

## Files touched
`app/v2/page.tsx` (delete); `components/**`, `features/**`, `widgets/**`, `shared/**`, `lib/**` (deletions per list); `.storybook/`, `stories/` (delete); `vitest.config.ts`, `vitest.shims.d.ts`, `vitest.setup.ts`; `package.json`, `package-lock.json`; `scripts/check-unreachable.mjs`, `scripts/check-deps.mjs` (new, plain Node, no new deps).

## Commits (small)
1. `chore(U-00): delete unreachable and /v2-only modules` (deletions only, revertable on its own)
2. `chore(U-00): remove storybook`
3. `test(U-00): vitest alias/include, fix remaining tests`
4. `chore(U-00): drop unused dependencies`

## Interfaces
- `node scripts/check-unreachable.mjs` → exit 1 and prints each listed path that exists or each unreachable module under `components/`, `terminal/`, `lib/` (check names cite PLAT-AC-11/12).
- `node scripts/check-deps.mjs` → exit 1 and names each unused dependency (PLAT-AC-13).

## Definition of Done
- The ACs above pass; their checks print the AC ID.
- `npm run test` passes 3 consecutive runs; `npm run type-check` 0 errors; `npm run build` passes (with placeholder Supabase env; the empty-env build is U-02).
- Manual smoke of the old terminal at `/` (load, `help`, theme toggle, chat opens) with screenshots in `edd-docs/construction/U-00/`.
- `gates.yml` does not exist yet: gate commands are run by hand and their output is saved as evidence. U-01 wires these scripts in.
- Review clean; CHANGELOG entry.

## Patterns used
- Reachability-based dead-code elimination (graph from route entry points, not guesswork).
- Deletion in its own commit (cheap revert if R7 fires).
