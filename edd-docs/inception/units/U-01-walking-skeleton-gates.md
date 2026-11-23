# U-01 Walking skeleton: gate pipeline, Oxlint, spec gate
Stories: US-26, US-28, US-23 (primary)     Depends on: U-00
Flags: hot-path: no · critical: no · ai: no · **walking skeleton**
Estimate: M

## Goal
Every later unit is judged by one command. Stand up `gates.yml` and its runner, switch lint to Oxlint, add the spec-coverage gate and the supply-chain gates, and prove the pipeline end to end on the current app: build → `next start` → Playwright → Lighthouse/view-source runners → evidence folder.

## ACs covered
PLAT-AC-14, PLAT-AC-15, PLAT-AC-16, PLAT-AC-18, PLAT-AC-19, PLAT-AC-25

## Scope
1. **Oxlint** (exact pin): `.oxlintrc.json` with plugins react, nextjs, jsx-a11y, typescript, vitest; CG7 limits (`max-lines` 400, `max-lines-per-function` 50, `max-params` 4, `max-depth` 3, `complexity` 10 if available, else `scripts/check-complexity.mjs`, RQ-21 a). Warnings allowed only in legacy terminal paths through an override (today `components/`, `features/`, `widgets/`, `shared/`, `lib/`; narrowed to `terminal/` in U-03, RQ-20 a). Baseline warning count recorded. Remove `.eslintrc.json`, `eslintConfig`, `eslint`, `eslint-config-next`.
2. **spec:check** (`scripts/spec-check.mjs`, `npm run spec:check`): parses AC IDs in `specs/*.md` (skipping struck-through retired ones) and AC IDs cited in `*.test.ts(x)`, `e2e/**` and gate check names. Fails on an uncited AC, an unknown cited ID, or a stale entry in `specs/pending.txt`. `specs/pending.txt` lists AC IDs whose unit is not done yet; each unit deletes its IDs; it must be empty at U-11. Fixture tests prove both failure modes.
3. **Gate runner** `scripts/gates.mjs` reading `gates.yml`; writes one JSON per gate to `edd-docs/construction/<unit>/gates/`. Gates: CG1 build (empty env from U-02), CG2 oxlint, CG3 `tsc --noEmit`, CG4 `vitest run` ×3, CG5 coverage (diff lines ≥ 80%, branches ≥ 70%; `content/`, `lib/` ≥ 85%), CG7 complexity, CG9 import graph (`check-unreachable.mjs`; direction rules added in U-03), CG10 `npm audit` + `gitleaks detect` + `npm audit signatures` + SBOM, CG14 docs (CHANGELOG/README touched), `spec:check`, `check-deps`, `check-gitignore` (PLAT-AC-18), Lighthouse mobile (median of 3, RQ-15 a) and view-source (both **report-only** until U-07/U-09 switch them to enforce).
4. **Playwright harness:** `playwright.config.ts` (webServer `next build && next start`), `e2e/` folder, one smoke test of the current `/` terminal (it becomes TERM-AC-01 in U-03).
5. **FR-069 / US-23:** Lighthouse mobile ×3 on current production `https://tijothomas.dev/`; median JSON + HTML saved under `edd-docs/construction/U-01/baseline-lighthouse/` (or recorded as "not measured" if unreachable).

Out of scope: CI workflow (stage 3.1), any product code.

## Files touched
`.oxlintrc.json` (new), `.eslintrc.json` (delete), `package.json` (scripts: `lint`, `spec:check`, `gates`, `test:e2e`), `package-lock.json`, `gates.yml` (new), `scripts/{gates,spec-check,check-complexity,check-gitignore,lighthouse,view-source,sbom}.mjs` (new), `scripts/*.test.mjs` fixtures, `specs/pending.txt` (new), `playwright.config.ts`, `e2e/smoke.spec.ts`, `README.md` (specs workflow + gates section), `CHANGELOG.md`.

## Interfaces
- `npm run gates [-- --only CG2,spec]` → exit 0 only if every enforced gate passes.
- `gates.yml` entry: `{ id, cmd, enforce: true|false, evidence }`.
- `specs/pending.txt`: one AC ID per line.

## Definition of Done
- `npm run gates` green on the current app (Lighthouse/view-source report-only); PLAT-AC IDs printed by their checks.
- `npm run lint` ≤ 5 s; 0 errors.
- `gitleaks` full-history result saved (closes RR-8).
- Spike SP-02 result (Oxlint rule parity, R10) recorded in `edd-state.md`.
- Review clean; README + CHANGELOG updated.

## Patterns used
- Walking skeleton (thin pipeline through every layer before features).
- Gatekeeper / quality gates as code (`gates.yml` + one runner).
- Spec-to-test traceability (AC IDs in test names, checked by a gate).
