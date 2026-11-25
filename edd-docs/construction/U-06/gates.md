# U-06 Home shell: gate record

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Tree:** `8607725` (after the review fixes) · **Unit base:** `813ab51` (`base.txt`)
- **Run:** `npm run gates -- --unit U-06` and `PW_CHANNEL=chrome npx playwright test`, both in a detached worktree in the system temp folder (`npm ci`, no Supabase env, no `.env*` file).
- **Runner exit 0. All 21 enforced gates pass**, including the new gates `use_client` and `literals`.
- **History:**
  - The first run at `be87034` failed only CG14_docs (README not updated). That was fixed in `a773f38`.
  - This run follows the review fixes (`5c84fbe`, `8607725`) and closes U-06 review #1.

| Gate | Enforce | Status | Result (trimmed) |
|------|---------|--------|------------------|
| CG1_build | yes | **PASS** | Build with no env |
| CG10_pii_scan | yes | **PASS** | CONT-AC-14: 35 served files, including `public/`, 0 matches. The review-hardened phone rules (no line crossing; dotted numbers flagged) produce no new false positives on the real build. |
| CG10_groq | yes | **PASS** | TERM-AC-10 |
| use_client | yes | **PASS** | HOME-AC-03: 16 site modules, 0 `"use client"`, only allowed packages, every local import resolves. `/` is in `prerender-manifest.json` (static). |
| literals | yes | **PASS** | CONT-AC-12: TSX parsed; 8 files in `src/components` and `src/app/(site)`, 0 literals over 3 words |
| CG2_lint | yes | **PASS** | 0 errors; 94 warnings, all in legacy-terminal (ceiling 109); 728 ms |
| CG3_types | yes | **PASS** | Includes the `@ts-expect-error` content guards |
| CG4_tests | yes | **PASS** | vitest ×3 green (284 tests); node 219/219 |
| CG5_coverage | yes | **PASS** | Diff vs `813ab51`: lines 137/138 (99.3 %), branches 17/17 |
| CG7_complexity, CG9_import_graph, renames | yes | **PASS** | Keep-list staleness check passes (4 U-05 entries still unreachable until U-07) |
| CG10_audit, signatures (EX-01), gitleaks ×2, sbom | yes | **PASS** | unchanged |
| CG14_docs, spec, deps, gitignore | yes | **PASS** | spec: 41 pending |
| lighthouse | no | FAIL (report-only) | `/` mobile median of 3: performance 99, accessibility 100, best practices 96, **SEO 90** (U-09 adds metadata). CLS 0, LCP 779 ms, TBT 114 ms. |
| view-source | no | FAIL (report-only) | 0 expected strings configured. U-07 derives them from `src/content` and enforces the gate. |

## Browser tests (`e2e-prod.txt`)
**23/23 pass** against `next start`. The tests for `/`:
- HOME-AC-26: a fresh context gets 0 cookies, an empty `document.cookie`, and empty local and session storage.
- HOME-AC-01 and HOME-AC-11: one `h1`, and the skip link is the first Tab stop (`#main`).
- HOME-AC-05: no `theme-*` class, even with the terminal theme set in local storage.
- U-03/U-06: status 200, `lang="en"`, one `main`, 0 page errors, and no terminal widgets.

## Manual visual check (DoD)
`screenshots/home-360.png` and `screenshots/home-1440.png` were compared with `Main.dc.html`. There is no horizontal scroll at either width. Headings were set to weight 700 after the first screenshot.
