# U-04 Terminal: strip contact PII, chat off, PII scan gate: test plan (EDD stage 2.1)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Base:** `ffa7f1c` (`base.txt`) · **Unit:** `edd-docs/inception/units/U-04-terminal-pii-strip-chat-off.md`
- **ACs (7 active):** TERM-AC-07, 08, 09, 10, 11 · CONT-AC-14 · PLAT-AC-27. CONT-AC-09 is retired (duplicate of CONT-AC-14). All 7 are removed from `specs/pending.txt` (63 → 56).
- **U-03 review minors carried here:**
  - check-renames requires declared deletions;
  - check-unreachable scans `e2e/` and `scripts/` again;
  - the terminal `og:url` points to `/terminal`;
  - the dead `/v1` branch in VersionDropdown is removed;
  - the hidden SEO block in `src/terminal/layout.tsx` is removed.
- **Written by:** the orchestrator in the main session (the owner asked for live work, not agents).

## Traceability
| AC / item | Test file | Test (title contains the ID) | Level |
|---|---|---|---|
| TERM-AC-07 | `scripts/env-example.test.mjs` | `the /api/chat route and its terminal handler are deleted` | unit |
| | `e2e/terminal-chat-off.spec.ts` | `GET and POST /api/chat answer 404 or 410` | e2e |
| TERM-AC-08 | `src/terminal/features/chat-assistant/model/chatUnavailable.test.ts` (4) | constant (no email, names LinkedIn) · re-exported by the chat model · `usePromptShield().generateResponse` answers with it and sends no request · `handleSendMessage` replies with it and sends no chat request | unit (http client mocked) |
| | `e2e/terminal-chat-off.spec.ts` | open chat, send → unavailable text, 0 `/api/chat` requests, 0 page errors | e2e |
| TERM-AC-09 | `scripts/env-example.test.mjs` | 0 files under `src/` and `.env.example` contain `GROQ_API_KEY` | unit |
| TERM-AC-10 | `scripts/check-groq.test.mjs` (5) | pass clean · fail on `api.groq.com` in src · fail on `groq-sdk` in a build chunk · exit 2 with no build · real `src/` clean | unit (fixture) |
| | `scripts/env-example.test.mjs` | enforced gate runs `check-groq.mjs` | wiring |
| TERM-AC-11 | `scripts/env-example.test.mjs` | no email, `mailto:`, `tel:`, `wa.me` or `+44` number in non-test `src/` · contact data names LinkedIn and GitHub | unit |
| | `e2e/terminal-contact.spec.ts` | `contact` shows the LinkedIn and GitHub URLs; the page DOM has no email, phone, `mailto:`, `tel:` or `wa.me` | e2e |
| CONT-AC-14 | `scripts/pii-scan.test.mjs` (11) | pass clean · email in HTML (names file:offset and match) · `mailto:` / `tel:` / `wa.me` / phone in a JS chunk · RSC payload · allow-list skip, and an entry needs a reason · server chunks and cache not scanned · exit 2 with no build | unit (fixture) |
| | `scripts/env-example.test.mjs` | enforced gate runs `pii-scan.mjs` · `pii-allowlist.json` entries have a match and a reason | wiring |
| | gate run | `pii-scan` over the real build output: 0 matches | gate |
| PLAT-AC-27 | `scripts/env-example.test.mjs` | `.env.example` has none of the 3 keys | unit |
| Minor: deletions | `scripts/check-renames.test.mjs` (+2) | a moved file deleted later without an exception fails and is named; it passes when declared | unit (git fixture) |
| Minor: unreachable | `scripts/check-unreachable.test.mjs` (3) | clean fixture passes (fixture strings are ignored) · e2e spec importing a missing module fails · a scripts test import statement pointing to a missing module fails | unit (fixture) |
| Minor: og:url, SEO block, `/v1` | `scripts/env-example.test.mjs` | `og:url` is `https://tijothomas.dev/terminal` · no `seo-content` · no `"/v1"` literal in VersionDropdown | unit |

**Re-run unchanged:** TERM-AC-01 to 06 (e2e and unit), the U-02 React 19 spec, smoke, CSS diff and pixel diff. The only allowed visual change is in the contact output.

## Interfaces fixed by the tests
- `src/terminal/features/chat-assistant/model/chatUnavailable.ts` exports `CHAT_UNAVAILABLE_MESSAGE`, which `useChatAssistant.ts` re-exports. Prompt-shield imports the small module, so there is no import cycle.
- `node scripts/pii-scan.mjs [--root] [--allow]`:
  - scans `.next/server/app/**` and the served file types under `.next/static/**`;
  - allow-list file is `scripts/pii-allowlist.json` (`{allow:[{match, reason}]}`);
  - exits 0, 1, or 2 when there is no build.
- `node scripts/check-groq.mjs [--root] [--no-build]` exits 0, 1, or 2.

## Red run (2026-11-24, tests only)
- **node:test** (5 files): 42 tests, **29 fail and 13 pass**. The 13 passing tests are the existing rename tests plus the clean-fixture and fixture-string cases. Every new test fails for the intended reason: a missing script, a PII string still present, the chat route still present, the env keys still present, or the minors not done.
- **Vitest:** `Failed to resolve import "./chatUnavailable"` (module not written yet).
- **spec:check:** PASS (cited 36, pending 56).
