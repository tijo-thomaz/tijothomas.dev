#!/usr/bin/env node
// R17 / PLAT-AC-06 evidence: compares the class selectors of two generated CSS files (base vs HEAD
// Tailwind build) and fails when a class removed at HEAD is still used by app code. Generalised from
// edd-docs/construction/U-00/smoke/cssdiff.mjs. The builds themselves are made in scratch worktrees
// (test-plan section 4), never in the repo's .next/.
// Usage: node scripts/css-diff.mjs --base <base.css> --head <head.css> [--root <dir>] [--out <file>]
//   exit 0 = 0 removed classes are used, 1 = some are, 2 = missing input or a CSS file with 0 classes.
// "Used" = whole-token match in a non-test .ts/.tsx/.js/.jsx file under scripts/paths.mjs srcRoots.
import fs from 'node:fs';
import path from 'node:path';
import { cliOptions } from './lib/gate-utils.mjs';
import { isTest, walk } from './lib/repo-graph.mjs';
import { paths } from './paths.mjs';

const opts = cliOptions();
const root = path.resolve(opts.get('--root', process.cwd()));
const baseFile = opts.get('--base');
const headFile = opts.get('--head');
const outFile = opts.get('--out');

function die(message) {
  console.log(`ERROR ${message}`);
  process.exit(2);
}

// CSS identifier escapes: `\:` -> `:`, `\32 xl` -> `2xl` (hex code point plus one optional space).
const unescape = (s) => s.replace(/\\([0-9a-fA-F]{1,6})\s?|\\(.)/g,
  (_, hex, ch) => (hex ? String.fromCodePoint(parseInt(hex, 16)) : ch));
const CLASS_RE = /\.((?:\\[0-9a-fA-F]{1,6}\s?|\\.|[\w-]|[\u0080-\uffff])+)/g;

// Class names from selectors only. A selector (or at-rule prelude) is the text right before `{`;
// text that ends at `;` or `}` is a declaration and is never read. At-rule preludes are skipped.
export function cssClasses(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const found = new Set();
  let buf = '';
  const addFrom = (prelude) => {
    if (!prelude.startsWith('@')) for (const m of prelude.matchAll(CLASS_RE)) found.add(unescape(m[1]));
  };
  for (const ch of text) {
    if (ch === '{') {
      addFrom(buf.trim());
      buf = '';
    } else if (ch === '}' || ch === ';') buf = '';
    else buf += ch;
  }
  return found;
}

function readCss(file) {
  if (!file) die('usage: --base <css> --head <css> [--root <dir>] [--out <file>]');
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) die(`CSS file not found: ${file}`);
  const classes = cssClasses(fs.readFileSync(abs, 'utf8'));
  if (classes.size === 0) die(`${file} has 0 class selectors (empty or failed build?)`);
  return classes;
}

const base = readCss(baseFile);
const head = readCss(headFile);

const SOURCE = /\.(ts|tsx|js|jsx)$/;
const inRoots = (f) => paths.srcRoots.some((r) => f === r || f.startsWith(`${r}/`));
const source = walk(root).filter((f) => SOURCE.test(f) && !isTest(f) && inRoots(f))
  .map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const B = String.raw`[\s"'\x60{}]`; // token boundary: whitespace, quotes, backtick, braces
const used = (c) => new RegExp(`(^|${B})${esc(c)}(?=$|${B})`, 'm').test(source);

const removed = [...base].filter((c) => !head.has(c)).sort();
const added = [...head].filter((c) => !base.has(c)).sort();
const missingUsed = removed.filter(used);
const list = (xs) => (xs.length ? xs.join(' ') : '(none)');
const report = [
  `css-diff base=${path.basename(baseFile)} head=${path.basename(headFile)}`,
  `base ${base.size} HEAD ${head.size} | removed ${removed.length}, removed-but-used ${missingUsed.length} | added ${added.length}`,
  `MISSING-USED: ${list(missingUsed)}`,
  `ADDED: ${list(added)}`,
  `${missingUsed.length ? 'FAIL' : 'PASS'} PLAT-AC-06 css-diff ${missingUsed.length} missing`,
].join('\n');

console.log(report);
if (outFile) {
  const abs = path.resolve(outFile);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${report}\n`);
}
process.exit(missingUsed.length ? 1 : 0);
