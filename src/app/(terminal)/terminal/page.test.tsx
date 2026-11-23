// U-03: /terminal renders the moved terminal app (src/terminal/page.tsx) unchanged.
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// The terminal app itself (Supabase client, sounds, canvas) is covered by e2e: route-boundary double.
vi.mock('../../../terminal/page', () => ({ default: () => <div data-testid="terminal-app" /> }));

import TerminalPage from './page';

describe('/terminal page', () => {
  it('U-03 renders the terminal app', () => {
    render(<TerminalPage />);
    expect(screen.getByTestId('terminal-app')).toBeTruthy();
  });
});
