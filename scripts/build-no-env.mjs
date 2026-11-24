#!/usr/bin/env node
// PLAT-AC-03, TERM-AC-06 (U-02): prove the site builds with no Supabase or public env.
// Usage: node scripts/build-no-env.mjs [--cwd <dir>] [-- <cmd> <args...>]
// Default command: npm run build. The child gets process.env minus every NEXT_PUBLIC_* key
// and every key containing SUPABASE (case-insensitive). Refuses (exit 2) when an env file
// that Next would load exists in cwd. Exit code is the child's.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const TAG = 'PLAT-AC-03 TERM-AC-06 build with no Supabase env';
const ENV_FILES = ['.env', '.env.local', '.env.production', '.env.production.local'];

const argv = process.argv.slice(2);
let cwd = process.cwd();
let cmd = null;
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--cwd') cwd = path.resolve(argv[++i] ?? '.');
  else if (argv[i] === '--') { cmd = argv.slice(i + 1); break; }
  else { console.error(`unknown argument: ${argv[i]}`); process.exit(2); }
}

const found = ENV_FILES.filter((f) => fs.existsSync(path.join(cwd, f)));
if (found.length) {
  console.error(`refusing: ${found.join(', ')} exists in ${cwd}; Next would load env from it`);
  console.log(`FAIL ${TAG} (env file present) exit 2`);
  process.exit(2);
}

const env = Object.fromEntries(
  Object.entries(process.env).filter(([k]) => !/^NEXT_PUBLIC_/i.test(k) && !/SUPABASE/i.test(k)),
);

const r = cmd && cmd.length
  ? spawnSync(cmd[0], cmd.slice(1), { cwd, env, stdio: 'inherit' })
  : spawnSync('npm run build', { cwd, env, stdio: 'inherit', shell: true });

const code = r.status ?? 1;
if (r.error) console.error(r.error.message);
console.log(code === 0 ? `PASS ${TAG}` : `FAIL ${TAG} exit ${code}`);
process.exit(code);
