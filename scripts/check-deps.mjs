#!/usr/bin/env node
// Gate for PLAT-AC-13: every dependency in package.json is used.
// Usage: node scripts/check-deps.mjs [--root <dir>]   -> exit 1 and names each unused dependency.
// A dependency counts as used when any of these holds:
//   1. a source/config/test/script file imports, requires or `/// <reference types>` it (or a subpath);
//   2. its bin is called by a package.json script;
//   3. a root config file names it as a quoted string or a postcss/vitest key (e.g. 'jsdom', tailwindcss: {});
//   4. ESLint config uses it (`eslint-config-<x>` via extends "<x>", `eslint-plugin-<x>` via "plugin:<x>/");
//   5. it is a non-optional peer dependency of another used dependency (react-dom for next, postcss ...);
//   6. `@types/<x>` when <x> is used; `@types/node` when typescript is used;
//   7. `@vitest/coverage-<x>` when a script passes --coverage or vitest config sets coverage.
import fs from 'node:fs';
import path from 'node:path';
import { walk, isCode, specifiers } from './lib/repo-graph.mjs';

const args = process.argv.slice(2);
const root = path.resolve(args.includes('--root') ? args[args.indexOf('--root') + 1] : process.cwd());
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).sort();
const scripts = Object.values(pkg.scripts ?? {}).join('\n');

const pkgName = (spec) => (spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
const readPkg = (name) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, 'node_modules', name, 'package.json'), 'utf8')); } catch { return {}; }
};

// 1. imports from every code file outside ignored dirs (includes root configs, *.d.ts, tests, scripts, e2e)
const files = walk(root).filter((f) => isCode(f) || f.endsWith('.d.ts'));
const used = new Map(); // name -> reason
const mark = (name, why) => { if (deps.includes(name) && !used.has(name)) used.set(name, why); };
for (const f of files) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  for (const s of specifiers(src)) if (!s.startsWith('.') && !s.startsWith('@/') && !s.startsWith('node:')) mark(pkgName(s), `imported by ${f}`);
  for (const m of src.matchAll(/\/\/\/\s*<reference\s+types=["']([^"']+)["']/g)) mark(pkgName(m[1]), `referenced by ${f}`);
}

// 2. bins called from package.json scripts
for (const d of deps) {
  const bin = readPkg(d).bin;
  const bins = typeof bin === 'string' ? [d.split('/').pop()] : Object.keys(bin ?? {});
  if (bins.some((b) => new RegExp(`(^|[\\s;&|'"])${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`, 'm').test(scripts))) mark(d, 'bin used in package.json scripts');
}

// 3. + 4. root config files
const configFiles = fs.readdirSync(root).filter((f) => /^(\.?[\w-]+\.config\.[cm]?[jt]s|\.eslintrc(\.\w+)?|\.oxlintrc\.json|\.babelrc)$/.test(f));
const configText = configFiles.map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const eslintText = [configText, JSON.stringify(pkg.eslintConfig ?? '')].join('\n');
for (const d of deps) {
  const q = d.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  if (new RegExp(`['"]${q}['"]|^\\s*${q}\\s*:`, 'm').test(configText)) mark(d, 'named in a root config file');
  const cfg = d.match(/^eslint-config-(.+)$/);
  if (cfg && new RegExp(`["']${cfg[1]}(/[^"']*)?["']`).test(eslintText)) mark(d, 'extended by ESLint config');
  const plug = d.match(/^eslint-plugin-(.+)$/);
  if (plug && new RegExp(`plugin:${plug[1]}/|["']${plug[1]}["']`).test(eslintText)) mark(d, 'ESLint plugin in config');
  if (/^@vitest\/coverage-/.test(d) && (/--coverage/.test(scripts) || /coverage\s*:/.test(configText))) mark(d, 'vitest coverage provider');
}

// 5. + 6. peers and @types, iterate to a fixed point
let changed = true;
while (changed) {
  changed = false;
  const before = used.size;
  for (const u of [...used.keys()]) {
    const p = readPkg(u);
    const optional = p.peerDependenciesMeta ?? {};
    for (const peer of Object.keys(p.peerDependencies ?? {})) if (!optional[peer]?.optional) mark(peer, `peer of ${u}`);
  }
  for (const d of deps.filter((x) => x.startsWith('@types/'))) {
    const base = d.slice(7).replace(/^(.+)__(.+)$/, '@$1/$2');
    if (used.has(base) || (base === 'node' && used.has('typescript'))) mark(d, `types for ${base}`);
  }
  changed = used.size !== before;
}

const unused = deps.filter((d) => !used.has(d));
console.log(`${unused.length ? 'FAIL' : 'PASS'} PLAT-AC-13 package.json has 0 unused dependencies${unused.length ? ` (${unused.length})` : ''}`);
for (const d of unused) console.log(`  - unused: ${d}`);
if (args.includes('--verbose')) for (const [d, why] of used) console.log(`  used: ${d} (${why})`);
process.exit(unused.length ? 1 : 0);
