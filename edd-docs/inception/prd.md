# tijothomas.dev home redesign — PRD

- **Stage:** EDD 1.1 Requirements (feature, brownfield)
- **Branch:** `redesign-home`
- **Date:** 2026-11-23
- **Sources:** `docs/design/REDESIGN_SPEC.md` (ROLE through WORKING STYLE are binding), `docs/design/home-reference/Main.dc.html` (the mockup; written below as `Main.dc.html:Lnn`), `edd-docs/questions/1.0-audit.md` (owner decisions Q1–Q10, binding), and `edd-docs/audit/*` (baseline evidence).
- **Amended:** 2026-11-23 by the PG1 scope change (`edd-docs/questions/1.1-scope-change.md`, binding). The scope now includes a whole-repo restructure: FSD is dropped, Oxlint replaces ESLint, Storybook is removed, and the 58 unreachable modules are deleted.
- **Amended:** 2026-11-24 by the owner: `src/` layout (§3a, FR-063, FR-065). Restructure now runs before the Next 16 upgrade (`inception/plan.md`).
- **Canonical spec:** `specs/*.md` at the repo root holds the numbered acceptance criteria (`HOME-AC-01`…), and tests cite those IDs. This PRD keeps the **rationale, scope, NFRs and traceability**. If a spec AC and this PRD disagree, the spec AC wins and this PRD is corrected. Every spec AC traces to an FR/US ID here.
- **Fact rule:** This PRD sets out *rules* about content. It does not assert any fact about the owner. Every factual claim comes from `edd-docs/questions/1.1-facts.md` and must be confirmed by the owner before it goes into `content/*.ts`.

---

## 1. Problem & goals

### Problem statement
Today `/` is a client-only terminal (`"use client"` plus a `mounted` guard). The server HTML contains only "Loading tijothomas.dev..." and an off-screen hidden SEO block (audit F-01, `metrics.md` §3), so search engines and recruiters see almost nothing. The repo's profile data has unverified, NDA-sensitive metrics and three different bet365 titles (F-04). The root layout and global CSS are specific to the terminal (F-05), and pinch zoom is blocked (F-09). The project has no JSON-LD, canonical, sitemap, robots file or OG image. The baseline gates are red: 139 TS errors in tests, 118 of 198 tests fail, the build fails without Supabase env vars, and `next@14.2.30` has critical advisories (F-02).

### Goals (measurable)
| ID | Goal | KPI / success metric | Target | How measured |
|----|------|----------------------|--------|--------------|
| G1 | Content is crawlable | Share of visible text from `content/*.ts` rendered on `/` that is present in the server HTML | 100% | view-source gate script (NFR-020) |
| G2 | Fast, accessible, discoverable | Lighthouse mobile scores for Performance, Accessibility, Best Practices and SEO | each ≥ 95 (baseline: not measured; N-0 records the "before") | Lighthouse CLI, median of 3 runs (NFR-001) |
| G3 | Recruiter's 7-second skim | Name, h1 headline, location/relocation/visa line and the primary CTA are inside the first viewport | 100% at both 360×740 and 1440×900 | Playwright bounding-box check (US-03) |
| G4 | Honest content | Unconfirmed facts in `content/*.ts`; numbers shown for null metrics; bracket placeholders in HTML | 0 / 0 / 0 | facts sheet fully answered; spec tests; placeholder scan (FR-013) |
| G5 | Terminal kept | `/terminal` behaves as `/` did before the redesign | 0 functional regressions on the smoke checklist (NFR-031) | smoke test plus manual checklist |
| G6 | Green baseline | CG1–CG5, CG7, CG9, CG10, CG14 | all pass | `gates.yml` run per unit |
| G7 (post-release, owner-tracked) | Indexed | `https://tijothomas.dev/` indexed with the new title | within 14 days of production deploy | Google Search Console URL inspection |

### Non-goals
- No new interactive features on `/`: no client state, no chat, no 3D, no theme switching.
- No changes to how the terminal behaves, looks or is structured (it is moved, not refactored).
- No CMS. Content is edited in TypeScript files.
- No invented, estimated or "approximate" metrics.

---

## 2. Users & personas
| Persona | Context | What they need from `/` | Primary sections |
|---------|---------|------------------------|------------------|
| **Recruiter** (7-second skim) | Mobile or laptop, coming from LinkedIn or a job board; scans before reading | Who, what title, where, visa need, what roles, how to contact, all without scrolling far | Nav, Hero (location line, h1, intro), Highlights, Contact |
| **Hiring manager** (proof) | Reads 1–3 minutes to decide whether to interview | Concrete work with a stated problem, what was built, honest measurement status; a credible experience timeline | Work cards, Experience timeline |
| **Staff engineer** (depth) | Technical screen; checks whether claims hold up | Stack per project, method ("How I work"), write-ups, links to code; no inflated claims | Work (stack, metric label), How I work, Writing, GitHub link |
| **Search/social crawler** (system actor) | No JS; reads HTML, JSON-LD and OG tags | All text in server HTML; one h1; Person JSON-LD; canonical; OG image | Whole page, metadata |
| **Owner** (maintainer) | Edits facts later | One typed place to change facts; planned items toggled by a flag | `content/*.ts`, `SHOW_PLANNED` |

---

## 3. Scope

