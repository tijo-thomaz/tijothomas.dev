// U-03 layout tests: PLAT-AC-08 (folder structure, Verify: unit), the static parts of PLAT-AC-05
// (vitest alias + include), PLAT-AC-06 (Tailwind content globs) and PLAT-AC-14 (legacy-terminal
// override), and the U-03 DoD items "temporary globs removed" and "scripts/paths.mjs points to src/".
// Every folder name comes from specs/platform.md (specLayout & co.) or from git at the U-03 base,
// never from a literal (U-01 DoD: no script hard-codes a source folder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  gitTracked, legacyRootDirs, loadPaths, readJsonc, readText, repoFile, specLayout, specTerminalOverride,
  specVitest, stripComments,
} from './lib/test-utils.mjs';

const L = specLayout();
const SRC = L.src;
const under = (p, root) => p === root || p.startsWith(`${root}/`);
const posix = (p) => p.replace(/^\.\//, '');
const quoted = (src) => [...stripComments(src).matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)].map((m) => m[2]);
// Any string literal that names an old root folder as its first path segment (./x/**, x/**, {x,y}/**).
const legacyHits = (strings, legacy) => strings.filter((s) => {
  const first = posix(s).split('/')[0];
  const names = first.startsWith('{') ? first.slice(1, -1).split(',') : [first];
  return names.some((n) => legacy.includes(n));
});

test('PLAT-AC-08 git-tracked top-level dirs (excluding dot-dirs) are only the spec root dirs', () => {
  const dirs = [...new Set(gitTracked().filter((f) => f.includes('/')).map((f) => f.split('/')[0]))]
    .filter((d) => !d.startsWith('.'));
  assert.ok(dirs.length > 0, 'git ls-files found no folders');
  assert.deepEqual(dirs.filter((d) => !L.rootDirs.includes(d)).sort(), []);
});

test('PLAT-AC-08 the pre-U-03 root source folders are gone from the repo root (tracked and on disk)', () => {
  const legacy = legacyRootDirs();
  const tracked = new Set(gitTracked().map((f) => f.split('/')[0]));
  const left = legacy.filter((d) => tracked.has(d) || fs.existsSync(repoFile(d)));
  assert.deepEqual(left, [], `still at the root: ${left.join(', ')}`);
});

test('PLAT-AC-08 the repo root holds no app code: tracked root files are config, docs or lockfiles only', () => {
  const rootFiles = gitTracked().filter((f) => !f.includes('/'));
  const config = /^(\..+|[\w.-]+\.config\.(js|cjs|mjs|ts)|next-env\.d\.ts|vitest\.setup\.ts|[\w.-]+\.(json|ya?ml|md|toml))$/;
  assert.deepEqual(rootFiles.filter((f) => !config.test(f)), []);
});

test('PLAT-AC-08 .storybook/ does not exist', () => {
  assert.equal(fs.existsSync(repoFile(L.storybook)), false);
});

test('PLAT-AC-08 src/ exists and contains only the spec children, each of which exists', () => {
  assert.ok(fs.existsSync(repoFile(SRC)), `${SRC}/ does not exist yet`);
  const entries = fs.readdirSync(repoFile(SRC));
  assert.deepEqual(entries.filter((e) => !L.srcChildren.includes(e)).sort(), [], `unexpected entries in ${SRC}/`);
  const missing = L.srcChildren.filter((c) => !fs.existsSync(repoFile(`${SRC}/${c}`)));
  assert.deepEqual(missing, [], `missing in ${SRC}/`);
});

test('PLAT-AC-08 src/app has the (site) and (terminal)/terminal route groups, each with its own root layout', () => {
  const need = [`${SRC}/app/(site)/layout.tsx`, `${SRC}/app/(site)/page.tsx`, `${SRC}/app/(terminal)/layout.tsx`,
    `${SRC}/app/(terminal)/terminal/page.tsx`];
  assert.deepEqual(need.filter((f) => !fs.existsSync(repoFile(f))), []);
  assert.equal(fs.existsSync(repoFile(`${SRC}/app/layout.tsx`)), false, 'a shared src/app/layout.tsx defeats the two root layouts');
});

test('PLAT-AC-08 tsconfig.json maps @/* to exactly the spec target (./src/*)', () => {
  const paths = readJsonc('tsconfig.json').compilerOptions?.paths ?? {};
  assert.deepEqual(paths['@/*'], [L.aliasTarget]);
});

test('PLAT-AC-05 vitest.config.ts resolves @ to ./src', () => {
  const { aliasTarget } = specVitest();
  const cfg = stripComments(readText('vitest.config.ts'));
  const target = posix(aliasTarget);
  const re = new RegExp(String.raw`['"]@['"]\s*:\s*path\.resolve\(\s*\w+\s*,\s*['"](\./)?${target}/?['"]\s*\)`);
  assert.match(cfg, re, `vitest alias '@' must resolve to ${aliasTarget}`);
});

