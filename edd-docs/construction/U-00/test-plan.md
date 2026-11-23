# U-00 Baseline purge: test plan (EDD stage 2.1)

- **Date:** 2026-11-23 · **Branch:** `redesign-home` · **Unit:** `edd-docs/inception/units/U-00-baseline-purge.md`
- **ACs:** PLAT-AC-05, PLAT-AC-11, PLAT-AC-12, PLAT-AC-13, PLAT-AC-17 (`specs/platform.md`). Stories US-25, US-27, US-02 (part).
- **Nature of the unit:** deletion and config only. There is no new behaviour to unit-test, so the executable spec is a set of **repo-level checks** (gate scripts plus one `node:test` file plus one vitest probe). All of them fail now and must pass after the developer's change. They print the AC ID in every check name, which is what `spec:check` (U-01) needs.

## 1. Traceability

| AC | Proven by | Check / test name (contains AC ID) | Level |
|----|-----------|------------------------------------|-------|
| PLAT-AC-05 | `node scripts/check-vitest-config.mjs` | `PLAT-AC-05 npm run test runs \`vitest run\`` | gate |
| | | `PLAT-AC-05 vitest config exists` | gate |
| | | `PLAT-AC-05 vitest config has no Storybook plugin or import` | gate |
| | | `PLAT-AC-05 vitest config resolves the '@/' alias` | gate |
| | | `PLAT-AC-05 test.include covers {app,components,terminal,content,lib}/**/*.test.{ts,tsx}` | gate |
| | | `PLAT-AC-05 a test importing through '@/' loads (lib/vitest-alias.test.ts)` (runs the probe below) | gate |
| | | `PLAT-AC-05 npm run test passes 3 consecutive runs` | gate |
| | `lib/vitest-alias.test.ts` | `it('PLAT-AC-05 loads a module imported through the @/ alias from a test under lib/')` | unit (vitest) |
| PLAT-AC-11 | `node scripts/check-unreachable.mjs` | `PLAT-AC-11 listed unreachable paths do not exist` (58 paths from `edd-docs/audit/raw/cycles.txt` plus `edd-docs/construction/U-00/unreachable.txt` once the developer writes it) | gate |
| | | `PLAT-AC-11 import graph has 0 unreachable modules in components, terminal, lib, features, widgets, shared/` | gate |
| PLAT-AC-12 | `node scripts/check-unreachable.mjs` | `PLAT-AC-12 no test imports or tests a deleted/unreachable module` | gate |
| PLAT-AC-13 | `node scripts/check-deps.mjs` | `PLAT-AC-13 package.json has 0 unused dependencies` | gate |
| PLAT-AC-17 | `node --test "scripts/*.test.mjs"` (`scripts/storybook-removed.test.mjs`) | `PLAT-AC-17 repo has no *.stories.* files` | unit (node:test) |
| | | `PLAT-AC-17 package.json has no storybook or build-storybook script` | unit |
| | | `PLAT-AC-17 package.json has no storybook, @storybook/* or @chromatic-com/storybook dependency` | unit |
| | | `PLAT-AC-17 no Storybook config dir, eslint-plugin-storybook or plugin:storybook ESLint config remains` (unit scope item 3) | unit |

AC coverage: **5 of 5 (100%)**. DoD items that are not ACs are run by hand and saved as evidence: `npm run type-check` (0 errors), `npm run build` with placeholder Supabase env, manual smoke of `/` with screenshots.

Why `node:test` for PLAT-AC-17: it is `Verify: unit`, but it inspects the repo, not app code, and PLAT-AC-05 limits vitest to `{app,components,terminal,content,lib}`. U-01 already plans `scripts/*.test.mjs`; `spec:check` must scan `scripts/*.test.mjs` and `scripts/*.mjs` check names (note for U-01).

