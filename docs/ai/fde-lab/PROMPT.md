# FDE Lab — build prompt (paste this whole file into the agent)

Before starting, the repo must contain (copied from this kit):
- `docs/reference/DESIGN.md` — design system and per-tab wireframes (source of truth for UI)
- `docs/reference/fde-lab-prototype.html` — lesson player look & feel
- `docs/reference/harness-lab-simulators.html` — simulator look & feel
Open both HTML files in a browser before planning.

---

## ROLE
You are a senior product engineer and technical educator. Build **FDE Lab**: a
visual, hands-on learning portal that teaches the skills of a Forward Deployed
Engineer (FDE): AI systems, reliability, harness engineering, evals, AI security,
building AI interfaces and customer delivery, from zero to production level.

## AUDIENCE
1. **Developers of any stack, especially frontend developers**, who learn by
   playing: no local setup for the first 10 minutes of any topic.
2. **The owner (Tijo)**, a lead engineer (React/TypeScript/Go) learning these
   topics deeply; learns visually and by doing.
3. **Hiring managers** viewing it as a portfolio piece (served later at
   tijothomas.dev/lab): quality, accuracy and accessibility matter.

## PRODUCT PRINCIPLES
- **Zero setup first.** Every topic's first 10 minutes runs in the browser:
  visual concept, simulator, editable TypeScript playground. Local Go labs are
  the "go deeper" path.
- **Any language.** Every code snippet has tabs: TypeScript (default), Python,
  Go. Same behaviour in each.
- **Bridge from what people know.** Every Concept tab opens with a
  "You already know this" callout mapping a familiar (mostly frontend) idea
  to the topic.
- **Predict, then see.** Simulators and experiments require a prediction
  before running.
- **Honest.** Simulations are labelled illustrative with assumptions listed;
  no invented statistics; sources for any claim about current tools.

## TOPIC PAGE: 8 TABS (identical structure for every topic; layouts in DESIGN.md)
1. **Overview**: what it is, why FDEs care, prerequisites, time to complete,
   what you'll be able to do after.
2. **Get started**: minimal runnable example in an in-browser TypeScript
   playground (edit + run + output), plus Python/Go tabs to copy.
3. **Concept**: "You already know this" callout, then 5–8 animated isometric
   steps (title, plain explanation, "Picture it" analogy, highlighted
   pseudocode, "Who holds what" state table). Keyboard ← →.
4. **Real-world scenario**: a fictional customer story: problem, constraints
   (PII, latency, cost, compliance), the naive failure, the fix, what to
   monitor afterwards.
5. **Simulator**: typed controls, predict-first gate, seeded randomness,
   results chart, "what you just saw", "Break it" challenges with hidden
   target conditions, shareable state in the URL hash.
6. **Hands-on lab**: checkpoints with goal, 3-level hint ladder, a local test
   command and expected output, solution unlocked only after "I tried it",
   and 3+ "break it on purpose" experiments. Browser version (TypeScript)
   for the first checkpoints; Go repo for the full lab.
7. **Cheat sheet**: one printable page: key terms, use-when / avoid-when
   table, snippets (with language tabs), common mistakes, interview questions
   with short model answers. Print stylesheet; copy buttons.
8. **Recall & field doc**: 3–5 free-text recall questions (answer revealed
   after), and a filled-in FDE document for the topic (discovery brief, spec,
   ADR, runbook or handoff note) plus a blank copyable version.

## "YOU ALREADY KNOW THIS" MAPPINGS (use these; add more per topic)
| Familiar idea | Topic it unlocks |
|---|---|
| Double-clicked "Pay" button sending two requests | Idempotency keys |
| `fetch` / React Query retry settings | Backoff & jitter, safe retries |
| React state passed down as props | The agent's context window |
| Optimistic UI and rollback | Compensating actions, write gates |
| Service workers & offline sync | Queues, dead-letter queues, eventual consistency |
| Form validation | Guardrails, structured-output validation |
| Snapshot tests | Evals and golden sets |

## CURRICULUM
- 01 Foundations: Agent loop (**MVP**) · Context windows · Tool calling · Structured output
- 02 Reliability: Idempotency & safe retries (**MVP**) · Backoff & jitter · Dead-letter queues · Backpressure
- 03 Harness engineering: Guides, gates & sensors · Self-fixing loops · Context compaction · MCP permissions
- 04 Evals: Golden sets · Noisy judges · Release gates · Cost & latency budgets
- 05 AI security: Direct & indirect prompt injection · PII redaction · Human-in-the-loop write gates
- 06 Building AI interfaces: Streaming responses in React · Tool-call & agent-step UIs · Human-approval UX · Citations & confidence · Eval dashboards
- 07 FDE practice: Discovery · Writing specs · Messy customer data · Demos · Handoffs & runbooks

