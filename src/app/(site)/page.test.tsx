// U-03 scope 3: `/` is a hello-world placeholder until U-06: one <main>, no terminal, no facts.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Page from './page';

describe('(site) hello-world page', () => {
  it('U-03 renders exactly one main landmark', () => {
    const { container } = render(<Page />);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(container.querySelectorAll('main')).toHaveLength(1);
  });

  it('U-03 renders no terminal input, toolbar or chat trigger', () => {
    render(<Page />);
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: /theme|zoom|sound|version|chat/i })).toBeNull();
  });

  it('U-03 contains no profile facts or contact details (facts arrive with U-05/U-06)', () => {
    const { container } = render(<Page />);
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/Bet365|Infosys|@gmail\.com|\+44|wa\.me/i);
  });
});
