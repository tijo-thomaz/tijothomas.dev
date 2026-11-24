# U-10 Privacy notice: review (EDD stage 2.3)

- **Date:** 2026-11-25 · **Reviewer:** independent principal-engineer review (not the author) · **Range:** `692faaf..922c2d2` (3 commits, 24 files, +439/-55). Line numbers are at `922c2d2`.
- **Also reviewed briefly:** the U-09 owner-choice-b OG font (`205a3fc`, just before the range): `src/app/(site)/fonts/` and `opengraph-image.tsx`.
- **Precondition NOT met:** `edd-docs/construction/U-10/gates.md` does not exist yet. The gate run in the worktree `%TEMP%\tijo-wt-u10` (at `922c2d2`) has two red gates so far:
  - **CG14_docs FAIL:** "README.md not updated since 692faaf".
  - **lighthouse FAIL:** median TBT is 184 ms, over the 150 ms limit. Everything else passes: perf 97, a11y 100, BP 96, SEO 100, CLS 0, LCP 927 ms. U-10 changes `/` only by one footer link and some CSS, so a real TBT regression is unlikely. **Note:** my own `npx vitest run` started at 01:00 IST, the same minute the Lighthouse run started (19:30 UTC). The load from my run may have caused this. Re-run Lighthouse on an idle machine.
  - **Everything else:** all other gate JSONs present read `pass`, including `use_client`, which confirms `/privacy` is static. No e2e result file was present when I read the folder.
  - **How I used it:** following the U-09 precedent, I reviewed anyway, reading the worktree's built `.next` output (read only; I built nothing). The verdict cannot become *approve* until `gates.md` is green.
- **Verdict: CHANGES REQUESTED.** 0 blocker, 1 major (plus the two red gates above, owned by the gate run), 7 minor, 7 nit.

## What I ran myself (main checkout at `922c2d2`)
| Check | Result |
|---|---|
| `npx vitest run` | 41 files, 378/378 pass |
| `node --test scripts/*.test.mjs` | 235/235 pass |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0; warnings only, all in `src/terminal/**` (legacy override) |
| `node scripts/check-literals.mjs` | PASS (24 files) |
| `node scripts/check-use-client.mjs --no-build` | PASS (37 modules) |
| `node scripts/check-unreachable.mjs` | PASS, 132/132 reachable; `privacy/page.tsx` is a new entry |
| `node scripts/check-renames.mjs` | PASS (17 exceptions). `src/terminal/page.tsx` would still be R092 without its exception; the entry exists because `next16-upgrade.test.mjs:230` requires every edited moved file to be listed |
| `npm audit --omit=dev` | 0 vulnerabilities; no dependency added |
| Built `/privacy` (worktree `.next/server/app/privacy.html`) | In `prerender-manifest.json` (static). 1 `h1`, then 7 `h2` in order. Landmarks: 1 `main`, 1 `footer`; the `header` sits inside an `article`, so it is not a banner. `<title>Privacy notice · Tijo Thomas</title>`, canonical `https://tijothomas.dev/privacy`, no robots meta (indexable). og/twitter image is the hashed `/opengraph-image-12o0cb`. `<time dateTime="2026-11-25">`. Links: `/`, LinkedIn (`rel="me noopener noreferrer"`), `/privacy`, `/terminal`. **No email, `mailto:` or `tel:`.** |

