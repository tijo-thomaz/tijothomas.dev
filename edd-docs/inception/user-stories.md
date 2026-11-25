# User stories — tijothomas.dev home redesign

- **Stage:** EDD 1.1
- **Format:** INVEST. Priority uses MoSCoW. Each story lists the FRs it traces to, the spec section (`REDESIGN_SPEC.md`), and the gate or test that proves it.
- **Spec-required tests** (QUALITY GATES) appear as explicit ACs, marked **[SPEC-TEST]**:
  1. renders h1 → US-04
  2. every city building link targets an existing section id → US-05
  3. no work card shows a number when `metric` is null → US-07
  4. planned items hidden when `SHOW_PLANNED` is false → US-08
- **Canonical ACs (scope change):** the Gherkin below is the source that `specs/*.md` is derived from. Once `specs/` exists, **`specs/` is canonical**: tests cite spec AC IDs (e.g. `HOME-AC-01`), not US IDs. The "Spec AC" column maps each story to its spec ACs.
- **Personas:** Recruiter (R), Hiring manager (HM), Staff engineer (SE), Crawler (C), Owner (O).

## Coverage matrix
| Story | Pri | FRs | Spec section | Spec ACs (canonical) | Proving gate/test |
|-------|-----|-----|--------------|----------------------|-------------------|
| US-01 | M | FR-060, FR-061 | STACK; Q1c | PLAT-AC-01, 02, 04 | CG1, CG3, CG10; `npm ls` |
| US-02 | M | FR-062–FR-066 | QUALITY GATES | PLAT-AC-03, 05, 06, 07; TERM-AC-06 | CG1 (empty env), CG3, CG4 |
| US-03 | M | FR-003–FR-008 | GOAL 2 | TERM-AC-01–05; HOME-AC-04, 05, 18 | route tests, `curl -I`, smoke |
| US-04 | M | FR-001, FR-002, FR-007, FR-021, FR-030 | GOAL 1, SEO | HOME-AC-01, 02, 03, 06, 07; CONT-AC-08 | [SPEC-TEST] renders h1 |
| US-05 | M | FR-022, FR-031 | STACK (city) | HOME-AC-08, 09, 10 | [SPEC-TEST] building links → ids |
| US-06 | M | FR-023 | COMPONENTS | HOME-AC-12 | RTL |
| US-07 | M | FR-011, FR-024 | CONTENT RULES | CONT-AC-01, 02, 11; HOME-AC-13 | [SPEC-TEST] metric null |
| US-08 | M | FR-012 | CONTENT RULES | CONT-AC-03–06 | [SPEC-TEST] planned hidden |
| US-09 | M | FR-025 | COMPONENTS | HOME-AC-14; CONT-AC-11 | RTL |
| US-10 | M | FR-026 | COMPONENTS | HOME-AC-15; CONT-AC-11 | RTL |
| US-11 | M | FR-027 | COMPONENTS | HOME-AC-16 | RTL |
| US-12 | M | FR-028, FR-029, FR-016 | CONTENT RULES, COMPONENTS | HOME-AC-17, 18; CONT-AC-08, 09 | RTL; grep |
| US-13 | M | FR-010, FR-013, FR-014, FR-015 | CONTENT RULES | CONT-AC-07, 10, 12 | placeholder scan; facts check |
| US-14 | M | FR-020, FR-032 | COMPONENTS | HOME-AC-11 | RTL |
| US-15 | M | FR-040–FR-044 | MICRO-INTERACTIONS | HOME-AC-19, 20, 21; HOME-AC-03 (no JS) | Playwright |
| US-16 | M | FR-050, FR-051, FR-057 | SEO | SEO-AC-01, 02, 03; TERM-AC-03 | metadata unit tests; OG HTTP test |
| US-17 | M | FR-052, FR-053 | SEO | SEO-AC-04, 05 | unit |
| US-18 | M | FR-054 | SEO | SEO-AC-06 | unit |
| US-19 | M | FR-055, FR-056 | STACK, SEO | SEO-AC-07, 08 | route tests |
| US-20 | M | FR-068 + NFR-001/010/022/040, NFR-020 | QUALITY GATES | SEO-AC-09, 10 | Lighthouse gate; view-source gate |
| US-21 | M | NFR-011–NFR-018 | QUALITY GATES (360px, focus) | HOME-AC-22–25 | Playwright + axe |
| US-22 | S | FR-067 | (audit F-10) | PLAT-AC-20 | `curl -I` / e2e |
| US-23 | S | FR-069 | (case study) | none (process evidence in `edd-docs/`, not product behaviour) | saved report |
| US-24 | M | FR-070, FR-072, FR-073 | scope change | PLAT-AC-08, 09, 10; TERM-AC-01 | folder test; import graph; rename check |
| US-25 | M | FR-064, FR-071, FR-080 | scope change | PLAT-AC-11, 12, 13 | path check; import graph; dep check |
| US-26 | M | FR-061, FR-075 | scope change | PLAT-AC-14, 15, 16 | `npm run lint` (Oxlint) |
| US-27 | M | FR-074 | scope change | PLAT-AC-17 | glob + `npm ls` |
| US-28 | M | FR-076–FR-079 | scope change | PLAT-AC-18, 19 | `npm run spec:check` |

