// Small shared helpers for gate scripts: CLI options, the BLOCKED exit code, a free port and a
// `next start` server for the runtime gates (Lighthouse, view-source). No dependencies.
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';

// Exit code meaning "could not run: a tool or prerequisite is missing" (sysexits EX_CONFIG).
// scripts/gates.mjs records it as status "blocked", which never counts as a pass.
export const EXIT_BLOCKED = 78;
// Ports never used by gates: 3100 is the owner's `next dev`, 3000 is the Next.js default.
const RESERVED_PORTS = new Set([3000, 3100]);

export function cliOptions(argv = process.argv.slice(2)) {
  const get = (name, dflt) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : dflt);
  return { get, has: (name) => argv.includes(name), argv };
}

export function blocked(message) {
  console.log(`BLOCKED ${message}`);
  process.exit(EXIT_BLOCKED);
}

export function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => (RESERVED_PORTS.has(port) ? freePort().then(resolve, reject) : resolve(port)));
    });
  });
}

async function waitForHttp(url, child, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`next start exited early with code ${child.exitCode}`);
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status > 0) return;
    } catch {
      // not listening yet
    }
    await new Promise((r) => { setTimeout(r, 500); });
  }
  throw new Error(`no HTTP response from ${url} within ${timeoutMs} ms`);
}

// Starts `next start` on a free port from an existing production build in `root`.
// Blocks the gate (exit 78) when there is no build: run CG1 (npm run build) first.
export async function startNext(root, { timeoutMs = 60000 } = {}) {
  if (!fs.existsSync(path.join(root, '.next', 'BUILD_ID'))) {
    blocked('no production build (.next/BUILD_ID missing): run the CG1 build gate first, or pass --url');
  }
  const port = await freePort();
  const bin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
  const child = spawn(process.execPath, [bin, 'start', '-p', String(port), '-H', '127.0.0.1'], {
    cwd: root, stdio: 'ignore', env: { ...process.env, NODE_ENV: 'production' },
  });
  const url = `http://127.0.0.1:${port}/`;
  const stop = () => { if (child.exitCode === null) child.kill(); };
  process.on('exit', stop);
  try {
    await waitForHttp(url, child, timeoutMs);
  } catch (e) {
    stop();
    throw e;
  }
  return { url, stop };
}

export const median = (nums) => {
  const s = [...nums].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}
