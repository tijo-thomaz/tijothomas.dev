// U-01 review fixes: the gate runner fails closed (strict `enforce`, empty selection, missing
// {base}), records exit 78 as blocked, and require-tool reports a missing tool as BLOCKED.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { makeFixture, removeFixture, runScript } from './lib/test-utils.mjs';

// When this suite runs inside a gate run (CG4), the outer runner exports EDD_BASE/EDD_UNIT; they
// would override the fixtures' own --base/base.txt, so the child runners must not inherit them.
delete process.env.EDD_BASE;
delete process.env.EDD_UNIT;
const fixtures = [];
after(() => fixtures.forEach(removeFixture));
const entry = (id, cmd, enforce) => [`  - id: ${id}`, `    cmd: ${cmd}`, ...(enforce === undefined ? [] : [`    enforce: ${enforce}`]), '    evidence: stdout'];
function fixture(entries, files = {}) {
  const dir = makeFixture({
    'pass.mjs': 'process.exit(0);\n',
    'blocked.mjs': 'console.log("BLOCKED tool missing"); process.exit(78);\n',
    'echo.mjs': 'console.log(`base=${process.argv[2]}`); process.exit(0);\n',
    'gates.yml': ['gates:', ...entries.flat(), ''].join('\n'),
    ...files,
  });
  fixtures.push(dir);
  return dir;
}
const run = (root, ...args) => runScript('gates.mjs', ['--root', root, '--unit', 'U-99', ...args]);
const evidence = (root, id) => JSON.parse(fs.readFileSync(path.join(root, 'edd-docs', 'construction', 'U-99', 'gates', `${id}.json`), 'utf8'));

for (const bad of ['True', 'yes', undefined]) {
  test(`U-01 gates runner rejects enforce ${bad === undefined ? 'missing' : `'${bad}'`} instead of treating it as report-only`, () => {
    const r = run(fixture([entry('x', 'node pass.mjs', bad)]));
    assert.equal(r.status, 2, r.out);
    assert.match(r.out, /x: enforce must be true or false/);
  });
}

test('U-01 gates runner exits non-zero when --only resolves to 0 gates', () => {
  const r = run(fixture([entry('ok', 'node pass.mjs', true)]), '--only', ',');
  assert.equal(r.status, 2, r.out);
  assert.match(r.out, /0 gates selected/);
});

test('U-01 gates runner records exit 78 as blocked and fails the run when the gate is enforced', () => {
  const root = fixture([entry('ok', 'node pass.mjs', true), entry('tool', 'node blocked.mjs', true)]);
  const r = run(root);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /FAILED enforced gates: tool/);
  assert.equal(evidence(root, 'tool').status, 'blocked');
});

test('U-01 gates runner fails when a gate needs {base} and none is given', () => {
  const r = run(fixture([entry('docs', 'node echo.mjs {base}', true)]));
  assert.equal(r.status, 2, r.out);
  assert.match(r.out, /docs need \{base\}/);
});

test('U-01 gates runner substitutes {base} from --base and from the unit base.txt', () => {
  const root = fixture([entry('docs', 'node echo.mjs {base}', true)]);
  spawnSync('git', ['init', '-q'], { cwd: root });
  spawnSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'x'], { cwd: root });
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim();
  assert.equal(run(root, '--base', 'not-a-ref').status, 2);
  assert.equal(run(root, '--base', head).status, 0);
  assert.match(evidence(root, 'docs').outputTail.join('\n'), new RegExp(`base=${head}`));
  fs.writeFileSync(path.join(root, 'edd-docs', 'construction', 'U-99', 'base.txt'), `${head}\n`);
  assert.equal(run(root).status, 0);
});

test('U-01 require-tool reports a missing tool as BLOCKED with exit 78', () => {
  const r = runScript('require-tool.mjs', ['edd-no-such-tool-u01', '--version']);
  assert.equal(r.status, 78, r.out);
  assert.match(r.out, /^BLOCKED edd-no-such-tool-u01 is not installed/m);
});
