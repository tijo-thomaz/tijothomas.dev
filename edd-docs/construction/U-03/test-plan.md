# U-03 Restructure into `src/`: test plan (EDD stage 2.1)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Base:** `2535185` (`base.txt`) · **Unit:** `edd-docs/inception/units/U-03-route-split-terminal-move.md`
- **ACs (12):** PLAT-AC-06, 08, 09, 10 · TERM-AC-01, 02, 03, 04, 05 · HOME-AC-04, 05 · SEO-AC-03. **Re-verified on `src/`:** PLAT-AC-05, 11, 12, 13, 14, 16.
- **Levels:** `node:test` in `scripts/` (repo checks plus gate-script behaviour on temp fixtures), Vitest colocated under `src/`, and Playwright `e2e/` against `next build && next start`.
- **Run:**
  - `npm run test:scripts` (`node --test scripts/*.test.mjs`)
  - `npm run test` (Vitest; it sees `src/` only once PLAT-AC-05's include switch is done)
  - `npm run test:e2e`, **only in a scratch git worktree** with placeholder Supabase env and `PW_CHANNEL=chrome`. Never in the repo: the owner's `next dev` on :3100 uses `.next/`.
- **No literal folder names in `scripts/`** (U-01 DoD, enforced by `paths.test.mjs`). The layout under test is parsed from the AC text in `specs/platform.md` (`specLayout()`, `specVitest()`, `specTerminalOverride()`, `specTailwindSentinelDirs()` in `scripts/lib/test-utils.mjs`). The "old root folders" come from `git ls-tree <U-03 base>` (`legacyRootDirs()`). If the AC wording changes, the parsers fail loudly.

## 1. Traceability

| AC | Test file | Test (title contains the AC ID) | Level |
|----|-----------|----------------------------------|-------|
| PLAT-AC-06 | `scripts/tailwind-content.test.mjs` | `PLAT-AC-06 a sentinel class used only in src/components/ and one used only in src/terminal/ are both emitted` (real `tailwind.config.js`, temp fixture tree) | gate (node:test) |
| | | `PLAT-AC-06 a sentinel class used only in a pre-U-03 root folder is not emitted (no glob outside src/)` | gate, negative |
| | `scripts/folders.test.mjs` | `PLAT-AC-06 tailwind content globs are all under src/ and cover src/app, components, terminal and content` | unit |
| | | `PLAT-AC-06 DoD tailwind.config.js names no pre-U-03 root folder (temporary U-00 globs removed)` | unit |
| | `scripts/css-diff.test.mjs` (R17) | 9 tests `PLAT-AC-06 css-diff …` (section 3.3) | unit (fixtures) |
| | manual DoD | `css-diff.txt`: base vs HEAD Tailwind build, **0 missing** (section 4) | evidence |
| PLAT-AC-08 | `scripts/folders.test.mjs` | `PLAT-AC-08 git-tracked top-level dirs (excluding dot-dirs) are only the spec root dirs` | unit |
| | | `PLAT-AC-08 the pre-U-03 root source folders are gone from the repo root (tracked and on disk)` | unit |
| | | `PLAT-AC-08 the repo root holds no app code: tracked root files are config, docs or lockfiles only` | unit |
| | | `PLAT-AC-08 .storybook/ does not exist` | unit |
| | | `PLAT-AC-08 src/ exists and contains only the spec children, each of which exists` | unit |
| | | `PLAT-AC-08 src/app has the (site) and (terminal)/terminal route groups, each with its own root layout` | unit |
| | | `PLAT-AC-08 tsconfig.json maps @/* to exactly the spec target (./src/*)` | unit |
| PLAT-AC-09 | `scripts/check-imports.test.mjs` | 12 fixture tests: clean pass; components→terminal (`@/`); lib→terminal (relative `export from`); content→terminal (type-only still fails); terminal→components; terminal→content (`import()`); terminal→lib allowed; content value import fails; 2-module cycle fails; 0 site routes fails | unit (fixtures) |
| | | `PLAT-AC-09 HOME-AC-04 check-imports exits 0 on the real repo` | gate |
| | | `PLAT-AC-09 HOME-AC-04 gates.yml CG9_import_graph runs scripts/check-imports.mjs` (and keeps check-unreachable) | unit |
| PLAT-AC-10 | `scripts/check-renames.test.mjs` | 9 temp-git-repo tests: mv-only passes (`renames: 3`); <90 % in move commit fails; added file in move commit fails; 0 renames fails; later rewrite fails; 1-line path fix passes; exception checked at move commit only, plus `moveCommit` read from JSON; exception without reason or with an unknown path fails; unknown commit fails | unit (fixtures) |
| | | `PLAT-AC-10 scripts/rename-exceptions.json records the U-03 move commit, and check-renames exits 0 on the real repo` | gate |
| | | `PLAT-AC-10 gates.yml has an enforced gate that runs scripts/check-renames.mjs` | unit |
| | manual DoD | `git diff -M --stat <commitA>^ <commitA>` saved in impl-notes (all ≥ 90 %) | evidence |
| TERM-AC-01 | `e2e/terminal.spec.ts` | `TERM-AC-01 /terminal returns 200, help prints the help output, and 0 uncaught errors are thrown` | e2e |
| TERM-AC-02 | `e2e/terminal.spec.ts` | `TERM-AC-02 a theme chosen on /terminal persists across reload via localStorage tijothomas-theme` (Cyber → reload → `html.theme-cyber`, key = `cyber`) | e2e |
| TERM-AC-03 | `src/app/(terminal)/layout.test.tsx` | `TERM-AC-03 robots is index false, follow true …`; `TERM-AC-03 canonical resolves to <siteUrl>/terminal` (layout + page metadata merged, page wins, as Next does) | unit (Vitest) |
| | `e2e/terminal.spec.ts` | `TERM-AC-03 /terminal HTML has robots noindex, follow and canonical https://tijothomas.dev/terminal` (server HTML) | e2e |
| TERM-AC-04 | `e2e/v2-redirect.spec.ts` | `TERM-AC-04 GET /v2 responds 308 with location /terminal` (`maxRedirects: 0`); `TERM-AC-04 following /v2 lands on /terminal with status 200` | e2e |
| TERM-AC-05 | `src/terminal/lib/version.test.ts` | `TERM-AC-05 version 1.x ("v1") routes to /terminal`; `TERM-AC-05 every version route is an existing app route or a configured redirect` (walks `src/app` page files with route groups removed, plus `next.config.js` `redirects()`) | unit (Vitest) |
| | `e2e/v2-redirect.spec.ts` | `TERM-AC-04 TERM-AC-05 the VersionSelector v1 option navigates to /terminal` (waits for the navigation request, not just the URL) | e2e |
| HOME-AC-04 | `scripts/check-imports.test.mjs` | `HOME-AC-04 … a (site) route imports src/terminal` fails; `… reaches @supabase/* transitively (site → components → lib)` fails; `… ignores Supabase use inside src/terminal` passes; plus the real-repo run | unit (fixtures) + gate |
| HOME-AC-05 | `e2e/site-home.spec.ts` | `HOME-AC-05 with localStorage tijothomas-theme=cyber, / renders <html> with no theme-* class` | e2e |
| | `src/app/(site)/layout.test.tsx` | `HOME-AC-05 U-03 has no ThemeProvider or theme-* class and no hidden SEO block` | unit |
| SEO-AC-03 | `src/app/(site)/layout.test.tsx` | `SEO-AC-03 viewport leaves zoom enabled: maximumScale undefined and userScalable not false` | unit (Vitest) |

**AC coverage: 12 of 12 (100%).** `specs/pending.txt` no longer lists these 12 IDs (81 → 69 entries); `spec:check` passes.

### Re-verified ACs (U-00/U-01 owners) and U-03 scope items without an AC
| Item | Test |
|------|------|
| PLAT-AC-05 | `folders.test.mjs`: `PLAT-AC-05 vitest.config.ts resolves @ to ./src`; `… test.include has the spec src glob and only globs under src/ or scripts/`; `PLAT-AC-05 DoD vitest.config.ts names no pre-U-03 root folder in any glob` (also covers `coverage.include`). The existing `check-vitest-config.mjs` (CG4) then runs on `paths.testGlobs`. |
| PLAT-AC-11/12 | `repo-graph.test.mjs`: `@/` resolves through the fixture tsconfig `./src/*`; relative imports still resolve; `check-unreachable` exits 0 on the real repo, with entries including `src/app/(site)/page.tsx` and `src/app/(terminal)/terminal/page.tsx` |
| PLAT-AC-13 | unchanged `check-deps.mjs` (CG `deps`), on `paths.srcRoots` |
| PLAT-AC-14/16 | `folders.test.mjs`: `PLAT-AC-14 paths.terminalGlobs and the Oxlint legacy-terminal override are exactly src/terminal/**`; `PLAT-AC-14 the Oxlint no-danger exception points into src/`. The existing `oxlint-config.test.mjs` + CG2/CG7 also apply. |
| `paths.mjs` → `src/` | `U-03 scripts/paths.mjs points every entry, source, site and test root into src/` (and `testGlobs` = exactly the PLAT-AC-05 glob); `U-03 … names the PLAT-AC-09 layers …`; `U-03 every folder named in paths.mjs layers exists on disk`. The existing `paths.test.mjs` (every path exists, no hard-coded folders) keeps running. |
| `/` hello-world | `src/app/(site)/page.test.tsx` (3: exactly one `main`; no textbox or theme/zoom/sound/version/chat button; no facts or contact strings). `layout.test.tsx`: `lang="en"`, `metadataBase` = `siteUrl` = `https://tijothomas.dev`, not noindex. `e2e/site-home.spec.ts`: 200, lang en, 1 main, 0 page errors; no terminal input, toolbar, chat trigger or `.seo-content`; the theme key is not written. |
| Two root layouts | `U-03 the (terminal) layout is its own root layout: it renders <html> …`; `folders.test`: no shared `src/app/layout.tsx`; `e2e`: `U-03 /terminal is served by the terminal root layout (font-mono body)` |
| Walking-skeleton smoke | `e2e/smoke.spec.ts` retargeted: `U-03 smoke: / …` and `U-03 smoke: /terminal responds 200 with no uncaught page errors` (`playwright-harness.test.mjs` still finds the file) |

## 2. Test data, fixtures and doubles
| Item | Where | Why |
|------|-------|-----|
| Temp fixture trees (`makeFixture`, OS temp dir) | check-imports, css-diff, tailwind-content, repo-graph | Gate scripts must be proven on known-good and known-bad inputs. Writing sentinel files into the repo would trigger the owner's `next dev` HMR and Tailwind JIT. |
| Temp git repos (30-line files, `git mv`, `core.autocrlf=false`, fixture user via `-c`) | check-renames | Similarity scores are deterministic only with fixed content and no CRLF conversion. Same approach as `gates-runner.test.mjs`. |
| Arbitrary-value sentinels `w-[7101px]`, `w-[7102px]`, `w-[72xxpx]` | tailwind-content | Valid Tailwind that nothing else emits. Built with the **real** `tailwind.config.js`, cwd = fixture (Tailwind 3 resolves globs from cwd). |
| `vi.mock('next/font/google')` | both layout tests | `next/font` exists only under Next's SWC transform (framework boundary). The double returns Next's `{ className, variable, style }` shape. |
| `vi.mock('@vercel/analytics/react')` | both layout tests | Third-party boundary; no network. |
| `vi.mock('../../terminal/page')` | `(terminal)/layout.test.tsx` | Only the route metadata is under test. The terminal app (Supabase client, audio, canvas) is not, and it would throw on the missing env in jsdom. |
| `renderToStaticMarkup` | layout tests | A root layout renders `<html>`, which RTL cannot mount inside a container. |
| Real `next.config.js` `redirects()` via `createRequire` | version.test | TERM-AC-05 "resolves to … a redirect" must use the real config, not a copy. |
| Placeholder env `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=x` | e2e build | Same as U-00 and U-01. The empty-env build arrives in U-02. |
| `localStorage` init script (`tijothomas-theme=cyber`) | HOME-AC-05 e2e | Simulates a returning terminal visitor landing on `/`. |

Determinism: there are no sleeps (Playwright auto-waits, and `expect.poll` for localStorage), no real network in unit tests and no clock or randomness. E2E picks a free port and never uses 3000 or 3100.

## 3. Contracts the tests pin (for the developer)
### 3.1 `scripts/paths.mjs` (commit B)
- `entries`, `srcRoots`, `siteRoots`, `terminalGlobs`, `aliasProbe` are all under `src/`, and `entries` includes `src/app`.
- `testGlobs` = `['src/{app,components,terminal,content,lib}/**/*.test.{ts,tsx}']`.
- `terminalGlobs` = `['src/terminal/**']`.
- **New key** `layers: { site: 'src/app/(site)', components: 'src/components', content: 'src/content', lib: 'src/lib', terminal: 'src/terminal' }`.
- All of these must exist on disk. Placeholders (e.g. `.gitkeep`) are needed in `src/components` and `src/content` until U-05/U-06 fill them.
- `scripts/lib/repo-graph.mjs` `resolveLocal` must resolve `@/x` through `<root>/tsconfig.json` `paths['@/*'][0]` (today it maps `@/x` → `x`).

### 3.2 `scripts/check-imports.mjs` (PLAT-AC-09, HOME-AC-04)
- Usage: `[--root <dir>]`. Every edge type counts: static, `export … from`, `import()`, `require()`.
- Type-only imports still count for the direction rules. `src/content` may hold `import type` / `export type` only.
- HOME-AC-04: the closure of route files under `layers.site` must contain nothing under `layers.terminal` and no module that imports `@supabase/*`.
- Output: `PASS|FAIL <AC-ID> <name>`, failures as `from -> to`. Exit 1 on any FAIL, and also when 0 site routes or 0 modules are found.
- Add it to `gates.yml` CG9 next to `check-unreachable.mjs`.

### 3.3 `scripts/css-diff.mjs` (R17; name as in the unit file; the brief said `check-css-diff.mjs`)
- Usage: `--base <css> --head <css> [--root] [--out]`.
- Class selectors only, unescaped (`md\:text-5xl:hover` → `md:text-5xl`, `px-2\.5`, `min-w-\[180px\]`). Comments and declaration values (`0.5rem`, `.25`) never yield a class.
- "Used" means a whole-token match in non-test code under `paths.srcRoots` (`h-64` does not make `h-6` used).
- Report lines: `base N HEAD M | removed R, removed-but-used U | added A`, `MISSING-USED:`, `ADDED:` (`(none)` when empty), `PASS|FAIL PLAT-AC-06 css-diff U missing`.
- Exit 0 / 1 / 2. Exit 2 when an input is missing or a CSS file has 0 classes.

### 3.4 `scripts/check-renames.mjs` (PLAT-AC-10)
- Usage: `[--root] [--commit] [--min 90]`. The commit defaults to `moveCommit` in `scripts/rename-exceptions.json` (`{ "moveCommit": "<sha>", "exceptions": [{ "path", "reason" }] }`).
- Check 1: the move commit holds only R entries, each ≥ 90 %. Check 2: each moved file is still a rename ≥ 90 % from `<c>^` to HEAD, unless it is listed as an exception. Check 3: every exception has a reason and names a moved path.
- Output ends with a `renames: <n>` line.
- Add an enforced gate to `gates.yml`.
- Note: if commit C rewrites `src/terminal/layout.tsx` heavily (dropping the hidden SEO block), it will fail check 2. Either keep the edit small or list it as an exception with a reason. The second option is visible to the reviewer.

## 4. Manual DoD evidence (not automatable without touching `.next`)
1. **CSS-diff:**
   - Create scratchpad worktrees at `2535185` and at HEAD.
   - Run `node <repo>/node_modules/tailwindcss/lib/cli.js -c tailwind.config.js -i <css> -o out.css` in each: base input `app/globals.css`; HEAD inputs `src/terminal/globals.css` and `src/app/(site)/globals.css`, concatenated.
   - Run `node scripts/css-diff.mjs --base … --head … --out edd-docs/construction/U-03/css-diff.txt`. It must show **0 missing**, and the ADDED list is checked in the smoke.
2. **Smoke + pixel diff:**
   - Run `edd-docs/construction/U-00/smoke/smoke.cjs` with the targets changed to base `/` and HEAD `/terminal`, at 1280 and 360: load, `help`, theme, chat.
   - Then run `pixdiff.cjs`. Only animation-frame differences are allowed.
3. **Manual:** zoom controls and sounds on `/terminal`.
4. **Commit A:** save `git diff -M --stat`.
5. **Accessibility / NFR:** `/` keeps `lang="en"`, exactly one `main` and zoom enabled (SEO-AC-03). There is no hot-path NFR in this unit; Lighthouse stays report-only and is compared with the U-01 baseline in `gates.md`.

## 5. Red run (2026-11-24, tests only, no product code moved)
- **node:test:** `node --test scripts/*.test.mjs` → `tests 129, pass 76, fail 53`. All 72 pre-existing tests still pass. Of the 57 new tests, 4 already pass because they check things that are already true: no `.storybook`, root files are config only, the `src/**` sentinel is emitted, relative resolution works.
  - The 53 failures are all of the expected kind: `scripts/paths.mjs has no layers map yet`, `scripts/check-imports.mjs / check-renames.mjs / css-diff.mjs does not exist yet`, `still at the root: app, components, features, lib, shared, widgets`, `['./*'] vs ['./src/*']`, `tailwind still scans: app, components, features, shared, widgets`, `terminalGlobs [...8 old globs] vs ['src/terminal/**']`, `{ unresolved: 'lib/site' }`, `test.include lacks 'src/{…}'`.
- **Vitest** (scratch config with include `src/**`, because the repo include cannot see `src/` yet; that is PLAT-AC-05): 4 files fail on `Failed to resolve import "./layout" | "./page" | "./version"`. The 78 existing tests pass. Probe: the TERM-AC-05 test run against today's `lib/version.ts` fails with `expected '/v1' to be '/terminal'`.
- **Playwright** (scratch worktree at `72cd489` + new specs, placeholder env, Chrome): 11 fail, 2 pass. The 2 passes are the `/` smoke and the `/` 200 + lang + one-main check, which are true already.
  - `/terminal` → 404 (TERM-AC-01, 02, 03, the U-03 smoke, the font-mono check).
  - `/v2` → 404, not 308 (TERM-AC-04).
  - `/` html class `dark theme-cyber` (HOME-AC-05).
  - The terminal input is present on `/`, and `/` writes `tijothomas-theme=dark`.
- **Side effects until the developer lands commits A–E:** `tsc` (CG3) and `check-unreachable` PLAT-AC-12 (CG9) report the 4 new `src/` test files, because the modules they import do not exist yet. Oxlint on the new files: exit 0.
