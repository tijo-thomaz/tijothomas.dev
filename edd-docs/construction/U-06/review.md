# U-06 Home shell: review (EDD stage 2.3)

- **Date:** 2026-11-24 · **Reviewer:** independent principal-engineer review (not the author) · **Range:** `813ab51..a773f38` (`git diff -- . ':!edd-docs'`, 30 files)
- **Precondition NOT met:** `edd-docs/construction/U-06/gates.md` does not exist, so no `npm run gates` record covers this unit. The owner asked for the review anyway, so the code review is below. Under EDD rules the unit cannot be approved until a green gate record exists (#1).

## What I ran myself (main checkout at `a773f38`; no `next build`, `next dev` or Playwright, because the owner's dev server is on :3000)
| Check | Result |
|-------|--------|
| `npx vitest run` | 26 files, 283/283 pass |
| `node --test scripts/*.test.mjs` | 205/205 pass (includes `check-use-client` and `check-literals` fixtures) |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0; 0 errors, about 94 warnings (ceiling 109), all in `src/terminal/**` |
| `node scripts/check-literals.mjs` | PASS (6 files) |
| `node scripts/check-use-client.mjs --no-build` | PASS (16 modules). I could not run the `/`-is-static half without a build. |
| `node scripts/check-imports.mjs` | PASS: site closure 12 modules, nothing under `src/terminal`, no Supabase |
| `npm run spec:check` | PASS: 51 cited, 41 pending |
| Gate probes (scratch fixtures in a temp dir, deleted afterwards) | `check-literals` **passes** a component with `<p>I am a senior engineer based in {city}</p>`, `<p>{name} is a lead engineer at a great company</p>` and `<p>Read more https://example.com about my many interesting experiments here</p>` (#2). `check-use-client` passes `next/script` and `next/link`, and a `'use client'` that follows `'use strict'` (#3). |

## Findings
| # | Severity | File:line | Finding | Fix | Status |
|---|----------|-----------|---------|-----|--------|
| 1 | **major** | `edd-docs/construction/U-06/` (no `gates.md`) | **The unit's DoD says "`npm run gates` green", but there is no gate record.** Not evidenced for this unit's tree: CG1 build; `use_client` with the build (HOME-AC-03 "the build marks `/` as static"); CG10_pii_scan over the new Contact/footer output (CONT-AC-14); CG5 diff coverage; the HOME-AC-26 and HOME-AC-01/11 e2e specs (`e2e/home-storage.spec.ts`, never run and no `e2e-prod.txt`); and the Lighthouse numbers the unit asks to read now (R4). `specs/pending.txt` already drops all 10 ACs. | In a scratchpad worktree, run `npm run gates -- --unit U-06` and Playwright prod. Write `gates.md`, `e2e-prod.txt` and the Lighthouse numbers. | open |
| 2 | **major** | `scripts/check-literals.mjs:31`, `:37` | **The CONT-AC-12 gate passes on the most common way to hard-code copy.** `JSX_TEXT = />([^<>{}]+)</` only matches JSX text that sits wholly between `>` and `<`, so any text run that contains or touches an `{expression}` is never examined. On top of that, `stripComments` runs over JSX text, so `//` in visible text (a URL) deletes the rest of the line before the scan. I proved all three bypasses with a fixture (see the table above). The 6 fixture tests cover only pure text nodes. | Use a real parser: `typescript.createSourceFile(…, ScriptKind.TSX)` (TypeScript is already a devDependency). Visit `JsxText` (with sibling `JsxText` nodes joined across `{expr}` into one sentence), `StringLiteral` and `NoSubstitutionTemplateLiteral`/`TemplateExpression` heads, and skip `className` and `key` attributes. If the regex stays, at least replace `{…}` with a placeholder word before matching, and do not strip `//` inside JSX text. Add the three fixtures above as must-FAIL tests. | open |
| 3 | minor | `scripts/check-use-client.mjs:22`, `:24`, `:46` | The gate is looser than HOME-AC-03 ("0 modules contain `use client` except `@vercel/analytics`"). (a) `ALLOWED_PACKAGES` admits every `next/*` subpath. That includes `next/link`, `next/image` and `next/dynamic`, which are client modules, and `next/script`, which lets a server component inject arbitrary client JS with no directive anywhere. (b) `DIRECTIVE` only matches `use client` as the very first directive, so `'use strict'; 'use client';` is missed. (c) Unresolved local imports (`{ unresolved }`) are dropped silently (tsc covers TS, but not every specifier). | Allow exact subpaths only: `next`, `next/font/google`, `next/font/local` and `@vercel/analytics/react`, plus `react` and `react-dom` for types. Add any other subpath only with a reason. Match `use client` anywhere in the directive prologue. Report unresolved local specifiers as FAIL. Add fixtures for `next/script` and `next/link`. | open |
| 4 | minor | `src/content/facts.test.ts:96`, `:113-117` | U-06 widened CONT-AC-10: a data line may now cite any spec AC id (`[A-Z]+-AC-\d{2}`), and the only check is that the AC exists in `specs/*.md`. A literal can now pass by citing an unrelated AC. Today the four uses are honest: HOME-AC-11 contains "Skip to content", HOME-AC-12 contains "Highlights", HOME-AC-18 contains "Terminal mode". But the test does not check this, which weakens the "content only from owner-confirmed rows" rule. | For lines that cite an AC, assert that the AC's bullet text contains the literal on that line (for example, `"Skip to content"` appears in the `**HOME-AC-11**` bullet). | open |
| 5 | minor | `src/app/(site)/globals.css:49-51`, `:89-91`, `:320` | Accessibility: the single focus colour `--focus: #1d4ed8` is drawn around the footer "Terminal mode" link on the `band--ink` background (`#0f1b2d`). The contrast is about 2.6:1, below the 3:1 that WCAG 1.4.11 asks of a focus indicator. Elsewhere, on mint and white, it is fine. | Override inside `.band--ink`, for example `--focus: #93c5fd` (about 9:1 on ink) or white. Add the footer link to the keyboard e2e that checks the visible focus. | open |
| 6 | minor | `src/components/Nav.tsx:12-18` with `src/content/profile.ts:187-189` | `#work`, `#experience` and `#writing` have no target on `/` yet, so 3 of the 5 nav links (and "View work" in the Hero) do nothing. HOME-AC-09 is deferred to U-07 (impl-notes decision 5), which is fine on a branch, but deploying `redesign-home` between U-06 and U-07 would ship broken navigation. | Record in `edd-state.md` that `redesign-home` must not deploy before U-07, or render only nav items whose section is present. | open |
| 7 | minor | `src/app/(site)/globals.css:4-6`, `tailwind.config.js:4-9`, `src/app/(site)/layout.tsx:14-17` | Traceability: two U-03 review findings were dispositioned **to U-06** and are neither done nor carried forward. (a) "Separate `(site)` Tailwind config via `@config`": the site sheet still uses the shared config, whose `content` includes `src/terminal/**`, so `/` ships all terminal utilities. (b) "No favicon on `(site)`": the metadata still has no `icons`. `impl-notes.md` does not mention either. | Do both in U-06, or re-carry them explicitly (to U-07/U-09) in `edd-state.md` with the reason. | open |
| 8 | nit | `scripts/check-literals.mjs:98` | Only `src/components` is scanned (this matches the AC's wording). `src/app/(site)/page.tsx` and `layout.tsx` could carry copy unchecked. Today they hold only `'Tijo Thomas'`. | Extend the scan to `paths.layers.site` (non-test files). | open |
| 9 | nit | `src/components/Contact.tsx:32` | Links open in a new tab (`target="_blank"`) with no cue to screen-reader or sighted users (WCAG G201, advisory). `rel="me noopener noreferrer"` is correct and meets HOME-AC-17. | Add a visually hidden "(opens in a new tab)" from `profile.labels`, or drop `target`. | open |
| 10 | nit | `src/app/(site)/page.test.tsx:32-35` | The footer-year test compares against `new Date().getFullYear()` at test time, so a hard-coded current year would also pass. `Footer.test.tsx` passes `year={2031}` and covers the component. The page wiring is the only part the page test can check. | Use `vi.setSystemTime(new Date('2031-06-01'))` in the page test and expect `© 2031`. | open |

**Counts:** blocker 0 · major 2 · minor 5 · nit 3

## Acceptance criteria and accessibility (code reading + unit tests)
| AC | State |
|----|-------|
| HOME-AC-01 | Met: one `h1` = `profile.headline` (Hero and page tests). Location line, intro, CTAs and tip all come from content. |
| HOME-AC-03 | Source half met, and the gate passes. The build half is unproven (#1), and the gate is looser than the AC (#3). |
| HOME-AC-11 | Met: `nav[aria-label="Main"]` order is brand → `#top`, then `#work`, `#experience`, `#writing`, `#contact`. The skip link comes first in DOM and Tab order and targets `main#main` (`tabIndex={-1}`, so focus moves). The e2e test exists but has not run (#1). |
| HOME-AC-12 | Met: a named region with N `li` tiles; null when N = 0. `role="list"` is kept on purpose for Safari, with a reason. |
| HOME-AC-17 | Met: LinkedIn and GitHub only, `rel` contains `me` and `noopener`, no email, no `mailto:`, no CV control, and availability is omitted when null. |
| HOME-AC-18 | Met: "© {build year} {name}" and a "Terminal mode" link to `/terminal`, with no tagline. |
| HOME-AC-26 | Plausible (no storage code on `/`; `@vercel/analytics` sets no cookies), but the e2e test has never run (#1). |
| CONT-AC-07/08 | Met: tests scan the rendered HTML for `[UPPER` tokens, `undefined`/`null` text and empty elements. |
| CONT-AC-12 | The gate passes, but it can be bypassed (#2). The current components really do hold no literal of more than 3 words: I read all 6. |

Other accessibility points:
- `lang="en"`, and zoom is not disabled.
- Headings: `h1` in the hero, `h2` in Contact, with no skipped levels in the shell.
- Contrast:
  - ink text on the `#ff7a33` accent button is about 6.6:1;
  - `--on-ink` text on ink is high contrast.
- Touch targets are 44px on coarse pointers.

## Security
- No `"use client"`, `dangerouslySetInnerHTML` or event handlers in the site components.
- Every href comes from typed content (`#anchor` or `HttpsUrl`), plus the literal `/terminal`. There is no `javascript:` path: the `HttpsUrl` type and the `content.test.ts` safety tests hold.
- External links carry `noopener noreferrer`.
- No PII is rendered; the page and Contact tests scan for email and `mailto:`.
- The terminal stays at `/terminal` and the `(site)` graph does not reach `src/terminal` (`check-imports` PASS).

## Verdict
**changes-required.** #1 (no gate or e2e record, against the DoD) and #2 (a CONT-AC-12 gate with a proven bypass) must be closed before approval. The components themselves are clean, accessible, server-only and content-driven. The remaining items are minors and nits.
