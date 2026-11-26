# Claude Code prompt: make Sluice deployable under tijothomas.dev/play/sluice (run in the Sluice repo)

Run after `SLUICE_REPO_PROMPT.md` steps 1 to 4 (walkthrough, rename, clean-up, Phase 0).
The hosting contract is in tijothomas.dev `docs/ai/PROJECT_HOSTING.md`.

---

Goal: the Sluice web app runs as a **static, client-side demo** served at
`https://tijothomas.dev/play/sluice/` through a multi-zone rewrite to its own Vercel
project. No backend, no API keys, no keep-alive jobs, free hosting.

1. **Base path**: configure the web app (`web/`, Vite) with `base: '/play/sluice/'` and
   make all routes and assets work under it (including a direct reload on a deep route).
2. **Detection in the browser**: compile the Go rules engine and sensitive-data
   detector to WebAssembly and call them from the web app. Explain the size trade-off
   (Go vs TinyGo) and pick one.
3. **LLM comparison feature → demo mode**: replace live LLM calls with recorded
   responses (fixtures) clearly labelled "Recorded example". Remove API-key forms from
   the public demo. (A future "bring your own key" mode is out of scope.)
4. **Jira simulation**: load tickets from bundled fixtures; keep the indirect-injection
   scenarios.
5. **Audit log**: store per visitor in the browser (IndexedDB), redacted, with a
   "Clear" button; nothing leaves the browser.
6. **Header**: small "← tijothomas.dev" link, "Sluice (formerly PromptShield)", link to
   the case study `/work/sluice`.
7. **Vercel project config** for this repo: build the web app with the WASM artefact;
   output served under `/play/sluice/`. Write the exact steps for me to create the
   Vercel project and copy its URL into the portfolio's `SLUICE_ORIGIN` env var.
8. Tests: the WASM engine and the Go engine return identical decisions on the 100
   eval cases (parity test); Playwright: load the demo under the base path, analyse a
   preset, see a decision.
9. README: "Live demo: https://tijothomas.dev/play/sluice", how it works, eval table
   (real numbers only), "Formerly PromptShield".

Rules: plan first, wait for OK, small commits, no invented metrics, do not push or
deploy without asking.
