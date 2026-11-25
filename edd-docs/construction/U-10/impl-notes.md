# U-10 Privacy notice: implementation notes (EDD 2.2)

- **Commits:**
  - `707675a` tests (red);
  - `1612fe2` implementation;
  - `922c2d2` the `src/terminal/page.tsx` edit declared in `rename-exceptions.json` (PLAT-AC-10);
  - `7aeba24` review fixes.

  Base `692faaf`. Done by the orchestrator in the main session. `edd-reviewer` ran in the background (`review.md`).

## What was built
- `src/content/privacy.ts` is the notice text, typed, with each line referencing F-xx or CMP-xx. It states what `compliance.md` §1 says:
  - **Controller:** Tijo Thomas, Bengaluru, India, contacted by LinkedIn message only (no email, ADR-P5).
  - **Vercel:** request logs and Web Analytics, which is cookieless and keeps a daily visitor hash.
  - **`/terminal`:** Supabase usage counters, plus four `localStorage` keys, each with its purpose.
  - Legal basis, processors, retention, rights (Art. 11) and how to complain.
  - Chat and Groq are absent, because the chat is off.
- **`/privacy`:** a static server route (`src/app/(site)/privacy/page.tsx`) rendered by `PrivacyNotice`, with one `h1`. `check-use-client` now requires both `/` and `/privacy` to be prerendered (HOME-AC-28).
- **Footer:** a "Privacy" link to `/privacy` on `/`, on `/privacy` and on the placeholders (HOME-AC-27).
- **Terminal privacy modal (TERM-AC-12):**
  - The "No IP Tracking" and "Data stays in your browser" claims are removed.
  - The modal now links to `/privacy`.
  - The terminal footer says "Cookieless Analytics".
  - The stale "powered by Groq" credit is removed.

## Decisions for the owner (PG5)
1. **Legal review** happens after release, by your lawyer or DPO (SQ-08 a). The eight open items are listed under "Open questions" in `edd-state.md`.
2. **Transfer safeguard:** the notice does not name one (SCCs or DPF) until the Vercel DPA is confirmed on file (CMP-07).
3. **Review nits #10–#16 are still open** (see `gates.md`). Fix them now, or carry them to U-11. #12 needs your input: which log retention period applies to your Vercel plan.
