# Reconstructed ADRs (decisions embodied in the code)

Format: *Decision · Evidence · Probable reason · Consequences seen in code · Verdict (keep / revisit / replace)*.
**[F]** = fact verified in code or tool output. **[I]** = inference.

---

## ADR-R01 Framework: Next.js 14 App Router, React 18
- **Decision:** Next.js `^14.0.0`, resolved to **14.2.30**, on React 18.3.1, using the App Router (`app/`).
- **Evidence [F]:** `package.json` (`"next": "^14.0.0"`, `"react": "^18.2.0"`). `package-lock.json:7258-7260` gives `next-14.2.30.tgz`. `node_modules/next/package.json` is 14.2.30. The `next build` banner reads "▲ Next.js 14.2.30" (`raw/build2.txt`). `eslint-config-next` is 14.2.30.
- **Correction:** `edd-state.md` says "`next ^16.2.2`" and the spec says "Next.js 14". **The spec is correct; `edd-state.md` is wrong.** No version 16 appears anywhere in the repo or lockfile.
- **Probable reason [I]:** The site started in 2025 (first commit 2025-04-25) when 14.x was current. There was a Vite → Next migration, judging by the churn on `src/App.tsx` and `vite.config.ts` in history.
- **Consequences:** `next lint` exists and works (`raw/lint.txt`). The `metadata`, `viewport`, `sitemap.ts`, `robots.ts` and `next/og` (`ImageResponse` from `next/og`) APIs needed by the feature are all available in 14.2. However, the version carries critical and high advisories (F-02). The 14.x line tops out at 14.2.35, and full fixes need ≥ 15.5.29 or 16.4.6, which require React 19.
- **Verdict: keep 14.2.x for this feature (patch to 14.2.35); revisit the major upgrade as a separate unit** (owner Q1). An upgrade inside this feature would also touch the "unchanged" terminal.

## ADR-R02 Routing and layout: a single root layout hosting a client terminal at `/`
- **Decision:** One `app/layout.tsx` (server) wraps everything in a client `ThemeProvider`, JetBrains Mono, Vercel `<Analytics/>`, and a hidden SEO block. `/` and `/v2` are full-page client components.
- **Evidence [F]:** `app/layout.tsx:4-10,79-120`; `app/page.tsx:1`; `app/v2/page.tsx:1`; route table in `raw/build2.txt` (`○ /` 30.3 kB, 136 kB first load; `○ /v2`; `ƒ /api/*`).
- **Probable reason [I]:** The terminal "app" needed theming, sound and zoom state across the whole viewport. The hidden SEO block was a workaround for the client-only render.
- **Consequences:** Crawlers see "Loading…" plus hidden text (F-01). Terminal theming, CSS and viewport leak to every route (F-05, F-09).
- **Verdict: replace for `/`.** Use route groups `(site)` and `(terminal)` with separate root layouts (see audit-report §5). Keep the terminal tree as is under `/terminal`.

