# U-02 Next 16.4.6 + React 19 upgrade: test plan (EDD stage 2.1)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` (HEAD `6d81d3a`) · **Base:** `b22401b` (`base.txt`; the audit row "PG5 U-03 approved" says the same) · **Unit:** `edd-docs/inception/units/U-02-next16-upgrade.md` · **Spike:** `edd-docs/spikes/SP-01-next16-feasibility.md`
- **ACs (6):** PLAT-AC-01, 02, 03, 04, 07 · TERM-AC-06. All six are now removed from `specs/pending.txt` (69 → 63); `spec:check` PASS (cited 29, pending 63).
- **Re-verified under React 19 (DoD robustness):** TERM-AC-01, 02, 04, 05, plus the U-03 smoke, pixel diff and CSS diff.
- **Levels:** `node:test` in `scripts/` (manifest, lockfile, installed tree, config, gate wiring, build-no-env script on temp fixtures) · Vitest colocated under `src/` (lazy client, API route) · Playwright `e2e/` against `next build && next start`, plus one spec against `next dev` for React dev warnings.
- **Run:**
  - `npm run test:scripts` (all node tests) or `node --test scripts/next16-upgrade.test.mjs`
  - `npx vitest run src/terminal/lib/supabase.test.ts src/terminal/api/analytics/route.test.ts` (or `npm test`)
  - `npm run type-check` (it also type-checks the `expectTypeOf` contract in `supabase.test.ts`)
  - e2e: only in a scratch git worktree, **with no Supabase env and no `.env*` file**, `PW_CHANNEL=chrome E2E_PORT=<not 3000/3100> npm run test:e2e`. Then the dev pass: `npx playwright test -c playwright.dev.config.ts`.
  - Changed rule from U-03: e2e no longer gets placeholder Supabase env. `e2e/terminal-no-env.spec.ts` fails if any `*SUPABASE*` var is set. Placeholder env also made the server make real network calls to `example.supabase.co` (`fetch failed` in the dev log).

## 1. Traceability

