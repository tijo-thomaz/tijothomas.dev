// U-06 HOME-AC-11: main navigation order; HOME-AC-17: no CV control.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { profile } from '@/content/profile';

import { Nav } from './Nav';

describe('Nav', () => {
  it('HOME-AC-11 nav[aria-label="Main"] has the brand -> #top, then #work, #experience, #writing, #contact', () => {
    render(<Nav nav={profile.nav} />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const links = within(nav).getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#top', '#work', '#experience', '#writing', '#contact']);
    expect(links[0].textContent).toBe(profile.nav.brand);
    expect(links.slice(1).map((a) => a.textContent)).toEqual(profile.nav.items.map((i) => i.label));
  });

  it('HOME-AC-17 has no Download CV control', () => {
    const { container } = render(<Nav nav={profile.nav} />);
    expect(container.textContent).not.toMatch(/CV/);
  });
});
