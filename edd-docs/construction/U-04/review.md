# U-04 Terminal PII strip + chat off: review (EDD stage 2.3)

- **Date:** 2026-11-24 · **Reviewer:** independent principal-engineer review (not the author) · **Range:** `ffa7f1c..0d75cb8` (`git diff -- . ':!edd-docs'`, 40 files). I also read the follow-up `f030b11` (GitHub username fix, which sits in the U-05 range) and `636522e` (CHANGELOG repair).
- **Precondition:** `gates.md` records 19/19 enforced gates PASS at `0c3b05c`. The unit is reviewable.
- **Requested by:** the owner, after the orchestrator skipped stage 2.3 for this unit.

## What I ran myself (main checkout at `a773f38`, read-only; no build, no dev server, no Playwright)
| Check | Result |
|-------|--------|
| `npx vitest run` | 26 files, 283/283 pass |
| `node --test scripts/*.test.mjs` | 205/205 pass |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | exit 0; 0 errors, about 94 warnings (ceiling 109), all in `src/terminal/**` |
| `node scripts/check-unreachable.mjs` / `check-imports.mjs` | all PASS |
| `npm audit --audit-level=high` | exit 0 (7 moderate) |
| Repo grep for the old PII and the wrong GitHub username | no email, phone or `wa.me` in non-test `src/`. **`github.com/tijo-thomas` is still in `src/terminal/lib/utils.ts:40`** (see #1) |
| `pii-scan.mjs` phone rule probe (the script's regex and R2-R4 copied into a scratch file) | `+44 7818 989060\n2019 - 2023` → one run of 20 digits → skipped by R2. `+44.7818.989.060` and `555.123.4567` → skipped by R3 (see #2) |

## Commit A (`016d28c`) data-only sign-off (DoD item)
**Verdict: NOT data-only. I accept it as a recorded deviation; I do not sign it off as data-only.**

- **String-only changes (data-only):** `Terminal.tsx` (the `about` line, `contact`, the `git log` authors and the resume text), `lib/utils.ts`, `useChatAssistant.ts` (`portfolioContext` and two message strings), `usePromptShield.ts:213` and `PrivacyModal.tsx`. The modal's `mailto:` link became an https LinkedIn link with `target="_blank" rel="noopener noreferrer"`. That is an attribute change, but an acceptable one.
- **Not data-only:**
  - `ContactActions.tsx` and `ContactMessage.tsx`:
    - removed `useState`, the clipboard, `mailto:` and WhatsApp handlers and two buttons. This is the subtractive change the scope asks for ("hide the email/WhatsApp buttons").
    - **added a new GitHub button and handler.** The scope does not ask for this.
    - refactored `contactInfo` to module scope and extracted a `buttonStyle` constant.
  - `scripts/rename-exceptions.json` was also reformatted.
- **Commit message and recorded reason are inaccurate:** the subject says "(data only)", and the `rename-exceptions.json` reasons say "data-only contact PII strip".
- **Commit A also introduced a defect:** the GitHub account was typed as `tijo-thomas`. `f030b11` fixed it in 5 of 6 places; #1 is the sixth.
- **Why I accept the deviation:**
  - the logic change is subtractive apart from the GitHub button;
  - the GitHub button is backed by F-68 and by a test (`ContactActions.test.tsx`);
  - no new network, storage or state paths appear;
  - TERM-AC-01/02 stayed green in the e2e run.
- **Owner action:** record this deviation in `audit.md` so the DoD line is closed honestly. The owner should acknowledge the added GitHub button.

## Findings
| # | Severity | File:line | Finding | Fix | Status |
|---|----------|-----------|---------|-----|--------|
| 1 | **major** | `src/terminal/lib/utils.ts:40` | The generated CV text that `/terminal` serves (`resume`/download) still says `GitHub: github.com/tijo-thomas`. That is the wrong account (F-68 is `tijo-thomaz`), and it may belong to someone else. `f030b11`'s commit message, `U-05/impl-notes.md:7` and `CHANGELOG.md:39-40` all say "the CV text" was fixed, but `f030b11` does not touch `utils.ts`. The guard test (`scripts/env-example.test.mjs:50-54`) only checks the `contact: [` slice of `Terminal.tsx`, so it cannot catch this. This breaks the "never invent facts" rule on a served route. | Change it to `github.com/tijo-thomaz`. Add a repo-wide test: no non-test file under `paths.siteRoots` matches `/github\.com\/tijo-thomas\b/`, and every `github.com/` URL equals `profile.links.github`'s host/path. Correct the U-05 impl-notes and CHANGELOG wording or keep it once the fix lands. | open |
| 2 | **major** | `scripts/pii-scan.mjs:30`, `:40-41` | **The phone rule can miss real numbers.** The phone regex is greedy over `[\d\s().-]`, so `\s` matches newlines and a real number merges with the digits that follow it. `Phone: +44 7818 989060\n2019 - 2023` becomes one 20-digit run, which R2 (more than 15 digits) then discards. A CV or terminal text block where a dates line follows a phone line passes the gate. Separately, R3 (`\d\.\d` → "decimal fraction") discards every dot-separated phone format (`+44.7818.989.060`, `555.123.4567`). Both rules are documented, but neither has a negative fixture for these shapes. CONT-AC-14 is the owner's main enforcement of ADR-P5. | (a) Do not discard on R2-too-long. Split the run on newlines, and on whitespace runs of 2 or more characters, then re-test each piece; or limit the separator class to `[ \t().-]`. (b) Limit R3 to runs with exactly one `.` and no other separators (a coordinate such as `12.5`), or to a fraction part of 1-3 digits next to a non-digit. (c) Add fixtures to `pii-scan.test.mjs` that must FAIL: `+44 7818 989060\n2019`, `+44.7818.989.060`, `07818 989060 2024`. | open |
| 3 | minor | `scripts/pii-scan.mjs:32-35,67-70` | The scan covers `.next/server/app` and `.next/static`, but not `public/`, which is served verbatim (today it holds only `favicon.svg`, but a future `cv.txt`/`.vcf`/`.xml` would be served unscanned). The scan also does not check that each route was prerendered: if a site route becomes dynamic, its HTML is never on disk and the gate passes without seeing it. | Add `public/**` (text extensions) to the scan. Fail, or at least warn, when an app route in `.next/app-path-routes-manifest.json` has no `.html`/`.rsc` under `.next/server/app`, so dynamic routes cannot pass by absence. | open |
| 4 | minor | `src/terminal/components/ContactActions.tsx:25,36`; `ContactMessage.tsx:13,17` | `window.open(url, '_blank')` without `noopener` leaves `window.opener` set for the LinkedIn and GitHub tabs (reverse tabnabbing). An `<a target="_blank">` implies noopener; `window.open` does not. The destinations are trusted, so the risk is low, but commit A rewrote these lines. | `window.open(url, '_blank', 'noopener,noreferrer')` and update the two `toHaveBeenNthCalledWith` assertions. | open |
| 5 | minor | `edd-docs/inception/threat-model.md:85,116,124,126` | Traceability: A9 still says "still hard-coded in 7 modules `/terminal` reaches". T-21 (`Open (SQ-05)`), T-30 and T-32 (`/api/chat`) are still Open, although U-04 removed the PII and deleted the route. U-03 review #1 also asked for T-21's mitigation text to name `src/terminal/layout.tsx`. | Mark T-21, T-30 and T-32 mitigated by U-04 (commits `016d28c`, `f7fc3df`, `b8c6890`; gates CG10_pii_scan, CG10_groq). Update A9. | open |
| 6 | nit | `016d28c` message; `scripts/rename-exceptions.json` (U-04 entries for `ContactActions`/`ContactMessage`) | The commit subject "(data only)" and the reason "data-only contact PII strip" contradict the diff (see the verdict above). The JSON reasons do mention the GitHub button. | Leave history alone. Record the deviation in `audit.md`, and drop "data-only" from the two component exception reasons. | open |
| 7 | nit | `src/terminal/features/chat-assistant/model/useChatAssistant.ts:250` | When `navigator.onLine` is false, the chat replies with a separate "currently offline…" string, not `CHAT_UNAVAILABLE_MESSAGE`. The unit asks for "a single 'chat unavailable' message constant" on every path. This is harmless and makes no request. | Return `CHAT_UNAVAILABLE_MESSAGE` there too, or note the exception. | open |
| 8 | nit | `scripts/check-unreachable.mjs` (`TOP_LEVEL_IMPORT`) | For `scripts/*.test.mjs`, only top-level `import … from` statements are checked. A dynamic `await import('./x.mjs')` of a missing module is not seen; `node --test` would still fail at runtime. | Optional: also match `^\s*(?:const\|let).*await import\(['"]…` at line start. | open |
| 9 | nit | CG14_docs (`gates.md` row "CG14_docs … PASS") | At `82bd8bb`..`0c3b05c` the CHANGELOG held a second copy of the file header in the middle of "Changed", and CG14_docs still passed. It was repaired in `636522e`. The docs gate checks presence, not structure. | Make the docs check fail on more than one `# Changelog` or `## [Unreleased]` heading. | open |

**Counts:** blocker 0 · major 2 · minor 3 · nit 4

## Other checks (no finding)
- **Chat off:** `usePromptShield.generateResponse` returns the constant and sends no request. `src/app/api/chat` and `src/terminal/api/chat` are deleted. `http.ts` is deleted, and no other caller of `/api/chat` remains (grep). The e2e test checks 404 on GET and POST, 0 `/api/chat` requests and 0 `pageerror` events. `trackQuestion()` sends only `{type, timestamp}`, never the question text.
- **`check-renames`:** a deletion must now be declared. The new test covers both the undeclared case (fails) and the declared case (passes). This is a stronger gate, not a weaker one.
- **`check-groq`:** exits 2 if a root or the build is missing, so it cannot pass vacuously. Matching on substrings is enough for TERM-AC-10. The `groq.com` "powered by" link in `src/terminal/page.tsx:420` is correctly out of scope (U-10).
- **`pii-allowlist.json`:** 3 exact numeric constants, each with a reason. Matching is exact-text and global, which is acceptable for these three values.
- **Hidden SEO block, `og:url` and `/v1` branch (U-03 carried minors):** done and pinned by tests.
- **Dependencies:** removing `zod` is correct (it became unused). No new runtime dependencies.

## Verdict
**changes-required.** #1 is a wrong fact still served on `/terminal`, and a later commit claimed it was fixed. #2 is a real false-negative path in the gate that enforces the owner's no-phone rule. Both are small fixes with fixtures. The commit-A deviation needs an `audit.md` entry; it does not need a code change.
