// U-06 HOME-AC-11: the skip link targets main.
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SkipLink } from './SkipLink';

describe('SkipLink', () => {
  it('HOME-AC-11 renders a link with the given label that targets #main', () => {
    render(<SkipLink label="Skip to content" />);
    expect(screen.getByRole('link', { name: 'Skip to content' }).getAttribute('href')).toBe('#main');
  });
});
