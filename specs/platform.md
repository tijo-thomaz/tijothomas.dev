# Platform, tooling and repo structure
Status: Approved (PG1 2026-11-23; amended after PG3 2026-11-23)
Prefix: PLAT
Traces: FR-060–FR-067, FR-070–FR-080, NFR-030, NFR-032, NFR-041, NFR-050–NFR-056; US-01, US-02, US-22, US-24–US-28; SEC-01–SEC-10, SEC-13–SEC-18

## Decisions (PG3, 2026-11-23)
- **ADR-P1:** two-tier static headers in `next.config` `headers()`: baseline set on `/:path*`, then the site CSP (`script-src 'self' 'unsafe-inline'`, no nonce, no `proxy.ts`) on `/`, `/privacy`, `/work/:path*`, `/writing/:path*`, `/opengraph-image`, `/sitemap.xml`, `/robots.txt`. `/terminal` gets the baseline only (SQ-04 a). HSTS `max-age=63072000; includeSubDomains`, no preload (SQ-03 a).
- **ADR-P4:** `.env.example` lists no Groq, service-role or rate-limit vars. Owner console: no `SUPABASE_SERVICE_ROLE_KEY` in Vercel (rotate if found), `GROQ_API_KEY` deleted, preview Deployment Protection on (SQ-06/07 a).

## Acceptance criteria
### Stack
- **PLAT-AC-01** — Given the lockfile, when `npm ls next react react-dom` runs, then it shows `next@16.4.6` and `react`/`react-dom` 19.x with no invalid or missing entries. _Traces: FR-060, US-01 · Verify: gate_
- **PLAT-AC-02** — Given `npm audit --json`, when it runs, then there are 0 critical/high advisories that have a fix available. _Traces: NFR-041, US-01 · Verify: gate_
- **PLAT-AC-03** — Given a shell with no env vars, when `npm run build` runs, then it exits 0. _Traces: FR-062, NFR-030, US-02 · Verify: gate_
- **PLAT-AC-04** — Given the repo, when `npm run type-check` (`tsc --noEmit`) runs, then there are 0 errors. _Traces: NFR-053, US-01, US-02 · Verify: gate_

### Tests and build config
- **PLAT-AC-05** — Given `vitest.config.ts`, when a test imports `@/content/profile`, then it loads. `npm run test` runs `vitest run` over `{app,components,terminal,content,lib}`, passes 3 consecutive runs, and has no Storybook plugin. _Traces: FR-063, NFR-032, US-02 · Verify: gate_
- **PLAT-AC-06** — Given sentinel Tailwind classes used only in `components/` and only in `terminal/`, when built, then both are in the emitted CSS. _Traces: FR-065, US-02 · Verify: gate_
- **PLAT-AC-07** — Given `next.config.*`, when inspected, then no `images` config exists. _Traces: FR-066, US-02 · Verify: unit_

### Folder structure and dead code
- **PLAT-AC-08** — Given the repo root, when top-level dirs are listed, then `features/`, `widgets/`, `shared/`, `stories/` and `.storybook/` do not exist, and app code lives only in `app/`, `components/`, `terminal/`, `content/` and `lib/`. _Traces: FR-070, US-24 · Verify: unit_
- **PLAT-AC-09** — Given the import graph, when checked, then there are 0 cycles; `components/`, `content/` and `lib/` never import `terminal/`; `terminal/` never imports `components/` or `content/`; `content/` imports types only. _Traces: FR-073, NFR-052, US-24 · Verify: gate_
- **PLAT-AC-10** — Given the moved terminal files, when `git diff -M` runs against the base commit, then each is reported as a rename with similarity ≥ 90%. Exception (PG3, SQ-01/SQ-05): files later edited by the data-only PII-strip commit or the chat-disable commit are listed in the gate's exception file and are checked at the move commit instead of HEAD. _Traces: FR-072, US-24, CMP-05 · Verify: gate_
- **PLAT-AC-11** — Given the 58 paths listed as unreachable in `edd-docs/audit/raw/cycles.txt`, when checked, then none exist, and the import graph reports 0 unreachable modules in `components/`, `terminal/` and `lib/`. _Traces: FR-071, US-25 · Verify: gate_
- **PLAT-AC-12** — Given all test files, when collected, then none imports a deleted module, and every test of a deleted module is gone. _Traces: FR-064, US-25 · Verify: gate_
- **PLAT-AC-13** — Given `package.json`, when a dependency-usage check runs, then 0 unused dependencies are reported. _Traces: FR-080, US-25 · Verify: gate_

