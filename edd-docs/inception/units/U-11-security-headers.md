# U-11 Security headers, site CSP, release checks
Stories: US-22 (primary)     Depends on: U-09, U-10
Flags: **critical** (a CSP mistake can break `/` or `/terminal` silently) · hot-path: no · ai: no
Estimate: S

## Goal
Ship the two-tier static header set (ADR-P1) without making `/` dynamic, and close the release checklist.

## ACs covered
PLAT-AC-20, PLAT-AC-21, PLAT-AC-22, PLAT-AC-24, PLAT-AC-26

## Scope
1. `next.config.js`: `poweredByHeader: false`; `headers()` returns the baseline rule for `/:path*` first (HSTS `max-age=63072000; includeSubDomains`, nosniff, Referrer-Policy, Permissions-Policy, `X-Frame-Options: DENY`, COOP `same-origin`, CSP `frame-ancestors 'none'; object-src 'none'; base-uri 'none'`), then the site CSP (threat-model §6.2) for `/`, `/privacy`, `/work/:path*`, `/writing/:path*`, `/opengraph-image`, `/sitemap.xml`, `/robots.txt`. Dev-only `'unsafe-eval'` (+ Vercel debug host if the installed analytics needs it).
2. e2e header checks on every route class, CSP violation listener on `/`, analytics script request, `.map` check gate.
3. Release checks: `specs/pending.txt` is empty (all 93 ACs cited); full `npm run gates`; owner attestations recorded in `edd-docs/construction/U-11/owner-checklist.md`: SQ-07 (no service-role key), SQ-06 (preview protection on, `GROQ_API_KEY` deleted), SQ-09 (MFA, no dangling DNS), SEC-21 (SSL Labs ≥ A after deploy).

Out of scope: nonce/hash CSP (rejected, ADR-P1), CSP reporting (SEC-44, deferred), HSTS preload (SQ-03 a).

## Files touched
`next.config.js`, `next.config.test.ts`, `e2e/headers.spec.ts`, `e2e/csp.spec.ts`, `scripts/check-sourcemaps.mjs`, `gates.yml`, `specs/pending.txt` (delete or empty), `CHANGELOG.md`, `README.md` (security headers + remediation timeframes, SEC-13).

## Definition of Done
- ACs pass; `/` still static in the build route table; TERM-AC-01/02 and Lighthouse still green.
- `npm run gates` fully green with nothing report-only; spec:check 93/93.
- Owner checklist complete (or open items accepted as residual risks in `edd-state.md`).
- Review clean; CHANGELOG.

## Patterns used
- Defence in depth with static edge headers (gatekeeper at the CDN, no per-request code).
- Ordered rule override (baseline everywhere, stricter CSP on site routes), asserted per route class so ordering mistakes cannot fail silently.
