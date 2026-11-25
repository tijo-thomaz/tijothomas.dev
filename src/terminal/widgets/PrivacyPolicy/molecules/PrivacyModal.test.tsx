// TERM-AC-11 / CONT-AC-14 (U-04, SQ-05 a): the terminal privacy modal has no email address; its
// "Questions?" contact is LinkedIn. TERM-AC-12 (U-10): no inaccurate claims, and a link to /privacy.
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PrivacyModal } from './PrivacyModal';

describe('PrivacyModal', () => {
  it('TERM-AC-11 has no email address or mailto: link and links to LinkedIn in a new tab', () => {
    const { container } = render(<PrivacyModal onClose={vi.fn()} />);
    expect(container.innerHTML).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|mailto:/i);
    const link = screen.getByRole('link', { name: 'LinkedIn' });
    expect(link.getAttribute('href')).toBe('https://linkedin.com/in/tijo-j-thomaz93');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('TERM-AC-12 links to the full notice at /privacy', () => {
    render(<PrivacyModal onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: /privacy notice/i }).getAttribute('href')).toBe('/privacy');
  });

  it('TERM-AC-12 makes none of the inaccurate claims (Vercel sees IP addresses; analytics leave the browser)', () => {
    const { container } = render(<PrivacyModal onClose={vi.fn()} />);
    const text = container.textContent ?? '';
    for (const claim of ['No IP Tracking', 'Data stays in your browser', 'No Personal Data', 'Truly Anonymous', 'Your privacy is protected. Period.']) {
      expect(text).not.toContain(claim);
    }
  });
});
