# U-02 Next 16.4.6 + React 19 upgrade: gate record

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Tree:** `d2bb768` · **Unit base:** `b22401b` (`base.txt`)
- **Run:** `npm run gates -- --unit U-02` in a detached scratchpad worktree at `d2bb768` (`npm ci`, npm 11.21.3, Node 24.14.0). There is **no Supabase env and no `.env*` file**; CG1 now strips the env itself.
- **Runner exit 0.** **17 of 17 enforced gates pass.** **CG10_audit passes**, so waiver **W-01 is closed**. The two report-only gates run end to end.
- An earlier run at `22b65a0` failed **CG5**: diff branches were 10/15 (66.7 %), because the client-present path of the Supabase helpers had no test. Fixed in `d2bb768` by two tests in `src/terminal/lib/supabase.test.ts`. The gate was not changed.

| Gate | Enforce | Status | Time | Result (trimmed) |
|------|---------|--------|------|------------------|
| CG1_build | yes | **PASS** | 10.5 s | `node scripts/build-no-env.mjs`: Next.js 16.4.6 (Turbopack), exit 0. Routes `○ /`, `○ /_not-found`, `ƒ /api/analytics`, `ƒ /api/chat`, `○ /terminal`. Prints `PASS PLAT-AC-03 TERM-AC-06` |
| CG2_lint | yes | **PASS** | 1.7 s | PLAT-AC-14: 165 files, 0 errors, 109 warnings ≤ ceiling 109, 0 outside `src/terminal/**`, 400 ms |
| CG3_types | yes | **PASS** | 4.2 s | `tsc --noEmit` 0 errors (PLAT-AC-04), including the `expectTypeOf` contract and the React 19 `RefObject` fixes |
| CG4_tests | yes | **PASS** | 53.4 s | vitest 210/210; `node --test scripts/*.test.mjs` 154/154 |
| CG5_coverage | yes | **PASS** | 10.0 s | Diff vs `b22401b`: lines 25/25 (100 %), branches 15/15 (100 %) |
| CG7_complexity | yes | **PASS** | 1.0 s | PLAT-AC-16: 0 error-level findings |
| CG9_import_graph | yes | **PASS** | 0.4 s | 99 modules, 0 unreachable, 0 cycles; HOME-AC-04: the site closure has 4 modules and reaches no terminal or Supabase code |
| renames | yes | **PASS** | 0.3 s | PLAT-AC-10: 96 renames; the 4 U-02-edited moved files are declared in `scripts/rename-exceptions.json` |
| CG10_audit | yes | **PASS** | 1.6 s | `--audit-level=high`: 0 high, 0 critical. Residual: 7 moderate in the vitest dev chain (`@vitest/mocker`, `glob`, `minimatch`, `test-exclude`, `sucrase`); the only fix is vitest 5 (major). See impl-notes. |
| CG10_signatures | yes | **PASS with EX-01** | 12.8 s | 293 packages have verified signatures and 55 have attestations; EX-01 is unchanged, re-check at U-11 |
| CG10_gitleaks_history | yes | **PASS** | 1.9 s | no leaks found |
| CG10_gitleaks_tree | yes | **PASS** | 1.3 s | no leaks found |
| CG10_sbom | yes | **PASS** | 0.1 s | `gates/sbom.cdx.json` |
| CG14_docs | yes | **PASS** | 0.3 s | README.md and CHANGELOG.md changed since `b22401b` |
| spec | yes | **PASS** | 0.7 s | PLAT-AC-19: 92 active and 1 retired; 29 cited; 63 pending |
| deps | yes | **PASS** | 0.2 s | PLAT-AC-13: 0 unused dependencies |
| gitignore | yes | **PASS** | 0.2 s | PLAT-AC-18 |
| lighthouse | no | FAIL (report-only) | 48.8 s | `/` mobile, median of 3: Perf 100, A11y 100, BP 96, **SEO 90** (no meta description yet; SEO-AC-01 is U-06/U-07), CLS 0, LCP 799 ms, TBT 90 ms. U-03: 100/100/96/90, LCP 767 ms, TBT 9 ms |
| view-source | no | FAIL (report-only) | 1.0 s | `/` 200; 0 expected strings configured (U-07) |

## Other evidence (scratchpad worktrees, ports 3210, 3211, 3220 and 3221, never 3000 or 3100)
| Check | Result |
|-------|--------|
| Playwright prod (`e2e-prod.txt`, `PW_CHANNEL=chrome`, no Supabase env) | **PASS 18/18**: TERM-AC-06 ×3 (no-env guard; `/terminal` with `help`, 0 errors and 0 `/api/analytics` 5xx; GET and POST 200 no-op), TERM-AC-01 React 19 at 1280 and 360 (0 console errors, 0 React warnings, 0 page errors), TERM-AC-01/02/03/04/05, HOME-AC-05, U-03 smoke and site checks |
| Playwright dev (`e2e-dev.txt`, `playwright.dev.config.ts`) | **PASS 2/2**: the React 19 spec under `next dev`, with 0 React warnings at 1280 and 360 |
| CSS diff (`css-diff.txt`) | **PASS PLAT-AC-06 css-diff 0 missing**. 6 removed and 7 added are `next/font` hashed class names, plus `table` |
| Smoke + pixel diff (`smoke/`) | Base is `b22401b` `/terminal` (Next 14) and HEAD is `/terminal` (Next 16), at 1280 and 360. All steps ok and 0 page errors. **Pixel diff 4.4–20.1 %**, all caused by the font: see impl-notes §Font |
| `.next/static` | 1.2 MB, 12 JS chunks (SP-01: 1.1 MB, 15 chunks) |
