# U-11 Security headers, site CSP, release checks: review (EDD stage 2.3)

- **Date:** 2026-11-25
- **Range:** `6fedeed..705be85` (base from `base.txt`), branch `u11-security-headers`
- **Reviewer:** independent edd-reviewer (read only; no build, no Playwright, no server)
- **Verdict:** **changes-requested** (1 blocker, 0 major, 4 minor, 2 nit)

**Precondition:** `gates.md` does not exist yet, and the gate run in progress (`u11-gates.log`, gate evidence in the gate worktree) already shows `CG1_build` **FAIL**. That failure is caused by this diff (finding 1). The dependent gates `CG10_pii_scan`, `CG10_groq`, `use_client` and `CG10_sourcemaps` exit 2 because there is no build. The e2e specs cannot run until the build passes. So this review covers what can be judged without a build, and the e2e-dependent ACs are marked "not verified".

## Findings

| # | Severity | file:line | Finding | Recommendation |
|---|----------|-----------|---------|----------------|
| 1 | **blocker** | `next.config.js:47` | `next build` fails because of the source `'/opengraph-image:suffix*'`. The evidence is `CG1_build.log` in the gate worktree: `TypeError: Can not repeat "suffix" without a prefix and suffix`. I reproduced it with Next's bundled matcher: `require('next/dist/compiled/path-to-regexp').pathToRegexp('/opengraph-image:suffix*')` throws. The other six sources compile. The build is broken, so every AC fails and nothing can be deployed. The commit went in with the 12 node script tests green, because no test compiles the sources. | Use `'/opengraph-image{-:suffix}?'`. It compiles to `^\/opengraph-image(?:-((?:(?!-)[^\/#\?])+?))?[\/#\?]?$`. That pattern matches both `/opengraph-image` and the hashed route group URL `/opengraph-image-<6 chars>`; Next adds that suffix for `(site)` in `getMetadataRouteSuffix` (`node_modules/next/dist/lib/metadata/get-metadata-route.js:64-88`). Then re-run `npm run gates` and the full e2e. |
| 2 | minor | `scripts/security-headers.test.mjs:26` | The unit test copies its own `SITE_SOURCES` list and leaves out the OG source. It checks only that a rule object exists, never that the source is valid. That is how finding 1 got past a "green" commit. No e2e test requests the OG route either (`e2e/headers.spec.ts:56-61` covers the placeholder, the sitemap and robots, but not the OG image or `/writing/*`). | In the unit test, compile every `source` with `next/dist/compiled/path-to-regexp` and assert it matches a sample URL: `/`, `/privacy`, `/work/promptshield`, `/writing/x`, `/opengraph-image` and `/opengraph-image-abc123`. Also assert it does **not** match `/terminal` or `/api/analytics`. Add `/opengraph-image-<hash>` (read the `og:image` URL from `/`) and a `/writing/<slug>` path to the e2e site-CSP loop. |
| 3 | minor | `e2e/headers.spec.ts:42-46` | The "/terminal keeps the baseline CSP only" test checks only that `script-src` and `connect-src` are absent. A site CSP leaking onto `/terminal` through `default-src 'self'` or `style-src` would pass this test, yet `default-src 'self'` alone blocks the terminal's inline scripts and styles. That is exactly the silent ordering failure the unit says it guards against. | Assert `csp` deep-equals the exact baseline: `{ 'frame-ancestors': ["'none'"], 'object-src': ["'none'"], 'base-uri': ["'none'"] }`. Do the same for `/api/analytics` and `/does-not-exist`. |
| 4 | minor | `e2e/csp.spec.ts:15-35` | The test plan's risk, `upgrade-insecure-requests` upgrading subresources on `http://127.0.0.1`, is not observable in these tests. A blocked or upgraded chunk load is neither a `securitypolicyviolation` event nor a `pageerror`. The `h1` check at line 22 passes on server-rendered HTML even when no JS loads. On `/`, the analytics request needs hydration and catches it indirectly. On `/privacy`, `/work/promptshield` and `/terminal`, a failed chunk would go unnoticed. | Collect `page.on('requestfailed')` for same-origin URLs (and/or `response.status() >= 400` on `/_next/static/*`). Assert that list is empty on every path, with `/_vercel/insights/*` excluded because it is 404 under `next start`. |
| 5 | minor | `CHANGELOG.md` (not in diff) | The unit's DoD and "Files touched" list a CHANGELOG entry. There is no U-11 entry under `[Unreleased]`, unlike U-09 and U-10. | Add an entry under `### Security`: the header set, the site CSP, `poweredByHeader: false` and the source-map gate. |
| 6 | nit | `scripts/security-headers.test.mjs:32,38` | The test title promises "the exact threat-model §6.1 values", but `Permissions-Policy` is checked with a regex for only 3 of its 6 features (`payment`, `usb` and `browsing-topics` are unchecked). The e2e test checks only `camera=()` (`e2e/headers.spec.ts:22`). | Use `assert.equal` with the full §6.1 string. |
| 7 | nit | `edd-docs/construction/U-11/owner-checklist.md` | `includeSubDomains` with a 2-year max-age is the owner's informed choice (SQ-03 a, `questions/1.3-security.md:25-27`). Once a browser has seen it, though, any subdomain of tijothomas.dev that serves plain HTTP is unreachable in that browser for 2 years. SQ-09 covers dangling DNS but not "every subdomain serves HTTPS". | Add "every existing subdomain serves HTTPS" to the SQ-09 row, to confirm before the first production deploy with these headers. |

