// TERM-AC-11 / CONT-AC-14 (U-04, SQ-05 a): the terminal privacy modal has no email address; its
// "Questions?" contact is LinkedIn. The rest of the modal text is reworded in U-10 (TERM-AC-12).
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PrivacyModal } from './PrivacyModal';

describe('PrivacyModal (U-04)', () => {
  it('TERM-AC-11 has no email address or mailto: link and links to LinkedIn in a new tab', () => {
    const { container } = render(<PrivacyModal onClose={vi.fn()} />);
    expect(container.innerHTML).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|mailto:/i);
    const link = screen.getByRole('link', { name: 'LinkedIn' });
    expect(link.getAttribute('href')).toBe('https://linkedin.com/in/tijo-j-thomaz93');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