## ADR-R03 Code organisation: Feature-Sliced Design + Atomic Design, migrated alongside legacy `components/`
- **Decision:** FSD layers `app → widgets → features → shared`, with atoms/molecules/organisms inside slices (PR #18, `241ad16`). The legacy `components/` tree was kept.
- **Evidence [F]:** Folder tree. `app/page.tsx` imports both trees (`app/page.tsx:4-16`). `raw/cycles.txt`: 0 cycles, 0 upward imports, 5 cross-feature imports (all to `features/prompt-shield`), and 58 of 185 modules unreachable.
- **Probable reason [I]:** An incremental migration toward a cleaner architecture. `/v2` was built as an "EXACT replica… using FSD architecture" (`app/v2/page.tsx:26-29`).
- **Consequences:** Duplicates exist: `components/Terminal.tsx` vs `features/terminal`; `components/SimpleAnalyticsDisplay.tsx` vs `widgets/Analytics/SimpleAnalyticsDisplay.tsx`; `components/VersionSelector.tsx` vs `widgets/VersionSelector`. The Tailwind config never added the FSD folders (F-08). The migration stalled halfway.
- **Verdict: keep the FSD convention for new code** (spec: "follow what exists"). Suggested placement: `widgets/home/*` for the page sections, `shared/ui/*` for atoms, `content/` at the root. **Revisit** the legacy duplicates later (purge).

## ADR-R04 State management: React local state, plus an unused zustand store
- **Decision:** All live state is `useState`/`useRef` in `app/page.tsx` (about 12 state variables plus a `TutorialManager` ref). A zustand `persist` store exists.
- **Evidence [F]:** `app/page.tsx:19-37`. `shared/stores/sessionStore.ts:46-114` defines `useSessionStore`, but `git grep useSessionStore` finds it only in its own file.
- **Probable reason [I]:** The store was prepared during the FSD migration, but the wiring never happened.
- **Consequences:** The `tijothomas-session` localStorage key is never written. The new `/` has **no coupling** to zustand. The terminal's real persistence is in individual localStorage keys (`tijothomas-theme`, `-zoom`, `-sounds`, `portfolio-analytics`).
- **Verdict: no store on the new `/`** (a static page needs none). Remove the store and the `zustand` dependency later (YAGNI).

## ADR-R05 Styling: Tailwind CSS 3.4 + CSS custom-property themes + shadcn-style tokens
- **Decision:** Tailwind `3.4.17` with the `darkMode: class`, `tailwind-scrollbar` plugin. shadcn HSL tokens (`--background` …). A separate `--theme-*` variable set is switched by `.theme-*` classes on `<html>`. Many inline `style={{color: var(--theme-…)}}`.
- **Evidence [F]:** `node_modules/tailwindcss` is 3.4.17. `tailwind.config.js:1-91`, `app/globals.css:1-120`, `components/ThemeProvider.tsx:62-69`, `app/page.tsx:290-293`.
- **Probable reason [I]:** shadcn starter tokens plus a custom terminal theming system.
- **Consequences:** `content` globs miss `features/`, `widgets/`, `shared/` (F-08). Global body and mobile height rules are terminal-specific (F-05).
- **Verdict: keep Tailwind 3.4** (no v4 migration in this feature). **Revisit** the CSS split: a site stylesheet with the mockup tokens (`#0f1b2d`, `#4a5568`, `#e6f5ec`, `#f4f7fa`, accent `#ff7a33` as a CSS variable) vs `terminal.css`.

## ADR-R06 Fonts: `next/font/google` JetBrains Mono on body
- **Evidence [F]:** `app/layout.tsx:3,7-10,81`.
- **Verdict: keep the mechanism; scope it to the terminal.** The new site uses `next/font` Space Grotesk 500/700 and Inter 400/600 (the weights from the mockup's Google Fonts link). Do **not** copy the mockup's `<link href="https://fonts.googleapis.com/...">`, because it is render-blocking and a third-party request.

## ADR-R07 Testing: Vitest 3.2 + Testing Library + jsdom; Storybook 9 with addon-vitest and addon-a11y
- **Evidence [F]:** `vitest.config.ts:12-37` (jsdom; includes only `features|widgets|shared/**/*.test.tsx`; coverage includes the same dirs). `vitest.setup.ts` (matchMedia, localStorage, IO and RO mocks). `.storybook/main.ts` (nextjs-vite, a11y addon). `storybookTest` is imported but unused (`vitest.config.ts:6`). **No `resolve.alias` for `@/`**, so 3 suites fail to load on `@/lib/utils` (`raw/vitest.txt`). `npm test` runs `vitest` in watch mode, so CI needs `vitest run`.
- **Results [F]:** 16 files, 198 tests: **80 pass, 118 fail**. `tsc` reports 139 errors, all in tests (`raw/vitest.txt`, `raw/typecheck.txt`). No tests exist for `app/`, `components/`, `lib/` or the API routes. The `include` globs exclude `app/**` and `content/**`, so new tests there would **not run** until the globs are widened.
- **Probable reason [I]:** Tests were generated in bulk against intended APIs during the atomic migration and never reconciled with the actual components.
- **Verdict: keep the stack; revisit the config.** Add the `@` alias, and add `app/**`, `content/**` and `components/**` to `include`. Decide on the red baseline (Q4). Add a `test:ci` script (`vitest run --coverage`).

## ADR-R08 Analytics: Supabase aggregate counters (self-built) + Vercel Analytics
- **Decision:** The client calls `trackVisit`/`trackCommand`/`trackQuestion`, which write localStorage counters and POST to `/api/analytics`. That route calls Supabase RPCs (`increment_daily_visits`, `increment_usage_stat`) with the **anon** key. `<Analytics/>` from `@vercel/analytics/react` sits in the root layout.
- **Evidence [F]:** `lib/simple-analytics.ts:10-100`; `app/api/analytics/route.ts:1-98`; `lib/supabase.ts:7-10`; `app/layout.tsx:5,84`; `app/page.tsx:41`.
- **Probable reason [I]:** A visible "visits/commands/questions" stat widget (`widgets/Analytics`) as a portfolio gimmick, with privacy-first design (GDPR PR #9).
- **Consequences:** Build-time crash without env (F-07). Public stats GET and inflatable counters (F-14). The schema string has drifted (`lib/supabase.ts:282-331` describes tables the routes don't use).
- **Verdict:** **Replace on `/`** (spec: Vercel Analytics only). **Keep for `/terminal`** for now, since the spec removes Supabase "from `/`" only. **Revisit** full retirement later (Q-later). The only Supabase entry point on `/` today is `trackVisit()` in `app/page.tsx:41` plus the `SimpleAnalyticsDisplay` widget. Both move with the terminal page.

## ADR-R09 LLM chat: Groq `llama-3.1-8b-instant` via a Next route handler, client-assembled context, "PromptShield" wrapper
- **Decision:** `POST /api/chat` takes `{message, sessionId, portfolioContext, promptShield?}` and builds the system prompt from `portfolioContext` (client-supplied) when `GROQ_API_KEY` exists. It uses `max_tokens: 400`, `temperature: 0.7`. There is a local rule-based fallback in `useChatAssistant.ts:135-250`.
- **Evidence [F]:** `app/api/chat/route.ts:1-147`; `features/prompt-shield/model/usePromptShield.ts:66` (`http.post('/api/chat', …)`); `features/chat-assistant/model/useChatAssistant.ts:26-90,255-276`. Env vars: `GROQ_API_KEY` (read), `GEMINI_API_KEY` (commented, unused), `RATE_LIMIT_REQUESTS_PER_MINUTE` (declared in `.env.example:29`, **never read**). The latest commit message "updated the llm name model" (`6f8ec4b`) suggests the model name changes in place, with no version pinning or evals.
- **Probable reason [I]:** A free, fast model for a portfolio novelty. The "PromptShield" branding showcases the owner's AI-security PoC.
- **Consequences:** F-03, F-12, F-19. Each chat message sends the entire context, including phone and email, from the client.
- **Verdict: out of scope for this feature; keep it untouched on `/terminal`.** **Replace** with a server-held context plus guardrails, rate limiting and evals when "Ask Tijo" is built. Interim option: disable or rate-limit (owner decision, later).

## ADR-R10 Error handling: try/catch with console logging and soft-fail
- **Evidence [F]:** Routes return `NextResponse.json({error: 'API Error: ' + message}, 500)` (`app/api/chat/route.ts:129`). Analytics returns 200 with `success:false` on DB errors (`app/api/analytics/route.ts:17-20`). Analytics on the client swallows errors (`lib/simple-analytics.ts:67-70`). `compiler.removeConsole` in production (`next.config.js:13`).
- **Verdict: keep fail-soft for analytics. Revisit the error echo in `/api/chat`** (later). The new `/` has no runtime I/O, so it needs no runtime error handling. It needs `not-found` and `error` boundaries only if routes are added.

## ADR-R11 Config and secrets: env vars via Vercel dashboard; `.env*` git-ignored
- **Evidence [F]:** `.env.example:1-44`; `.gitignore:7-12`; no `.env*` in the working tree besides the example; no secrets found in tracked files (manual grep for `gsk_`, `eyJ` and service-role usage). `SUPABASE_SERVICE_ROLE_KEY` is declared in `.env.example:22` but **unused** (the server uses the anon key).
- **Consequences:** The build depends on `NEXT_PUBLIC_SUPABASE_URL` (F-07). There is no runtime env validation (zod is present but `shared/schemas/*` is dead).
- **Verdict: keep the Vercel env vars.** Revisit: make Supabase optional at build time. New feature env: `SHOW_PLANNED` (server-only, parsed strictly) and `NEXT_PUBLIC_SITE_URL` or a hard-coded `metadataBase` (Q-minor).

## ADR-R12 Content: profile facts hard-coded per component (no single source)
- **Evidence [F]:** The same facts appear with variations in `app/layout.tsx:12-63,88-120`, `components/Terminal.tsx:75-175`, `lib/utils.ts:32-86`, `features/world-viewer/model/worldData.ts:2-270`, `features/chat-assistant/model/useChatAssistant.ts:26-90`, `components/EnhancedChatAgent.tsx:~30-90`, `components/ContactActions.tsx:14-16`, `components/ContactMessage.tsx:10-12,88` and `components/PrivacyPolicy.tsx:107-110`. Bet365 has three different titles across these (audit-report F-04).
- **Verdict: replace for the new `/`** with `content/*.ts` as the single source (spec). **Do not seed it from these files.** The terminal keeps its own copies unchanged (spec), and the divergence is an accepted, documented debt (Q2 decides).

## ADR-R13 Hosting and deploy: Vercel, zero config, no CI
- **Evidence [F]:** `vercel.json:1-3`; no `.github/`, no Husky, no Dockerfile or IaC; PR numbers in history (#2…#18) suggest GitHub PRs with Vercel preview deploys [I].
- **Consequences:** No gate runs on PRs. There are no security headers. Rollback relies on Vercel's instant rollback (a strength).
- **Verdict: keep Vercel. Add** a GitHub Actions gates workflow and `headers()` (EDD 3.1 deltas).

## ADR-R14 Accessibility posture
- **Evidence [F]:** A skip link exists (`app/page.tsx:296-301`). `.sr-only` utilities. Storybook a11y addon. But: `maximumScale: 1` (`app/layout.tsx:70`), no reduced-motion handling, two `h1`, and `* {touch-action: manipulation}` on mobile (`app/globals.css:217`).
- **Verdict: revisit.** The new `/` targets WCAG 2.2 AA. The mockup's colours already pass AA (see `metrics.md` §7).