### In scope
1. **New `/`**, server-rendered under route group `app/(site)` with its own root layout (Q9a). It matches `Main.dc.html`. There is no `"use client"` on the page or any module it imports; the only allowed client module is `@vercel/analytics`.
2. **Terminal moved unchanged to `/terminal`** under `app/(terminal)` with its own root layout. This layout carries ThemeProvider, JetBrains Mono, the terminal CSS and Supabase `trackVisit` (Q7a). `/terminal` is `noindex, follow` (Q6b). VersionSelector "v1" points to `/terminal` (F-13).
3. **`/v2` redirects to `/terminal`** (Q5b).
4. **Platform upgrade to `next@16.4.6` + `react@19` / `react-dom@19`** and matching `@types/react*` (Q1c). Async request APIs are adopted where used. The terminal must keep working.
5. **Baseline test cleanup (Q4b, widened by the scope change):** delete the 58 unreachable modules (list: `edd-docs/audit/raw/cycles.txt`, "UNREACHABLE") **and their tests**, fix the remaining tests, and add the Vitest `@/` alias and include globs.
5a. **Repo restructure (scope change):** drop Feature-Sliced Design and adopt the target tree in §3a. The terminal code still used is moved as-is into `terminal/`; its behaviour is unchanged.
5b. **Oxlint only:** `.oxlintrc.json` with plugins react, nextjs, jsx-a11y, typescript and vitest. Remove `eslint`, `eslint-config-next`, `eslint-plugin-storybook`, `.eslintrc.json` and the `eslintConfig` key. `tsc --noEmit` stays the type gate.
5c. **Remove Storybook:** `.storybook/`, `stories/`, every `*.stories.*`, the `storybook`/`build-storybook` scripts and all `storybook`/`@storybook/*`/`@chromatic-com/storybook` deps, plus the Storybook Vitest plugin wiring. This overrides the spec's "keep Storybook".
5d. **Spec-driven workflow:** `specs/` at the repo root (format in `specs/README.md`), plus a spec-coverage gate that fails when any AC has no citing test.
6. **Build hygiene:** a lazy Supabase client so the build passes without env vars (F-07), Tailwind content globs (F-08), removal of the unused `images` config (F-22), no `maximumScale` on the site layout (F-09), and removal of the hidden SEO block (F-01).
7. **Content layer:** `content/profile.ts`, `experience.ts`, `work.ts` and `posts.ts`, typed, filled only from owner-confirmed rows of `1.1-facts.md` (Q2a).
8. **Sections:** Nav, Hero (with CityMap and CTAs), Highlights, WorkCards, ExperienceTimeline, HowIWork, Writing, Contact and Footer (with a "Terminal mode" link).
9. **SEO set from the spec:** per-route metadata (title < 60 characters, description, canonical, OG and Twitter image), `/opengraph-image` via `next/og`, `app/sitemap.ts`, `app/robots.ts`, JSON-LD `Person` on `/`, a JSON-LD `TechArticle` template on `/writing/[slug]`, and semantic headings. The Twitter handle is dropped (Q10b).
10. **Scaffold** `/writing/[slug]` and `/work/[slug]` with one placeholder each, `noindex`, excluded from the sitemap.
11. **CSS-only micro-interactions** (building lift, car, card border), all disabled under `prefers-reduced-motion: reduce`.
12. **Gates:** add a Lighthouse mobile ≥ 95 check and a "view-source contains all section text" check to `gates.yml`.
13. **Contact:** LinkedIn and GitHub links, an email placeholder until supplied, and no phone or WhatsApp (Q3b). The CV button stays hidden until a PDF exists (Q8b).

### Out of scope (explicit)
| Item | Why / where it goes | Audit ref |
|------|---------------------|-----------|
| "Ask Tijo" AI assistant on `/` | Later, separate feature (edd-state: no AI) | — |
| `/api/chat` hardening or retirement (rate limit, timeout, server-side context, input cap, GET env disclosure, markdown XSS) | Stays live, unchanged, behind `/terminal`. Handled before "Ask Tijo". | F-03, F-12, F-19, E17–E19 |
| Retiring Supabase analytics, rate-limiting it, or making its GET private | Kept on `/terminal` (Q7a). Only removed from `/`. | F-14, E20–E21 |
| Refactoring, restyling or re-architecting terminal code (beyond the mechanical move into `terminal/` and the import-path fixes) | The terminal's behaviour is unchanged. CG7 applies to new code only. | F-16 |
| Dropping runtime deps that become unused after the purge (`gsap`, `zustand`, …) | **Moved into scope** if they are unused after deletion (RQ-22). Listed here only so the change is visible. | F-17 |
| Real case studies and posts (MDX content) | Only the scaffold plus one `noindex` placeholder each | spec STACK |
| CV PDF | Hidden until the owner supplies one (Q8b) | E22 |
| Official company logos | Monogram tiles stand in (mockup `Main.dc.html:L85`) | — |
| Accent-colour picker / theming on `/` | One accent from a CSS variable | — |
| CI workflow (GitHub Actions) | EDD stage 3.1 | F-15, X-6 |
| Push / PR | Only with explicit owner approval | edd-state |

### Future (not committed)
Real MDX case studies and posts, a CV PDF, company logos, "Ask Tijo", Supabase retirement.

