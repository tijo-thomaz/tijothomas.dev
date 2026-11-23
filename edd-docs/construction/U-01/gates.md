# U-01 Walking skeleton: gate record

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Tree:** `5b06643`
- **Run:** `npm run gates -- --unit U-01` in a detached scratchpad worktree at that commit (fresh `npm ci`), so the owner's `next dev` (:3100) `.next/` is not touched. Env: `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x` (the empty-env build is U-02).
- **Runner exit 1.** 14 of 16 enforced gates pass. The four CG10 entries do not: two fail on pre-existing issues and two are blocked because `gitleaks` is not installed. Both report-only gates run end to end.
- Evidence: `gates/<id>.json` for every gate, plus `lint.json`, `sbom.cdx.json`, `coverage/coverage-{diff,summary}.json`, `lighthouse/lighthouse.json` and `view-source.json`. The `.log` files are git-ignored (`*.log`); each JSON keeps the last 40 output lines.

| Gate | Enforce | Status | Time | Result (trimmed) |
|------|---------|--------|------|------------------|
| CG1_build | yes | **PASS** | 32.9 s | `next build` exit 0 |
| CG2_lint | yes | **PASS** | 2.6 s | PLAT-AC-14: Oxlint 0 errors, 109 warnings ≤ ceiling 109, **0 outside legacy-terminal**, wall time 429–800 ms (≤ 5 s) |
| CG3_types | yes | **PASS** | 9.3 s | `tsc --noEmit` 0 errors |
| CG4_tests | yes | **PASS** | 29.9 s | PLAT-AC-05 7/7; vitest 78/78 ×3; `node --test scripts/*.test.mjs` 53/53 |
| CG5_coverage | yes | **PASS** | 9.8 s | diff lines/branches n/a: 0 changed instrumented source lines (tooling-only unit). Suite: lines 3.72 %, branches 86.59 % (for information) |
| CG7_complexity | yes | **PASS** | 2.1 s | PLAT-AC-16: complexity/max-lines/function/params/depth are Oxlint errors outside legacy-terminal, 0 errors |
| CG9_import_graph | yes | **PASS** | 0.2 s | PLAT-AC-11/12 5/5; 4 entries, 92 modules, 0 unreachable |
| CG10_audit | yes | **FAIL** | 7.5 s | 19 advisories (3 moderate, 12 high, 4 critical); production: `next` (critical, fix = 16.4.6), `postcss`, `zod`, `ws`, `nanoid`, `source-map-js`. Pre-existing; the Next upgrade is U-02 |
| CG10_signatures | yes | **FAIL** | 7.9 s | npm 9.8.1 `EEXPIREDSIGNATUREKEY` (`class-variance-authority@0.7.1`, key expired 2025-01-29). This is a client bug. npm 11.6.2 gets past it but then hits a registry `FETCH_ERROR` on the `@oxlint/binding-win32-x64-msvc@1.95.0` attestation |
| CG10_gitleaks_history | yes | **BLOCKED** | 0.3 s | `BLOCKED gitleaks is not installed (not on PATH)`, exit 78 |
| CG10_gitleaks_tree | yes | **BLOCKED** | 0.2 s | same |
| CG10_sbom | yes | **PASS** | 0.2 s | PLAT-AC-25: `gates/sbom.cdx.json`, CycloneDX 1.5, all direct deps present |
| CG14_docs | yes | **PASS** | 0.5 s | README.md and CHANGELOG.md added and tracked |
| spec | yes | **PASS** | 1.5 s | PLAT-AC-19 4/4: 92 active ACs + 1 retired, 11 cited, 81 pending, 0 unknown, 0 stale |
| deps | yes | **PASS** | 0.2 s | PLAT-AC-13: 0 unused dependencies |
| gitignore | yes | **PASS** | 0.2 s | PLAT-AC-18: `specs/home.md` tracked, not ignored |
| lighthouse | no | FAIL (report-only) | 63 s | mobile median of 3: Perf 98, **A11y 90**, BP 96, SEO 100, CLS 0, LCP 2166 ms, TBT 134 ms |
| view-source | no | FAIL (report-only) | 1.5 s | `/` 200; 0 expected strings configured (a vacuous pass is not allowed). U-07 supplies them |

## Other evidence (same worktree)
| Check | Result |
|-------|--------|
| `npm run test:e2e` (`PW_CHANNEL=chrome`, free port) | **PASS** 1/1: `U-01 smoke` (`/` 200, terminal textbox, `help` → PORTFOLIO COMMANDS, 0 page errors), 1.2 min including build |
| "Before" Lighthouse, local `/` build → `lighthouse-before.json` (+ median `.report.{json,html}`) | median Perf 89, A11y 90, BP 96, SEO 100, CLS 0, LCP 2305 ms, TBT 368 ms |
| FR-069 / US-23 production baseline, `https://tijothomas.dev/` → `baseline-lighthouse/production.json` (+ report) | median Perf 94, A11y 90, BP 100, SEO 100, CLS 0, LCP 1964 ms, TBT 250 ms |
| Main checkout (no build) | `vitest` 78/78, `tsc` 0, `npm run lint` exit 0 (0 errors), `node --test scripts/*.test.mjs` 53/53 |

Local Lighthouse numbers vary from run to run (Perf 86–98 across the two local sessions). That is why the gate takes the median.