| AC / scope item | Test file | Test (title contains the ID) | Level |
|---|---|---|---|
| PLAT-AC-01 | `scripts/next16-upgrade.test.mjs` | `package.json pins next to exactly 16.4.6` | unit |
| | | `react and react-dom ranges admit only 19.x` · `@types/react and @types/react-dom ranges admit only 19.x` | unit |
| | | `package-lock.json resolves next 16.4.6, react/react-dom 19.x and @types/react(-dom) 19.x` (react == react-dom) | unit |
| | | `SP-01 lucide-react is pinned to exactly 0.577.0 … in package.json and lockfile` | unit |
| | | `SP-01 no dependency whose peer range excludes Next 16 / React 19 is left` (eslint-config-next, storybook) | unit, negative |
| | | `SP-01 @next/bundle-analyzer is removed, or pinned to 16.4.6 with an analyze script that builds with --webpack and no POSIX env prefix` | unit |
| | | `npm ls next react react-dom exits 0 and shows next@16.4.6, react and react-dom 19.x` | gate (local `npm ls`) |
| | | `npm ls --all reports no invalid, missing or extraneous entries anywhere in the tree` (SP-01 finding 2: npm can exit 0 on install and still leave an invalid tree) | gate |
| PLAT-AC-02 | same | `gates.yml CG10_audit is enforced and runs npm audit at --audit-level=high` | unit (wiring) |
| | gate run | `CG10_audit` must PASS at U-02 PG5 (waiver W-01 ends here) | gate |
| PLAT-AC-03 | same | `TERM-AC-06 build-no-env strips every NEXT_PUBLIC_* and *SUPABASE* key before running the build command` | unit (fixture) |
| | | `build-no-env propagates a failing build exit code and prints FAIL` | unit, negative |
| | | ×4 `build-no-env refuses (exit 2, command not run) when .env / .env.local / .env.production / .env.production.local exists` | unit, negative |
| | | `build-no-env does not refuse on .env.example` | unit, boundary |
| | | `TERM-AC-06 gates.yml CG1_build is enforced and runs the build through scripts/build-no-env.mjs` | unit (wiring) |
| | `src/terminal/lib/supabase.test.ts` | `TERM-AC-06 PLAT-AC-03 importing the module with no Supabase env does not throw (real SDK)` | unit |
| | gate run | `CG1_build` = `node scripts/build-no-env.mjs`, exit 0 | gate |
| PLAT-AC-04 | `scripts/next16-upgrade.test.mjs` | `gates.yml CG3_types is enforced and runs type-check, which is tsc --noEmit` | unit (wiring) |
| | gate run | `CG3_types`: 0 errors, including the `expectTypeOf` contract and the React 19 `RefObject` fixes (SP-01: 5 prop types) | gate |
| PLAT-AC-07 | `scripts/next16-upgrade.test.mjs` | `next.config.js source has no images key` | unit |
| | | `the evaluated next config has no images key and no webpack key when ANALYZE is unset` (also checks that the `/v2` → `/terminal` 308 redirect is still there) | unit |
| TERM-AC-06 | `src/terminal/lib/supabase.test.ts` (12) | `getSupabase() returns null when both env vars are missing` · ×3 `returns null and creates no client when only the URL is set / only the anon key is set / both are empty strings` · `no client is created at import time even when env is set` · `creates the client once on first use … then reuses it` · `env is read on first use, not at import` · `the module exports no eagerly created client (no supabase export)` · `typed SupabaseClient \| null (no cast that drops the SDK generics)` · `store/delete/update helpers resolve false and never touch the SDK` · `getSupabaseAnalytics() resolves null without logging an error` | unit |
| | `src/terminal/api/analytics/route.test.ts` (9) | `the route module imports with no env` · `GET returns 200 with empty visits and usage, not 500, and logs no error` · ×4 `POST {type: visit/command/question/unknown} is a no-op: 200 JSON with a boolean success, no rpc, no error log` · with env: `importing the route does not create the client; the first request does` · `GET returns the 30-day rows and totals from the client` · `POST visit calls increment_daily_visits with today (fixed clock)` | unit / integration (route plus lib, SDK mocked) |
| | `e2e/terminal-no-env.spec.ts` (3) | `guard: the e2e server was started with no Supabase env vars and no .env file` · `with no Supabase env /terminal renders, help works, 0 uncaught errors and 0 /api/analytics 5xx` · `GET and POST /api/analytics answer 200 JSON (no-op), never 500` | e2e |
| R1 / TERM-AC-01 under React 19 | `e2e/terminal-react19.spec.ts` (2) | `U-02 TERM-AC-01 desktop 1280 / mobile 360: help, theme switch, zoom, sound toggle and chat open emit 0 console errors, 0 React warnings, 0 page errors` | e2e (prod), and the same file under `playwright.dev.config.ts` (dev) |
| Scope 2 (RQ-08) | `scripts/next16-upgrade.test.mjs` | `U-02 RQ-08 dev tools: vitest and @vitest/coverage-v8 on the same 3.2.x, @playwright/test >= 1.55.1` | unit |
| Scope 1 (no shortcuts) | same | `U-02 no install shortcut: .npmrc does not set legacy-peer-deps or force` | unit |
| Scope 5 | same | `U-02 PLAT-AC-10 every U-03-moved file changed since the U-02 base is listed in scripts/rename-exceptions.json` (computed from git, so no folder literal) | unit |
| SP-01 finding 8 | same | `U-02 SP-01 tsconfig.json already holds the Next 16 mandatory rewrite (jsx react-jsx, .next/dev/types included)`, so a build does not leave tracked files dirty | unit |

**AC coverage:** 6 of 6 (100 %). Every U-02 AC has at least one automated test or gate check.

