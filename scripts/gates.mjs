#!/usr/bin/env node
// EDD gate runner: runs the gates listed in <root>/gates.yml and records one evidence JSON per gate.
// Usage: node scripts/gates.mjs [--root <dir>] [--unit <U-NN>] [--base <ref>] [--only id1,id2]
//   --unit  evidence folder edd-docs/construction/<unit>/gates/ (default: $EDD_UNIT, else "adhoc")
//   --base  the commit the unit started from (diff base for CG5/CG14). Default: $EDD_BASE, else the
//           first line of edd-docs/construction/<unit>/base.txt. If a selected gate's cmd uses
//           {base}, the run fails (exit 2) when no base is known or it is not a commit.
//   --only  run just these gate ids (0 resolved gates -> exit 2)
// gates.yml: a top-level `gates:` list; each entry has id, cmd, enforce (exactly true or false),
// evidence, and an optional timeout (seconds). Block entries (`- id: x` + indented keys) and flow
// entries (`- { id: x, cmd: "…" }`) are both read. In cmd, {evidence} is replaced by the evidence
// folder (relative to the root), {unit} by the unit id and {base} by the base commit. Each cmd runs
// through the shell with cwd = root.
// Status per gate: pass (exit 0) | fail | blocked (exit 78: a required tool is missing).
// Exit 0 only if every enforced gate in the run passes; failing gate ids are printed.
// Evidence output has the repo root and the home folder replaced by `.` and `~`.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { cliOptions, EXIT_BLOCKED, writeJson } from './lib/gate-utils.mjs';

const opts = cliOptions();
const root = path.resolve(opts.get('--root', process.cwd()));
const unit = opts.get('--unit', process.env.EDD_UNIT ?? 'adhoc');
const only = opts.get('--only')?.split(',').map((s) => s.trim()).filter(Boolean);
const evidenceRel = `edd-docs/construction/${unit}/gates`;
const evidenceDir = path.join(root, evidenceRel);
const baseFileRel = `edd-docs/construction/${unit}/base.txt`;
const baseFile = path.join(root, baseFileRel);
const base = opts.get('--base') ?? process.env.EDD_BASE
  ?? (fs.existsSync(baseFile) ? fs.readFileSync(baseFile, 'utf8').split(/\r?\n/)[0].trim() : '');
const OUTPUT_TAIL_LINES = 40;

function unquote(raw) {
  const v = raw.trim();
  if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v);
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  return v.replace(/\s+#.*$/, '');
}

// One `key: value` pair per field, from a block chunk (one key per line) or a flow chunk ({ … }).
function parseEntry(chunk) {
  const flow = chunk.trim().startsWith('{');
  const body = flow ? chunk.trim().slice(1, chunk.trim().lastIndexOf('}')) : chunk;
  const re = flow
    ? /(\w+)\s*:\s*("(?:\\.|[^"\\])*"|'[^']*'|[^,}]+)/g
    : /^\s*(\w+)\s*:\s*(.*)$/gm;
  const entry = {};
  for (const m of body.matchAll(re)) entry[m[1]] = unquote(m[2]);
  return entry;
}

function readGates(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => /^gates\s*:/.test(l));
  if (start < 0) throw new Error('gates.yml has no top-level `gates:` list');
  const chunks = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line) && !line.startsWith('#')) break; // next top-level key
    if (/^\s*-\s/.test(line)) chunks.push(line.replace(/^\s*-\s/, ''));
    else if (chunks.length && line.trim() && !line.trim().startsWith('#')) chunks[chunks.length - 1] += `\n${line}`;
  }
  return chunks.map(parseEntry);
}

const isCommit = (ref) => Boolean(ref)
  && spawnSync('git', ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { cwd: root }).status === 0;
const describe = (v) => (v === undefined ? 'nothing' : JSON.stringify(v));

function validate(gates) {
  const problems = gates.flatMap((g, i) => (g.id && g.cmd ? [] : [`entry #${i + 1} needs id and cmd`]));
  // enforce must be exactly true or false: a typo must never turn a gate report-only.
  problems.push(...gates.filter((g) => g.enforce !== 'true' && g.enforce !== 'false')
    .map((g) => `${g.id ?? '?'}: enforce must be true or false, got ${describe(g.enforce)}`));
  const ids = gates.map((g) => g.id);
  problems.push(...ids.filter((id, i) => ids.indexOf(id) !== i).map((id) => `duplicate id: ${id}`));
  const unknown = (only ?? []).filter((id) => !ids.includes(id));
  problems.push(...unknown.map((id) => `--only names an unknown gate: ${id}`));
  return problems;
}