## 3a. Folder structure (target; scope change, binding; amended 2026-11-24: `src/` layout)
The owner chose a `src/` layout (2026-11-24). All app code lives under `src/`. The repo root keeps only config files and the non-app folders. The `@/*` alias maps to `./src/*` (`tsconfig.json` `paths`, `vitest.config.ts` `resolve.alias`), so `@/content/profile` is `src/content/profile.ts`.
```
src/
  app/
    (site)/              # home, /privacy, SEO routes; root layout A; server components only
      page.tsx, layout.tsx, opengraph-image.tsx, privacy/, work/[slug]/, writing/[slug]/
    (terminal)/terminal/ # old terminal page, root layout B (ThemeProvider, JetBrains, terminal CSS)
    api/analytics/       # kept while Supabase stays on /terminal (Q7a, RQ-17)
    sitemap.ts, robots.ts
                         # api/chat/ is deleted in U-04 (PG3 SQ-01 c)
  components/            # site UI only; server-first; no imports from src/terminal/
  terminal/              # every module /terminal still uses, moved as-is (RQ-18 a: old relative paths kept)
  content/               # typed facts and copy: profile.ts, experience.ts, work.ts, posts.ts, privacy.ts
  lib/                   # small framework-free helpers shared by site code (flags, json-ld, site url)
specs/                   # canonical feature specs with numbered ACs (README.md defines the format)
scripts/                 # gate scripts, plain Node, no new deps (RQ-19 a)
e2e/                     # Playwright tests (RQ-19 a)
edd-docs/                # EDD process evidence only (no requirements live here once specs/ exists)
docs/                    # design reference and redesign spec
public/                  # static assets
<root config files>      # package.json, tsconfig.json, next.config.*, tailwind.config.*, postcss.config.*,
                         # vitest.config.ts, playwright.config.ts, .oxlintrc.json, gates.yml, vercel.json, .env.example
```
| Folder | Rule (one line) |
|--------|-----------------|
| `src/app/(site)` | Routes and metadata only. Server components only. Rendering is delegated to `src/components/` and data comes from `src/content/`. |
| `src/app/(terminal)/terminal` | A thin route file that renders the moved terminal page. Imports only from `src/terminal/`. |
| `src/app/api/*` | Route handlers. `api/analytics` is unchanged in this feature. |
| `src/components/` | Site UI. No `"use client"`, and no imports from `src/terminal/` or `src/app/`. Tests sit next to the component as `*.test.tsx`. |
| `src/terminal/` | Legacy terminal code. May import `src/lib/` but never `src/components/` or `src/content/`. No new features. |
| `src/content/` | Data only (typed constants and types). No React and no I/O. |
| `src/lib/` | Pure helpers with no React and no terminal imports, each with a unit test. |
| `specs/` | One Markdown file per feature. Each AC ID is cited by at least one test. |
| `scripts/`, `e2e/` | Gate scripts and Playwright tests. They may read `src/` and `specs/`, and are never imported by app code. |
| `edd-docs/`, `docs/` | Process evidence and design references. Never imported by code. |

After the restructure, the root has no `app/`, `components/`, `lib/`, `features/`, `widgets/`, `shared/`, `stories/` or `.storybook/`. Tailwind `content` globs and the vitest `include` list only `src/**` paths, plus `scripts/` tests for vitest. The temporary U-00 globs for `features/`, `widgets/` and `shared/` are removed.

---

## 4. Functional requirements
Priority uses MoSCoW. "Spec" is the `REDESIGN_SPEC.md` section.

### 4.1 Routing and layouts
| ID | Requirement | Pri | Spec / decision | Verified by |
|----|-------------|-----|-----------------|-------------|
| FR-001 | `/` is served from `app/(site)/page.tsx`, a React Server Component, prerendered static at build (build output marks `/` as static). | M | GOAL 1 | build route table; NFR-004 |
| FR-002 | `app/(site)/layout.tsx` is a separate root layout: `<html lang="en">`, Space Grotesk 500/700 and Inter 400/600 via `next/font`, `metadataBase`, `<Analytics/>` from `@vercel/analytics`, site CSS only. It has no ThemeProvider, no JetBrains Mono, no terminal CSS and no hidden SEO block. | M | GOAL 1, STACK; Q9a | RTL/unit test on layout; E5 test |
| FR-003 | The old `app/page.tsx` and every module it reaches are moved as-is into `terminal/` (only import-path fixes and changes the Next 16 upgrade forces). `app/(terminal)/terminal/page.tsx` renders it, with `app/(terminal)/layout.tsx` carrying ThemeProvider, JetBrains Mono, the terminal global CSS, `<Analytics/>` and the terminal viewport. | M | GOAL 2; Q9a | `git diff -M` similarity ≥ 90% for the moved page; NFR-031 smoke |
| FR-004 | `/terminal` metadata sets `robots: { index: false, follow: true }`. | M | Q6b | unit test on exported metadata; HTML contains `<meta name="robots" content="noindex, follow">` |
| FR-005 | Requests to `/v2` (and `/v2/`) redirect to `/terminal` with HTTP 308. | M | Q5b | `curl -I /v2` → 308 and `location: /terminal` |
| FR-006 | VersionSelector "v1" navigates to `/terminal`. No in-app control targets a non-existent route (`/v1`). | M | F-13, E7 | unit: every `AVAILABLE_VERSIONS[].route` resolves to an existing route or redirect |
| FR-007 | `/` renders none of: zoom, sound, theme or version toolbars; floating chat; world viewer; tutorial; welcome card; Supabase analytics. | M | GOAL 3, STACK | import-graph check: the `(site)` tree (`app/(site)`, `components/`, `content/`, `lib/`) imports nothing from `terminal/` and nothing that reaches Supabase |
| FR-008 | The footer contains a link labelled "Terminal mode" to `/terminal`. | M | GOAL 2 | RTL |