All FR-001…FR-080 are covered. FR-009, FR-017–019, FR-033–039, FR-045–049 and FR-058–059 are unused IDs. There are 73 spec ACs in total: HOME 25, CONT 12, SEO 10, TERM 6, PLAT 20.

---

### US-01 Upgrade to Next 16 and React 19 without breaking anything   (Priority: Must | Traces: FR-060, FR-061 | Spec: STACK; Q1c | Proof: CG1, CG2, CG3, NFR-031)
As the **owner**, I want the site on `next@16.4.6` and React 19 so that the critical Next advisories are closed and the new page uses a supported stack.
Acceptance criteria:
- Given the upgraded lockfile, When I run `npm ls next react react-dom`, Then it reports `next@16.4.6` and `react@19.x`/`react-dom@19.x` with no `invalid` or `missing` entries.
- Given Next 16 has no `next lint`, When I run `npm run lint`, Then Oxlint runs (see US-26) and exits 0.
- Given the upgrade, When I run `npm run type-check`, Then there are 0 errors in product code.
- Given the upgraded app, When I run `npm audit`, Then the `next` critical advisories (GHSA-2xp9-vwfh-vxw4, GHSA-2464-fhr4-w9xw, GHSA-p293-qw3h-jr36) are no longer reported.
- Error: Given a dependency peer conflict with React 19, When install runs, Then the conflict is resolved by a compatible version or by removing the unused dependency. `--force`/`--legacy-peer-deps` is not used silently.

### US-02 Green, env-independent baseline   (Priority: Must | Traces: FR-062, FR-063, FR-064, FR-065, FR-066 | Spec: QUALITY GATES; Q4b | Proof: CG1, CG3, CG4)
As the **owner**, I want the build and tests to pass from a clean clone so that gates mean something.
Acceptance criteria:
- Given a shell with no `NEXT_PUBLIC_SUPABASE_*` variables, When I run `npm run build`, Then it exits 0 (E8).
- Given `/terminal` runs without Supabase env, When the page loads, Then analytics fails soft and the terminal renders (E23).
- Given `vitest.config.ts`, When a test imports `@/content/profile`, Then the suite loads (no "Failed to resolve import").
- Given the dead modules deleted under US-25, When cleanup is done, Then their tests are deleted too and every other test file passes. `npx vitest run` reports 0 failures in 3 consecutive runs.
- Given `tsc --noEmit`, When run, Then 0 errors (baseline: 139).
- Edge: Given a Tailwind class used only in `components/` (or only in `terminal/`), When I build, Then that class is present in the emitted CSS (E9).

