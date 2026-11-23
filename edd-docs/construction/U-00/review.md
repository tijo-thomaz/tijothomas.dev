# U-00 Baseline purge: code review (EDD stage 2.5)

- **Date:** 2026-11-24 · **Branch:** `redesign-home` · **Range:** `89369a6..3e1b279` (`00ea19d..3e1b279`, 7 commits), `edd-docs/` excluded
- **ACs:** PLAT-AC-05, PLAT-AC-11, PLAT-AC-12, PLAT-AC-13, PLAT-AC-17
- **Reviewer:** independent reviewer (did not write the code)

## Precondition
There is no `edd-docs/construction/U-00/gates.md`. The unit DoD says that `gates.yml` does not exist until U-01 and that gate output is saved by hand, so the gate evidence lives in `impl-notes.md` and in the 2026-11-24 row of `audit.md`. I treated that as the gate record and re-ran every gate myself (see below). Finding 8 covers this.

## Gates re-run by the reviewer (2026-11-24, Windows 11, Node 24.14)
| Command | Result |
|---------|--------|
| `node scripts/check-unreachable.mjs` | PASS ×3; entries = `app/api/analytics/route.ts, app/api/chat/route.ts, app/layout.tsx, app/page.tsx`; modules 92, reachable 92, unreachable 0. The listed-path check read 58 paths from `cycles.txt` and 82 from `unreachable.txt`, so it did not pass on an empty list. |
| `node scripts/check-deps.mjs --verbose` | PASS. All 26 deps have a concrete reason. |
| `node --test "scripts/*.test.mjs"` | 4/4 pass |
| `node scripts/check-vitest-config.mjs` | 7/7 PASS, including the probe and 3 consecutive `npm run test` runs |
| `npx vitest list --filesOnly` | 3 files: `lib/vitest-alias.test.ts`, `shared/ui/atoms/{Icon,Text}.test.tsx`. These equal every tracked `*.test.ts(x)`, so nothing is hidden by include or exclude. |
| `npx tsc --noEmit` | exit 0 |
| `npm run lint` | 0 errors, 3 `exhaustive-deps` warnings (`Terminal.tsx`, `ThemeProvider.tsx`, `ZoomControls.tsx`) |
| `npm ls gsap zustand playwright @vitest/browser storybook` | gsap, zustand and storybook are absent. `@vitest/browser` and `playwright` remain only as optional peers of `vitest`/`@vitest/coverage-v8` (see finding 5). |
| `npm audit --omit=dev` | critical `next <=16.3.0-preview.10`, high `nanoid`, `postcss` (nested in next) and `source-map-js`. **All pre-existing**: U-00 adds no packages. The Next upgrade is U-02. |
| Tailwind CSS diff (`tailwindcss -c tailwind.config.js -i app/globals.css`, base tree `89369a6` vs HEAD) | **base 757 class selectors, HEAD 229. 528 were removed, and 413 of those are still used by modules reachable from `/`** (see finding 1) |

Runtime import check: `git grep` finds no reference to `gsap`, `zustand`, `playwright`, `@vitest/browser`, `storybook` or any deleted module path in code or config (the only hits are `.gitignore` entries and the checks themselves). `next.config.js` refers to no deleted module. No `public/` asset was deleted.

