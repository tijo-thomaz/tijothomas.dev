// TERM-AC-11 (U-04, SQ-05 a): the chat contact buttons offer LinkedIn and GitHub only.
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ContactActions from './ContactActions';
import ContactMessage from './ContactMessage';

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

afterEach(() => vi.restoreAllMocks());

describe.each([
  ['ContactActions', () => render(<ContactActions />)],
  ['ContactMessage', () => render(<ContactMessage />)],
])('%s (U-04)', (_name, renderIt) => {
  it('TERM-AC-11 shows LinkedIn and GitHub buttons and no email, phone or WhatsApp option', () => {
    const { container } = renderIt();
    expect(screen.getByRole('button', { name: /LinkedIn/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /GitHub/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Email|WhatsApp/i })).toBeNull();
    expect(container.innerHTML).not.toMatch(EMAIL);
    expect(container.innerHTML).not.toMatch(/\+44|wa\.me|mailto:/i);
  });

  it('TERM-AC-11 the buttons open the LinkedIn and GitHub profiles in a new tab', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderIt();
    fireEvent.click(screen.getByRole('button', { name: /LinkedIn/ }));
    fireEvent.click(screen.getByRole('button', { name: /GitHub/ }));
    expect(open).toHaveBeenNthCalledWith(1, 'https://linkedin.com/in/tijo-j-thomaz93', '_blank');
    expect(open).toHaveBeenNthCalledWith(2, 'https://github.com/tijo-thomas', '_blank');
  });
});