### US-03 Terminal still available at /terminal   (Priority: Must | Traces: FR-003, FR-004, FR-005, FR-006, FR-007, FR-008 | Spec: GOAL 2, GOAL 3; Q5b, Q6b, Q9a | Proof: route tests, `curl -I`, NFR-031 smoke)
As a **staff engineer** who liked the terminal, I want it at `/terminal` so that I can still use it, while `/` stays a clean portfolio.
Acceptance criteria:
- Given the new build, When I open `/terminal`, Then the terminal renders as before. The `help` command prints its output, the theme toggle persists after reload (`localStorage['tijothomas-theme']`), and 0 uncaught console errors are logged.
- Given `/terminal`, When I view its HTML, Then it contains `<meta name="robots" content="noindex, follow">`.
- Given a request to `/v2`, When the server responds, Then the status is 308 and `location` is `/terminal`.
- Given the VersionSelector on `/terminal`, When I select "v1", Then I land on `/terminal` (not a 404).
- Given the footer of `/`, When I activate "Terminal mode", Then I navigate to `/terminal`.
- Edge: Given a returning visitor with `tijothomas-theme=cyber` in localStorage, When they open `/`, Then `<html>` has no `theme-*` class and `/` uses site colours (E5).
- Edge: Given `/`, When I inspect its imports, Then none of the terminal toolbars, floating chat, world viewer, tutorial, welcome card or Supabase modules are reachable (FR-007).

### US-04 Recruiter sees who I am in 7 seconds, in server HTML   (Priority: Must | Traces: FR-001, FR-002, FR-007, FR-021, FR-030 | Spec: GOAL 1, SEO (semantic headings) | Proof: [SPEC-TEST] renders h1; NFR-019; NFR-021; NFR-023)
As a **recruiter**, I want the name, headline, location/visa line and a clear CTA at the top so that I can decide quickly whether to read on.
Acceptance criteria:
- **[SPEC-TEST] renders h1:** Given the home page rendered with Testing Library, When I query `getAllByRole('heading', { level: 1 })`, Then exactly 1 heading is returned and its text equals `profile.headline`.
- Given the root layout, When rendered, Then it contains no `h1` (E4).
- Given a 360×740 and a 1440×900 viewport, When `/` loads, Then the location line, `h1`, intro paragraph and "View work" CTA all have `top < viewport height`.
- Given `app/(site)/**` and its import graph, When scanned, Then 0 modules contain `"use client"` except `@vercel/analytics`.
- Given the build output, When I inspect the route table, Then `/` is static.
- Edge: Given JS disabled, When I open `/`, Then the hero and all sections are visible (no "Loading..." text anywhere).
- Error: Given a content field is null (e.g. no intro), When rendered, Then the element is omitted and no empty tag or "undefined" text appears.

### US-05 The city map is a working navigation   (Priority: Must | Traces: FR-022, FR-031 | Spec: STACK (Isometric city) | Proof: [SPEC-TEST] building links → ids; NFR-002)
As a **recruiter**, I want to click a building to jump to that section so that the illustration is useful, not decoration.
Acceptance criteria:
- **[SPEC-TEST] every city building link targets an existing section id:** Given the rendered home page, When I collect every `<a>` inside the CityMap `svg`, Then there are exactly 4, each has a non-empty `aria-label` (Experience, Work, Writing, Contact), and for each `href="#x"` `document.getElementById(x)` is not null.
- Given every `a[href^="#"]` on the page (nav, CTAs, CityMap), When checked, Then each target id exists (FR-031).
- Given the SVG, When rendered, Then it has `viewBox="-418 -303 837 794"`, `width: 100%` and `height: auto`, so space is reserved before paint (CLS ≤ 0.05).
- Given the accent colour, When `--accent` is changed in CSS, Then the building roofs and flags change without code edits (no hard-coded `{{accent}}`).
- Edge: Given a section is removed from content (e.g. no visible posts), When the page renders, Then the test fails rather than shipping a dead building link. Sections with a city building always render (RQ-01).
- Error: Given a keyboard user, When they Tab to a building, Then focus is visible (US-15/US-21).

### US-06 Highlights at a glance   (Priority: Must | Traces: FR-023 | Spec: COMPONENTS | Proof: RTL)
As a **recruiter**, I want 3–4 headline facts so that I can see seniority and domain without reading the timeline.
Acceptance criteria:
- Given `profile.highlights` with N confirmed entries, When rendered, Then the Highlights region (`aria-label="Highlights"`) shows N tiles, each with value and caption.
- Edge: Given the owner removed a highlight in the facts sheet, When rendered, Then N-1 tiles show and the layout still wraps at 360 px with no horizontal scroll.
- Error: Given an empty highlights array, When rendered, Then the Highlights section is not rendered (no empty section).