### 4.2 Content layer and content rules (hard)
| ID | Requirement | Pri | Spec | Verified by |
|----|-------------|-----|------|-------------|
| FR-010 | All facts and copy shown on `/`, in metadata and in JSON-LD come from typed modules `content/profile.ts`, `experience.ts`, `work.ts` and `posts.ts`. Components contain no hard-coded factual copy. | M | STACK, CONTENT RULES | review; grep check: no string literals over 3 words in `components/**` except aria/structural labels in an allow-list |
| FR-011 | Each work item has a nullable `metric` (`{ label, value: string \| null }`). When `value` is `null`, the value slot renders exactly "Not yet measured" and contains no digit. | M | CONTENT RULES | spec test "no work card shows a number when metric is null" |
| FR-012 | Work items and posts have a `status`. Items with `status: 'planned'` render only when `SHOW_PLANNED` is enabled. The flag is enabled only by the exact string `"true"`; it is unset or anything else in production → hidden. | M | CONTENT RULES; E11 | spec test "planned items hidden when SHOW_PLANNED false"; unit test of the parser (`"false"`, `""`, `"TRUE "`, undefined → false) |
| FR-013 | Owner placeholders (email, notice period, Opteamix bullets) are nullable fields. When null, the line is omitted. Rendered HTML never contains mockup placeholder tokens (`[TO MEASURE]`, `[ADD:`, `[NOTICE PERIOD]`, `[YOUR EMAIL]` or any `[A-Z …]` bracket token). | M | CONTENT RULES; RQ-02 | test that scans the rendered HTML for `/\[[A-Z][A-Z :]+/` → 0 matches |
| FR-014 | `content/*.ts` contains only claims marked "confirm" or "edit" (with the edited value) in `1.1-facts.md`. Rows marked "remove" are absent. | M | CONTENT RULES; Q2a | review checklist mapping each content field to a facts row ID |
| FR-015 | bet365 content is limited to the confirmed rows in `experience.ts`: no internal metrics, architecture or vendor names beyond them. | M | CONTENT RULES | facts rows flagged NDA confirmed by the owner; review |
| FR-016 | No phone number, WhatsApp or unconfirmed email appears in `/` HTML or its JS. | M | Q3b; F-11 | grep of build output for phone/WhatsApp patterns → 0 |

### 4.3 Page sections (match `Main.dc.html`)
| ID | Requirement | Pri | Mockup | Verified by |
|----|-------------|-----|--------|-------------|
| FR-020 | **Nav** (`<nav aria-label="Main">`): a brand link to `#top`, then links to `#work`, `#experience`, `#writing` and `#contact`. The "Download CV" nav button is not rendered while no CV exists. | M | L24-35; Q8b | RTL |
| FR-021 | **Hero** `section#top`: location/relocation/visa line, the single `h1` headline, an intro paragraph, a primary CTA "View work" → `#work`, a secondary CTA (RQ-03), the tip text, and CityMap. | M | L37-51 | RTL; G3 viewport check |
| FR-022 | **CityMap** (`components/CityMap.tsx`, server component): the inline SVG ported from the mockup with fixed `viewBox="-418 -303 837 794"` and four building `<a>` links with `aria-label` Experience, Work, Writing and Contact, targeting `#experience`, `#work`, `#writing` and `#contact`. The accent colour comes from a CSS variable (`--accent`). | M | L49; STACK | spec test "every city building link targets an existing section id" |
| FR-023 | **Highlights** `section[aria-label="Highlights"]`: one tile per confirmed highlight (value + caption). | M | L53-55 | RTL |
| FR-024 | **Work** `section#work` with `h2`: a card per visible work item, each with an `h3` name, subtitle, status badge (Live / In progress / Planned, with an optional target date), problem/solution text, metric label + value (FR-011), and stack line. The case-study link is rendered only when the item has a case-study URL (RQ-04). | M | L57-80 | RTL; spec tests |
| FR-025 | **Experience** `section#experience` with `h2`: entries newest first. Each has a monogram tile, company, title, date range, location and bullets. An entry with `end: null` shows "present" and a "Now" badge. A relocation/gap entry renders with a dashed tile and no card. | M | L82-109 | RTL: order by start date descending; "Now" only on the `end: null` entry |
| FR-026 | **How I work** `section[aria-label="How I work"]` with `h2`: 5 numbered steps from content. | M | L111-116 | RTL: 5 items |
| FR-027 | **Writing** `section#writing` with `h2`: a row per visible post with title, subtitle and status badge. Rows link only when the post has a published URL (RQ-01, RQ-04). | M | L118-124 | RTL |
| FR-028 | **Contact** `section#contact` with `h2`: target roles/cities text, visa line, availability (if supplied), email (if supplied), and LinkedIn and GitHub as external links (`rel="me noopener"`). The CV button is hidden (Q8b). | M | L126-140; Q3b | RTL |
| FR-029 | **Footer**: copyright line with year and name, tagline (if confirmed), "Terminal mode" link (FR-008). | M | L142-144 | RTL |
| FR-030 | Exactly one `h1` (in Hero). Each section's title is an `h2`. Each work card name is an `h3`. Heading levels are not skipped. | M | SEO | spec test "renders h1"; heading-order test |
| FR-031 | Every in-page anchor (`href="#x"`) on `/` resolves to an element with `id="x"`. | M | E12 | test over all anchors, not just CityMap |
| FR-032 | A "Skip to content" link is the first focusable element and targets `main` (RQ-13). | S | WCAG 2.4.1 | RTL; keyboard check |

