import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommandOutput } from './CommandOutput';

describe('CommandOutput Molecule', () => {
  it('renders output content correctly', () => {
    render(<CommandOutput output="Test output" />);
    expect(screen.getByText('Test output')).toBeInTheDocument();
  });

  it('handles multiline output', () => {
    const multilineOutput = `Line 1
Line 2
Line 3`;
    render(<CommandOutput output={multilineOutput} />);
    expect(screen.getByText(content => content.includes('Line 1') && content.includes('Line 2'))).toBeInTheDocument();
  });

  it('applies default variant styling', () => {
    render(<CommandOutput output="Default output" />);
    const output = screen.getByText('Default output');
    expect(output).toHaveClass('font-mono', 'whitespace-pre-wrap');
  });

  it('applies error variant styling', () => {
    render(<CommandOutput output="Error message" type="error" />);
    const output = screen.getByText('Error message');
    expect(output).toHaveStyle({ color: 'var(--theme-destructive)' });
  });

  it('applies success variant styling', () => {
    render(<CommandOutput output="Success message" type="success" />);
    const output = screen.getByText('Success message');
    expect(output).toHaveStyle({ color: 'var(--theme-accent)' });
  });

  it('accepts custom className', () => {
    render(<CommandOutput output="Custom output" className="custom-output" />);
    const container = screen.getByText('Custom output').parentElement;
    expect(container).toHaveClass('custom-output');
  });

  it('handles empty output', () => {
    render(<CommandOutput output="" />);
    // Should render but with empty content
    const container = document.querySelector('[data-testid="command-output"]') || 
                      document.querySelector('.command-output') ||
                      screen.getByText('').parentElement;
    expect(container).toBeInTheDocument();
  });

  it('preserves formatting in output', () => {
    const formattedOutput = `  Indented
    More indented
Normal`;
    render(<CommandOutput output={formattedOutput} />);
    const output = screen.getByText(content => content.includes('Indented'));
    expect(output).toHaveClass('whitespace-pre-wrap');
  });

  it('handles HTML entities in output', () => {
    render(<CommandOutput output="&lt;script&gt;alert('test')&lt;/script&gt;" />);
    expect(screen.getByText("&lt;script&gt;alert('test')&lt;/script&gt;")).toBeInTheDocument();
  });

  it('applies warning type styling', () => {
    render(<CommandOutput output="Warning message" type="warning" />);
    const output = screen.getByText('Warning message');
    expect(output).toHaveStyle({ color: 'var(--theme-warning)' });
  });

  it('handles very long output', () => {
    const longOutput = 'A'.repeat(1000);
    render(<CommandOutput output={longOutput} />);
    expect(screen.getByText(longOutput)).toBeInTheDocument();
  });

  it('supports loading state', () => {
    render(<CommandOutput output="" loading />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('uses atomic TerminalText component', () => {
    render(<CommandOutput output="Atomic test" />);
    const output = screen.getByText('Atomic test');
    // Should have TerminalText styling
    expect(output).toHaveClass('font-mono', 'whitespace-pre-wrap');
  });

  it('handles special characters correctly', () => {
    const specialOutput = `Special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?`;
    render(<CommandOutput output={specialOutput} />);
    expect(screen.getByText(specialOutput)).toBeInTheDocument();
  });

  it('supports animation when specified', () => {
    render(<CommandOutput output="Animated output" animated />);
    const container = screen.getByText('Animated output').parentElement;
    expect(container).toHaveClass('animate-fade-in');
  });

  it('applies correct margins and padding', () => {
    render(<CommandOutput output="Spaced output" />);
    const container = screen.getByText('Spaced output').parentElement;
    expect(container).toHaveClass('py-1');
  });

  it('handles command output with ANSI codes', () => {
    const ansiOutput = '\u001b[31mRed text\u001b[0m Normal text';
    render(<CommandOutput output={ansiOutput} />);
    // Should handle ANSI codes gracefully
    expect(screen.getByText(content => content.includes('Red text'))).toBeInTheDocument();
  });
});
