// U-09: metadata and JSON-LD of `/` (SEO-AC-01, SEO-AC-06, SEO-AC-11) and the site favicon.
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => {
  const font = (name: string) => () => ({ className: `font-${name}`, variable: `--font-${name}`, style: { fontFamily: name } });
  return { Space_Grotesk: font('space-grotesk'), Inter: font('inter') };
});
vi.mock('@vercel/analytics/react', () => ({ Analytics: () => null }));

import { profile } from '@/content/profile';
import { siteUrl } from '@/lib/site';

import { metadata as layoutMetadata } from './layout';
import Page, { metadata } from './page';

const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const keys = (v: unknown): string[] =>
  v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => [k, ...keys(x)]) : [];

describe('metadata of /', () => {
  it('SEO-AC-01 title < 60, description 70-160, canonical <siteUrl>/, OG images, summary_large_image, no twitter.creator', () => {
    // `absolute`, so the layout's "%s · <name>" template does not apply to the home page.
    const title = (metadata.title as { absolute: string }).absolute;
    expect(title).toBe(profile.seo.title);
    expect(title.length).toBeLessThan(60);
    const d = String(metadata.description);
    expect(d).toBe(profile.seo.description);
    expect(d.length).toBeGreaterThanOrEqual(70);
    expect(d.length).toBeLessThanOrEqual(160);
    expect(metadata.alternates?.canonical).toBe(`${siteUrl}/`);
    const og = metadata.openGraph as { images?: unknown[]; url?: string; type?: string };
    expect(og.images?.length).toBeGreaterThan(0);
    expect(og.url).toBe(`${siteUrl}/`);
    const tw = metadata.twitter as { card?: string; creator?: string; images?: unknown };
    expect(tw.card).toBe('summary_large_image');
    expect(tw.creator).toBeUndefined();
    expect(tw.images).toBeDefined();
  });

  it('SEO-AC-11 the metadata has no email, telephone or contactPoint, and no string contains @', () => {
    expect(keys(metadata).filter((k) => /email|telephone|contactPoint|creator/i.test(k))).toEqual([]);
    expect(strings(metadata).filter((s) => s.includes('@'))).toEqual([]);
  });

  it('U-09 the site layout declares the favicon (U-03 review finding)', () => {
    const icons = layoutMetadata.icons as { icon?: unknown };
    expect(JSON.stringify(icons.icon)).toContain('/favicon.svg');
  });
});

describe('JSON-LD on /', () => {
  const html = renderToStaticMarkup(<Page />);
  const blocks = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)).map((m) => m[1]);

  it('SEO-AC-06 / has exactly one JSON-LD block: a Person from profile.ts with escaped <', () => {
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).not.toMatch(/</);
    const person = JSON.parse(blocks[0]);
    expect(person['@type']).toBe('Person');
    expect(person.name).toBe(profile.name);
    expect(person.jobTitle).toBe(profile.jobTitle);
    expect(person.url).toBe(`${siteUrl}/`);
    expect(person.sameAs).toEqual([profile.links.linkedin, profile.links.github]);
    expect(person.knowsAbout).toEqual([...profile.knowsAbout]);
  });

  it('SEO-AC-11 the Person has no email, telephone or contactPoint, and no string contains @', () => {
    const person = JSON.parse(blocks[0]);
    expect(keys(person).filter((k) => /email|telephone|contactPoint/i.test(k))).toEqual([]);
    expect(strings(person).filter((s) => s.includes('@'))).toEqual([]);
  });
});
