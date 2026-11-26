// PLAT-AC-26 (U-11, Verify: gate): no browser source maps are served from a production build.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeFixture, removeFixture, runScript, readText } from './lib/test-utils.mjs';

const check = (dir) => runScript('check-sourcemaps.mjs', ['--root', dir]);
const withFiles = (files, fn) => {
  const dir = makeFixture(files);
  try { fn(dir); } finally { removeFixture(dir); }
};

test('PLAT-AC-26 check-sourcemaps passes a build with no .map files in .next/static', () => {
  withFiles({ '.next/static/chunks/app.js': 'x', '.next/server/app/page.js.map': '{}' }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS PLAT-AC-26/);
  });
});

test('PLAT-AC-26 check-sourcemaps fails and names every .map file under .next/static', () => {
  withFiles({ '.next/static/chunks/app.js': 'x', '.next/static/chunks/app.js.map': '{}', '.next/static/css/a.css.map': '{}' }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /\.next\/static\/chunks\/app\.js\.map/);
    assert.match(r.out, /\.next\/static\/css\/a\.css\.map/);
  });
});

test('PLAT-AC-26 check-sourcemaps exits 2 when there is no build', () => {
  withFiles({ 'package.json': '{}' }, (dir) => {
    assert.equal(check(dir).status, 2);
  });
});

test('PLAT-AC-26 gates.yml has an enforced gate that runs scripts/check-sourcemaps.mjs', () => {
  const block = readText('gates.yml').split(/\n\s*-\s+id:\s*/).find((b) => /node scripts\/check-sourcemaps\.mjs/.test(b));
  assert.ok(block, 'no gate runs scripts/check-sourcemaps.mjs');
  assert.match(block, /enforce:\s*true/);
});
