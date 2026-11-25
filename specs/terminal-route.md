# Terminal route (`/terminal`)
Status: Approved (PG1 2026-11-23; amended after PG3 2026-11-23; amended 2026-11-24: `src/` layout)
Prefix: TERM
Traces: FR-003–FR-006, FR-072, NFR-031; US-02, US-03, US-24; SEC-12, SEC-30–SEC-35 (met by removal); T-21, T-23, T-30–T-35; CMP-03–CMP-05

The terminal's behaviour must not change, except for three PG3 changes: the chat backend is disabled (SQ-01 c), contact PII is stripped from terminal data (SQ-05 a), and the privacy modal text is corrected (SQ-02 a). These ACs pin down where it lives, that it still works, and those three changes.

## Decisions (PG3, 2026-11-23)
- **ADR-P2 (outcome: disable):** `src/app/api/chat` (formerly `app/api/chat`) is deleted until the "Ask Tijo" rebuild. The terminal chat UI shows a "chat unavailable" state. No Groq key is read and no Groq request is made anywhere. The guard (proposed SEC-30–35 controls) is not built.
- **SQ-05:** PII strip is a data-only commit, separate from the `git mv` commit: string/data edits and hiding the email/WhatsApp chat buttons; no logic changes. Recorded exception to PLAT-AC-10.

## Acceptance criteria
- **TERM-AC-01** — Given `next start`, when `/terminal` loads, then the response is 200, 0 uncaught console errors are logged, and typing `help` prints the help output. _Traces: FR-003, FR-072, NFR-031, US-03 · Verify: e2e_
- **TERM-AC-02** — Given a theme is chosen on `/terminal`, when the page reloads, then the theme persists via `localStorage['tijothomas-theme']`. _Traces: FR-003, NFR-031, US-03 · Verify: e2e_
- **TERM-AC-03** — Given the `/terminal` HTML, when inspected, then it has `<meta name="robots" content="noindex, follow">` and canonical `<siteUrl>/terminal`. _Traces: FR-004, FR-050, US-03, US-16 · Verify: unit_
- **TERM-AC-04** — Given a request to `/v2`, when the server responds, then the status is 308 and `location` is `/terminal`. _Traces: FR-005, SEC-12, US-03 · Verify: e2e_
- **TERM-AC-05** — Given the version list used by the VersionSelector, when every route is checked, then each one resolves to an existing route or redirect, and "v1" is `/terminal`. _Traces: FR-006, US-03 · Verify: unit_
- **TERM-AC-06** — Given no Supabase env vars, when `/terminal` loads, then the terminal renders and analytics fails soft (no uncaught error). _Traces: FR-062, US-02 · Verify: e2e_

### Chat disabled (SQ-01 c)
- **TERM-AC-07** — Given `next start`, when `GET` and `POST` are sent to `/api/chat`, then each returns 404 (route removed) or 410. _Traces: T-30–T-35, SEC-30–SEC-35, CMP-04, ADR-P2 · Verify: e2e_
- **TERM-AC-08** — Given `/terminal`, when the chat is opened and a message is sent, then the panel shows the "chat unavailable" text, no request is made to `/api/chat`, and 0 uncaught console errors are logged. _Traces: NFR-031, T-30, ADR-P2 · Verify: e2e_
- **TERM-AC-09** — Given `src/**` and `.env.example`, when searched, then 0 files contain `GROQ_API_KEY`. _Traces: SEC-18, T-42, ADR-P2 · Verify: unit_
- **TERM-AC-10** — Given `src/**` and a production build (`.next/server`, `.next/static`), when searched, then 0 files contain `api.groq.com` or `groq`-SDK imports. _Traces: T-30, T-40, CMP-04, ADR-P2 · Verify: gate_

### Contact PII and privacy (SQ-05 a, SQ-02 a)
- **TERM-AC-11** — Given `/terminal`, when `contact` is typed, then the output lists the LinkedIn and GitHub URLs and contains no email address, phone number or `wa.me` link. _Traces: T-21, CMP-05, SEC-23 · Verify: e2e_
- **TERM-AC-12** — Given the terminal privacy modal, when opened, then it contains a link to `/privacy`, no email address, and none of the strings "No IP Tracking" or "Data stays in your browser". _Traces: T-23, CMP-03, ADR-P3 · Verify: e2e_
