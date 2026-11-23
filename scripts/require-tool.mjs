#!/usr/bin/env node
// Runs an external CLI tool (e.g. gitleaks) and passes its exit code through. If the tool is not on
// PATH, prints `BLOCKED <tool> …` and exits 78, which scripts/gates.mjs records as "blocked" (never
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

const bin = findOnPath(tool);
if (!bin) blocked(`${tool} is not installed (not on PATH); install it to run this gate: ${tool} ${args.join(' ')}`);
const reportPath = args[args.indexOf('--report-path') + 1];
if (args.includes('--report-path') && reportPath) fs.mkdirSync(path.dirname(path.resolve(reportPath)), { recursive: true });
const r = spawnSync(bin, args, { stdio: 'inherit' });
if (r.error) {
  console.error(`FAIL ${tool}: ${r.error.message}`);
  process.exit(1);
}
process.exit(r.status ?? 1);
