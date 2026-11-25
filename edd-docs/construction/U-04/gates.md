# U-04 Terminal PII strip + chat off: gate record

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Tree:** `0c3b05c` · **Unit base:** `ffa7f1c` (`base.txt`)
- **Run:** `npm run gates -- --unit U-04` in a detached scratchpad worktree at `0c3b05c` (`npm ci`, no Supabase env, no `.env*` file).
- **Runner exit 0. All 19 enforced gates pass**, including the two new gates, `CG10_pii_scan` and `CG10_groq`.
- Earlier run at `82bd8bb` failed on three gates; each was fixed in `0c3b05c` without changing the gate:
  - **CG4:** the new scripts named source folders literally, breaking the U-01 rule that folder names come from `paths.mjs`.
  - **CG5:** diff lines were 37/74 (50 %).
  - **deps:** `zod` was unused once the chat route was gone.

| Gate | Enforce | Status | Result (trimmed) |
|------|---------|--------|------------------|
| CG1_build | yes | **PASS** | Build with no env; routes `/`, `/_not-found`, `/api/analytics`, `/terminal` (`/api/chat` is gone) |
| CG10_pii_scan | yes | **PASS** | CONT-AC-14: 34 served files, 0 matches; allow-list has 3 entries (library constants) |
| CG10_groq | yes | **PASS** | TERM-AC-10: 299 files (source + `.next/server` + `.next/static`), 0 hits |
| CG2_lint | yes | **PASS** | 0 errors; **94 warnings** (was 109) ≤ ceiling 109 |
| CG3_types | yes | **PASS** | `tsc --noEmit` 0 |
| CG4_tests | yes | **PASS** | vitest 218/218 ×3; node 186/186 |
| CG5_coverage | yes | **PASS** | Diff vs `ffa7f1c`: lines 64/74 (86.5 %), branches 5/5 |
| CG7_complexity | yes | **PASS** | 0 error-level |
| CG9_import_graph | yes | **PASS** | 0 unreachable modules (the dead `http.ts` was deleted); PLAT-AC-12 now also covers `e2e/` and `scripts/*.test.mjs` imports |
| renames | yes | **PASS** | PLAT-AC-10: 17 declared exceptions (U-02 + U-04), including 2 declared deletions |
| CG10_audit | yes | **PASS** | 0 high, 0 critical |
| CG10_signatures | yes | **PASS with EX-01** | unchanged |
| CG10_gitleaks_history / tree | yes | **PASS** | no leaks |
| CG10_sbom, CG14_docs, spec, deps, gitignore | yes | **PASS** | spec: 36 cited, 56 pending; deps: 0 unused |
| lighthouse | no | FAIL (report-only) | `/`: 100 / 100 / 96 / **SEO 90** (U-06/U-07), LCP 768 ms, TBT 88 ms |
| view-source | no | FAIL (report-only) | 0 expected strings yet (U-07) |

## Other evidence
| Check | Result |
|-------|--------|
| Playwright prod (`e2e-prod.txt`, no Supabase env, port 3232) | **PASS 21/21**. New tests: TERM-AC-07 (`/api/chat` GET and POST → 404), TERM-AC-08 (chat shows the unavailable text, 0 `/api/chat` requests, 0 page errors), TERM-AC-11 (`contact` shows LinkedIn and GitHub; the page DOM has no email, phone, `mailto:`, `tel:` or `wa.me`) |
| Playwright dev (`e2e-dev.txt`) | **PASS 2/2**: 0 React warnings |
| pii-scan proves it catches real PII | On the first U-04 build it flagged the terminal prompt `tijo@tijothomas.dev`, an email-shaped string that the source-level test had missed. Fixed at the source (`5964c17`). |
