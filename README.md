# tijothomas.dev

Personal site of Tijo Thomas: a Next.js 16 (App Router, Turbopack) + React 19 app deployed on Vercel. `/` is the new site
(a placeholder until the home page lands); the interactive terminal lives at `/terminal`, and `/v2`
redirects there (308). See `edd-docs/inception/plan.md`.

## Folder rules

All app code lives under `src/`; the repo root holds only config, docs and these folders:
`src/`, `specs/`, `edd-docs/`, `scripts/`, `e2e/`, `public/`, `docs/` (PLAT-AC-08).

| Folder | Holds | May import |
|--------|-------|------------|
| `src/app/(site)/` | public routes; its own root layout (no terminal CSS, theme or SEO block) | components, content, lib (never terminal or Supabase) |
| `src/app/(terminal)/` | `/terminal`; root layout that reuses `src/terminal/layout.tsx` | terminal, lib |
| `src/app/api/` | route entries (handlers for the terminal live in `src/terminal/api/`) | terminal, lib |
| `src/components/` | site UI | anything except `src/terminal` |
| `src/content/` | site content as typed data | `import type` only |
| `src/lib/` | shared helpers (`site.ts`: `siteUrl`) | anything except `src/terminal` |
| `src/terminal/` | the legacy terminal, moved unchanged | terminal, lib |

- `@/*` maps to `./src/*` (tsconfig and Vitest), e.g. `@/lib/site`, `@/terminal/lib/version`.
- `src/components`, `src/content` and `src/lib` never import `src/terminal`; `src/terminal` never
  imports `src/components` or `src/content`; no import cycles (PLAT-AC-09, `check-imports`).
  Nothing reachable from `(site)` imports `src/terminal` or Supabase (HOME-AC-04).
- Files moved into `src/terminal/` stay renames (>= 90 % similar) of their old paths
  (PLAT-AC-10, `check-renames`); data-only edits are recorded in `scripts/rename-exceptions.json`.

## CityMap

`src/components/CityMap/CityMap.tsx` renders the hero's isometric city from
`src/components/CityMap/cityGeometry.ts` (types in `cityTypes.ts`; all three live in `src/components/CityMap/`).
That file holds shapes only, in paint order, and was generated once from
`docs/design/home-reference/Main.dc.html`. Building names come from the nav labels and the sign
boards from `profile.city.signposts`, so editing content never means editing geometry. Motion is
CSS only, and `prefers-reduced-motion` turns all of it off.

## Content

Every fact and line of copy on `/` lives in `src/content/*.ts`, typed by `src/content/types.ts`.
Components render it and add no facts of their own.

The privacy notice at `/privacy` comes from `src/content/privacy.ts`. Each statement cites the
compliance requirement it rests on (`// CMP-xx` in `edd-docs/inception/compliance.md`); CMP references
are allowed only in that file. A test scans the terminal code for every `localStorage` key, so a new
key fails the build until the notice lists it. The terminal's privacy popup links to `/privacy`.

- Every value cites its row in `edd-docs/questions/1.1-facts.md`: `// F-xx` for a fact, `// C-xx` for
  copy, or `// RQ-xx` for an approved requirement decision. `src/content/facts.test.ts` fails on a
  missing reference, an unknown row, or a row the owner did not confirm (CONT-AC-10).
- Do not add a value without an owner-confirmed row. Owner details not supplied yet (notice period,
  Opteamix bullets) stay `null` or absent, and the page omits them.
- No email address, phone number or WhatsApp link, anywhere (ADR-P5, CONT-AC-15).
- URL fields are `https://` only (CONT-AC-13).

### `SHOW_PLANNED`

Work items and posts with status `planned` are hidden unless `SHOW_PLANNED` is exactly `true` at build
time (`isShowPlanned()` in `src/lib/flags.ts`, CONT-AC-05). `TRUE`, `1` or an unset variable hide them.

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
   `spec:check` counts only those: titles of `test`/`it`/`describe` (incl. `.skip`, `.each` …) in
   test files and `e2e/`, and string literals in other `scripts/**/*.mjs`. Comments never count.
2. `specs/pending.txt` lists ACs whose unit is not built yet, one per line. When a unit lands,
   delete its IDs from that file; it must be empty at the end of the redesign.
