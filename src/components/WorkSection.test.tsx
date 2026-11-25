// U-07: Work section and cards (HOME-AC-13), metric honesty (CONT-AC-01, CONT-AC-02), empty state (CONT-AC-06).
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { profile } from '@/content/profile';
import type { WorkItem } from '@/content/types';
import { work } from '@/content/work';

import { WorkSection } from './WorkSection';

const { labels, sections } = profile;
const base: WorkItem = {
  slug: 'demo',
  name: 'Demo',
  subtitle: 'A demo project',
  status: 'in-progress',
  target: '2026-12',
  summary: 'Problem: x. Built y.',
  metric: { label: 'Duplicate charges under 30% redelivery', value: null },
  stack: ['Go', 'PostgreSQL'],
};
const renderWork = (items: readonly WorkItem[]) =>
  render(<WorkSection items={items} section={sections.work} labels={labels} />);

describe('WorkSection', () => {
  it('HOME-AC-13 is section#work with the h2 and intro, and one article with an h3 per item', () => {
    const { container } = renderWork(work);
    expect(container.querySelector('section#work')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(sections.work.title);
    expect(container.textContent).toContain(sections.work.intro);
    expect(screen.getAllByRole('article')).toHaveLength(work.length);
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(work.map((w) => w.name));
  });

  it('HOME-AC-13 a card shows the subtitle, status badge with target, summary and stack', () => {
    renderWork([base]);
    const card = screen.getByRole('article');
    expect(card.textContent).toContain('A demo project');
    expect(within(card).getByText('In progress · Dec 2026')).toBeTruthy();
    expect(card.textContent).toContain('Problem: x. Built y.');
    expect(card.textContent).toContain('Go · PostgreSQL');
  });

  it('HOME-AC-13 a live item shows its confirmed badge label (PromptShield: "Proof of concept")', () => {
    renderWork(work.filter((w) => w.slug === 'promptshield'));
    expect(screen.getByText('Proof of concept')).toBeTruthy();
  });

  it('CONT-AC-01 a null metric value reads exactly "Not yet measured" and holds no digit; the label may', () => {
    const { container } = renderWork([base]);
    const value = container.querySelector('.metric-value');
    expect(value?.textContent).toBe(labels.notMeasured);
    expect(value?.textContent).toMatch(/^\D*$/);
    expect(container.querySelector('.metric-label')?.textContent).toContain('30%');
  });

  it('CONT-AC-02 a set metric value appears verbatim next to its label', () => {
    const { container } = renderWork([{ ...base, metric: { label: 'Detection rate', value: '97 of 100' } }]);
    expect(container.querySelector('.metric-label')?.textContent).toContain('Detection rate');
    expect(container.querySelector('.metric-value')?.textContent).toBe('97 of 100');
  });

  it('CONT-AC-08 a null metric renders no metric row at all', () => {
    const { container } = renderWork([{ ...base, metric: null }]);
    expect(container.querySelector('.metric')).toBeNull();
  });

  it('HOME-AC-13 "Read the case study" appears only when caseStudyUrl is set, and links to it', () => {
    renderWork([base]);
    expect(screen.queryByRole('link', { name: labels.caseStudy })).toBeNull();
    renderWork([{ ...base, slug: 'with-link', caseStudyUrl: 'https://example.com/case' }]);
    expect(screen.getByRole('link', { name: labels.caseStudy }).getAttribute('href')).toBe('https://example.com/case');
  });

  it('CONT-AC-06 with every item hidden, section#work keeps its h2 and shows the empty-state line', () => {
    const { container } = renderWork([]);
    expect(container.querySelector('section#work h2')?.textContent).toBe(sections.work.title);
    expect(container.textContent).toContain(sections.work.empty);
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});
