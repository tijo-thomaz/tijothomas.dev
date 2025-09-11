import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TerminalInput } from './TerminalInput';

describe('TerminalInput Atom', () => {
  it('renders input element correctly', () => {
    render(<TerminalInput onSubmit={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies correct default classes', () => {
    render(<TerminalInput />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('ml-2', 'bg-transparent', 'outline-none', 'flex-1', 'font-mono', 'terminal-cursor', 'zoom-text-xs');
  });

  it('accepts custom className', () => {
    render(<TerminalInput className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('handles controlled value correctly', () => {
    render(<TerminalInput value="test value" onChange={vi.fn()} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test value');
  });

  it('has correct default placeholder', () => {
    render(<TerminalInput />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter command...');
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TerminalInput onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('shows auto-typing placeholder when isAutoTyping is true', () => {
    render(<TerminalInput isAutoTyping />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Auto-typing...');
  });

  it('is readonly when auto-typing', () => {
    render(<TerminalInput isAutoTyping />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readonly');
  });

  it('has data attribute for auto-typing state', () => {
    render(<TerminalInput isAutoTyping />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('data-auto-typing', 'true');
  });

  it('applies terminal theme colors', () => {
    render(<TerminalInput />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle({ color: 'var(--theme-text)' });
  });

  it('has correct accessibility attributes', () => {
    render(<TerminalInput />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('spellCheck', 'false');
    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(input).toHaveAttribute('aria-label', 'Terminal command input. Use arrow keys for history, tab for autocomplete, type \'help\' for commands');
  });
});