### 4.4 Micro-interactions (CSS only)
| ID | Requirement | Pri | Verified by |
|----|-------------|-----|-------------|
| FR-040 | On hover or `:focus-visible`, a city building translates up 4px and its label pill is highlighted, `150ms ease-out`. | M | CSS unit test (rule present); Playwright hover/focus computed transform `translateY(-4px)` |
| FR-041 | The car moves along the road once on load (CSS keyframes, 12s, `animation-iteration-count: 1`). | S | CSS test; Playwright `getAnimations()` duration 12000 ms, iterations 1 |
| FR-042 | Card hover changes only the border colour (no box-shadow or transform change). | S | CSS test |
| FR-043 | Under `prefers-reduced-motion: reduce`, FR-040 to FR-042 animations and transitions are disabled (duration 0 or `none`). The focus highlight (not motion) is kept. | M | NFR-015 |
| FR-044 | No JavaScript is used for any micro-interaction. | M | NFR-021 |

### 4.5 SEO
| ID | Requirement | Pri | Verified by |
|----|-------------|-----|-------------|
| FR-050 | Each route exports `metadata`: `title` < 60 characters, `description` 70–160 characters, `alternates.canonical` (absolute via `metadataBase`), Open Graph and Twitter card `summary_large_image`. No `twitter.creator` (Q10b). | M | unit test on exported metadata for `/`, `/terminal`, placeholders |
| FR-051 | `app/(site)/opengraph-image.tsx` generates a 1200×630 PNG with `next/og` showing the confirmed name and headline. Glyphs used ("·", "–") render without missing-glyph boxes. | M | build plus HTTP test: 200, `content-type: image/png`; manual visual check (E15) |
| FR-052 | `app/sitemap.ts` lists `/` only (plus future published `/work/*` and `/writing/*`). It excludes `/terminal`, `/v2` and `noindex` placeholders. | M | unit test on sitemap output |
| FR-053 | `app/robots.ts` allows all user agents and points to `https://<site>/sitemap.xml`. | M | unit test |
| FR-054 | `/` embeds one `<script type="application/ld+json">` `Person` with `name`, `jobTitle`, `url`, `sameAs` (LinkedIn + GitHub from `profile.ts`) and `knowsAbout` (from `profile.ts`). | M | unit test parses the JSON-LD; Google Rich Results test (manual) has 0 errors |
| FR-055 | `/writing/[slug]` renders a JSON-LD `TechArticle` built from post fields (`headline`, `datePublished`, `author` → Person). | M | unit test on the placeholder |
| FR-056 | `/work/[slug]` and `/writing/[slug]` exist with one placeholder each, `robots: noindex`, and return 404 for unknown slugs. | M | route tests |
| FR-057 | The site layout's viewport sets no `maximumScale` and no `userScalable: false`. | M | unit test on exported `viewport` (E2) |

### 4.6 Platform, build and test hygiene
| ID | Requirement | Pri | Decision | Verified by |
|----|-------------|-----|----------|-------------|
| FR-060 | `next@16.4.6`, `react@19`, `react-dom@19`, and matching `@types/react` and `@types/react-dom` are installed. The lockfile is updated. | M | Q1c | `npm ls next react react-dom` |
| FR-061 | `npm run lint` runs `oxlint` with `.oxlintrc.json` (plugins react, nextjs, jsx-a11y, typescript, vitest). There is no ESLint config or dependency in the repo. | M | Q1c; scope change | `npm run lint` exit 0; `npm ls eslint` empty |
| FR-062 | `npm run build` succeeds with **no** env vars set (lazy, guarded Supabase client). | M | F-07, E8 | CG1 in a clean shell |
| FR-063 | `vitest.config.ts` resolves `@/` to `./src/`, has no Storybook plugin, and includes `src/{app,components,terminal,content,lib}/**/*.test.{ts,tsx}` (amended 2026-11-24). `npm run test` runs `vitest run` (not watch mode). | M | Q4b | a test importing `@/content/profile` loads; `npm run test` exits |
| FR-064 | Test cleanup: delete every test whose subject module is deleted (FR-071). Fix every remaining failing test. | M | Q4b; scope change | CG3 0 errors; CG4 100% pass |
| FR-065 | Tailwind `content` globs are exactly `src/app/`, `src/components/`, `src/terminal/` and `src/content/` (amended 2026-11-24). | M | F-08, E9 | sentinel class present in built CSS |
| FR-066 | The unused `images` config is removed from `next.config.*`. | S | F-22 | config review |
| FR-067 | Security response headers for all routes: HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `frame-ancestors 'none'`/`X-Frame-Options: DENY`, `poweredByHeader: false`. A CSP applies to `(site)` routes (RQ-11). | S | F-10 | `curl -I` checks |
| FR-068 | `gates.yml` gets two extra gates: Lighthouse mobile ≥ 95 ×4 and the view-source text check. | M | edd-state | `gates.yml` review |
| FR-069 | A baseline Lighthouse (mobile) of the current production `/` is recorded before the deploy (case-study "before"). | S | N-0 | saved JSON/HTML report |

