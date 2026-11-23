// PLAT-AC-25 (Verify: gate), SBOM part: the gate run writes a CycloneDX sbom.cdx.json to the
// evidence folder. gitleaks and `npm audit signatures` are wired in CG10 (see gates.test.mjs).
// Contract under test: node scripts/sbom.mjs --out <dir>  -> writes <dir>/sbom.cdx.json, exit 0.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { makeFixture, readPkg, removeFixture, runScript } from './lib/test-utils.mjs';

const out = makeFixture({});
after(() => removeFixture(out));

test('PLAT-AC-25 sbom.mjs writes a CycloneDX sbom.cdx.json listing the direct dependencies', () => {
  const r = runScript('sbom.mjs', ['--out', out], { timeout: 180000 });
  assert.equal(r.status, 0, r.out);
  const file = path.join(out, 'sbom.cdx.json');
  assert.ok(fs.existsSync(file), `${file} was not written`);
  const bom = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(bom.bomFormat, 'CycloneDX');
  assert.match(String(bom.specVersion), /^1\.\d+$/);
  const names = new Set((bom.components ?? []).map((c) => (c.group ? `${c.group}/${c.name}` : c.name)));
  const missing = Object.keys(readPkg().dependencies ?? {}).filter((d) => !names.has(d));
  assert.deepEqual(missing, [], 'direct dependencies missing from the SBOM');
});
