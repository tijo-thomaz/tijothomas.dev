// PLAT-AC-18 (Verify: gate): specs/home.md is not git-ignored and is tracked.
// Contract under test: node scripts/check-gitignore.mjs [--root <dir>]  -> prints `PASS|FAIL PLAT-AC-18 ...`.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { makeFixture, removeFixture, runScript } from './lib/test-utils.mjs';

const fixtures = [];
after(() => fixtures.forEach(removeFixture));
const git = (cwd, ...args) => spawnSync('git', ['-c', 'core.excludesFile=', ...args], { cwd, encoding: 'utf8' });
function gitFixture(files, { track = false } = {}) {
  const dir = makeFixture(files);
  fixtures.push(dir);
  git(dir, 'init', '-q');
  if (track) git(dir, 'add', '-f', 'specs/home.md');
  return dir;
}

test('PLAT-AC-18 check-gitignore passes on the real repo and prints the AC ID', () => {
  const r = runScript('check-gitignore.mjs');
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /PASS PLAT-AC-18/);
});

test('PLAT-AC-18 check-gitignore fails and names specs/home.md when .gitignore ignores specs/', () => {
  const root = gitFixture({ '.gitignore': 'specs/\n', 'specs/home.md': '# Home\n' });
  const r = runScript('check-gitignore.mjs', ['--root', root]);
  assert.notEqual(r.status, 0, r.out);
  assert.match(r.out, /FAIL PLAT-AC-18/);
  assert.match(r.out, /specs\/home\.md/);
});

test('PLAT-AC-18 check-gitignore fails when specs/home.md exists but is not tracked', () => {
  const root = gitFixture({ '.gitignore': 'node_modules/\n', 'specs/home.md': '# Home\n' });
  const r = runScript('check-gitignore.mjs', ['--root', root]);
  assert.notEqual(r.status, 0, r.out);
  assert.match(r.out, /FAIL PLAT-AC-18/);
});

test('PLAT-AC-18 check-gitignore passes on a fixture where specs/home.md is tracked and not ignored', () => {
  const root = gitFixture({ '.gitignore': 'node_modules/\n', 'specs/home.md': '# Home\n' }, { track: true });
  const r = runScript('check-gitignore.mjs', ['--root', root]);
  assert.equal(r.status, 0, r.out);
});