### 4.7 Repo restructure and spec-driven workflow (scope change)
| ID | Requirement | Pri | Decision | Verified by |
|----|-------------|-----|----------|-------------|
| FR-070 | The repo matches the target tree in §3a. `features/`, `widgets/` and `shared/` no longer exist, and no file outside the tree's folders contains app code. | M | scope change | folder-structure test (lists the top-level dirs and fails on `features/`, `widgets/`, `shared/`, `stories/`, `.storybook/`) |
| FR-071 | The 58 modules listed as unreachable in `edd-docs/audit/raw/cycles.txt` are deleted, together with their tests and stories. After the `/v2` redirect, the `/v2`-only modules are handled per RQ-16. | M | scope change | script: none of the listed paths exist; import graph shows 0 unreachable modules under `terminal/`, `components/`, `lib/` |
| FR-072 | The modules `/terminal` still uses are moved into `terminal/` with behaviour unchanged. Only import paths change (layout per RQ-18). | M | scope change | `git diff -M --stat` shows renames (similarity ≥ 90%) for moved files; NFR-031 smoke |
| FR-073 | Import-direction rules hold: `components/`, `content/` and `lib/` never import `terminal/`; `terminal/` never imports `components/` or `content/`; `content/` imports nothing but types. | M | scope change | oxlint `no-restricted-imports` (or the import-graph script); CG9 |
| FR-074 | Storybook is fully removed: no `.storybook/`, `stories/` or `*.stories.*`, no `storybook`/`build-storybook` scripts, and no `storybook`, `@storybook/*`, `@chromatic-com/storybook` or `eslint-plugin-storybook` deps. `@vitest/browser` is removed if nothing else uses it. | M | scope change | `npm ls` shows none; glob shows none |
| FR-075 | ESLint is fully removed: no `.eslintrc*`/`eslint.config.*`, no `eslintConfig` key in `package.json`, and no `eslint*` deps. | M | scope change | glob + `npm ls eslint` empty |
| FR-076 | `specs/README.md` defines the spec format: one file per feature; numbered ACs (`<PREFIX>-AC-NN`); Gherkin-light; a `Status: Draft \| Approved` line; a `Traces:` line per AC citing FR/US IDs. | M | scope change | review |
| FR-077 | A spec-coverage gate (`npm run spec:check`) parses every AC ID in `specs/*.md` and every test name in the unit and e2e tests. It fails when an AC has no citing test, or when a test cites an unknown AC ID. | M | scope change | the gate itself; a fixture test proves both failure modes |
| FR-078 | Each test name starts with or contains the AC ID(s) it proves, e.g. `it('HOME-AC-01 renders exactly one h1', …)`. | M | scope change | FR-077 gate |
| FR-079 | `specs/**/*.md` is tracked by git: `.gitignore` currently ignores `*.md` and needs an exception `!specs/**/*.md`, and `README.md` should be un-ignored (F-15). | M | scope change | `git check-ignore specs/home.md` returns nothing |
| FR-080 | Runtime and dev dependencies left unused after the purge are removed from `package.json` (RQ-22). | S | scope change, F-17 | dependency-usage check (e.g. `knip` or a grep script) reports 0 unused deps |

---

## 5. Non-functional requirements (ISO/IEC 25010)
Lighthouse runs use the Lighthouse CLI with its default mobile emulation (Moto G Power, simulated slow 4G). They run against `next build && next start` on localhost, and each result is the median of 3 runs (RQ-15).

### Performance efficiency
| ID | Requirement | Target | How measured |
|----|-------------|--------|--------------|
| NFR-001 | Lighthouse mobile Performance on `/` | ≥ 95 | Lighthouse CLI, median of 3 |
| NFR-002 | Cumulative Layout Shift on `/` | ≤ 0.05 (hard max 0.1) | Lighthouse CLS audit; the SVG keeps its fixed aspect ratio; `next/font` with `display: swap` and size-adjusted fallbacks |
| NFR-003 | Largest Contentful Paint / Total Blocking Time on `/` | LCP ≤ 2.5 s; TBT ≤ 150 ms | Lighthouse |
| NFR-004 | `/` is fully static | prerendered (○/static) with 0 dynamic APIs | `next build` route table |
| NFR-005 | JavaScript transferred for `/` | ≤ 150 KB compressed | Lighthouse "network requests", resource type script, summed |
| NFR-006 | External font requests | 0 (fonts self-hosted by `next/font`) | Lighthouse network list: no `fonts.googleapis.com`/`gstatic` |

