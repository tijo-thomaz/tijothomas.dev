# U-13 + U-14 Project registry and /play multi-zone rewrites: gate record

- **Date:** 2026-11-26 · **Branch:** `projects-platform` (stacked on U-11, merged as PR #20) · **Base:** `71fcd1d` (U-12 specs)
- **Commits:** `668ec43` (U-13 red), `ef0d957` (U-13 feat), `40deb3e` (U-14 red), `8e70c6a` (U-14 feat), `c1f198b` (docs), `03f9201` (review fixes), `7c114c8` (gate fixes)
- **Review:** `review.md`, approve-with-minors (0 blockers, 0 majors, 7 minors, 6 nits). All minors fixed in `03f9201`. Nits #9-#13 fixed; #8 (terminal link to `promptshield.vercel.app`) is on hold for the owner (`projects-plan.md`).

## Run 1 at `03f9201`: `npm run gates -- --unit U-14 --base 71fcd1d` (fresh worktree, `npm ci`, no env)
- **21 of 24 enforced gates passed.** The 3 that failed:
  - **CG2_lint and CG7_complexity:** `playOrigin` had complexity 11 (limit 10).
  - **CG14_docs:** README not updated.
- **Lighthouse passed:** Performance 99, Accessibility 100, Best Practices 96, SEO 100, CLS 0, LCP 923 ms, TBT 126 ms.
- **e2e:** 74 passed, 0 failed (full suite, `PW_CHANNEL=chrome`).

## Run 2 at `7c114c8` (failed gates and the test gates re-run)
CG2_lint, CG3_types, CG4_tests, CG5_coverage, CG7_complexity, CG14_docs and spec **PASS**. The `7c114c8` change has no runtime effect: it splits a function and edits the README.

## Extra checks
- `SLUICE_ORIGIN=https://sluice-example.vercel.app next build` passes. The `routes-manifest.json` `beforeFiles` rewrites are `/play/sluice` and `/play/sluice/:path*` to the zone.
- `SLUICE_ORIGIN=http://bad.example next build` fails with "SLUICE_ORIGIN must be a bare https origin…".
- **Prerendered:** `/play/sluice` and `/work/sluice`.
- **spec:check:** 7 pending (PROJ-AC-07..10, 14..16, for U-15 and U-16).

## Open for later units
- Whether the portfolio headers apply to a proxied zone response on Vercel (threat-model §6.5). Check with `curl -I` on the first preview with a real zone, in U-16's owner checklist.
