// U-07 HOME-AC-14: experience timeline order, "present"/"Now", gap tiles, no empty lists.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { experience } from '@/content/experience';
import { profile } from '@/content/profile';
import type { ExperienceEntry } from '@/content/types';

import { ExperienceTimeline } from './ExperienceTimeline';

const { labels, sections } = profile;
const renderIt = (entries: readonly ExperienceEntry[]) =>
  render(<ExperienceTimeline entries={entries} section={sections.experience} labels={labels} />);

describe('ExperienceTimeline', () => {
  it('HOME-AC-14 is section#experience with the h2 and intro', () => {
    const { container } = renderIt(experience);
    expect(container.querySelector('section#experience h2')?.textContent).toBe(sections.experience.title);
    expect(container.textContent).toContain(sections.experience.intro);
  });

  it('HOME-AC-14 sorts entries by start date descending, whatever the input order', () => {
    const { container } = renderIt([...experience].reverse());
    const order = Array.from(container.querySelectorAll('[data-entry]')).map((e) => e.getAttribute('data-entry'));
    // Hard-coded expected order, so the test does not reuse the implementation's comparator.
    expect(order).toEqual(['opteamix', 'relocation', 'bet365', 'infosys', 'netobjex', 'qburst', 'speridian']);
  });

  it('HOME-AC-14 only the end: null entry shows "present" and the "Now" badge', () => {
    const { container } = renderIt(experience);
    const current = container.querySelector('[data-entry="opteamix"]');
    expect(current?.textContent).toContain('Apr 2026 – present');
    expect(current?.textContent).toContain(labels.now);
    const others = Array.from(container.querySelectorAll('[data-entry]')).filter((e) => e !== current);
    expect(others.filter((e) => e.textContent?.includes(labels.present) || e.querySelector('.badge-now'))).toEqual([]);
  });

  it('HOME-AC-14 a gap entry has a dashed tile and no card', () => {
    const { container } = renderIt(experience);
    const gap = container.querySelector('[data-entry="relocation"]');
    expect(gap?.querySelector('.tile-gap')?.textContent).toBe('Move');
    expect(gap?.querySelector('.exp-card')).toBeNull();
    expect(gap?.textContent).toContain('Relocation: UK to India with family');
    expect(gap?.textContent).toContain('Dec 2025 – Mar 2026');
  });

  it('HOME-AC-14 a job shows company (h3), title, dates, location with work mode, and bullets', () => {
    const { container } = renderIt(experience);
    const b = container.querySelector('[data-entry="bet365"]');
    expect(b?.querySelector('h3')?.textContent).toBe('bet365 Group Ltd');
    expect(b?.textContent).toContain('Software Developer');
    expect(b?.textContent).toContain('Feb 2023 – Nov 2025');
    expect(b?.textContent).toContain('Manchester, UK · Hybrid');
    expect(b?.querySelectorAll('li')).toHaveLength(4);
  });

  it('HOME-AC-14 the monogram tile is aria-hidden', () => {
    const { container } = renderIt(experience);
    const tiles = Array.from(container.querySelectorAll('.monogram'));
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.filter((t) => t.getAttribute('aria-hidden') !== 'true')).toEqual([]);
  });

  it('HOME-AC-14 an entry with 0 bullets renders no <ul>', () => {
    const job = experience.find((e) => e.id === 'qburst');
    if (job?.kind !== 'job') throw new Error('fixture');
    const { container } = renderIt([{ ...job, bullets: [] }]);
    expect(container.querySelector('[data-entry="qburst"] ul')).toBeNull();
    expect(screen.getByRole('heading', { level: 3 }).textContent).toBe('QBurst Technologies');
  });
});
