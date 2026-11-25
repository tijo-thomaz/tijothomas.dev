#!/usr/bin/env node
// Gate for PLAT-AC-19: every AC in specs/*.md is cited by a test or a gate check, every cited ID
// exists, and specs/pending.txt lists only real ACs that nothing cites yet.
// Usage: node scripts/spec-check.mjs [--root <dir>]   (default root: cwd)
//   ACs:       bullets `- **<P>-AC-NN**` in specs/*.md (README.md skipped);
//              retired: `- ~~**<P>-AC-NN**…~~` (no citation needed; citing one is not "unknown").
//   Citations: test titles (test/it/describe) in *.test.* / *.spec.* files and e2e/, and string
//              literals (check names) in the other scripts/**/*.mjs. Comments never count, nor does
//              any text in specs/, edd-docs/ or docs/.
// Exit 1 and name the ID on: uncited non-pending AC, unknown cited ID, pending ID that is cited or
// is not an AC, or 0 ACs found (no vacuous pass).
import fs from 'node:fs';
import path from 'node:path';
import { stripComments } from './lib/repo-graph.mjs';

const args = process.argv.slice(2);
const root = path.resolve(args.includes('--root') ? args[args.indexOf('--root') + 1] : process.cwd());

const SPEC_DIR = 'specs';
const PENDING = `${SPEC_DIR}/pending.txt`;
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', '.claude', 'coverage', SPEC_DIR, 'edd-docs', 'docs',
  'playwright-report', 'test-results']);
const ID = String.raw`[A-Z][A-Z0-9]*-AC-\d{2,3}`;
const AC_LINE = new RegExp(String.raw`^\s*-\s+\*\*(${ID})\*\*`, 'gm');
const RETIRED_LINE = new RegExp(String.raw`^\s*-\s+~~\*\*(${ID})\*\*`, 'gm');
const CITE = new RegExp(String.raw`\b${ID}\b`, 'g');

const isCitingFile = (rel) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(rel)
  || rel.startsWith('e2e/')
  || (rel.startsWith('scripts/') && rel.endsWith('.mjs'));

function walk(dir = '', out = []) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const rel = dir ? `${dir}/${ent.name}` : ent.name;
    if (ent.isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

function readSpecs() {
  const dir = path.join(root, SPEC_DIR);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md') : [];
  const active = new Set();
  const retired = new Set();
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of text.matchAll(AC_LINE)) active.add(m[1]);
    for (const m of text.matchAll(RETIRED_LINE)) retired.add(m[1]);
  }
  return { files, active, retired };
}

// Comments never cite. In test files (*.test.*, *.spec.*, e2e/) only the title (first string
// argument) of test()/it()/describe() and their modifiers counts. In gate scripts only string
// literals count (check names such as `PASS PLAT-AC-18 …` or report('PLAT-AC-11', …)).
const STRING = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/g;
const TITLE = /(?<![.\w$])(?:test|it|describe)(?:\.(?:only|skip|todo|each|concurrent|serial|fixme|fail))*\s*\(\s*("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)/g;
const isTestFile = (rel) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(rel) || rel.startsWith('e2e/');

function citingText(rel) {
  const code = stripComments(fs.readFileSync(path.join(root, rel), 'utf8'));
  return isTestFile(rel) ? [...code.matchAll(TITLE)].map((m) => m[1]) : code.match(STRING) ?? [];
}

function readCitations() {
  const cited = new Map(); // id -> first file citing it
  const files = walk().filter(isCitingFile);
  for (const f of files) {
    const ids = citingText(f).flatMap((text) => text.match(CITE) ?? []);
    for (const x of ids) if (!cited.has(x)) cited.set(x, f);
  }
  return { files, cited };
}

function readPending() {
  const file = path.join(root, PENDING);
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map((l) => l.replace(/#.*$/, '').trim()).filter(Boolean);
}

const specs = readSpecs();
const { files: citingFiles, cited } = readCitations();
const pending = readPending();
const pendingSet = new Set(pending);
const known = (id) => specs.active.has(id) || specs.retired.has(id);

const checks = [
  ['specs/*.md define at least one AC', specs.active.size ? [] : [`0 ACs found in ${specs.files.length} spec file(s) under ${SPEC_DIR}/`]],
  ['every AC is cited by a test or gate check, or listed in pending.txt',
    [...specs.active].filter((id) => !cited.has(id) && !pendingSet.has(id)).map((id) => `uncited: ${id}`)],
  ['every cited AC ID exists in specs/',
    [...cited].filter(([id]) => !known(id)).map(([id, f]) => `unknown: ${id} (cited in ${f})`)],
  ['pending.txt lists only ACs that exist and are not cited yet', pending.flatMap((id) => {
    if (!specs.active.has(id)) return [`pending entry is not an AC in ${SPEC_DIR}/: ${id}`];
    return cited.has(id) ? [`stale pending entry (cited in ${cited.get(id)}): ${id}`] : [];
  })],
];

let failed = false;
for (const [name, problems] of checks) {
  if (problems.length) failed = true;
  console.log(`${problems.length ? 'FAIL' : 'PASS'} PLAT-AC-19 ${name}${problems.length ? ` (${problems.length})` : ''}`);
  for (const p of problems.sort()) console.log(`  - ${p}`);
}
const citedActive = [...specs.active].filter((id) => cited.has(id)).length;
console.log(`ACs: ${specs.active.size} active, ${specs.retired.size} retired; cited: ${citedActive}; pending: ${pending.length}; citing files scanned: ${citingFiles.length}`);
process.exit(failed ? 1 : 0);
