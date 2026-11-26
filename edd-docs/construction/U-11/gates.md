# U-11 Security headers, site CSP, release checks: gate record

- **Date:** 2026-11-25 · **Branch:** `u11-security-headers` · **Unit base:** `6fedeed` (`base.txt`)
- **Run 1 at `705be85`:** CG1_build FAILED. `'/opengraph-image:suffix*'` is not a valid path-to-regexp source (review blocker #1), so the run was stopped.
- **Run 2 at `d4ce5cf`:** `npm run gates -- --unit U-11` in a fresh worktree (`npm ci`, no env). **23 of 24 enforced gates pass; Lighthouse fails on TBT only** (see below).
- **e2e at `d4ce5cf`:** 64 passed and 5 failed (`e2e-prod-run1.txt`). Every failure was `/_vercel/insights/script.js net::ERR_ABORTED`, caught by the new failed-request check. Off Vercel that path is an HTML 404, and `nosniff` correctly stops the browser from running it as a script. `743b34c` exempts that one path, with the reason written in the test. After that fix, the CSP and header specs pass 16/16 on the same build.

| Gate | Status | Result (trimmed) |
|------|--------|------------------|
| CG1_build | **PASS** | Build with no env and the new `headers()` |
| CG10_pii_scan, CG10_groq | **PASS** | |
| use_client | **PASS** | `/` and `/privacy` are still static (prerender-manifest) |
| CG10_sourcemaps (new) | **PASS** | PLAT-AC-26: 0 `.map` files under `.next/static` |
| literals, CG2_lint, CG3_types, CG4_tests, CG5_coverage, CG7_complexity, CG9_import_graph, renames | **PASS** | |
| CG10_audit, signatures (EX-01), gitleaks history + tree, sbom | **PASS** | |
| CG14_docs, spec, deps, gitignore | **PASS** | spec: 92/92 active ACs cited, 0 pending |
| view-source | **PASS** | |
| lighthouse | **FAIL (TBT)** | Perf 97, A11y 100, BP 96, SEO 100, CLS 0, LCP 925 ms. **TBT 198 ms**, over the 150 ms limit |

## Lighthouse TBT: machine load, not the headers
The same worktree was built twice and measured back to back (`lighthouse-ab/`):

| `next.config.js` | Performance | TBT (median of 3) |
|---|---|---|
| Previous, as released in `3b980a3` (no headers) | 98 | **156 ms (FAIL)** |
| U-11 (headers) | 98 | 174 ms (FAIL) |

- The released config also fails TBT on this machine now, although it measured 116 ms at release time.
- CPU load was about 49 % with nothing of ours running: the owner's `next dev` and other sessions were active, and memory was low earlier today.
- Static response headers add no main-thread work, and CSP parsing is negligible. The 18 ms gap is within run-to-run noise (156 to 232 ms across runs).

**Not yet met:** the DoD requires `npm run gates` to be fully green. To close it, either re-run Lighthouse on an idle machine, or measure the Vercel preview with PageSpeed Insights (owner's choice).
