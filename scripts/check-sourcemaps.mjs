#!/usr/bin/env node
// Gate for PLAT-AC-26 (U-11, SEC-08, threat-model T-04): a production build serves no browser source
// maps. Lists every *.map file under .next/static (the only build folder served to browsers).
// Usage: node scripts/check-sourcemaps.mjs [--root <dir>]
// Exit 0 clean, 1 if any .map file is found (each is named), 2 when there is no build.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const i = args.indexOf('--root');
const root = path.resolve(i >= 0 ? args[i + 1] : process.cwd());
const TAG = 'PLAT-AC-26 .next/static has 0 source map files';
const STATIC = path.join(root, '.next', 'static');

if (!fs.existsSync(STATIC)) {
  console.log(`FAIL ${TAG}: no build (.next/static is missing; build first) exit 2`);
  process.exit(2);
}

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
const files = walk(STATIC);
const maps = files.filter((f) => f.endsWith('.map')).map((f) => path.relative(root, f).split(path.sep).join('/'));

for (const m of maps.sort()) console.log(`  - ${m}`);
console.log(maps.length ? `FAIL ${TAG} (${maps.length})` : `PASS ${TAG} (${files.length} files)`);
process.exit(maps.length ? 1 : 0);
