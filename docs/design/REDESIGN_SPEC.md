# Claude Code prompt — rebuild tijothomas.dev home

Run everything on your PERSONAL machine (portfolio work stays off the company laptop).

## 0. Setup commands

### macOS / Linux / Git Bash
```bash
# 1) Clone your site and create a branch
git clone https://github.com/tijo-thomaz/tijothomas.dev.git
cd tijothomas.dev
git checkout -b redesign-home
npm install

# 2) Add the design reference + this spec to the repo
mkdir -p docs/design
cp ~/Downloads/home-reference.html docs/design/home-reference.html
cp ~/Downloads/CLAUDE_CODE_PROMPT.md docs/design/REDESIGN_SPEC.md
git add docs/design && git commit -m "docs: add redesign reference and spec"

# 3) Install your AI-DLC plugin (once per machine)
claude plugin marketplace add tijo-thomaz/claude-aidlc
claude plugin install aidlc@claude-aidlc

# 4) Start Claude Code in the repo
claude
```

### Windows PowerShell
```powershell
git clone https://github.com/tijo-thomaz/tijothomas.dev.git
cd tijothomas.dev
git checkout -b redesign-home
npm install

New-Item -ItemType Directory -Force docs\design | Out-Null
Copy-Item "$HOME\Downloads\home-reference.html" docs\design\home-reference.html
Copy-Item "$HOME\Downloads\CLAUDE_CODE_PROMPT.md" docs\design\REDESIGN_SPEC.md
git add docs/design; git commit -m "docs: add redesign reference and spec"

claude plugin marketplace add tijo-thomaz/claude-aidlc
claude plugin install aidlc@claude-aidlc

claude
```

Then pick ONE of the two ways below: **A (recommended)** runs the build through
your own AI-DLC plugin so the redesign doubles as the claude-aidlc case study;
**B** is a plain Claude Code run.

---

## A. Run it with AI-DLC (recommended — this is your case study)

Inside Claude Code, type:

```
/aidlc:aidlc
```

When it asks its intake questions, answer with this (paste it):

```
Intent: Rebuild the home page of tijothomas.dev as a server-rendered, SEO-friendly
portfolio for recruiters and hiring managers, matching docs/design/home-reference.html.
Full requirements, content rules, SEO and quality gates: docs/design/REDESIGN_SPEC.md
(read it fully; sections ROLE through WORKING STYLE are the requirements).
Users: recruiters (7-second skim), hiring managers (proof), staff engineers (depth).
Work type: feature (existing codebase — run the codebase audit first).
Deploy target: Vercel (existing project).
PII: minimal — owner's public contact links only; no visitor data stored.
AI: none in this feature (the "Ask Tijo" assistant is a later, separate feature).
Constraints: never invent facts or metrics; content only from content/*.ts;
keep the terminal at /terminal; do not push or open a PR without my approval.
Gates: CG1–CG5, CG7, CG9, CG10, CG14 must pass; add a Lighthouse ≥95 (mobile)
check and a "view-source contains all section text" check to gates.yml.
```

Useful commands while it runs:
```
/aidlc:aidlc status          # where are we, next step, blockers
/aidlc:aidlc gates U-01      # re-run gates for a unit (self-heal → RCA loop)
```

**Capture evidence for the case study as you go** (screenshot or copy into your JOURNAL.md):
- the audit findings on the old site (e.g. client-only rendering, SEO gaps)
- each gate result per unit, how many self-heal loops ran, any RCA
- every point where YOU had to approve or decide (phase gates)
- final Lighthouse scores before vs after
Keep the `aidlc-docs/` folder on the branch — it IS the evidence.

---

## B. Plain Claude Code run (alternative)

Paste everything from "ROLE" to the end of this file into Claude Code.

---

## ROLE
You are a senior Next.js engineer. Rebuild the home page of this repo
(tijothomas.dev) to match the design in `docs/design/home-reference.html`,
keeping it honest, fast, accessible and crawlable by search engines.

## CONTEXT
- Owner: Tijo Thomas, Lead Software Engineer (React, TypeScript, Go), ex-bet365 UK.
  Targets: Forward Deployed Engineer, Senior Full-Stack, Applied AI roles in
  Manchester or Germany (needs visa sponsorship).
