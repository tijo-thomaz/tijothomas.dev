import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Text, textVariants } from './Text';

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

  it('renders heading elements via `as`', () => {
    render(<Text as="h1">Heading</Text>);
    expect(screen.getByRole('heading', { level: 1, name: 'Heading' })).toBeInTheDocument();
  });

  it('supports semantic HTML elements', () => {
    render(<Text as="strong">Strong text</Text>);
    expect(screen.getByText('Strong text').tagName).toBe('STRONG');
  });

  it('applies the default variants', () => {
    render(<Text>Body text</Text>);
    expect(screen.getByText('Body text')).toHaveClass(
      'text-foreground',
      'text-base',
      'font-normal',
      'text-left',
    );
  });

  it('applies the muted variant', () => {
    render(<Text variant="muted">Muted text</Text>);
    const text = screen.getByText('Muted text');
    expect(text).toHaveClass('text-muted-foreground');
    expect(text).not.toHaveClass('text-foreground');
  });

  it('applies the accent variant', () => {
    render(<Text variant="accent">Accent text</Text>);
    expect(screen.getByText('Accent text')).toHaveClass('text-accent-foreground');
  });

  it('applies the destructive variant', () => {
    render(<Text variant="destructive">Error text</Text>);
    expect(screen.getByText('Error text')).toHaveClass('text-destructive');
  });

  it('applies the terminal variant with a monospace font', () => {
    render(<Text variant="terminal">$ ls</Text>);
    expect(screen.getByText('$ ls')).toHaveClass('text-green-400', 'font-mono');
  });

  it('handles different text sizes', () => {
    render(<Text size="lg">Large text</Text>);
    const text = screen.getByText('Large text');
    expect(text).toHaveClass('text-lg');
    expect(text).not.toHaveClass('text-base');
  });

  it('applies the small size', () => {
    render(<Text size="sm">Small text</Text>);
    expect(screen.getByText('Small text')).toHaveClass('text-sm');
  });

  it('applies correct font weights', () => {
    render(<Text weight="semibold">Semi bold text</Text>);
    expect(screen.getByText('Semi bold text')).toHaveClass('font-semibold');
  });

  it('handles text alignment', () => {
    render(<Text align="center">Centered text</Text>);
    expect(screen.getByText('Centered text')).toHaveClass('text-center');
  });

  it('handles text transform', () => {
    render(<Text transform="uppercase">Shout</Text>);
    expect(screen.getByText('Shout')).toHaveClass('uppercase');
  });

  it('applies truncation when specified', () => {
    render(<Text truncate>Very long text that should be truncated</Text>);
    expect(screen.getByText('Very long text that should be truncated')).toHaveClass('truncate');
  });

  it('does not truncate by default', () => {
    render(<Text>Plain text</Text>);
    expect(screen.getByText('Plain text')).not.toHaveClass('truncate');
  });

  it('applies the gradient classes when specified', () => {
    render(<Text gradient>Gradient text</Text>);
    expect(screen.getByText('Gradient text')).toHaveClass('bg-clip-text', 'text-transparent');
  });

  it('applies custom className', () => {
    render(<Text className="custom-text">Custom styled</Text>);
    expect(screen.getByText('Custom styled')).toHaveClass('custom-text');
  });

  it('applies responsive text sizes', () => {
    render(<Text className="text-sm md:text-base">Responsive text</Text>);
    expect(screen.getByText('Responsive text')).toHaveClass('text-sm', 'md:text-base');
  });

  it('lets className override a conflicting size via tailwind-merge', () => {
    render(<Text size="lg" className="text-xs">Overridden</Text>);
    const text = screen.getByText('Overridden');
    expect(text).toHaveClass('text-xs');
    expect(text).not.toHaveClass('text-lg');
  });

  it('supports custom styles via style prop', () => {
    render(<Text style={{ fontSize: '20px' }}>Custom style</Text>);
    expect(screen.getByText('Custom style')).toHaveStyle({ fontSize: '20px' });
  });

  it('handles accessibility attributes', () => {
    render(<Text aria-label="Accessible text">Screen reader text</Text>);
    expect(screen.getByText('Screen reader text')).toHaveAttribute('aria-label', 'Accessible text');
  });

  it('supports data attributes', () => {
    render(<Text data-testid="text-element">Test text</Text>);
    expect(screen.getByTestId('text-element')).toBeInTheDocument();
  });

  it('forwards the ref to the rendered element', () => {
    const ref = createRef<HTMLElement>();
    render(<Text ref={ref}>Ref text</Text>);
    expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
  });

  it('exports textVariants for reuse', () => {
    expect(textVariants({ size: 'xl', weight: 'bold' })).toContain('text-xl');
    expect(textVariants({ size: 'xl', weight: 'bold' })).toContain('font-bold');
  });
});
