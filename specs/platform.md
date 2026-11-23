# Platform, tooling and repo structure
Status: Draft
Prefix: PLAT
Traces: FR-060–FR-067, FR-070–FR-080, NFR-030, NFR-032, NFR-041, NFR-050–NFR-056; US-01, US-02, US-22, US-24–US-28

## Acceptance criteria
### Stack
- **PLAT-AC-01** — Given the lockfile, when `npm ls next react react-dom` runs, then it shows `next@16.4.6` and `react`/`react-dom` 19.x with no invalid or missing entries. _Traces: FR-060, US-01 · Verify: gate_
- **PLAT-AC-02** — Given `npm audit --json`, when it runs, then there are 0 critical/high advisories that have a fix available. _Traces: NFR-041, US-01 · Verify: gate_
- **PLAT-AC-03** — Given a shell with no env vars, when `npm run build` runs, then it exits 0. _Traces: FR-062, NFR-030, US-02 · Verify: gate_
- **PLAT-AC-04** — Given the repo, when `npm run type-check` (`tsc --noEmit`) runs, then there are 0 errors. _Traces: NFR-053, US-01, US-02 · Verify: gate_

### Tests and build config
- **PLAT-AC-05** — Given `vitest.config.ts`, when a test imports `@/content/profile`, then it loads. `npm run test` runs `vitest run` over `{app,components,terminal,content,lib}`, passes 3 consecutive runs, and has no Storybook plugin. _Traces: FR-063, NFR-032, US-02 · Verify: gate_
- **PLAT-AC-06** — Given sentinel Tailwind classes used only in `components/` and only in `terminal/`, when built, then both are in the emitted CSS. _Traces: FR-065, US-02 · Verify: gate_
- **PLAT-AC-07** — Given `next.config.*`, when inspected, then no `images` config exists. _Traces: FR-066, US-02 · Verify: unit_

### Folder structure and dead code
- **PLAT-AC-08** — Given the repo root, when top-level dirs are listed, then `features/`, `widgets/`, `shared/`, `stories/` and `.storybook/` do not exist, and app code lives only in `app/`, `components/`, `terminal/`, `content/` and `lib/`. _Traces: FR-070, US-24 · Verify: unit_
- **PLAT-AC-09** — Given the import graph, when checked, then there are 0 cycles; `components/`, `content/` and `lib/` never import `terminal/`; `terminal/` never imports `components/` or `content/`; `content/` imports types only. _Traces: FR-073, NFR-052, US-24 · Verify: gate_
- **PLAT-AC-10** — Given the moved terminal files, when `git diff -M` runs against the base commit, then each is reported as a rename with similarity ≥ 90%. _Traces: FR-072, US-24 · Verify: gate_
- **PLAT-AC-11** — Given the 58 paths listed as unreachable in `edd-docs/audit/raw/cycles.txt`, when checked, then none exist, and the import graph reports 0 unreachable modules in `components/`, `terminal/` and `lib/`. _Traces: FR-071, US-25 · Verify: gate_
- **PLAT-AC-12** — Given all test files, when collected, then none imports a deleted module, and every test of a deleted module is gone. _Traces: FR-064, US-25 · Verify: gate_
- **PLAT-AC-13** — Given `package.json`, when a dependency-usage check runs, then 0 unused dependencies are reported. _Traces: FR-080, US-25 · Verify: gate_

### Lint (Oxlint only)
- **PLAT-AC-14** — Given `.oxlintrc.json`, when `npm run lint` runs, then Oxlint runs with plugins react, nextjs, jsx-a11y, typescript and vitest, exits 0 in ≤ 5 s, and reports 0 warnings outside `terminal/`. _Traces: FR-061, NFR-053, NFR-056, US-26 · Verify: gate_
- **PLAT-AC-15** — Given the repo, when searched, then no `.eslintrc*`, `eslint.config.*`, `eslintConfig` key or `eslint*` dependency exists. _Traces: FR-075, US-26 · Verify: unit_
- **PLAT-AC-16** — Given changed files outside `terminal/`, when complexity rules run, then cyclomatic ≤ 10, function ≤ 50 lines, ≤ 4 params, nesting ≤ 3 and file ≤ 400 lines. _Traces: NFR-050, US-26 · Verify: gate_

### Storybook removal
- **PLAT-AC-17** — Given the repo, when searched, then there are no `*.stories.*` files, no `storybook`/`build-storybook` scripts, and no `storybook`, `@storybook/*` or `@chromatic-com/storybook` dependencies. _Traces: FR-074, US-27 · Verify: unit_

### Spec workflow
- **PLAT-AC-18** — Given `specs/home.md`, when `git check-ignore` runs on it, then nothing is printed (the file is tracked). _Traces: FR-079, US-28 · Verify: gate_
- **PLAT-AC-19** — Given a fixture spec with an uncited AC, or a fixture test citing an unknown AC, when `spec:check` runs on it, then it exits non-zero and names the ID. Given the real repo, then it exits 0. _Traces: FR-076, FR-077, FR-078, NFR-055, US-28 · Verify: unit_

### Security headers
- **PLAT-AC-20** — Given `GET /`, when headers are read, then `strict-transport-security`, `x-content-type-options: nosniff`, `referrer-policy`, `permissions-policy` and a frame-ancestors restriction are present, `x-powered-by` is absent, and `/` loads with 0 CSP violations. _Traces: FR-067, US-22 · Verify: e2e_