Write the two MVP topics fully (all 8 tabs). Every other topic: a stub with
Overview + outline, status `planned`, hidden unless `SHOW_PLANNED=true`.

## CONTENT MODEL (lessons are data, not code)
- `content/topics/<slug>/`: `topic.mdx` (Overview, Scenario, Cheat sheet,
  Field doc sections), `concept.json` (steps + scene specs + bridge callout),
  `simulator.json` (controls, defaults, model id, challenges), `lab.mdx`
  (checkpoints), `snippets/` (same example in .ts/.py/.go), `recall.json`,
  `meta.json` (title, module, status, reviewed, timeToComplete, sources).
- Validate all of it with **zod** at build time; the build fails with
  "topic + file + field" messages. Cross-field checks: scene arrays match
  tile count; highlighted lines exist; checkpoint ids unique; every snippet
  exists in all three languages.
- Adding a topic must need **zero React code**.

## ENGINE COMPONENTS
`AppShell` (sidebar, top bar, command palette) · `TopicTabs` · `IsoScene`
(any scene spec → responsive SVG, ≥ 320px) · `ConceptPlayer` · `BridgeCallout`
· `CodeTabs` (TS/Python/Go, copy) · `Playground` (in-browser TypeScript,
sandboxed: Web Worker or sandboxed iframe, time limit, no network) ·
`Simulator` framework (typed controls, mulberry32 seeded RNG, pure model
functions in `src/sims/<id>.ts`, predict gate, inline-SVG chart, URL-hash
state, challenges) · `LabCheckpoint` · `HintLadder` · `Solution` ·
`CheatSheet` (print CSS) · `RecallQuiz` · `FieldDoc` · `Callout` ·
`ClarityVote` (per step, thumbs icons, stored locally; optional analytics
event) · `CompletionBadge` (SVG, shareable) · `ProgressPage`.
Progress in localStorage (always try/catch). Search: Pagefind. Palette: Ctrl/⌘+K.

## STACK
Next.js (App Router, static generation), TypeScript strict, Tailwind with the
tokens in DESIGN.md, MDX, zod, Vitest + Testing Library, Playwright, Storybook
(one story per scene type and per simulator). No backend for the MVP. Vercel.
Configure `basePath` so it can be served under `/lab` later.

## ACCURACY & HONESTY (hard rules)
- Never invent statistics, benchmarks, quotes, or real-sounding companies.
  Scenario companies are obviously fictional.
- Simulations carry an "Illustrative model" label and list their assumptions.
- Claims about current tools/APIs/standards cite official sources in a
  "Sources" list; if unsure, write `TODO(verify)` instead of guessing.
- Original writing only; never copy other courses or docs.
- Every MVP topic has `reviewed: false` in `meta.json` and shows a small
  "Draft" badge until the owner flips it after doing the lab.

## QUALITY GATES (must pass before reporting "done")
- typecheck, lint, Vitest, `next build` (including zod validation),
  Playwright: open a topic, visit all 8 tabs, step the concept with the
  keyboard, predict then run a simulator, share its URL and reload to the same
  state, run the playground, unlock a solution, print-preview the cheat sheet.
- Simulator models: unit tests with fixed seeds and known outputs.
- Lighthouse mobile ≥ 95 on all four categories for a topic page.
- WCAG 2.2 AA: contrast, visible focus, 44px targets, reduced motion respected,
  every interactive part reachable by keyboard.
- No horizontal scroll at 360px. Code blocks scroll inside themselves.

## DELIVERY PLAN (stop after each phase and show me)
1. Schemas + validation + AppShell + TopicTabs + IsoScene + ConceptPlayer, using
   the Idempotency topic's Concept tab.
2. The other 7 tabs for Idempotency, Simulator framework (timeout rate,
   retries, idempotency-key toggle), Playground, CodeTabs.
3. Agent loop topic end to end, Progress page, search, command palette,
   badges, ClarityVote.
4. Stubs for all planned topics, SEO (metadata, sitemap, OG images,
   TechArticle JSON-LD per topic), CONTRIBUTING.md + issue templates
   ("new topic", "translation"), deploy config.

## WORKING STYLE
- First, write a plan (folders, schemas, components, order of work) and wait
  for my OK before coding.
- Small commits with clear messages. Never push or deploy without asking.
- After each phase: what's done, screenshots, what's tested, open questions.
- Record non-obvious decisions as short ADRs in `docs/adr/`.