## Accuracy check of the notice and the modal against the code and `compliance.md` §1
| Claim | Code fact | OK? |
|---|---|---|
| Vercel request logs: IP, browser, page, referrer, time (P1) | Vercel hosting | yes |
| Web Analytics: no cookies, 24 h hash, aggregates (P2) | `<Analytics/>` is mounted in **both** root layouts: `src/app/(site)/layout.tsx:33` and `src/terminal/layout.tsx:84` | yes, but see #4 (data points) |
| The home page sets no cookies and stores nothing (CMP-01) | No storage or cookie API in the site layers | yes |
| localStorage keys `tijothomas-theme`, `-zoom`, `-sounds`, `portfolio-analytics` | `ThemeProvider.tsx:63`, `ZoomControls.tsx:56`, `sounds.ts:134`, `simple-analytics.ts:51`. No other `setItem` call: `shared/lib/utils.ts:107` is a generic helper with no caller. No `sessionStorage`. | keys yes; contents see #2 |
| "Never sent to me" (browser storage) | The stored object is never sent. Only `{type, timestamp}` goes to `/api/analytics`. | yes |
| Supabase: "a date and a count of visits and commands"; nothing identifies you (P4) | `terminal/api/analytics/route.ts`: `increment_daily_visits(date)` and `increment_usage_stat(date, 'commands_used' or 'ai_questions')`. The Supabase client is used server-side only. | partly, see #3 |
| Modal: "No Cookies: this site sets none" | No `document.cookie`, `cookies()` or `Set-Cookie` in `src/`. No middleware. Supabase is server-only, so no `sb-*` auth storage. No embeds. | yes |
| Chat and Groq not listed | Not in `privacy.ts` or the modal; the Groq credit is removed (`page.tsx`) | yes |

