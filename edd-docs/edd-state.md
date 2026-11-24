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
| U-04 Terminal PII strip + chat off | critical | done | 186 node, 218 vitest, 23 e2e | 19/19 PASS (new CG10_pii_scan, CG10_groq); EX-01 | 0 self-heal (CG4/CG5/deps fixed in-unit) | n/a | retro review (owner option C): changes-required → 2 majors fixed (`7f0e31a`, `5c84fbe`); commit A **not data-only** (owner accepted 2026-11-24) | 2026-11-24 |
| U-05 Content layer | | done | 189 node, 262 vitest | 19/19 PASS; EX-01 | 0 self-heal (lint, unreachable fixed in-unit) | n/a | retro review: approve-with-minors → minors 1, 2, 4 fixed (`5c84fbe`); #3 deferred; R3 NDA spot check approved | 2026-11-24 |
| U-06 Home shell | | done | 219 node, 284 vitest, 23 e2e | 21/21 PASS at `8607725` (new use_client, literals); EX-01 | 0 self-heal (CG14 fixed in `a773f38`) | n/a | changes-required → majors 1, 2 fixed; minors 3-5, 9, 10 fixed; 6, 7 carried to U-07/U-09 | 2026-11-24 ("C, then approve U-06") |
| U-07 Home lists | | done | 229 node, 317 vitest, 25 e2e (+2 cursor specs, run in U-08 gates) | 22/22 PASS at `2f2507d` (view-source now enforced); EX-01. Cursor/selection CSS changed after (`30cfda9`, `f2bb71a`), so U-08's gate run covers it | 1 self-heal (CG1 Tailwind @config build race, fixed in-unit) | n/a | approve-with-minors → all 7 minors and 5 nits fixed | 2026-11-24 |
| U-08 CityMap, motion, a11y | | done | 231 node, 327 vitest, 41 e2e | 22/22 PASS at `6dd449a`; owner choice c added afterwards and verified by build + 14 map/motion/a11y e2e (axe 0) | 1 self-heal (pii-scan viewBox false positive, e2e strict locator) | n/a | approve-with-minors → all 7 minors resolved (#3 by owner choice c: labels enlarged below 40rem) | 2026-11-25 |
| U-09 SEO | | in-progress | | | | | | |
| U-10 Privacy | | todo | | | | | | |
| U-11 Security headers + release checks | critical | todo | | | | | | |

## Spikes / RCAs
| ID | Question or incident | Result | Linked ADR/CAPA |
|----|----------------------|--------|-----------------|
| RCA-01 | Escaped U-04 defects: wrong GitHub account (7 copies, 1 missed by the first fix) and CHANGELOG corrupted by a JS `$`` replacement | Fixed; regression tests `scripts/rca-01.test.mjs`; edit rule CA-4; review 2.3 restored | `edd-docs/rca/RCA-01-u04-escaped-defects.md` |

## Open questions
-

## Deferred review findings (accepted, owner informed)
- U-05 #3: `facts.test.ts` checks that a cited row is publishable, not that the row holds the value. Needs value parsing of the facts sheet; values changed under the resolutions. Revisit with the content-cycle tooling.
- U-04 #8: `check-unreachable` does not see a dynamic `await import()` in `scripts/*.test.mjs`. `node --test` fails at runtime anyway.
- U-04 #3 (second half): pii-scan does not assert that each site route is prerendered. `use_client` asserts that `/` is static; U-09/U-10 add `/privacy` and others.

## Deployment hold
- ~~Do not deploy `redesign-home` until U-07: 3 of the 5 nav anchors on `/` have no target yet (U-06 review #6).~~ Resolved by U-07 (HOME-AC-09 green).
- ~~Still hold until U-08 (hero tip names the CityMap).~~ Resolved by U-08: the CityMap ships. Deployment is still the owner's call (no push or PR without approval).

## Open owner actions (before any release)
- Vercel: delete `GROQ_API_KEY` (chat is off since U-04; no code reads it).
- SQ-07: confirm no Supabase service-role key is set in Vercel.
- SQ-09: account MFA and DNS checks.
- Listen to the terminal's sound output (not testable by the gates).
