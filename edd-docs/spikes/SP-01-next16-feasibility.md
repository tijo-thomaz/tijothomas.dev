# SP-01 Next 16.4.6 + React 19 feasibility

- **Status:** Done (2026-11-23). Time box about 45 min, about 35 tool calls.
- **Feeds:** U-02 (Next 16.4.6 + React 19 upgrade), audit F-02 and F-07, PLAT-AC-01, PLAT-AC-03, PLAT-AC-04, PLAT-AC-07
- **Prototype:** a throwaway, uncommitted isolated git worktree detached at `redesign-home@89369a6`. Product code is identical to `241ad16`; only docs differ. **Nothing was merged or committed.** Spike edits in the worktree are throwaway and are never to be merged.

## Question (falsifiable)
Can `redesign-home` move from `next@14.2.30` / `react@18.3.1` to `next@16.4.6` + `react`/`react-dom@19` (with matching `@types/react*`) under these conditions?
1. `npm install` without `--force` or `--legacy-peer-deps` gives a tree where `npm ls` reports 0 invalid entries.
2. `tsc --noEmit` reports 0 errors in product code. Test and story files are known to be broken and are out of scope.
3. `next build` exits 0 with placeholder Supabase env, and also with no env once the planned U-02 lazy Supabase fix is in.

**Hypothesis:** yes, with a small and bounded set of changes. The expected changes are peer-dep bumps, a few React 19 `useRef` typing fixes, the `next lint` removal, and the deprecation of `images.domains`. Refuted if any runtime dependency has no React 19-compatible release, or if the product code needs more than about 10 hand fixes.

**Success criteria:** criteria 1 to 3 above, the size of the change list, and no blocker without a known fix.

## Method
1. `npm view next@16.4.6 version` and the dist-tags for next, react and @types/react.
2. A strict `npm install` of the target versions. Read the ERESOLVE output, then `npm ls --all | grep invalid`.
3. Resolve the conflicts only by using compatible versions, or by removing deps the specs already delete (Storybook, PLAT-AC-17).
4. `npx tsc --noEmit`, then split the errors into product and test/story files.
5. `npx next build`: with no env, with placeholder env (`NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=x`), and with no env after a throwaway Supabase guard.
6. `@next/codemod@16.4.6` dry runs: `next-async-request-api`, `remove-unstable-prefix`, `next-experimental-turbo-to-turbopack`, `middleware-to-proxy`, `next-lint-to-eslint-cli`.
7. `next start` smoke test with curl.
8. Environment: Node v24.14.0, npm 9.8.1, Windows 11.
9. Source: the official upgrade guide, https://nextjs.org/docs/app/guides/upgrading/version-16 (lastUpdated 2026-11-18).

## Raw evidence (trimmed)

### Versions exist
```
$ npm view next@16.4.6 version        -> 16.4.6   (dist-tag latest = 16.4.6)
react latest = 19.3.1 ; @types/react latest = 19.3.0 ; @types/react-dom 19.3.0
```

### Install 1: everything including `eslint-config-next@16.4.6` (strict)
```
npm ERR! code ERESOLVE
npm ERR! Found: eslint@8.57.1
npm ERR! peer eslint@">=9.0.0" from eslint-config-next@16.4.6
```

### Install 2: next/react/types only, eslint-config-next left at 14
The exit code is **0**, but npm 9 printed 8 "overriding peer dependency" warnings and left an invalid tree:
```
peer react@"^16.5.1 || ^17.0.0 || ^18.0.0" from lucide-react@0.290.0
peer next@"^14.1.0 || ^15.0.0" from @storybook/nextjs-vite@9.1.5 (and vite-plugin-storybook-nextjs)
$ npm ls --all  -> npm ERR! code ELSPROBLEMS
  invalid: next@16.4.6   (from @storybook/nextjs-vite)
  invalid: react@19.3.1  (from lucide-react)
```
Any later npm command on that tree fails hard. For example, `npm uninstall @storybook/...` gave `ERESOLVE could not resolve ... While resolving: lucide-react@0.290.0 Found: react@19.3.1`. **Exit code 0 is not proof of a valid install. Gate on `npm ls`.**

