// U-06: `/` composes the shell (skip link, nav, hero, highlights, contact, footer) from src/content.
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { profile } from '@/content/profile';

import Page from './page';

const html = () => renderToStaticMarkup(<Page />);

describe('(site) home page shell', () => {
  it('HOME-AC-01 renders exactly one h1, equal to profile.headline, and one main landmark', () => {
    render(<Page />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s.map((h) => h.textContent)).toEqual([profile.headline]);
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('HOME-AC-11 the skip link is the first focusable element and targets main#main', () => {
    const { container } = render(<Page />);
    const first = container.querySelector('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    expect(first?.textContent).toBe(profile.labels.skipLink);
    expect(first?.getAttribute('href')).toBe('#main');
    expect(container.querySelector('main#main')).not.toBeNull();
  });

  it('HOME-AC-17 no Download CV control and no email anywhere on /', () => {
    expect(html()).not.toMatch(/Download CV|mailto:|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('HOME-AC-18 the footer shows the year the page is rendered (built) in, and the name', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2031-06-01T12:00:00Z'));
    render(<Page />);
    expect(screen.getByRole('contentinfo').textContent).toContain(`© 2031 ${profile.name}`);
  });

  it('CONT-AC-07 the rendered HTML has 0 mockup placeholder tokens', () => {
    expect(html().match(/\[[A-Z][A-Z :]+/g) ?? []).toEqual([]);
  });

  it('CONT-AC-08 the rendered HTML has no "undefined"/"null" text and no empty text elements', () => {
    const out = html();
    expect(out).not.toMatch(/>\s*(undefined|null)\s*</);
    expect(out.match(/<(p|span|li|h[1-6]|a|strong)(\s[^>]*)?>\s*<\/\1>/g) ?? []).toEqual([]);
  });

  it('HOME-AC-02 one h1, every section title an h2, work card names h3, and no heading level skipped', () => {
    const { container } = render(<Page />);
    const levels = [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1]));
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    expect(levels[0]).toBe(1);
    const skips = levels.filter((l, i) => i > 0 && l > levels[i - 1] + 1);
    expect(skips).toEqual([]);
    const h2 = [...container.querySelectorAll('h2')].map((h) => h.textContent);
    expect(h2).toEqual([
      profile.sections.work.title,
      profile.sections.experience.title,
      profile.sections.howIWork.title,
      profile.sections.writing.title,
      profile.sections.contact.title,
    ]);
    expect([...container.querySelectorAll('#work article h3')].map((h) => h.textContent)).toEqual(['PromptShield']);
  });

  it('HOME-AC-09 every in-page link targets an element id that exists', () => {
    const { container } = render(<Page />);
    const hrefs = [...container.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href') ?? '');
    expect(hrefs.length).toBeGreaterThanOrEqual(8);
    expect(hrefs.filter((h) => !container.querySelector(h))).toEqual([]);
  });

  it('CONT-AC-03 with SHOW_PLANNED unset or not "true", planned work and post titles are not in the DOM', () => {
    for (const flag of [undefined, 'TRUE', '1']) {
      vi.stubEnv('SHOW_PLANNED', flag as string);
      const out = html();
      expect(out).not.toContain('fde-cloud-spine');
      expect(out).not.toContain('fde-mcp-gateway');
      vi.unstubAllEnvs();
    }
  });

  it('CONT-AC-04 with SHOW_PLANNED="true", planned items appear with a "Planned" badge', () => {
    vi.stubEnv('SHOW_PLANNED', 'true');
    render(<Page />);
    const card = screen.getByRole('heading', { level: 3, name: 'fde-mcp-gateway' }).closest('article');
    expect(card?.textContent).toContain('Planned · Dec 2026');
    vi.unstubAllEnvs();
  });

  it('U-03 renders no terminal input, toolbar or chat trigger', () => {
    render(<Page />);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: /theme|zoom|sound|version|chat/i })).toBeNull();
  });
});
