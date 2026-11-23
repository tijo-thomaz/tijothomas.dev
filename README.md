# tijothomas.dev

Personal site of Tijo Thomas: a Next.js (App Router) app deployed on Vercel. The current `/` is the
interactive terminal; the home redesign moves it to `/terminal` (see `edd-docs/inception/plan.md`).

## Getting started

```bash
npm ci                 # npm >= 11 (packageManager pins npm@11.21.3; no --legacy-peer-deps needed)
npm run dev            # next dev
```

| Script | What it does |
|--------|--------------|
| `npm run dev` / `build` / `start` | Next.js dev server, production build, production server |
| `npm run lint` | Oxlint (`.oxlintrc.json`) with a warning ceiling; `npm run lint:fix` applies safe fixes |
| `npm run type-check` | `tsc --noEmit` |
| `npm test` | Vitest unit tests (colocated `*.test.ts(x)`); e2e is **not** part of it |
| `npm run test:scripts` | `node:test` checks of the repo and gate scripts (`scripts/*.test.mjs`) |
| `npm run test:e2e` | Playwright (`e2e/`) against `next build && next start` on a free port |
| `npm run spec:check` | AC traceability gate (see below) |
| `npm run gates -- --unit U-NN` | Runs every quality gate in `gates.yml` and writes evidence |

## Specs and tests

`specs/*.md` hold the numbered acceptance criteria (`<PREFIX>-AC-NN`); rules are in `specs/README.md`.

1. Every test name cites the AC IDs it proves, e.g. `it('HOME-AC-01 renders exactly one h1', …)`.
   Gate scripts print the AC ID in their check names (`PASS PLAT-AC-18 …`).
2. `specs/pending.txt` lists ACs whose unit is not built yet, one per line. When a unit lands,
   delete its IDs from that file; it must be empty at the end of the redesign.
3. `npm run spec:check` fails, naming the ID, when an AC is neither cited nor pending, when a test
   cites an unknown ID, or when `pending.txt` lists an ID that is already cited or does not exist.

## Quality gates

`gates.yml` (repo root) lists the gates; `scripts/gates.mjs` runs them:

```bash
npm run gates -- --unit U-01                  # all gates
npm run gates -- --unit U-01 --only CG2_lint,spec
```

- Each gate writes `edd-docs/construction/<unit>/gates/<id>.json` (status, exit code, duration,
  output tail) and `<id>.log`. The run exits 0 only if every **enforced** gate passes.
- Status `blocked` (exit 78) means a required tool is missing, e.g. `gitleaks` for the CG10 secret
  scans. Install it to run those gates; a blocked gate never counts as a pass.
- `lighthouse` (mobile, median of 3) and `view-source` are report-only until U-09 / U-07.
- CG1 and the runtime gates build into `.next/`. Do not run them in a checkout where `next dev` is
  running; use a separate git worktree.
- Gate scripts never hard-code source folders: they read them from `scripts/paths.mjs`.

## Linting

Oxlint only (no ESLint). Errors everywhere, including the CG7 limits (complexity 10, 400 lines per
file, 50 per function, 4 params, nesting 3). Warnings are allowed only in the `legacy-terminal`
override, whose files are exactly `paths.terminalGlobs`. The `--max-warnings` ceiling in
`package.json` may only go down.
