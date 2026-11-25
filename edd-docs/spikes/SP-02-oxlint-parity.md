# SP-02 Oxlint parity (throwaway spike)

Status: Done · Date: 2026-11-23 · Time box: ~30 tool calls (used ~28) · Risk ref: R10
Prototype (throwaway, never merge): `.claude/worktrees/agent-a24113e5cadd46827/spikes/SP-02/` (`oxlintrc.json`, `oxlintrc.final.json`)

## Question
Can Oxlint alone (no ESLint) replace `next lint` + `eslint-config-next` (core-web-vitals) + current `.eslintrc.json` for this repo and meet CG2 lint (PLAT-AC-14: plugins react, nextjs, jsx-a11y, typescript, vitest; exit 0 in <= 5 s; 0 warnings outside legacy/terminal), the a11y rules, PLAT-AC-23 (`react/no-danger`) and CG7 complexity (PLAT-AC-16, RQ-21 a)? What is the minimal `.oxlintrc.json`?

## Hypothesis
Oxlint (latest, pinned) covers every rule enabled by `next/core-web-vitals` that matters here, runs in < 1 s, and has `complexity`, `max-lines`, `max-lines-per-function`, `max-params` and `max-depth`, so no ESLint and no custom complexity script are needed.

## Success criteria
1. Oxlint runs on the repo with the 5 plugins; exit 0 achievable with an override for legacy paths; wall time <= 5 s.
2. Every core-web-vitals rule has an Oxlint equivalent or a documented low-risk gap.
3. All 5 CG7 limits are expressible as Oxlint rules (else a minimal script is specified).
4. A minimal `.oxlintrc.json` + `lint` / `lint:fix` scripts are drafted.

Result: **all 4 met. Hypothesis confirmed.**

## Method
1. `npm view oxlint version` -> **1.95.0** (published 2026-11-23); `npm view oxlint-tsgolint version` -> 7.0.2008.
2. Enumerated the effective ESLint rule set from the installed `eslint-config-next@14.2.30` (`index.js`, `core-web-vitals.js`, `@next/eslint-plugin-next` recommended + cwv, `eslint-plugin-react` recommended, `eslint-plugin-react-hooks` recommended) plus `.eslintrc.json` overrides.
3. `oxlint --rules` (873 rules) and diffed by name.
4. Ran Oxlint 1.95.0 on the worktree (226 files) with a prototype config, timed 3 runs, then with a legacy-path override, then on a dummy fixture outside legacy paths to prove the errors fire. Tried `--type-aware` with `oxlint-tsgolint@7.0.2008`.

## Evidence (trimmed)

