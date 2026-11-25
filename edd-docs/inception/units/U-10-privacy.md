# U-10 Privacy notice (`/privacy`) and corrected terminal modal
Stories: — (PG3 SQ-02 a, ADR-P3, CMP-03)     Depends on: U-06, U-04
Flags: hot-path: no · critical: no · ai: no
Estimate: S
Paths follow the `src/` layout (amended 2026-11-24).

## Goal
One accurate privacy notice, reachable from `/` and from the terminal, with LinkedIn as the contact channel and no email.

## ACs covered
HOME-AC-27, HOME-AC-28, TERM-AC-12

## Scope
1. `src/content/privacy.ts`: controller (owner name), contact channel (LinkedIn URL, F-67), processing (Vercel request logs, Vercel Web Analytics with 24 h hash, Supabase date counters on `/terminal`, `/terminal` localStorage keys incl. `portfolio-analytics`), lawful basis (legitimate interests), processors and transfers (Vercel, Supabase), retention, rights incl. Art. 11 note, right to complain (EU DPA / UK ICO), last-updated date. Chat → Groq is **not** listed (chat disabled). Text per `compliance.md` §1; legal review later (SQ-08 a).
2. `src/app/(site)/privacy/page.tsx` (static server component, 1 `h1`, metadata title/description/canonical) + `src/components/PrivacyNotice.tsx`.
3. Footer "Privacy" link → `/privacy`.
4. Terminal privacy modal (`src/terminal/widgets/PrivacyPolicy/molecules/PrivacyModal.tsx`): text-only change: remove "No IP Tracking" / "Data stays in your browser" claims, add a link to `/privacy`. Add the file to `scripts/rename-exceptions.json`.

Out of scope: legal sign-off (owner, after release), cookie banner (not needed: `/` stores nothing, HOME-AC-26).

## Files touched
`src/content/privacy.ts` + test, `src/app/(site)/privacy/page.tsx`, `src/components/PrivacyNotice.tsx` + test, `src/components/Footer.tsx` + test, `src/terminal/widgets/PrivacyPolicy/molecules/PrivacyModal.tsx`, `scripts/rename-exceptions.json`, `e2e/privacy.spec.ts`, `e2e/terminal-privacy.spec.ts`, `CHANGELOG.md`.

## Definition of Done
- ACs pass; `npm run gates` green (PII scan covers `/privacy`).
- Review clean; CHANGELOG; open legal items (compliance §4) listed in `edd-state.md` open questions.

## Patterns used
- Single source of truth for the notice (content module, linked from both route groups).
- Text-only change in legacy code, tracked as a rename-similarity exception.
