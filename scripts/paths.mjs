// Single source of folder names for every gate script (U-01, risk R18).
// All values are POSIX paths or globs relative to the repo root. No other script may hard-code a
// source folder: U-03 moved the app under src/ by editing this file (and the Oxlint override) only.
// scripts/paths.test.mjs checks that every folder named here exists, so no gate passes vacuously.
export const paths = {
  // App Router roots. Route entry points (page, layout, route, ...) are found by convention under these.
  entries: ['src/app'],
  // Folders that hold app source code (import graph, dead-code and unused-dependency scans).
  // srcRoots[0] must be a folder that vitest collects tests from.
  srcRoots: ['src/lib', 'src/app', 'src/components', 'src/content', 'src/terminal'],
  // The legacy terminal: the Oxlint `legacy-terminal` override (warnings allowed) lists exactly these
  // (PLAT-AC-14: exactly src/terminal/** once the restructure is done).
  terminalGlobs: ['src/terminal/**'],
  // vitest `test.include` globs (PLAT-AC-05); check-vitest-config.mjs requires each one in the config.
  testGlobs: ['src/{app,components,terminal,content,lib}/**/*.test.{ts,tsx}'],
  // Folders whose code ships to the site (scan targets for content/PII scans from U-04).
  siteRoots: ['src/app', 'src/components', 'src/content', 'src/lib', 'src/terminal'],
  // A colocated test that imports through the '@/' alias (PLAT-AC-05 probe).
  aliasProbe: 'src/terminal/lib/vitest-alias.test.ts',
  // Import-direction layers for check-imports.mjs (PLAT-AC-09, HOME-AC-04). `site` is the public
  // route group; the rest are the src/ children that hold shared or terminal code.
  layers: {
    site: 'src/app/(site)',
    components: 'src/components',
    content: 'src/content',
    lib: 'src/lib',
    terminal: 'src/terminal',
  },
};
