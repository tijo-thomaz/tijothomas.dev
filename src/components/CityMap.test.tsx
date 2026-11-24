// U-08: the isometric city is working navigation (HOME-AC-08) and a faithful, themable port of the
// mockup SVG (HOME-AC-10). Labels come from src/content.
import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { profile } from '@/content/profile';

import { CityMap } from './CityMap';

const renderMap = () => render(<CityMap city={profile.city} nav={profile.nav} />);

describe('CityMap', () => {
  it('HOME-AC-10 the svg keeps the mockup viewBox inside a nav named from content', () => {
    const { container } = renderMap();
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('viewBox')).toBe('-418 -303 837 794');
    expect(svg?.getAttribute('class')).toContain('city-map');
    // No img role: it would make the building links presentational (hidden from AT).
    expect(svg?.getAttribute('role')).toBeNull();
    const nav = screen.getByRole('navigation', { name: profile.city.label });
    expect(nav.contains(svg)).toBe(true);
  });

  it('HOME-AC-08 exactly 4 building links, named Experience, Work, Writing and Contact, each to its section', () => {
    const { container } = renderMap();
    const links = Array.from(container.querySelectorAll('svg a'));
    expect(links.map((a) => [a.getAttribute('aria-label'), a.getAttribute('href')]).sort()).toEqual([
      ['Contact', '#contact'],
      ['Experience', '#experience'],
      ['Work', '#work'],
      ['Writing', '#writing'],
    ]);
  });

  it('HOME-AC-08 building names come from the nav content (no hard-coded copy)', () => {
    const nav = { ...profile.nav, items: profile.nav.items.map((i) => ({ ...i, label: `${i.label}!` })) };
    const { container } = render(<CityMap city={profile.city} nav={nav} />);
    expect(Array.from(container.querySelectorAll('svg a')).map((a) => a.getAttribute('aria-label')).sort()).toEqual(
      ['Contact!', 'Experience!', 'Work!', 'Writing!'],
    );
  });

  it('HOME-AC-10 accent fills use var(--accent) through a class; no {{accent}} or literal accent colour remains', () => {
    const html = renderToStaticMarkup(<CityMap city={profile.city} nav={profile.nav} />);
    expect(html).not.toContain('{{accent}}');
    expect(html).not.toMatch(/#ff7a33/i);
    expect((html.match(/class="accent"/g) ?? []).length).toBe(9);
  });

  it('HOME-AC-10 the city signposts show the timeline locations from content, in order', () => {
    const { container } = renderMap();
    const boards = Array.from(container.querySelectorAll('.city-sign text')).map((t) => t.textContent);
    expect(boards).toEqual([...profile.city.signposts]);
  });

  it('HOME-AC-20 the car is its own group so CSS can animate it', () => {
    const { container } = renderMap();
    const car = container.querySelector('g.city-car');
    expect(car).not.toBeNull();
    expect(car?.querySelectorAll('polygon').length).toBe(6);
    expect(car?.querySelectorAll('ellipse').length).toBe(2);
  });

  it('HOME-AC-08 the map holds no other links or focusable elements', () => {
    renderMap();
    expect(screen.getAllByRole('link')).toHaveLength(4);
  });
});
