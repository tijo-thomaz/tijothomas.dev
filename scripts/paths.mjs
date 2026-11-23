// Single source of folder names for every gate script (U-01, risk R18).
// All values are POSIX paths or globs relative to the repo root. No other script may hard-code a
// source folder: U-03 moves the app under src/ by editing this file (and the Oxlint override) only.
// scripts/paths.test.mjs checks that every folder named here exists, so no gate passes vacuously.
export const paths = {
  // App Router roots. Route entry points (page, layout, route, ...) are found by convention under these.
  entries: ['app'],
  // Folders that hold app source code (import graph, dead-code and unused-dependency scans).
  // srcRoots[0] must be a folder that vitest collects tests from.
  srcRoots: ['lib', 'app', 'components', 'features', 'widgets', 'shared'],
  // The legacy terminal: the Oxlint `legacy-terminal` override (warnings allowed) lists exactly these.
  // U-03 replaces them with `src/terminal/**`.
  terminalGlobs: ['app/page.tsx', 'app/api/analytics/route.ts', 'app/api/chat/route.ts', 'components/**', 'features/**', 'widgets/**', 'shared/**', 'lib/**'],
  // vitest `test.include` globs (PLAT-AC-05); check-vitest-config.mjs requires each one in the config.
  testGlobs: [
    '{app,components,terminal,content,lib}/**/*.test.{ts,tsx}',
    '{features,widgets,shared}/**/*.test.{ts,tsx}',
  ],
  // Folders whose code ships to the site (scan targets for content/PII scans from U-04).
  siteRoots: ['app', 'components', 'features', 'widgets', 'shared', 'lib'],
  // A colocated test that imports through the '@/' alias (PLAT-AC-05 probe).
  aliasProbe: 'lib/vitest-alias.test.ts',
};
