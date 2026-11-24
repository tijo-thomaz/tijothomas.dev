# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `src/content/` (`types.ts`, `profile.ts`, `experience.ts`, `work.ts`, `posts.ts`): typed content for `/`,
  the single source of every fact and line of copy. Each value cites its row in the owner facts sheet
  (CONT-AC-10). `Profile` has no email, phone or WhatsApp field (CONT-AC-15) (U-05).
- `src/lib/flags.ts`: `isShowPlanned()` parses `SHOW_PLANNED`; only the exact string `"true"` shows
  planned items (CONT-AC-05) (U-05).
- `scripts/check-unreachable.keep.txt`: modules kept on purpose before a route imports them; each entry
  needs a `# reason` (U-05).
- Gates `CG10_pii_scan` (`scripts/pii-scan.mjs`, CONT-AC-14: no email, `mailto:`, `tel:`, `wa.me` or phone
  number in any served build file; allow-list `scripts/pii-allowlist.json`) and `CG10_groq`
  (`scripts/check-groq.mjs`, TERM-AC-10) (U-04).
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

### Fixed
- The terminal's GitHub links pointed to `github.com/tijo-thomas`; they now point to
  `github.com/tijo-thomaz` (F-68) (U-05, fixing U-04).
- This changelog: a text replacement in the U-04 docs commit had pasted the file header into the
  middle of the file (U-05).

### Changed
- `siteUrl` in `src/lib/site.ts` now comes from `profile.siteUrl` (U-05).
- `check-unreachable` no longer treats tests of keep-listed modules as tests of dead code (U-05).
- The terminal no longer shows an email address, phone number or WhatsApp link: `contact`, the resume
  text, `git log` and the chat contact buttons point to LinkedIn and GitHub (U-04, SQ-05). The prompt
  reads `tijo@tijothomas:~$`.
- The chat assistant is turned off: it answers with a fixed "turned off" message and sends no request
  (U-04, SQ-01, ADR-P2).
- `check-renames` requires a later deletion of a moved file to be declared; `check-unreachable` also
  checks imports in `e2e/` specs and `scripts/*.test.mjs` (U-04).
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
- `/api/chat` and its Groq handler, the terminal `http` client, the hidden SEO block in the terminal
  layout and the Groq, service-role and rate-limit entries in `.env.example` (U-04).
- `@next/bundle-analyzer`, the `analyze` script and the unused `images` config (U-02).
- `.eslintrc.json`, `eslint` and `eslint-config-next` (PLAT-AC-15).
- Storybook, dead code and `/v2`-only modules (U-00).
