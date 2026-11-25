// TERM-AC-05 (Verify: unit): every route in the VersionSelector list resolves to an existing app
// route or a next.config.js redirect, and "v1" (version 1.x) is /terminal.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

import { AVAILABLE_VERSIONS } from './version';

const root = process.cwd();
const appDir = path.join(root, 'src', 'app');

// App Router routes from page files: route groups `(x)` add no URL segment.
function appRoutes(dir = appDir, segs: string[] = []): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return appRoutes(path.join(dir, e.name), /^\(.*\)$/.test(e.name) ? segs : [...segs, e.name]);
    return /^page\.(tsx|ts|jsx|js)$/.test(e.name) ? [`/${segs.join('/')}`] : [];
  });
}

async function redirectSources(): Promise<string[]> {
  const cfg = createRequire(import.meta.url)(path.join(root, 'next.config.js'));
  const list = typeof cfg.redirects === 'function' ? await cfg.redirects() : [];
  return list.map((r: { source: string }) => r.source);
}

describe('VersionSelector routes', () => {
  it('TERM-AC-05 version 1.x ("v1") routes to /terminal', () => {
    const v1 = AVAILABLE_VERSIONS.filter((v) => v.version.startsWith('1.'));
    expect(v1).toHaveLength(1);
    expect(v1[0].route).toBe('/terminal');
  });

  it('TERM-AC-05 every version route is an existing app route or a configured redirect', async () => {
    expect(AVAILABLE_VERSIONS.length).toBeGreaterThan(0);
    const known = new Set([...appRoutes(), ...(await redirectSources())]);
    expect(known.has('/terminal')).toBe(true);
    const dangling = AVAILABLE_VERSIONS.map((v) => v.route).filter((r) => !known.has(r));
    expect(dangling).toEqual([]);
  });
});
