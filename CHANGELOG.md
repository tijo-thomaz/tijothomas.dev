# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Quality gate pipeline: `gates.yml` and `npm run gates` (`scripts/gates.mjs`), with per-gate JSON
  evidence under `edd-docs/construction/<unit>/gates/` (U-01).
- `npm run spec:check`: fails on uncited, unknown or stale-pending acceptance criteria (PLAT-AC-19).
- Gate scripts: `check-gitignore` (PLAT-AC-18), CycloneDX SBOM (PLAT-AC-25), lint report, diff
  coverage, docs check, Lighthouse (mobile, median of 3) and view-source (both report-only for now).
- Playwright harness (`npm run test:e2e`) with a smoke test of `/` against a production build.
- `scripts/paths.mjs`: the single list of source folders used by every gate script.

### Changed
- Linting moved from ESLint (`next lint`) to Oxlint 1.95.0 with the CG7 complexity limits as errors
  (PLAT-AC-14, PLAT-AC-16). Lint now takes under 1 s.

### Removed
- `.eslintrc.json`, `eslint` and `eslint-config-next` (PLAT-AC-15).
- Storybook, dead code and `/v2`-only modules (U-00).