### Install 3: Storybook removed, lucide and analyzer bumped (strict)
- Changes:
  - removed `storybook`, `@storybook/*`, `@chromatic-com/storybook` and `eslint-plugin-storybook`
  - removed the `eslintConfig` key
  - `lucide-react` set to `0.577.0`
  - `@next/bundle-analyzer` set to `16.4.6`
- Results:
  - `npm install` exited 0 with **no** ERESOLVE warnings.
  - `npm ls --all | grep -c invalid` returned **0**.
  - Resolved versions: `next@16.4.6`, `react@19.3.1`, `react-dom@19.3.1`, `@types/react@19.3.0`, `@types/react-dom@19.3.0`, `zustand@5.0.8`, `@vercel/analytics@1.5.0`, `@testing-library/react@16.3.0`.

### Peer-range check for the listed dependencies
| Package (current) | Current peer range | React 19 / Next 16 OK? | Action |
|---|---|---|---|
| lucide-react 0.290.0 | react ^16.5.1\|\|^17\|\|^18 | **No** | Bump to **0.577.0** (last 0.x; react ^19 allowed since about 0.400). Do **not** jump to 1.x yet: 1.78.0 drops the `Linkedin` brand icon (TS2305 in `components/ContactActions.tsx:4`, `components/ContactMessage.tsx:4`). |
| @storybook/nextjs-vite 9.1.5 | next ^14.1\|\|^15 | **No** | Remove (PLAT-AC-17). 10.6.8 would allow ^16 if it were kept. |
| zustand 5.0.8 | react >=18 | Yes | none |
| gsap 3.13 | none | Yes | none |
| @vercel/analytics 1.5.0 | react ^18\|\|^19, next >=13 | Yes | none (2.0.1 exists; a major bump is optional) |
| @testing-library/react 16.3.0 | react ^18\|\|^19 | Yes | none |
| @testing-library/jest-dom 6.8 | none at 6.x | Yes | none (8.x needs vitest 5, so don't bump) |
| vitest 3.2.4 | no next/react peer | Yes | none |
| eslint-config-next 14 → 16 | 16 needs eslint >=9 | Conflict | Moot if Oxlint replaces ESLint (PLAT-AC-14/15). Otherwise use eslint 9 with a flat config. |
| @next/bundle-analyzer 15.5.3 | none | Yes | Align to 16.4.6. It is webpack-only, so `ANALYZE=true` under Turbopack is untested (see Risks). |

### `tsc --noEmit` after install 3
```
total 180 errors (baseline on 14.2.30: 139, all in tests)
product code: 6
  components/ContactActions.tsx(4,31): TS2305 no exported member 'Linkedin'   <- only with lucide 1.x
  components/ContactMessage.tsx(4,31): TS2305 no exported member 'Linkedin'   <- only with lucide 1.x
  features/chat-assistant/index.tsx(32,7): TS2322 RefObject<HTMLDivElement | null> not assignable to RefObject<HTMLDivElement>
  features/chat-assistant/ui/EnhancedChatAgent.tsx(38,43): TS2322 (same)
  features/chat-assistant/AtomicIndex.tsx(32,7): TS2322 (same; unreachable module)
  features/chat-assistant/ui/AtomicEnhancedChatAgent.tsx(37,11): TS2322 (same; unreachable module)
by code: TS2322 x125, TS2353 x23, TS2741 x13, TS2739 x10, TS2559 x6, TS2305 x3
worst test files: MessageList.test.tsx 24, IconButton.test.tsx 22, ThemeButton.test.tsx 21,
  MessageBubble.test.tsx 21, TerminalHistory.test.tsx 20, CommandOutput.test.tsx 15, *.stories.tsx 34
```
Root cause of the `useRef` errors: in React 19 types, `useRef<T>(null)` returns `RefObject<T | null>`. Five prop interfaces still declare `React.RefObject<HTMLDivElement>`:
- `features/chat-assistant/ui/FloatingDrawer.tsx:10`
- `features/chat-assistant/ui/AtomicFloatingDrawer.tsx:10`
- `features/chat-assistant/ui/ChatMessages.tsx:9`
- `features/chat-assistant/ui/organisms/ConversationArea.tsx:12`
- `features/chat-assistant/ui/organisms/MessageList.tsx:8`

Changing all five to `RefObject<HTMLDivElement | null>` and pinning lucide `0.577.0` gives **0 product errors**. That leaves 174 errors, all in tests and stories.

### `next build` without env (first run)
```
▲ Next.js 16.4.6 (Turbopack)
⚠ `images.domains` is deprecated in favor of `images.remotePatterns`.
✓ Compiled successfully in 11.2s
  Running TypeScript ...
  We detected TypeScript ... mandatory changes: jsx was set to react-jsx;
  include was updated to add '.next/dev/types/**/*.ts'
features/chat-assistant/ui/atoms/SendButton.test.tsx(37,42): error TS2322 ...
... (all *.test.tsx / *.stories.* errors)
Failed to type check.            exit=1
```
**New behaviour:** on 14.2.30 the build passed with the same 139 test errors (`edd-docs/audit/raw/build2.txt`). On 16.4.6, the build's TypeScript step type-checks **every file in tsconfig `include`** and fails on any test or story error. Next also rewrites `tsconfig.json` (`jsx: preserve` becomes `react-jsx`, and it adds `.next/dev/types`) and `next-env.d.ts`.

Workaround used in the spike: add `**/*.test.ts(x)`, `**/*.stories.ts(x)`, `stories/**` and `vitest.*` to `tsconfig.exclude`. Excluding only `*.stories.tsx` was not enough, because `stories/Page.stories.ts(9,3)` still failed. The real fix is U-00/Q4: delete or fix the tests, or use a separate `tsconfig.test.json`.

### `next build` without env (tests excluded)
```
✓ Finished TypeScript in 11.6s
  Collecting page data using 7 workers ...
Error: Failed to collect configuration for /api/analytics
  [cause]: Error: supabaseUrl is required.  at lib\supabase.ts:7:7
> Build error occurred                         exit=1
```
This is the same F-07 failure as the 14.2.30 baseline. The upgrade does not cause it.

### `next build` with placeholder env (tests excluded)
```
✓ Compiled successfully in 535ms
✓ Finished TypeScript in 3.6s
✓ Generating static pages using 7 workers (6/6) in 1065ms
Route (app)
┌ ○ /      ├ ○ /_not-found      ├ ƒ /api/analytics      ├ ƒ /api/chat      └ ○ /v2
exit=0   wall 10 s (warm Turbopack FS cache; cold first build ~29 s)   .next/static 1.1 MB, 15 chunks
```
`/` is still static (○), the same as the baseline. Next 16 no longer prints `First Load JS`, so the 136 kB baseline cannot be compared from build output. Use Lighthouse or the bundle on disk instead.

### `next build` without env, with a throwaway guard in `lib/supabase.ts`
```ts
const make = () => createClient(supabaseUrl, supabaseKey);
export const supabase = (supabaseUrl ? make() : null) as unknown as ReturnType<typeof make>; // SPIKE throwaway
```
The build exited 0 with the same route table. A cast like `ReturnType<typeof createClient>` loses the schema generics and causes 6 new TS errors in `lib/supabase.ts` and `app/api/analytics/route.ts:86-88`, so U-02's typed `getSupabase(): SupabaseClient | null` needs care.

### `next start` smoke test (placeholder build plus guard)
```
/ 200 13754B   /v2 200 14252B   /nope 404   /api/analytics 500 (null client; U-02 makes this a no-op)
X-Powered-By: Next.js  (still present -> U-11)
```
The server HTML is still "Loading tijothomas.dev...", unchanged (F-01, not in U-02 scope). No React 19 runtime error appeared in the server log. The client terminal was **not** exercised in a browser.

### Codemods (`@next/codemod@16.4.6 <t> . --dry --print`)
```
next-async-request-api               0 ok / 230 unmodified  (no cookies()/headers()/draftMode/params/searchParams in app/)
remove-unstable-prefix               0 ok / 230 unmodified
next-experimental-turbo-to-turbopack 0 ok / 230 unmodified
middleware-to-proxy                  0 ok / 230 unmodified  (no middleware.* file)
next-lint-to-eslint-cli              IGNORED --dry and WROTE: "lint": "eslint .", devDeps eslint "^9",
                                     new eslint.config.mjs; "Config does not export an array ... Manual migration required."
```
In U-02, do not run `next-lint-to-eslint-cli` at all. Replace the `lint` script directly with Oxlint (PLAT-AC-14).

### `npm run lint` (`next lint`)
```
Invalid project directory provided, no such directory: ...\lint      exit=1
```
`next lint` was removed in 16 and the CLI now reads `lint` as a directory. CG2 breaks until the script changes.

### next.config.js
- `images.domains`: deprecated warning on every build. U-02 already removes the `images` block (F-22, PLAT-AC-07).
- `compiler.removeConsole`: works under Turbopack. The only `console.log` left in client chunks comes from `@vercel/analytics`.
- `@next/bundle-analyzer` wrapper: harmless when `ANALYZE` is unset. With it set, the analyzer injects a `webpack` key. Per the upgrade guide, a `webpack` config makes the default Turbopack build fail, so use `next build --webpack` for analysis. The `analyze` script also uses POSIX `ANALYZE=true`, which does not work on Windows.
- No `eslint`, `experimental.*`, `serverRuntimeConfig`, `amp` or webpack keys are set, so there is nothing else to migrate.

## Options compared
| Criterion | A: 16.4.6 strict (this spike) | B: 15.5.29 backport | C: stay on 14.2.35 |
|---|---|---|---|
| Closes next critical advisories (F-02) | Yes | Yes | Partial (audit says a full fix needs 15.5.29 or 16.4.6) |
| Strict install, 0 invalid | Yes, after lucide to 0.577 and Storybook removal | Probably the same lucide change; Storybook 9 allows ^15 | Yes, no change |
| Product TS errors to hand-fix | 5 prop types (`useRef`), measured | Same 5 (React 19 types) | 0 |
| `next build` with placeholder env | exit 0, measured | not measured | exit 0 (audit) |
| `next build` with no env | exit 0 with lazy Supabase, measured | not measured | needs the same lazy fix |
| Build fails on test TS errors | **Yes** (new) | not measured | No |
| `next lint` | Removed. Move to Oxlint, as already planned | Deprecated, still works | Works |
| Codemod output | none needed (0 files touched) | n/a | n/a |
| Future upgrade debt | none | one more major later | two majors later |

## Findings
1. **Feasible.** With a strict install, 16.4.6 + React 19.3.1 + @types 19.3.0 gives a valid tree once two packages change. `lucide-react` must go to 0.577.0, and Storybook 9 must be removed (it was already scheduled for removal).
2. **npm 9 masks the conflicts.** The first strict install exited 0 but left `next` and `react` marked "invalid". The U-02 gate must be `npm ls` (PLAT-AC-01), not the install exit code.
3. **React 19 type fallout in product code is small.** Five `RefObject<HTMLDivElement>` prop declarations break 4 call sites (2 of them in unreachable modules). Each fix is one line.
4. **The Turbopack-default build passed** first time. There is no custom webpack config, and `removeConsole` works.
5. **New blocker for an env-free build:** Next 16's build type-checks test and story files. U-02 must exclude them in `tsconfig` or be sequenced after the U-00 test clean-up (Q4). Otherwise PLAT-AC-03 fails even with env set.
6. **F-07 is unchanged and fixable.** A guarded Supabase client makes the no-env build pass.
7. **No codemod changes are needed.** The app has no async request APIs, middleware, `unstable_` imports or turbo config. The lint codemod is harmful here because it writes even with `--dry`.
8. Next rewrites `tsconfig.json` (`jsx: react-jsx`, `.next/dev/types`) and `next-env.d.ts` on the first build. Commit both in the mechanical commit.

## Recommendation
**Go with changes.** Confidence **high** for build and type feasibility, and **medium** for runtime parity of the old terminal.

Required changes, beyond the U-02 scope as written:
- `lucide-react` to `0.577.0`, pinned. Not 1.x, because the `Linkedin` icon is missing there. Add it to U-02 scope.
- Remove Storybook in or before U-02. Otherwise the tree is invalid without `--legacy-peer-deps`. Make U-02 depend on the Storybook-removal unit, or fold the removal in.
- Exclude `**/*.test.*`, `**/*.stories.*`, `stories/**` and `vitest.*` from the root `tsconfig.json` (a type-check tsconfig for tests can come later). Or land the U-00/Q4 test clean-up first.
- Replace `"lint": "next lint"` with Oxlint, and remove `eslint`/`eslint-config-next` in the same change. Do **not** run `next-lint-to-eslint-cli`.
- Remove `@next/bundle-analyzer` and the `analyze` script, or pin it to 16.4.6 and document `--webpack`.

### Remaining risks
- **R1 (critical, open):** no browser run of the terminal under React 19. Concerns are GSAP effects, zustand, double effects in StrictMode dev, and the `useRef` semantics change. U-02 keeps the Playwright smoke and the manual checklist as DoD.
- Next 16 does not report the bundle size, so performance regression detection needs Lighthouse or a manual size check.
- `@vercel/analytics` 1.5 works. Its 2.x major was not evaluated.
- Measured on npm 9.8.1. npm 10/11 is stricter and should surface the same conflicts as hard errors (not verified).
- The test suite (vitest 3.2 with React 19 and @testing-library/react 16.3) was not run in this spike.

## Draft ADR
```
ADR-P6: Upgrade to Next.js 16.4.6 and React 19

Status: Proposed (from SP-01)
Context: next@14.2.30 carries critical advisories (F-02). Full fixes ship in 15.5.29 and 16.4.6, and both
require React 19. SP-01 showed that 16.4.6 + react@19.3.1 + @types/react@19.3.0 installs strictly
(0 invalid in npm ls) once lucide-react is bumped and Storybook 9 is removed. Product code then needs
5 one-line RefObject type fixes. `next build` (Turbopack default) passes with placeholder env, and with
no env once the Supabase client is lazy. No @next/codemod transforms apply to this codebase.
Decision: Go directly to next@16.4.6 and react/react-dom@19 with matching @types, skipping 15.x.
  - No --force or --legacy-peer-deps. Gate on `npm ls` (not on the install exit code).
  - lucide-react pinned to 0.577.0 until brand icons are replaced (1.x removes Linkedin).
  - Storybook removed before or with the upgrade (PLAT-AC-17).
  - Root tsconfig excludes test and story files until the test clean-up lands, because Next 16's build
    type-checks all included files.
  - `next lint` is replaced by Oxlint. The next-lint-to-eslint-cli codemod is not used.
  - Turbopack is used for build. Bundle analysis, if needed, runs with `next build --webpack`.
  - images config removed (F-22). Supabase client is lazy and null when env is missing (F-07).
Consequences: + advisories closed, no second major later, env-free build possible.
  - The old terminal must be re-verified under React 19 (R1) with Playwright and a manual checklist.
  - Next 16 has no First Load JS metric, so size budgets need another measure.
  - Next rewrites tsconfig (jsx react-jsx) and next-env.d.ts. Commit them with the mechanical change.
Alternatives: 15.5.29 backport (same React 19 work, one more major later); 14.2.35 (advisories not fully closed).
```