### Existing specs that re-run unchanged under React 19 (DoD robustness)
- `e2e/terminal.spec.ts`: TERM-AC-01 (200, `help`, 0 page errors), TERM-AC-02 (theme persists), TERM-AC-03, and the font-mono layout check.
- `e2e/v2-redirect.spec.ts`: TERM-AC-04 (308 → `/terminal`) and TERM-AC-04/05 VersionSelector v1.
- `e2e/smoke.spec.ts` (`/` and `/terminal`) and `e2e/site-home.spec.ts` (HOME-AC-05 and the hello-world `/`).
- Vitest: `src/app/api/routes.test.ts`, `src/terminal/moved-modules.test.ts` (each module loads under React 19), and the TERM-AC-03/05 unit tests.
- Manual DoD (method from U-03 `impl-notes.md`, paths under `src/`):
  1. `edd-docs/construction/U-03/smoke/smoke.cjs` at 1280 and 360 (load, `help`, theme, chat), U-03 HEAD vs U-02 HEAD, then `pixdiff.cjs`. Only animation-frame differences are allowed: the `animate-bounce` trigger at x ≤ 55 and the `animate-pulse` dot.
  2. `scripts/css-diff.mjs`, U-03 HEAD vs U-02 HEAD: 0 missing.
  3. Audio by ear (owner).