```
$ npm view oxlint version            -> 1.95.0
$ npx oxlint@1.95.0 --rules | grep -E " (complexity|max-lines|max-lines-per-function|max-params|max-depth)"
 eslint complexity / max-depth / max-lines / max-lines-per-function / max-params   (all present)
$ npx oxlint@1.95.0 --rules | grep exhaustive
 react exhaustive-deps                                    (reported as react-hooks(exhaustive-deps))

# timing, direct binary (warm), 226 files, ~80 explicit rules + correctness category + import/no-cycle
real 0.566s / 0.600s / 0.598s          (prototype, no override)
real 0.647s / 0.683s / 0.850s          (final config, override)   -> EXIT=0, 262 warnings, 0 errors
# baseline next lint (audit/raw/lint.txt): real 8.892s
# npx cold start adds 6-17 s (package download); irrelevant once oxlint is an exact-pinned devDependency.

# first run, correctness=error, no override: 380 problems
 95 vitest(require-mock-type-parameters)  75 max-lines-per-function  56 no-unused-vars
 24 jsx-a11y(no-static-element-interactions)  21 jsx-a11y(click-events-have-key-events)
 18 complexity  17 typescript(no-explicit-any)  14 react(purity)  13 react(set-state-in-effect)
 10 jsx-a11y(prefer-tag-over-role)  7 react-hooks(exhaustive-deps)  5 react(immutability)
  5 jsx-a11y(control-has-associated-label)  5 max-lines  4 jsx-a11y(no-autofocus)  3 react(no-danger)
  2 react(refs)  2 max-depth  1 react(preserve-manual-memoization) 1 heading-has-content 1 no-useless-escape 1 max-params

# exhaustive-deps parity: all 4 ESLint baseline hits found (app/v2/page.tsx, components/Terminal.tsx,
# components/ThemeProvider.tsx, components/ZoomControls.tsx) + 3 more (features/terminal/model/useTerminal.ts,
# widgets/ZoomControls/index.tsx, a second one in components/Terminal.tsx). The ESLint baseline predates the FSD move.

# fixture outside legacy paths (dummy code, deleted after):
content/sp02-fixture.tsx:4:20  Function 'Bad' has too many parameters (5)  [Error/eslint(max-params)]
content/sp02-fixture.tsx:6:26  useEffect has missing dependencies          [Error/react-hooks(exhaustive-deps)]
content/sp02-fixture.tsx:7:30  Blocks are nested too deeply (4)            [Error/eslint(max-depth)]
content/sp02-fixture.tsx:7:46  Missing `alt` attribute                     [Error/jsx-a11y(alt-text)]
content/sp02-fixture.tsx:7:47  Using `<img>` ...                           [Error/next(no-img-element)]
content/sp02-fixture.tsx:8:39  Do not use `dangerouslySetInnerHTML`        [Error/react(no-danger)]
content/sp02-fixture.tsx:8:10/11 click-events-have-key-events, no-static-element-interactions [Error]
content/sp02-fixture.tsx:11:1  Assign arrow function ... before exporting  [Error/import(no-anonymous-default-export)]
EXIT=1

# type-aware
$ npx -p oxlint@1.95.0 -p oxlint-tsgolint@7.0.2008 oxlint --type-aware
tsconfig.json:3:15: Invalid tsconfig [Error/typescript(tsconfig-error)]    ("target": "es5")
tsconfig.json:22:5: Invalid tsconfig [Error/typescript(tsconfig-error)]    ("baseUrl")
warm run: real 3.85s
```

## Options compared

| Criterion | ESLint (`next lint`, today) | Oxlint 1.95 (non-type-aware) | Oxlint 1.95 + `--type-aware` (tsgolint 7) |
|---|---|---|---|
| Wall time, 226 files | 8.9 s | **0.6-0.85 s** | 3.9 s warm (plus tsconfig fixes first) |
| core-web-vitals rule coverage | 100 % (reference) | 21/21 `@next/next`, 6/6 jsx-a11y, 2/2 react-hooks, 18/22 react recommended (gaps below, all low risk) | same + typed TS rules |
| CG7 limits (5) | needs extra rules config | **all 5 native** (`complexity`, `max-lines`, `max-lines-per-function`, `max-params`, `max-depth`) | same |
| PLAT-AC-23 `react/no-danger` | not enabled | native, 3 hits today (all in legacy chat UI) | same |
| PLAT-AC-09 cycles | no | `import/no-cycle` available (bonus for CG9) | same |
| Per-path warn/error (RQ-20 a) | yes | yes via `overrides` (rule-by-rule) | same |
| Dependencies | eslint 8 (EOL), eslint-config-next, babel parser, plugins | 1 package | + `oxlint-tsgolint` |
| `next lint` future | deprecated in Next 15, removed in Next 16 | n/a | n/a |
| Blocking issue | - | none | current tsconfig invalid for TS 7 (`target: es5`, `baseUrl`) |

## Rules in eslint-config-next with no Oxlint equivalent

| ESLint rule | Status | Risk |
|---|---|---|
| `react/jsx-uses-react`, `react/jsx-uses-vars` | Not needed: they only mark vars as used for ESLint core `no-unused-vars`; Oxlint `no-unused-vars` understands JSX natively. | none |
| `react/no-deprecated` | Missing. Flags `componentWillMount`, `ReactDOM.render` etc. `react/no-unsafe` (enabled) covers the `UNSAFE_` lifecycles; `tsc` + `@types/react` `@deprecated` tags cover the rest in the editor. | low |
| `react/prop-types`, `react/no-unknown-property`, `react/react-in-jsx-scope`, `react/jsx-no-target-blank` | Turned off by eslint-config-next anyway. | none |
| `import/*` from config-next | Only `import/no-anonymous-default-export` is enabled; Oxlint has it. | none |
| `eslint-plugin-storybook` (`package.json#eslintConfig`) | Not active today: ESLint 8 ignores `package.json#eslintConfig` when `.eslintrc.json` exists in the same dir. Storybook is being removed (PLAT-AC-05). | none |

