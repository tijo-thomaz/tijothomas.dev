// U-06 HOME-AC-18: "© <build year> <name>" and a "Terminal mode" link to /terminal.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { profile } from '@/content/profile';

import { Footer } from './Footer';

describe('Footer', () => {
  it('HOME-AC-18 shows "© <year> <name>" and a Terminal mode link to /terminal', () => {
    const { container } = render(<Footer name={profile.name} year={2031} terminalLabel={profile.labels.terminalMode} />);
    expect(container.querySelector('footer')?.textContent).toContain('© 2031 Tijo Thomas');
    expect(screen.getByRole('link', { name: 'Terminal mode' }).getAttribute('href')).toBe('/terminal');
  });

  it('HOME-AC-18 has no footer tagline (F-66)', () => {
    const { container } = render(<Footer name={profile.name} year={2031} terminalLabel={profile.labels.terminalMode} />);
    expect(container.textContent).not.toMatch(/Built with/);
  });
});
