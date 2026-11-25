# Metrics and baseline gate results (raw evidence)

- **Run date:** 2026-11-23
- **Machine:** Windows 11, Node v24.14.0, npm 9.8.1. The repo is at `193a733` with `node_modules` already installed (no installs were performed).
- **Raw outputs** are in `edd-docs/audit/raw/`. ANSI codes were stripped, and the vitest log was condensed from 1.5 MB.

## 0. Installed versions [F]
| Package | package.json | Installed |
|---------|--------------|-----------|
| next | `^14.0.0` | **14.2.30** (lockfile `package-lock.json:7258-7260`) |
| react / react-dom | `^18.2.0` | 18.3.1 |
| typescript | `^5.0.0` | 5.8.3 |
| tailwindcss | `^3.3.0` | 3.4.17 |
| zustand | `^5.0.8` | 5.0.8 (unused at runtime) |
| vitest | `^3.2.4` | 3.2.4 |
| eslint / eslint-config-next | `^8` / `^14` | 8.57.1 / 14.2.30 |
| storybook | `^9.1.5` | 9.1.5 |
| @supabase/supabase-js | `^2.50.2` | 2.50.2 |
| @vercel/analytics | `^1.5.0` | 1.5.0 |

Available on npm today: `next-14` tag 14.2.35, `backport` 15.5.29, `latest` 16.4.6.

## 1. Baseline gates (starting state)
| Gate | Command | Exit | Result | Raw |
|------|---------|------|--------|-----|
| CG3 Types | `npm run type-check` (`tsc --noEmit`) | **2** | **139 errors in 10 files, all `*.test.tsx`; 0 in product code**. 13.8 s | `raw/typecheck.txt` |
| CG2 Lint | `npm run lint` (`next lint`, works on 14.2.30) | 0 | **0 errors, 4 warnings** (react-hooks/exhaustive-deps: `app/v2/page.tsx:96`, `components/Terminal.tsx:561`, `components/ThemeProvider.tsx:60`, `components/ZoomControls.tsx:51`). 8.9 s | `raw/lint.txt` |
| CG4 Tests | `npx vitest run` | **1** | **Files: 12 failed / 4 passed (16). Tests: 118 failed / 80 passed (198).** 11.8 s | `raw/vitest.txt` |
| CG1 Build (no env) | `npm run build` | **1** | Compiles and lints OK, then **fails at "Collecting page data": `Error: supabaseUrl is required` in `/api/analytics`** | `raw/build.txt` |
| CG1 Build (placeholder env) | `NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder npm run build` | 0 | Success, 7 static pages | `raw/build2.txt` |
| CG9 Architecture | scripted import graph (`raw/cycles.txt`; dependency-cruiser not installed) | — | **0 cycles**. 0 upward layer imports. **5 cross-feature imports**. 58 of 185 modules unreachable. | `raw/cycles.txt` |
| CG7 Complexity | ESLint probe: `complexity>10`, `max-lines>400`, `max-lines-per-function>50`, `max-depth>3`, `max-params>4` | — | complexity: 10 functions; max-lines: 5 files; max-lines-per-function: 86; max-depth: 2; max-params: 1 | `raw/complexity.txt` |
| CG10 Dependencies | `npm audit --json` | — | **30 total: critical 7, high 18, moderate 4, low 1** | `raw/npm-audit.json` |
| CG10 Secrets | pattern grep over tracked files and full git history (`gsk_…`, JWT `eyJ…`, AWS `AKIA…`, private keys, Supabase project URLs). gitleaks is not installed. | — | **0 hits** (only the placeholder `gsk_your_groq_api_key_here` in `.env.example`) | command in audit log |
| Lighthouse mobile | — | — | **Not measured** (needs a running server and a heavy install). See roadmap N-0. | — |