### US-07 Work cards are honest about measurement   (Priority: Must | Traces: FR-011, FR-024 | Spec: CONTENT RULES, COMPONENTS (WorkCards) | Proof: [SPEC-TEST] metric null)
As a **hiring manager**, I want each project to show its problem, solution, stack and measurement status so that I can trust the numbers I see.
Acceptance criteria:
- **[SPEC-TEST] no work card shows a number when `metric` is null:** Given a work item whose `metric.value` is `null`, When its card renders, Then the metric value element reads exactly "Not yet measured" and its text matches `/^\D*$/` (no digit). The test scope is the value element (RQ-05).
- Given a work item with `metric.value` set, When rendered, Then the value appears verbatim next to its label.
- Given each visible card, When rendered, Then it has an `h3` with the item name, a subtitle, a status badge whose text maps from `status` (`live` → "Live" or the confirmed label, `in-progress` → "In progress", `planned` → "Planned"), an optional "· <target date>" suffix, a description and a stack line.
- Given a work item with no `caseStudyUrl`, When rendered, Then no "Read the case study" link appears (RQ-04). Given one with a URL, Then the link points to it.
- Edge: Given `status` outside the union, When type-checking, Then `tsc` fails (compile-time guard).

### US-08 Planned items stay hidden in production   (Priority: Must | Traces: FR-012 | Spec: CONTENT RULES | Proof: [SPEC-TEST] planned hidden; flag-parser unit test)
As the **owner**, I want planned projects and posts hidden by default so that recruiters only see work that exists.
Acceptance criteria:
- **[SPEC-TEST] planned items hidden when `SHOW_PLANNED` is false:** Given content with at least one `planned` work item and one `planned` post, When the page renders with the flag false, Then neither title appears in the DOM (not even visually hidden).
- Given `SHOW_PLANNED="true"`, When the page renders, Then planned items appear with a "Planned" badge.
- Edge (E11): Given `SHOW_PLANNED` is `"false"`, `""`, `"1"`, `"TRUE "` or unset, When parsed, Then the result is `false`. Only the exact `"true"` returns `true`.
- Edge: Given all work items are planned and the flag is false, When rendered, Then the Work section still renders its `h2` and intro with an empty-state line from content, so `#work` stays a valid target.

### US-09 Experience timeline   (Priority: Must | Traces: FR-025 | Spec: COMPONENTS (ExperienceTimeline) | Proof: RTL)
As a **hiring manager**, I want a newest-first timeline with dates, titles and locations so that I can check career progression and gaps.
Acceptance criteria:
- Given confirmed `experience` entries, When rendered, Then they are ordered by start date descending regardless of array order.
- Given the entry with `end: null`, When rendered, Then its date reads "<start> – present" and it alone shows a "Now" badge.
- Given a relocation/gap entry, When rendered, Then it shows a dashed "Move" tile and the label and dates only (no card, no bullets).
- Given each job, When rendered, Then a monogram tile with the confirmed 2-character monogram is shown and marked `aria-hidden="true"`; the company name is in text.
- Edge: Given an entry with zero bullets (e.g. Opteamix bullets not yet supplied), When rendered, Then no empty `<ul>` is output.
- Error: Given an entry whose `start` is after its `end`, When the content type test runs, Then it fails.

### US-10 How I work   (Priority: Must | Traces: FR-026 | Spec: COMPONENTS (HowIWork, 5 steps) | Proof: RTL)
As a **staff engineer**, I want to see the working method so that I can judge how the candidate approaches customer problems.
Acceptance criteria:
- Given `profile.howIWork` with 5 steps, When rendered, Then a section with `aria-label="How I work"` shows an `h2` and an ordered list of 5 items numbered 1–5, each with a title and a description.
- Edge: Given the dark section background `#0f1b2d`, When axe runs, Then 0 contrast violations (body `#c9d4e3` ≈ 11:1).
- Error: Given a step count other than 5, When the content test runs, Then it fails (the spec fixes 5 steps).

