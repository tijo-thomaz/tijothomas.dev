// U-13: the project registry rules (PROJ-AC-01, PROJ-AC-02). `work` in src/content/work.ts is the registry.
import { describe, expect, it } from 'vitest';

import type { WorkItem } from '@/content/types';
import { work } from '@/content/work';

import { playOrigin, registryProblems } from './projects';

const item = (over: Partial<WorkItem> = {}): WorkItem => ({
  slug: 'demo',
  name: 'Demo',
  subtitle: 'A demo',
  status: 'in-progress',
  summary: 'Problem: x.',
  metric: null,
  stack: ['Go'],
  ...over,
});

describe('registry', () => {
  it('PROJ-AC-01 the work registry has unique, lowercase kebab-case slugs', () => {
    expect(registryProblems(work)).toEqual([]);
  });

  it('PROJ-AC-01 a duplicate or non-kebab slug is reported by slug', () => {
    expect(registryProblems([item(), item()])).toEqual(['duplicate slug: demo']);
    expect(registryProblems([item({ slug: 'Demo_1' })])).toEqual(['slug is not kebab-case: Demo_1']);
    expect(registryProblems([item({ slug: 'a--b' })])).toEqual(['slug is not kebab-case: a--b']);
  });

  it('PROJ-AC-02 a playOriginEnv name must match /^[A-Z][A-Z0-9_]*_ORIGIN$/', () => {
    expect(registryProblems([item({ playOriginEnv: 'SLUICE_ORIGIN' })])).toEqual([]);
    expect(registryProblems([item({ playOriginEnv: 'sluice_origin' as WorkItem['playOriginEnv'] })])).toEqual([
      'demo: playOriginEnv is not an *_ORIGIN env name: sluice_origin',
    ]);
    expect(registryProblems([item({ playOriginEnv: 'SLUICE_URL' as WorkItem['playOriginEnv'] })])).toEqual([
      'demo: playOriginEnv is not an *_ORIGIN env name: SLUICE_URL',
    ]);
  });
});

describe('playOrigin', () => {
  const sluice = item({ slug: 'sluice', playOriginEnv: 'SLUICE_ORIGIN' });

  it('PROJ-AC-02 returns null when the item has no env name or the env var is unset or empty', () => {
    expect(playOrigin(item(), { SLUICE_ORIGIN: 'https://x.vercel.app' })).toBeNull();
    expect(playOrigin(sluice, {})).toBeNull();
    expect(playOrigin(sluice, { SLUICE_ORIGIN: '' })).toBeNull();
    expect(playOrigin(sluice, { SLUICE_ORIGIN: '  ' })).toBeNull();
  });

  it('PROJ-AC-02 returns the https origin, without a trailing slash', () => {
    expect(playOrigin(sluice, { SLUICE_ORIGIN: 'https://sluice-example.vercel.app' })).toBe('https://sluice-example.vercel.app');
    expect(playOrigin(sluice, { SLUICE_ORIGIN: 'https://sluice-example.vercel.app/' })).toBe('https://sluice-example.vercel.app');
  });

  it.each([
    'http://sluice-example.vercel.app',
    'https://sluice-example.vercel.app/play/sluice',
    'https://sluice-example.vercel.app?x=1',
    'https://sluice-example.vercel.app#x',
    'https://user:pw@sluice-example.vercel.app',
    '//sluice-example.vercel.app',
    'javascript:alert(1)',
    'not a url',
  ])('PROJ-AC-02 throws, naming the env var, for a value that is not a bare https origin: %s', (value) => {
    expect(() => playOrigin(sluice, { SLUICE_ORIGIN: value })).toThrow(/SLUICE_ORIGIN/);
  });
});
