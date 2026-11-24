# U-09 SEO: gate record

- **Date:** 2026-11-25 · **Branch:** `redesign-home` · **Tree:** `28d9fad` · **Unit base:** `152b495` (`base.txt`). The range includes the MWG pass, the `#top` fix and the F-35 content.
- **Run:** `npm run gates -- --unit U-09` in a detached worktree in the system temp folder (`npm ci`, no env).
- **Runner exit 0. All 23 gates pass, all enforced. Lighthouse is enforced from this unit, so no report-only gate remains.**

## History
| Tree | Result | Fix |
|---|---|---|
| `c231ae9` | CG5 FAIL (branches 66.7 %); e2e 2 FAIL (the og:image URL returned 404; the root canonical had no trailing slash) | `71cde5b`: og:image from the file convention, the e2e test follows the tags, and coverage tests were added |
| `375909b` | CG4 FAIL: the RCA-01 guard caught a fake `github.com/x` URL in a new sitemap fixture. e2e 50/50 PASS | `28d9fad`: the fixture uses a neutral domain |
| `28d9fad` | **23/23 PASS** | this record |

| Gate | Status | Result (trimmed) |
|------|--------|------------------|
| CG1_build | **PASS** | Routes: `/`, `/opengraph-image-12o0cb`, `/robots.txt`, `/sitemap.xml`, `/terminal`, `/work/promptshield`, `/writing/queues-double-charge` |
| CG10_pii_scan | **PASS** | 48 served files (the new routes included), 0 matches |
| CG10_groq, use_client, literals | **PASS** | use_client: 33 site modules, 0 `"use client"`, `/` static |
| CG2_lint, CG3_types, CG7_complexity | **PASS** | PLAT-AC-23: `react/no-danger` error, with the only override for `src/lib/json-ld.ts` |
| CG4_tests | **PASS** | vitest ×3 (361); node (234) |
| CG5_coverage | **PASS** | Diff vs `152b495`: lines 204/205 (99.5 %), branches 41/43 (95.3 %) |
| CG9, renames, CG10 audit/signatures/gitleaks/sbom, CG14, spec, deps, gitignore | **PASS** | spec: 8 pending |
| view-source | **PASS** | 104/104 whole text nodes (now including the Opteamix bullets); 0 planned leaks |
| **lighthouse** | **PASS (enforced)** | Mobile median of 3: performance 99, accessibility 100, best practices 96, **SEO 100** (was 90). CLS 0, LCP 921 ms, TBT 104 ms |

## Browser tests (run at `375909b`; nothing since then touches app code)
`e2e-prod.txt`: **50/50 pass**, including:
- **SEO-AC-02:** the `og:image` and `twitter:image` tags of `/` are identical, and they resolve to a 200 response with a 1200×630 PNG.
- **SEO-AC-01:** canonical, description, exactly one `og:image`, and the twitter card.
- **SEO-AC-07:** the two placeholders return 200 with noindex. `/work/does-not-exist`, `/writing/does-not-exist` and the planned `/work/fde-mcp-gateway` return 404.
- **SEO-AC-04/05:** `/sitemap.xml` and `/robots.txt` are served.
- The full home, terminal, cursor, motion (5000 ms car), a11y (axe 0) and viewport suites.

## Evidence
- `screenshots/opengraph-image.png`: the share image fetched from the production build through the `og:image` URL (48 KB PNG).
- **Rich Results test:** owner action. It needs a public preview URL, and is listed in `edd-state.md` under "Open owner actions".
