// Shared helpers for the scripts/*.test.mjs files (node:test). No dependencies.
// Rule for this file and every test that uses it: no source folder names as string literals
// (U-01 DoD: folder names live only in scripts/paths.mjs). Derive them from loadPaths().
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const repoFile = (rel) => path.join(repoRoot, rel);
export const readText = (rel) => fs.readFileSync(repoFile(rel), 'utf8');
export const readPkg = () => JSON.parse(readText('package.json'));

// Removes // and /* */ comments, keeps string literals (globs like 'a/**/*.ts' survive).
export function stripComments(src) {
  return src.replace(/("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,
    (m, str) => (str ? m : ''));
}

// JSON with comments and trailing commas (Oxlint accepts both in .oxlintrc.json).
export function readJsonc(rel) {
  assert.ok(fs.existsSync(repoFile(rel)), `${rel} does not exist`);
  return JSON.parse(stripComments(readText(rel)).replace(/,(\s*[}\]])/g, '$1'));
}

// Fails with a clear message instead of letting `node <missing>` exit 1 (which would make a
// "must exit non-zero" test pass vacuously).
export function requireScript(name) {
  assert.ok(fs.existsSync(repoFile(`scripts/${name}`)), `scripts/${name} does not exist yet`);
}

export function runScript(name, args = [], { cwd = repoRoot, timeout = 120000 } = {}) {
  requireScript(name);
  const r = spawnSync(process.execPath, [repoFile(`scripts/${name}`), ...args], { cwd, encoding: 'utf8', timeout });
  return { status: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

export function makeFixture(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'edd-u01-'));
  writeFiles(dir, files);
  return dir;
}

export function writeFiles(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
}

export const removeFixture = (dir) => fs.rmSync(dir, { recursive: true, force: true });

// scripts/paths.mjs is the single source of folder names (U-01 scope 1). Throws if missing.
export async function loadPaths() {
  const file = repoFile('scripts/paths.mjs');
  assert.ok(fs.existsSync(file), 'scripts/paths.mjs does not exist yet');
  const mod = await import(pathToFileURL(file).href);
  assert.ok(mod.paths && typeof mod.paths === 'object', 'scripts/paths.mjs does not export `paths`');
  return mod.paths;
}

const SKIP = new Set(['node_modules', '.git', '.next', '.claude']);
export function walkRepo(dir = repoRoot, rel = '', out = []) {
  for (const ent of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    if (SKIP.has(ent.name)) continue;
    const p = rel ? `${rel}/${ent.name}` : ent.name;
    if (ent.isDirectory()) walkRepo(dir, p, out);
    else out.push(p);
  }
  return out;
}

// ---- U-03: the folder layout comes from the spec text, not from literals in scripts/ ----------
// PLAT-AC-05/06/08/14 name the src/ layout. Tests read it from specs/platform.md so that
// (a) no script hard-codes a folder name (U-01 DoD) and (b) the tests stay the executable spec.
// If the AC wording changes, these parsers fail loudly instead of passing vacuously.
export function specAc(id) {
  const dir = repoFile('specs');
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.md') && n !== 'README.md')) {
    const line = fs.readFileSync(path.join(dir, f), 'utf8').split(/\r?\n/).find((l) => l.startsWith(`- **${id}**`));
    if (line) return line;
  }
  assert.fail(`${id} not found in specs/*.md`);
}

export const backticks = (s) => [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
const trimSlash = (s) => s.replace(/\/+$/, '');

// PLAT-AC-08: "each is one of `a/`, …; `.storybook/` does not exist; `src/` contains only `x/`, … ;
// and `tsconfig.json` maps `@/*` to `./src/*`."
export function specLayout() {
  const clauses = specAc('PLAT-AC-08').split(';');
  assert.equal(clauses.length, 4, 'PLAT-AC-08 wording changed (expected 4 ;-separated clauses); update specLayout()');
  const rootDirs = backticks(clauses[0]).map(trimSlash);
  const [srcTick, ...children] = backticks(clauses[2]);
  const aliasTarget = backticks(clauses[3]).at(-1);
  const src = trimSlash(srcTick ?? '');
  assert.ok(rootDirs.length >= 2 && rootDirs.includes(src), `PLAT-AC-08: cannot read the root dir list (${rootDirs})`);
  assert.ok(children.length >= 2, 'PLAT-AC-08: cannot read the src/ children list');
  assert.match(aliasTarget ?? '', /^\.\/.+\/\*$/, 'PLAT-AC-08: cannot read the @/* alias target');
  return { rootDirs, src, srcChildren: children.map(trimSlash), aliasTarget, storybook: trimSlash(backticks(clauses[1])[0]) };
}

// PLAT-AC-14: "… that override is exactly `src/terminal/**`."
export function specTerminalOverride() {
  const m = specAc('PLAT-AC-14').match(/override is exactly `([^`]+)`/);
  assert.ok(m, 'PLAT-AC-14 wording changed; cannot read the legacy-terminal override glob');
  return m[1];
}

// PLAT-AC-05: "Given `vitest.config.ts` with `@` → `./src`, … over `<glob>` (plus `scripts/` tests)"
export function specVitest() {
  const line = specAc('PLAT-AC-05');
  const alias = line.match(/with `@` → `([^`]+)`/);
  const over = line.match(/over `([^`]+)` \(plus `([^`]+)` tests\)/);
  assert.ok(alias && over, 'PLAT-AC-05 wording changed; cannot read the alias or include glob');
  return { aliasTarget: alias[1], include: over[1], extraRoot: trimSlash(over[2]) };
}

// PLAT-AC-06: "sentinel Tailwind classes used only in `src/components/` and only in `src/terminal/`"
export function specTailwindSentinelDirs() {
  const m = specAc('PLAT-AC-06').match(/used only in `([^`]+)` and only in `([^`]+)`/);
  assert.ok(m, 'PLAT-AC-06 wording changed; cannot read the sentinel folders');
  return [trimSlash(m[1]), trimSlash(m[2])];
}

// The unit start commit (orchestrator writes it at unit start).
export function unitBase(unit) {
  const f = repoFile(`edd-docs/construction/${unit}/base.txt`);
  assert.ok(fs.existsSync(f), `${unit} base.txt missing`);
  return fs.readFileSync(f, 'utf8').split(/\r?\n/)[0].trim();
}

// Top-level source folders that existed at the U-03 base and are not allowed by PLAT-AC-08
// (the old root layout). Derived from git, so no folder name is a literal here.
export function legacyRootDirs() {
  const base = unitBase('U-03');
  const r = spawnSync('git', ['ls-tree', '-d', '--name-only', base], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ls-tree ${base} failed: ${r.stderr}`);
  const { rootDirs } = specLayout();
  const legacy = r.stdout.split(/\r?\n/).filter(Boolean).filter((d) => !d.startsWith('.') && !rootDirs.includes(d));
  assert.ok(legacy.length > 0, 'no legacy root dirs found at the U-03 base (wrong base?)');
  return legacy;
}

// Git-tracked paths (index included, so staged `git mv` results count).
export function gitTracked(cwd = repoRoot) {
  const r = spawnSync('git', ['ls-files', '-z'], { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  assert.equal(r.status, 0, `git ls-files failed: ${r.stderr}`);
  return r.stdout.split('\0').filter(Boolean);
}
