# U-11 Security headers, site CSP, release checks: test plan (EDD stage 2.1)

- **Date:** 2026-11-25 · **Branch:** `u11-security-headers` (from `redesign-home` at `6fedeed`; `base.txt`) · **Unit:** `edd-docs/inception/units/U-11-security-headers.md`
- **ACs (5):** PLAT-AC-20, 21, 22, 24 and 26. `specs/pending.txt` is now empty (5 → 0), and spec-check cites 92 of 92 active ACs. CONT-AC-09 is retired; it was the 93rd AC.
- **Header values:** from `threat-model.md` §6.1 (baseline) and §6.2 (site CSP), following ADR-P1 (a static CSP with `'unsafe-inline'`, no nonce, so `/` stays static).

## Traceability
| AC | Test file | What the tests check | Level |
|---|---|---|---|
| PLAT-AC-20 | `scripts/security-headers.test.mjs`, `e2e/headers.spec.ts`, `e2e/csp.spec.ts` | `poweredByHeader: false`. `GET /` sends HSTS, nosniff, Referrer-Policy, Permissions-Policy and `frame-ancestors`, with no `x-powered-by`. `/` loads with 0 `securitypolicyviolation` events. | unit + e2e |
| PLAT-AC-21 | same files | The first rule is the `/:path*` baseline with the exact §6.1 values. HSTS has no `preload`. `/terminal`, `/api/analytics` and a 404 each carry the full baseline set. `/terminal` keeps the baseline CSP only (no `script-src` or `connect-src`, RQ-11 a), and loads with 0 violations and 0 page errors. The README documents the header set and the SEC-13 remediation timeframes. | unit + e2e |
| PLAT-AC-22 | same files | Every site route (`/`, `/privacy`, `/work/:path*`, `/writing/:path*`, `/sitemap.xml`, `/robots.txt`) has a site-CSP rule after the baseline. The production `script-src` is exactly `'self' 'unsafe-inline'`. `object-src`, `base-uri`, `form-action`, `frame-ancestors` and `frame-src` are all `'none'`. `'unsafe-eval'` and the analytics debug host appear only in development. Checked on real responses for `/`, `/privacy`, a placeholder, the sitemap and robots. `/privacy` and a placeholder load with 0 violations. | unit + e2e |
| PLAT-AC-24 | `e2e/csp.spec.ts` | `/` requests `/_vercel/insights/script.js` and fires 0 CSP violations. | e2e |
| PLAT-AC-26 | `scripts/check-sourcemaps.test.mjs` (4), `security-headers.test.mjs` | The gate passes when `.next/static` has no `.map` file, fails naming every `.map` there, and exits 2 with no build. An enforced gate runs it. `productionBrowserSourceMaps` is not enabled. | gate (fixture) + unit |

## Red run
`node --test scripts/security-headers.test.mjs scripts/check-sourcemaps.test.mjs`: 11 of 12 fail.
- The config tests fail because there is no `headers()` and no `poweredByHeader`.
- The source-map tests fail because the script does not exist.
- The README test fails because the README has no header section yet.

The e2e specs run in the gate worktree after implementation.

## Risk to watch
`upgrade-insecure-requests` under plain-HTTP `next start` on 127.0.0.1. If Chrome upgrades the local subresource requests, the e2e run will show it as failed loads, and the directive will need a deploy-only switch.
