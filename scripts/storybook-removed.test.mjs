// PLAT-AC-17 (Verify: unit) Storybook is fully removed. Run: node --test scripts/*.test.mjs
// Plain node:test because vitest only collects {app,components,terminal,content,lib} (PLAT-AC-05).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walk } from './lib/repo-graph.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const allDeps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.optionalDependencies });

test('PLAT-AC-17 repo has no *.stories.* files', () => {
  const stories = walk(root).filter((f) => /\.stories\.[^/]+$/.test(f));
  assert.deepEqual(stories, [], `story files still present:\n${stories.join('\n')}`);
});

test('PLAT-AC-17 package.json has no storybook or build-storybook script', () => {
  const offending = Object.entries(pkg.scripts ?? {})
    .filter(([name, cmd]) => ['storybook', 'build-storybook'].includes(name) || /\bstorybook\b/.test(cmd))
    .map(([name]) => name);
  assert.deepEqual(offending, []);
});

test('PLAT-AC-17 package.json has no storybook, @storybook/* or @chromatic-com/storybook dependency', () => {
  const offending = allDeps.filter((d) => d === 'storybook' || d.startsWith('@storybook/') || d === '@chromatic-com/storybook');
  assert.deepEqual(offending, []);
});

test('PLAT-AC-17 no Storybook config dir, eslint-plugin-storybook or plugin:storybook ESLint config remains', () => {
  const leftovers = [
    ...['.storybook', 'stories'].filter((d) => fs.existsSync(path.join(root, d))).map((d) => `dir ${d}/`),
    ...allDeps.filter((d) => d === 'eslint-plugin-storybook').map((d) => `dependency ${d}`),
    ...(JSON.stringify(pkg.eslintConfig ?? {}).includes('storybook') ? ['package.json eslintConfig extends plugin:storybook'] : []),
  ];
  assert.deepEqual(leftovers, []);
});
