import fs from 'node:fs';
import path from 'node:path';

const [, , baseCss, headCss, root, verbose] = process.argv;
const classes = (f) => {
  const s = new Set();
  const css = fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/\.((?:\\.|[A-Za-z0-9_-])+)/g)) s.add(m[1].replace(/\\(.)/g, '$1'));
  return s;
};
const b = classes(baseCss);
const h = classes(headCss);
const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\./.test(e.name)) files.push(p);
  }
};
for (const d of ['app', 'components', 'features', 'widgets', 'shared', 'lib']) {
  if (fs.existsSync(path.join(root, d))) walk(path.join(root, d));
}
const src = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const used = (c) => new RegExp('(^|[\\s"\'`{])' + esc(c) + '(?=$|[\\s"\'`}])', 'm').test(src);
const missing = [...b].filter((c) => !h.has(c));
const added = [...h].filter((c) => !b.has(c));
const missingUsed = missing.filter(used);
console.log(
  `base ${b.size} HEAD ${h.size} | removed ${missing.length}, removed-but-used-by-reachable ${missingUsed.length} | added ${added.length}`,
);
if (verbose === '-v') {
  console.log('MISSING-USED:', missingUsed.join(' ') || '(none)');
  console.log('ADDED:', added.join(' '));
}
