# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `scripts/build-no-env.mjs`: CG1 builds with no `NEXT_PUBLIC_*` or Supabase env (PLAT-AC-03, U-02).
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
- Upgraded to Next.js 16.4.6 (Turbopack) and React 19.3.1; lucide-react pinned to 0.577.0;
  vitest 3.2.7 with `tinypool` overridden to 2.2.0 for GHSA-5gmw-xhrv-c9v3 / GHSA-85c8-ppgw-ccpr (U-02).
- The Supabase client is created lazily by `getSupabase()`; with no env the terminal and
  `/api/analytics` work and analytics is a no-op instead of a build error or 500 (TERM-AC-06).
- The terminal now renders in its declared font, JetBrains Mono: Next 16 `next/font` emits the
  plain family name, which the terminal's CSS font stack already named. Under Next 14 it fell
  back to Consolas.
- App code moved under `src/` (U-03): the terminal and every module it uses now live, unchanged,
  in `src/terminal/` and are served at `/terminal` (noindex, follow; canonical `/terminal`).
  `@/*` maps to `./src/*`. The VersionSelector v1 entry points to `/terminal`.
- Tailwind `content` and Vitest `include` list only `src/` globs; the temporary U-00 globs are gone.
- The Oxlint `legacy-terminal` override is exactly `src/terminal/**`.
- Linting moved from ESLint (`next lint`) to Oxlint 1.95.0 with the CG7 complexity limits as errors
  (PLAT-AC-14, PLAT-AC-16). Lint now takes under 1 s.

### Removed
- `@next/bundle-analyzer`, the `analyze` script and the unused `images` config (U-02).
- `.eslintrc.json`, `eslint` and `eslint-config-next` (PLAT-AC-15).
- Storybook, dead code and `/v2`-only modules (U-00).
