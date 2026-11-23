// Plain-Node import graph for the gate scripts (no dependencies).
// Resolves relative and `@/` imports (through <root>/tsconfig.json paths['@/*'][0]), including
// `import()` / `next/dynamic` and `require()`. Bare specifiers are external.
import fs from 'node:fs';
import path from 'node:path';
import { paths } from '../paths.mjs';

export const CODE_EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
export const IGNORED_DIRS = new Set(['node_modules', '.next', '.git', '.claude', 'coverage', 'edd-docs', 'docs', 'public', 'specs']);
// Every directory that may hold app code (from scripts/paths.mjs; U-03 switches it to src/).
export const SOURCE_DIRS = paths.srcRoots;
const ENTRY_ROOTS = paths.entries.map((e) => `${e.replace(/\/+$/, '')}/`);
// Next.js special files that the framework loads by convention.
const NEXT_ENTRY = /^(page|layout|route|not-found|error|global-error|loading|template|default|opengraph-image|twitter-image|icon|apple-icon|sitemap|robots|manifest)\.(ts|tsx|js|jsx|mjs)$/;
const ROOT_ENTRY = /^(middleware|proxy|instrumentation)\.(ts|js)$/;

export const toPosix = (p) => p.split(path.sep).join('/');

export function walk(root, dir = '', out = []) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(ent.name)) continue;
    const rel = dir ? `${dir}/${ent.name}` : ent.name;
    if (ent.isDirectory()) walk(root, rel, out);
    else out.push(rel);
  }
  return out;
}

export const isCode = (f) => CODE_EXT.includes(path.extname(f)) && !f.endsWith('.d.ts');
export const isTest = (f) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(f);
export const isStory = (f) => /\.stories\.[cm]?[jt]sx?$/.test(f) || f.endsWith('.mdx');

// Removes // and /* */ comments but keeps string literals intact (globs like 'a/**/*.ts' survive).
export function stripComments(src) {
  return src.replace(/("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,
    (m, str) => (str ? m : ''));
}

export function specifiers(src) {
  const code = stripComments(src);
  const re = /(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  const out = [];
  for (const m of code.matchAll(re)) out.push(m[1] || m[2] || m[3] || m[4]);
  return out;
}

// The folder that `@/` maps to, read from <root>/tsconfig.json compilerOptions.paths['@/*'][0]
// (e.g. './src/*' -> 'src/'). No tsconfig or no alias: '' (repo root). Cached per root.
const aliasCache = new Map();
export function aliasPrefix(root) {
  if (aliasCache.has(root)) return aliasCache.get(root);
  let prefix = '';
  const file = path.join(root, 'tsconfig.json');
  if (fs.existsSync(file)) {
    const json = stripComments(fs.readFileSync(file, 'utf8')).replace(/,(\s*[}\]])/g, '$1');
    const target = JSON.parse(json).compilerOptions?.paths?.['@/*']?.[0] ?? './*';
    prefix = target.replace(/\*$/, '').replace(/^\.\//, '').replace(/^\.$/, '');
    if (prefix && !prefix.endsWith('/')) prefix += '/';
  }
  aliasCache.set(root, prefix);
  return prefix;
}

export function resolveLocal(root, fromFile, spec) {
  let base;
  if (spec.startsWith('@/')) base = aliasPrefix(root) + spec.slice(2);
  else if (spec.startsWith('.')) base = toPosix(path.join(path.dirname(fromFile), spec));
  else return null; // external
  const candidates = [base, ...CODE_EXT.map((e) => base + e), ...CODE_EXT.map((e) => `${base}/index${e}`)];
  for (const c of candidates) {
    const abs = path.join(root, c);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return toPosix(c);
  }
  return { unresolved: base };
}

// True when a repo-relative POSIX path lies under one of the given root folders.
export const inRoots = (f, roots) => roots.some((r) => f === r || f.startsWith(`${r.replace(/\/+$/, '')}/`));

export function entryPoints(root, files, excludeEntries = []) {
  return files.filter((f) => {
    if (excludeEntries.includes(f)) return false;
    if (ENTRY_ROOTS.some((r) => f.startsWith(r)) && NEXT_ENTRY.test(path.basename(f))) return true;
    return !f.includes('/') && ROOT_ENTRY.test(f);
  });
}

export function buildGraph(root, { excludeEntries = [] } = {}) {
  const files = walk(root);
  const modules = files.filter((f) => isCode(f) && !isTest(f) && !isStory(f) && inRoots(f, SOURCE_DIRS));
  const entries = entryPoints(root, files, excludeEntries);
  const reachable = new Set();
  const stack = [...entries];
  while (stack.length) {
    const f = stack.pop();
    if (reachable.has(f)) continue;
    reachable.add(f);
    if (!isCode(f)) continue;
    const src = fs.readFileSync(path.join(root, f), 'utf8');
    for (const s of specifiers(src)) {
      const r = resolveLocal(root, f, s);
      if (typeof r === 'string' && !reachable.has(r)) stack.push(r);
    }
  }
  const unreachable = modules.filter((m) => !reachable.has(m) && !excludeEntries.includes(m)).sort();
  return { files, modules, entries, reachable, unreachable };
}

// The "UNREACHABLE from any route" block of edd-docs/audit/raw/cycles.txt (58 paths).
export function readListedPaths(file) {
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith('UNREACHABLE'));
  const body = start >= 0 ? lines.slice(start + 1) : lines;
  return body.map((l) => l.replace(/#.*$/, '').trim()).filter((l) => /^[\w.@()[\]-]+\/[\w./@()[\]-]+$/.test(l));
}
