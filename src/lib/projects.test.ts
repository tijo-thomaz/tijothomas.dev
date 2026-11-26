// U-13: the project registry rules (PROJ-AC-01, PROJ-AC-02). `work` in src/content/work.ts is the registry.
import { describe, expect, it } from 'vitest';

import type { WorkItem } from '@/content/types';
import { work } from '@/content/work';

import { formerRedirects, playHeaderRules, playOrigin, playRewrites, registryProblems } from './projects';

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

describe('playRewrites', () => {
  const ORIGIN = 'https://sluice-example.vercel.app';

  it('PROJ-AC-03 with SLUICE_ORIGIN unset there is no /play/sluice rule', () => {
    expect(playRewrites(work, {}).filter((r) => r.source.startsWith('/play/sluice'))).toEqual([]);
  });

  it('PROJ-AC-04 with SLUICE_ORIGIN set there are exactly the two /play/sluice rules to the zone', () => {
    expect(playRewrites(work, { SLUICE_ORIGIN: ORIGIN })).toEqual([
      { source: '/play/sluice', destination: `${ORIGIN}/play/sluice` },
      { source: '/play/sluice/:path*', destination: `${ORIGIN}/play/sluice/:path*` },
    ]);
  });

  it('PROJ-AC-02 PROJ-AC-04 a bad origin fails the rewrites (and so the build), naming the env var', () => {
    expect(() => playRewrites(work, { SLUICE_ORIGIN: 'http://sluice-example.vercel.app' })).toThrow(/SLUICE_ORIGIN/);
  });
});

describe('formerRedirects', () => {
  it('PROJ-AC-06 /work/promptshield is a permanent redirect to /work/sluice', () => {
    expect(formerRedirects(work)).toEqual([{ source: '/work/promptshield', destination: '/work/sluice', permanent: true }]);
  });
});

describe('playHeaderRules', () => {
  const SITE = "default-src 'self'; script-src 'self' 'unsafe-inline'";
  const header = (rules: ReturnType<typeof playHeaderRules>, source: string, key: string) =>
    rules.find((r) => r.source === source)?.headers.find((h) => h.key === key)?.value;
  const csp = (value: string | undefined) =>
    Object.fromEntries((value ?? '').split(';').map((d) => d.trim().split(/\s+/)).map(([k, ...v]) => [k, v]));

  it('PROJ-AC-11 /play/sluice and /play/sluice/:path* are noindex', () => {
    for (const env of [{}, { SLUICE_ORIGIN: 'https://sluice-example.vercel.app' }]) {
      const rules = playHeaderRules(work, env, SITE);
      expect(header(rules, '/play/sluice', 'X-Robots-Tag')).toBe('noindex');
      expect(header(rules, '/play/sluice/:path*', 'X-Robots-Tag')).toBe('noindex');
    }
  });

  it('PROJ-AC-11 an item with indexPlay: true gets no X-Robots-Tag', () => {
    const rules = playHeaderRules([item({ playOriginEnv: 'DEMO_ORIGIN', indexPlay: true })], {}, SITE);
    expect(header(rules, '/play/demo', 'X-Robots-Tag')).toBeUndefined();
  });

  it('PROJ-AC-12 a deployed wasm demo gets a self-only CSP with wasm-unsafe-eval and no unsafe-inline or unsafe-eval', () => {
    const rules = playHeaderRules(work, { SLUICE_ORIGIN: 'https://sluice-example.vercel.app' }, SITE);
    const d = csp(header(rules, '/play/sluice/:path*', 'Content-Security-Policy'));
    expect(header(rules, '/play/sluice', 'Content-Security-Policy')).toBe(header(rules, '/play/sluice/:path*', 'Content-Security-Policy'));
    expect(d['script-src']).toEqual(["'self'", "'wasm-unsafe-eval'"]);
    expect(d['frame-ancestors']).toEqual(["'none'"]);
    expect(d['object-src']).toEqual(["'none'"]);
    const sources = Object.values(d).flat().filter((s) => !s.startsWith("'") && s !== 'data:');
    expect(sources).toEqual([]);
  });

  it('PROJ-AC-12 a deployed demo without wasm gets no wasm-unsafe-eval', () => {
    const rules = playHeaderRules([item({ playOriginEnv: 'DEMO_ORIGIN' })], { DEMO_ORIGIN: 'https://d.vercel.app' }, SITE);
    expect(header(rules, '/play/demo', 'Content-Security-Policy')).not.toContain('wasm-unsafe-eval');
  });

  it('PROJ-AC-05 PROJ-AC-12 while not deployed, /play/<slug> serves the in-site page with the site CSP', () => {
    const rules = playHeaderRules(work, {}, SITE);
    expect(header(rules, '/play/sluice', 'Content-Security-Policy')).toBe(SITE);
  });
});
