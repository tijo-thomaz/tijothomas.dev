// U-06 HOME-AC-17 and CONT-AC-08: LinkedIn and GitHub only, rel me + noopener, availability omitted when null.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { profile } from '@/content/profile';

import { Contact } from './Contact';

describe('Contact', () => {
  it('HOME-AC-17 is section#contact with an h2 and the contact intro', () => {
    const { container } = render(<Contact profile={profile} />);
    const section = container.querySelector<HTMLElement>('section#contact');
    expect(section).not.toBeNull();
    expect(within(section as HTMLElement).getByRole('heading', { level: 2 }).textContent).toBe(
      profile.sections.contact.title,
    );
    expect(container.textContent).toContain(profile.sections.contact.intro);
  });

  it('HOME-AC-17 LinkedIn and GitHub are the only links, each with rel containing me and noopener', () => {
    render(<Contact profile={profile} />);
    const links = screen.getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual([profile.links.linkedin, profile.links.github]);
    const rels = links.map((a) => (a.getAttribute('rel') ?? '').split(/\s+/));
    expect(rels.filter((r) => !(r.includes('me') && r.includes('noopener')))).toEqual([]);
  });

  it('HOME-AC-17 has no email line, no mailto: and no Download CV control', () => {
    const { container } = render(<Contact profile={profile} />);
    expect(container.innerHTML).not.toMatch(/mailto:|@[a-z0-9-]+\.[a-z]{2,}|email|Download CV/i);
  });

  it('HOME-AC-17 CONT-AC-08 omits the availability line when availability is null', () => {
    const { container } = render(<Contact profile={{ ...profile, availability: null }} />);
    expect(container.textContent).not.toContain(profile.labels.availability);
    expect(container.innerHTML).not.toMatch(/\bnull\b|\bundefined\b/);
  });

  it('HOME-AC-17 CONT-AC-08 shows the availability line when it is set', () => {
    render(<Contact profile={{ ...profile, availability: 'Example availability' }} />);
    expect(screen.getByText(/Example availability/).textContent).toContain(profile.labels.availability);
  });
});