## 2. Interfaces the tests fix (for the developer)
- `src/terminal/lib/supabase.ts`:
  - Exports `getSupabase(): SupabaseClient | null`. It reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` on call (not at import), creates the client with `createClient(url, key)` once, and memoises it. It returns `null` if either var is missing or empty.
  - No `supabase` export.
  - The existing helpers keep their signatures and fail soft.
  - `getSupabaseAnalytics()` returns `null` with no client and does not call `console.error`.
- `src/terminal/api/analytics/route.ts`:
  - Calls `getSupabase()` per request.
  - With no client, `GET` returns `200 {visits: [], usage: [], …}` and `POST` returns `200 {success: boolean}`. Neither calls `rpc` or `console.error`.
  - With a client, behaviour is unchanged.
- `scripts/build-no-env.mjs`:
  - Usage: `node scripts/build-no-env.mjs [--cwd <dir>] [-- <cmd> <args…>]`. The default command is `npm run build`.
  - The child gets `process.env` minus every `NEXT_PUBLIC_*` key and every key containing `SUPABASE`.
  - Exit 2 without running the command if `.env`, `.env.local`, `.env.production` or `.env.production.local` exists in cwd (Next would load it). `.env.example` is allowed.
  - Otherwise the exit code is the child's. The last line is `PASS PLAT-AC-03 TERM-AC-06 …` or `FAIL PLAT-AC-03 TERM-AC-06 … exit <n>`.
  - `gates.yml` CG1_build: `cmd: node scripts/build-no-env.mjs`.
- `next.config.js`: no `images` key, and no `webpack` key when `ANALYZE` is unset (a webpack key breaks the default Turbopack build).
- `tsconfig.json`: commit Next 16's rewrite (`jsx: react-jsx`, include `.next/dev/types/**/*.ts`). The test does not prescribe an exclusion for test files, because `tsc` is at 0 errors today.

## 3. Test data, doubles, environment
| Double / fixture | Why |
|---|---|
| `vi.doMock('@supabase/supabase-js')` returning `{from, rpc}` spies | The SDK is the architectural boundary. Spies count client creation (the lazy-init proof), and the tests need no network. The two "imports with no env" tests use the **real** SDK, because its `supabaseUrl is required` throw is the F-07 failure. |
| Fake query chain `from().select().order().limit()` with fixed rows (2+3 visits, 4 commands, 1 question) | Exact totals 5/4/1 for the GET regression |
| `vi.useFakeTimers({toFake:['Date']})` at `2026-11-24T10:00Z` | Fixed `input_date` for the rpc |
| `console.error` / `console.warn` spies | "fails soft" = no error log, quiet output |
| Env per test: delete or set the two vars and restore in `afterEach`; `vi.resetModules()` | Every test re-imports the module under the env state it is about |
| Temp fixture dirs (`makeFixture`, os tmpdir) with or without `.env*` files; the child command is `node -e <probe>`, which prints leaked keys and exits with `PROBE_EXIT` | Exercises build-no-env without running a real build |
| `page.route` stubs for `/_vercel/insights/**` and `va.vercel-scripts.com/**` (empty JS) | `@vercel/analytics` loads a script that only Vercel serves (404 under `next start`, seen in the red run) and, in dev, a CDN script. These are platform boundaries, and the tests make no real network calls. |
| `playwright.dev.config.ts` (imports the base config; webServer is `npm run dev`; testMatch is the react19 spec) | React warnings print only in development (StrictMode double effects, ref/key warnings, removed `defaultProps`/`propTypes` for function components) |
| Env: Node 24.14.0, npm 11.21.3, installed Chrome (`PW_CHANNEL=chrome`), ports ≠ 3000/3100, scratch worktree | Same as U-03 |

## 4. Negative, boundary, authz, NFR
- **Negative and boundary:**
  - Only the URL set, only the key set, both empty strings (getter returns null).
  - Unknown POST type with no env.
  - Failing child exit code propagates.
  - Four kinds of env file make build-no-env refuse; `.env.example` is allowed.
  - Leftover `eslint-config-next` or storybook deps; an `.npmrc` shortcut; an `analyze` script without `--webpack`, or one using a POSIX env prefix.
  - A webpack key in next.config.
- **Authz:** n/a. There are no users or sessions, and analytics is anonymous. One security point: with no env the server must not try to reach any Supabase host. The tests check this by asserting that `createClient` and `rpc` are never called.
- **Input validation:** unchanged handler behaviour (out of scope). A malformed-JSON POST still returns 500 through the existing catch. That is not an AC, so it is left alone.
- **Performance smoke:** no hot-path NFR. Next 16 no longer prints First Load JS (SP-01), so the gate run records `.next/static` size against the SP-01 figure (1.1 MB, 15 chunks), and Lighthouse stays report-only, compared with the U-01 baseline.
- **Accessibility:** no UI change. The react19 spec drives the controls by role and name where they exist (`Terminal command input`, `Change theme`, `Chat message input`). The chat trigger has no accessible name, so it is found by locator as in the U-03 smoke. That gap is carried to the terminal a11y unit, not fixed here.

## 5. Red run (2026-11-24, tests only, no product code changed)

**node:test** (`node --test scripts/next16-upgrade.test.mjs`): 25 tests, **18 fail and 7 pass**. The full `npm run test:scripts` run gives 154 tests, 136 pass, 18 fail, and the 18 are exactly these.
```
✖ PLAT-AC-01 package.json pins next to exactly 16.4.6            actual '^14.0.0'
✖ PLAT-AC-01 react and react-dom ranges admit only 19.x           react range is ^18.2.0
✖ PLAT-AC-01 package-lock.json resolves …  {"next":"14.2.30","react":"18.3.1",…,"@types/react":"18.3.23"}
✖ PLAT-AC-01 SP-01 lucide-react is pinned to exactly 0.577.0      actual '^0.290.0'
✖ PLAT-AC-01 SP-01 @next/bundle-analyzer removed or 16.4.6        actual '^15.5.3'
✖ PLAT-AC-01 npm ls next react react-dom exits 0 and shows …      installed next 14.2.30
✖ PLAT-AC-07 next.config.js source has no images key              images: { domains: ['images.unsplash.com'] … }
✖ PLAT-AC-07 the evaluated next config has no images key …        images = {"domains":["images.unsplash.com"],…}
✖ U-02 SP-01 tsconfig.json already holds the Next 16 rewrite      actual 'preserve'
✖ PLAT-AC-03 … build-no-env … (7 tests)                           scripts/build-no-env.mjs does not exist yet
✖ PLAT-AC-03 TERM-AC-06 gates.yml CG1_build … build-no-env.mjs    actual 'npm run build'
✔ SP-01 no eslint-config-next/storybook · RQ-08 vitest 3.2.4 + playwright 1.65.1 · no .npmrc shortcut
✔ npm ls --all (current Next 14 tree is valid) · PLAT-AC-02/04 gate wiring · rename exceptions (nothing changed yet)
```
These 7 passing tests guard against regressions while the upgrade lands. `npm ls --all` in particular is the SP-01 trap: it must still pass after the upgrade.

**Vitest** (two new files): 21 tests, **18 fail and 3 pass**. The full `npx vitest run` gives 208 tests, 190 pass, and the 18 failures are exactly these.
```
× importing the module with no Supabase env does not throw (real SDK)   → promise rejected "Error: supabaseUrl is required."
× getSupabase() returns null when both env vars are missing             → expected 'undefined' to be 'function'
× getSupabase() … only the URL / only the key / empty strings           → mod.getSupabase is not a function
× no client is created at import time even when env is set              → "spy" … been called 1 times
× the module exports no eagerly created client                          → expected true to be false
× store/delete/update helpers … never touch the SDK                     → "spy" … been called 1 times
× getSupabaseAnalytics() resolves null without logging an error         → "error" … been called 1 times
× route imports with no env (real SDK)                                  → promise rejected "Error: supabaseUrl is required."
× GET returns 200 with empty visits and usage, not 500                  → got the client's rows (eager client)
× POST {type: visit|command|question|unknown} is a no-op                → "spy" … been called 1 times
× importing the route does not create the client                        → "spy" … been called 1 times
✓ typed SupabaseClient | null   (runtime no-op; tsc is the red, below)
✓ GET totals with env · ✓ POST visit rpc with fixed date               (regression: green before and after)
```
**tsc** (`npx tsc --noEmit`): 8 errors, all `src/terminal/lib/supabase.test.ts … TS2551 Property 'getSupabase' does not exist`. There are 0 other errors.

**oxlint**: exit 0, with 0 warnings in the new files. **spec:check**: PASS.

**Empty-env build** (scratch worktree at HEAD, Next 14.2.30): `exit=1`, red for the right reason (F-07):
```
▲ Next.js 14.2.30   ✓ Compiled successfully
Error: supabaseUrl is required.
> Build error occurred
Error: Failed to collect page data for /api/analytics
```

**Playwright** (scratch worktree, placeholder env, because the Next 14 build needs it; `PW_CHANNEL=chrome`, ports 3221/3222):
- `terminal-no-env` guard: **fail, as intended**. `Received: ["NEXT_PUBLIC_SUPABASE_ANON_KEY","NEXT_PUBLIC_SUPABASE_URL"]`. With a truly empty env the webServer build fails (above), so the whole spec is red until the lazy client lands. Under placeholder env its 2 behaviour tests passed (the placeholder client answers "Database read failed" as a 200). That is why the guard exists.
- `terminal-react19` on React 18:
  - First run: 2 fail, `[error] Failed to load resource: 404 @ /_vercel/insights/script.js`. This is a platform artefact, so a boundary stub was added (section 3).
  - After the stub: **2/2 pass in prod and 2/2 pass in dev** (0 console errors or warnings, 0 React warnings). This is the React 18 baseline, so after the upgrade any message is a React 19 regression and not old noise.
- `terminal.spec.ts` re-run: 4/4 pass.
- Cleanup: the worktree and node_modules junction were removed, and nothing is left listening on 3221/3222.

## 6. Files added or changed (tests only; no product code, no package.json)
- `scripts/next16-upgrade.test.mjs`
- `src/terminal/lib/supabase.test.ts`
- `src/terminal/api/analytics/route.test.ts`
- `e2e/terminal-no-env.spec.ts`
- `e2e/terminal-react19.spec.ts`
- `playwright.dev.config.ts`
- `specs/pending.txt` (−6 IDs)

**Deviation:** the unit lists `next.config.test.ts` for PLAT-AC-07. Vitest only collects `src/**` (PLAT-AC-05), so a root `*.test.ts` would never run. The PLAT-AC-07 checks live in `scripts/next16-upgrade.test.mjs` instead, as U-01 and U-03 did for root config.
