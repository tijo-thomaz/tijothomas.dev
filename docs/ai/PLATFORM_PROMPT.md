# Claude Code prompt: make tijothomas.dev the home of every mini project (run in THIS repo)

Read first: `docs/ai/README.md`, `docs/ai/sluice/ARCHITECTURE.md`, and this repo's
`edd-docs/` conventions (content values cite fact rows; follow them).
Recommended: run through the EDD plugin, `/edd:edd`, work type `feature`.

---

## Context
- tijothomas.dev (Next.js, Vercel) is the **single public entry point**.
- The old standalone deployments are gone (PromptShield's Render backend and Vercel
  frontend). The terminal's chat already shows "unavailable".
- Each mini project keeps **its own repo and its own Vercel project** (free tier, no custom
  domain), but visitors only ever see **tijothomas.dev/...** URLs.
- First project: **Sluice** (formerly PromptShield), a guardrail gateway for AI agents.
  More will follow (fde-labs playgrounds, offline-sync demo, FDE Lab).

## Goal
Build a small, reusable "projects platform" inside this site:
- `/play/<slug>` → the live demo, served from the project's own deployment through
  **Next.js multi-zone rewrites** (the URL stays on tijothomas.dev).
- `/work/<slug>` → the case study, written and rendered in this repo.
- `/projects` → an index of all projects with status.

## Requirements

### 1. Project registry (single source of truth)
Extend `src/content/work.ts` / `types.ts` (keep the fact-citation convention):
```ts
slug, name, formerName?, subtitle, status, summary, stack, metric,
repoUrl?, playOrigin?: string  // read from env, e.g. SLUICE_ORIGIN
caseStudy?: boolean
```
- Rename the PromptShield entry to **Sluice** (`formerName: 'PromptShield'`,
  subtitle "Guardrail gateway for AI agents"). Add the fact rows in `edd-docs` for the
  rename. Keep `metric: null` until the Sluice eval report exists; never invent a value.
- Keep the old `/work/promptshield` URL working with a permanent redirect to
  `/work/sluice`.

### 2. Multi-zone rewrites
- In `next.config.js`, generate rewrites from the registry: for each project with a
  `playOrigin` env var set:
  `/play/<slug>` and `/play/<slug>/:path*` → `${origin}/play/<slug>/:path*`.
- If the env var is missing (not deployed yet), `/play/<slug>` renders a friendly
  in-site page: "Demo coming soon" + link to the case study and repo. Never a broken link.
- Document in `docs/ai/PROJECT_HOSTING.md` the contract every mini project must follow:
  served under base path `/play/<slug>/`, static or client-side only (no secrets,
  no paid APIs), a small "← tijothomas.dev" link in its header, same favicon,
  no own analytics or cookies.

### 3. Pages
- `/projects`: cards from the registry (status badge, one-line summary, Play and Case
  study buttons shown only when available).
- `/work/sluice`: case study from MDX: problem, why it matters (link the sources listed
  in `docs/ai/sluice/ARCHITECTURE.md`), architecture diagram, eval table **only if** the
  Sluice repo's `eval/report.md` exists (copy it with its date), trade-offs, links.
  Until then show "Evaluation in progress", not numbers.
- Home work card links: Play (if deployed) and Case study.

### 4. Security and quality
- CSP / headers allow the zones and WebAssembly (`wasm-unsafe-eval` only where needed);
  no third-party scripts added.
- SEO: metadata for `/projects`, `/work/sluice`; sitemap entries; `/play/*` pages that
  are proxied get `noindex` unless the project provides its own metadata.
- Tests: registry validation (every slug unique, every `playOrigin` is https),
  rewrites generated correctly with and without env vars, redirect from
  `/work/promptshield`, `/play/sluice` fallback page renders, no metric shown when null.
- Gates: typecheck, lint, Vitest, Playwright, `next build`, Lighthouse unchanged or better.

### 5. Deliverables
- Code + tests, `docs/ai/PROJECT_HOSTING.md`, updated `docs/ai/README.md`.
- A short checklist for me: which Vercel env vars to set (`SLUICE_ORIGIN=...`) and how
  to deploy the Sluice repo as its own Vercel project.

## Rules
Plan first and wait for my OK. Small commits. No invented metrics or claims.
Do not push or deploy without asking.
