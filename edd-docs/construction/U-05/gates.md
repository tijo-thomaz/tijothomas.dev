# U-05 Content layer and flag parser: gate record

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Tree:** `636522e` · **Unit base:** `0d75cb8` (`base.txt`)
- **Run:** `npm run gates -- --unit U-05` in a detached scratchpad worktree at `636522e` (`npm ci`, no Supabase env, no `.env*` file).
- **Runner exit 0. All 19 enforced gates pass on the first run.**

| Gate | Enforce | Status | Result (trimmed) |
|------|---------|--------|------------------|
| CG1_build | yes | **PASS** | Build with no env |
| CG10_pii_scan | yes | **PASS** | CONT-AC-14: 34 served files, 0 matches |
| CG10_groq | yes | **PASS** | TERM-AC-10: 0 hits |
| CG2_lint | yes | **PASS** | 0 errors; 94 warnings, all in legacy-terminal (ceiling 109) |
| CG3_types | yes | **PASS** | `tsc --noEmit` 0. Includes the `@ts-expect-error` content guards |
| CG4_tests | yes | **PASS** | vitest 260/260 ×3; node 189/189 |
| CG5_coverage | yes | **PASS** | Diff vs `0d75cb8`: lines 268/270 (99.3 %), branches 2/2 |
| CG7_complexity | yes | **PASS** | 0 error-level |
| CG9_import_graph | yes | **PASS** | PLAT-AC-09: `src/content` has type-only imports. PLAT-AC-11/12: 0 unreachable; 4 keep-listed modules, each with a reason, until U-07 |
| renames | yes | **PASS** | PLAT-AC-10 |
| CG10_audit | yes | **PASS** | 0 high, 0 critical |
| CG10_signatures | yes | **PASS with EX-01** | unchanged |
| CG10_gitleaks_history / tree | yes | **PASS** | no leaks |
| CG10_sbom, CG14_docs, spec, deps, gitignore | yes | **PASS** | spec: 51 pending (was 56) |
| lighthouse | no | FAIL (report-only) | `/` performance 100; SEO below 95 (U-09) |
| view-source | no | FAIL (report-only) | `/` is still the hello-world page (U-06/U-07) |
