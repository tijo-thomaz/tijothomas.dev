#!/usr/bin/env node
// Gate for CONT-AC-12 (U-06): components hold no copy. Text comes from src/content/*.ts.
// Usage: node scripts/check-literals.mjs [--root <dir>]
// Parses every non-test code file under the components and (site) layers (scripts/paths.mjs) with the
// TypeScript compiler. It reports string literals, template-literal text and JSX text of more than 3
// words. A parser is used, not regexes, so that JSX text next to an {expression} and visible text
// containing "//" are both seen, and comments are never counted (U-06 review #2).
// Skipped: className values (CSS class lists), and exact matches in scripts/literals-allowlist.json
// ({ "allow": [{ "match", "reason" }] }; a reason is required).
// Prints `<file>:<line> "<text>"` per hit. Exit 0 clean, 1 on any hit or a bad allow-list.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { walk, isCode, isTest, inRoots } from './lib/repo-graph.mjs';
import { paths } from './paths.mjs';

const args = process.argv.slice(2);
const i = args.indexOf('--root');
const root = path.resolve(i >= 0 ? args[i + 1] : process.cwd());
const TAG = 'CONT-AC-12';
const MAX_WORDS = 3;
const SCANNED = [paths.layers.components, paths.layers.site];

const allowFile = path.join(root, 'scripts/literals-allowlist.json');
const allow = fs.existsSync(allowFile) ? JSON.parse(fs.readFileSync(allowFile, 'utf8')).allow ?? [] : [];
const badAllow = allow.filter((a) => !(typeof a.match === 'string' && a.match && typeof a.reason === 'string' && a.reason.trim()));
const allowed = new Set(allow.map((a) => a.match));

// A word is a token with two or more letters ("bet365", "Three"), or letters only ("a", "I"). SVG path
// commands mix a single letter with numbers ("M-7.0", "L0.0") and coordinates have no letters, so
// path data is not counted as copy (U-08), but copy with digits in it still is (U-08 review #6).
const words = (s) => s.trim().split(/\s+/).filter((w) => /[A-Za-z][^\sA-Za-z]*[A-Za-z]|^[A-Za-z]+\W*$/.test(w));
const isClassName = (node) => {
  for (let p = node.parent; p; p = p.parent) {
    if (ts.isJsxAttribute(p)) return p.name.getText() === 'className';
    if (ts.isJsxElement(p) || ts.isJsxSelfClosingElement(p) || ts.isSourceFile(p)) return false;
  }
  return false;
};

function literalsOf(file) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const kind = file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const out = [];
  const visit = (node) => {
    let value = null;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) value = node.text;
    else if (ts.isTemplateExpression(node)) value = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(' ');
    else if (ts.isJsxText(node)) value = node.text;
    if (value !== null && words(value).length > MAX_WORDS && !isClassName(node) && !allowed.has(value.trim())) {
      const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
      out.push(`${file}:${line + 1} "${value.trim().replace(/\s+/g, ' ')}"`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

const files = walk(root).filter((f) => isCode(f) && !isTest(f) && inRoots(f, SCANNED));
const hits = [...new Set(files.flatMap(literalsOf))].sort();

for (const a of badAllow) console.log(`  - literals-allowlist.json entry needs a match and a reason: ${JSON.stringify(a)}`);
for (const h of hits) console.log(`  - ${h}`);
const failed = hits.length > 0 || badAllow.length > 0;
console.log(`${failed ? 'FAIL' : 'PASS'} ${TAG} no literal of more than ${MAX_WORDS} words in ${SCANNED.join(', ')} (${files.length} files)`);
process.exit(failed ? 1 : 0);
