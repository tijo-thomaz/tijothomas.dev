# U-03 Restructure into `src/`: review (EDD stage 2.5)

- **Date:** 2026-11-24 · **Reviewer:** principal-engineer review (independent of the author) · **Range:** `2535185..ca6cb54` (`git diff -M -- . ':!edd-docs'`), 141 files, 7 commits `a488e02`..`ca6cb54`
- **Precondition:** `gates.md` shows 17/18 enforced gates PASS; CG10_audit FAIL is covered by waiver W-01 (U-01/U-03, must pass at U-02). The unit is reviewable.

## What I ran myself (scratchpad worktree at `ca6cb54`, fresh `npm ci`, port 3241; removed afterwards; :3100 not touched)
| Check | Result |
|-------|--------|
| `node --test scripts/*.test.mjs` | 129/129 pass |
| `npx vitest run` | 10 files, 187/187 pass |
| `npx tsc --noEmit` | 0 errors |
| `npx oxlint` | 0 errors; warnings only in `src/terminal/**` |
| `node scripts/check-imports.mjs` | all PASS: 99 modules, 2 site routes, site closure 4 (`(site)/layout.tsx`, `page.tsx`, `globals.css`, `src/lib/site.ts`) |
| `node scripts/check-renames.mjs` | all PASS: 96 renames, 0 exceptions |
| `node scripts/check-unreachable.mjs` | all PASS: 6 entries all under `src/app/`, 99/99 reachable |
| `npm audit --audit-level=high` | fails (pre-existing, W-01) |
| `next build` (placeholder Supabase env) | exit 0; `/` 87.2 kB, `/terminal` 132 kB, `ƒ /api/analytics`, `ƒ /api/chat` |
| Prerendered HTML | `/`: `<html lang="en">`, viewport `width=device-width, initial-scale=1`, no `seo-content`, no email, no theme class. `/terminal`: `<meta name="robots" content="noindex, follow">`, `<link rel="canonical" href="https://tijothomas.dev/terminal">`, `html.dark`, `body.font-mono`, favicon, `maximum-scale=1` kept (terminal unchanged) |
| `next start -p 3241` + curl | `/v2` 308 → `/terminal`; `/v2?x=1` 308 → `/terminal?x=1`; `/v2/` 308 → `/v2` → `/terminal`; `/nope` 404; `/favicon.ico` 404; `/v1` 404 (same as base: there was never a `/v1` route) |
| Built CSS | site sheet 52 KB: 12 `@font-face` (Inter + Space Grotesk only), no JetBrains `@font-face`/woff, no `.seo-content`, no `--theme-*`; but it contains the `.font-mono{font-family:JetBrains Mono,…}` rule and every terminal utility (see #2) |

## Focus questions
1. **Terminal behaviour unchanged.** Confirmed. Commit A `0e8b4e9` is 96 R100 renames with 0 insertions/deletions. Commit B changes only `@/x` → `@/terminal/x` import lines (39 lines, all checked) plus configs. Post-B edits to `src/terminal/**` are only `version.ts:17` (`/v1` → `/terminal`, TERM-AC-05) and two new test files. `globals.css` moved next to `layout.tsx` (relative `./globals.css` still resolves); JetBrains Mono, ThemeProvider, `<Analytics/>`, metadata and icons are re-exported unchanged by `(terminal)/layout.tsx`. `public/favicon.svg` is untouched. The localStorage keys (`tijothomas-theme`, `-zoom`, `-sounds`) are unchanged. The fetch targets `/api/analytics` and `/api/chat` still resolve through the re-export entries. There are no dynamic imports or `require()` calls in the terminal code.
2. **(site) layout clean.** No ThemeProvider, no hidden SEO block, no PII, no `maximumScale`/`userScalable`, no terminal CSS import, and the HOME-AC-04 graph reaches nothing under `src/terminal`. The one leak is through the shared Tailwind config, not through imports (#2).
3. **Deviations.** (a) The API handlers in `src/terminal/api` behind 3-line re-exports are acceptable. The unit file records this pattern with a trade-off, `routes.test.ts` proves the exported functions are identical, and the build lists both as `ƒ` routes. It conflicts only with the PRD §3a tree comment (`src/app/api/*` = route handlers), so it needs a one-line PRD/ADR note (#7). (b) The `check-unreachable` PLAT-AC-12 scope change is acceptable but weakens coverage (#5). (c) Passing `check-renames` for moved-then-deleted files is acceptable only if made explicit (#4).
4. **New gates are not vacuous.** `check-imports` fails on 0 modules and on 0 (site) route files, and has fixtures for each rule. `check-renames` fails on an unknown commit, 0 renames, a non-R entry and a below-threshold score. `css-diff` exits 2 on a missing file or a 0-class CSS file, and both paths are tested. One small hole remains in each of check-imports (#6) and check-renames (#4).
5. **/v2, /terminal, version selector.** All correct (see table). The `VersionDropdown.tsx:16` `/v1` → `/` branch is now dead (#8).
6. **Root hygiene.** `tsconfig.tsbuildinfo` is ignored by `.gitignore:23` (`*.tsbuildinfo`) and is a local `tsc --incremental` artefact: no finding. `paths.mjs` was **not** moved to `src/`: it stays at `scripts/paths.mjs`, and only its values now point into `src/`. That is correct, because PRD §3a says gate scripts live in `scripts/` and are never app code. The root has no `app/`, `components/`, `lib/`, `features/`, `widgets/` or `shared/` (PLAT-AC-08 test).
7. **Commit A purity and hygiene.** Commit A is pure. Commit A alone does not build (its imports point at the old paths), which the move-then-fix design accepts; bisecting should skip `0e8b4e9`. Commit B also carries two gate-script logic changes (`repo-graph` `aliasPrefix`, the `check-unreachable` scope). They are small and described in the commit message, so I raise no finding.

## Findings
| # | Severity | File:line | Finding | Recommendation | Status |
|---|----------|-----------|---------|----------------|--------|
| 1 | minor | `src/terminal/layout.tsx:88-120` (re-exported by `src/app/(terminal)/layout.tsx:4-9`) | The hidden SEO block, with the owner's email (`:116`) and UK phone, is still server-rendered in `/terminal` HTML. Threat model T-21 lists this "`app/layout.tsx` hidden block" among the dead copies that "disappear with the new layout", so U-04 commit A's PII-strip file list does not name `src/terminal/layout.tsx`. The exposure is pre-existing, not new: the move kept it on purpose ("terminal unchanged"), and the U-04 `pii-scan` over `/terminal` HTML would catch it. Still, the plan now has a gap. | Add `src/terminal/layout.tsx` (the `seo-content` block, `:88-120`) to U-04 commit A and to `rename-exceptions.json` (SQ-05 reason), and update T-21's mitigation text. Do not change it in U-03. | open |
| 2 | minor | `tailwind.config.js:4-9`, `src/app/(site)/globals.css:2-4` | One Tailwind config serves both route groups, so `/` ships all terminal utilities: the site stylesheet is 52 KB for a hello-world page, including `.font-mono{font-family:JetBrains Mono,…}`. There is no JetBrains `@font-face`/woff, no `.seo-content` and no `--theme-*`, so nothing visible or PII leaks, and Lighthouse is 100 today. But the bulkhead pattern ("terminal styles cannot leak into `/`") holds only at the import level. Impl-notes acknowledges this. | Before U-06 ships real content, give `(site)` its own config: add `@config "../../../tailwind.site.config.js"` in `src/app/(site)/globals.css`, with content = `src/app/(site)`, `src/components`, `src/content`. Keep the root config for the terminal, and keep the PLAT-AC-06 sentinel test pointed at both. Add a site-CSS budget or "no terminal-only class in site CSS" check. | open, track to U-05/U-06 |
| 3 | minor | `src/app/(site)/layout.tsx:14-17`; `.next/server/app/_not-found.html` | Two regressions against base `/`. (a) No icon in the site metadata: `/` has no `<link rel="icon">` and `/favicon.ico` returns 404, while base `/` served `/favicon.svg`. (b) With two root layouts and no top-level `not-found`, unknown URLs render Next's bare 404 (`<html>` without `lang`, no site styles). This removes the PII block that base 404s carried, but it fails `html-has-lang`. | (a) Add `icons: { icon: '/favicon.svg' }` to the site metadata, or add `src/app/(site)/icon.svg`. (b) Record it for U-06/U-07: a site-branded 404 with `lang="en"`, for example `(site)/[...slug]/page.tsx` calling `notFound()` plus `(site)/not-found.tsx`. | open |
| 4 | minor | `scripts/check-renames.mjs:98` | Check 2 passes silently for any moved file whose old path is `D` at HEAD. If a moved file is deleted and its logic re-created under a new name with < 50 % similarity (so git does not pair them), the gate passes. The safety net becomes "a reviewer notices", which is what PLAT-AC-10 is meant to replace. | Require deletions to be declared, e.g. an `exceptions[].deleted: true` entry with a reason (U-04 already plans to list the chat route), and fail on an undeclared `D`. Or print deleted files as `NOTE` lines so they show in gate output. | open |
| 5 | minor | `scripts/check-unreachable.mjs:74` | PLAT-AC-12 now scans only tests under `srcRoots`, so tests in `e2e/` and `scripts/` are no longer checked for imports of missing or dead modules. Harmless today (e2e imports only `@playwright/test`, and a broken `scripts/*.test.mjs` import fails `node --test`), but the change narrows the gate's scope to avoid a scanner false positive. | Keep `e2e/` in scope (add `'e2e'` to the roots used here). For `scripts/`, strip string and template literals before `specifiers()` rather than excluding the folder. | open |
| 6 | nit | `scripts/check-imports.mjs:39-40` | Unresolved local specifiers (`{ unresolved }`) are dropped from the graph, so an unresolvable `@/terminal/…` edge from `(site)` is invisible to HOME-AC-04. `tsc`/CG1 catches TS imports today, but not non-code imports such as CSS. | Report unresolved local edges from (site) closure files as FAIL, or at least as a warning. | open |
| 7 | nit | `src/app/(terminal)/terminal/page.tsx:3`; PRD §3a table | (a) The PRD rule for `src/app/(terminal)/terminal` says "imports only from `src/terminal/`", but the page imports `@/lib/site`. That is reasonable (one canonical origin, F-69), but the rule as written is broken. (b) PRD §3a places the handlers in `src/app/api/*`, while they now live in `src/terminal/api` behind re-exports. (c) `/terminal` keeps the terminal layout's `og:url` `https://tijothomas.dev` (`src/terminal/layout.tsx:53`) next to a `/terminal` canonical. It is harmless under noindex. | Amend PRD §3a: the terminal route may import `src/lib/`, and `src/app/api/*` may be re-export entries for legacy handlers until U-04/analytics rebuild. Leave (c) to U-04/U-10. | open |
| 8 | nit | `src/terminal/widgets/VersionSelector/organisms/VersionDropdown.tsx:16` | The `version.route === "/v1" ? "/" : …` branch is dead now that v1 is `/terminal`. Leaving it is consistent with "no terminal edits beyond the AC". | Remove it in U-10, when terminal fixes are allowed. | open |

**Counts:** blocker 0 · major 0 · minor 5 · nit 3

## Tests
- The tests assert behaviour: TERM-AC-01/02/03/04/05 are covered by both e2e and unit tests. HOME-AC-05 seeds `tijothomas-theme=cyber` before load and asserts no `theme-*` class. `routes.test.ts` checks the handlers by identity (`toBe`). `version.test.ts` derives routes from the file system and the redirects from `next.config.js`, not from a hard-coded list.
- `moved-modules.test.ts` only proves each module loads. That is enough for its stated purpose (import paths); the behaviour is covered by e2e and the smoke run.
- No flaky patterns found. `networkidle` waits are used only on the static `/`.

## Verdict
**approve.** There are no blockers or majors. #1 is a plan amendment for U-04 and does not need a U-03 code change. #2 and #3 should be scheduled into U-05/U-06/U-07 before `/` gets real content. #4 and #5 are small gate hardenings and can go in U-04, which is the first unit to rely on the deleted-file path.

---
## Orchestrator disposition (2026-11-24)
| Finding | Carried to |
|---------|-----------|
| Hidden SEO block with email/phone in `src/terminal/layout.tsx:88-120` | U-04 commit A PII-strip list + `rename-exceptions.json` (SQ-05); update threat model T-21 |
| Shared Tailwind config ships terminal utilities on `/` | U-06: separate `(site)` Tailwind config via `@config` |
| No favicon on `(site)`; bare 404 without `lang` | U-06 (icons) / U-07 (branded site 404) |
| `check-renames` silently passes moved-then-deleted files | U-04: require declared deletions in exceptions file |
| `check-unreachable` PLAT-AC-12 dropped `e2e/` and `scripts/` | U-04: restore e2e/, strip string literals for scripts/ |
| Nits (check-imports unresolved, PRD §3a wording, /terminal og:url, dead /v1 branch) | U-04 (og:url, /v1) and PRD amendment with Q-4 |
