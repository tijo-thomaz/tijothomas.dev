#!/usr/bin/env node
// Gate for PLAT-AC-11 (dead code gone) and PLAT-AC-12 (no tests of deleted/dead modules).
// Usage: node scripts/check-unreachable.mjs [--root <dir>] [--exclude-entry <path>]... [--list]
//   --exclude-entry  treat a route entry as already deleted (e.g. app/v2/page.tsx, RQ-16 a)
//   --list           print the unreachable module list only (for edd-docs/construction/U-00/unreachable.txt)
// Optional keep-list: scripts/check-unreachable.keep.txt, one path per line, `# reason` required (R7:
// modules loaded by string). Exit 1 if any check fails.
import fs from 'node:fs';
import path from 'node:path';
import { buildGraph, readListedPaths, isTest, isCode, specifiers, resolveLocal, inRoots, CODE_EXT } from './lib/repo-graph.mjs';
import { paths } from './paths.mjs';

const args = process.argv.slice(2);
const opt = (name) => args.flatMap((a, i) => (a === name ? [args[i + 1]] : []));
const root = path.resolve(opt('--root')[0] ?? process.cwd());
const excludeEntries = opt('--exclude-entry');
const AC11_DIRS = paths.srcRoots;

const keepFile = path.join(root, 'scripts/check-unreachable.keep.txt');
const keepLines = (fs.existsSync(keepFile) ? fs.readFileSync(keepFile, 'utf8').split(/\r?\n/) : [])
  .filter((l) => l.trim() && !l.trim().startsWith('#'));
const keep = new Set(keepLines.map((l) => l.replace(/#.*$/, '').trim()));
// A keep entry without a `# reason` is an unexplained exception.
const keepWithoutReason = keepLines.filter((l) => !/\S\s+#\s*\S/.test(l)).map((l) => `no # reason: ${l.trim()}`);

const graph = buildGraph(root, { excludeEntries });
const unreachable = graph.unreachable.filter((m) => inRoots(m, AC11_DIRS) && !keep.has(m));

// Guard against a vacuous pass: an empty graph (wrong --root, moved app/) reports "0 unreachable".
const emptyGraph = [
  ...(graph.entries.length === 0 ? [`0 route entry points found under ${paths.entries.join(', ')} (wrong --root or paths.mjs out of date?)`] : []),
  ...(graph.modules.length === 0 ? ['0 modules found'] : []),
];

if (args.includes('--list')) {
  if (emptyGraph.length) {
    console.error(`FAIL PLAT-AC-11 import graph is non-empty\n${emptyGraph.map((p) => `  - ${p}`).join('\n')}`);
    process.exit(1);
  }
  console.log(unreachable.join('\n'));
  process.exit(0);
}

let failed = false;
const report = (id, name, problems) => {
  if (problems.length) failed = true;
  console.log(`${problems.length ? 'FAIL' : 'PASS'} ${id} ${name}${problems.length ? ` (${problems.length})` : ''}`);
  for (const p of problems) console.log(`  - ${p}`);
};

report('PLAT-AC-11', 'import graph is non-empty (entry points and modules found)', emptyGraph);
report('PLAT-AC-11', 'every check-unreachable.keep.txt entry gives a # reason', keepWithoutReason);

// PLAT-AC-11 (a): the audited 58 paths, plus the U-00 final list if it exists, are deleted.
const AUDIT_LIST = 'edd-docs/audit/raw/cycles.txt';
const U00_LIST = 'edd-docs/construction/U-00/unreachable.txt';
const auditListed = readListedPaths(path.join(root, AUDIT_LIST));
const u00Listed = readListedPaths(path.join(root, U00_LIST));
// A missing or reformatted list would make the "do not exist" check pass on nothing.
report('PLAT-AC-11', 'unreachable path lists are readable and non-empty', [
  ...(auditListed.length === 0 ? [`${AUDIT_LIST}: 0 paths read (missing or reformatted)`] : []),
  ...(fs.existsSync(path.join(root, U00_LIST)) && u00Listed.length === 0 ? [`${U00_LIST}: exists but 0 paths read`] : []),
]);
const listed = [...auditListed, ...u00Listed];
const stillThere = [...new Set(listed)].filter((p) => fs.existsSync(path.join(root, p)) && !keep.has(p)).sort();
report('PLAT-AC-11', 'listed unreachable paths do not exist', stillThere.map((p) => `exists: ${p}`));

// PLAT-AC-11 (b): the import graph from the Next.js route entries has no unreachable module.
report('PLAT-AC-11', `import graph has 0 unreachable modules in ${AC11_DIRS.join(', ')}/`,
  unreachable.map((m) => `unreachable: ${m}`));

// PLAT-AC-12: no test imports a missing or dead module; no test of a dead module remains.
// Keep-listed modules are kept on purpose, so their tests are not tests of dead code.
const dead = new Set([...graph.unreachable.filter((m) => !keep.has(m)), ...stillThere]);
const testProblems = [];
// App tests (paths.srcRoots) and e2e specs: every import. scripts/*.test.mjs (U-04, U-03 review minor):
// only real top-level import statements, because node:test gate tests embed fixture source as string
// literals whose `import … from './x'` text is not an import of the repo.
const TOP_LEVEL_IMPORT = /^import\s[^'"`]*?['"]([^'"]+)['"]/gm;
const scriptImports = (src) => [...src.matchAll(TOP_LEVEL_IMPORT)].map((m) => m[1]);
const testSets = [
  [graph.files.filter((f) => isTest(f) && isCode(f) && (inRoots(f, AC11_DIRS) || inRoots(f, ['e2e']))), specifiers],
  [graph.files.filter((f) => isTest(f) && isCode(f) && inRoots(f, ['scripts'])), scriptImports],
];
for (const [t, importsOf] of testSets.flatMap(([files, fn]) => files.map((f) => [f, fn]))) {
  const src = fs.readFileSync(path.join(root, t), 'utf8');
  for (const s of importsOf(src)) {
    const r = resolveLocal(root, t, s);
    if (r && typeof r === 'object') testProblems.push(`${t} imports missing module '${s}'`);
    else if (typeof r === 'string' && dead.has(r)) testProblems.push(`${t} imports dead module ${r}`);
  }
  const subjectBase = t.replace(/\.(test|spec)\.[cm]?[jt]sx?$/, '');
  const subject = CODE_EXT.map((e) => subjectBase + e).find((c) => fs.existsSync(path.join(root, c)));
  if (subject && dead.has(subject)) testProblems.push(`${t} tests dead module ${subject}`);
}
report('PLAT-AC-12', 'no test imports or tests a deleted/unreachable module', [...new Set(testProblems)].sort());

console.log(`listed paths: ${listed.length} (${AUDIT_LIST}: ${auditListed.length}, ${U00_LIST}: ${u00Listed.length})`);
console.log(`entries: ${graph.entries.join(', ')}${excludeEntries.length ? ` (excluded: ${excludeEntries.join(', ')})` : ''}`);
console.log(`modules: ${graph.modules.length}, reachable: ${graph.modules.filter((m) => graph.reachable.has(m)).length}, unreachable: ${graph.unreachable.length}`);
process.exit(failed ? 1 : 0);