- Current site: Next.js 14, a client-only terminal on `/` (`"use client"` +
  `mounted` state), floating chat, 3D world viewer, Supabase analytics.
  Problem: almost no content is in the server-rendered HTML, so Google and
  recruiters see little.

## GOAL (this branch only)
1. New `/` = the design reference, as **server components / static HTML**
   (no `"use client"` on the page; client islands only where interaction needs it).
2. Move the existing terminal experience to `/terminal` unchanged (link to it
   from the footer as "Terminal mode"). Do not delete it.
3. Remove from `/`: zoom/sound/theme/version toolbars, floating widgets,
   tutorial, welcome card.

## STACK DECISIONS
- Keep: Next.js (App Router), TypeScript strict, Tailwind, Vercel, Vitest,
  Storybook. Upgrade Next.js only if a change is needed; ask first.
- Content: typed data in `content/` (`profile.ts`, `experience.ts`,
  `work.ts`, `posts.ts`) — single source of truth; no copy hard-coded in
  components.
- Posts/case studies later via MDX (`@next/mdx`) — scaffold `/writing/[slug]`
  and `/work/[slug]` routes with one placeholder each, `noindex` until real.
- Analytics: keep `@vercel/analytics`; remove Supabase analytics from `/`
  (no cookie banner needed).
- Isometric city: port the inline SVG from the reference into
  `components/CityMap.tsx` (server component). Buildings are `<a>` links to
  section anchors with `aria-label`s. Accent colour from a CSS variable.

## COMPONENTS (Feature-Sliced or current repo conventions — follow what exists)
Nav · Hero (positioning + CityMap + CTAs) · Highlights · WorkCards
(status badge: Live / In progress / Planned) · ExperienceTimeline (monogram
tiles, "Now" badge, relocation entry) · HowIWork (5 steps) · Writing list ·
Contact · Footer.

## CONTENT RULES (hard)
- Use ONLY facts in `content/*.ts`. Never invent metrics, clients, titles,
  English scores, visa status or education.
- Unmeasured results render as "Not yet measured" — never a number.
- Hide any work card or post whose `status` is `planned` behind a
  `SHOW_PLANNED` flag (default false in production).
- Placeholders left for the owner: email, notice period, Opteamix bullets.
- bet365 is under NDA: no internal metrics, architecture or vendor names
  beyond what is in `experience.ts`.

## MICRO-INTERACTIONS (CSS only, all disabled under prefers-reduced-motion)
- City building hover/focus: lift 4px + label highlight, 150ms ease-out.
- Car moves slowly along the road on load (CSS keyframes, 12s, once).
- Card hover: border colour change only (no big shadows).

## SEO (do all)
- `metadata` per route: title < 60 chars, description, canonical, Open Graph
  + Twitter image (generate with `next/og` at `/opengraph-image`).
- `app/sitemap.ts`, `app/robots.ts`.
- JSON-LD `Person` on `/` (name, jobTitle "Lead Software Engineer",
  url, sameAs: LinkedIn + GitHub from `profile.ts`, knowsAbout list).
- JSON-LD `TechArticle` template for `/writing/[slug]`.
- Semantic headings: one `h1`, sections `h2`, cards `h3`.
- No layout shift: fixed SVG aspect ratio, `next/font` for Space Grotesk +
  Inter.

## QUALITY GATES (must pass before you say done)
- `npm run type-check`, `npm run lint`, `npm run test`, `npm run build`.
- Vitest + Testing Library tests: renders h1; every city building link
  points to an existing section id; no work card shows a number when
  `metric` is null; planned items hidden when flag is false.
- Lighthouse (mobile) ≥ 95 on Performance, Accessibility, Best Practices, SEO.
- Works at 360px wide with no horizontal scroll; keyboard focus visible.
- View page source of `/`: all section text present in the HTML.

## WORKING STYLE
- Plan first: list files you will create/change and wait for my OK.
- Small commits with clear messages. Do not push or open a PR unless I ask.
- Explain any trade-off you make in one line in the PR description draft.