Settings in `.eslintrc.json` (`no-html-link-for-pages` off, `no-unescaped-entities` off, `exhaustive-deps` warn) are all expressible. The spec wants `exhaustive-deps` as error outside `terminal/` (0 warnings), which is stricter than today.

## Findings
1. **Parity: yes.** Every active core-web-vitals rule maps 1:1 except `react/no-deprecated` (low risk). Oxlint finds a superset of the ESLint hook warnings.
2. **Speed: 0.6-0.85 s** vs 8.9 s, well inside the 5 s NFR. Run the pinned local binary, not `npx oxlint@x` (cold npx download alone took 6-17 s).
3. **CG7: no script needed (RQ-21 a resolved).** All five limits are native Oxlint rules in 1.95.0. Caveat: Oxlint lints whole files, PLAT-AC-16 says "changed files". Error level outside the legacy override is stricter than "changed files", so it satisfies the AC. **Drop `scripts/check-complexity.mjs` from U-01 scope.**
4. **The `correctness` category (on by default) brings noisy extras**: React-Compiler rules (`react/purity`, `set-state-in-effect`, `immutability`, `refs`, `preserve-manual-memoization`; 35 hits) and `vitest/require-mock-type-parameters` (95 hits, mostly `vitest.setup.ts` and tests). They are not in the ESLint baseline; turn them off now, revisit if the React Compiler is adopted. Keep `no-unused-vars` on (56 hits, real dead code).
5. **Legacy override works** (RQ-20 a): with the override below, `oxlint` exits 0 with **262 warnings / 0 errors** (record as baseline; gate with `--max-warnings 262`, then lower it). 38 of these are in `features/terminal/`. The baseline will drop by ~12 once the test-file override is ordered last (see 7b).
6. **`app/**`, `stories/**`, `vitest.config.ts`, `vitest.setup.ts` are NOT in U-01's legacy list but have findings** (app pages: complexity/max-lines/max-depth/exhaustive-deps/no-explicit-any; `vitest.config.ts`: 2 unused vars). Either add them to the override for U-01 (prototype did) or fix them in U-01. `app/page.tsx` is being redesigned anyway. **Decision needed from architect.**
7. **Override gotchas**: (a) override `files` globs resolve relative to the config file's directory, so the config must live at repo root; (b) later overrides win, so the test-file relaxation must come **after** the legacy override; (c) Oxlint has no "downgrade all errors to warn" switch, so the override must list each rule that fires (fails safe: a new rule firing in legacy code is an error).
8. **Type-aware (`--type-aware`, tsgolint 7, stable since 2026-07)**: works, but rejects the current tsconfig (`target: "es5"`, `baseUrl`, both invalid for TS 7) and is ~6x slower (3.9 s, close to the 5 s budget). `tsc --noEmit` (CG3) already covers type errors. **Do not enable in U-01**; revisit once tsconfig is modernised (`target: "ES2022"`, drop `baseUrl`, `paths: {"@/*": ["./*"]}`) if promise rules (`no-floating-promises`, `no-misused-promises`) are wanted.

## Recommendation
Adopt **Oxlint 1.95.0 alone, exact-pinned, non-type-aware**, with the config below. Remove `.eslintrc.json`, `package.json#eslintConfig`, `eslint`, `eslint-config-next`, `eslint-plugin-storybook`. Use native CG7 rules; do not build `scripts/check-complexity.mjs`. Add `import/no-cycle` as a cheap extra for PLAT-AC-09 (cycles only; direction rules still need the U-03 script).

**Confidence: high** (measured on this repo, 3 timed runs, a fixture proves the error paths).

Remaining risks:
- `react/no-deprecated` gap (low; tsc/@deprecated covers it).
- Oxlint ships often; rules move between categories, so a version bump can add findings. Mitigation: exact pin, gate runs on upgrade PRs.
- `complexity` counting may differ slightly from ESLint's. Acceptable: the limit is ours, the pinned tool is the oracle.
- Override is rule-by-rule and must be maintained.
- `import/no-cycle` cost grows with repo size; sub-second today.

## Proposed `.oxlintrc.json` (repo root)