## Findings
| # | Severity | File:line | Finding | Recommendation | Status |
|---|----------|-----------|---------|----------------|--------|
| 1 | **blocker** | `tailwind.config.js:4-9` (with commit `202a7b7`) | **`/` is visually broken.** The Tailwind `content` globs cover only `components/`, `app/`, `pages/` and `src/`. The reachable `features/`, `widgets/` and `shared/` code got its utility classes only because the now-deleted `components/*.tsx` files (`EnhancedChatAgent`, `FloatingAIAssistant`, `InteractiveWorldViewer`, `CommandSuggestions`, `PrivacyPolicy`, `VersionSelector`, …) happened to use the same classes. After the deletion, the generated CSS drops 413 classes still used on `/`, for example `sticky`, `grid`, `pointer-events-none`, `animate-spin`, `animate-pulse`, `backdrop-blur-sm`, `z-10`, `z-20`, `top-1/2` and `left-1/2`. Worst hit: `features/chat-assistant/ui/FloatingTrigger.tsx` (60 classes), `FloatingDrawer.tsx` (25), `widgets/PrivacyPolicy/molecules/PrivacyModal.tsx` (19), `widgets/VersionSelector/organisms/VersionDropdown.tsx` (15), and the whole world-viewer. This breaks R7 and the "chat opens" smoke, and it makes the `impl-notes.md` claim that "`/` is unchanged (no reachable module was touched)" false. The module graph cannot see a dependency that exists only through CSS. | Add temporary globs `'./features/**/*.{ts,tsx}', './widgets/**/*.{ts,tsx}', './shared/**/*.{ts,tsx}'` to `content`, mirroring the temporary vitest glob, and remove them in U-03. I verified this: with the globs, 0 classes used by HEAD sources are missing compared with base. It also adds 50 classes that were *latently* missing at base (e.g. `bg-clip-text`, `text-transparent`, `translate-y-full`, `cursor-not-allowed`), so do the manual smoke with before/after screenshots and record those changes in impl-notes. Commit as `fix(U-00): …` and correct impl-notes. Better still, add a CSS-diff step to the unit evidence. | open |
| 2 | major | `edd-docs/construction/U-00/impl-notes.md` (Open DoD) | The DoD manual smoke of `/` (load, `help`, theme toggle, chat opens, with screenshots) was not done, and the build was taken as proof that `/` is unchanged. The smoke is the only R7 check that would have caught finding 1. | Do the smoke after fixing finding 1 and store the screenshots in `edd-docs/construction/U-00/`. | open |
| 3 | minor | `scripts/lib/repo-graph.mjs:91`, `scripts/check-unreachable.mjs:23,47` | The checks can pass vacuously. `readListedPaths` returns `[]` when `cycles.txt` or `unreachable.txt` is missing or reformatted, and `buildGraph` with 0 modules or 0 entries (wrong `--root`, moved `app/`) reports "0 unreachable". Both PASS silently. They are non-vacuous today (58 + 82 paths, 92 modules, 4 entries). | Fail when `listed.length === 0`, `graph.entries.length === 0` or `graph.modules.length === 0`. Add `--root` fixture tests for this in U-01, as the test plan already intends. | open |
| 4 | minor | `scripts/lib/repo-graph.mjs:8`, `scripts/storybook-removed.test.mjs:15` | PLAT-AC-17 says "given the repo", but `walk` skips `docs/`, `public/`, `specs/` and `edd-docs/`, so a `*.stories.*` file there would go undetected. `check-vitest-config.mjs:38-40` checks the include glob by substring over the whole config, not inside `test.include` (it does not misfire today, because `coverage.include` uses `*.{ts,tsx}`). | Use a separate walk for the stories test that skips only `node_modules`/`.git`/`.next`. Scope the include check to the `include:` array text. | open |
| 5 | nit | `package-lock.json:2423,6639` | `@vitest/browser@3.2.4` and `playwright@1.55.0` (+ `playwright-core`) are still locked and installed as optional peers (`npm ls` shows them under `@vitest/coverage-v8` and `vitest`). They are harmless and not declared, but they are still in `node_modules` after the "drop playwright" commit. | Optional: regenerate the lock (`rm -r node_modules package-lock.json; npm install`) or leave it for the U-02 reinstall. | open |
| 6 | minor | `widgets/VersionSelector/VersionSelector.tsx:29`, `lib/version.ts:25` | `/` still offers "v2.0.0 JARVIS AI" in the version dropdown, and choosing it sets `window.location.href = '/v2'`, which now returns a 404. The unit accepts a `/v2` 404 until U-03 (scope 2), but a visible UI path on `/` now leads to a 404. | Accept per the unit, and record it in impl-notes as a known branch-only regression. Optionally drop the `/v2` entry from `AVAILABLE_VERSIONS` until U-03. | open |
| 7 | nit | `shared/ui/atoms/Text.test.tsx:112-115,134-137` | Two cases are tautological ("responsive text sizes" passes the classes it asserts through `className`, and "data attributes" checks only that a test id exists). The other Icon/Text cases assert real cva/`as`/ref/merge behaviour; they are not empty snapshots. Note that class-name assertions such as `animate-spin` (`Icon.test.tsx:89`) still pass even though the class is missing from the CSS (finding 1). | Optional: drop or merge the two cases. | open |
| 8 | nit | `edd-docs/construction/U-00/` · commit `00ea19d` | (a) There is no `gates.md`, so the gate evidence is spread across impl-notes and audit.md. (b) `00ea19d` also bundles the SP-02 spike doc and the CONT-AC-09 retirement, which are unrelated to the red checks. (c) The CHANGELOG entry from the DoD is still open. Otherwise the commits are clean: deletion-only `202a7b7`, conventional messages, and co-author trailers present. | Write `gates.md` from the re-run table above. Split unrelated docs into their own commits next time. Track the CHANGELOG with U-01. | open |

Counts: blocker 1, major 1, minor 3, nit 3.

## Checks that were requested and found clean
- **Reachability:** no deleted module is referenced by string, `import()`/`next/dynamic`, `next.config.js` or a `public/` asset. `app/page.tsx` imports only surviving modules, and `tsc` plus the build agree. The only hidden coupling is CSS (finding 1).
- **Windows paths:** `walk` builds POSIX relative paths, and `resolveLocal` applies `toPosix` after `path.join`. Verified on Windows: 92 modules are resolved.
- **Vitest/tsconfig exclusions:** `.claude/**` and `.next/**` hold no tracked tests, and all 3 tracked test files are collected.
- **Dependencies:** gsap, zustand and the Storybook packages have no remaining runtime import. No new dependency or licence change was introduced.

## Verdict
**changes requested.** Fix finding 1 (Tailwind content globs), then do the manual smoke with screenshots (finding 2) and re-run the CSS diff. Everything else may stay open as minor or nit.
