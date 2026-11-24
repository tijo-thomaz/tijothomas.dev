// U-07: planned items are filtered out at build time unless SHOW_PLANNED is exactly "true".
import { describe, expect, it } from 'vitest';

import { visible } from './visible';

const items = [
  { slug: 'a', status: 'live' },
  { slug: 'b', status: 'planned' },
  { slug: 'c', status: 'in-progress' },
  { slug: 'd', status: 'coming-soon' },
] as const;

describe('visible', () => {
  it('CONT-AC-03 drops planned items when showPlanned is false and keeps the order of the rest', () => {
    expect(visible(items, false).map((i) => i.slug)).toEqual(['a', 'c', 'd']);
  });

  it('CONT-AC-04 keeps planned items when showPlanned is true', () => {
    expect(visible(items, true).map((i) => i.slug)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('CONT-AC-06 returns an empty list when every item is planned and hidden', () => {
    expect(visible([{ status: 'planned' }], false)).toEqual([]);
  });
});
