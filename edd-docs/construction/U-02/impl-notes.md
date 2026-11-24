# U-02 Next 16.4.6 + React 19 upgrade: implementation notes (EDD stage 2.2)

- **Commits:** `7881c26` (upgrade, lazy client, build-no-env), `c127470` (next-env.d.ts), `22b65a0` (docs), `d2bb768` (helper client-path tests). Base `b22401b`.
- **Who:** the stage 2.2 developer agent was stopped by the owner partway through, after it had made the dependency bump (uncommitted). The orchestrator finished the unit in the main session, so the owner could see live changes.

## What changed
| Area | Change | AC |
|------|--------|----|
| Dependencies | `next` 16.4.6, `react` and `react-dom` 19.3.1, `@types/react(-dom)` 19.3.0, `lucide-react` 0.577.0 (all exact). `@next/bundle-analyzer` and the `analyze` script removed (option "removed" from the test plan). | PLAT-AC-01 |
| Audit | `vitest` and `@vitest/coverage-v8` 3.2.7; `overrides.tinypool` 2.2.0 (GHSA-5gmw-xhrv-c9v3 and GHSA-85c8-ppgw-ccpr, critical; vitest 3.2.7 pins tinypool ^1.1.1, which has no patched 1.x). `npm audit fix` cleared the remaining transitive highs (`ws`, `zod`, `vite`, `rollup`, …). | PLAT-AC-02 |
| `src/terminal/lib/supabase.ts` | Eager `export const supabase = createClient(...)` replaced by a memoised `getSupabase(): SupabaseClient \| null` that reads env on first call. Each helper calls it and fails soft. `getSupabaseAnalytics()` returns `null` with no client and does not log an error. | TERM-AC-06, PLAT-AC-03 |
| `src/terminal/api/analytics/route.ts` | Calls `getSupabase()` per request. With no client: GET returns `200 {visits:[],usage:[]}` and POST returns `200 {success:false}`. Behaviour with a client is unchanged. | TERM-AC-06 |
| `scripts/build-no-env.mjs` + `gates.yml` CG1 | Implemented the test-plan interface; CG1 is now `node scripts/build-no-env.mjs`. | PLAT-AC-03 |
| `next.config.js` | `images` and the bundle-analyzer wrapper removed, and no `webpack` key; `compiler.removeConsole` and the `/v2` 308 kept. | PLAT-AC-07 |
| `tsconfig.json` | Next 16 rewrite: `jsx: react-jsx`, include `.next/dev/types/**/*.ts`. | PLAT-AC-04 |
| React 19 types | `RefObject<HTMLDivElement \| null>` in `ChatMessages.tsx` and `FloatingDrawer.tsx`. SP-01 counted 5 prop types; with React 19.3 only these 2 failed `tsc`. | PLAT-AC-04 |
| `scripts/rename-exceptions.json` | Declares the 4 moved files that U-02 edits (required by the PLAT-AC-10 test). | PLAT-AC-10 |
| `scripts/gates.test.mjs` | The U-01 CG1 regex also accepts `node scripts/build-no-env.mjs`. That old test pinned `npm run build`, which contradicts the U-02 contract. The assertion is widened, not removed. | — |

## Deviations and findings
1. **Font (visible change, needs owner decision at PG5).**
   - Next 14 `next/font` emitted hashed family names (`__JetBrains_Mono_4dc837`). The terminal CSS stack names `'JetBrains Mono', 'Fira Code', 'Consolas', monospace`, so under Next 14 the self-hosted font never matched. Visitors got Consolas, or their own local JetBrains Mono.
   - Next 16 (Turbopack) emits the plain family name `JetBrains Mono`, so the declared font now loads. Measured: `document.fonts` shows `JetBrains Mono: loaded` on HEAD, and only the unloaded hashed faces on base.
   - The result is wider glyphs, so some lines wrap one word earlier. That gives the 4–20 % pixel diff; layout, colours and controls are unchanged.
   - Recommendation: accept, because it is the font the terminal always declared. The alternative is to drop `JetBrains Mono` from the stack to keep Consolas, which would be a new design decision.
2. **`next-env.d.ts` flips between build and dev.** `next build` writes `./.next/types/…` and `next dev` writes `./.next/dev/types/…`. The build version is committed, so CG1 leaves the tree clean. Running `next dev` dirties the file; do not commit that change. `type-check` stays exactly `tsc --noEmit` (test contract), so CG3 relies on CG1 running first, which matches the gate order.
3. **Residual moderate advisories** (7, dev-only, vitest chain). The only fix is vitest 5, which conflicts with the RQ-08 pin (3.2.x). Proposal: a separate dev-tool unit, or U-11 hardening, upgrades vitest; not done here.
4. **Pixel and CSS diff base:** `b22401b` was built on Next 14 with placeholder Supabase env, because Next 14 cannot build without it (F-07, the bug this unit fixes).

## Verification run by the orchestrator (main checkout, no build)
- `npm audit --audit-level=high`: exit 0. `npx tsc --noEmit`: 0. `npx oxlint`: 0 errors.
- vitest 210/210; node tests 154/154; spec:check PASS (pending 63).
- Builds and e2e ran only in scratchpad worktrees (see gates.md).
- Audio: not listened to (owner check, unchanged from U-03).