## 2. Files written in this stage (test code only; no product code touched)
| File | Purpose |
|------|---------|
| `scripts/lib/repo-graph.mjs` | Shared plain-Node import graph: walks `app, components, terminal, content, lib, features, widgets, shared`; resolves relative and `@/` specifiers, `import()`/`next/dynamic`, `require()`, `export … from`; entries = Next special files under `app/` (`page`, `layout`, `route`, `not-found`, `error`, `sitemap`, `robots`, `opengraph-image`, …) plus root `middleware`/`proxy`/`instrumentation`. Tests, stories and `.d.ts` are not modules. |
| `scripts/check-unreachable.mjs` | PLAT-AC-11/12 gate (unit Interface). Flags: `--exclude-entry <path>` (simulate a deleted route, RQ-16 a), `--list` (prints the unreachable list for `unreachable.txt`), `--root`. Optional keep-list `scripts/check-unreachable.keep.txt` (`path # reason`) for string-loaded modules (R7). |
| `scripts/check-deps.mjs` | PLAT-AC-13 gate. Usage rules are listed in the file header (imports, `/// <reference types>`, script bins, root-config strings, ESLint extends/plugins, non-optional peers of used deps, `@types/*`, coverage provider). `--verbose` prints why each dep counts as used. |
| `scripts/check-vitest-config.mjs` | PLAT-AC-05 gate. `--runs N` (default 3), `--static` (skip vitest runs). |
| `scripts/storybook-removed.test.mjs` | PLAT-AC-17 unit tests (`node:test`). |
| `lib/vitest-alias.test.ts` | PLAT-AC-05 probe: imports `cn` from `@/lib/utils`. U-05 retargets it to `@/content/profile` (the AC's literal wording) once `content/` exists. |
| `specs/pending.txt` | Q-1: 88 AC IDs with no citing test yet (93 defined − 5 cited by U-00). Sorted, one per line. Each unit deletes its IDs; empty at U-11. |

Test doubles and fixtures: **none**. All checks read the real working tree and `node_modules` (no network, no clock, no randomness). The vitest probe imports a pure function. The gate scripts accept `--root <dir>` so U-01 can add fixture tests for them.

## 3. Test files: delete vs keep

Graph re-run on the branch with `app/v2/page.tsx` treated as removed (`node scripts/check-unreachable.mjs --exclude-entry app/v2/page.tsx --list`): **82 unreachable modules = the 58 audited + 24 `/v2`-only**. The graph reproduces the audit's 58 exactly (diffed). Grep found no non-literal `import()`/`require()` anywhere in app code, and `next/dynamic` is used only in `app/v2/page.tsx`, so the keep-list is empty (R7).

`/v2`-only modules (24, delete with `app/v2/page.tsx`):
`features/terminal/index.tsx`, `features/terminal/model/useTerminal.ts`, `features/terminal/ui/atoms/{TerminalInput,TerminalPrompt,TerminalText}.tsx`, `features/terminal/ui/molecules/{CommandLine,CommandOutput,InputForm}.tsx`, `features/terminal/ui/organisms/{TerminalFooter,TerminalHeader,TerminalHistory}.tsx`, `widgets/SoundControls/{index.tsx,atoms/SoundButton.tsx,atoms/VolumeIcon.tsx}`, `widgets/ThemeControls/{index.tsx,atoms/Backdrop.tsx,atoms/ThemeButton.tsx,atoms/ThemeOption.tsx,molecules/ThemeDropdown.tsx}`, `widgets/ZoomControls/{index.tsx,atoms/Container.tsx,atoms/IconButton.tsx,atoms/ZoomDisplay.tsx,molecules/ZoomControlGroup.tsx}`.

### 3.1 Delete (14 test files: their subject module is dead or `/v2`-only)
| Test file | Subject status | Baseline result |
|-----------|----------------|-----------------|
| `features/chat-assistant/ui/atoms/AnimatedDots.test.tsx` | dead (58) | 7/7 fail |
| `features/chat-assistant/ui/atoms/SendButton.test.tsx` | dead (58) | suite fails to load (`@/` alias) + 7 TS errors |
| `features/chat-assistant/ui/molecules/MessageBubble.test.tsx` | dead (58) | 21/21 fail |
| `features/chat-assistant/ui/organisms/MessageList.test.tsx` | dead (58) | 22/22 fail |
| `shared/ui/atoms/Button.test.tsx` | dead (58) | 9 pass |
| `shared/ui/atoms/Input.test.tsx` | dead (58) | 9/23 fail |
| `features/terminal/ui/atoms/TerminalInput.test.tsx` | `/v2`-only | 11 pass |
| `features/terminal/ui/atoms/TerminalPrompt.test.tsx` | `/v2`-only | 3/12 fail |
| `features/terminal/ui/atoms/TerminalText.test.tsx` | `/v2`-only | 8 pass |
| `features/terminal/ui/molecules/CommandLine.test.tsx` | `/v2`-only | 6 pass |
| `features/terminal/ui/molecules/CommandOutput.test.tsx` | `/v2`-only | 7/17 fail |
| `features/terminal/ui/organisms/TerminalHistory.test.tsx` | `/v2`-only | 19/19 fail |
| `widgets/ThemeControls/atoms/ThemeButton.test.tsx` | `/v2`-only | suite fails to load (`@/` alias) |
| `widgets/ZoomControls/atoms/IconButton.test.tsx` | `/v2`-only | suite fails to load (`@/` alias) |

Also delete all 23 `*.stories.*` files (list printed by the PLAT-AC-17 test), `stories/` (incl. `Configure.mdx`, `assets/`, css) and `.storybook/` (`main.ts`, `preview.ts`, `vitest.setup.ts`), and `vitest.shims.d.ts` (its only content is the `@vitest/browser` type reference, which keeps `@vitest/browser` "used").

Root causes of the deleted groups (for the record; none is fixed): (a) **missing `@/` alias** in `vitest.config.ts` → 3 suites fail to load (`Failed to resolve import "@/lib/utils" from "components/ui/button.tsx"`); (b) **tests written against a different props API** than the component (e.g. `TerminalHistory` gets `history` but maps `output` → `reading 'map'` ×38; chat tests pass strings where `Message` objects are expected → `reading 'split'` ×358); (c) class-name assertions that drifted from the cva variants.

### 3.2 Keep and fix (2 test files; subject reachable from `/` via `features/prompt-shield/ui/ShieldBadge.tsx` and `features/chat-assistant`)
| Test file | Baseline | Root cause | Fix (assertions only) |
|-----------|----------|-----------|-----------------------|
| `shared/ui/atoms/Icon.test.tsx` | 19/19 fail; 1 TS error (`TS2305 Module './Icon' has no exported member 'Icon'`) | The test targets a generic `<Icon name=…>` that does not exist. The module exports `ChevronRightIcon`, `ChevronDownIcon`, `SendIcon`, `ShieldIcon`, `LoadingIcon`, `TerminalIcon` with cva `size`/`variant`. Every render gets `undefined` → "Element type is invalid". | Rewrite against the real named exports (renders an `svg`, applies `size`/`variant` classes, forwards `className` and ref). Drop cases for features the module never had (`name`, rotation, flip, viewBox). |
| `shared/ui/atoms/Text.test.tsx` | 11/24 fail; 6 TS errors | Tests use variants/props not in `textVariants`: `variant="h1"`/`"small"`, `leading`, `tracking`, `decoration`, string `truncate`, theme colours. | Keep the 13 passing cases; rewrite or drop the 11 to the real API (`variant`, `size`, `weight`, `align`, `transform`, `as`). |

These two files live in `shared/`, which is **outside** the PLAT-AC-05 include. Until U-03 moves them into `terminal/`, add a temporary second include glob `'{features,widgets,shared}/**/*.test.{ts,tsx}'` (the check accepts extra globs; PLAT-AC-08 in U-03 removes the dirs). Otherwise they would silently stop running while `tsc` still type-checks them.

New test kept: `lib/vitest-alias.test.ts` (1 test).

## 4. Expected end state (verified by simulation)
A scratch copy of the tree with the planned deletions and config applied (`app/v2/page.tsx`, the 82 modules, the 14 tests, Storybook, `vitest.shims.d.ts`, storybook deps/scripts/`eslintConfig`, `@vitest/browser`; vitest config with alias + both include globs; `"test": "vitest run"`) gives:

| Measure | Baseline | After deletions + config, before test fixes | Target (DoD) |
|---------|----------|----------------------------------------------|--------------|
| Test files (vitest) | 16 (12 fail) | 3 (2 fail) | 3, 0 fail |
| Tests | 198 (118 fail) | 44 (30 fail: Icon 19, Text 11) | ≤ 44 (Icon/Text rewritten), 0 fail, 3 consecutive runs |
| `tsc --noEmit` errors | 139 in 10 files | 7 (Icon 1, Text 6) | 0 |
| Modules / reachable / unreachable | 175 / 117 / 58 | 92 / 92 / 0 | 0 unreachable |
| Story files | 23 + `stories/` + `.storybook/` | 0 | 0 |
| Unused deps (check-deps) | 4 (`@chromatic-com/storybook`, `@storybook/addon-docs`, `@storybook/addon-onboarding`, `playwright`); `gsap`/`zustand` hidden behind dead code | 3: **`gsap`, `zustand`, `playwright`** | 0 (remove all three; U-01 adds `@playwright/test`) |
| PLAT-AC-11/12/17 checks | FAIL | PASS | PASS |
| PLAT-AC-05 checks | FAIL | PASS except "3 consecutive runs" | PASS |

`@testing-library/user-event` is imported only by deleted tests and is not declared in `package.json`. It drops out without any action.

## 5. Negative and boundary cases the checks cover
- A test of a dead module that still imports it, a test whose import no longer resolves (module deleted, test left), and a test whose sibling subject is dead are all reported by PLAT-AC-12. Tests with no sibling subject (e.g. the probe) are allowed if all their imports resolve.
- Barrel files (`index.ts`) that nothing imports count as unreachable; modules reached only via `next/dynamic` count as reachable.
- A route entry that is deleted (`app/v2/page.tsx`) changes the reachable set, which you can preview with `--exclude-entry`.
- A dependency used only through config (`tailwindcss`, `autoprefixer` in `postcss.config.js`; `jsdom` as vitest environment; `tailwind-scrollbar` via `require`), only as a peer (`react-dom`, `postcss`, `eslint`) or only as a bin (`typescript` via `tsc`) is not reported. Optional peers do not count, so `@vitest/browser` is not kept alive by vitest.
- A comment containing an import is ignored. String literals with globs (`'a/**/*.ts'`) survive comment stripping.
- PLAT-AC-05 does not run the suite three times while a config check fails, so the output shows the root cause instead of 3× noise.
- Known limits: `import()` with a non-literal specifier is invisible to the graph (none exist today). Add such modules to `scripts/check-unreachable.keep.txt` with a reason.

Not applicable to U-00: authz (no data or users touched), performance smoke (no runtime change), a11y (no UI change). The manual terminal smoke covers R7.

## 6. Commands
```
node scripts/check-unreachable.mjs                 # PLAT-AC-11, PLAT-AC-12
node scripts/check-deps.mjs                        # PLAT-AC-13 (--verbose for reasons)
node scripts/check-vitest-config.mjs               # PLAT-AC-05 (3 runs of npm run test)
node --test "scripts/*.test.mjs"                   # PLAT-AC-17
node scripts/check-unreachable.mjs --exclude-entry app/v2/page.tsx --list > edd-docs/construction/U-00/unreachable.txt   # scope step 1 (run BEFORE deleting app/v2)
npm run type-check; NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder npm run build
```
Suggest that the developer add `"test:scripts": "node --test scripts/*.test.mjs"` to `package.json` in commit 3. U-01 wires everything into `gates.yml`.

## 7. Red run on the current tree (2026-11-23, trimmed)
```
$ node scripts/check-unreachable.mjs            # exit 1
FAIL PLAT-AC-11 listed unreachable paths do not exist (58)
  - exists: components/Breadcrumbs.tsx  … (58 lines)
FAIL PLAT-AC-11 import graph has 0 unreachable modules in components, terminal, lib, features, widgets, shared/ (58)
FAIL PLAT-AC-12 no test imports or tests a deleted/unreachable module (12)
  - features/chat-assistant/ui/atoms/AnimatedDots.test.tsx tests dead module features/chat-assistant/ui/atoms/AnimatedDots.tsx
  - shared/ui/atoms/Button.test.tsx tests dead module shared/ui/atoms/Button.tsx
  - shared/ui/atoms/Input.test.tsx tests dead module shared/ui/atoms/Input.tsx  …
entries: app/api/analytics/route.ts, app/api/chat/route.ts, app/layout.tsx, app/page.tsx, app/v2/page.tsx
modules: 175, reachable: 117, unreachable: 58

$ node scripts/check-unreachable.mjs --exclude-entry app/v2/page.tsx
FAIL PLAT-AC-11 … 0 unreachable modules … (82)
FAIL PLAT-AC-12 … (28)      # adds the 8 /v2-only test files

$ node scripts/check-deps.mjs                   # exit 1
FAIL PLAT-AC-13 package.json has 0 unused dependencies (4)
  - unused: @chromatic-com/storybook
  - unused: @storybook/addon-docs
  - unused: @storybook/addon-onboarding
  - unused: playwright

$ node scripts/check-vitest-config.mjs          # exit 1
FAIL PLAT-AC-05 npm run test runs `vitest run`
  - scripts.test is 'vitest'
PASS PLAT-AC-05 vitest config exists
FAIL PLAT-AC-05 vitest config has no Storybook plugin or import
  - vitest.config.ts mentions storybook
FAIL PLAT-AC-05 vitest config resolves the '@/' alias
  - vitest.config.ts defines no resolve.alias for '@' (tsconfig paths are not read by Vite)
FAIL PLAT-AC-05 test.include covers {app,components,terminal,content,lib}/**/*.test.{ts,tsx}
  - include has no glob for app/ … components/ … terminal/ … content/ … lib/
FAIL PLAT-AC-05 a test importing through '@/' loads (lib/vitest-alias.test.ts)
  - exit 1
  - No test files found, exiting with code 1
FAIL PLAT-AC-05 npm run test passes 3 consecutive runs
  - skipped: earlier PLAT-AC-05 checks failed

$ node --test "scripts/*.test.mjs"              # exit 1
✖ PLAT-AC-17 repo has no *.stories.* files            (23 story files listed)
✖ PLAT-AC-17 package.json has no storybook or build-storybook script
✖ PLAT-AC-17 package.json has no storybook, @storybook/* or @chromatic-com/storybook dependency
✖ PLAT-AC-17 no Storybook config dir, eslint-plugin-storybook or plugin:storybook ESLint config remains
ℹ tests 4  ℹ pass 0  ℹ fail 4

# Probe with lib/ included but no alias (scratch config) -> fails on the alias, not on syntax:
 FAIL  lib/vitest-alias.test.ts
Error: Cannot find package '@/lib/utils' imported from '…/lib/vitest-alias.test.ts'
```
Green run on the simulated end state: PLAT-AC-11 ×2, PLAT-AC-12, PLAT-AC-17 ×4 and the PLAT-AC-05 config/probe checks PASS. PLAT-AC-13 still lists `gsap`, `zustand` and `playwright` (scope step 6). The PLAT-AC-05 run check fails only on Icon/Text (scope step 5). The existing `npx vitest run` is unchanged by this stage: the probe is not collected until `lib/` is included.

## 8. Notes for the developer and orchestrator
- Write `unreachable.txt` **before** deleting `app/v2/page.tsx` (use `--exclude-entry`). After that, `check-unreachable` checks that every listed path is gone.
- `specs/content.md` still shows CONT-AC-09 as active, but Q-3 retired it. It stays in `pending.txt` until someone strikes it through in the spec (README rule 3); then remove it from the file.
- The PLAT-AC-11 check scans `features/`, `widgets/` and `shared/` in addition to the AC's `components/`, `terminal/` and `lib/`, so that scope step 2 (`/v2`-only modules) is enforced too. That is stricter than the AC.
