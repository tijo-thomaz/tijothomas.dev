# U-01 Walking skeleton: gates, Oxlint, spec gate: test plan (EDD stage 2.1)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Unit:** `edd-docs/inception/units/U-01-walking-skeleton-gates.md`
- **ACs:** PLAT-AC-14, PLAT-AC-15, PLAT-AC-16, PLAT-AC-18, PLAT-AC-19, PLAT-AC-25 (`specs/platform.md`). Stories US-26, US-28, US-23.
- **Nature of the unit:** tooling only, no product code. The executable spec is a set of `node:test` files in `scripts/` (repo-level checks plus behaviour tests of the new gate scripts on temp-dir fixtures), one Playwright smoke test, and gate entries in `gates.yml`. Every test name contains its AC ID, or `U-01` for walking-skeleton scope items that have no AC.
- **Run:** `node --test "scripts/*.test.mjs"` (= `npm run test:scripts`). Playwright: `npm run test:e2e` (once the developer adds the harness).

## 1. Traceability

| AC | Proven by | Test / check name (contains AC ID) | Level |
|----|-----------|------------------------------------|-------|
| PLAT-AC-14 | `scripts/oxlint-config.test.mjs` | `PLAT-AC-14 .oxlintrc.json at the repo root enables react, nextjs, jsx-a11y, typescript and vitest` | unit (node:test) |
| | | `PLAT-AC-14 npm run lint runs oxlint with --max-warnings at or below the 262 baseline` | unit |
| | | `PLAT-AC-14 oxlint is an exact-pinned devDependency` | unit |
| | | `PLAT-AC-14 no rule or category is a warning outside the legacy-terminal override` (also `categories.correctness` = `error`, because Oxlint defaults it to warn) | unit |
| | | `PLAT-AC-14 the legacy-terminal override lists exactly paths.terminalGlobs` (U-03 then changes only `paths.mjs` + the override, to `src/terminal/**`) | unit |
| | | `PLAT-AC-14 the test-file override comes after the legacy-terminal override so it wins` (SP-02 gotcha 7b) | unit |
| | `scripts/gates.test.mjs` | `PLAT-AC-14 PLAT-AC-16 CG2 and CG7 run npm run lint (Oxlint)` | unit |
| | gate CG2 (`npm run lint`) | exit 0, wall time ≤ 5 s, warning count ≤ ceiling; JSON evidence | gate |
| PLAT-AC-15 | `scripts/oxlint-config.test.mjs` | `PLAT-AC-15 repo has no .eslintrc* or eslint.config.* file` | unit |
| | | `PLAT-AC-15 package.json has no eslintConfig key and no eslint* dependency` | unit |
| | | `PLAT-AC-15 no package.json script calls eslint or next lint` | unit |
| PLAT-AC-16 | `scripts/oxlint-config.test.mjs` | `PLAT-AC-16 CG7 limits are error-level Oxlint rules: complexity 10, max-lines 400, function 50, params 4, depth 3` | unit |
| | gate CG7 (`npm run lint`, native rules; no `check-complexity.mjs`, SP-02 finding 3) | 0 errors | gate |
| PLAT-AC-18 | `scripts/check-gitignore.test.mjs` | `PLAT-AC-18 check-gitignore passes on the real repo and prints the AC ID` | gate script, tested |
| | | `PLAT-AC-18 check-gitignore fails and names specs/home.md when .gitignore ignores specs/` | unit (fixture git repo) |
| | | `PLAT-AC-18 check-gitignore fails when specs/home.md exists but is not tracked` | unit (fixture) |
| | | `PLAT-AC-18 check-gitignore passes on a fixture where specs/home.md is tracked and not ignored` | unit (fixture) |
| | `scripts/gates.test.mjs` | `PLAT-AC-18 gates.yml runs scripts/check-gitignore.mjs` | unit |
| PLAT-AC-19 | `scripts/spec-check.test.mjs` | `PLAT-AC-19 spec:check exits 0 when every AC is cited by a unit test, an e2e test or a gate check` | unit (fixture) |
| | | `PLAT-AC-19 spec:check counts AC IDs cited in scripts/*.test.mjs node:test files` (needed for U-00's PLAT-AC-17) | unit |
| | | `PLAT-AC-19 spec:check fails and names an AC that no test or gate cites` | unit (negative) |
| | | `PLAT-AC-19 spec:check fails and names an unknown AC ID cited by a unit test` | unit (negative) |
| | | `PLAT-AC-19 spec:check fails and names an unknown AC ID cited by an e2e test` | unit (negative) |
| | | `PLAT-AC-19 spec:check does not require a citation for a struck-through retired AC` | unit (boundary) |
| | | `PLAT-AC-19 spec:check accepts an uncited AC that is listed in specs/pending.txt` | unit |
| | | `PLAT-AC-19 spec:check fails and names a stale pending.txt entry that a test already cites` | unit (negative) |
| | | `PLAT-AC-19 spec:check fails and names a pending.txt entry that is not an AC in specs/` | unit (negative) |
| | | `PLAT-AC-19 spec:check fails when it finds 0 ACs in specs/ (no vacuous pass)` | unit (negative, R18) |
| | | `PLAT-AC-19 npm run spec:check is defined and runs scripts/spec-check.mjs` | unit |
| | | `PLAT-AC-19 spec:check exits 0 on the real repo` | unit (real repo) |
| | `scripts/gates.test.mjs` | `PLAT-AC-19 gates.yml runs spec:check` | unit |
| PLAT-AC-25 | `scripts/sbom.test.mjs` | `PLAT-AC-25 sbom.mjs writes a CycloneDX sbom.cdx.json listing the direct dependencies` | unit (temp out dir) |
| | `scripts/gates.test.mjs` | `PLAT-AC-25 CG10 runs npm audit, gitleaks over history and working tree, npm audit signatures and the SBOM script` | unit |
| | gate CG10 | 0 gitleaks findings (history + tree), `npm audit signatures` exit 0, `sbom.cdx.json` in the evidence folder | gate |

**AC coverage: 6 of 6 (100%).**

### Walking-skeleton scope items (no AC; test names start with `U-01`)
| Scope item | File | Tests |
|------------|------|-------|
| 1. `scripts/paths.mjs` single source (R18) | `scripts/paths.test.mjs` | exports 5 non-empty string arrays; every folder/fixed path in it exists on disk; `repo-graph.mjs`, `check-unreachable.mjs`, `check-vitest-config.mjs` import `paths.mjs`; **DoD:** no `scripts/**/*.{mjs,js}` except `paths.mjs` has a string literal that is (or starts with) a folder name known to `paths.mjs` (comments stripped; relative imports like `./lib/x.mjs` do not match) |
| 3. `gates.yml` + runner | `scripts/gates.test.mjs` | entries have `id`, `cmd`, `enforce`, `evidence`, no duplicate ids; lists CG1–CG5, CG7, CG9, CG10, CG14, spec, deps, gitignore, lighthouse, view-source; lighthouse + view-source `enforce: false`, all others `true`; CG1 build, CG3 tsc, CG4 vitest **and** `node --test` scripts, CG5 coverage, CG9 `check-unreachable.mjs`, deps `check-deps.mjs`, CG14 a `scripts/*.mjs` docs check; every referenced `scripts/*.mjs` exists; `package.json` has `lint`, `spec:check`, `gates` (`node scripts/gates.mjs`), `test:e2e` |
| 3. runner behaviour (fixture) | `scripts/gates.test.mjs` | exits 0 when enforced gates pass and a report-only gate fails; exits non-zero and names the failing enforced gate; writes one JSON per gate; `--only` runs only the listed ids |
| 4. Playwright harness | `scripts/playwright-harness.test.mjs`, `e2e/smoke.spec.ts` | config `testDir` e2e, `webServer` `next build && next start` (or npm equivalents), `baseURL`; `@playwright/test` exact pin; `test:e2e` = `playwright test`; smoke: `/` → 200, terminal textbox visible, `help` prints `PORTFOLIO COMMANDS`, 0 `pageerror` |
| 5. FR-069 / US-23 baseline Lighthouse | evidence, checked at review | `edd-docs/construction/U-01/baseline-lighthouse/` holds median JSON + HTML of 3 mobile runs on `https://tijothomas.dev/`, or a "not measured" note |
| DoD: gitleaks full history (RR-8), SP-02 in `edd-state.md`, README + CHANGELOG | evidence, checked at review / CG14 | |

## 2. Contracts the tests assume (developer may refine; keep tests in sync)
| Script | Contract |
|--------|----------|
| `scripts/paths.mjs` | `export const paths = { entries, srcRoots, terminalGlobs, testGlobs, siteRoots }`, arrays of POSIX paths/globs relative to the repo root. `srcRoots[0]` must be a folder vitest collects (spec-check fixture puts its unit test there). |
| `scripts/spec-check.mjs` | `node scripts/spec-check.mjs [--root <dir>]`. ACs = bullets `- **<P>-AC-NN**` in `specs/*.md` except `README.md`; retired = `- ~~**<P>-AC-NN**…~~`. Citations from `*.test.*`/`*.spec.*` files, `e2e/**`, and `scripts/**/*.mjs` (gate check names and node:test files). Fails, naming the ID, on: uncited non-pending AC; unknown cited ID; pending ID that is cited or not an AC; 0 ACs. Retired IDs cited are not "unknown". Must not count `specs/` or `edd-docs/` text as citations. |
| `scripts/gates.mjs` | `node scripts/gates.mjs [--root <dir>] [--unit <U-NN>] [--only id1,id2]`. Reads `<root>/gates.yml` (block list `- id: …` with indented `cmd`, `enforce`, `evidence`; flow `- { … }` also read by the test). Runs each `cmd` with `cwd = root`. Writes `<root>/edd-docs/construction/<unit>/gates/<id>.json` with at least `{ id, enforce: boolean, exitCode: number, status: 'pass'|'fail' }`. Exit 0 iff all enforced gates in the run pass; prints failing ids. |
| `scripts/check-gitignore.mjs` | `[--root <dir>]`; `PASS|FAIL PLAT-AC-18 …`; fails if `git check-ignore specs/home.md` prints anything or the file is not tracked (`git ls-files --error-unmatch`). |
| `scripts/sbom.mjs` | `--out <dir>` writes `<dir>/sbom.cdx.json` (CycloneDX 1.x, e.g. `npm sbom --sbom-format cyclonedx`); every direct `dependencies` entry is a component. |
| `gates.yml` | repo root (U-01 "Files touched"; the EDD template's `edd-docs/gates.yml` location is not used). |

## 3. Test data, fixtures, doubles, environment
- **Fixtures:** temp dirs from `fs.mkdtempSync(os.tmpdir()/edd-u01-*)`, deleted in `after()`. Spec fixtures use AC IDs built at runtime (`${'FIX'}-AC-NN`), so the test files never contain an unknown AC ID that the real `spec:check` would flag. Gitignore fixtures are `git init` repos with `core.excludesFile=` cleared (the user's global ignore cannot leak in). Runner fixtures use `node pass.mjs` / `node fail.mjs` (exit 3) as gate commands.
- **Test doubles:** none. The only boundaries are the filesystem, `git` and `node` child processes; all are real and local. No network: the SBOM test reads the lockfile only. Lighthouse, gitleaks and `npm audit` (network) run only as gates, never in tests.
- **Determinism:** no sleeps, no clocks, no random data. `runScript` asserts the script exists first, so a missing script can never make a "must exit non-zero" test pass.
- **No folder literals in tests:** tests derive source folders from `paths.mjs` (`scripts/lib/test-utils.mjs` `loadPaths()`), so the DoD scan also holds for the test files.
- **Environment:** Node 24, git on PATH. `gitleaks` is **not installed** on this machine (the developer must install it for CG10). `e2e/smoke.spec.ts` needs `@playwright/test` + Chromium; until it is installed, `tsc --noEmit` reports TS2307 for that file (tsconfig includes `**/*.ts`).
- **Dev-server safety:** no test runs `next build`. The Playwright webServer builds into `.next`; run `test:e2e` and CG1 only in a scratch worktree while the owner's `next dev` (:3100) runs.

## 4. Negative, boundary and non-functional cases
- Negative: uncited AC, unknown ID (unit and e2e), stale pending (cited), pending not an AC, empty spec set, ignored `specs/`, untracked `specs/home.md`, failing enforced gate, `--only` excluding a failing gate, `warn` outside the override, wrong override order, `--max-warnings` above 262, ranged `oxlint` version.
- Boundary: retired (struck-through) AC uncited → pass; report-only gate fails → runner still exits 0; `--max-warnings` = 262 → pass.
- Authz / user data: not applicable (no app code, no user data).
- Performance: `npm run lint` ≤ 5 s is measured by CG2 (wall time in evidence JSON), not in a unit test (timing in tests is flaky).
- Accessibility: no UI in this unit. The jsx-a11y rules are part of the PLAT-AC-14 plugin check.

## 5. Files written in this stage (tests only; no product code, no `package.json`, `specs/pending.txt` untouched)
`scripts/lib/test-utils.mjs`, `scripts/oxlint-config.test.mjs`, `scripts/paths.test.mjs`, `scripts/gates.test.mjs`, `scripts/spec-check.test.mjs`, `scripts/check-gitignore.test.mjs`, `scripts/sbom.test.mjs`, `scripts/playwright-harness.test.mjs`, `e2e/smoke.spec.ts`.

`specs/pending.txt` still lists PLAT-AC-14, 15, 16, 18, 19, 25. These tests cite them, so the real-repo `spec:check` will report them as stale until the developer removes them (the expected U-01 step).

## 6. Red run (2026-11-24, before any U-01 implementation)
`node --test "scripts/*.test.mjs"` → **53 tests, 5 pass, 48 fail** (pass: 4 × U-00 PLAT-AC-17, plus `U-01 e2e/smoke.spec.ts exists`). U-00 gates unchanged: `check-unreachable` 5/5 PASS, `check-deps` PASS. Every failure is a missing U-01 feature, never a syntax or import error (trimmed):

```
✖ PLAT-AC-14 .oxlintrc.json at the repo root enables react, nextjs, ...   .oxlintrc.json does not exist
✖ PLAT-AC-14 npm run lint runs oxlint with --max-warnings ...             scripts.lint is 'next lint'
✖ PLAT-AC-14 oxlint is an exact-pinned devDependency                      oxlint is not in devDependencies
✖ PLAT-AC-14 the legacy-terminal override lists exactly paths.terminalGlobs   scripts/paths.mjs does not exist yet
✖ PLAT-AC-16 CG7 limits are error-level Oxlint rules ...                  .oxlintrc.json does not exist
✖ PLAT-AC-15 repo has no .eslintrc* or eslint.config.* file               + [ '.eslintrc.json' ]
✖ PLAT-AC-15 package.json has no eslintConfig key and no eslint* dep      + [ 'eslint', 'eslint-config-next' ]
✖ PLAT-AC-15 no package.json script calls eslint or next lint             + [ 'lint' ]
✖ PLAT-AC-18 check-gitignore ... (4 tests)                                scripts/check-gitignore.mjs does not exist yet
✖ PLAT-AC-19 spec:check ... (11 tests)                                    scripts/spec-check.mjs does not exist yet
✖ PLAT-AC-19 npm run spec:check is defined ...                            input did not match /node\s+scripts\/spec-check\.mjs/
✖ PLAT-AC-25 sbom.mjs writes a CycloneDX sbom.cdx.json ...                scripts/sbom.mjs does not exist yet
✖ U-01 gates.yml ... / PLAT-AC-14|18|19|25 gates.yml ... (10 tests)       gates.yml does not exist at the repo root
✖ U-01 package.json defines lint, spec:check, gates and test:e2e          + [ 'spec:check', 'gates', 'test:e2e' ]
✖ U-01 gates runner ... (4 tests)                                         scripts/gates.mjs does not exist yet
✖ U-01 scripts/paths.mjs exports paths ... / exists on disk / DoD scan    scripts/paths.mjs does not exist yet
✖ U-01 U-00 gate scripts read their folders from scripts/paths.mjs        + [ 'scripts/lib/repo-graph.mjs', 'scripts/check-unreachable.mjs', 'scripts/check-vitest-config.mjs' ]
✖ U-01 playwright.config.ts uses testDir e2e ...                          playwright.config.ts does not exist
✖ U-01 @playwright/test is an exact-pinned devDependency ...              @playwright/test missing or not exact-pinned
ℹ tests 53  ℹ pass 5  ℹ fail 48
```

**Passability check (throwaway, scratchpad only, deleted):** a copy of the repo with a stub `paths.mjs` (today's folders), the SP-02 `.oxlintrc.json` shape and minimal reference `spec-check.mjs` / `gates.mjs` / `check-gitignore.mjs` passed all 10 Oxlint/ESLint tests, all 10 spec-check fixture tests, all 4 runner tests and the 3 gitignore fixture tests. With `paths.mjs` in place, the DoD scan named exactly the U-00 literals to move (`check-unreachable.mjs` `AC11_DIRS`, `check-vitest-config.mjs` `PROBE`/`DIRS`, `repo-graph.mjs` `SOURCE_DIRS` and `'app/'`), with no false positives from the test files. The stub `spec:check` on the real tree reported only the six expected stale pending IDs (PLAT-AC-14, 15, 16, 18, 19, 25).
