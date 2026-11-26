# AI build prompts and specs

Prompts and specs used to build and extend this portfolio and its showcase projects with
AI coding agents (Claude Code, agy and similar). Kept in the repo so every change is
traceable to a written spec.

| Folder / file | What it is | Run it in |
|---|---|---|
| `../design/REDESIGN_SPEC.md` | Home page redesign spec (done, PR #19) | this repo |
| `sluice/ARCHITECTURE.md` | Why Sluice (formerly PromptShield) exists, today vs target architecture | read first |
| `sluice/SLUICE_REPO_PROMPT.md` | Rename to Sluice, code walkthrough, Phase 0 fixes, eval baseline, WebAssembly playground | the Sluice repo |
| `PLATFORM_PROMPT.md` | Make this site the home of every mini project: registry, `/play/<slug>` multi-zone rewrites, `/work/<slug>` case studies, `/projects` index, PromptShield → Sluice | this repo |
| `PROJECT_HOSTING.md` | The contract every mini project follows to be served at `/play/<slug>` (base path, static only, same-origin CSP, no analytics), and how to add one | read before deploying a project |
| `sluice/SLUICE_DEPLOY_PROMPT.md` | Turn Sluice into a static, client-side demo served at `/play/sluice` (WebAssembly engine, recorded LLM examples, no backend) | the Sluice repo |
| `fde-lab/PROMPT.md` | Build FDE Lab, the visual learning portal | a new `fde-lab` repo |
| `fde-lab/DESIGN.md` + `*.html` | Design spec and prototypes for FDE Lab | copy to `fde-lab/docs/reference/` |

Order: Sluice repo prompt (steps 1–4) → `PLATFORM_PROMPT.md` here → Sluice deploy prompt → set `SLUICE_ORIGIN` on Vercel → FDE Lab.
Rule for every prompt: plan first, no invented metrics, the owner reviews each phase.