test('PLAT-AC-05 vitest test.include has the spec src glob and only globs under src/ or scripts/', () => {
  const { include, extraRoot } = specVitest();
  const cfg = stripComments(readText('vitest.config.ts'));
  const body = cfg.match(/\btest\s*:\s*\{[\s\S]*?\binclude\s*:\s*\[([^\]]*)\]/);
  assert.ok(body, 'vitest.config.ts has no test.include array');
  const globs = quoted(body[1]);
  assert.ok(globs.includes(include), `test.include lacks '${include}'`);
  assert.deepEqual(globs.filter((g) => !under(posix(g).split('/')[0], SRC) && !under(posix(g).split('/')[0], extraRoot)), []);
});

test('PLAT-AC-05 DoD vitest.config.ts names no pre-U-03 root folder in any glob (temporary U-00 glob removed)', () => {
  assert.deepEqual(legacyHits(quoted(readText('vitest.config.ts')), legacyRootDirs()), []);
});

test('PLAT-AC-06 tailwind content globs are all under src/ and cover src/app, components, terminal and content', () => {
  const cfg = stripComments(readText('tailwind.config.js'));
  const body = cfg.match(/\bcontent\s*:\s*\[([^\]]*)\]/);
  assert.ok(body, 'tailwind.config.js has no content array');
  const globs = quoted(body[1]).map(posix);
  assert.ok(globs.length > 0, 'tailwind content is empty');
  assert.deepEqual(globs.filter((g) => !g.startsWith(`${SRC}/`)), [], 'content globs outside src/');
  // Unit U-03 scope 2: app, components, terminal and content (lib holds no markup).
  const needed = [`${SRC}/app/`, `${SRC}/components/`, `${SRC}/terminal/`, `${SRC}/content/`];
  assert.deepEqual(needed.filter((p) => !globs.some((g) => g.startsWith(p))), [], 'src folders with no content glob');
});

test('PLAT-AC-06 DoD tailwind.config.js names no pre-U-03 root folder (temporary U-00 globs removed)', () => {
  assert.deepEqual(legacyHits(quoted(readText('tailwind.config.js')), legacyRootDirs()), []);
});

test('PLAT-AC-14 paths.terminalGlobs and the Oxlint legacy-terminal override are exactly src/terminal/**', async () => {
  const want = [specTerminalOverride()];
  const { terminalGlobs } = await loadPaths();
  assert.deepEqual(terminalGlobs, want, 'scripts/paths.mjs terminalGlobs');
  const isWarn = (v) => (Array.isArray(v) ? v[0] : v) === 'warn';
  const legacy = (readJsonc('.oxlintrc.json').overrides ?? []).find((o) => Object.values(o.rules ?? {}).some(isWarn));
  assert.ok(legacy, 'no legacy-terminal override in .oxlintrc.json');
  assert.deepEqual(legacy.files, want, '.oxlintrc.json legacy-terminal files');
});

test('PLAT-AC-14 the Oxlint no-danger exception points into src/ (json-ld lives in src/lib)', () => {
  const overrides = readJsonc('.oxlintrc.json').overrides ?? [];
  const noDanger = overrides.filter((o) => o.rules?.['react/no-danger'] === 'off').flatMap((o) => o.files);
  assert.deepEqual(noDanger.filter((f) => !f.startsWith(`${SRC}/`)), []);
});

test('U-03 scripts/paths.mjs points every entry, source, site and test root into src/', async () => {
  const p = await loadPaths();
  const { include } = specVitest();
  const all = [...p.entries, ...p.srcRoots, ...p.siteRoots, ...p.terminalGlobs, p.aliasProbe];
  assert.deepEqual(all.filter((x) => !under(posix(x).split('/')[0], SRC)), [], 'paths outside src/');
  assert.ok(p.entries.includes(`${SRC}/app`), `paths.entries must include ${SRC}/app`);
  assert.deepEqual(p.testGlobs, [include], 'paths.testGlobs must equal the PLAT-AC-05 glob (temporary glob removed)');
});

test('U-03 scripts/paths.mjs names the PLAT-AC-09 layers site, components, content, lib and terminal, all under src/', async () => {
  const { layers } = await loadPaths();
  assert.ok(layers && typeof layers === 'object', 'scripts/paths.mjs has no `layers` map (needed by check-imports.mjs)');
  // One layer per src/ child except app (whose public part is the (site) group), plus `site`.
  const folders = L.srcChildren.filter((c) => `${SRC}/${c}` !== `${SRC}/app`);
  assert.deepEqual(Object.keys(layers).sort(), [...folders, 'site'].sort());
  assert.equal(layers.site, `${SRC}/app/(site)`);
  assert.deepEqual(folders.filter((k) => layers[k] !== `${SRC}/${k}`), []);
});

test('U-03 every folder named in paths.mjs layers exists on disk', async () => {
  const { layers = {} } = await loadPaths();
  assert.ok(Object.keys(layers).length > 0, 'no layers');
  assert.deepEqual(Object.values(layers).filter((v) => !fs.existsSync(path.join(repoFile(''), v))), []);
});
