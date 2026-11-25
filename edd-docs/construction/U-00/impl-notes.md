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
- ~~Manual smoke of `/` … `/` is unchanged (no reachable module was touched)~~ **Correction (review finding 1):** that claim was false. No reachable module was edited, but deleting `components/*` removed Tailwind classes that reachable `features/`, `widgets/` and `shared/` code still used. The smoke is now done; see "Review fixes" below.
- CHANGELOG entry: the repo has no `CHANGELOG.md` yet (review finding 8c; track with U-01).

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

## Review fixes (2026-11-24, `review.md` → changes requested)

| Finding | Severity | Fix | Commit |
|---------|----------|-----|--------|
| 1 Tailwind content globs | blocker | Added temporary `./features/**`, `./widgets/**`, `./shared/**/*.{ts,tsx}` to `tailwind.config.js` `content` (comment: remove in U-03) | `5a83433` |
| 2 Smoke of `/` | major | Done in scratchpad worktrees (base `89369a6` and HEAD), screenshots kept locally (not committed); results, pixel diff and scripts in `smoke/` | `docs` commit (this file) |
| 3/4 Vacuous checks | minor | `check-unreachable` fails on 0 entries/modules/listed paths (also with `--list`); stories test walks the whole repo; `check-vitest-config` parses `test.include` | `6e0c981` |
| 6 VersionSelector `/v2` | minor | Logged below as a known regression; code not changed | `docs` commit |
| 7 Vacuous Text cases | nit | The responsive case now asserts the tailwind-merge override; the data-attribute case was removed (Text 25 tests, suite 78) | `aaae37a` |
| 5 `@vitest/browser`/`playwright` in lockfile | nit | Left as is. They are optional peers of `vitest`/`@vitest/coverage-v8`, not declared; the U-02 reinstall revisits them | none |

### Finding 1: CSS class diff (proof)
Method: `tailwindcss -c tailwind.config.js -i app/globals.css` built in a scratchpad worktree at base `89369a6` and at HEAD. Class selectors were extracted from both outputs. A removed class counts as "used" when it appears as a whole token in a non-test `.ts`/`.tsx` file under `app, components, features, widgets, shared, lib` at HEAD (all 92 modules are reachable). Script: `smoke/cssdiff.mjs`, output: `smoke/cssdiff.txt`.

```
before fix (202a7b7..e0d2e45 config): base 779 HEAD 245 | removed 534, removed-but-used-by-reachable 422 | added 0
after fix  (aaae37a):                 base 779 HEAD 724 | removed 105, removed-but-used-by-reachable 0   | added 50
MISSING-USED: (none)
```
The reviewer counted 757/413 with a different selector parser. Both counts agree that the result is **0 after the fix**. The 105 removed classes are used only by the deleted modules.

**50 newly enabled classes:** these were latently missing at base, because the classes are in reachable code but were never generated. Check them in the smoke:
`inset-20 ml-1 mr-1 h-6 h-64 translate-y-full cursor-default cursor-not-allowed border-blue-400 border-gray-600/10 border-gray-600/20 border-gray-600/40 border-purple-400 bg-blue-600 bg-green-400/10 bg-purple-400 bg-yellow-400 bg-yellow-600 via-gray-800 to-emerald-500 to-green-500 bg-clip-text px-2.5 pb-2 text-right text-justify text-4xl font-light font-normal lowercase capitalize text-accent-foreground text-blue-600 text-current text-destructive text-foreground text-green-600 text-inherit text-transparent text-yellow-600 opacity-25 shadow-green-500/30 hover:bg-blue-700 hover:bg-destructive/80 hover:bg-primary/80 hover:bg-yellow-700 focus:ring-ring focus:ring-offset-2 md:text-5xl lg:text-6xl`.
Most come from `shared/ui/atoms/{Text,Icon}` cva variants and `shared/ui/molecules/Badge`. None changed a pixel in the smoke states below: the default flows on `/` do not render them, so a change could only show in states the smoke does not open (e.g. gradient text, disabled buttons).