### US-11 Writing list   (Priority: Must | Traces: FR-027 | Spec: COMPONENTS (Writing list) | Proof: RTL)
As a **staff engineer**, I want to see the write-ups so that I can judge depth.
Acceptance criteria:
- Given visible posts, When rendered, Then each row shows title, subtitle and status badge ("Coming soon" or the published date).
- Given a post without a published URL, When rendered, Then the row is not a link (no `href="#writing"` self-links) (RQ-04).
- Given a post with a URL to `/writing/<slug>`, When clicked, Then that route renders.
- Edge: Given no visible posts, When rendered, Then `section#writing` still renders with its `h2` and an empty-state line, so the Writing building link stays valid (RQ-01).

### US-12 Contact without exposing private data   (Priority: Must | Traces: FR-028, FR-029, FR-016 | Spec: CONTENT RULES (placeholders); Q3b, Q8b | Proof: RTL; build-output grep)
As a **recruiter**, I want LinkedIn, GitHub and (once supplied) email in one place so that I can reach out.
Acceptance criteria:
- Given confirmed `profile.links.linkedin` and `profile.links.github`, When rendered, Then both appear as external links with `rel` containing `me` and `noopener`, and accessible names "LinkedIn" and "GitHub".
- Given `profile.email` is null, When rendered, Then no email line is shown and no `[YOUR EMAIL]` text exists. Given it is set, Then a `mailto:` link is shown.
- Given `profile.availability` is null, When rendered, Then the Availability line is omitted.
- Given no CV file in `public/`, When rendered, Then no "Download CV" control appears anywhere on `/` (nav, hero, contact) (Q8b, E22).
- Given the build output for `/`, When grepped for phone or WhatsApp patterns (`wa.me`, `tel:`, `+91`, `+44`), Then 0 matches.
- Edge: Given the footer, When rendered, Then it shows "© <year> <name>" and the "Terminal mode" link.

### US-13 Only confirmed facts, no placeholders leak   (Priority: Must | Traces: FR-010, FR-013, FR-014, FR-015 | Spec: CONTENT RULES | Proof: placeholder scan test; facts-to-content review)
As the **owner**, I want every claim on the page traced to my confirmation so that nothing false or NDA-sensitive is published.
Acceptance criteria:
- Given `edd-docs/questions/1.1-facts.md`, When content is written, Then every field in `content/*.ts` cites a facts row ID in a comment, and every cited row is answered "confirm" or "edit".
- Given any row answered "remove", When content is written, Then that claim is absent from `content/*.ts`.
- Given the rendered HTML of `/`, When scanned with `/\[[A-Z][A-Z :]+/`, Then 0 matches (`[TO MEASURE]`, `[ADD: …]`, `[NOTICE PERIOD]`, `[YOUR EMAIL]`).
- Given the components under `components/**`, When reviewed, Then no factual copy is hard-coded.
- Error: Given an unanswered facts row, When the content unit's gate runs, Then the unit is blocked (PG gate) rather than shipping a guess.

### US-14 Navigation   (Priority: Must | Traces: FR-020, FR-032 | Spec: COMPONENTS (Nav) | Proof: RTL; Playwright)
As a **recruiter**, I want a simple nav so that I can jump to Work, Experience, Writing or Contact.
Acceptance criteria:
- Given the page, When rendered, Then `nav[aria-label="Main"]` contains the brand link to `#top` and links to `#work`, `#experience`, `#writing` and `#contact`, in that order.
- Given a keyboard user, When they press Tab first, Then a "Skip to content" link appears and moves focus to `main` on activation (RQ-13).
- Edge: Given 360 px width, When rendered, Then nav items wrap without horizontal scroll and every link is ≥ 24×24 px.