### 1.1 Build route table (with placeholder env) [F]
```
Route (app)                              Size     First Load JS
┌ ○ /                                    30.3 kB         136 kB
├ ○ /_not-found                          873 B            88 kB
├ ƒ /api/analytics                       0 B                0 B
├ ƒ /api/chat                            0 B                0 B
└ ○ /v2                                  13.2 kB         119 kB
+ First Load JS shared by all            87.2 kB
○ (Static) prerendered as static content   ƒ (Dynamic) server-rendered on demand
```
Note: Next's own "checking validity of types" step passed during the build, even though `tsc --noEmit` fails. Next's check does not fail on the test files that `tsc` checks. CG3 must therefore use `tsc` explicitly.

### 1.2 Test results per file [F]
| File | Tests | Failed | Module reachable from a route? |
|------|-------|--------|-------------------------------|
| features/chat-assistant/ui/organisms/MessageList.test.tsx | 22 | 22 | no |
| features/chat-assistant/ui/molecules/MessageBubble.test.tsx | 21 | 21 | no |
| features/chat-assistant/ui/atoms/AnimatedDots.test.tsx | 7 | 7 | no |
| features/chat-assistant/ui/atoms/SendButton.test.tsx | suite failed to load | all | no |
| shared/ui/atoms/Icon.test.tsx | 19 | 19 | yes (via world-viewer) |
| features/terminal/ui/organisms/TerminalHistory.test.tsx | 19 | 19 | `/v2` only |
| shared/ui/atoms/Text.test.tsx | 24 | 11 | yes |
| shared/ui/atoms/Input.test.tsx | 23 | 9 | no |
| features/terminal/ui/molecules/CommandOutput.test.tsx | 17 | 7 | `/v2` only |
| features/terminal/ui/atoms/TerminalPrompt.test.tsx | 12 | 3 | `/v2` only |
| widgets/ThemeControls/atoms/ThemeButton.test.tsx | suite failed to load | all | yes |
| widgets/ZoomControls/atoms/IconButton.test.tsx | suite failed to load | all | yes |
| features/terminal/ui/atoms/TerminalText.test.tsx | 8 | 0 | `/v2` only |
| features/terminal/ui/atoms/TerminalInput.test.tsx | 11 | 0 | `/v2` only |
| features/terminal/ui/molecules/CommandLine.test.tsx | 6 | 0 | `/v2` only |
| shared/ui/atoms/Button.test.tsx | 9 | 0 | no |

**Suite-load failures (3 files):** `Error: Failed to resolve import "@/lib/utils" from "components/ui/button.tsx"`. `vitest.config.ts` defines no `resolve.alias` for `@/` (tsconfig `paths` are not read by Vite), so **any test that imports through `@/`, including future `@/content/*`, fails to load** until the alias is added (e.g. `resolve: { alias: { '@': path.resolve(dirname, '.') } }` or `vite-tsconfig-paths`).

Typical assertion failure: the tests pass props the component doesn't accept. For example, `TerminalHistory` is given `history`, but the component maps `output`, which throws `TypeError: Cannot read properties of undefined (reading 'map')` at `features/terminal/ui/organisms/TerminalHistory.tsx:25`.

**Coverage of the live `/` path:** 0 tests touch `app/page.tsx`, `components/Terminal.tsx`, `lib/*` or `app/api/*` (vitest `include` excludes `app/`, `components/` and `lib/`; `vitest.config.ts:17-21`).

### 1.3 TS errors per file [F]
```
24 features/chat-assistant/ui/organisms/MessageList.test.tsx
22 widgets/ZoomControls/atoms/IconButton.test.tsx
21 widgets/ThemeControls/atoms/ThemeButton.test.tsx
21 features/chat-assistant/ui/molecules/MessageBubble.test.tsx
20 features/terminal/ui/organisms/TerminalHistory.test.tsx
15 features/terminal/ui/molecules/CommandOutput.test.tsx
 7 features/chat-assistant/ui/atoms/SendButton.test.tsx
 6 shared/ui/atoms/Text.test.tsx
 2 features/terminal/ui/atoms/TerminalPrompt.test.tsx
 1 shared/ui/atoms/Icon.test.tsx
```