### Finding 2: smoke of `/`
- **Setup:** two detached worktrees under the session scratchpad (base `89369a6` and HEAD `aaae37a`), each with `npm ci`, `next build` and `next start` (base on :3000, HEAD on :3001), env `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x`. The owner's dev server on :3100 was not touched. Only the two started PIDs were stopped afterwards.
- **curl:** base `/` 200; HEAD `/` 200, `/v2` 404 (expected until U-03), `/api/chat` 200.
- **Browser:** headless Chromium 1187 via Playwright 1.55 from the base worktree (`smoke/smoke.cjs`), `reducedMotion: 'reduce'`, viewports 1280×800 and 360×740. Steps: load, type `help` + Enter, open the theme menu and choose the 2nd theme, click the visible chat trigger. Results are in `smoke/smoke-results.json`:

| Target | Viewport | `/` | help | theme (body bg) | chat | page errors |
|--------|----------|-----|------|-----------------|------|-------------|
| base | 1280 | 200 | ok | 4 items; rgb(15,15,15) → rgb(255,255,255) | opened | 0 |
| base | 360 | 200 | ok | same | opened | 0 |
| HEAD | 1280 | 200 | ok | same | opened | 0 |
| HEAD | 360 | 200 | ok | same | opened | 0 |

- **Pixel diff** of base vs HEAD for each step (`smoke/pixdiff.cjs`, output in `smoke/pixdiff.txt`, threshold RGB Δ > 30):
```
desktop-1280-1-load  1909 px (0.186%) rows 315-483
desktop-1280-2-help  5913 px (0.577%) rows 318-652
desktop-1280-3-theme 3586 px (0.350%) rows 328-465
desktop-1280-4-chat  0
mobile-360-1-load    0
mobile-360-2-help    0
mobile-360-3-theme   28 px (0.011%) rows 492-497
mobile-360-4-chat    0
```
I inspected the differing pairs by eye. Every desktop difference sits in the left-edge chat trigger (x < 70), which runs `animate-bounce` (not disabled by reduced motion), plus the `animate-pulse` dot of the hint pill near row 650. These are animation-frame timing differences, not layout or colour changes. The 28 px on mobile is the same kind of pulse. **No visual regression.** Screenshots (`smoke/{base,head}-{desktop-1280,mobile-360}-{1-load,2-help,3-theme,4-chat}.png`) are kept locally only and are not committed, at the owner's request (gitignored). Rerun `smoke/smoke.cjs` to regenerate them.

### Known regression until U-03 (finding 6)
`widgets/VersionSelector/VersionSelector.tsx:29` sets `window.location.href = route`, and `lib/version.ts` still lists `v2.0.0 JARVIS AI` with route `/v2`. On this branch, choosing it in the `/` version dropdown gives a **404**. This is accepted per unit scope 2 (branch only, nothing deployed). U-03 adds the `/v2` redirect. Code is unchanged.

### Process note: build output overwrote the repo `.next`
Before the coordinator's note about the owner's `next dev` on :3100, I ran `npm run build` **in the repo** twice (the first evidence run and the first smoke attempt). That overwrote the repo's `.next/` while the dev server was using it. The dev server still answered 200 afterwards, but if it shows stale or odd chunks, restart it (`next dev` rebuilds `.next`). Every later build (smoke, final gates, CSS) ran in scratchpad worktrees.

### Findings 3/4: negative runs (the hardened checks now fail when they should)
```
$ node scripts/check-unreachable.mjs --root <empty dir>            # exit 1
FAIL PLAT-AC-11 import graph is non-empty (entry points and modules found) (2)
  - 0 route entry points found (wrong --root or app/ moved?)
  - 0 modules found
FAIL PLAT-AC-11 unreachable path lists are readable and non-empty (1)
  - edd-docs/audit/raw/cycles.txt: 0 paths read (missing or reformatted)
$ node scripts/check-unreachable.mjs --root <empty dir> --list     # exit 1 (same graph FAIL)
$ node scripts/check-vitest-config.mjs --root <fixture> --static   # glob only in coverage.include; exit 1
FAIL PLAT-AC-05 test.include covers {app,components,terminal,content,lib}/**/*.test.{ts,tsx}
  - test.include has no glob for app/   … components/ terminal/ content/ lib/
$ touch docs/zz-probe.stories.tsx && node --test "scripts/*.test.mjs"   # removed afterwards
✖ PLAT-AC-17 repo has no *.stories.* files   ℹ tests 4  ℹ fail 1
```
