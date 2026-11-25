# U-07 Home lists: gate record

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Tree:** `2f2507d` · **Unit base:** `8705b16` (`base.txt`)
- **Run:** `npm run gates -- --unit U-07` and `PW_CHANNEL=chrome npx playwright test`, both in a detached worktree in the system temp folder (`npm ci`, no Supabase env, no `.env*`, `SHOW_PLANNED` unset).
- **Runner exit 0. All 22 enforced gates pass.** `view-source` is enforced from this unit (SEO-AC-09).

## History
1. **`48ac777`:** 22/22 PASS, e2e 25/25. Then the review fixes went in.
2. **`71fef6a`:** **CG1 FAIL.** The Turbopack build stopped on `src/terminal/globals.css` with "The `border-border` class does not exist". The site stylesheet had moved to its own `@config`, while the terminal stylesheet used the implicit default config. In the shared build process, the implicit default could resolve to the site context, so the result depended on build order. It passed at `48ac777`.
   - **Fix:** `9dc2603`, an explicit `@config "../../tailwind.config.js"` in the terminal stylesheet.
   - **Check:** 3 consecutive clean builds.
   - **Regression test:** `2f2507d`, `scripts/site-tailwind.test.mjs`.
   - **Self-heal count:** 1 (fixed in-unit).
3. **`2f2507d`:** this run.

| Gate | Enforce | Status | Result (trimmed) |
|------|---------|--------|------------------|
| CG1_build | yes | **PASS** | Build with no env |
| CG10_pii_scan | yes | **PASS** | CONT-AC-14: 35 served files, 0 matches |
| CG10_groq | yes | **PASS** | TERM-AC-10 |
| use_client | yes | **PASS** | HOME-AC-03: 25 site modules, 0 `"use client"`; `/` static |
| literals | yes | **PASS** | CONT-AC-12: 15 files, 0 literals over 3 words |
| CG2_lint, CG3_types, CG7_complexity | yes | **PASS** | 0 errors; 94 warnings, all in legacy-terminal |
| CG4_tests | yes | **PASS** | vitest ×3 (317); node 229 |
| CG5_coverage | yes | **PASS** | Diff vs `8705b16`: lines 221/221 (100 %), branches 50/50 (100 %) |
| CG9_import_graph | yes | **PASS** | The keep list is empty; the U-05 modules are reachable from `/` |
| renames | yes | **PASS** | `src/terminal/globals.css` exception updated (explicit `@config`) |
| CG10_audit, signatures (EX-01), gitleaks ×2, sbom | yes | **PASS** | unchanged |
| CG14_docs, spec, deps, gitignore | yes | **PASS** | spec: 28 pending (was 41) |
| **view-source** | **yes (new)** | **PASS** | SEO-AC-09: 95/95 expected strings, each a whole text node in the server HTML. CONT-AC-03: 0 of 4 planned-item strings in the HTML or RSC payload. |
| lighthouse | no | FAIL (report-only) | Performance 100, accessibility 100, best practices 96, **SEO 90** (U-09). CLS 0, LCP 770 ms, TBT 89 ms. |

## Browser tests (`e2e-prod.txt`): 25/25
New in U-07:
- HOME-AC-06: with JS disabled, every section is visible and there is no "Loading" text.
- HOME-AC-06 and HOME-AC-09: with JS disabled, each nav anchor scrolls its target into view.

Terminal regression: all terminal specs pass after the `@config` change. These cover theme persistence, chat off, contact and React 19 interactions.

## Manual visual check
`screenshots/home-1440.png`, `home-360.png` and `experience-360.png` were checked against `Main.dc.html`. There is no horizontal scroll at either width. Two fixes came from the screenshots:
- the post badges stretched to the full row height;
- a narrow-screen rule now gives the timeline a smaller tile.
