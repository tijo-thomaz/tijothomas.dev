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
Order (amended 2026-11-24): U-00 → U-01 → U-03 → U-02 → U-04 → … → U-11. Layout: `src/`.
| Unit | Flags (hot-path/critical/ai) | Status | Tests | Gates CG1–14 | Self-heal/RCA | NFR verify | Review | PG5 approved |
|------|------------------------------|--------|-------|--------------|---------------|------------|--------|--------------|
| U-00 Baseline purge | critical | done | 78/78 pass | CG lint/type/test/build PASS (pre-U-01 tooling) | 0 self-heal; 1 review loop | n/a | changes-required → fixed | 2026-11-24 |
| U-01 Walking skeleton + gates | walking skeleton | done | 72/72 node, 78/78 vitest | 15/16 PASS; CG10_audit FAIL (W-01); signatures EX-01 | 0 self-heal; 1 review loop | n/a | changes-requested → fixed | 2026-11-24 |
| U-03 Route split + terminal move | critical | done | 129 node, 187 vitest, 13 e2e | 17/18 PASS; CG10_audit (W-01) | 0 self-heal (CG5 fixed in-unit) | n/a | approve (5 minor carried) | 2026-11-24 |
| U-02 Next 16.4.6 + React 19 | critical | done | 154 node, 210 vitest, 20 e2e | 17/17 PASS; CG10_audit PASS (W-01 closed); EX-01 | 0 self-heal (CG5 fixed in-unit) | n/a | approved (no independent review; owner waived) | 2026-11-24 |
| U-04 Terminal PII strip + chat off | critical | done | 186 node, 218 vitest, 23 e2e | 19/19 PASS (new CG10_pii_scan, CG10_groq); EX-01 | 0 self-heal (CG4/CG5/deps fixed in-unit) | n/a | approved (no independent review; owner waived) | 2026-11-24 |
| U-05 Content layer | | done | 189 node, 262 vitest | 19/19 PASS; EX-01 | 0 self-heal (lint, unreachable fixed in-unit) | n/a | approved (no independent review; owner waived; R3 NDA spot check approved) | 2026-11-24 |
| U-06 Home shell | | in-progress | | | | | | |
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

## Open owner actions (before any release)
- Vercel: delete `GROQ_API_KEY` (chat is off since U-04; no code reads it).
- SQ-07: confirm no Supabase service-role key is set in Vercel.
- SQ-09: account MFA and DNS checks.
- Listen to the terminal's sound output (not testable by the gates).
