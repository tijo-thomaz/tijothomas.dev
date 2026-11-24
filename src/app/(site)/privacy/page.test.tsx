// U-10: /privacy renders the notice from src/content/privacy.ts (HOME-AC-28 unit half).
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { privacy } from '@/content/privacy';
import { profile } from '@/content/profile';
import { siteUrl } from '@/lib/site';

import PrivacyPage, { metadata } from './page';

describe('/privacy', () => {
  it('HOME-AC-28 renders exactly one h1 (the notice title) and an h2 per section', () => {
    render(<PrivacyPage />);
    expect(screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent)).toEqual([privacy.title]);
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(privacy.sections.map((s) => s.heading));
  });

  it('HOME-AC-28 links the controller contact to LinkedIn and shows the last-updated date', () => {
    render(<PrivacyPage />);
    const links = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === profile.links.linkedin);
    expect(links.length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(privacy.updated))).toBeTruthy();
  });

  it('HOME-AC-28 SEC-23 the page has no email address and no mailto:', () => {
    expect(renderToStaticMarkup(<PrivacyPage />)).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|mailto:/i);
  });

  it('HOME-AC-28 metadata: title, description and canonical <siteUrl>/privacy; indexable', () => {
    expect(metadata.title).toBe(privacy.title);
    expect(String(metadata.description).length).toBeGreaterThan(20);
    expect(metadata.alternates?.canonical).toBe(`${siteUrl}/privacy`);
    expect(metadata.robots).toBeUndefined();
  });

  it('HOME-AC-27 the page footer links back home and to /privacy', () => {
    const { container } = render(<PrivacyPage />);
    expect(container.querySelector('a[href="/"]')).not.toBeNull();
    expect(container.querySelector('footer a[href="/privacy"]')).not.toBeNull();
  });
});