### Lint (Oxlint only)
- **PLAT-AC-14** — Given `.oxlintrc.json`, when `npm run lint` runs, then Oxlint runs with plugins react, nextjs, jsx-a11y, typescript and vitest, exits 0 in ≤ 5 s, and reports 0 warnings outside `terminal/`. _Traces: FR-061, NFR-053, NFR-056, US-26 · Verify: gate_
- **PLAT-AC-15** — Given the repo, when searched, then no `.eslintrc*`, `eslint.config.*`, `eslintConfig` key or `eslint*` dependency exists. _Traces: FR-075, US-26 · Verify: unit_
- **PLAT-AC-16** — Given changed files outside `terminal/`, when complexity rules run, then cyclomatic ≤ 10, function ≤ 50 lines, ≤ 4 params, nesting ≤ 3 and file ≤ 400 lines. _Traces: NFR-050, US-26 · Verify: gate_

### Storybook removal
- **PLAT-AC-17** — Given the repo, when searched, then there are no `*.stories.*` files, no `storybook`/`build-storybook` scripts, and no `storybook`, `@storybook/*` or `@chromatic-com/storybook` dependencies. _Traces: FR-074, US-27 · Verify: unit_

### Spec workflow
- **PLAT-AC-18** — Given `specs/home.md`, when `git check-ignore` runs on it, then nothing is printed (the file is tracked). _Traces: FR-079, US-28 · Verify: gate_
- **PLAT-AC-19** — Given a fixture spec with an uncited AC, or a fixture test citing an unknown AC, when `spec:check` runs on it, then it exits non-zero and names the ID. Given the real repo, then it exits 0. _Traces: FR-076, FR-077, FR-078, NFR-055, US-28 · Verify: unit_

### Security headers
- **PLAT-AC-20** — Given `GET /`, when headers are read, then `strict-transport-security`, `x-content-type-options: nosniff`, `referrer-policy`, `permissions-policy` and a frame-ancestors restriction are present, `x-powered-by` is absent, and `/` loads with 0 CSP violations. _Traces: FR-067, US-22 · Verify: e2e_
- **PLAT-AC-21** — Given `next start`, when `GET /terminal`, `GET /api/analytics` and `GET /does-not-exist` are read, then each has `strict-transport-security: max-age=63072000; includeSubDomains` (no `preload`), `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy`, `x-frame-options: DENY`, `cross-origin-opener-policy: same-origin`, a CSP containing `frame-ancestors 'none'`, and no `x-powered-by`. _Traces: SEC-01–SEC-08, FR-067, US-22 · Verify: e2e_
- **PLAT-AC-22** — Given a production build, when the CSP of `GET /` and `GET /privacy` is parsed, then `script-src` has no host and no `'unsafe-eval'`, and `object-src 'none'`, `base-uri 'none'`, `form-action 'none'` and `frame-ancestors 'none'` are present. _Traces: SEC-05, FR-067, US-22 · Verify: e2e_
- **PLAT-AC-23** — Given Oxlint with `react/no-danger` as error, when it runs, then there are 0 errors outside `terminal/`, and the only allowed use is in `lib/json-ld.ts`. _Traces: SEC-10, FR-054 · Verify: gate_
- **PLAT-AC-24** — Given a production build of `/` with the site CSP, when it loads in Playwright, then a request to `/_vercel/insights/script.js` is issued and 0 `securitypolicyviolation` events fire. _Traces: SEC-05, FR-002, US-22 · Verify: e2e_

### Supply chain and build output
- **PLAT-AC-25** — Given the gate run, when it finishes, then `sbom.cdx.json` (CycloneDX) is written to the evidence folder, `gitleaks detect` over the full history and working tree reports 0 findings, and `npm audit signatures` exits 0. _Traces: SEC-14, SEC-15, NFR-042 · Verify: gate_
- **PLAT-AC-26** — Given a production build, when `.next/static` is listed, then there are 0 `*.map` files. _Traces: SEC-08 · Verify: gate_
- **PLAT-AC-27** — Given `.env.example`, when read, then it has no `GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` or `RATE_LIMIT_REQUESTS_PER_MINUTE` entry. _Traces: SEC-18, ADR-P4 · Verify: unit_
