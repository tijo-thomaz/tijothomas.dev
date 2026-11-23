# U-00 Baseline purge: gate record

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Tree:** `aaae37a` (code; docs committed on top)
- `gates.yml` does not exist until U-01, so these gates were run by hand. Checks and vitest ran in the repo. `type-check`, `lint`, `build` and the Tailwind CSS build ran in a detached scratchpad worktree at the same commit, so that the owner's `next dev` (:3100) `.next/` is not overwritten.
- Env for build: `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=x` (the empty-env build is U-02).

| # | Gate | Command | Result | Evidence |
|---|------|---------|--------|----------|
| 1 | PLAT-AC-11, PLAT-AC-12 | `node scripts/check-unreachable.mjs` | **PASS** (5/5), exit 0 | 140 listed paths (58 + 82) gone; 4 entries; 92 modules, 92 reachable, 0 unreachable |
| 2 | PLAT-AC-13 | `node scripts/check-deps.mjs` | **PASS**, exit 0 | 0 unused deps |
| 3 | PLAT-AC-05 | `node scripts/check-vitest-config.mjs` | **PASS** (7/7), exit 0 | `vitest run`, `@` alias, `test.include` parsed, `@/` probe loads, 3 consecutive `npm run test` runs |
| 4 | PLAT-AC-17 | `node --test "scripts/*.test.mjs"` | **PASS** (4/4), exit 0 | No `*.stories.*` anywhere in the repo (except `node_modules`, `.git`, `.next`, `.claude`) |
| 5 | Unit tests | `npx vitest run` | **PASS**, 3 files, 78/78, exit 0 | `lib/vitest-alias` 1, `shared/ui/atoms/Icon` 52, `Text` 25 |
| 6 | Types | `npm run type-check` | **PASS**, 0 errors, exit 0 | baseline 139 |
| 7 | Lint | `npm run lint` (`next lint`) | **PASS**, 0 errors, 3 warnings, exit 0 | `react-hooks/exhaustive-deps` in `Terminal.tsx:561`, `ThemeProvider.tsx:60`, `ZoomControls.tsx:51` (pre-existing; baseline 4) |
| 8 | Build | `npm run build` | **PASS**, exit 0 | Routes: `/` (○ 44.8 kB, 132 kB first load), `/_not-found`, `/api/analytics` (ƒ), `/api/chat` (ƒ). No `/v2`. |
| 9 | CSS parity (R7) | `tailwindcss -c tailwind.config.js -i app/globals.css` at `89369a6` vs HEAD + `smoke/cssdiff.mjs` | **PASS**: 0 classes used by reachable code are missing | base 779 → HEAD 724 selectors; 105 removed (dead-code-only); 50 added (latent at base). Before the fix: 422 missing. `smoke/cssdiff.txt` |
| 10 | Smoke `/` (R7, DoD) | `next start` on base and HEAD worktrees + `smoke/smoke.cjs` (Chromium headless, 1280 and 360) | **PASS** | HTTP 200; `help`, theme switch and chat open all work on both trees and both widths; 0 page errors. Screenshots are local only (not committed). Pixel diff: only animation frames (bounce/pulse). `smoke/smoke-results.json`, `smoke/pixdiff.txt` |
| 11 | Negative checks (finding 3/4) | fixtures under scratchpad: empty `--root`; `vitest.config.ts` with the glob only in `coverage.include`; a temporary `docs/zz-probe.stories.tsx` | **FAIL as intended** (exit 1 each) | see `impl-notes.md` "Review fixes" |

## Not gated here
- `npm audit`: there are pre-existing advisories in `next` and nested packages. U-00 adds no packages, and the upgrade is in U-02.
- CHANGELOG entry: the repo has none yet; track it with U-01.
- Known regression until U-03: the `/v2` option in the `/` version dropdown leads to a 404 (`widgets/VersionSelector/VersionSelector.tsx:29`).
