#!/usr/bin/env node
// Gate for PLAT-AC-09 (import direction, no cycles, content is types only) and HOME-AC-04 (the
// (site) graph reaches neither the terminal nor Supabase). Part of CG9, next to check-unreachable.
// Usage: node scripts/check-imports.mjs [--root <dir>]   exit 0 = all pass, 1 = any FAIL
// Layers come from scripts/paths.mjs `layers`; `@/` resolves through <root>/tsconfig.json.
// Every edge counts: static imports, `export … from`, `import()` (also inside next/dynamic) and
// `require()`. Type-only imports count for the direction rules too. Test files are not app code.
import fs from 'node:fs';
import path from 'node:path';
import { cliOptions } from './lib/gate-utils.mjs';
import { isCode, isRouteFile, isStory, isTest, resolveLocal, stripComments, walk } from './lib/repo-graph.mjs';
import { paths } from './paths.mjs';

const root = path.resolve(cliOptions().get('--root', process.cwd()));
const L = paths.layers;
const { site, components, content, lib, terminal } = L; // layer folders (keys never spelled as strings)
const under = (f, dir) => f === dir || f.startsWith(`${dir}/`);
// The folder of the most specific layer a file belongs to (site lies inside the app folder), or null.
const layerOf = (f) => Object.values(L).filter((dir) => under(f, dir)).sort((a, b) => b.length - a.length)[0] ?? null;

// { spec, typeOnly } for every import-like statement in a module.
const EDGE_RE = /\b(import|export)\s+(type\s+)?[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\s*['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)|\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
function edgesOf(src) {
  return [...stripComments(src).matchAll(EDGE_RE)].map((m) => ({
    spec: m[3] || m[4] || m[5] || m[6],
    typeOnly: Boolean(m[2]),
  }));
}

const inSrc = (f) => paths.srcRoots.some((r) => under(f, r));
const modules = walk(root).filter((f) => isCode(f) && !isTest(f) && !isStory(f) && inSrc(f));

// graph: file -> [{ to (local path) | ext (bare specifier), typeOnly }]
const graph = new Map();
for (const f of modules) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  graph.set(f, edgesOf(src).map(({ spec, typeOnly }) => {
    const r = resolveLocal(root, f, spec);
    return typeof r === 'string' ? { to: r, typeOnly } : { ext: r === null ? spec : null, typeOnly };
  }).filter((e) => e.to || e.ext));
}

let failed = false;
function report(id, name, problems) {
  if (problems.length) failed = true;
  console.log(`${problems.length ? 'FAIL' : 'PASS'} ${id} ${name}${problems.length ? ` (${problems.length})` : ''}`);
  for (const p of problems) console.log(`  - ${p}`);
}

const localEdges = (f) => (graph.get(f) ?? []).filter((e) => e.to);
const edgeList = (pred) => modules.flatMap((f) => localEdges(f).filter((e) => pred(f, e)).map((e) => `${f} -> ${e.to}`));

report('PLAT-AC-09', 'import graph is non-empty', modules.length ? [] : ['0 modules found (wrong --root or paths.mjs out of date?)']);

// PLAT-AC-09: cycles (Tarjan's strongly connected components over local edges).
function cycles() {
  const index = new Map();
  const low = new Map();
  const onStack = new Set();
  const stack = [];
  const found = [];
  let next = 0;
  const visit = (v) => {
    index.set(v, next); low.set(v, next); next += 1;
    stack.push(v); onStack.add(v);
    for (const { to } of localEdges(v)) {
      if (!graph.has(to)) continue;
      if (!index.has(to)) { visit(to); low.set(v, Math.min(low.get(v), low.get(to))); }
      else if (onStack.has(to)) low.set(v, Math.min(low.get(v), index.get(to)));
    }
    if (low.get(v) !== index.get(v)) return;
    const scc = [];
    let w;
    do { w = stack.pop(); onStack.delete(w); scc.push(w); } while (w !== v);
    const selfLoop = localEdges(v).some((e) => e.to === v);
    if (scc.length > 1 || selfLoop) found.push(scc.sort());
  };
  for (const m of modules) if (!index.has(m)) visit(m);
  return found.map((scc) => `cycle: ${scc.join(' -> ')} -> ${scc[0]}`);
}
report('PLAT-AC-09', 'import graph has 0 cycles', cycles());

const shared = [components, content, lib];
report('PLAT-AC-09', `${shared.join(', ')} never import ${terminal}`,
  edgeList((f, e) => shared.includes(layerOf(f)) && layerOf(e.to) === terminal));
report('PLAT-AC-09', `${terminal} never imports ${components} or ${content}`,
  edgeList((f, e) => layerOf(f) === terminal && [components, content].includes(layerOf(e.to))));
report('PLAT-AC-09', `${content} has type-only imports`, modules.filter((f) => layerOf(f) === content)
  .flatMap((f) => (graph.get(f) ?? []).filter((e) => !e.typeOnly).map((e) => `${f} -> ${e.to ?? e.ext} (value import)`)));

// HOME-AC-04: closure of the (site) route files.
const routes = modules.filter((f) => layerOf(f) === site && isRouteFile(f));
const closure = new Map(); // module -> the route it was reached from
function reach(route) {
  const todo = [route];
  while (todo.length) {
    const f = todo.pop();
    if (closure.has(f)) continue;
    closure.set(f, route);
    todo.push(...localEdges(f).map((e) => e.to).filter((to) => !closure.has(to)));
  }
}
routes.forEach(reach);
report('HOME-AC-04', `(site) route files found under ${site}`, routes.length ? [] : [`0 route files under ${site}`]);
report('HOME-AC-04', `the (site) graph reaches nothing under ${terminal}`,
  [...closure].filter(([f]) => layerOf(f) === terminal).map(([f, r]) => `${r} reaches ${f}`));
report('HOME-AC-04', 'the (site) graph reaches no Supabase import',
  [...closure].flatMap(([f, r]) => (graph.get(f) ?? []).filter((e) => (e.ext ?? '').startsWith('@supabase/'))
    .map((e) => `${r} reaches ${f} -> ${e.ext}`)));

console.log(`modules: ${modules.length}, site routes: ${routes.length}, site closure: ${closure.size}`);
process.exit(failed ? 1 : 0);
