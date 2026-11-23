# U-03 Restructure into `src/`: gate record

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Tree:** `992b6ba` · **Unit base:** `2535185` (`base.txt`)
- **Run:** `npm run gates -- --unit U-03`, in a detached scratchpad worktree at `992b6ba` (`npm ci`, npm 11.21.3), so the owner's `next dev` (:3100) `.next/` is not touched. Env: `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x` (the empty-env build is U-02).
- **Runner exit 1.** The only failing enforced gate is **CG10_audit**, covered by waiver **W-01** (allowed to fail in U-01 and U-03; must pass at U-02 PG5). **17 of 18 enforced gates pass.** The two report-only gates run end to end.
- Evidence: `gates/<id>.json` per gate, plus `lint.json`, `sbom.cdx.json`, `gitleaks-{history,tree}.json` (both `[]`), `coverage/coverage-diff.json`, `lighthouse/` and `view-source.json`. `.log` files and raw coverage maps are git-ignored.
- An earlier run at `1566c9c` failed **CG5** (diff lines 44/80 = 55 %): the 36 one-line `@/terminal/...` import rewrites in `src/terminal` had no unit test. Fixed in `992b6ba` by `src/terminal/moved-modules.test.ts` (imports every moved module, so a wrong path fails in Vitest) plus tests for the `/api` and `/terminal` entries. The gate was not changed.

| Gate | Enforce | Status | Time | Result (trimmed) |
|------|---------|--------|------|------------------|
| CG1_build | yes | **PASS** | 26.2 s | `next build` exit 0. Routes: `○ /` 87.2 kB, `○ /terminal` 132 kB, `ƒ /api/analytics`, `ƒ /api/chat`, `○ /_not-found` |
| CG2_lint | yes | **PASS** | 1.3 s | PLAT-AC-14: 158 files, 0 errors, 109 warnings ≤ ceiling 109, **0 outside legacy-terminal (`src/terminal/**`)**, 339 ms |
| CG3_types | yes | **PASS** | 5.8 s | `tsc --noEmit` 0 errors |
| CG4_tests | yes | **PASS** | 37.0 s | PLAT-AC-05 7/7 (probe `src/terminal/lib/vitest-alias.test.ts`); vitest 187/187 ×3; `node --test scripts/*.test.mjs` **129/129** |
| CG5_coverage | yes | **PASS** | 8.0 s | diff vs `2535185`: lines 80/80 (100 %), branches 3/3 |
| CG7_complexity | yes | **PASS** | 0.9 s | PLAT-AC-16: 0 error-level findings |
| CG9_import_graph | yes | **PASS** | 0.7 s | PLAT-AC-11/12 5/5 (99 modules, 0 unreachable; entries all under `src/app/`); **PLAT-AC-09** 5/5 (0 cycles, direction rules, content type-only); **HOME-AC-04** 3/3 (2 site routes, closure 4 modules, no terminal or Supabase) |
| renames | yes | **PASS** | 0.4 s | **PLAT-AC-10** 3/3: move commit `0e8b4e9` = 96 renames, all R100; all still ≥ 90 % at HEAD (lowest R090 `SoundControls.tsx`); 0 exceptions |
| CG10_audit | yes | **FAIL (waived W-01)** | 4.1 s | 19 advisories (3 moderate, 12 high, 4 critical), all pre-existing, unchanged since U-01; `next` 14 critical → U-02 |
| CG10_signatures | yes | **PASS with 1 exception** | 12.0 s | EX-01 `@oxlint/binding-win32-x64-msvc@1.95.0` (see U-01 gates.md), re-check U-11 |
| CG10_gitleaks_history | yes | **PASS** | 2.1 s | `no leaks found` |
| CG10_gitleaks_tree | yes | **PASS** | 1.7 s | `no leaks found` |
| CG10_sbom | yes | **PASS** | 0.2 s | `gates/sbom.cdx.json` |
| CG14_docs | yes | **PASS** | 0.3 s | README.md and CHANGELOG.md changed since `2535185` |
| spec | yes | **PASS** | 0.8 s | PLAT-AC-19 4/4: 92 active + 1 retired, 23 cited, 69 pending |
| deps | yes | **PASS** | 0.2 s | PLAT-AC-13: 0 unused dependencies |
| gitignore | yes | **PASS** | 0.2 s | PLAT-AC-18 |
| lighthouse | no | FAIL (report-only) | 47.8 s | `/` (now the hello-world page) mobile median of 3: Perf **100**, A11y **100**, BP 96, **SEO 90** (no meta description yet: SEO-AC-01 is U-06/U-07), CLS 0, LCP 767 ms, TBT 9 ms. U-01 baseline on the terminal `/`: 92 / 90 / 96 / 100, LCP 2196 ms, TBT 304 ms |
| view-source | no | FAIL (report-only) | 1.0 s | `/` 200; 0 expected strings configured (U-07 supplies them) |

## Other evidence (all in scratchpad worktrees, own ports, never 3000/3100)
| Check | Result |
|-------|--------|
| `npm run test:e2e` (`PW_CHANNEL=chrome`, `E2E_PORT=3217`, tree `1566c9c`) | **PASS 13/13**: TERM-AC-01, 02, 03 (server HTML: `noindex, follow`, canonical `https://tijothomas.dev/terminal`), TERM-AC-04 (308 → `/terminal`, follow → 200), TERM-AC-04/05 VersionSelector v1 → `/terminal`, HOME-AC-05, `/` hello-world checks ×3, font-mono terminal body, smoke `/` and `/terminal` |
| CSS diff (`css-diff.txt`) | **PASS PLAT-AC-06 css-diff 0 missing**: base 693 classes, HEAD 695, removed 0; added `antialiased` (site body) and `block` (see impl-notes) |
| Smoke + pixel diff (`smoke/`) | base `/` vs HEAD `/terminal`, 1280 and 360: all steps ok, 0 page errors; pixel diffs only in animation frames |
| PLAT-AC-10 commit A | `commit-a-renames.txt`: 96 files, 0 insertions, 0 deletions, all R100 |
