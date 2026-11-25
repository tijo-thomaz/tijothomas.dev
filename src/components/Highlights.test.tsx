// U-06 HOME-AC-12: N highlights -> N tiles; none -> no region.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { profile } from '@/content/profile';

import { Highlights } from './Highlights';

describe('Highlights', () => {
  it('HOME-AC-12 renders one tile (value + caption) per highlight inside the Highlights region', () => {
    render(<Highlights items={profile.highlights} label={profile.labels.highlights} />);
    const region = screen.getByRole('region', { name: 'Highlights' });
    const tiles = within(region).getAllByRole('listitem');
    expect(tiles).toHaveLength(profile.highlights.length);
    expect(tiles.map((t) => t.textContent)).toEqual(profile.highlights.map((h) => `${h.value}${h.label}`));
  });

  it('HOME-AC-12 renders nothing when there are 0 highlights', () => {
    const { container } = render(<Highlights items={[]} label="Highlights" />);
    expect(container.innerHTML).toBe('');
  });
});
