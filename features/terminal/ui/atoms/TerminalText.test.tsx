import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TerminalText } from './TerminalText';

describe('TerminalText Atom', () => {
  it('renders children correctly', () => {
    render(<TerminalText>Test terminal text</TerminalText>);
    expect(screen.getByText('Test terminal text')).toBeInTheDocument();
  });

  it('applies default variant styling', () => {
    render(<TerminalText>Default text</TerminalText>);
    const element = screen.getByText('Default text');
    expect(element).toHaveClass('font-mono', 'whitespace-pre-wrap');
  });

  it('applies error variant correctly', () => {
    render(<TerminalText variant="error">Error message</TerminalText>);
    const element = screen.getByText('Error message');
    expect(element).toHaveStyle({ color: 'var(--theme-destructive)' });
  });

  it('applies success variant correctly', () => {
    render(<TerminalText variant="success">Success message</TerminalText>);
    const element = screen.getByText('Success message');
    expect(element).toHaveStyle({ color: 'var(--theme-accent)' });
  });

  it('applies size classes correctly', () => {
    render(<TerminalText size="xs">Small text</TerminalText>);
    const element = screen.getByText('Small text');
    expect(element).toHaveClass('zoom-text-xs');
  });

  it('handles multiline content', () => {
    const multilineText = `Line 1
Line 2
Line 3`;
    render(<TerminalText>{multilineText}</TerminalText>);
    // Use a more flexible matcher for multiline content
    expect(screen.getByText(content => content.includes('Line 1') && content.includes('Line 2') && content.includes('Line 3'))).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(<TerminalText className="custom-class">Text</TerminalText>);
    const element = screen.getByText('Text');
    expect(element).toHaveClass('custom-class');
  });

  it('preserves whitespace in pre-formatted text', () => {
    const preformatted = '    Indented text    ';
    render(<TerminalText>{preformatted}</TerminalText>);
    // Use a flexible matcher and check the class on the container
    const element = screen.getByText(content => content.includes('Indented text'));
    expect(element).toHaveClass('whitespace-pre-wrap');
  });
});
