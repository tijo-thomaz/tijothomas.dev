# U-08 CityMap, motion, accessibility and responsive checks: gate record

- **Date:** 2026-11-25 · **Branch:** `redesign-home` · **Tree:** `6dd449a` · **Unit base:** `ccfa635` (`base.txt`)
- **Run:** `npm run gates -- --unit U-08` and `PW_CHANNEL=chrome npx playwright test`, both in a detached worktree in the system temp folder (`npm ci`, no env).
- **Runner exit 0. All 22 enforced gates pass, and the browser tests pass 39/39.**

## History
1. **`f4ab041`:** two failures.
   - **CG10_pii_scan:** the CityMap `viewBox` "-418 -303 837 794" looked like a phone number. The exact value was allow-listed with a reason (HOME-AC-10 fixes it).
   - **One e2e test:** the `.city-label-bg` lookup matched 2 elements (the label bubble and its pointer).
   - Both were fixed in `f8a4625`.
2. **`6dd449a`** (after the review fixes): this run.

| Gate | Enforce | Status | Result (trimmed) |
|------|---------|--------|------------------|
| CG1_build, CG3_types, CG7_complexity | yes | **PASS** | |
| CG10_pii_scan | yes | **PASS** | 35 served files; the allow-list now has 4 entries, each with a reason |
| CG10_groq, use_client, literals | yes | **PASS** | literals: a word is a token with 2+ letters or letters only; SVG path data is not copy, "bet365" copy is |
| CG2_lint | yes | **PASS** | 0 errors; 94 warnings, all in legacy-terminal |
| CG4_tests | yes | **PASS** | vitest ×3 (327); node (231) |
| CG5_coverage | yes | **PASS** | Diff vs `ccfa635`: lines 243/243 (100 %), branches 32/33 (97 %) |
| CG9, renames, CG10 audit/signatures/gitleaks/sbom, CG14, spec, deps, gitignore | yes | **PASS** | spec: 18 pending |
| view-source | yes | **PASS** | 99/99 whole text nodes (now including the 4 sign boards); 0 planned leaks |
| lighthouse | no | FAIL (report-only) | See the R4 read below |

## Lighthouse: early R4 read with the inline SVG (DoD)
Mobile, median of 3:

| | Score / value |
|---|---|
| Performance | 99 |
| Accessibility | 100 |
| Best practices | 96 |
| SEO | 90 (U-09) |
| CLS | 0 |
| LCP | 919 ms (U-07: 770 ms; the SVG adds about 150 ms) |
| TBT | 108 ms |

## Browser tests (`e2e-prod.txt`): 39/39
- **HOME-AC-07:** location line, `h1`, intro and "View work" are in the first viewport at 360×740 and 1440×900.
- **HOME-AC-10:** the map's aspect ratio is 794/837.
- **HOME-AC-22:** no horizontal overflow at 360 px.
- **HOME-AC-19:** the building body lifts by 4 px and the label highlights, on hover and on keyboard focus, with a 0.15 s ease-out transition. The test polls; there are no fixed sleeps.
- **HOME-AC-20:** exactly one car animation, 12000 ms × 1. Hovering a card changes only `border-color`.
- **HOME-AC-21:** with reduced motion, 0 animations, all transitions ≤ 0.01 s, and focus still highlights the label.
- **HOME-AC-23:** Tab reaches every interactive element once (≥ 14) and then wraps. Each shows an outline ≥ 2 px, and the buildings also lift.
- **HOME-AC-24:** axe reports 0 violations at 360 px and at 1440 px (WCAG 2.0/2.1/2.2 A and AA).
- **HOME-AC-25:** every link and button at 360 px is ≥ 24×24 or meets the 2.5.8 spacing exception.
- **U-07 owner request** (`cursor.spec.ts`): arrow cursor over text, hand over links, no text selection.

## Manual checks (DoD, NFR-018)
- **200 % zoom at 1280 px** (`screenshots/zoom200-1280.png`, a 640 CSS px viewport at DPR 2): `scrollWidth` 640 = `clientWidth`, and 0 clipped text elements.
- **320 CSS px** (`screenshots/w320.png`): `scrollWidth` 320, and 0 clipped elements.
- **Keyboard focus on a building** (`screenshots/focus-contact-building.png`): 3 px outline, blue label and lift.
- **Hero at 1440 px with Work hovered** (`hero-1440.png`) and the map at 360 px (`map-360.png`).