3. `npm run spec:check` fails, naming the ID, when an AC is neither cited nor pending, when a test
   cites an unknown ID, or when `pending.txt` lists an ID that is already cited or does not exist.

## Quality gates

`gates.yml` (repo root) lists the gates; `scripts/gates.mjs` runs them:

```bash
npm run gates -- --unit U-01                  # all gates; base from edd-docs/construction/U-01/base.txt
npm run gates -- --unit U-01 --base 35521e2 --only CG2_lint,spec
```

- Each unit records its start commit in `edd-docs/construction/<unit>/base.txt` (or pass `--base`).
  CG5 (diff coverage) and CG14 (docs) diff against it; the run fails if it is missing.
- Each gate writes `edd-docs/construction/<unit>/gates/<id>.json` (status, exit code, duration,
  output tail) and `<id>.log`. The run exits 0 only if every **enforced** gate passes.
- Status `blocked` (exit 78) means a required tool is missing, e.g. `gitleaks` for the CG10 secret
  scans. Install it to run those gates; a blocked gate never counts as a pass.
- `lighthouse` is enforced (SEO-AC-10): mobile, median of 3 runs on `/`, with Performance,
  Accessibility, Best Practices and SEO each ≥ 95, CLS ≤ 0.05, LCP ≤ 2.5 s and TBT ≤ 150 ms.
- SEO: head tags for `/` come from `profile.seo` (`src/app/(site)/page.tsx` metadata). Also from
  content: `opengraph-image.tsx` (1200×630, bundled font, no network fetch), `src/app/sitemap.ts` and
  `robots.ts`, and the `Person` JSON-LD. JSON-LD is written only through `src/lib/json-ld.ts`, which
  escapes `<`; it is the one file allowed `dangerouslySetInnerHTML` (PLAT-AC-23).
  `/work/<slug>` and `/writing/<slug>` serve one noindex placeholder each, and any other slug is a 404.
- `view-source` is enforced (SEO-AC-09). It fetches `/` from `next start` with no JavaScript and checks
  that every string the page renders from `src/content` is in the server HTML
  (`scripts/lib/content-strings.mjs`, respecting `SHOW_PLANNED`). It names any missing string.
- The `(site)` stylesheet uses `tailwind.site.config.js` (`@config`), whose content globs exclude the
  terminal; the terminal keeps `tailwind.config.js`.
- CG1 runs `node scripts/build-no-env.mjs`: `npm run build` with every `NEXT_PUBLIC_*` and `*SUPABASE*`
  env var removed (PLAT-AC-03). It refuses (exit 2) if `.env`, `.env.local`, `.env.production` or
  `.env.production.local` exists, since Next would load it. Supabase is optional: with no env the
  terminal works and `/api/analytics` is a no-op (TERM-AC-06).
- `CG10_pii_scan` and `CG10_groq` read the build that CG1 just made, so they run after it. A pii-scan
  match is fixed at the source; `scripts/pii-allowlist.json` only lists non-contact numbers, each
  with a reason.
- `use_client` (HOME-AC-03) also reads that build: the public site and everything it imports ship no
  `"use client"` module of ours, only next, react and @vercel/analytics packages, and `/` is static.
- `literals` (CONT-AC-12): components hold no copy longer than 3 words; put text in `src/content/*.ts`.
  `scripts/literals-allowlist.json` takes exceptions, each with a reason.
- CG1 and the runtime gates build into `.next/`. Do not run them in a checkout where `next dev` is
  running; use a separate git worktree.
- Gate scripts never hard-code source folders: they read them from `scripts/paths.mjs`.
- `node scripts/css-diff.mjs --base <css> --head <css>` compares two Tailwind builds and fails when a
  removed class is still used under `src/` (run the builds in scratch worktrees).

## Linting

Oxlint only (no ESLint). Errors everywhere, including the CG7 limits (complexity 10, 400 lines per
file, 50 per function, 4 params, nesting 3). Warnings are allowed only in the `legacy-terminal`
override, whose files are exactly `paths.terminalGlobs`. The `--max-warnings` ceiling in
`package.json` may only go down.
