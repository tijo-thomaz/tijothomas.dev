# U-05 Content layer and flag parser: test plan (EDD stage 2.1)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Base:** `0d75cb8` (`base.txt`) · **Unit:** `edd-docs/inception/units/U-05-content-layer.md`
- **ACs (5):** CONT-AC-05, 10, 11, 13, 15. All 5 are removed from `specs/pending.txt` (56 → 51).
- **Written by:** the orchestrator in the main session (the owner asked for live work, not agents).
- **Fixtures:** `edd-docs/questions/1.1-facts.md`, `1.1-facts-resolved.md` and `1.1-requirements.md` are read by `facts.test.ts` only. Product code never imports `edd-docs/`.

## Traceability
| AC | Test file | What the tests check | Level |
|---|---|---|---|
| CONT-AC-05 | `src/lib/flags.test.ts` (9) | `"true"` → true. `"false"`, `""`, `"1"`, `"TRUE "`, `"TRUE"`, `" true"`, `"yes"` and `undefined` → false | unit |
| CONT-AC-10 | `src/content/facts.test.ts` (16) | The sheet has 90 rows, and every withheld row is named in the resolutions. Every data line in `profile/experience/work/posts.ts` carries an `F-xx`, `C-xx` or `RQ-xx` reference. Each referenced row exists and is publishable: answered confirm, correct or edit, or resolved and not withheld. Each RQ reference exists. Each binding resolution is pinned: F-05, F-08/C-17, F-13/F-43, F-16/F-18, F-20..29, F-35, F-38, F-63/F-72, F-66, F-67..69, F-71/RQ-04, F-58..60/RQ-01. | unit (fixtures) |
| | `src/content/content.test.ts` | No placeholder token, empty string or `"undefined"`/`"null"` string in content | unit |
| CONT-AC-11 | `src/content/content.test.ts` (8) | 5 how-I-work steps. Dates are `YYYY-MM` with start ≤ end. Experience is newest first, and only the first entry may be open-ended. Each entry is a job or a gap with its required fields. Statuses come from the allowed unions. Slugs are unique and URL-safe. Each metric is null or has a label. Compile-time guards (`@ts-expect-error`) reject a bad status, a bad kind and a sixth step. | unit + `tsc` |
| CONT-AC-13 | `src/content/content.test.ts` (4), `src/lib/site.test.ts` (1) | URL fields start with `https://`. `href` values are an anchor, a site path or an https URL. No string starts with `mailto:`, `tel:`, `javascript:` or `data:`. A type guard rejects `http://`. `siteUrl` comes from `profile.siteUrl`. | unit + `tsc` |
| CONT-AC-15 | `src/content/content.test.ts` (3) | `profile` has no email, phone or WhatsApp key at any depth. No content string holds an email, a +44/+91 number, `wa.me` or `mailto:`. Type guards reject `email`, `phone` and `whatsapp` on `Profile`. | unit + `tsc` |

## Red run (before implementation)
`npx vitest run src/content src/lib`: 4 files fail. Each fails because its module is missing (`./profile`, `./flags`, …), which is the right reason.

## Not covered here
- Rendering of null fields, planned items and placeholders: CONT-AC-01..04, 06..08 (U-06, U-07).
- CONT-AC-12 (no long literals in components) is enforced from U-06.
