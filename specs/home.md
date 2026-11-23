# Home page (`/`)
Status: Approved (PG1 2026-11-23; amended after PG3 2026-11-23; amended 2026-11-24: `src/` layout)
Prefix: HOME
Traces: FR-001, FR-002, FR-007, FR-008, FR-020–FR-032, FR-040–FR-044, NFR-011, NFR-013, NFR-014, NFR-016, NFR-017, NFR-019, NFR-021, NFR-024, NFR-043; US-03–US-06, US-09–US-12, US-14, US-15, US-21; SEC-20, SEC-23; CMP-01, CMP-03

## Decisions (PG3, 2026-11-23)
- **ADR-P3:** one privacy notice at `/privacy`: static server route, text from `src/content/privacy.ts`, linked from the footer of `/` and from the terminal privacy modal. Controller contact channel is LinkedIn; no email (SQ-02 a).

## Acceptance criteria
### Structure and rendering
- **HOME-AC-01** — Given the home page is rendered, when I query level-1 headings, then exactly 1 exists and its text equals `profile.headline`. _Traces: FR-030, US-04 · Verify: unit_ (spec test "renders h1")
- **HOME-AC-02** — Given the site layout and page, when I list headings, then the layout has no `h1`, each section title is an `h2`, each work card name is an `h3`, and no level is skipped. _Traces: FR-030, NFR-023, US-04 · Verify: unit_
- **HOME-AC-03** — Given `src/app/(site)`, `src/components/`, `src/content/` and `src/lib/` and their imports, when scanned, then 0 modules contain `"use client"` except `@vercel/analytics`, and the build marks `/` as static. _Traces: FR-001, FR-044, NFR-004, NFR-021, US-04 · Verify: gate_
- **HOME-AC-04** — Given the `(site)` import graph, when scanned, then nothing under `src/terminal/` and nothing that reaches Supabase is imported. _Traces: FR-007, US-03 · Verify: gate_
- **HOME-AC-05** — Given `localStorage['tijothomas-theme']='cyber'`, when `/` loads, then `<html>` has no `theme-*` class. _Traces: FR-002, US-03 · Verify: e2e_
- **HOME-AC-06** — Given JS is disabled, when `/` loads, then every section is visible, no "Loading" text exists, and each nav anchor scrolls to its target. _Traces: NFR-024, US-04 · Verify: e2e_
- **HOME-AC-07** — Given viewports 360×740 and 1440×900, when `/` loads, then the location line, `h1`, intro and "View work" CTA each have `top < viewport height`. _Traces: FR-021, NFR-019, US-04 · Verify: e2e_

### Navigation and CityMap
- **HOME-AC-08** — Given the CityMap, when I collect `<a>` inside its `svg`, then there are exactly 4 with `aria-label` Experience, Work, Writing and Contact, and each `href="#x"` matches an element with `id="x"`. _Traces: FR-022, US-05 · Verify: unit_ (spec test "every city building link targets an existing section id")
- **HOME-AC-09** — Given every `a[href^="#"]` on `/`, when checked, then each target id exists. _Traces: FR-031, US-05 · Verify: unit_
- **HOME-AC-10** — Given the CityMap SVG, when rendered, then `viewBox="-418 -303 837 794"`, and accent fills use `var(--accent)` (no literal `{{accent}}`). _Traces: FR-022, NFR-002, US-05 · Verify: unit_
- **HOME-AC-11** — Given the page, when rendered, then `nav[aria-label="Main"]` has the brand → `#top`, then `#work`, `#experience`, `#writing`, `#contact` in that order, and a "Skip to content" link is the first focusable element and targets `main`. _Traces: FR-020, FR-032, US-14 · Verify: unit_