### US-15 Subtle, accessible micro-interactions   (Priority: Must | Traces: FR-040, FR-041, FR-042, FR-043, FR-044 | Spec: MICRO-INTERACTIONS | Proof: CSS unit tests; Playwright; NFR-015)
As a **visitor**, I want small motion cues so that the city feels interactive, without motion harming people sensitive to it.
Acceptance criteria:
- Given a pointer hover or keyboard `:focus-visible` on a building, When the state applies, Then the building's computed transform is `translateY(-4px)`, its label pill changes to the highlight colour, and the transition is `150ms ease-out`.
- Given page load, When the car animation runs, Then it is a CSS animation of 12 s with 1 iteration.
- Given card hover, When applied, Then only `border-color` changes (box-shadow and transform unchanged).
- Given `prefers-reduced-motion: reduce`, When the page loads and a building is hovered, Then `document.getAnimations().length === 0` and transition durations ≤ 0.01 s. The focus highlight (colour) is still applied.
- Given the page bundle, When inspected, Then no JS implements these effects.

### US-16 Search and social previews   (Priority: Must | Traces: FR-050, FR-051, FR-057 | Spec: SEO | Proof: metadata unit tests; OG HTTP test)
As a **crawler** and a **recruiter sharing the link**, I want correct title, description, canonical and preview image so that the page ranks and previews well.
Acceptance criteria:
- Given the exported `metadata` for `/`, When tested, Then `title.length < 60`, `description.length` is between 70 and 160, `alternates.canonical` resolves to the confirmed origin + `/`, `openGraph.images` and `twitter.card === 'summary_large_image'` are present, and `twitter.creator` is undefined.
- Given `GET /opengraph-image`, When requested, Then 200 with `content-type: image/png` and size 1200×630.
- Given the OG image text contains "·" or "–", When rendered, Then no missing-glyph boxes appear (manual visual check recorded).
- Given the site layout's `viewport`, When tested, Then `maximumScale` is undefined and `userScalable` is not false.
- Given `/terminal`, When tested, Then its canonical is `/terminal` and robots is noindex.

### US-17 Sitemap and robots   (Priority: Must | Traces: FR-052, FR-053 | Spec: SEO | Proof: unit tests)
As a **crawler**, I want a sitemap and robots file so that I index only the right pages.
Acceptance criteria:
- Given `app/sitemap.ts`, When called, Then it returns the absolute URL of `/` and no entry for `/terminal`, `/v2`, or any `noindex` placeholder.
- Given `app/robots.ts`, When called, Then it allows `*` and has `sitemap` equal to `<origin>/sitemap.xml`.
- Edge: Given a post becomes published with a URL, When the sitemap is generated, Then the post URL is included (data-driven, not hard-coded).

### US-18 Person structured data   (Priority: Must | Traces: FR-054 | Spec: SEO (JSON-LD Person) | Proof: JSON-LD unit test; Rich Results test)
As a **crawler**, I want Person JSON-LD so that the owner's identity and profiles are linked.
Acceptance criteria:
- Given `/`, When I parse the `application/ld+json` script, Then it is valid JSON with `@type: "Person"`, `name`, `jobTitle` (the confirmed title), `url` (the confirmed origin), `sameAs` equal to `[profile.links.linkedin, profile.links.github]` and `knowsAbout` equal to `profile.knowsAbout`.
- Edge: Given a missing LinkedIn URL (not yet confirmed), When generated, Then `sameAs` contains only confirmed URLs (no empty strings or `#`).
- Error: Given content containing `</script>`, When serialised, Then `<` is escaped (`<`) so the script cannot be broken out of.

### US-19 Case-study and post scaffolds   (Priority: Must | Traces: FR-055, FR-056 | Spec: STACK (MDX later), SEO (TechArticle) | Proof: route tests)
As the **owner**, I want `/work/[slug]` and `/writing/[slug]` ready so that I can publish write-ups later without restructuring.
Acceptance criteria:
- Given the placeholder slug for each route, When requested, Then 200 with `<meta name="robots" content="noindex…">`.
- Given `/writing/<placeholder>`, When I parse its JSON-LD, Then `@type: "TechArticle"` with `headline` and `author.@type: "Person"`.
- Given an unknown slug, When requested, Then 404.
- Given the placeholder pages, When the sitemap is generated, Then they are excluded.

