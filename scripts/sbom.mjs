#!/usr/bin/env node
// PLAT-AC-25 (SBOM part): writes a CycloneDX 1.5 JSON SBOM of the installed dependency tree.
// Usage: node scripts/sbom.mjs [--root <dir>] --out <dir>   -> <out>/sbom.cdx.json
// Built from package-lock.json (lockfileVersion 2/3) with no dependencies and no network, because
// `npm sbom` needs npm >= 10 and the repo pins nothing above npm 9. Every lockfile package becomes a
// component (purl, version, sha512 hash from `integrity`, scoped names split into group/name,
// scope `excluded` for dev/devOptional packages and `optional` for optional ones; random serialNumber);
// the root's direct dependencies are listed in `dependencies`.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, dflt) => (args.includes(name) ? args[args.indexOf(name) + 1] : dflt);
const root = path.resolve(opt('--root', process.cwd()));
const outDir = opt('--out');
if (!outDir) {
  console.error('FAIL PLAT-AC-25 sbom: --out <dir> is required');
  process.exit(2);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
if (!lock.packages) {
  console.error(`FAIL PLAT-AC-25 sbom: package-lock.json lockfileVersion ${lock.lockfileVersion} has no "packages" map`);
  process.exit(1);
}

const purl = (name, version) => `pkg:npm/${name.startsWith('@') ? `%40${name.slice(1)}` : name}@${version}`;
const nameOf = (key, meta) => meta.name ?? key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length);
function hashes(integrity) {
  const m = /^sha512-(.+)$/.exec(integrity ?? '');
  return m ? [{ alg: 'SHA-512', content: Buffer.from(m[1], 'base64').toString('hex') }] : undefined;
}

const components = new Map(); // bom-ref -> component (deduplicated by name@version)
for (const [key, meta] of Object.entries(lock.packages)) {
  if (!key || meta.link || !meta.version) continue;
  const name = nameOf(key, meta);
  const ref = purl(name, meta.version);
  if (components.has(ref)) continue;
  components.set(ref, {
    type: 'library',
    'bom-ref': ref,
    ...(name.startsWith('@') ? { group: name.slice(0, name.indexOf('/')), name: name.slice(name.indexOf('/') + 1) } : { name }),
    version: meta.version,
    purl: ref,
    scope: meta.dev || meta.devOptional ? 'excluded' : meta.optional ? 'optional' : 'required',
    ...(meta.license ? { licenses: [{ expression: meta.license }] } : {}),
    ...(hashes(meta.integrity) ? { hashes: hashes(meta.integrity) } : {}),
  });
}

const rootRef = purl(pkg.name, pkg.version ?? '0.0.0');
const direct = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
  .map((d) => lock.packages[`node_modules/${d}`]?.version && purl(d, lock.packages[`node_modules/${d}`].version))
  .filter(Boolean);
const bom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.5',
  serialNumber: `urn:uuid:${crypto.randomUUID()}`,
  version: 1,
  metadata: {
    timestamp: new Date().toISOString(),
    tools: { components: [{ type: 'application', name: 'scripts/sbom.mjs' }] },
    component: { type: 'application', 'bom-ref': rootRef, name: pkg.name, version: pkg.version },
  },
  components: [...components.values()],
  dependencies: [{ ref: rootRef, dependsOn: direct }],
};

fs.mkdirSync(path.resolve(outDir), { recursive: true });
const file = path.join(path.resolve(outDir), 'sbom.cdx.json');
fs.writeFileSync(file, `${JSON.stringify(bom, null, 2)}\n`);
const missing = Object.keys(pkg.dependencies ?? {}).filter((d) => !components.has(purl(d, lock.packages[`node_modules/${d}`]?.version ?? '')));
console.log(`${missing.length ? 'FAIL' : 'PASS'} PLAT-AC-25 sbom.cdx.json written (CycloneDX 1.5, ${components.size} components, ${direct.length} direct)`);
for (const d of missing) console.log(`  - direct dependency missing from lockfile: ${d}`);
console.log(`  ${path.relative(root, file).split(path.sep).join('/')}`);
process.exit(missing.length ? 1 : 0);
