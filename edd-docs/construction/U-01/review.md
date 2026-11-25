# U-01 Walking skeleton + gates: code review (EDD stage 2.5)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Range:** `634ee40..91616af` (`git diff 35521e2..91616af -- . ':!edd-docs'`, 10 commits)
- **ACs:** PLAT-AC-14, PLAT-AC-15, PLAT-AC-16, PLAT-AC-18, PLAT-AC-19, PLAT-AC-25
- **Reviewer:** independent reviewer (did not write the code). Nothing was built in the repo. Fixtures and npm dry runs were done in the scratchpad.

## Precondition
`gates.md` is **not** all green. CG10_audit and CG10_signatures FAIL, and CG10_gitleaks_history and CG10_gitleaks_tree are BLOCKED. `audit.md` has no waiver for any of them. The orchestrator asked for the review anyway, so I did it in full. The red gates are recorded as finding 1, and the verdict cannot be "approve" until that finding is closed or waived.

## Re-run by the reviewer (main checkout, Node 24.14, npm 11.21.3, no build)
| Command | Result |
|---------|--------|
| `npm run test:scripts` | 53/53 pass |
| `npm run lint` + `node scripts/lint-report.mjs` | exit 0; 0 errors, 109 warnings (ceiling 109), 0 outside legacy-terminal, 498 ms |
| `npm run spec:check` | 4/4 PASS; 92 active, 1 retired, 11 cited, 81 pending, 29 citing files |
| `check-gitignore`, `check-docs` | PASS |
| `tsc --noEmit` | 0 errors |
| `npm audit signatures` (npm 11.21.3) | FAIL: `FETCH_ERROR` on the attestation for `ast-v8-to-istanbul@0.3.5`. This is a different package from the one in gates.md, so the failure is registry-side and intermittent, not caused by the code |
| `npm ls --all` | no missing or invalid packages, only UNMET OPTIONAL peers. No `eslint*`, `vite-plus` or `@vitest/browser-playwright` in the lockfile |
| `npm install --dry-run` / `--package-lock-only` on a copy (npm 11) | resolves **without** `--legacy-peer-deps`. The only lockfile drift is 3 `dev` → `devOptional` flips |
| gates.mjs fixtures (scratchpad) | require-tool with a missing tool → `BLOCKED`, exit 78, run exit 1 (correct). `enforce: True` / `enforce: yes` / no `enforce` → silently report-only, run exit 0. `--only ,` → 0 gates, "All enforced gates passed", exit 0 |
| PII grep (email/phone/`tel:`/`mailto`) over new files and U-01 evidence | 0 real hits (only base64 noise in the Lighthouse reports) |

Verified correct: the exit-code mapping (0 pass / 78 blocked / anything else, including signal or timeout with `status === null`, is fail), require-tool fails closed, spec-check fails on 0 ACs, view-source fails on 0 expectations, Lighthouse NaN or null scores fail, lint-report fails on a missing `--max-warnings` (NaN), override order (the test override is last and checked by a test), `correctness: error`, the PLAT-AC-14 plugin list, PLAT-AC-15 (no eslint files, deps or scripts), the reserved ports 3000/3100 in both `freePort`s, e2e outside vitest `include`, and exact pins for oxlint, `@playwright/test` and `@testing-library/dom`. Today every cited AC also has a non-comment citation (I checked with comments stripped).