### US-20 Quality gates prove speed and crawlability   (Priority: Must | Traces: FR-068; NFR-001–006, NFR-010, NFR-020, NFR-022, NFR-040 | Spec: QUALITY GATES | Proof: Lighthouse gate; view-source gate)
As the **owner**, I want automated evidence for performance and crawlability so that "done" is measurable.
Acceptance criteria:
- Given `next build && next start`, When Lighthouse mobile runs 3 times on `/`, Then the median Performance, Accessibility, Best Practices and SEO are each ≥ 95, CLS ≤ 0.05, LCP ≤ 2.5 s and TBT ≤ 150 ms.
- Given the running server, When `curl /` runs (no JS), Then every rendered string from `content/*.ts` (respecting `SHOW_PLANNED`) is present in the HTML. A missing string fails the gate and names the string.
- Given `gates.yml`, When reviewed, Then both gates are listed with their commands and thresholds.
- Error: Given a score below 95, When the gate runs, Then it exits non-zero and the self-heal → RCA loop starts.

### US-21 Works on small screens and by keyboard   (Priority: Must | Traces: NFR-011–NFR-018 | Spec: QUALITY GATES (360px, focus) | Proof: Playwright + axe)
As a **recruiter on a phone** or a **keyboard user**, I want the page to fit and be operable so that I can use it however I browse.
Acceptance criteria:
- Given a 360×740 viewport, When `/` loads and is scrolled to the end, Then `document.documentElement.scrollWidth ≤ 360` (E1).
- Given keyboard only, When I Tab through every focusable element, Then each shows a visible indicator (outline ≥ 2px, ≥ 3:1 contrast) and there are 0 traps.
- Given axe-core on `/` at 360 px and 1440 px, When it runs, Then 0 violations.
- Given 360 px, When I measure link and button boxes, Then each is ≥ 24×24 CSS px or meets the WCAG 2.5.8 spacing exception.
- Edge: Given 200% browser zoom at 1280 px width, When I read the page, Then no content is clipped and there is no 2-D scrolling.

### US-22 Security headers   (Priority: Should | Traces: FR-067 | Spec: — (audit F-10, Lighthouse Best Practices) | Proof: `curl -I`)
As the **owner**, I want standard security headers so that the site resists clickjacking and MIME sniffing and scores well on Best Practices.
Acceptance criteria:
- Given `GET /`, When I read the headers, Then `strict-transport-security`, `x-content-type-options: nosniff`, `referrer-policy`, `permissions-policy` and a frame-ancestors restriction are present, and `x-powered-by` is absent.
- Given the CSP on `(site)` routes, When `/` loads, Then 0 CSP violations are reported in the console and Vercel Analytics still sends its beacon.
- Edge: Given `/terminal`, When it loads with the non-CSP headers, Then the terminal, chat and analytics still work (RQ-11).

### US-23 Record the "before" Lighthouse   (Priority: Should | Traces: FR-069 | Spec: plugin evidence (section A) | Proof: saved report)
As the **owner**, I want the current production Lighthouse mobile scores saved so that the case study can show before and after.
Acceptance criteria:
- Given the current production `/`, When Lighthouse mobile runs 3 times before deploy, Then the median report (JSON + HTML) is saved under `edd-docs/` with the date and URL.
- Error: Given the site cannot be reached, When the run fails, Then the failure is recorded and the item is marked not measured (no invented numbers).

---

## Restructure stories (PG1 scope change, 2026-11-23)

### US-24 A minimal, predictable folder structure   (Priority: Must | Traces: FR-070, FR-072, FR-073 | Spec: scope change | Proof: PLAT-AC-08, 09, 10; TERM-AC-01)
As the **owner**, I want the repo to have a small, flat folder structure (PRD §3a) so that I always know where site code, terminal code, content and specs go.
Acceptance criteria:
- Given the repo root, When I list directories, Then `features/`, `widgets/`, `shared/`, `stories/` and `.storybook/` do not exist, and app code lives only in `app/`, `components/`, `terminal/`, `content/` and `lib/`.
- Given the import graph, When checked, Then site code never imports `terminal/`, `terminal/` never imports `components/` or `content/`, and there are 0 cycles.
- Given the terminal files moved from `components/`, `features/`, `widgets/`, `shared/` and `lib/`, When compared with `git diff -M`, Then each is a rename with similarity ≥ 90% (only import paths changed).
- Edge: Given the move, When `/terminal` loads, Then it behaves as before (TERM-AC-01, TERM-AC-02).
- Error: Given a new file in a forbidden top-level folder, When the folder test runs, Then it fails and names the folder.