### Interaction capability (usability) and accessibility
| ID | Requirement | Target | How measured |
|----|-------------|--------|--------------|
| NFR-010 | Lighthouse mobile Accessibility on `/` | ≥ 95 | Lighthouse |
| NFR-011 | WCAG 2.2 AA automated violations on `/` | 0 (any impact level) | `axe-core` (via `vitest-axe` on the rendered page, and `@axe-core/playwright` on `next start` at 360 and 1440 px) |
| NFR-012 | Text contrast | ≥ 4.5:1 normal text, ≥ 3:1 large text and non-text UI (badges, focus ring, building outlines) | contrast table (`metrics.md` §7) re-run for the final tokens; axe `color-contrast` |
| NFR-013 | Visible keyboard focus | 100% of focusable elements on `/` show a focus indicator with outline ≥ 2px (mockup: 3px solid `#1d4ed8`, offset 3px) and ≥ 3:1 contrast against adjacent colours; building links additionally lift and highlight their label | Playwright: Tab through the page, assert each focused element has computed `outline-style != none` and `outline-width ≥ 2px` (or building `transform`); manual check with screenshots |
| NFR-014 | Keyboard operability | All links reachable by Tab in DOM order. 0 keyboard traps. Tab count equals the number of interactive elements. | Playwright Tab walk |
| NFR-015 | Reduced motion | With `prefers-reduced-motion: reduce`: 0 running animations and every transition duration ≤ 0.01 s | Playwright `emulateMedia({reducedMotion:'reduce'})` + `document.getAnimations().length === 0` after load and hover |
| NFR-016 | Small screens | At 360×740: `document.documentElement.scrollWidth ≤ 360` and no element's right edge > 360 | Playwright (E1) |
| NFR-017 | Target size (WCAG 2.2 2.5.8) | every link/button ≥ 24×24 CSS px at 360 px, or meets the spacing exception | Playwright bounding boxes |
| NFR-018 | Zoom | Pinch zoom allowed; at 200% zoom on a 1280 px viewport, no content is lost and no 2-D scrolling (1.4.4 / 1.4.10) | viewport unit test; manual check at 320 CSS px width |
| NFR-019 | 7-second skim | At 360×740 and 1440×900, the location line, `h1`, intro paragraph and primary CTA have `top < viewport height` | Playwright bounding boxes |

### Functional suitability (crawlability and correctness)
| ID | Requirement | Target | How measured |
|----|-------------|--------|--------------|
| NFR-020 | View-source completeness | 100% of rendered text strings from `content/*.ts` for `/` (respecting `SHOW_PLANNED`) appear in the server HTML | gate script: build, `next start`, `curl /` without JS, assert each string from the content modules (HTML-entity-normalised) is present |
| NFR-021 | No client code on the page | 0 `"use client"` directives in `app/(site)/**` and in any module it imports, except `@vercel/analytics` | import-graph script + grep |
| NFR-022 | Lighthouse mobile SEO | ≥ 95 | Lighthouse |
| NFR-023 | Headings | exactly 1 `h1`; 0 skipped levels | RTL and HTML parse of server output |
| NFR-024 | Works without JS | With JS disabled, all sections are visible and all anchor links scroll to their targets | Playwright `javaScriptEnabled: false` |

### Reliability
| ID | Requirement | Target | How measured |
|----|-------------|--------|--------------|
| NFR-030 | Env-independent build | `npm run build` exit 0 with an empty env | CG1 in a clean shell |
| NFR-031 | Terminal regression after the move and upgrade | `/terminal` returns 200; 0 uncaught console errors on load; the `help` command prints output; theme switch persists via `localStorage`; floating chat opens | smoke test + manual checklist (RQ-07) |
| NFR-032 | Test stability | the full suite passes 3 consecutive runs | CG4 |

### Security
| ID | Requirement | Target | How measured |
|----|-------------|--------|--------------|
| NFR-040 | Lighthouse mobile Best Practices on `/` | ≥ 95 | Lighthouse |
| NFR-041 | Dependency vulnerabilities | 0 critical/high with a fix available (CG10) | `npm audit --json` |
| NFR-042 | Secrets | 0 | secret scan (CG10) |
| NFR-043 | Personal data on `/` | only owner-confirmed public links; 0 phone/WhatsApp patterns; no visitor data stored; no cookies set by `/` | grep build output; browser devtools shows 0 cookies on `/` |

### Maintainability
| ID | Requirement | Target | How measured |
|----|-------------|--------|--------------|
| NFR-050 | Complexity on new/changed code (CG7), outside `terminal/` | cyclomatic ≤ 10, function ≤ 50 lines, ≤ 4 params, nesting ≤ 3, file ≤ 400 lines | Oxlint rules where supported (`max-lines`, `max-lines-per-function`, `max-params`, `max-depth`, `complexity`), else a script (RQ-21) |
| NFR-051 | Coverage (CG5) | diff line coverage ≥ 80%, branch ≥ 70%; `content/` and `lib/` ≥ 85% lines | `vitest run --coverage` |
| NFR-052 | Architecture (CG9) | 0 import cycles; 0 violations of the FR-073 direction rules; 0 unreachable modules | import-graph script + oxlint |
| NFR-053 | Types and lint (CG2/CG3) | `tsc --noEmit` 0 errors; Oxlint 0 errors; 0 warnings outside `terminal/`; `terminal/` warnings ≤ the baseline count (RQ-20) | scripts |
| NFR-054 | Docs (CG14) | CHANGELOG entry; README sections for the folder rules, `content/*.ts`, `SHOW_PLANNED` and the specs workflow; affected ADRs updated | diff review |
| NFR-055 | Spec traceability | 100% of ACs in `specs/*.md` cited by ≥ 1 test; 0 tests citing unknown ACs | `npm run spec:check` (FR-077) |
| NFR-056 | Lint speed (DX) | `npm run lint` finishes in ≤ 5 s on the dev machine (baseline `next lint`: 8.9 s) | timed run |

### Compatibility and portability
| ID | Requirement | Target | How measured |
|----|-------------|--------|--------------|
| NFR-060 | Browsers | renders correctly in the latest 2 versions of Chrome, Edge, Firefox and Safari, and iOS Safari 17+ | manual check with screenshots at 360 and 1440 px |
| NFR-061 | Runtime | Node ≥ 20.9 (Next 16 minimum); deploys on the existing Vercel project without config changes beyond `next.config` | Vercel preview build (after owner approval) |

