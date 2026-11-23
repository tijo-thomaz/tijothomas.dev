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