### US-25 Delete dead code and its tests   (Priority: Must | Traces: FR-071, FR-064, FR-080 | Spec: scope change; Q4b | Proof: PLAT-AC-11, 12, 13)
As the **owner**, I want the 58 unreachable modules and their tests gone so that the codebase only contains code that runs.
Acceptance criteria:
- Given the list in `edd-docs/audit/raw/cycles.txt` ("UNREACHABLE"), When I check each path, Then none exists.
- Given the import graph after the restructure, When computed from the route entry points, Then 0 modules under `components/`, `terminal/` and `lib/` are unreachable.
- Given the test suite, When collected, Then no test imports a deleted module, and all remaining tests pass.
- Edge: Given a module on the list that is loaded dynamically (e.g. `next/dynamic`), When the branch graph is re-run before deletion, Then it is kept and the discrepancy is recorded (risk R7).
- Edge: Given dependencies that no module uses any more (e.g. `gsap`, `zustand`), When the dependency check runs, Then they are removed from `package.json` (RQ-22).

### US-26 Lint with Oxlint only   (Priority: Must | Traces: FR-061, FR-075 | Spec: scope change | Proof: PLAT-AC-14, 15, 16)
As the **owner**, I want one fast linter so that the lint gate is quick and has no ESLint/Next 16 compatibility issues.
Acceptance criteria:
- Given `.oxlintrc.json`, When `npm run lint` runs, Then Oxlint runs with the react, nextjs, jsx-a11y, typescript and vitest plugins and exits 0 in ≤ 5 s.
- Given new or changed code outside `terminal/`, When linted, Then 0 warnings and the CG7 limits (complexity ≤ 10, ≤ 50 lines per function, ≤ 4 params, nesting ≤ 3, ≤ 400 lines per file) hold.
- Given `terminal/`, When linted, Then 0 errors and warnings are no more than the baseline (RQ-20).
- Given the repo, When searched, Then no ESLint config, `eslintConfig` key or `eslint*` dependency exists.
- Error: Given an a11y violation in `components/` (e.g. `<img>` without `alt`), When linted, Then Oxlint reports an error.

### US-27 Remove Storybook   (Priority: Must | Traces: FR-074 | Spec: scope change (overrides "keep Storybook") | Proof: PLAT-AC-17)
As the **owner**, I want Storybook removed so that the dependency tree is smaller (fewer CVEs, no React 19 peer conflicts) and there is less to maintain.
Acceptance criteria:
- Given the repo, When searched, Then there are no `.storybook/`, `stories/` or `*.stories.*` files and no `storybook`/`build-storybook` scripts.
- Given `npm ls`, When run, Then no `storybook`, `@storybook/*` or `@chromatic-com/storybook` packages are installed, and `@vitest/browser` is absent unless something else needs it.
- Given `vitest.config.ts`, When loaded, Then it has no `storybookTest` plugin.

### US-28 Spec-driven development   (Priority: Must | Traces: FR-076, FR-077, FR-078, FR-079 | Spec: scope change | Proof: PLAT-AC-18, 19)
As the **owner**, I want every requirement written as a numbered AC in `specs/` and proven by a test that cites it so that "done" means "every AC has a passing test".
Acceptance criteria:
- Given `specs/README.md`, When read, Then it defines one file per feature, `<PREFIX>-AC-NN` IDs, Gherkin-light ACs, a `Status: Draft | Approved` line, and the rule that test names cite AC IDs.
- Given `npm run spec:check` on the repo, When every AC has at least one citing test or gate check, Then it exits 0.
- Error: Given an AC with no citing test, When `spec:check` runs, Then it exits non-zero and names the AC.
- Error: Given a test citing `HOME-AC-99` (which does not exist), When `spec:check` runs, Then it exits non-zero and names the test.
- Given `.gitignore` ignores `*.md`, When `git check-ignore specs/home.md` runs, Then nothing is printed (an exception is in place).
