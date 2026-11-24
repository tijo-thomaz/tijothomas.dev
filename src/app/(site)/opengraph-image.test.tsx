// U-09 SEO-AC-02 (unit half) and C-18: the share image is 1200x630 PNG with the confirmed name and
// headline. next/og is a build-time renderer, so here ImageResponse is a double that records its input.
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/og', () => ({
  ImageResponse: class {
    constructor(
      public element: ReactElement,
      public init: { width: number; height: number },
    ) {}
  },
}));

import { profile } from '@/content/profile';

import OpengraphImage, { alt, contentType, size } from './opengraph-image';

describe('opengraph-image', () => {
  it('SEO-AC-02 declares a 1200x630 PNG with the headline as alt text', () => {
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(contentType).toBe('image/png');
    expect(alt).toBe(profile.headline);
  });

  it('SEO-AC-02 the image text is plain ASCII, so the bundled font covers it and the build fetches no font (T-56)', () => {
    // next/og bundles one Latin font; a glyph outside it would be fetched over the network at build time.
    expect(`${profile.name}${profile.headline}`).toMatch(/^[\x20-\x7E]+$/);
  });

  it('SEO-AC-02 C-18 renders the confirmed name and headline, and nothing contact-like', () => {
    const res = OpengraphImage() as unknown as { element: ReactElement; init: { width: number; height: number } };
    expect(res.init).toEqual(size);
    const html = renderToStaticMarkup(res.element);
    expect(html).toContain(profile.name);
    expect(html).toContain(profile.headline);
    expect(html).not.toMatch(/@|mailto:|tel:|\+\d{2}/);
  });
});