## Findings
| # | Severity | File:line | Finding | Recommendation | Status |
|---|----------|-----------|---------|----------------|--------|
| 1 | **blocker** | `gates.yml:44-55`, `specs/platform.md:53` | **PLAT-AC-25 is not met, and neither is the DoD item "gitleaks full-history result saved (closes RR-8)".** The gitleaks history and tree scans are BLOCKED and `npm audit signatures` FAILs. CG10_audit also FAILs (pre-existing, next critical). None of these is waived in `audit.md`, so `gates.md` is red. | Owner installs gitleaks and runs `npm run gates -- --unit U-01 --only CG10_gitleaks_history,CG10_gitleaks_tree`. For signatures and audit, record explicit waivers in `audit.md` (CG10_audit until U-02; CG10_signatures until the registry or npm issue clears, with a re-check date). Alternatively, split PLAT-AC-25 so the signatures part is tracked as pending. | open |
| 2 | major | `scripts/check-docs.mjs:15` (also `scripts/check-coverage.mjs:70`) | **CG14 will pass vacuously for every later unit.** The base defaults to `merge-base HEAD main`. All units land on `redesign-home`, so once U-01 touched README and CHANGELOG, U-03, U-02 and later units pass CG14 without touching either file. CG5 likewise measures the whole branch rather than the unit, which is not vacuous but mixes units together. | Give the runner a per-unit base: `--base <ref>` / `EDD_BASE` (the unit's start commit), substituted as `{base}` in `gates.yml` for CG5 and CG14. Fail when it is absent. Alternatively, require a CHANGELOG line that names the unit ID. | open |
| 3 | minor | `scripts/gates.mjs:54` | `enforce` fails open: any value other than the literal `true` (missing, `True`, `yes`) makes the gate silently report-only (verified with a fixture). `gates.test.mjs:62` protects only today's file. The risk is when U-07 or U-09 flip lighthouse or view-source. | In `validate()`, reject entries whose `enforce` is not exactly `true` or `false`. | open |
| 4 | minor | `scripts/gates.mjs:20,107` | `--only ,` (or any list that is empty after the filter) runs 0 gates and exits 0 with "All enforced gates passed" (verified). There is also no runner test for the blocked (78) status or for require-tool's missing-tool path. Both work when tested by hand. | Exit 2 when `selected.length === 0`. Add fixture tests for exit 78 → `blocked` → run fails when enforced, and for `require-tool.mjs nosuchtool` → 78. | open |
| 5 | minor | `scripts/oxlint-config.test.mjs:8` | `BASELINE_WARNINGS = 262`, but the ceiling is 109. Raising `--max-warnings` back to 262 would not turn any test red, which contradicts README.md:58 ("may only go down"). | Set it to 109 and lower it with each ceiling drop. | open |
| 6 | minor | `scripts/lint-report.mjs:37-43` | The report has no lower bound on the number of files linted. An over-broad `ignorePatterns` entry (one was just added for `docs/**` and `edd-docs/**`) could make CG2/CG7 pass on 0 files. | Add a check `report.number_of_files > 0` (or ≥ the recorded 115 minus deletions). | open |
| 7 | minor | `scripts/spec-check.mjs:24,59`; `README.md:28` | A citation is any text match in a citing file, so an AC ID in a comment counts (e.g. `paths.mjs:21` "PLAT-AC-05 probe", `oxlint-config.test.mjs:1`). So does a check name in a script that is not wired into `gates.yml`. README says that "every test name" cites. Nothing passes falsely today, but nothing prevents it. | Strip comments before matching, or only count IDs inside `test(`/`it(`/`describe(` titles and `PASS`/`FAIL` check strings. At minimum, make README describe what is actually checked. | open |
| 8 | minor | `gates.yml:52` | `gitleaks dir .` will scan `node_modules/`, `.next/`, `coverage/` and the gate `.log` files. There is no `.gitleaks.toml`, so the first real run is likely to be slow and red on vendor false positives. | Add `.gitleaks.toml` with path allowlists (node_modules, .next, coverage, `edd-docs/construction/*/gates/*.log`) before the owner's first run. | open |
| 9 | minor | `.oxlintrc.json:98`, `scripts/paths.mjs:13` | The `app/api/**` deviation is acceptable for U-01 (two legacy handlers, `/api/chat` removed in U-04, documented in impl-notes). But the glob means any **new** route handler under `app/api/` gets warn-level complexity, `no-explicit-any` and `react/no-danger`. | Narrow it to `app/api/chat/route.ts` and `app/api/analytics/route.ts`, in both places. | open |
| 10 | nit | `scripts/sbom.mjs:46,62` | The output is valid CycloneDX 1.5, but `devOptional` packages are marked `scope: required`, there is no `serialNumber`, scoped names are not split into `group`, and `metadata.tools` uses the array form, which is deprecated in 1.5. | Treat `meta.dev \|\| meta.devOptional` as excluded, and add `serialNumber: urn:uuid:<crypto.randomUUID()>`. | open |
| 11 | nit | `playwright.config.ts:23` | A user-supplied `E2E_PORT` is not checked against the reserved ports, so `E2E_PORT=3100` would aim `next start` at the owner's dev port. | Throw if `RESERVED_PORTS.has(Number(process.env.E2E_PORT))`. | open |
| 12 | nit | `package.json`, `README.md:9` | `--legacy-peer-deps` is needed on npm 9 only (npm 11 resolves cleanly). The gate run used npm 9.8.1, while this shell has 11.21.3. Nothing pins the npm version, so lockfile flags (`dev`/`devOptional`) will churn. | Add `"engines": { "npm": ">=10" }` or a `packageManager` field, and a one-line README note. | open |
| 13 | nit | `edd-docs/construction/U-01/gates/CG10_signatures.json`, `CG5_coverage.json` | The committed evidence holds absolute local paths that include the Windows user folder. | Relativise paths in `outputTail`, or accept it. | open |
| 14 | nit | commits `9e640be`, `95f269e` | `9e640be` leaves `tsc` red (no `@testing-library/dom`), which breaks bisect. The fix is bundled into the e2e commit. This is documented in impl-notes, and messages are otherwise clean and conventional. | No action. Keep dependency fixes in their own commit in future. | accepted |

## Patterns
The recorded patterns (walking skeleton, gates as code, single-source `paths.mjs`, fail-closed tool adapter, spec-to-test traceability) are justified and implemented as described. The fail-closed adapter holds. The weak spots are the fail-open `enforce` parse (finding 3) and the empty selection (finding 4). No over-engineering. The hand-rolled YAML subset is acceptable given that `validate()` is tightened.

**Verdict: changes requested.** 1 blocker (owner action or waiver), 1 major, 7 minor, 5 nit.

## Fixes (EDD 2.2 follow-up, 2026-11-24)
Re-run evidence: `gates.md` (full run at `c9683ad`, npm 11.21.3, gitleaks 8.30.1, base `35521e2`).

| # | Fix | Commit(s) | Status |
|---|-----|-----------|--------|
| 1 | gitleaks history and tree both **PASS** (0 findings). The tree scan uses `.gitleaks.toml` (default rules, allowlist limited to git-ignored output folders). `npm audit signatures` → wrapper with one dated registry exception (`@oxlint/binding-win32-x64-msvc@1.95.0`, attestation endpoint returns `text/plain "OK"`, re-check U-11); `ast-v8-to-istanbul` bumped 0.3.5 → 0.3.12, which clears the same fault for that package. CG10_audit stays FAIL under waiver **W-01** (`audit.md`, until U-02). | `e89e54d`, `c3a93f1`, `4f0eac8` | fixed (audit waived) |
| 2 | Per-unit base: `--base`, then `EDD_BASE`, then `edd-docs/construction/<unit>/base.txt` → `{base}` in CG5 and CG14. The run exits 2 when the base is missing or not a commit. U-01 base = `35521e2`. | `6bc357c`, `c9683ad` | fixed |
| 3 | `enforce` must be exactly `true` or `false`, otherwise config load exits 2 (tests: `True`, `yes`, missing). | `6bc357c` | fixed |
| 4 | `--only` that resolves to 0 gates exits 2. Tests added for exit 78 → `blocked` → run fails, and for require-tool with a missing tool → BLOCKED 78. | `6bc357c` | fixed |
| 5 | `BASELINE_WARNINGS` 262 → 109 (the test title changed with it). | `6f3e299` | fixed |
| 6 | lint-report fails when Oxlint lints 0 files (131 today). | `6f3e299` | fixed |
| 7 | spec-check strips comments. It counts only `test`/`it`/`describe` titles in test files and string literals in gate scripts, and README states exactly that (4 new fixture tests). | `af5d377` | fixed |
| 8 | `.gitleaks.toml` + `--config` on the tree gate. A node:test plants a fake AWS key: it is reported in a normal file and ignored only under `.next/`. | `e89e54d` | fixed |
| 9 | Override and `paths.terminalGlobs` narrowed to `app/api/analytics/route.ts` and `app/api/chat/route.ts`. | `6f3e299` | fixed |
| 10 | SBOM: `serialNumber`, dev/devOptional → `excluded`, optional → `optional`, scoped names split into `group`, 1.5 `tools` object form. | `81a84d3` | fixed |
| 11 | `E2E_PORT` 3000 or 3100 throws in `playwright.config.ts`. | `81a84d3` | fixed |
| 12 | `packageManager: npm@11.21.3`, `engines` (node ≥ 22, npm ≥ 11). The lockfile was regenerated without `--legacy-peer-deps` (fresh `npm ci` + `npm ls` clean on npm 11). | `c3a93f1` | fixed |
| 13 | The runner replaces the repo root and home folder with `.` and `~` in gate output. The committed evidence was regenerated. | `6bc357c` | fixed |
| 14 | No action (accepted). | n/a | accepted |
