# specs/

These files are the canonical, testable requirements for this repo. Rationale, NFR reasoning and history live in `edd-docs/` (`edd-docs/inception/prd.md`). Code and tests follow `specs/`.

## Rules
1. **One file per feature:** `specs/<feature>.md`, kebab-case, e.g. `home.md`.
2. **Header:** each file starts with these lines:
   ```
   # <Feature name>
   Status: Draft | Approved
   Prefix: <PREFIX>
   Traces: <FR/US IDs from edd-docs/inception>
   ```
   Only the owner moves a file to `Approved`. If an `Approved` file changes, it goes back to `Draft` until it is re-approved.
3. **Numbered ACs:** `<PREFIX>-AC-NN`, two digits, never reused or renumbered. Retire an AC by striking it through and adding `(retired: <reason>)`. Never delete the line.
4. **Gherkin-light:** one bullet per AC, in the form *Given … when … then …*, with one observable outcome. Use numbers instead of adjectives ("≤ 0.05", not "low").
5. **Trace and verify tag:** each AC ends with `_Traces: FR-xxx, US-xx · Verify: unit | e2e | gate_`.
   - `unit`: Vitest + Testing Library, colocated `*.test.ts(x)`.
   - `e2e`: Playwright against `next build && next start`.
   - `gate`: a script in the gate pipeline (Lighthouse, view-source, import graph, `npm ls`, …). It prints the AC ID in its check name.
6. **Tests cite ACs:** every test name contains the AC ID(s) it proves, e.g.
   `it('HOME-AC-01 renders exactly one h1', …)` or `test('TERM-AC-03 /v2 redirects to /terminal', …)`.
   A test may cite several ACs.
7. **Coverage gate:** `npm run spec:check` fails when:
   - any AC in `specs/*.md` (not retired) has no citing test or gate check, or
   - any test cites an AC ID that does not exist.
8. **Keep it short:** no rationale or design in specs. If you need more than one line, the AC is too big; split it.

## Index
| File | Prefix | Feature |
|------|--------|---------|
| `home.md` | HOME | The `/` page: sections, CityMap, a11y, motion, responsive; `/privacy` page |
| `content.md` | CONT | Content rules: facts, metric null, `SHOW_PLANNED`, placeholders, no contact PII (build scan) |
| `seo.md` | SEO | Metadata, OG, sitemap, robots, JSON-LD, crawlability, Lighthouse |
| `terminal-route.md` | TERM | `/terminal`, `/v2` redirect, version selector, chat disabled, terminal PII strip |
| `projects.md` | PROJ | Projects platform: registry, `/play/<slug>` rewrites and fallback, `/projects`, `/work/sluice` case study (Draft, 2026-11-26) |
| `platform.md` | PLAT | Next 16, Oxlint, folder structure, dead code, Storybook removal, test/build config, spec gate, security headers, supply chain |

Paths (amended 2026-11-24): app code lives under `src/` (`src/app`, `src/components`, `src/content`, `src/lib`, `src/terminal`), and `@/*` maps to `./src/*`. `specs/`, `scripts/`, `e2e/`, `edd-docs/`, `public/` and `docs/` stay at the repo root. AC IDs did not change.

Amended after PG3 (2026-11-23): 93 ACs (HOME 28, CONT 15, SEO 11, TERM 12, PLAT 27).
