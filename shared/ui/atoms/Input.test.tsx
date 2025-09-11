import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Input } from './Input';

describe('Input Atom', () => {
  it('renders input element correctly', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('w-full', 'px-3', 'py-2', 'border', 'rounded-md');
  });

  it('accepts custom className', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('handles controlled value', () => {
    const onChange = vi.fn();
    render(<Input value="test" onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('test');
  });

  it('calls onChange when typing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('supports different input types', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('handles password type', () => {
    render(<Input type="password" />);
    const input = screen.getByLabelText('', { selector: 'input[type="password"]' });
    expect(input).toBeInTheDocument();
  });

  it('displays placeholder text', () => {
    render(<Input placeholder="Enter text..." />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text...');
  });

  it('handles disabled state', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('shows error state styling', () => {
    render(<Input error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500', 'focus:border-red-500');
  });

  it('shows success state styling', () => {
    render(<Input success />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-green-500', 'focus:border-green-500');
  });

  it('supports different sizes', () => {
    render(<Input size="sm" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-2', 'py-1', 'text-sm');
  });

  it('supports large size', () => {
    render(<Input size="lg" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('px-4', 'py-3', 'text-lg');
  });

  it('applies focus styling', async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole('textbox');
    
    await user.click(input);
    expect(input).toHaveFocus();
    expect(input).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('handles required attribute', () => {
    render(<Input required />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('required');
  });

  it('supports maxLength', () => {
    render(<Input maxLength={10} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('supports minLength', () => {
    render(<Input minLength={3} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('minLength', '3');
  });

  it('handles autoComplete attributes', () => {
    render(<Input autoComplete="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autoComplete', 'email');
  });

  it('supports autoFocus', () => {
    render(<Input autoFocus />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveFocus();
  });

  it('handles onFocus and onBlur events', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(<Input onFocus={onFocus} onBlur={onBlur} />);
    
    const input = screen.getByRole('textbox');
    await user.click(input);
    expect(onFocus).toHaveBeenCalled();
    
    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveStyle({ 
      backgroundColor: 'var(--theme-background)',
      color: 'var(--theme-text)',
      borderColor: 'var(--theme-border)'
    });
  });

  it('supports readonly state', () => {
    render(<Input readOnly value="readonly" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readOnly');
    expect(input).toHaveClass('bg-gray-50');
  });

  it('handles input validation states', () => {
    render(<Input pattern="[0-9]*" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('pattern', '[0-9]*');
  });
});
