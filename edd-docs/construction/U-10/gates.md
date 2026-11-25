# U-10 Privacy notice: gate record

- **Date:** 2026-11-25 · **Branch:** `redesign-home` · **Tree:** `7aeba24` · **Unit base:** `692faaf` (`base.txt`)
- **Run:** `npm run gates -- --unit U-10` in the detached worktree `%TEMP%\tijo-wt-u10` at `7aeba24`. The run started 9 s after that commit, so it includes all the review fixes. No Supabase env and no `.env*` file. Logs: `%TEMP%\tijo-u10-logs2`.
- **Runner exit 0. All 23 enforced gates pass.** Lighthouse is enforced since U-09.
- **Earlier run at `922c2d2`** (before the review fixes) had two red gates:
  - CG14_docs failed because the README had not been updated. The README was updated in `7aeba24`.
  - Lighthouse failed on a median TBT of 184 ms. The reviewer was running vitest on the same machine at the time. On an idle machine the median is 116 ms, and the code that affects `/` is unchanged.

| Gate | Status | Result (trimmed) |
|------|--------|------------------|
| CG1_build | **PASS** | Build with no env |
| CG10_pii_scan | **PASS** | CONT-AC-14: 53 served files, 0 matches |
| CG10_groq | **PASS** | TERM-AC-10: 0 hits (the terminal's "powered by Groq" credit is removed) |
| use_client | **PASS** | HOME-AC-03 / HOME-AC-28: 37 site modules, 0 `"use client"`. `/` and `/privacy` are static |
| literals | **PASS** | CONT-AC-12 |
| CG2_lint | **PASS** | 0 errors. 94 warnings, all in legacy-terminal (ceiling 109) |
| CG3_types | **PASS** | `tsc --noEmit` 0 |
| CG4_tests | **PASS** | vitest ×3 green; node 235/235 |
| CG5_coverage | **PASS** | Diff vs `692faaf`: lines 165/165 (100 %), branches 9/9 |
| CG7_complexity, CG9_import_graph, renames | **PASS** | |
| CG10_audit / signatures (EX-01) / gitleaks history + tree / sbom | **PASS** | |
| CG14_docs, spec, deps, gitignore | **PASS** | spec: 87 cited, 5 pending (all U-11) |
| lighthouse | **PASS** | Mobile median of 3: 99 / 100 / 96 / 100. CLS 0, LCP 920 ms, TBT 116 ms |
| view-source | **PASS** | 104/104 expected strings are whole text nodes. No planned item in the HTML or RSC |

## Other evidence
| Check | Result |
|-------|--------|
| Playwright prod (`e2e-prod.txt`, same worktree, no Supabase env) | **PASS 53/53**, including the new `/privacy`, footer link and terminal modal specs |
| Main checkout at `7aeba24` (2026-11-25) | vitest 41 files, 381/381. node 235/235 |

## Review (`review.md`) status
- **Major #1 fixed** in `7aeba24`: the notice text names the controller, and the render is tested.
- **Minors #2–#9 fixed** in `7aeba24`. The fuller and accurate storage and analytics wording covers #2, #3 and #5. #4 is done, except that the transfer safeguard waits for CMP-07. The terminal key-scan test covers #6, CMP references are limited to `privacy.ts` (#7), "Cookieless Analytics" covers #8, and the legal items are now in `edd-state.md` (#9).
- **Nits #10–#16 are open, for the owner's decision at PG5:**
  - #10 name and LinkedIn duplicated in `privacy.ts`;
  - #11 loose `updated` type;
  - #12 log retention period (owner: confirm the Vercel plan);
  - #13 "no forms" wording;
  - #14 `aria-current` on the footer Privacy link;
  - #15 `/privacy` not in the sitemap;
  - #16 the `check-use-client` header comment.
