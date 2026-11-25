# U-01 Walking skeleton: gate record

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Tree:** `c9683ad` · **Unit base:** `35521e2` (`base.txt`)
- **Run:** `npm run gates -- --unit U-01`, in a fresh detached scratchpad worktree at that commit (`npm ci` on npm 11.21.3, then `npm ls` exit 0 with 0 invalid, missing or extraneous packages), so the owner's `next dev` (:3100) `.next/` is not touched. gitleaks 8.30.1 is found by `require-tool.mjs` in the WinGet packages folder. Env: `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x` (the empty-env build is U-02).
- **Runner exit 1.** The only failing enforced gate is **CG10_audit**, which is covered by waiver **W-01** (`edd-docs/audit.md`: allowed to fail in U-01 and U-03, must pass at U-02 PG5). 15 of 16 enforced gates pass. The two report-only gates run end to end.
- Evidence: `gates/<id>.json` for every gate (output tail with the repo root shown as `.` and the home folder as `~`), plus `lint.json`, `sbom.cdx.json`, `gitleaks-{history,tree}.json` (both `[]`), `coverage/coverage-diff.json`, `lighthouse/lighthouse.json` and `view-source.json`. The `.log` files and raw coverage maps are git-ignored.

| Gate | Enforce | Status | Time | Result (trimmed) |
|------|---------|--------|------|------------------|
| CG1_build | yes | **PASS** | 29.1 s | `next build` exit 0 |
| CG2_lint | yes | **PASS** | 1.6 s | PLAT-AC-14: 132 files, 0 errors, 109 warnings ≤ ceiling 109, **0 outside legacy-terminal**, 473 ms |
| CG3_types | yes | **PASS** | 4.3 s | `tsc --noEmit` 0 errors |
| CG4_tests | yes | **PASS** | 28.4 s | PLAT-AC-05 7/7; vitest 78/78 ×3; `node --test scripts/*.test.mjs` **72/72** |
| CG5_coverage | yes | **PASS** | 6.8 s | diff against `35521e2`: lines/branches n/a, because 0 changed instrumented source lines (tooling-only unit) |
| CG7_complexity | yes | **PASS** | 1.1 s | PLAT-AC-16: CG7 limits are Oxlint errors, 0 errors |
| CG9_import_graph | yes | **PASS** | 0.2 s | PLAT-AC-11/12 5/5; 0 unreachable modules |
| CG10_audit | yes | **FAIL (waived W-01)** | 5.7 s | 19 advisories (3 moderate, 12 high, 4 critical), all pre-existing; `next` 14 is critical. Fixed by U-02 (Next 16.4.6) |
| CG10_signatures | yes | **PASS with 1 exception** | 16.2 s | PLAT-AC-25: 319 registry signatures and 30 attestations verified. Exception: see below |
| CG10_gitleaks_history | yes | **PASS** | 2.6 s | PLAT-AC-25 / RR-8: full history, `no leaks found` |
| CG10_gitleaks_tree | yes | **PASS** | 2.1 s | PLAT-AC-25: working tree with `--config .gitleaks.toml`, `no leaks found` |
| CG10_sbom | yes | **PASS** | 0.2 s | PLAT-AC-25: `gates/sbom.cdx.json`, CycloneDX 1.5 with serialNumber; all direct deps present |
| CG14_docs | yes | **PASS** | 0.3 s | README.md and CHANGELOG.md changed since `35521e2` |
| spec | yes | **PASS** | 0.8 s | PLAT-AC-19 4/4: 92 active + 1 retired, 11 cited (titles/check strings only), 81 pending |
| deps | yes | **PASS** | 0.2 s | PLAT-AC-13: 0 unused dependencies |
| gitignore | yes | **PASS** | 0.2 s | PLAT-AC-18: `specs/home.md` tracked, not ignored |
| lighthouse | no | FAIL (report-only) | 57.6 s | mobile median of 3: Perf 92, **A11y 90**, BP 96, SEO 100, CLS 0, LCP 2196 ms, **TBT 304 ms** |
| view-source | no | FAIL (report-only) | 1.7 s | `/` 200; 0 expected strings configured (a vacuous pass is not allowed). U-07 supplies them |

## CG10_signatures registry exception
| Package | Fault | Verified instead | Since | Re-check by |
|---------|-------|------------------|-------|-------------|
| `@oxlint/binding-win32-x64-msvc@1.95.0` | `GET https://registry.npmjs.org/-/npm/v1/attestations/@oxlint%2fbinding-win32-x64-msvc@1.95.0` returns `200 text/plain "OK"`, so `npm audit signatures` aborts with `FETCH_ERROR` (npm 11.21.3). The Linux binding, `oxlint@1.95.0` and binding 1.94.0 return valid JSON. | The registry ECDSA signature is verified against `/-/npm/v1/keys` and the integrity matches the lockfile. The full `npm audit signatures` then passes with only that folder moved aside. | 2026-11-24 | **U-11** |

`scripts/audit-signatures.mjs` passes only when this listed fault is the sole error; any other error fails the gate. The same fault hit `ast-v8-to-istanbul@0.3.5`. That one is fixed by moving the lockfile to 0.3.12, which is in range and serves valid attestations.

## Other evidence
| Check | Result |
|-------|--------|
| `npm run test:e2e` (`PW_CHANNEL=chrome`, free port; first run, tree `5b06643`) | **PASS** 1/1: `U-01 smoke` (`/` 200, terminal textbox, `help` → PORTFOLIO COMMANDS, 0 page errors) |
| "Before" Lighthouse, local `/` build → `lighthouse-before.json` (+ median report) | median Perf 89, A11y 90, BP 96, SEO 100, CLS 0, LCP 2305 ms, TBT 368 ms |
| FR-069 / US-23 production baseline `https://tijothomas.dev/` → `baseline-lighthouse/production.json` | median Perf 94, A11y 90, BP 100, SEO 100, CLS 0, LCP 1964 ms, TBT 250 ms |
| Main checkout (no build) | vitest 78/78, `tsc` 0, `npm run lint` exit 0 (0 errors), `node --test scripts/*.test.mjs` 72/72 |

Local Lighthouse Performance varies from run to run (86–98 across sessions). Accessibility is a stable 90 everywhere; that is the U-06/U-09 target.
