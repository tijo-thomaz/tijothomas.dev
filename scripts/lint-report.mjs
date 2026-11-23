#!/usr/bin/env node
// CG2 evidence for PLAT-AC-14: Oxlint exits 0 in <= 5 s, reports 0 warnings outside the
// legacy-terminal override (paths.terminalGlobs) and stays at or below the --max-warnings ceiling
// in package.json. Usage: node scripts/lint-report.mjs [--root <dir>] [--out <dir>]  (writes lint.json)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { cliOptions, writeJson } from './lib/gate-utils.mjs';
import { paths } from './paths.mjs';

const opts = cliOptions();
const root = path.resolve(opts.get('--root', process.cwd()));
const out = opts.get('--out');
const MAX_MS = 5000;

// Minimal glob -> RegExp for the override globs (`**`, `*`, `?`); paths are repo-relative POSIX.
const globRe = (g) => new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  .replace(/\*\*\/?/g, '@GLOBSTAR@').replace(/\*/g, '[^/]*').replace(/\?/g, '[^/]')
  .replace(/@GLOBSTAR@/g, '.*')}$`);
const legacy = paths.terminalGlobs.map(globRe);
const isLegacy = (f) => legacy.some((re) => re.test(f));

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const ceiling = Number((pkg.scripts?.lint ?? '').match(/--max-warnings[ =](\d+)/)?.[1] ?? NaN);
const bin = path.join(root, 'node_modules', 'oxlint', 'bin', 'oxlint');

const started = process.hrtime.bigint();
const r = spawnSync(process.execPath, [bin, '-f', 'json'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const ms = Number(process.hrtime.bigint() - started) / 1e6;
const report = JSON.parse(r.stdout || '{"diagnostics":[]}');
const diags = report.diagnostics ?? [];
const file = (d) => (d.filename ?? '').split(path.sep).join('/');
const errors = diags.filter((d) => d.severity === 'error');
const warnings = diags.filter((d) => d.severity === 'warning');
const outside = warnings.filter((d) => !isLegacy(file(d)));

const checks = [
  ['PLAT-AC-14', `oxlint exits 0 with 0 errors (${errors.length} errors)`, r.status === 0 && errors.length === 0],
  ['PLAT-AC-14', `oxlint wall time <= ${MAX_MS} ms (${ms.toFixed(0)} ms)`, ms <= MAX_MS],
  ['PLAT-AC-14', `0 warnings outside the legacy-terminal override (${outside.length})`, outside.length === 0],
  ['PLAT-AC-14', `warnings ${warnings.length} <= --max-warnings ceiling ${ceiling}`, warnings.length <= ceiling],
  ['PLAT-AC-16', 'CG7 complexity limits: 0 error-level findings', !errors.some((d) => /complexity|max-(lines|params|depth)/.test(d.code ?? ''))],
];
for (const [id, name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${name}`);
for (const d of [...errors, ...outside].slice(0, 20)) console.log(`  - ${file(d)}: ${d.code} ${d.message}`);

if (out) {
  const byRule = {};
  for (const d of warnings) byRule[d.code] = (byRule[d.code] ?? 0) + 1;
  writeJson(path.join(root, out, 'lint.json'), {
    tool: 'oxlint', version: pkg.devDependencies?.oxlint, files: report.number_of_files, wallTimeMs: Math.round(ms),
    errors: errors.length, warnings: warnings.length, warningsOutsideLegacy: outside.length, ceiling, warningsByRule: byRule,
  });
}
process.exit(checks.every(([, , ok]) => ok) ? 0 : 1);