## Findings
| # | Severity | File:line | Finding | Recommendation |
|---|---|---|---|---|
| 1 | **major** | `src/components/PrivacyNotice.tsx:5-17`; `src/content/privacy.ts:12`, `:20` | **The notice never names the controller.** `PrivacyNotice` renders the title, the date and the contact link; `notice.controller.name` is never rendered. The "Who is responsible" text says only "I run this site myself". The name appears on the page only as the brand link and in the footer `©` line (`privacy.html`). Art. 13(1)(a) asks for the controller's identity, and HOME-AC-28 says the page "names the controller". The unit test (`privacy.test.ts:10`) asserts the data field, not the render. The e2e test (`e2e/privacy.spec.ts:13-21`) does not check the name. So a dead field passes as covered. | Render the name in the controller statement, e.g. "The controller is {name}…" from `controller.name`. In `page.test.tsx`, assert that the text inside `article`/`main` (not the footer) contains `profile.name`. In e2e, assert it in the stripped `<main>` text. |
| 2 | minor | `src/content/privacy.ts:32`; `PrivacyModal.tsx:25` | **Underclaim: `portfolio-analytics` holds more than counters.** It also stores `lastCommand`, the raw text of the last command typed (`simple-analytics.ts:87`), and `sessionStart`. `compliance.md` P5 says "local counters, last command, session start". The modal's "Local usage counters" has the same gap. | Say "local usage counters, your last command and the session start time (portfolio-analytics)". |
| 3 | minor | `src/content/privacy.ts:31`; `PrivacyModal.tsx:26` | **Underclaim: Supabase counts questions too.** The chat drawer is still mounted (`page.tsx`, `FloatingAIAssistant`). `handleSendMessage` calls `trackQuestion()` before the "chat unavailable" reply (`useChatAssistant.ts:284`), which increments `ai_questions` in Supabase and `questions` in `portfolio-analytics`. The data is still non-personal, but the notice says "visits and commands" only. | Add "and messages sent to the (disabled) assistant". Simpler: in the notice, say "a date and counts of visits and use". Wording that avoids "chat" keeps `privacy.test.ts:44` meaningful. Or, as a terminal change, stop calling `trackQuestion` while chat is off. |
| 4 | minor | `src/content/privacy.ts:30`, `:44` | **The notice is thinner than `compliance.md` §1.2/§1.6.** (a) Web Analytics data points: the notice says "country"; P2 lists country/region/city and a filtered query string. (b) Transfers: "data may be processed there" names no safeguard. §1.6 names the Vercel DPA with SCCs and DPF [I], and Art. 13(1)(f) expects a reference to it. Legal review is deferred (SQ-08 a), so this is not legal advice, but both gaps differ from the approved source. | Add "region and city" and "the query string, filtered". Add "under Vercel's data processing addendum (EU standard contractual clauses)", once CMP-07 (the DPA on file) is confirmed by the owner. |
| 5 | minor | `src/content/privacy.ts:38` | **The purpose and basis of `portfolio-analytics` are missing, and the sentence implies all terminal storage is necessary.** "The terminal settings exist only so that the features you choose work" covers theme, zoom and sound. §1.4 says `portfolio-analytics` is *not* strictly necessary and should be disclosed as such. Read with `:32`, the notice implies all four keys are functional. | Add one sentence: "portfolio-analytics only feeds the usage panel shown to you; clear it in your browser to remove it." This matches the §1.4 recommended option, "accept and disclose". |
| 6 | minor | `src/content/privacy.test.ts:25-29` | **Test that cannot fail for its stated purpose.** "lists every /terminal localStorage key the terminal code writes" checks a hard-coded list of four keys. A fifth key added to the terminal would not fail it. | Derive the keys: scan `src/terminal/**` (non-test) for `localStorage.setItem\(\s*['"]([^'"]+)` and for the `ANALYTICS_KEY` constant, then assert each appears in the notice. `:34`, `/retention|kept/i`, is also weak because "kept" occurs in unrelated text; nit. |
| 7 | minor | `src/content/facts.test.ts:98`, `:130` | **The CMP-xx allowance weakens the facts gate outside `privacy.ts`.** `CMP-\d{2}` is accepted as a reference in **all** `DATA_FILES`. A line in `profile.ts`, `work.ts` or `posts.ts` could cite `// CMP-03` instead of an F-row and skip fact tracing. Adding it to the `acOnly` exclusion (`:130`) also lets a line citing an AC plus a CMP skip the verbatim-AC check. Also, every privacy line cites the blanket `CMP-03`; the `(P1)` and `§1.x` hints are unchecked, the same gap as deferred U-05 #3. | Accept `CMP-xx` only when `l.file === 'privacy.ts'`, and require F/C/RQ rows elsewhere as before. Optionally check that `(Pn)` and `§1.n` cite rows and sections that exist in `compliance.md`. |
| 8 | minor | `src/terminal/page.tsx:456` | **A similar overclaim survives next to the corrected modal.** The terminal footer still says "🔒 Anonymous Analytics Only", beside the "Privacy Notice" button. The modal now says that Vercel processes IP addresses. The file is already edited (and excepted) in this unit. | Reword it to "Privacy-friendly analytics" or remove it. This is a text-only change under the existing rename exception. |
| 9 | minor | `edd-docs/edd-state.md` "Open questions" | **A DoD item is missing.** "Open legal items (compliance §4) listed in edd-state.md open questions" is not done; the list is "-". | List §4 items 1–7, or link them, as owner/legal follow-ups (SQ-08 a). |
| 10 | nit | `src/content/privacy.ts:12-13` | The name and LinkedIn URL are duplicated from `profile.ts`. Tests pin them equal, but the unit's pattern is "single source of truth". | Build `controller` from `profile`, or keep the duplication and state why (data-only content files). |
| 11 | nit | `src/content/types.ts:141` | `updated` accepts `YearMonth` and a loose `${number}` template; `"1.5-11-25"` type-checks. The test enforces ISO, so the type and the test disagree. | Use the `IsoDate` type, or just `string` plus the test. |
| 12 | nit | `src/content/privacy.ts:51` | "Vercel's standard, short log retention period" gives no period or criteria. `compliance.md` marks it "[I: confirm plan]". | Owner: confirm the plan's runtime/request log retention and state it. |
| 13 | nit | `src/content/privacy.ts:26` | "This site has no forms" is loosely true: `/terminal` has a command line and a (disabled) chat input. Typed text stays on the device, apart from #2. | Say "no sign-up or contact forms". |
| 14 | nit | `src/components/Footer.tsx:343` | On `/privacy` the footer "Privacy" link points at the current page without `aria-current="page"`. The default 404 (`_not-found`) has no footer, so it has no Privacy link (HOME-AC-27 only needs "the footer"). | Optional: pass a `current` flag; add a `(site)/not-found.tsx` with the footer later. |
| 15 | nit | `src/app/sitemap.ts`, `src/lib/sitemap-urls.ts:9` | `/privacy` is indexable (deliberate, `page.test.tsx:36`) but not in the sitemap. SEO-AC-04 does not require it. | Add it, or accept that it is linked from every page. |
| 16 | nit | `scripts/check-use-client.mjs:9`, `:33-34` | The header comment still says only `/` must be prerendered. `node:fs/promises` and `node:path` are allowed for **every** site module, not only `opengraph-image.tsx`. Node built-ins cannot reach the browser, so the client-JS gate is not weakened. But a site page could now read files at render time without a review. | Update the comment. Optionally scope the two built-ins to `src/app/(site)/opengraph-image.tsx`. |

