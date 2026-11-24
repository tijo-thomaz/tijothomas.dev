// U-06 HOME-AC-01: one h1 = headline; the hero line, intro, CTAs (RQ-03 a) and tip come from content.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { profile } from '@/content/profile';

import { Hero } from './Hero';

describe('Hero', () => {
  it('HOME-AC-01 renders exactly one h1 whose text equals profile.headline', () => {
    render(<Hero profile={profile} />);
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toBe(profile.headline);
  });

  it('HOME-AC-01 is section#top with the location, relocation and visa line, the intro and the tip', () => {
    const { container } = render(<Hero profile={profile} />);
    expect(container.querySelector('section#top')).not.toBeNull();
    expect(container.textContent).toContain(
      `${profile.location} · ${profile.relocation.summary} · ${profile.relocation.visaLabel}`,
    );
    expect(container.textContent).toContain(profile.hero.intro);
    expect(container.textContent).toContain(profile.hero.tip);
  });

  it('HOME-AC-01 has "View work" -> #work and "Get in touch" -> #contact (RQ-03 a), and no CV control', () => {
    const { container } = render(<Hero profile={profile} />);
    expect(screen.getByRole('link', { name: 'View work' }).getAttribute('href')).toBe('#work');
    expect(screen.getByRole('link', { name: 'Get in touch' }).getAttribute('href')).toBe('#contact');
    expect(container.textContent).not.toMatch(/CV/);
  });

  it('HOME-AC-01 omits the visa label when sponsorship is not required', () => {
    const p = { ...profile, relocation: { ...profile.relocation, visaSponsorshipRequired: false } };
    const { container } = render(<Hero profile={p} />);
    expect(container.textContent).not.toContain(profile.relocation.visaLabel);
    expect(container.textContent).toContain(`${profile.location} · ${profile.relocation.summary}`);
  });
});