## Checks with no finding
- **Baseline values (§6.1):** `next.config.js:11-21` matches the threat model exactly: HSTS without preload, nosniff, Referrer-Policy, the full Permissions-Policy string, XFO DENY, COOP `same-origin`, and the CSP `frame-ancestors 'none'; object-src 'none'; base-uri 'none'`. The baseline CSP restricts no scripts, styles or connections, so `/terminal` keeps working (RQ-11 a).
- **Site CSP (§6.2):** `next.config.js:26-40` matches the production value directive for directive. It includes `manifest-src`, `frame-src 'none'` and `upgrade-insecure-requests`. The dev-only additions are exactly `'unsafe-eval'` plus `https://va.vercel-scripts.com`. The installed `@vercel/analytics@1.5.0` really loads `https://va.vercel-scripts.com/v1/script.debug.js` in dev and `/_vercel/insights/script.js` in production (checked in `dist/react/index.mjs`), so the `[I: verify]` note in §6.2 is resolved. `isDev` is read when the config loads. `next build` and Vercel compile headers at build time with `NODE_ENV=production`, so production never gets the dev values.
- **Rule order (§6.4):** the baseline `/:path*` rule comes first and the site rules come after it. Next's documented "last matching rule wins for the same key" behaviour gives site routes the strict CSP. `'/'` matches only the root path; it is not a prefix match. No site source matches `/terminal`, `/api/*` or `/_next/*`.
- **What the site CSP must allow on `/`:**
  - Inline RSC flight scripts are covered by `'unsafe-inline'`.
  - `next/font/google` fonts are self-hosted at build, so `font-src 'self'` and `style-src 'self'` cover them.
  - Inline SVG styles are covered by `style-src 'unsafe-inline'`.
  - The JSON-LD data block is not governed by `script-src`.
  - The favicon `/favicon.svg` is same-origin.
  - Vercel Analytics uses the first-party path, so `'self'` covers its script and the `/_vercel/insights/view` beacon.
  - A grep of `src/components` and `src/app/(site)` found no `<img>`, `<iframe>`, `<form>` or external `src`/`url(http...)`.
- **Moving between the site and `/terminal`:** `(site)` and `(terminal)` have separate root layouts, so moving between them is a full document load, and each page gets its own CSP. No site page links to `/terminal`. The terminal's external URLs are all link targets, not fetch or script hosts.
- **COOP `same-origin` and Permissions-Policy:** neither touches anything the terminal uses. Clipboard keeps its default; Web Audio is not governed by Permissions-Policy.
- **ASVS L1 header set (V14.4) for an unauthenticated static site:** HSTS, nosniff, Referrer-Policy, CSP with `frame-ancestors` and `object-src`, XFO and no `x-powered-by` are all present on every route class, including `/api/*` and 404s, through `/:path*`.
- **Source-map gate:** `scripts/check-sourcemaps.mjs` walks only `.next/static`, names each `.map` file, and exits 2 when there is no build. Its `CG10_sourcemaps` gate in `gates.yml` is `enforce: true` and ordered after `CG1_build`. The fixture tests cover pass, fail and no-build, and also check that server-side maps are ignored. `productionBrowserSourceMaps` is not set.
- **README:** the security section matches the config. The SEC-13 timeframes (critical 7 days, high 30 days, moderate next release) match `threat-model.md:203`.
- **`specs/pending.txt`:** 0 bytes.
- **Tests I ran myself:** `node --test scripts/security-headers.test.mjs scripts/check-sourcemaps.test.mjs` gave 12 pass, 0 fail. That passes despite finding 1, which is why finding 2 matters.
- **Dependencies:** no new dependencies in the range.

## AC status

| AC | Status | Notes |
|----|--------|-------|
| PLAT-AC-20 | **Fail (build broken)** | The config is correct for `/`. The e2e test is not verified because of finding 1. |
| PLAT-AC-21 | **Fail (build broken)** | The values and order are correct. The `/terminal` assertion is weak (finding 3). |
| PLAT-AC-22 | **Fail (build broken)** | The production `script-src` is correct and the lock-down directives are present. The OG and `/writing` sources are not exercised (finding 2). |
| PLAT-AC-24 | Not verified | Needs the e2e run after the fix. |
| PLAT-AC-26 | Gate logic pass (fixtures) | The real gate exits 2 until the build passes. |

## To approve
1. Fix finding 1 (`'/opengraph-image{-:suffix}?'`) and add a unit test that compiles and matches every source (finding 2). It must fail on the current value.
2. Make the `/terminal`, `/api/analytics` and 404 CSP assertions exact (finding 3), and add a same-origin failed-request check to `csp.spec.ts` (finding 4).
3. Add the CHANGELOG entry (finding 5).
4. Re-run `npm run gates` (all enforced gates PASS, `gates.md` written) and the full e2e on the production build. Confirm in particular that `upgrade-insecure-requests` causes no failed loads on `http://127.0.0.1` and that `/` requests `/_vercel/insights/script.js` with 0 violations.
5. The nits (6, 7) are optional but cheap.
