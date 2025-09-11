import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SendButton } from './SendButton';

describe('SendButton Atom', () => {
  it('renders send button correctly', () => {
    render(<SendButton onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays send icon by default', () => {
    render(<SendButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SendButton onClick={onClick} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state correctly', () => {
    render(<SendButton onClick={vi.fn()} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies loading state correctly', () => {
    render(<SendButton onClick={vi.fn()} loading />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Should show loading indicator instead of send icon
    expect(button.querySelector('[data-loading="true"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SendButton onClick={vi.fn()} className="custom-send" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-send');
  });

  it('has correct default styling', () => {
    render(<SendButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-full', 'p-2', 'transition-colors');
  });

  it('uses accent color for background', () => {
    render(<SendButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ backgroundColor: 'var(--theme-accent)' });
  });

  it('supports different variants', () => {
    render(<SendButton onClick={vi.fn()} variant="outline" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'border-current');
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SendButton onClick={onClick} />);
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('shows tooltip when provided', () => {
    render(<SendButton onClick={vi.fn()} title="Send message" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Send message');
  });

  it('prevents double-click when loading', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SendButton onClick={onClick} loading />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    await user.click(button);
    
    expect(onClick).not.toHaveBeenCalled();
  });

  it('has correct ARIA attributes', () => {
    render(<SendButton onClick={vi.fn()} aria-label="Send message" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Send message');
  });

  it('applies hover and focus states', () => {
    render(<SendButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:opacity-80', 'focus:outline-none', 'focus:ring-2');
  });

  it('supports different sizes', () => {
    render(<SendButton onClick={vi.fn()} size="sm" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('p-1');
  });

  it('maintains aspect ratio', () => {
    render(<SendButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-10', 'h-10');
  });

  it('handles form submission', () => {
    render(
      <form onSubmit={vi.fn()}>
        <SendButton onClick={vi.fn()} type="submit" />
      </form>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });
});
