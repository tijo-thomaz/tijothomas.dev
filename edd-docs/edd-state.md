# EDD State

## Project
- **Name:** tijothomas.dev home redesign
- **Intent:** Rebuild `/` as a server-rendered, SEO-friendly portfolio for recruiters and hiring managers, matching `docs/design/home-reference/Main.dc.html`. Full requirements in `docs/design/REDESIGN_SPEC.md` (ROLE through WORKING STYLE). Existing terminal moves to `/terminal`.
- **Target users:** recruiters (7-second skim), hiring managers (proof), staff engineers (depth)
- **Work type:** feature (brownfield; full codebase audit first)
- **Deployment target:** Vercel (existing project)
- **Personal data:** minimal (owner's public contact links only; no visitor data stored) — **Uses AI/ML:** no (the "Ask Tijo" assistant is a later, separate feature)
- **Started:** 2026-11-23
- **Branch:** `redesign-home` (from `241ad16`)

## Constraints
- Never invent facts or metrics; content only from `content/*.ts`.
- Keep the terminal at `/terminal`.
- Do not push or open a PR without owner approval.
- Installed Next.js 14.2.30 today; target per owner Q1: **Next 16.4.6 + React 19** (upgrade unit). Earlier "^16.2.2" note came from broken pre-clone copy.

## Required gates
- CG1–CG5, CG7, CG9, CG10, CG14 must pass.
- Extra gates in `gates.yml`: Lighthouse mobile ≥ 95 (Performance, Accessibility, Best Practices, SEO); view-source of `/` contains all section text.

## Stages for work type `feature`
1.0, 1.1, 1.3, 1.5, construction loop (2.0–2.6), 3.1 deltas. 1.2 and 1.4 skipped unless audit shows a need (1.4 n/a: no AI).

## Progress
| Stage | Status | Artifacts | Approved (date) |
|-------|--------|-----------|-----------------|
| 1.0 Codebase analysis | approved | `edd-docs/audit/README.md`, `audit-report.md`, `reconstructed-adrs.md`, `metrics.md`, `raw/` | 2026-11-23 |
| 1.1 Requirements | approved (PG1) | `specs/` (73 ACs), `inception/prd.md`, `inception/user-stories.md`, `questions/1.1-facts.md`, `questions/1.1-requirements.md` | 2026-11-23 |
| 1.2 Architecture | skipped (feature) | | |
| 1.3 Security & compliance | approved (PG3) | `inception/threat-model.md`, `inception/compliance.md`, `questions/1.3-security.md` | 2026-11-23 |
| 1.4 AI/ML design | n/a (no AI) | | |
| 1.5 Units & plan | approved (PG4) | `inception/plan.md`, `inception/units/U-00..U-11`, specs amended (93 ACs) | 2026-11-23 |
| 2.x Construction (per unit) | todo | | |
| 3.1 CI/CD & observability | todo | | |
| 3.2 Release readiness | todo | | |

## Units of work
| Unit | Flags (hot-path/critical/ai) | Status | Tests | Gates CG1–14 | Self-heal/RCA | NFR verify | Review | PG5 approved |
|------|------------------------------|--------|-------|--------------|---------------|------------|--------|--------------|
| U-00 Baseline purge | critical | todo | | | | | | |
| U-01 Walking skeleton + gates | walking skeleton | todo | | | | | | |
| U-02 Next 16.4.6 + React 19 | critical | todo | | | | | | |
| U-03 Route split + terminal move | critical | todo | | | | | | |
| U-04 Terminal PII strip + chat off | critical | todo | | | | | | |
| U-05 Content layer | | todo | | | | | | |
| U-06 Home shell | | todo | | | | | | |
| U-07 Home lists | | todo | | | | | | |
| U-08 CityMap, motion, a11y | | todo | | | | | | |
| U-09 SEO | | todo | | | | | | |
| U-10 Privacy | | todo | | | | | | |
| U-11 Security headers + release checks | critical | todo | | | | | | |

## Spikes / RCAs
| ID | Question or incident | Result | Linked ADR/CAPA |
|----|----------------------|--------|-----------------|

## Open questions
-
