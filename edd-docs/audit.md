# EDD Audit Log (append-only)

| Date | Event | Detail | By |
|------|-------|--------|----|
| 2026-11-23 | Setup | Fresh clone of `tijo-thomaz/tijothomas.dev`; branch `redesign-home` from `241ad16`. Broken local copy (partial `.git`) deleted with owner approval. | orchestrator |
| 2026-11-23 | Setup | Design reference + spec committed under `docs/design/` (`258d70f`, follow-up commit). `.gitignore` had global `*.md`; added `!docs/**/*.md` and `!edd-docs/**/*.md` so spec and EDD evidence are tracked. | orchestrator |
| 2026-11-23 | Intake | Work type `feature`; deploy Vercel; PII minimal; AI none. Gates CG1–5, CG7, CG9, CG10, CG14 + Lighthouse ≥95 mobile + view-source text check. | owner |
| 2026-11-23 | Stage 1.0 start | Full codebase audit dispatched to `edd-codebase-auditor`. | orchestrator |
| 2026-11-23 | Correction | Intake note "next ^16.2.2" was wrong (read from broken pre-clone copy). Installed: next 14.2.30, React 18.3.1, Tailwind 3.4.17. | orchestrator |
| 2026-11-23 | Stage 1.0 done | Audit in `edd-docs/audit/`. Baseline: type-check FAIL (139 errors, test files only); lint PASS (0 err, 4 warn); vitest FAIL (118/198 tests); build FAIL without Supabase env, PASS with placeholders; npm audit 7 critical / 18 high; secret scan 0 hits; Lighthouse not measured. Top risks F-01 crawlability, F-04 unverified/NDA metrics in repo data, F-05 terminal-only global layout/CSS, F-02 Next advisories, F-03 open /api/chat proxy. 10 owner questions (Q1–Q10). | edd-codebase-auditor |
| 2026-11-23 | PG (1.0) approved | Owner approved audit. Decisions in `edd-docs/questions/1.0-audit.md`. Notable: Q1 owner chose Next 16.4.6 + React 19 over recommended 14.2.35 patch — adds an upgrade unit with migration risk for the terminal. | owner |
| 2026-11-23 | Stage 1.1 start | Dispatched `edd-product-analyst`. | orchestrator |
| 2026-11-23 | Stage 1.1 done | PRD (49 FR, 41 NFR), 23 user stories (US-01..23; 4 spec tests as explicit ACs), facts sheet (72 fact rows + 18 copy rows; 23 metric, 11 NDA, 6 placeholder flags), 15 requirement questions RQ-01..15. Consistency conflicts found in mockup: years of experience, bet365 tenure, relocation cities, footer "Go", PromptShield "Live" without link, HIPAA claim. Awaiting PG1. | edd-product-analyst |
| 2026-11-23 | PG1 amendment | Owner widened scope to whole-repo restructure: drop FSD, oxlint only, `specs/` at root, remove Storybook, move terminal as-is into `terminal/`, delete 58 dead modules. See `questions/1.1-scope-change.md`. Stage 1.1 re-opened. | owner |
| 2026-11-23 | Stage 1.1 amended | `specs/` created (README + home 25, content 12, seo 10, terminal-route 6, platform 20 = 73 ACs). PRD §3a target tree, FR-070..080, US-24..28, RQ-16..23. `.gitignore` gained `!specs/**/*.md` so specs are tracked. Awaiting PG1. | edd-product-analyst + orchestrator |
| 2026-11-23 | PG1 approved | Owner: "approve". Requirements, specs (73 ACs) and RQ-01..23 recommended defaults approved; specs status set Approved. Facts sheet partially answered (62/90); 28 blank and several ambiguous answers being clarified before the content unit. | owner |
