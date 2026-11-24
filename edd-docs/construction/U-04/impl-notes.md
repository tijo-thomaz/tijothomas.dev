# U-04 Terminal: strip contact PII, chat off, PII scan gate: implementation notes (EDD 2.2)

- **Commits:** `57c1e62` (tests) → `0c3b05c`. Base `ffa7f1c`. Done by the orchestrator in the main session.

| Commit | What |
|--------|------|
| `016d28c` A | PII strip in `Terminal.tsx` (`about` line, `contact`, `git log` authors, resume text), `lib/utils.ts` (CV text), `useChatAssistant.ts` (context and messages), `usePromptShield.ts` fallback, `PrivacyModal.tsx` (email → LinkedIn link). The `ContactActions` / `ContactMessage` email and WhatsApp buttons were removed and a GitHub button added. |
| `f7fc3df` B | `CHAT_UNAVAILABLE_MESSAGE` in `chat-assistant/model/chatUnavailable.ts`, re-exported by `useChatAssistant.ts`. `usePromptShield().generateResponse` returns it and sends no request; its unused client-side "checks" were removed. `src/app/api/chat` and `src/terminal/api/chat` were deleted, and the `/api/chat` entry test was removed. |
| `997d00d` C | `.env.example` now holds only the optional Supabase URL and anon key. |
| `b8c6890` | Carried minors: the terminal layout's hidden SEO block is removed (it held the email and phone) along with its CSS; `og:url` is `https://tijothomas.dev/terminal`; the dead `/v1` → `/` branch is removed. |
| `5d62e1b`, `5964c17`, `b418e59` | New gates `pii-scan.mjs`, `check-groq.mjs` and `pii-allowlist.json`. `check-renames` now requires declared deletions, and `check-unreachable` also checks imports in `e2e/` specs and in `scripts/*.test.mjs` top-level import statements. The dead `shared/api/http.ts` was deleted. |
| `82bd8bb`, `0c3b05c` | Docs; component tests; folder names from `paths.mjs`; `zod` removed. |

## Deviations and decisions for the owner
1. **Commit A is not strictly data-only.** The DoD asks the reviewer to sign it off as data-only. The two contact components changed structure as well as strings: email and WhatsApp handlers and buttons were removed (the unit scope asks for this), and a **GitHub button was added**, which the scope does not mention. The GitHub link follows F-68. Every other file in commit A changes strings only.
2. **Terminal prompt changed** from `tijo@tijothomas.dev:~$` to `tijo@tijothomas:~$`. CG10_pii_scan flagged it as an email address, and the owner rule is no email anywhere. If `tijo@tijothomas.dev` is not a real mailbox and you want the old prompt back, the alternative is an allow-list entry. I do not recommend that, because it looks like an address to visitors.
3. **pii-scan rules beyond the AC regex.** CONT-AC-14's phone regex matched 354 strings, almost all SVG path data. The scanner now:
   - reads only served files (`.html`, `.rsc` and `.body` under `.next/server/app`, plus text assets in `.next/static`). Trace manifests (`.nft.json`) are not served.
   - applies four documented non-contact rules: part of a longer token; fewer than 10 or more than 15 digits; a decimal fraction; two or more single-digit groups.
   - matches `tel:` only when a number follows (React DOM ships an input-type map containing `tel:!0`).

   A test pins each rule, plus an unspaced UK mobile that must still be caught. The allow-list has 3 exact library constants, each with a reason.
4. **Chat message text** (new copy): "The chat assistant is turned off for now. Type 'help' in the terminal to explore, or connect with Tijo on LinkedIn: linkedin.com/in/tijo-j-thomaz93". Please confirm or reword.
5. **Test contract changes after the red run:**
   - `chatUnavailable.test.ts` now stubs `fetch` instead of mocking `http.ts`, because `http.ts` became dead and was deleted.
   - the `tel:` fixture now carries a number.
   - the fixture paths in the new node tests come from `paths.mjs`.
6. **Lint warnings 109 → 94.** The ceiling stays at 109. Proposal: ratchet it to 94 in a later unit (the oxlint config test pins the number).
7. **Out of scope and noted:**
   - `src/terminal/page.tsx` still links to `groq.com` ("powered by" text). It is not `api.groq.com` and not an SDK import, so TERM-AC-10 passes. The link is now misleading → U-10.
   - The privacy modal wording ("Data stays in your browser", …) is TERM-AC-12 → U-10.
8. **Open owner console actions** (unchanged): delete `GROQ_API_KEY` in Vercel; SQ-07 (check that no service-role key is set in Vercel).

## Verification (main checkout, no build)
tsc 0 · lint 0 errors (94 warnings) · vitest 218/218 · node 186/186 · spec:check PASS (pending 56) · npm audit high 0 · check-deps PASS. Builds and e2e ran in scratchpad worktrees only.
