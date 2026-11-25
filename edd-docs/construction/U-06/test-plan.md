# U-06 Home shell: test plan (EDD stage 2.1)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Base:** `813ab51` (`base.txt`) · **Unit:** `edd-docs/inception/units/U-06-home-shell.md`
- **ACs (10):** HOME-AC-01, 03, 11, 12, 17, 18, 26 · CONT-AC-07, 08, 12. All 10 are removed from `specs/pending.txt` (51 → 41).
- **Written by:** the orchestrator in the main session.
- **Deviation:** the page test stays at `src/app/(site)/page.test.tsx` (next to the page) instead of `src/components/page.test.tsx`, because components must not import from `src/app/`.

## Traceability
| AC | Test file | What the tests check | Level |
|---|---|---|---|
| HOME-AC-01 | `Hero.test.tsx` (4), `page.test.tsx`, `e2e/home-storage.spec.ts` | One `h1` equal to `profile.headline`. `section#top` holds the location · relocation · visa line, the intro and the tip. "View work" links to `#work` and "Get in touch" to `#contact` (RQ-03 a). The visa label is omitted when sponsorship is not needed. | unit, e2e |
| HOME-AC-03 | `scripts/check-use-client.test.mjs` (8) | The gate passes a clean site and ignores terminal client modules. It names a component with `"use client"`, follows local imports out of the site layers, and fails on a bare import other than next, react or @vercel/analytics. It ignores the directive inside strings and test files. It fails when `/` is not in `prerender-manifest.json`, and exits 2 with no build unless `--no-build`. An enforced gate runs it. | gate (fixture) |
| HOME-AC-11 | `Nav.test.tsx`, `SkipLink.test.tsx`, `page.test.tsx`, e2e | Nav order: brand → `#top`, then `#work`, `#experience`, `#writing`, `#contact`. The skip link is the first focusable element and the first Tab stop, and it targets `main#main`. | unit, e2e |
| HOME-AC-12 | `Highlights.test.tsx` (2) | N tiles (value + caption) in the Highlights region; nothing rendered when N = 0. | unit |
| HOME-AC-17 | `Contact.test.tsx` (5), `Nav.test.tsx`, `Hero.test.tsx`, `page.test.tsx` | Only the LinkedIn and GitHub links, each with `rel` containing `me` and `noopener`. No email or `mailto:`. No "Download CV" control anywhere. Availability is omitted when null and shown when set. | unit |
| HOME-AC-18 | `Footer.test.tsx` (2), `page.test.tsx` | "© <year> <name>", using the build year on the page. A "Terminal mode" link to `/terminal`. No tagline. | unit |
| HOME-AC-26 | `e2e/home-storage.spec.ts` | A fresh context gets 0 cookies, an empty `document.cookie`, and empty local and session storage. | e2e |
| CONT-AC-07 | `page.test.tsx` | 0 `[UPPER …]` placeholder tokens in the rendered HTML. | unit |
| CONT-AC-08 | `page.test.tsx`, `Contact.test.tsx` | No "undefined"/"null" text and no empty text elements. Null fields are omitted. | unit |
| CONT-AC-12 | `scripts/check-literals.test.mjs` (6) | JSX text or string literals of more than 3 words fail, named with file and line. `className` values, comments and tests are skipped. Allow-list entries need a reason. An enforced gate runs the check. | gate (fixture) |

## Content additions
`profile.labels` gains `skipLink`, `highlights`, `availability`, `linkedin`, `github` and `terminalMode`. Each cites a row or a spec AC. `facts.test.ts` now accepts spec AC references and checks that each one exists in `specs/*.md`.

## Red run
- vitest: 6 component files and the page test fail because the modules are missing (`./Contact`, `./Footer`, …).
- node: `check-use-client` and `check-literals` fail 14/14 because the scripts do not exist yet.
