import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Text } from './Text';

describe('Text Atom', () => {
  it('renders text content correctly', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('uses paragraph tag by default', () => {
    render(<Text>Default text</Text>);
    expect(screen.getByText('Default text').tagName).toBe('P');
  });

  it('accepts custom element type', () => {
    render(<Text as="span">Span text</Text>);
    expect(screen.getByText('Span text').tagName).toBe('SPAN');
  });

  it('applies default variant styling', () => {
    render(<Text>Body text</Text>);
    const text = screen.getByText('Body text');
    expect(text).toHaveClass('text-base', 'leading-relaxed');
  });

  it('applies heading variants correctly', () => {
    render(<Text variant="h1">Large heading</Text>);
    const heading = screen.getByText('Large heading');
    expect(heading).toHaveClass('text-4xl', 'font-bold', 'tracking-tight');
  });

  it('applies small text variant', () => {
    render(<Text variant="small">Small text</Text>);
    const small = screen.getByText('Small text');
    expect(small).toHaveClass('text-sm');
  });

  it('applies muted text variant', () => {
    render(<Text variant="muted">Muted text</Text>);
    const muted = screen.getByText('Muted text');
    expect(muted).toHaveStyle({ color: 'var(--theme-muted)' });
  });

  it('applies accent text variant', () => {
    render(<Text variant="accent">Accent text</Text>);
    const accent = screen.getByText('Accent text');
    expect(accent).toHaveStyle({ color: 'var(--theme-accent)' });
  });

  it('applies custom className', () => {
    render(<Text className="custom-text">Custom styled</Text>);
    const text = screen.getByText('Custom styled');
    expect(text).toHaveClass('custom-text');
  });

  it('handles different text sizes', () => {
    render(<Text size="lg">Large text</Text>);
    const text = screen.getByText('Large text');
    expect(text).toHaveClass('text-lg');
  });

  it('applies correct font weights', () => {
    render(<Text weight="semibold">Semi bold text</Text>);
    const text = screen.getByText('Semi bold text');
    expect(text).toHaveClass('font-semibold');
  });

  it('handles text alignment', () => {
    render(<Text align="center">Centered text</Text>);
    const text = screen.getByText('Centered text');
    expect(text).toHaveClass('text-center');
  });

  it('applies truncation when specified', () => {
    render(<Text truncate>Very long text that should be truncated</Text>);
    const text = screen.getByText('Very long text that should be truncated');
    expect(text).toHaveClass('truncate');
  });

  it('supports multiline truncation', () => {
    render(<Text truncate="multiline" lines={3}>Multi-line text content</Text>);
    const text = screen.getByText('Multi-line text content');
    expect(text).toHaveClass('line-clamp-3');
  });

  it('handles different color variants', () => {
    render(<Text color="destructive">Error text</Text>);
    const text = screen.getByText('Error text');
    expect(text).toHaveStyle({ color: 'var(--theme-destructive)' });
  });

  it('supports semantic HTML elements', () => {
    render(<Text as="strong">Strong text</Text>);
    expect(screen.getByText('Strong text').tagName).toBe('STRONG');
  });

  it('applies responsive text sizes', () => {
    render(<Text className="text-sm md:text-base">Responsive text</Text>);
    const text = screen.getByText('Responsive text');
    expect(text).toHaveClass('text-sm', 'md:text-base');
  });

  it('handles line height variants', () => {
    render(<Text leading="tight">Tight leading</Text>);
    const text = screen.getByText('Tight leading');
    expect(text).toHaveClass('leading-tight');
  });

  it('supports letter spacing', () => {
    render(<Text tracking="wide">Wide tracking</Text>);
    const text = screen.getByText('Wide tracking');
    expect(text).toHaveClass('tracking-wide');
  });

  it('handles text decoration', () => {
    render(<Text decoration="underline">Underlined text</Text>);
    const text = screen.getByText('Underlined text');
    expect(text).toHaveClass('underline');
  });

  it('applies theme colors correctly', () => {
    render(<Text>Theme text</Text>);
    const text = screen.getByText('Theme text');
    expect(text).toHaveStyle({ color: 'var(--theme-text)' });
  });

  it('supports custom styles via style prop', () => {
    render(<Text style={{ fontSize: '20px' }}>Custom style</Text>);
    const text = screen.getByText('Custom style');
    expect(text).toHaveStyle({ fontSize: '20px' });
  });

  it('handles accessibility attributes', () => {
    render(<Text aria-label="Accessible text">Screen reader text</Text>);
    const text = screen.getByText('Screen reader text');
    expect(text).toHaveAttribute('aria-label', 'Accessible text');
  });

  it('supports data attributes', () => {
    render(<Text data-testid="text-element">Test text</Text>);
    const text = screen.getByTestId('text-element');
    expect(text).toBeInTheDocument();
  });
});
