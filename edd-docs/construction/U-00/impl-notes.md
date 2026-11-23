# U-00 Baseline purge: implementation notes (EDD stage 2.2)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **ACs:** PLAT-AC-05, PLAT-AC-11, PLAT-AC-12, PLAT-AC-13, PLAT-AC-17

## Commits
| # | Hash | Message |
|---|------|---------|
| 1 | `202a7b7` | chore(U-00): delete unreachable and /v2-only modules |
| 2 | `bf319d4` | chore(U-00): remove storybook |
| 3 | `e0d2e45` | test(U-00): vitest alias, include globs and single-run test script |
| 4 | `cda8ec6` | test(U-00): rewrite Icon and Text tests against the real components |
| 5 | `c828883` | chore(U-00): drop unused dependencies |

## What changed
- `unreachable.txt` was written with `node scripts/check-unreachable.mjs --exclude-entry app/v2/page.tsx --list` **before** any deletion: 82 modules (58 audited + 24 `/v2`-only). The keep-list is empty (R7: no string or `next/dynamic` loads remain).
- Deleted `app/v2/page.tsx`, the 82 modules, the 14 test files from test plan §3.1, and the 23 `*.stories.*` files. The stories whose subjects were deleted went in commit 1, the rest in commit 2. `.storybook/`, `stories/` and `vitest.shims.d.ts` are also gone.
- `package.json`: removed the `storybook` and `build-storybook` scripts, the `eslintConfig` (`plugin:storybook/recommended`) and these deps: `storybook`, `@storybook/*` ×6, `@chromatic-com/storybook`, `eslint-plugin-storybook`, `@vitest/browser`, `gsap`, `zustand`, `playwright`. `test` is now `vitest run`. Added `test:watch` (`vitest`) and `test:scripts` (`node --test scripts/*.test.mjs`).
- `vitest.config.ts`: the `@` alias points to the repo root. Include is `{app,components,terminal,content,lib}/**/*.test.{ts,tsx}` plus the temporary `{features,widgets,shared}/**/*.test.{ts,tsx}` until U-03. The Storybook plugin is gone and `.claude/**` is excluded.
- `tsconfig.json`: `.claude` was added to `exclude`, because agent worktrees under `.claude/worktrees` hold `.ts` files that `**/*.ts` would otherwise pick up.
- `shared/ui/atoms/Icon.test.tsx` was rewritten against the six named exports (52 tests, from `describe.each`). `Text.test.tsx` was rewritten against the real cva API (26 tests). **No component changes.** No real bugs were found. One minor note: `IconProps.name` is declared but never used, so it is spread onto `<svg name>`. That is harmless and was left as is.
- I deleted the local, gitignored `.next/types/app/v2` because its stale generated types broke `tsc` after `app/v2` was removed. A clean checkout does not have it.
- `.eslintrc.json` is untouched. U-01 replaces it with oxlint.

## Deviations from the test plan
- Tests: there are **79**, against the plan's guideline of "≤ 44". Icon covers all six exports through `describe.each` (8 cases × 6, plus 4). This is more coverage of the same module, not scope creep.
- Lint shows 3 warnings, down from the baseline's 4, because one was in deleted code.
- `specs/pending.txt` is unchanged. U-00's IDs (PLAT-AC-05/11/12/13/17) were never in it (87 IDs = 93 − 5 cited − CONT-AC-09).

## Open DoD items (not done by the developer)
- Manual smoke of `/` (load, `help`, theme toggle, chat opens) with screenshots in this folder. The build succeeds and `/` is unchanged (no reachable module was touched), but nobody has taken screenshots yet.
- CHANGELOG entry: the repo has no `CHANGELOG.md` yet.

## Evidence (trimmed)

```
$ node scripts/check-unreachable.mjs
PASS PLAT-AC-11 listed unreachable paths do not exist
PASS PLAT-AC-11 import graph has 0 unreachable modules in components, terminal, lib, features, widgets, shared/
PASS PLAT-AC-12 no test imports or tests a deleted/unreachable module
entries: app/api/analytics/route.ts, app/api/chat/route.ts, app/layout.tsx, app/page.tsx
modules: 92, reachable: 92, unreachable: 0
exit 0

$ node scripts/check-deps.mjs
PASS PLAT-AC-13 package.json has 0 unused dependencies
exit 0

$ node scripts/check-vitest-config.mjs
PASS PLAT-AC-05 npm run test runs `vitest run`
PASS PLAT-AC-05 vitest config exists
PASS PLAT-AC-05 vitest config has no Storybook plugin or import
PASS PLAT-AC-05 vitest config resolves the '@/' alias
PASS PLAT-AC-05 test.include covers {app,components,terminal,content,lib}/**/*.test.{ts,tsx}
PASS PLAT-AC-05 a test importing through '@/' loads (lib/vitest-alias.test.ts)
PASS PLAT-AC-05 npm run test passes 3 consecutive runs
exit 0

$ node --test "scripts/*.test.mjs"
✔ PLAT-AC-17 repo has no *.stories.* files
✔ PLAT-AC-17 package.json has no storybook or build-storybook script
✔ PLAT-AC-17 package.json has no storybook, @storybook/* or @chromatic-com/storybook dependency
✔ PLAT-AC-17 no Storybook config dir, eslint-plugin-storybook or plugin:storybook ESLint config remains
ℹ tests 4  ℹ pass 4  ℹ fail 0
exit 0

$ npx vitest run
 ✓ lib/vitest-alias.test.ts (1 test)
 ✓ shared/ui/atoms/Icon.test.tsx (52 tests)
 ✓ shared/ui/atoms/Text.test.tsx (26 tests)
 Test Files  3 passed (3)
      Tests  79 passed (79)
exit 0

$ npm run type-check
> tsc --noEmit
exit 0            # 0 errors (baseline 139)

$ npm run lint
> next lint
./components/Terminal.tsx      561:7  Warning: react-hooks/exhaustive-deps
./components/ThemeProvider.tsx  60:6  Warning: react-hooks/exhaustive-deps
./components/ZoomControls.tsx   51:6  Warning: react-hooks/exhaustive-deps
exit 0            # 0 errors, 3 warnings (baseline 4)

$ NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x npm run build
  ▲ Next.js 14.2.30
 ✓ Generating static pages (6/6)
Route (app)                              Size     First Load JS
┌ ○ /                                    44.8 kB         132 kB
├ ○ /_not-found                          873 B          87.9 kB
├ ƒ /api/analytics                       0 B                0 B
└ ƒ /api/chat                            0 B                0 B
+ First Load JS shared by all            87.1 kB
exit 0            # no /v2 route
```
