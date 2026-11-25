// SEO-AC-03 (Verify: unit) and the U-03 site root layout contract (scope 3, bulkhead): the (site)
// layout is its own <html lang="en"> root with metadataBase = siteUrl, no ThemeProvider, no hidden
// SEO block and no terminal viewport lock.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

// next/font is compiled by Next's SWC plugin; outside Next it has no runtime. Boundary double:
// returns the shape Next generates ({ className, variable, style }).
vi.mock('next/font/google', () => {
  const font = (name: string) => () => ({ className: `font-${name}`, variable: `--font-${name}`, style: { fontFamily: name } });
  return { Space_Grotesk: font('space-grotesk'), Inter: font('inter'), JetBrains_Mono: font('jetbrains-mono') };
});
vi.mock('@vercel/analytics/react', () => ({ Analytics: () => null }));

import RootLayout, { metadata, viewport } from './layout';
import { siteUrl } from '../../lib/site';

const html = () => renderToStaticMarkup(<RootLayout><main>child</main></RootLayout>);

describe('(site) root layout', () => {
  it('SEO-AC-03 viewport leaves zoom enabled: maximumScale undefined and userScalable not false', () => {
    expect(viewport).toBeDefined();
    expect(viewport.maximumScale).toBeUndefined();
    expect(viewport.userScalable).not.toBe(false);
  });

  it('U-03 renders <html lang="en"> around its children', () => {
    const out = html();
    expect(out).toMatch(/^<html[^>]*\blang="en"/);
    expect(out).toContain('<main>child</main>');
  });

  it('U-03 sets metadataBase to siteUrl from src/lib/site.ts (https://tijothomas.dev)', () => {
    expect(siteUrl).toBe('https://tijothomas.dev');
    expect(String(metadata.metadataBase)).toMatch(/^https:\/\/tijothomas\.dev\/?$/);
  });

  it('HOME-AC-05 U-03 has no ThemeProvider or theme-* class and no hidden SEO block (bulkhead from the terminal)', () => {
    const out = html();
    expect(out).not.toMatch(/class="[^"]*\btheme-/);
    expect(out).not.toContain('seo-content');
  });

  it('U-03 does not index-block the site (robots not noindex)', () => {
    const robots = metadata.robots;
    const index = typeof robots === 'object' && robots !== null ? robots.index : undefined;
    expect(index).not.toBe(false);
  });
});