## Checks with no finding
- **No email or phone:** none in `privacy.ts`, the page, the modal, the built `privacy.html` or the CG10_pii_scan run (53 files). The contact is LinkedIn, `profile.links.linkedin` (F-67). Every data line in `privacy.ts` carries a reference; `facts.test.ts` passes.
- **Terminal modal (TERM-AC-12):** it links to `/privacy` (a plain `<a>`, correct across the two root layouts). None of the five removed claims remains. No email. The new claims are true against the code: no cookies, no profiling or cross-site tracking, IP seen by Vercel, 24 h hash. The diff is text and markup only: no logic, props or handlers changed. The rename-exception reasons are accurate.
- **Groq credit removal** (`src/terminal/page.tsx`): markup only. CG10_groq passes.
- **The static-route check:** `STATIC_ROUTES` adds `/privacy` and keeps `/`. The new negative test (`check-use-client.test.mjs:101`) would fail if `/privacy` dropped out of the manifest. Nothing is weakened.
- **OG font (U-09 owner choice b):**
  - **Licence:** `fonts/OFL.txt` (SIL OFL 1.1, no Reserved Font Name) is committed next to `space-grotesk-latin-700-normal.woff`. The file is a real WOFF; the test checks the magic number.
  - **No network fetch:** the font comes from `readFile`. The ASCII guard is `opengraph-image.test.tsx:30`, so @vercel/og's dynamic glyph fetch is not triggered.
  - **Vercel build:** the route is in `prerender-manifest.json` (`/opengraph-image-12o0cb`), so it renders at build time, when `process.cwd()` is the project root. A future dynamic render would still work: `readFile(join(process.cwd(), …))` is the pattern Next's docs use, and file tracing picks it up.
  - **Routing:** the `fonts/` folder holds no route files, so nothing extra is served.
- **Security:** no new input, endpoint, dependency or secret. The page is static. The external link carries `noopener noreferrer`, and has no `target`.

## AC status
| AC | Status | Evidence |
|---|---|---|
| HOME-AC-27 | **Pass** (unit). e2e pending in the gate run. | `Footer.test.tsx:16`; footer on `/`, `/privacy` and the placeholders (`page.tsx:64`, `privacy/page.tsx:27`, `Placeholder.tsx:32`); built HTML shows `<a href="/privacy">` |
| HOME-AC-28 | **Partial:** "names the controller" is met only by the footer and brand text, not by the notice (#1). Everything else passes: 200 and static (prerender-manifest, `use_client` PASS), 1 `h1`, LinkedIn link, request logs and Web Analytics, Supabase counters on `/terminal`, the four keys, retention, rights, supervisory authority, no email. | `privacy.test.ts`, `page.test.tsx`, built `privacy.html`, `use_client.log` |
| TERM-AC-12 | **Pass** (unit). e2e pending in the gate run. | `PrivacyModal.test.tsx:18-29`; code read above |

## To approve
1. Fix #1 (render the controller name, and test the render).
2. Get `gates.md` green: update the README for CG14, and re-run Lighthouse on an idle machine.
3. Minors #2–#9 are cheap text or test fixes. Fix them in this unit, or defer them with the owner's agreement in `edd-state.md`.
