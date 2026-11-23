#!/usr/bin/env node
// CG10 signatures gate (PLAT-AC-25): `npm audit signatures`, with one narrow, documented exception.
// Usage: node scripts/audit-signatures.mjs [--root <dir>] -- npm audit signatures
//   (the command after `--` is what runs; it must be `npm audit signatures [flags]`)
// 1. Runs it. Exit 0 -> PASS.
// 2. Otherwise PASS-with-exception only if the sole error is FETCH_ERROR "invalid json response body"
//    on the attestations URL of a package listed in scripts/audit-signatures.exceptions.json. Then:
//    a. that package's registry signature is verified here against the npm registry public keys
//       (ECDSA over `<name>@<version>:<integrity>`), and its installed integrity must match the lockfile;
//    b. the package folder is moved aside and `npm audit signatures` must pass for everything else
//       (signatures and attestations); the folder is always moved back.
// Any other error, an exception that is no longer installed, or any failed step -> FAIL (exit 1).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { cliOptions } from './lib/gate-utils.mjs';

const root = path.resolve(cliOptions().get('--root', process.cwd()));
const REGISTRY = 'https://registry.npmjs.org';
const exceptions = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'audit-signatures.exceptions.json'), 'utf8'));
const ASIDE = '.audit-signatures-omitted';
const argv = process.argv.slice(2);
const cmd = argv.includes('--') ? argv.slice(argv.indexOf('--') + 1).join(' ') : 'npm audit signatures';
if (!/^npm audit signatures(\s|$)/.test(cmd)) {
  console.log(`FAIL PLAT-AC-25 audit-signatures only wraps "npm audit signatures", got: ${cmd}`);
  process.exit(2);
}

const npmAudit = () => {
  const r = spawnSync(cmd, { cwd: root, shell: true, encoding: 'utf8' });
  return { status: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
};
const splitSpec = (spec) => {
  const at = spec.lastIndexOf('@');
  return { name: spec.slice(0, at), version: spec.slice(at + 1) };
};
// npm escapes only the scope slash: /attestations/@scope%2fname@version
const attestationUrl = (spec) => `${REGISTRY}/-/npm/v1/attestations/${splitSpec(spec).name.replace('/', '%2f')}@${splitSpec(spec).version}`;
const errorLines = (out) => out.split(/\r?\n/).filter((l) => /^npm (error|ERR!)/.test(l) && !/complete log/.test(l));

// The exception that explains every error line, or null.
function matchException(out) {
  const lines = errorLines(out).join('\n');
  if (!/code FETCH_ERROR/.test(lines) || !/invalid json response body/.test(lines)) return null;
  const urls = [...lines.matchAll(/invalid json response body at (\S+)/g)].map((m) => m[1].toLowerCase());
  const hit = exceptions.find((e) => urls.length === 1 && urls[0] === attestationUrl(e.spec).toLowerCase());
  return hit ?? null;
}

async function verifyRegistrySignature(spec) {
  const { name, version } = splitSpec(spec);
  const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  const installed = lock.packages?.[`node_modules/${name}`];
  if (installed?.version !== version) return [`${spec} is not the installed version (lockfile: ${installed?.version ?? 'absent'}); remove the stale exception`];
  const [keys, manifest] = await Promise.all([
    fetch(`${REGISTRY}/-/npm/v1/keys`).then((r) => r.json()),
    fetch(`${REGISTRY}/${encodeURIComponent(name)}/${version}`).then((r) => r.json()),
  ]);
  const { integrity, signatures = [] } = manifest.dist ?? {};
  if (integrity !== installed.integrity) return [`${spec}: registry integrity differs from the lockfile`];
  const ok = signatures.some((s) => {
    const k = keys.keys?.find((key) => key.keyid === s.keyid);
    return k && crypto.verify('sha256', Buffer.from(`${name}@${version}:${integrity}`),
      { key: Buffer.from(k.key, 'base64'), format: 'der', type: 'spki' }, Buffer.from(s.sig, 'base64'));
  });
  return ok ? [] : [`${spec}: no valid registry signature`];
}

function auditWithout(spec) {
  const dir = path.join(root, 'node_modules', splitSpec(spec).name);
  const aside = `${dir}${ASIDE}`;
  if (fs.existsSync(aside) && !fs.existsSync(dir)) fs.renameSync(aside, dir); // recover an interrupted run
  fs.renameSync(dir, aside);
  try {
    return npmAudit();
  } finally {
    fs.renameSync(aside, dir);
  }
}

const first = npmAudit();
if (first.status === 0) {
  console.log('PASS PLAT-AC-25 npm audit signatures exits 0');
  process.exit(0);
}
const exception = matchException(first.out);
if (!exception) {
  console.log(`FAIL PLAT-AC-25 npm audit signatures exit ${first.status} (not a listed registry exception)`);
  console.log(errorLines(first.out).slice(0, 10).join('\n'));
  process.exit(1);
}
const problems = await verifyRegistrySignature(exception.spec);
const rest = problems.length ? null : auditWithout(exception.spec);
if (rest && rest.status !== 0) problems.push(`npm audit signatures without ${exception.spec} exit ${rest.status}`, ...errorLines(rest.out).slice(0, 10));
if (problems.length) {
  console.log(`FAIL PLAT-AC-25 npm audit signatures (exception ${exception.spec} could not be verified)`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log(`PASS PLAT-AC-25 npm audit signatures with 1 exception: ${exception.spec}`);
console.log(`  - attestation fetch skipped (${exception.reason}); since ${exception.since}, re-check by ${exception.recheck}`);
console.log(`  - ${exception.spec}: registry signature verified against ${REGISTRY}/-/npm/v1/keys; integrity matches the lockfile`);
console.log(`  - all other packages: ${rest.out.split(/\r?\n/).filter((l) => /verified|attestation/i.test(l)).slice(0, 3).join(' | ').trim()}`);
