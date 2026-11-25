// U-07 HOME-AC-15: the How I work region has an h2 and an ordered list of 5 steps.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { profile } from '@/content/profile';

import { HowIWork } from './HowIWork';

describe('HowIWork', () => {
  it('HOME-AC-15 renders a region named by its h2 with an ordered list of 5 titled steps', () => {
    render(<HowIWork steps={profile.howIWork} title={profile.sections.howIWork.title} />);
    const region = screen.getByRole('region', { name: profile.sections.howIWork.title });
    expect(within(region).getByRole('heading', { level: 2 }).textContent).toBe(profile.sections.howIWork.title);
    const list = within(region).getByRole('list');
    expect(list.tagName).toBe('OL');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(items.map((li) => within(li).getByRole('heading', { level: 3 }).textContent)).toEqual(
      profile.howIWork.map((s) => s.title),
    );
    items.forEach((li, i) => expect(li.textContent).toContain(profile.howIWork[i].text));
  });
});
