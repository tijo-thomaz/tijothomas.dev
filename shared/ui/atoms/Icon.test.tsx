import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Icon } from './Icon';

describe('Icon Atom', () => {
  it('renders icon with correct name', () => {
    render(<Icon name="user" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
  });

  it('applies default size correctly', () => {
    render(<Icon name="home" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('w-4', 'h-4');
  });

  it('applies custom size correctly', () => {
    render(<Icon name="settings" size="lg" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('w-6', 'h-6');
  });

  it('applies custom className', () => {
    render(<Icon name="search" className="custom-icon" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('custom-icon');
  });

  it('uses current color by default', () => {
    render(<Icon name="heart" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveStyle({ color: 'currentColor' });
  });

  it('applies custom color', () => {
    render(<Icon name="star" color="red" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveStyle({ color: 'red' });
  });

  it('supports different icon variants', () => {
    render(<Icon name="chevron-right" variant="outline" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('data-variant', 'outline');
  });

  it('has correct accessibility attributes', () => {
    render(<Icon name="info" aria-label="Information" />);
    const icon = screen.getByRole('img');
    expect(icon).toHaveAttribute('aria-label', 'Information');
  });

  it('is hidden from screen readers by default', () => {
    render(<Icon name="decoration" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('can be made visible to screen readers', () => {
    render(<Icon name="warning" aria-hidden="false" />);
    const icon = screen.getByRole('img');
    expect(icon).toHaveAttribute('aria-hidden', 'false');
  });

  it('supports rotation', () => {
    render(<Icon name="arrow-right" rotate={90} />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveStyle({ transform: 'rotate(90deg)' });
  });

  it('supports flip transformations', () => {
    render(<Icon name="arrow-left" flip="horizontal" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveStyle({ transform: 'scaleX(-1)' });
  });

  it('combines multiple transformations', () => {
    render(<Icon name="arrow-up" rotate={45} flip="vertical" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveStyle({ 
      transform: expect.stringMatching(/rotate\(45deg\).*scaleY\(-1\)|scaleY\(-1\).*rotate\(45deg\)/)
    });
  });

  it('handles invalid icon names gracefully', () => {
    render(<Icon name="non-existent-icon" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
  });

  it('supports custom viewBox', () => {
    render(<Icon name="custom" viewBox="0 0 100 100" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('viewBox', '0 0 100 100');
  });

  it('maintains aspect ratio', () => {
    render(<Icon name="square" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('w-4', 'h-4'); // Square dimensions
  });

  it('supports custom stroke width', () => {
    render(<Icon name="circle" strokeWidth={2} />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveAttribute('stroke-width', '2');
  });

  it('applies theme colors correctly', () => {
    render(<Icon name="moon" color="var(--theme-accent)" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveStyle({ color: 'var(--theme-accent)' });
  });

  it('handles responsive sizing', () => {
    render(<Icon name="responsive" className="sm:w-6 sm:h-6" />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toHaveClass('sm:w-6', 'sm:h-6');
  });
});
