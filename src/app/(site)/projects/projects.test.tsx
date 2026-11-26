// U-15: /projects, the index of every visible project (PROJ-AC-07, PROJ-AC-16).
import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { profile } from '@/content/profile';
import { work } from '@/content/work';
import { siteUrl } from '@/lib/site';
import { visible } from '@/lib/visible';

import Projects, { metadata } from './page';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('/projects', () => {
  it('PROJ-AC-16 has the title "Projects", a description and a canonical, and is indexable', () => {
    expect(metadata.title).toBe('Projects');
    expect(metadata.description).toBe(profile.sections.work.intro);
    expect(metadata.alternates?.canonical).toBe(`${siteUrl}/projects`);
    expect(metadata.robots).toBeUndefined();
  });

  it('PROJ-AC-07 has one h1 "Projects" and one card per visible item with its name, badge and summary', () => {
    render(<Projects />);
    expect(screen.getAllByRole('heading', { level: 1 }).map((h) => h.textContent)).toEqual(['Projects']);
    const shown = visible(work, false);
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(shown.length);
    shown.forEach((w, i) => {
      expect(within(cards[i]).getByRole('heading', { level: 2 }).textContent).toBe(w.name);
      expect(cards[i].textContent).toContain(w.summary);
    });
    expect(cards[0].textContent).toContain(profile.labels.workStatus['in-progress']);
  });

  it('PROJ-AC-07 planned items appear only with SHOW_PLANNED="true"', () => {
    vi.stubEnv('SHOW_PLANNED', 'true');
    render(<Projects />);
    expect(screen.getAllByRole('article')).toHaveLength(work.length);
  });

  it('PROJ-AC-07 "Case study" links to /work/sluice; "Play" shows only when SLUICE_ORIGIN is set', () => {
    const { unmount } = render(<Projects />);
    expect(screen.getByRole('link', { name: profile.labels.caseStudy }).getAttribute('href')).toBe('/work/sluice');
    expect(screen.queryByRole('link', { name: profile.labels.play })).toBeNull();
    unmount();
    vi.stubEnv('SLUICE_ORIGIN', 'https://sluice-example.vercel.app');
    render(<Projects />);
    expect(screen.getByRole('link', { name: profile.labels.play }).getAttribute('href')).toBe('/play/sluice');
  });

  it('PROJ-AC-07 links home', () => {
    const { container } = render(<Projects />);
    expect(container.querySelector('a[href="/"]')).not.toBeNull();
  });
});