```jsonc
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "nextjs", "jsx-a11y", "typescript", "vitest", "import", "oxc", "unicorn"],
  "env": { "browser": true, "node": true, "es2022": true },
  "ignorePatterns": [".next/**", "coverage/**", "public/**", "spikes/**", "next-env.d.ts"],
  "categories": { "correctness": "error" },
  "rules": {
    // eslint-config-next parity (react recommended + hooks)
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "error",
    "react/jsx-key": "error",
    "react/jsx-no-comment-textnodes": "error",
    "react/jsx-no-duplicate-props": "error",
    "react/jsx-no-undef": "error",
    "react/no-children-prop": "error",
    "react/no-danger-with-children": "error",
    "react/no-direct-mutation-state": "error",
    "react/no-find-dom-node": "error",
    "react/no-is-mounted": "error",
    "react/no-render-return-value": "error",
    "react/no-string-refs": "error",
    "react/no-unsafe": "error",
    "react/require-render-return": "error",
    "react/display-name": "error",
    "react/react-in-jsx-scope": "off",
    "react/no-unescaped-entities": "off",
    "react/no-danger": "error",                       // PLAT-AC-23; allowed only in lib/json-ld.ts (override)
    // React-Compiler + noisy vitest rules from `correctness`: not in baseline
    "react/purity": "off",
    "react/set-state-in-effect": "off",
    "react/immutability": "off",
    "react/refs": "off",
    "react/preserve-manual-memoization": "off",
    "vitest/require-mock-type-parameters": "off",

    // @next/next recommended + core-web-vitals
    "nextjs/google-font-display": "error",
    "nextjs/google-font-preconnect": "error",
    "nextjs/next-script-for-ga": "error",
    "nextjs/no-async-client-component": "error",
    "nextjs/no-before-interactive-script-outside-document": "error",
    "nextjs/no-css-tags": "error",
    "nextjs/no-head-element": "error",
    "nextjs/no-html-link-for-pages": "off",
    "nextjs/no-img-element": "error",
    "nextjs/no-page-custom-font": "error",
    "nextjs/no-styled-jsx-in-document": "error",
    "nextjs/no-sync-scripts": "error",
    "nextjs/no-title-in-document-head": "error",
    "nextjs/no-typos": "error",
    "nextjs/no-unwanted-polyfillio": "error",
    "nextjs/inline-script-id": "error",
    "nextjs/no-assign-module-variable": "error",
    "nextjs/no-document-import-in-page": "error",
    "nextjs/no-duplicate-head": "error",
    "nextjs/no-head-import-in-document": "error",
    "nextjs/no-script-component-in-head": "error",

    // a11y: config-next set + useful extras
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-proptypes": "error",
    "jsx-a11y/aria-unsupported-elements": "error",
    "jsx-a11y/role-has-required-aria-props": "error",
    "jsx-a11y/role-supports-aria-props": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/anchor-has-content": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/heading-has-content": "error",
    "jsx-a11y/html-has-lang": "error",
    "jsx-a11y/iframe-has-title": "error",
    "jsx-a11y/img-redundant-alt": "error",
    "jsx-a11y/interactive-supports-focus": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/no-aria-hidden-on-focusable": "error",
    "jsx-a11y/no-autofocus": "error",
    "jsx-a11y/no-noninteractive-tabindex": "error",
    "jsx-a11y/no-redundant-roles": "error",
    "jsx-a11y/no-static-element-interactions": "error",
    "jsx-a11y/tabindex-no-positive": "error",

    "import/no-anonymous-default-export": "error",
    "import/no-cycle": "error",
    "typescript/no-explicit-any": "error",

    // CG7 / PLAT-AC-16 / NFR-050
    "complexity": ["error", { "max": 10 }],
    "max-lines": ["error", { "max": 400, "skipBlankLines": true, "skipComments": true }],
    "max-lines-per-function": ["error", { "max": 50, "skipBlankLines": true, "skipComments": true }],
    "max-params": ["error", { "max": 4 }],
    "max-depth": ["error", { "max": 3 }]
  },
  "overrides": [
    {
      // RQ-20 a: legacy paths warn, never error. Narrow to terminal/** in U-03.
      "files": ["components/**", "features/**", "widgets/**", "shared/**", "lib/**", "app/**", "stories/**", "vitest.config.ts", "vitest.setup.ts"],
      "rules": {
        "complexity": ["warn", { "max": 10 }],
        "max-lines": ["warn", { "max": 400, "skipBlankLines": true, "skipComments": true }],
        "max-lines-per-function": ["warn", { "max": 50, "skipBlankLines": true, "skipComments": true }],
        "max-params": ["warn", { "max": 4 }],
        "max-depth": ["warn", { "max": 3 }],
        "react/exhaustive-deps": "warn",
        "react/no-danger": "warn",
        "typescript/no-explicit-any": "warn",
        "no-unused-vars": "warn",
        "no-useless-escape": "warn",
        "jsx-a11y/no-static-element-interactions": "warn",
        "jsx-a11y/click-events-have-key-events": "warn",
        "jsx-a11y/prefer-tag-over-role": "warn",
        "jsx-a11y/control-has-associated-label": "warn",
        "jsx-a11y/no-autofocus": "warn",
        "jsx-a11y/heading-has-content": "warn"
      }
    },
    { "files": ["lib/json-ld.ts"], "rules": { "react/no-danger": "off" } },
    {
      // must stay LAST so it wins over the legacy override
      "files": ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "e2e/**"],
      "rules": { "max-lines-per-function": "off", "max-lines": "off" }
    }
  ]
}
```

