# U-01 Walking skeleton: gate pipeline, Oxlint, spec gate
Stories: US-26, US-28, US-23 (primary)     Depends on: U-00 (done)     Next: U-03 (amended 2026-11-24: the restructure runs before the upgrade)
Flags: hot-path: no · critical: no · ai: no · **walking skeleton**
Estimate: M

## Goal
Every later unit is judged by one command. Stand up `gates.yml` and its runner, switch lint to Oxlint, add the spec-coverage gate and the supply-chain gates, and prove the pipeline end to end on the current app: build → `next start` → Playwright → Lighthouse/view-source runners → evidence folder.

## ACs covered
PLAT-AC-14, PLAT-AC-15, PLAT-AC-16, PLAT-AC-18, PLAT-AC-19, PLAT-AC-25

## Scope
1. **Oxlint** (exact pin): `.oxlintrc.json` with plugins react, nextjs, jsx-a11y, typescript, vitest; CG7 limits (`max-lines` 400, `max-lines-per-function` 50, `max-params` 4, `max-depth` 3, `complexity` 10 if available, else `scripts/check-complexity.mjs`, RQ-21 a). Warnings are allowed only inside one `overrides` entry named `legacy-terminal`. In U-01 it lists the **current** paths (`app/page.tsx`, `components/**`, `features/**`, `widgets/**`, `shared/**`, `lib/**`). U-03 replaces it with exactly `src/terminal/**` (RQ-20 a). Record the baseline warning count. Remove `.eslintrc.json`, `eslint`, `eslint-config-next` and any leftover `eslintConfig`.
   **Paths before and after the move (2026-11-24):** every gate script takes its folders from one module, `scripts/paths.mjs`. It exports the route entry points, the source roots, the terminal globs, the test globs and the scan targets. U-01 fills it with today's root paths (`app/`, `components/`, `features/`, `widgets/`, `shared/`, `lib/`). U-03 switches it to `src/…` in the same commit that moves the files. No script hard-codes a folder. `gates.yml` refers to scripts, not globs, so it does not change in U-03. U-00's scripts (`check-unreachable`, `check-deps`, `check-vitest-config`) are refactored onto `scripts/paths.mjs` here.
2. **spec:check** (`scripts/spec-check.mjs`, `npm run spec:check`): parses AC IDs in `specs/*.md` (skipping struck-through retired ones) and AC IDs cited in `*.test.ts(x)`, `e2e/**` and gate check names. Fails on an uncited AC, an unknown cited ID, or a stale entry in `specs/pending.txt`. `specs/pending.txt` lists AC IDs whose unit is not done yet; each unit deletes its IDs; it must be empty at U-11. Fixture tests prove both failure modes.
3. **Gate runner** `scripts/gates.mjs` reading `gates.yml`; writes one JSON per gate to `edd-docs/construction/<unit>/gates/`. Gates: CG1 build (empty env from U-02), CG2 oxlint, CG3 `tsc --noEmit`, CG4 `vitest run` ×3, CG5 coverage (diff lines ≥ 80%, branches ≥ 70%; `content/`, `lib/` ≥ 85%), CG7 complexity, CG9 import graph (`check-unreachable.mjs`; direction rules added in U-03 against `src/`), CG10 `npm audit` + `gitleaks detect` + `npm audit signatures` + SBOM, CG14 docs (CHANGELOG/README touched), `spec:check`, `check-deps`, `check-gitignore` (PLAT-AC-18), Lighthouse mobile (median of 3, RQ-15 a) and view-source (both **report-only** until U-07/U-09 switch them to enforce).
4. **Playwright harness:** `playwright.config.ts` (webServer `next build && next start`), `e2e/` folder, one smoke test of the current `/` terminal (it becomes TERM-AC-01 in U-03).
5. **FR-069 / US-23:** Lighthouse mobile ×3 on current production `https://tijothomas.dev/`; median JSON + HTML saved under `edd-docs/construction/U-01/baseline-lighthouse/` (or recorded as "not measured" if unreachable).

Out of scope: CI workflow (stage 3.1), any product code.

## Files touched
`.oxlintrc.json` (new), `.eslintrc.json` (delete), `package.json` (scripts: `lint`, `spec:check`, `gates`, `test:e2e`), `package-lock.json`, `gates.yml` (new), `scripts/{paths,gates,spec-check,check-complexity,check-gitignore,lighthouse,view-source,sbom}.mjs` (new), `scripts/{check-unreachable,check-deps,check-vitest-config}.mjs` (read paths from `paths.mjs`), `scripts/*.test.mjs` fixtures, `specs/pending.txt` (new), `playwright.config.ts`, `e2e/smoke.spec.ts`, `README.md` (specs workflow + gates section), `CHANGELOG.md`.

## Interfaces
- `scripts/paths.mjs`: `export const paths = { entries, srcRoots, terminalGlobs, testGlobs, siteRoots }` (the only place folder names live).
- `npm run gates [-- --only CG2,spec]` → exit 0 only if every enforced gate passes.
- `gates.yml` entry: `{ id, cmd, enforce: true|false, evidence }`.
- `specs/pending.txt`: one AC ID per line.

## Definition of Done
- `npm run gates` green on the current app (Lighthouse/view-source report-only); PLAT-AC IDs printed by their checks.
- `npm run lint` ≤ 5 s; 0 errors.
- `rg` over `scripts/` finds folder names (`app/`, `components/`, `features/`, …) only in `scripts/paths.mjs`. This makes the U-03 switch a single edit.
- `gitleaks` full-history result saved (closes RR-8).
- Spike SP-02 result (Oxlint rule parity, R10) recorded in `edd-state.md`.
- Review clean; README + CHANGELOG updated.

## Patterns used
- Walking skeleton (thin pipeline through every layer before features).
- Gatekeeper / quality gates as code (`gates.yml` + one runner).
- Spec-to-test traceability (AC IDs in test names, checked by a gate).

### Patterns used (implementation, 2026-11-24)
| Pattern | Where | Why | Trade-off |
|---------|-------|-----|-----------|
| Walking skeleton | `gates.yml` → `scripts/gates.mjs` → build → `next start` → Playwright / Lighthouse / view-source → evidence JSON | Every later unit is judged by one command on the real pipeline | Runtime gates need a build; they must run in a worktree while `next dev` runs |
| Quality gates as code (gatekeeper) | `gates.yml`, `scripts/gates.mjs` | One declarative list, one runner, one evidence format | Hand-rolled YAML subset reader (no dependency); only `- id:` lists are supported |
| Single source of truth (registry) | `scripts/paths.mjs` | U-03 folder move is one edit; no gate passes vacuously on old folders (R18) | Every script imports it; a missing folder fails `paths.test.mjs` |
| Fail-closed tool adapter | `scripts/require-tool.mjs` (exit 78 = blocked) | A missing scanner (gitleaks) must never look like a pass | Enforced blocked gates make the whole run red until the tool is installed |
| Spec-to-test traceability | `scripts/spec-check.mjs`, `specs/pending.txt` | AC IDs in test names, checked by a gate | Citation by text match: an ID in a test-file comment also counts |