### 1.4 Complexity top offenders [F] (`raw/complexity.txt`)
```
36 components/Terminal.tsx:199
27 components/EnhancedChatAgent.tsx:131        (dead)
27 features/chat-assistant/model/useChatAssistant.ts:135
21 components/Terminal.tsx:588
14 features/terminal/index-old.tsx:85          (dead)
14 features/terminal/index.tsx:85
13 components/CommandSuggestions.tsx:33        (dead)
12 features/terminal/model/useTerminal.ts:748
11 components/Breadcrumbs.tsx:49               (dead)
11 widgets/Breadcrumbs/atoms/BreadcrumbItem.tsx:11
Files > 400 LOC: app/page.tsx, components/EnhancedChatAgent.tsx, components/InteractiveWorldViewer.tsx,
                 components/Terminal.tsx, features/terminal/model/useTerminal.ts
```

### 1.5 npm audit: critical and high [F] (`raw/npm-audit.json`)
| Package | Severity | Fix |
|---------|----------|-----|
| next 14.2.30 | critical | 16.4.6 (major); 15.5.29 backport fixes `<=15.5.28`; 14.2.35 fixes only the advisories below 14.2.35 |
| storybook 9.1.5, @storybook/addon-vitest | critical | patch available (non-major) |
| vitest, @vitest/browser, @vitest/coverage-v8, tinypool | critical | @vitest/coverage-v8@3.2.7 |
| @next/eslint-plugin-next / eslint-config-next 14 | high | — |
| postcss | high | via next major |
| brace-expansion, browserslist, flatted, glob, image-size, js-yaml, minimatch, nanoid, picomatch, playwright, rollup, source-map-js, vite, ws, zod | high | non-major fixes available |

`next` advisories that 14.2.35 does **not** fix include critical GHSA-2xp9-vwfh-vxw4 and GHSA-2464-fhr4-w9xw (Image Optimization API RCE with AVIF/SVG) and GHSA-p293-qw3h-jr36 (RCE on Windows-hosted servers). Inference [I]: on Vercel, `/_next/image` is served by Vercel's image service, and the site doesn't use `next/image`, so practical exposure is low. Removing `images` from `next.config.js` reduces it further.

## 2. Size and shape [F]
| Dir | TS/TSX files | LOC |
|-----|--------------|-----|
| app | 5 | 1,295 |
| components | 21 | 5,206 |
| features | 109 | 9,609 |
| widgets | 49 | 2,900 |
| shared | 21 | 2,350 |
| lib | 6 | 927 |

- `"use client"` files: 123 of all TS/TSX.
- Git history: 37 commits, 3 author identities (all the owner), first 2025-04-25. FSD PR merged 2025-09-16.
- Churn hotspots: `app/page.tsx` (13), `components/Terminal.tsx` (10), `app/globals.css` (8), `components/EnhancedChatAgent.tsx` (7).

## 3. What `/` serves to a crawler [F] (`.next/server/app/index.html`, 12,060 bytes, 17 `<script>` tags)
- Visible body text: `Loading tijothomas.dev...`, then the hidden `.seo-content` block (h1 "Tijo Thomas - Senior Frontend Engineer", skills, 5 jobs, email, phone, location, LinkedIn).
- `<h1>` count in server HTML: 1 (hidden). After hydration there is a second `h1`, "tijothomas.dev".
- JSON-LD: 0. Canonical: 0. `og:image`: absent. Viewport: `maximum-scale=1`.
- `/robots.txt` and `/sitemap.xml`: no source (no `app/robots.ts`, `app/sitemap.ts` or `public/robots.txt`).

## 4. Route and coupling inventory for the move [F]
`app/page.tsx` imports (all move unchanged to `/terminal`): `components/Terminal`, `components/ZoomControls`, `components/SoundControls`, `components/ThemeControls`, `widgets/Analytics` (Supabase stats), `widgets/VersionSelector`, `features/chat-assistant` (floating chat → `/api/chat`), `features/world-viewer`, `widgets/Breadcrumbs`, `widgets/CommandSuggestions` (welcome card plus tutorial), `widgets/PrivacyPolicy`, `lib/simple-analytics` (`trackVisit` → `/api/analytics`), and `lib/tutorial-manager`. 88 modules are reachable.

