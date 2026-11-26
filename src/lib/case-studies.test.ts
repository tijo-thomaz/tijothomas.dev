// U-15: case-study registry and source links (PROJ-AC-08, PROJ-AC-09).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { WorkItem } from '@/content/types';
import { work } from '@/content/work';

import { caseStudies, caseStudyItems } from './case-studies';

const here = path.dirname(fileURLToPath(import.meta.url));
const item = (over: Partial<WorkItem> = {}): WorkItem => ({
  slug: 'demo', name: 'Demo', subtitle: 'A demo', status: 'in-progress', summary: 'x', metric: null, stack: [], ...over,
});

describe('case-study registry', () => {
  it('PROJ-AC-08 every registry item with caseStudy: true has exactly one case study, and every case study has an item', () => {
    const flagged = work.filter((w) => w.caseStudy).map((w) => w.slug).sort();
    expect(caseStudies.map((c) => c.slug).sort()).toEqual(flagged);
    expect(new Set(caseStudies.map((c) => c.slug)).size).toBe(caseStudies.length);
  });

  it('PROJ-AC-08 case-study pages are the visible items with a case study; planned ones only with SHOW_PLANNED', () => {
    const items = [item({ slug: 'a', caseStudy: true }), item({ slug: 'b' }), item({ slug: 'c', caseStudy: true, status: 'planned' })];
    expect(caseStudyItems(items, false).map((w) => w.slug)).toEqual(['a']);
    expect(caseStudyItems(items, true).map((w) => w.slug)).toEqual(['a', 'c']);
    expect(caseStudyItems(work, false).map((w) => w.slug)).toEqual(['sluice']);
  });
});

describe('case-study sources', () => {
  const sources = caseStudies.flatMap((c) => c.whyItMatters.sources.map((s) => ({ ...s, slug: c.slug })));

  it('PROJ-AC-09 every source is an absolute https URL with a label', () => {
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.filter((s) => new URL(s.href).protocol !== 'https:' || !s.label.trim())).toEqual([]);
  });

  it('PROJ-AC-09 every source line in the content file cites a P-xx row', () => {
    const uncited = sources.filter(({ slug, href }) => {
      const file = fs.readFileSync(path.join(here, `../content/case-studies/${slug}.ts`), 'utf8');
      const line = file.split(/\r?\n/).find((l) => l.includes(`'${href}'`)) ?? '';
      return !/\/\/ .*\bP-\d{2}\b/.test(line);
    });
    expect(uncited.map((s) => s.href)).toEqual([]);
  });
});
