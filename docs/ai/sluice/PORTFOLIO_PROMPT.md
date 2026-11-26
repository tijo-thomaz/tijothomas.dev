# Claude Code prompt: add Sluice to the portfolio (run in THIS repo)

Run this only after the Sluice repo has a working `playground/` and a built `sluice.wasm`
(see `SLUICE_REPO_PROMPT.md`, steps 4 to 5). Read `ARCHITECTURE.md` in this folder first.

---

You are working in tijothomas.dev (Next.js). Add the Sluice project to the portfolio.

1. **Assets**: copy the built `sluice.wasm` and its JS loader from the Sluice repo's
   playground build into `public/play/sluice/`. Load them lazily, only on the playground
   page, so the home page bundle does not grow.
2. **Playground page `/play/sluice`**: text area, channel selector (user input, document,
   tool result, tool definition), preset examples, and the result: normalised text,
   findings (type, severity, reason) and the decision (allow / sanitise / block /
   require approval). Runs entirely in the browser; no API keys; works offline once
   loaded. Accessible (labels, keyboard, visible focus), works at 360px.
3. **Case study `/work/sluice`** (MDX, following the existing content model): problem,
   why it matters (link the OWASP Agentic Top 10 and MCP tool-poisoning sources from
   ARCHITECTURE.md), architecture diagram, **eval table copied from the Sluice README
   with its date**, trade-offs, what's next, links to repo and playground.
4. **Work card on the home page**: rename the PromptShield card to Sluice ("Guardrail
   gateway for AI agents"), status from the content data, metric = the real baseline
   detection rate, or "Not yet measured" if the eval has not run.
5. SEO: metadata for both pages; TechArticle JSON-LD on the case study; add to sitemap.
6. Tests: the playground renders, a preset produces a decision, the case study has no
   invented numbers (metric comes only from content data).

Rules: no invented metrics; plan first and wait for OK; small commits; do not push
without asking.
