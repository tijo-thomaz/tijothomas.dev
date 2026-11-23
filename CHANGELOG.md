# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `/` is a hello-world page served by its own `(site)` root layout (Inter + Space Grotesk,
  `metadataBase` from `src/lib/site.ts`, zoom enabled) (U-03).
- `/v2` permanently redirects (308) to `/terminal` (TERM-AC-04).
- Gates: `check-imports` in CG9 (PLAT-AC-09, HOME-AC-04), `check-renames` (PLAT-AC-10, exceptions
  in `scripts/rename-exceptions.json`) and `scripts/css-diff.mjs` (R17).
- Quality gate pipeline: `gates.yml` and `npm run gates` (`scripts/gates.mjs`), with per-gate JSON
  evidence under `edd-docs/construction/<unit>/gates/` (U-01).
- `npm run spec:check`: fails on uncited, unknown or stale-pending acceptance criteria (PLAT-AC-19).
- Gate scripts: `check-gitignore` (PLAT-AC-18), CycloneDX SBOM (PLAT-AC-25), lint report, diff
  coverage, docs check, Lighthouse (mobile, median of 3) and view-source (both report-only for now).
- Playwright harness (`npm run test:e2e`) with a smoke test of `/` against a production build.
- `scripts/paths.mjs`: the single list of source folders used by every gate script.

### Changed
- App code moved under `src/` (U-03): the terminal and every module it uses now live, unchanged,
  in `src/terminal/` and are served at `/terminal` (noindex, follow; canonical `/terminal`).
  `@/*` maps to `./src/*`. The VersionSelector v1 entry points to `/terminal`.
- Tailwind `content` and Vitest `include` list only `src/` globs; the temporary U-00 globs are gone.
- The Oxlint `legacy-terminal` override is exactly `src/terminal/**`.
- Linting moved from ESLint (`next lint`) to Oxlint 1.95.0 with the CG7 complexity limits as errors
  (PLAT-AC-14, PLAT-AC-16). Lint now takes under 1 s.

### Removed
- `.eslintrc.json`, `eslint` and `eslint-config-next` (PLAT-AC-15).
- Storybook, dead code and `/v2`-only modules (U-00).