Mounted in `app/layout.tsx` (affects every route): `ThemeProvider` (client; mutates `<html>` class from `localStorage['tijothomas-theme']`), JetBrains Mono, `<Analytics/>` (keep), the hidden SEO block (remove), and `viewport.maximumScale=1` (remove).

Global CSS (`app/globals.css`) that must not apply to the new `/`: body `--theme-*` colours (L108-109), `.seo-content` (L156-162), mobile `html,body` 100vh (L172-174), `main` 100vh (L179-181), `* {touch-action: manipulation}` (L217), and the JetBrains font-family rules.

Links and references to `/`: `widgets/VersionSelector/VersionSelector.tsx:29` (`window.location.href = route` with `/v1` or `/v2`); `components/VersionSelector.tsx:127-129` maps `/v1` to `/` but is dead code. No `<Link href="/">` or `router.push('/')` exists in the code. localStorage keys are not path-scoped, so they keep working at `/terminal` unchanged.

## 5. Mockup structure [F] (`docs/design/home-reference/Main.dc.html`)
- Section ids: `top`, `work`, `experience`, `writing`, `contact`. Unnamed sections: `aria-label="Highlights"` and `aria-label="How I work"`.
- Headings: 1 `h1`; `h2` for Work, Experience, How I work, Writing, Contact; `h3` for work cards.
- City SVG: `viewBox="-418 -303 837 794"`. 4 building links with `aria-label` (Experience, Work, Writing, Contact).
- Fonts: Space Grotesk 500/700 (34 uses), Inter 400/600. The mockup loads them from fonts.googleapis.com (replace with `next/font`).
- Accent: a `{{accent}}` prop, default `#ff7a33` (options `#ffc83d`, `#5ad1a0`, `#7aa8ff`). Preview artboard is 1440×4200.
- Placeholders in the mockup: `[TO MEASURE]` (×3), `[ADD: what you delivered here]`, `[NOTICE PERIOD]`, `[YOUR EMAIL]`.

## 6. Mockup text (draft facts; to be confirmed by the owner, not by this audit)
Extracted with tags stripped. These are the claims that would go into `content/*.ts`: headline "Lead Software Engineer building reliable AI systems"; "Bengaluru, India · Relocating to Manchester or Germany · Visa sponsorship needed"; highlights "9+ years", "4 regulated markets", "10 languages"; work: PromptShield (Live PoC), fde-cloud-spine (In progress · Dec 2026), fde-mcp-gateway (Planned · Dec 2026); experience: Opteamix (Lead Software Engineer, Apr 2026 – present), relocation (Dec 2025 – Mar 2026), bet365 Group Ltd (Software Developer, Feb 2023 – Nov 2025), Infosys (Consultant / UI Lead, May 2021 – Jan 2023), NetObjex (Software Engineer, May 2020 – May 2021), QBurst (Engineer, Nov 2018 – Mar 2020), Speridian (Associate, Nov 2016 – Jul 2018); 3 posts "Coming soon"; contact: roles in Manchester, Berlin, Munich, Hamburg; UK Skilled Worker or EU Blue Card.

## 7. Colour contrast of mockup pairs [F] (WCAG relative luminance, computed)
| Foreground on background | Ratio | AA normal text (4.5) |
|--------------------------|-------|----------------------|
| #0f1b2d on #ffffff / #f4f7fa / #e6f5ec | 17.28 / 16.08 / 15.34 | pass |
| #4a5568 on #ffffff / #f4f7fa / #e6f5ec | 7.53 / 7.00 / 6.68 | pass |
| #0f1b2d on accent #ff7a33 (CTA) | 6.65 | pass |
| #c9d4e3 on #0f1b2d (footer) | about 11 | pass |
| #e2551f / #c84714 / #3f9a6b | — | used only as SVG fills (non-text), so 3:1 non-text contrast applies |
