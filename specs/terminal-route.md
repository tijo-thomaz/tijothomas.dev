# Terminal route (`/terminal`)
Status: Approved (PG1 2026-11-23)
Prefix: TERM
Traces: FR-003–FR-006, FR-072, NFR-031; US-02, US-03, US-24

The terminal's behaviour must not change. These ACs only pin down where it lives and that it still works.

## Acceptance criteria
- **TERM-AC-01** — Given `next start`, when `/terminal` loads, then the response is 200, 0 uncaught console errors are logged, and typing `help` prints the help output. _Traces: FR-003, FR-072, NFR-031, US-03 · Verify: e2e_
- **TERM-AC-02** — Given a theme is chosen on `/terminal`, when the page reloads, then the theme persists via `localStorage['tijothomas-theme']`. _Traces: FR-003, NFR-031, US-03 · Verify: e2e_
- **TERM-AC-03** — Given the `/terminal` HTML, when inspected, then it has `<meta name="robots" content="noindex, follow">` and canonical `<siteUrl>/terminal`. _Traces: FR-004, FR-050, US-03, US-16 · Verify: unit_
- **TERM-AC-04** — Given a request to `/v2`, when the server responds, then the status is 308 and `location` is `/terminal`. _Traces: FR-005, US-03 · Verify: e2e_
- **TERM-AC-05** — Given the version list used by the VersionSelector, when every route is checked, then each one resolves to an existing route or redirect, and "v1" is `/terminal`. _Traces: FR-006, US-03 · Verify: unit_
- **TERM-AC-06** — Given no Supabase env vars, when `/terminal` loads, then the terminal renders and analytics fails soft (no uncaught error). _Traces: FR-062, US-02 · Verify: e2e_