### Sections
- **HOME-AC-12** — Given N highlights in content, when rendered, then the `Highlights` region shows N tiles (value + caption). Given N = 0, then the region is absent. _Traces: FR-023, US-06 · Verify: unit_
- **HOME-AC-13** — Given a visible work item, when its card renders, then it shows an `h3` name, subtitle, status badge (`live`→confirmed label, `in-progress`→"In progress", `planned`→"Planned", plus "· <target>" if set), description and stack. A "Read the case study" link appears only if `caseStudyUrl` is set. _Traces: FR-024, US-07 · Verify: unit_
- **HOME-AC-14** — Given experience entries in any order, when rendered, then they are sorted by start date descending. Only the `end: null` entry shows "present" and a "Now" badge. A `gap` entry has a dashed tile and no card. An entry with 0 bullets renders no `<ul>`. _Traces: FR-025, US-09 · Verify: unit_
- **HOME-AC-15** — Given `profile.howIWork`, when rendered, then the `How I work` region has an `h2` and an ordered list of 5 items with a title and description. _Traces: FR-026, US-10 · Verify: unit_
- **HOME-AC-16** — Given visible posts, when rendered, then each row shows title, subtitle and status badge, and is a link only if the post has a URL. Given 0 visible posts, then `section#writing` still renders its `h2` and the empty-state line. _Traces: FR-027, US-11 · Verify: unit_
- **HOME-AC-17** — Given contact content, when rendered, then LinkedIn and GitHub are the only contact links, each with `rel` containing `me` and `noopener`. No email line exists. The availability line is absent when null. No "Download CV" control exists anywhere on `/`. (Amended after PG3: F-64 superseded.) _Traces: FR-028, SEC-23, US-12 · Verify: unit_
- **HOME-AC-18** — Given the footer, when rendered, then it shows "© <build year> <name>" and a "Terminal mode" link to `/terminal`. _Traces: FR-008, FR-029, US-03, US-12 · Verify: unit_

### Micro-interactions (CSS only)
- **HOME-AC-19** — Given a building is hovered or has `:focus-visible`, when styles compute, then its transform is `translateY(-4px)`, its label is highlighted, and the transition is `150ms ease-out`. _Traces: FR-040, US-15 · Verify: e2e_
- **HOME-AC-20** — Given page load, when animations are listed, then the car animation lasts 12000 ms with 1 iteration. Given a card is hovered, then only `border-color` changes. _Traces: FR-041, FR-042, US-15 · Verify: e2e_
- **HOME-AC-21** — Given `prefers-reduced-motion: reduce`, when `/` loads and a building is hovered, then `document.getAnimations().length === 0`, every transition is ≤ 0.01 s, and the focus highlight colour still applies. _Traces: FR-043, NFR-015, US-15 · Verify: e2e_

### Accessibility and responsive
- **HOME-AC-22** — Given a 360×740 viewport, when `/` is scrolled to the end, then `document.documentElement.scrollWidth ≤ 360`. _Traces: NFR-016, US-21 · Verify: e2e_
- **HOME-AC-23** — Given keyboard-only use, when I Tab through `/`, then every focusable element shows an outline ≥ 2px (buildings: lift + highlight), there are 0 traps, and the Tab count equals the number of interactive elements. _Traces: NFR-013, NFR-014, US-21 · Verify: e2e_
- **HOME-AC-24** — Given axe-core at 360 px and 1440 px, when it runs on `/`, then there are 0 violations. _Traces: NFR-011, NFR-012, US-21 · Verify: e2e_
- **HOME-AC-25** — Given 360 px width, when I measure each link and button, then each is ≥ 24×24 CSS px or meets the WCAG 2.5.8 spacing exception. _Traces: NFR-017, US-21 · Verify: e2e_

### Privacy
- **HOME-AC-26** — Given a fresh browser context, when `/` loads, then `document.cookie === ''`, the context has 0 cookies for the origin, and `localStorage.length === 0` and `sessionStorage.length === 0`. _Traces: SEC-20, NFR-043, CMP-01 · Verify: e2e_
- **HOME-AC-27** — Given the footer, when rendered, then a link with text "Privacy" targets `/privacy`. _Traces: FR-029, CMP-03, ADR-P3 · Verify: unit_
- **HOME-AC-28** — Given `next start` and `curl /privacy` with no JS, when the HTML is read, then the status is 200, the build marks `/privacy` static, it has exactly 1 `h1`, and it names the controller with a LinkedIn contact link, Vercel request logs and Web Analytics, Supabase visit counters on `/terminal`, the `/terminal` localStorage keys, retention, data subject rights and the right to complain to a supervisory authority; it contains no email address. _Traces: CMP-03, SEC-23, ADR-P3 · Verify: e2e_
