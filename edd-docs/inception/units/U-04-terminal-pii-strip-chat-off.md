# U-04 Terminal: strip contact PII, disable chat, PII scan gate
Stories: — (PG3 decisions SQ-01 c, SQ-05 a, SQ-07 a); US-12 (part)     Depends on: U-03
Flags: **critical** (the chat UI must degrade without errors) · hot-path: no · ai: no (removes the only AI call)
Estimate: S

## Goal
After this unit no route serves the owner's email or phone, and no route talks to Groq.

## ACs covered
TERM-AC-07, TERM-AC-08, TERM-AC-09, TERM-AC-10, TERM-AC-11, CONT-AC-09, CONT-AC-14, PLAT-AC-27

## Scope
1. **Commit A, data-only PII strip (SQ-05 a):** remove the email, UK phone and WhatsApp strings from `terminal/components/Terminal.tsx` (`contact`, `git log` author lines, resume error text), `terminal/lib/utils.ts` (generated CV text), `terminal/components/ContactMessage.tsx`, `terminal/components/ContactActions.tsx` (hide the email/WhatsApp buttons), `terminal/features/chat-assistant/model/useChatAssistant.ts` (`portfolioContext` contact), `terminal/features/prompt-shield/model/usePromptShield.ts:213`, `terminal/widgets/PrivacyPolicy/molecules/PrivacyModal.tsx` (email line only; the rest of the text is U-10). Contact output points to LinkedIn (F-67) and GitHub (F-68). No logic changes.
2. **Commit B, chat off (SQ-01 c):** delete `app/api/chat/`. Every client path that called `/api/chat` returns a single "chat unavailable" message constant instead of fetching. No other terminal changes.
3. **Commit C:** `.env.example` without `GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RATE_LIMIT_REQUESTS_PER_MINUTE`.
4. **Gate:** `scripts/pii-scan.mjs` over all served HTML/RSC/JS of every route incl. `/terminal` (CONT-AC-14, CONT-AC-09) and `scripts/check-groq.mjs` (TERM-AC-10). Add the files from commits A and B to `scripts/rename-exceptions.json` (PLAT-AC-10 exception).

Out of scope: rewording the terminal privacy modal (U-10), any other terminal fix (chat XSS SEC-41, prompt injection SEC-40: deferred, moot while chat is off).

## Files touched
Listed in Scope 1–3, plus `scripts/pii-scan.mjs`, `scripts/pii-allowlist.json`, `scripts/check-groq.mjs`, `scripts/rename-exceptions.json`, `gates.yml`, `e2e/terminal-chat-off.spec.ts`, `e2e/terminal-contact.spec.ts`, `env-example.test.ts`, `CHANGELOG.md`.

## Interfaces
- `/api/chat` → 404.
- `CHAT_UNAVAILABLE_MESSAGE` constant in the chat model module.
- `node scripts/pii-scan.mjs [--routes all]` → exit 1, prints `file:offset pattern`.

## Definition of Done
- ACs pass; `npm run gates` green.
- Robustness: open the floating chat and the terminal chat command, send a message → unavailable text, 0 console errors (TERM-AC-08); TERM-AC-01/02 still green.
- Commit A diff reviewed as data-only (reviewer signs off in `review.md`).
- Owner console actions noted as open in `edd-state.md`: delete `GROQ_API_KEY` from Vercel; SQ-07 service-role key check.
- Review clean; CHANGELOG.

## Patterns used
- Data minimisation (remove PII at the source rather than hide it).
- Graceful degradation (fixed fallback message instead of a failing request).
- Gatekeeper scan on build output (catches PII regardless of where it came from).
