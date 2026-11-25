# U-05 Content layer and SHOW_PLANNED parser: review (EDD stage 2.3)

- **Date:** 2026-11-24 · **Reviewer:** independent principal-engineer review (not the author) · **Range:** `0d75cb8..813ab51` (`git diff -- . ':!edd-docs'`, 24 files). This range includes the U-04 fix `f030b11` and the PG5 owner edits `813ab51`.
- **Precondition:** `gates.md` records 19/19 enforced gates PASS at `636522e`. `813ab51` changed content and tests after that run (owner edits). I re-ran the test suites at HEAD, and they pass. The unit is reviewable.

## What I ran myself (main checkout at `a773f38`; no build)
| Check | Result |
|-------|--------|
| `npx vitest run` | 283/283 pass (includes `facts.test.ts`, `content.test.ts`, `flags.test.ts`, `site.test.ts`) |
| `node --test scripts/*.test.mjs` | 205/205 pass (includes the 3 new keep-list tests) |
| `npx tsc --noEmit` | exit 0, so every `@ts-expect-error` content guard still errors |
| `node scripts/check-imports.mjs` | PASS: `src/content has type-only imports`; nothing under `src/components`/`content`/`lib` imports `src/terminal` |
| `node scripts/check-unreachable.mjs` | PASS: 4 modules unreachable, all 4 keep-listed with reasons |

## Fact trace (spot-checked against `1.1-facts.md` and `1.1-facts-resolved.md`)
- Every value in `profile.ts`, `experience.ts`, `work.ts` and `posts.ts` matches its cited row or resolution. The rows I checked:
  - F-01–F-14;
  - F-15–F-29: PromptShield `live` with "Proof of concept", `metric: null`; both fde projects `planned`, target `2026-12`;
  - F-30–F-56: bet365 title and bullets, the F-43 wording without "LLM", Speridian in Mumbai at PG5;
  - F-57–F-60, F-67–F-70;
  - C-01–C-17: C-04 signposts as edited at PG5; the C-17 description follows F-08.
- The withheld rows are absent: F-18, F-35, F-63, F-64, F-66, F-71, F-72.
- There is no email, phone or `whatsapp` field, and no CV link.
- Two values rest on owner acceptance at PG5, not on a sheet cell, and both are recorded in `impl-notes.md`: "4 regulated markets" (the F-12 cell lost its digit) and "shipped with a VS Code translation tool" (F-13). Acceptable.
- I did not invent any value, and I found none invented.

## Findings
| # | Severity | File:line | Finding | Fix | Status |
|---|----------|-----------|---------|-----|--------|
| 1 | minor | `edd-docs/construction/U-05/impl-notes.md:7`; `CHANGELOG.md:39-40` | Traceability: both say `f030b11` fixed the GitHub username "in the CV text" and in 6 files. `f030b11` touches 5 source files, and `src/terminal/lib/utils.ts:40` still says `github.com/tijo-thomas`. The defect itself is filed as **U-04 review #1 (major)**. | Fix `utils.ts:40` under U-04 #1, then make the notes match what changed. | open |
| 2 | minor | `scripts/check-unreachable.mjs:22,27,65,74` | **Keep-list semantics have no staleness check.** (a) An entry for a module that is now reachable, or that no longer exists, passes silently. The header comment says "Remove an entry as soon as a route imports the module", but nothing enforces it, so entries outlive U-07. (b) A keep entry also removes a path from `stillThere` (`:65`, pre-existing). A keep-listed path can therefore stay on disk even though the audited deletion lists (`cycles.txt`, U-00 `unreachable.txt`) require it gone, and the PLAT-AC-11(a) check reports nothing. (c) `:74` now exempts tests of keep-listed modules from PLAT-AC-12. That is correct for the 4 current entries, but it compounds (a). | Fail when a keep entry (i) does not exist, (ii) is reachable from an entry point, or (iii) appears on an audited deletion list. Optionally require a unit tag in the reason (`# U-07: …`) and fail once that unit's `gates.md` exists. Add fixtures for (i)-(iii). | open |
| 3 | minor | `src/content/facts.test.ts:96,100-105` | CONT-AC-10 is checked by syntax, not by meaning. Any publishable row id in the comment satisfies the trace, whether or not that row holds the value. Examples: `labels.linkedin: 'LinkedIn' // F-67` (F-67 is the URL row), `metric: null // F-16` (the metric row is F-18, which is withheld), `labels.now/present // F-32`. These are all reasonable today, but the test cannot tell a correct citation from a convenient one. | For rows whose sheet cell quotes text ("…"), assert that the quoted text, or its resolution, appears in the cited value. Where a resolution replaces a withheld row, require a `(resolved: …)` comment, as the bet365 lines already do. | open |
| 4 | nit | `src/content/types.ts:13` | `Link.href` admits `` `/${string}` ``, which includes a protocol-relative `//host`. The runtime test (`content.test.ts:106`) rejects dotted hosts only, so `//localhost` would pass. No current value is affected. | Use `` `/${Exclude<…>}` `` or a runtime check `!/^\/\//`; add a negative case. | open |
| 5 | nit | `gates.md` (tree `636522e`) vs range end `813ab51` | The gate record predates the PG5 owner-edit commit, which changed `experience.ts`, `profile.ts` and `facts.test.ts`. Tests pass at HEAD (my run), but the gate record does not cover the final tree. | Re-run `npm run gates -- --unit U-05` at `813ab51`, or note in `gates.md` that the PG5 edit was content-only and re-tested. | open |

**Counts:** blocker 0 · major 0 · minor 3 · nit 2

## Other checks (no finding)
- **`isShowPlanned`:** fails closed. Only `'true'` passes, and 8 negative cases are tested, including `'TRUE'`, `' true'` and `undefined`.
- **Content safety tests:**
  - URL leaves are https;
  - hrefs are anchors, site paths or https;
  - no `mailto:`/`tel:`/`javascript:`/`data:` prefix;
  - no email or +44/+91 number in any string;
  - no `email`/`phone`/`whatsapp`/`tel`/`mobile` key at any depth;
  - type-level guards are enforced by `tsc`.
  These tests can fail: I traced each regex against a counter-example.
- **Facts fixture test:** it pins the 90 rows and "All 90 rows resolved", so an edited facts sheet cannot make it pass vacuously. The `> 80` data-line and reference floors also stop it passing on an empty file.
- **Layering:** `src/content/*` imports `./types` with `import type` only. `src/lib/site.ts` → `@/content/profile` is a lib → content runtime import, which the import rules allow. No `src/terminal` edges.
- **Pattern use:** the discriminated unions (`kind`, `status`), nullable fields and `readonly` tuples fit the unit's patterns. There is no over-engineering.

## Verdict
**approve-with-minors.** The content layer is accurate to the owner-confirmed rows and well guarded. #2 should be fixed before U-07 removes the keep entries, so that stale entries fail from then on. #1 is closed by the U-04 fix.