// Selection-level problems: an empty selection, or {base} needed but missing or not a commit.
function validateSelection(selected) {
  if (selected.length === 0) return ['0 gates selected (check --only)'];
  const needsBase = selected.filter((g) => g.cmd.includes('{base}')).map((g) => g.id);
  if (needsBase.length === 0 || isCommit(base)) return [];
  const why = base ? ` (${base} is not a commit)` : '';
  return [`${needsBase.join(', ')} need {base}: pass --base <unit start commit>, set EDD_BASE or write ${baseFileRel}${why}`];
}

const escapeRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/(\\\\|\/)+/g, '[\\\\/]+');
const LOCAL_PATHS = [[root, '.'], [os.homedir(), '~']]
  .filter(([p]) => p && p.length > 3).map(([p, r]) => [new RegExp(escapeRe(p), 'gi'), r]);
const relativise = (text) => LOCAL_PATHS.reduce((t, [re, r]) => t.replace(re, r), text);

const statusOf = (exitCode) => (exitCode === 0 ? 'pass' : exitCode === EXIT_BLOCKED ? 'blocked' : 'fail');
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
// stdout + stderr (+ spawn error), without ANSI colour codes or local absolute paths.
function combinedOutput(r) {
  return relativise([r.stdout, r.stderr, r.error && `\n${r.error.message}`].filter(Boolean).join('').replace(ANSI, ''));
}

function runGate(gate) {
  const cmd = gate.cmd.replaceAll('{evidence}', evidenceRel).replaceAll('{unit}', unit).replaceAll('{base}', base);
  const startedAt = new Date();
  const r = spawnSync(cmd, {
    cwd: root, shell: true, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    timeout: Number(gate.timeout ?? 1800) * 1000,
    env: { ...process.env, EDD_UNIT: unit, EDD_EVIDENCE_DIR: evidenceRel, EDD_BASE: base, FORCE_COLOR: '0' },
  });
  const output = combinedOutput(r);
  const exitCode = r.status ?? 1;
  const result = {
    id: gate.id, enforce: gate.enforce === 'true', status: statusOf(exitCode), exitCode, cmd, evidence: gate.evidence ?? '',
    ...(base ? { base } : {}),
    startedAt: startedAt.toISOString(), durationMs: Date.now() - startedAt.getTime(),
    ...(r.error?.code === 'ETIMEDOUT' ? { timedOut: true } : {}),
    outputTail: output.trimEnd().split(/\r?\n/).slice(-OUTPUT_TAIL_LINES),
    log: `${evidenceRel}/${gate.id}.log`,
  };
  fs.writeFileSync(path.join(evidenceDir, `${gate.id}.log`), output);
  writeJson(path.join(evidenceDir, `${gate.id}.json`), result);
  return result;
}

const gatesFile = path.join(root, 'gates.yml');
if (!fs.existsSync(gatesFile)) {
  console.error(`FAIL gates: ${gatesFile} not found`);
  process.exit(2);
}
const all = readGates(fs.readFileSync(gatesFile, 'utf8'));
const selected = only ? all.filter((g) => only.includes(g.id)) : all;
const problems = [...validate(all), ...validateSelection(selected)];
if (problems.length) {
  console.error(`FAIL gates.yml\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(2);
}
fs.mkdirSync(evidenceDir, { recursive: true });

const results = [];
for (const gate of selected) {
  process.stdout.write(`… ${gate.id}\n`);
  const r = runGate(gate);
  results.push(r);
  console.log(`${r.status.toUpperCase().padEnd(7)} ${r.id.padEnd(22)} ${r.enforce ? 'enforced   ' : 'report-only'} exit ${r.exitCode} ${(r.durationMs / 1000).toFixed(1)}s`);
}

const failing = results.filter((r) => r.enforce && r.status !== 'pass').map((r) => r.id);
const reportOnly = results.filter((r) => !r.enforce && r.status !== 'pass').map((r) => r.id);
console.log(`\n${results.length} gate(s) run for ${unit}${base ? ` (base ${base})` : ''}; evidence in ${evidenceRel}/`);
if (reportOnly.length) console.log(`report-only not passing: ${reportOnly.join(', ')}`);
if (failing.length) {
  console.log(`FAILED enforced gates: ${failing.join(', ')}`);
  process.exit(1);
}
console.log('All enforced gates passed.');