Oxlint accepts comments in `.json`; strip them if another JSON tool also reads the file.

## npm scripts and dependency

```jsonc
"devDependencies": { "oxlint": "1.95.0" },          // exact pin
"scripts": {
  "lint": "oxlint --max-warnings 262",             // ceiling from this spike; re-measure in U-01, then only lower it
  "lint:fix": "oxlint --fix"
}
```

CG2 gate: `npm run lint` (exit 0, <= 5 s). `--max-warnings` is a project-wide ceiling, so the "0 warnings outside `terminal/`" part of PLAT-AC-14 is best checked by the gate runner from `oxlint -f json` output (count warnings whose path is not under the legacy globs), which also gives the evidence JSON.

## Draft ADR

**ADR-00X: Oxlint replaces ESLint for linting and complexity limits**

- Status: Proposed
- Context: `next lint` with `eslint-config-next` 14 (ESLint 8, EOL) takes ~9 s, `next lint` is removed in Next 16, and CG7 needs complexity limits. PLAT-AC-14/15/16/23 require Oxlint only.
- Decision: Use Oxlint (exact-pinned, 1.95.0 at adoption) with plugins react, nextjs, jsx-a11y, typescript, vitest, import, from one root `.oxlintrc.json`. Mirror all eslint-config-next core-web-vitals rules; enforce CG7 (`complexity` 10, `max-lines` 400, `max-lines-per-function` 50, `max-params` 4, `max-depth` 3) with native rules. Legacy paths get rule-level `warn` overrides with a recorded warning ceiling (RQ-20 a). Type-aware linting (tsgolint) is not enabled; `tsc --noEmit` stays the type gate. Remove ESLint and all `eslint*` deps.
- Consequences: + lint < 1 s (measured 0.6-0.85 s on 226 files); + one dependency instead of ~6; + no custom complexity script; + `import/no-cycle` available. - Loses `react/no-deprecated` (low risk). - Overrides are rule-by-rule and must be maintained. - Oxlint bumps can add findings; handled by exact pin and the gate on upgrade PRs.
- Revisit when: tsconfig is modernised for TS 7 (then evaluate `--type-aware` for promise rules), or the React Compiler is adopted (re-enable `react/purity` and related rules).

## Sources
- npm registry: `npm view oxlint version` (1.95.0), `npm view oxlint-tsgolint version` (7.0.2008)
- Oxlint rule list: `oxlint --rules` (local, 873 rules); https://oxc.rs/docs/guide/usage/linter/rules
- Type-aware linting stable: https://oxc.rs/blog/2026-07-22-type-aware-linting-stable ; https://oxc.rs/docs/guide/usage/linter/type-aware.html ; https://github.com/oxc-project/tsgolint
- eslint-config-next 14.2.30 source (local `node_modules/eslint-config-next/index.js`, `core-web-vitals.js`)
- Baseline: `edd-docs/audit/raw/lint.txt`
