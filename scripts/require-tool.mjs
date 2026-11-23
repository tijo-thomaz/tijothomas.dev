#!/usr/bin/env node
// Runs an external CLI tool (e.g. gitleaks) and passes its exit code through. If the tool cannot be
// found, prints `BLOCKED <tool> …` and exits 78, which scripts/gates.mjs records as "blocked" (never
// a pass, never a crash). Usage: node scripts/require-tool.mjs <tool> [args...]
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { blocked } from './lib/gate-utils.mjs';

const [tool, ...args] = process.argv.slice(2);
if (!tool) {
  console.error('usage: node scripts/require-tool.mjs <tool> [args...]');
  process.exit(2);
}

function findOnPath(name) {
  const exts = process.platform === 'win32' ? (process.env.PATHEXT ?? '.EXE;.CMD;.BAT').split(';') : [''];
  for (const dir of (process.env.PATH ?? '').split(path.delimiter).filter(Boolean)) {
    for (const ext of ['', ...exts]) {
      const candidate = path.join(dir, name + ext.toLowerCase());
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
  }
  return null;
}

const isFile = (f) => Boolean(f) && fs.existsSync(f) && fs.statSync(f).isFile();

// Windows: `where <tool>` (sees the registry App Paths too), then winget's per-user install folders,
// because a fresh winget install is not on the PATH of shells that were already open.
function findOnWindows(name) {
  if (process.platform !== 'win32') return null;
  const where = spawnSync('where', [name], { encoding: 'utf8' });
  const hit = where.status === 0 ? where.stdout.split(/\r?\n/).map((l) => l.trim()).find(isFile) : null;
  if (hit) return hit;
  const winget = path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet');
  const link = path.join(winget, 'Links', `${name}.exe`);
  if (isFile(link)) return link;
  const pkgs = path.join(winget, 'Packages');
  const dirs = fs.existsSync(pkgs) ? fs.readdirSync(pkgs) : [];
  return dirs.map((d) => path.join(pkgs, d, `${name}.exe`)).find(isFile) ?? null;
}

// <TOOL>_PATH (e.g. GITLEAKS_PATH) wins, then PATH, then the Windows fallbacks.
const override = process.env[`${tool.toUpperCase().replace(/\W/g, '_')}_PATH`];
const bin = (isFile(override) && override) || findOnPath(tool) || findOnWindows(tool);
if (!bin) blocked(`${tool} is not installed (not on PATH, not found by where or in WinGet); install it to run this gate: ${tool} ${args.join(' ')}`);
console.log(`using ${tool}: ${bin}`);
const reportPath = args[args.indexOf('--report-path') + 1];
if (args.includes('--report-path') && reportPath) fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true });
const r = spawnSync(bin, args, { stdio: 'inherit' });
if (r.error) {
  console.error(`FAIL ${tool}: ${r.error.message}`);
  process.exit(1);
}
process.exit(r.status ?? 1);
