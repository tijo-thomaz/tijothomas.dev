// TERM-AC-03 (Verify: unit): /terminal metadata is robots noindex, follow and its canonical is
// <siteUrl>/terminal. Next merges layout and page metadata (page wins, shallow), so the test does too.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => {
  const font = (name: string) => () => ({ className: `font-${name}`, variable: `--font-${name}`, style: { fontFamily: name } });
  return { JetBrains_Mono: font('jetbrains-mono'), Space_Grotesk: font('space-grotesk'), Inter: font('inter') };
});
vi.mock('@vercel/analytics/react', () => ({ Analytics: () => null }));
// The terminal app itself (Supabase client, sounds, canvas) is not under test here: route-boundary double.
vi.mock('../../terminal/page', () => ({ default: () => null }));

import * as layout from './layout';
import * as page from './terminal/page';
import { siteUrl } from '../../lib/site';

const merged = { ...layout.metadata, ...(page as { metadata?: object }).metadata } as Record<string, unknown>;

describe('/terminal metadata', () => {
  it('TERM-AC-03 robots is index false, follow true (renders <meta name="robots" content="noindex, follow">)', () => {
    expect(merged.robots).toMatchObject({ index: false, follow: true });
  });

  it('TERM-AC-03 canonical resolves to <siteUrl>/terminal', () => {
    const alternates = merged.alternates as { canonical?: string | URL } | undefined;
    expect(alternates?.canonical).toBeDefined();
    const base = (merged.metadataBase as URL | undefined) ?? new URL(siteUrl);
    expect(new URL(String(alternates?.canonical), base).href).toBe(`${siteUrl}/terminal`);
  });

  it('U-03 the (terminal) layout is its own root layout: it renders <html> around its children', () => {
    const Layout = layout.default as (p: { children: React.ReactNode }) => React.ReactElement;
    const out = renderToStaticMarkup(<Layout><div id="child" /></Layout>);
    expect(out).toMatch(/^<html[^>]*>/);
    expect(out).toContain('<div id="child"></div>');
  });
});
