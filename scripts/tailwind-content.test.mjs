// PLAT-AC-06 (gate part, R17): build Tailwind with the real tailwind.config.js over a temp fixture
// tree (never the repo, so the owner's `next dev` on :3100 never sees a new file). Sentinel classes
// that live only in src/components/ and only in src/terminal/ must be emitted; a sentinel in any
// pre-U-03 root folder must not be (proves the temporary U-00 globs are gone, not just renamed).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  legacyRootDirs, makeFixture, removeFixture, repoFile, specTailwindSentinelDirs,
} from './lib/test-utils.mjs';

const CLI = repoFile('node_modules/tailwindcss/lib/cli.js');
// Arbitrary-value utilities: valid Tailwind, and unique enough that nothing else emits them.
const sentinel = (n) => `w-[${n}px]`;
const emitted = (css, n) => css.includes(`.w-\\[${n}px\\]`);

function buildFixture(files) {
  const dir = makeFixture({ 'in.css': '@tailwind utilities;\n', ...files });
  // Content globs are relative to cwd in Tailwind 3; plugins resolve from the config's folder.
  const r = spawnSync(process.execPath, [CLI, '-c', repoFile('tailwind.config.js'), '-i', 'in.css', '-o', 'out.css'],
    { cwd: dir, encoding: 'utf8', timeout: 60000 });
  const css = fs.existsSync(path.join(dir, 'out.css')) ? fs.readFileSync(path.join(dir, 'out.css'), 'utf8') : '';
  removeFixture(dir);
  return { status: r.status, out: `${r.stdout}${r.stderr}`, css };
}

const tsx = (cls) => `export const S = () => <div className="${cls}" />;\n`;

test('PLAT-AC-06 a sentinel class used only in src/components/ and one used only in src/terminal/ are both emitted', () => {
  assert.ok(fs.existsSync(CLI), 'tailwindcss CLI not installed');
  const [components, terminal] = specTailwindSentinelDirs();
  const { status, out, css } = buildFixture({
    [`${components}/Sentinel.tsx`]: tsx(sentinel(7101)),
    [`${terminal}/nested/deep/Sentinel.tsx`]: tsx(sentinel(7102)),
  });
  assert.equal(status, 0, out);
  assert.ok(emitted(css, 7101), `class from ${components}/ missing from the emitted CSS`);
  assert.ok(emitted(css, 7102), `class from ${terminal}/ missing from the emitted CSS`);
});

test('PLAT-AC-06 a sentinel class used only in a pre-U-03 root folder is not emitted (no glob outside src/)', () => {
  const legacy = legacyRootDirs();
  const files = Object.fromEntries(legacy.map((d, i) => [`${d}/Sentinel.tsx`, tsx(sentinel(7200 + i))]));
  const { status, out, css } = buildFixture(files);
  assert.equal(status, 0, out);
  const leaked = legacy.filter((d, i) => emitted(css, 7200 + i));
  assert.deepEqual(leaked, [], `tailwind still scans: ${leaked.join(', ')}`);
});