---

## 6. Content rules (hard; from spec CONTENT RULES)
1. Use **only** facts in `content/*.ts`. Never invent metrics, clients, titles, English scores, visa status or education.
2. Unmeasured results render as **"Not yet measured"**, never a number.
3. Work cards and posts with `status: 'planned'` are hidden unless `SHOW_PLANNED` is `"true"` (default false in production).
4. Placeholders left for the owner: **email, notice period, Opteamix bullets.** They never render as bracket tokens.
5. **bet365 is under NDA:** no internal metrics, architecture or vendor names beyond what is in `experience.ts`.
6. Facts come from the mockup text **only after owner confirmation** (`1.1-facts.md`). Repo profile data (`Terminal.tsx`, `lib/utils.ts`, `worldData.ts`, `useChatAssistant.ts`) is **not** a source (Q2a).

---

## 7. Constraints & assumptions
**Constraints**
- Deploy target: the existing Vercel project. No push or PR without owner approval.
- Next 16.4.6 + React 19 (Q1c), Tailwind 3.4, TypeScript strict, Vitest + Testing Library, Oxlint, `@vercel/analytics`. No ESLint and no Storybook (scope change).
- Folder structure per §3a (no FSD).
- Two root layouts via route groups (Q9a). Navigating between `/` and `/terminal` is a full page load (accepted).
- Terminal code is moved, not changed, apart from changes needed for the Next 16 / React 19 upgrade.
- `specs/` is the canonical requirement source for construction. `edd-docs/` holds process evidence only.

**Assumptions** (to be confirmed; any that fail change scope)
- A1. Production origin is `https://tijothomas.dev` (apex) — facts row F-69.
- A2. The header is not sticky (mockup L24 has no `position: sticky`), so anchor jumps don't need `scroll-margin-top`. If it becomes sticky, E13 applies.
- A3. `@vercel/analytics` sets no cookies and needs no consent banner (spec STACK: "no cookie banner needed").
- A4. (Resolved) Storybook is removed by the scope change, so its Next 16 compatibility no longer matters.
- A5. The footer year comes from the build date (RQ-12).
- A6. "How I work" steps and section headings are UI copy stored in `content/profile.ts` (RQ-14), confirmed in facts sheet Part B.

---

## 8. Risks
| ID | Risk | L | I | Mitigation |
|----|------|---|---|------------|
| R1 | Next 16 / React 19 breaks terminal code (client hooks, `useRef` typing, async request APIs, deprecated APIs) | M | H | dedicated upgrade unit before the page work; NFR-031 smoke; codemods (`@next/codemod`) |
| R2 | Facts not confirmed in time; the page ships with gaps | M | H | nullable fields + omit-when-null (FR-013); release blocked until `1.1-facts.md` is answered |
| R3 | NDA exposure via bet365 bullets | L | H | rows flagged NDA in the facts sheet; owner must confirm each |
| R4 | Lighthouse < 95 due to the large inline SVG | L | M | static SVG, no JS; measure early in U-01 |
| R5 | CG10 fails on dev-tool CVEs. Removing Storybook and `@vitest/browser` takes most of them away; the rest is vitest/playwright | M | M | RQ-08 |
| R6 | The writing section is empty in production if "Coming soon" posts count as planned | M | M | RQ-01 |
| R7 | The reachability list is from the baseline. A module deleted as "unreachable" is actually loaded dynamically (string import or `next/dynamic`) by the terminal | L | H | re-run the import graph on the branch before deleting; NFR-031 smoke after deletion; deletions in their own commit so they can be reverted |
| R8 | OG image glyph rendering (E15) | L | L | bundle a font in `opengraph-image.tsx` |
| R9 | The big mechanical move (≈ 88 terminal modules) hides an accidental behaviour change | M | M | move in one commit with `git mv` only, then path fixes in a second commit; NFR-031 smoke; review `git diff -M` similarity |
| R10 | Oxlint lacks some rules the old ESLint config had (e.g. Next-specific rules, `react-hooks/exhaustive-deps` parity) | M | L | compare the rule list before removal; record gaps in the unit's gates evidence |
| R11 | `specs/*.md` silently untracked because of `.gitignore` `*.md` | H | M | FR-079 |

---

## 9. Glossary
- **Server HTML / view-source:** the HTML returned by the server before any JS runs.
- **Route group:** a Next.js `app/(name)` folder that groups routes without changing the URL. Each group here has its own root layout.
- **SHOW_PLANNED:** an environment flag. Only the exact value `"true"` shows `planned` items.
- **Metric null:** a work item whose measurement has not been done. It renders "Not yet measured".
- **Monogram tile:** a two-letter tile standing in for a company logo.
- **AC ID:** an acceptance-criterion ID in `specs/*.md` (e.g. `HOME-AC-01`). Tests cite it in their name.
- **Spec-coverage gate:** `npm run spec:check`. It fails if any AC has no citing test.
- **Oxlint:** a Rust-based JS/TS linter that replaces ESLint here.
- **CG1–CG14:** EDD coding gates (build, lint, types, tests, coverage, complexity, architecture, security, docs, ...).
- **NDA-sensitive:** information about bet365 beyond what the owner confirms for `experience.ts`.
