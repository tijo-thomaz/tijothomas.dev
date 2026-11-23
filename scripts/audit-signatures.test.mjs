// PLAT-AC-25: the CG10 signatures gate wraps `npm audit signatures` with a narrow, dated exception list.
// No network here: the full run is the CG10_signatures gate itself.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readText, runScript } from './lib/test-utils.mjs';

test('PLAT-AC-25 audit-signatures refuses to wrap anything but npm audit signatures', () => {
  const r = runScript('audit-signatures.mjs', ['--', 'npm', 'audit']);
  assert.equal(r.status, 2, r.out);
  assert.match(r.out, /FAIL PLAT-AC-25/);
});

test('PLAT-AC-25 every signatures exception names one exact package version, a reason, a start date and a re-check unit', () => {
  const list = JSON.parse(readText('scripts/audit-signatures.exceptions.json'));
  assert.ok(Array.isArray(list));
  const bad = list.filter((e) => !/^(@[\w.-]+\/)?[\w.-]+@\d+\.\d+\.\d+$/.test(e.spec ?? '') || !e.reason
    || !/^\d{4}-\d{2}-\d{2}$/.test(e.since ?? '') || !/^U-\d{2}$/.test(e.recheck ?? ''));
  assert.deepEqual(bad, []);
});

test('PLAT-AC-25 CG10_signatures runs the wrapper around npm audit signatures', () => {
  assert.match(readText('gates.yml'), /node scripts\/audit-signatures\.mjs -- npm audit signatures/);
});
