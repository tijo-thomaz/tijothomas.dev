# Claude Code prompt: rename PromptShield to Sluice, make it understandable, connect it to the portfolio

## Setup (run first, personal machine)
```bash
git clone https://github.com/tijo-thomaz/promptshield.git
cd promptshield
git checkout -b sluice/phase-0
mkdir -p docs
# copy the ARCHITECTURE.md from this kit:
cp ~/Downloads/ARCHITECTURE.md docs/ARCHITECTURE.md
claude
```
(If you installed your EDD plugin, you can run this through `/edd:edd` with work type
`feature`; otherwise paste the prompt below.)

---

## PROMPT (paste everything below)

You are a senior Go + React engineer and a patient teacher. This repo is
**PromptShield**, a 2025 proof of concept. I (the owner) no longer remember how the code
works, so **teaching me is part of the job**. Read `docs/ARCHITECTURE.md` first: it explains
why this project exists, the current state, and the target. It is the source of truth.

### Goals of this run
1. **Explain the current code to me** before changing it.
2. **Rename** the project from PromptShield to **Sluice** everywhere.
3. **Phase 0 fixes**: safety and honesty basics, plus the first measured numbers.
4. **Connect it to my portfolio** (tijothomas.dev) with a browser playground.
5. Clean up clutter.

### Step 1: Walkthrough (no code changes yet)
Write `docs/CODE_WALKTHROUGH.md` for a lead engineer who is rusty on this codebase:
- Folder map: what each folder and file does, in one line each.
- Trace one request end to end (UI → API → rules → sensitive detector → LLM/mock →
  audit log → response) with file:line references.
- How the Jira simulation works and why it is an *indirect* injection demo.
- A "known problems" list that matches section 2 of ARCHITECTURE.md, with file:line.
- 10 questions I should be able to answer after reading (with answers at the end).
Stop and wait for my OK.

### Step 2: Rename to Sluice
- Repo-facing names, Go module paths (`pkg/promptshield` → `pkg/sluice`, package name
  `sluice`), identifiers, UI titles, README, docs, Docker/compose service names.
- Keep `docs/ARCHITECTURE.md` wording; add a line to README: "Formerly PromptShield."
- Do not rename the GitHub repo yourself; list the exact steps for me at the end.

### Step 3: Clean-up
- Keep `frontend-v2` (rename folder to `web/`), delete the old `frontend/`.
- Delete Render/Railway/Fly/Vercel deployment files and guides, the keep-render-alive
  workflow, and duplicate docs (FREE_DEPLOYMENT, DEPLOYMENT_STATUS, DEPLOYMENT_SUMMARY,
  PROJECT_SUMMARY). Keep Docker Compose for local runs.
- Upgrade Go to the current stable release and update dependencies; run `govulncheck`.
- Go layout: `cmd/sluice` (server), `internal/...`, public API in `pkg/sluice`.

### Step 4: Phase 0 fixes (small commits, explain each in the commit message)
1. **Audit-log data race**: make the audit store concurrency-safe behind an interface
   (`AuditStore`), with an in-memory implementation protected by a mutex for now.
   Add a test that runs concurrent writes under `go test -race`.
2. **Privacy**: never store raw prompts or client IPs in the audit log. Store redacted
   text, a SHA-256 of the original, findings, decision, and a timestamp.
3. **Compile regexes once** at start-up; detectors are immutable after construction.
4. **Tests**: table-driven tests for each rule and the sensitive-data detector,
   including harmless look-alikes that must NOT trigger.
5. **Eval baseline**: create `eval/cases/baseline.jsonl` with 100 cases
   (50 attacks across: instruction override, role manipulation, data exfiltration,
   encoded/obfuscated, other languages, indirect-in-document; 50 harmless, including
   hard negatives such as "ignore the previous formatting and use bullets" and articles
   that discuss prompt injection). Add `eval/run` (Go) that outputs per-category
   detection rate, false-positive rate and p95 latency to `eval/report.md`.
   **Report the numbers exactly as measured, even if low. Never tune the cases to the
   rules.**
6. CI (GitHub Actions): build, `go vet`, golangci-lint, `go test -race`, run the eval
   and upload the report.

### Step 5: Portfolio connection
- Build the rules engine for the browser: `GOOS=js GOARCH=wasm` (or TinyGo if size is
  a problem; explain the choice). Expose one function: `analyse(text, channel) →
  {normalisedText, findings[], decision}`.
- In this repo, create `playground/` with a small static demo page (vanilla TS or
  React) that loads `sluice.wasm`: a text box, a channel selector (user input, document,
  tool result, tool definition), preset examples (from the eval cases), and the result.
  It must run with no server and no API keys.
- Write `docs/PORTFOLIO_INTEGRATION.md` describing exactly how to add it to the
  portfolio repo (tijo-thomaz/tijothomas.dev, Next.js): copy the built `sluice.wasm` +
  loader to `public/play/sluice/`, add a page at `/play/sluice`, and a case-study page
  at `/work/sluice` using the README's eval table. Include the code snippets.
- Do not modify the portfolio repo in this run.

### Rules
- Do not invent metrics, benchmarks or claims anywhere (README, UI, docs).
- Keep the Jira simulation; it is the best demo of indirect injection.
- After each step, summarise in plain English what changed and why, and wait for my OK.
- Small commits with clear messages. Do not push or open a PR unless I ask.
- Update `docs/ARCHITECTURE.md` section 2 ("today") at the end to match reality.

### Done when
- `go test -race ./...` passes, CI is green, `eval/report.md` exists with real numbers.
- The playground runs from `playground/` with a static file server.
- README: what Sluice is (one paragraph), why (link to ARCHITECTURE.md), baseline eval
  table with date, how to run locally in one command, playground screenshot, "Formerly
  PromptShield".
- `docs/CODE_WALKTHROUGH.md`, `docs/PORTFOLIO_INTEGRATION.md` and the repo-rename steps
  are written.
