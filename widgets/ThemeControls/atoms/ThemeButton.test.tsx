import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ThemeButton } from './ThemeButton';

describe('ThemeButton Atom', () => {
  it('renders theme button correctly', () => {
    render(<ThemeButton onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays theme icon', () => {
    render(<ThemeButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ThemeButton onClick={onClick} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies active state styling', () => {
    render(<ThemeButton onClick={vi.fn()} active />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-accent', 'text-accent-foreground');
  });

  it('applies inactive state styling', () => {
    render(<ThemeButton onClick={vi.fn()} active={false} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('accepts custom className', () => {
    render(<ThemeButton onClick={vi.fn()} className="custom-theme-btn" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-theme-btn');
  });

  it('shows tooltip when provided', () => {
    render(<ThemeButton onClick={vi.fn()} tooltip="Change theme" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Change theme');
  });

  it('handles disabled state', () => {
    render(<ThemeButton onClick={vi.fn()} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('supports different sizes', () => {
    render(<ThemeButton onClick={vi.fn()} size="sm" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8', 'w-8');
  });

  it('uses default size when not specified', () => {
    render(<ThemeButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'w-10');
  });

  it('applies hover effects', () => {
    render(<ThemeButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent/90');
  });

  it('has correct accessibility attributes', () => {
    render(<ThemeButton onClick={vi.fn()} aria-label="Toggle theme" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Toggle theme');
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ThemeButton onClick={onClick} />);
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('shows different icons based on theme', () => {
    const { rerender } = render(<ThemeButton onClick={vi.fn()} currentTheme="dark" />);
    let button = screen.getByRole('button');
    expect(button.querySelector('[data-icon="sun"]')).toBeInTheDocument();
    
    rerender(<ThemeButton onClick={vi.fn()} currentTheme="light" />);
    button = screen.getByRole('button');
    expect(button.querySelector('[data-icon="moon"]')).toBeInTheDocument();
  });

  it('applies focus styling', async () => {
    const user = userEvent.setup();
    render(<ThemeButton onClick={vi.fn()} />);
    
    const button = screen.getByRole('button');
    await user.tab();
    expect(button).toHaveFocus();
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('handles loading state', () => {
    render(<ThemeButton onClick={vi.fn()} loading />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('[data-loading="true"]')).toBeInTheDocument();
  });

  it('maintains circular shape', () => {
    render(<ThemeButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-full');
  });

  it('applies theme-aware colors', () => {
    render(<ThemeButton onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ 
      backgroundColor: 'var(--theme-secondary)',
      color: 'var(--theme-secondary-foreground)'
    });
  });

  it('supports custom icon', () => {
    render(<ThemeButton onClick={vi.fn()} icon="settings" />);
    const button = screen.getByRole('button');
    expect(button.querySelector('[data-icon="settings"]')).toBeInTheDocument();
  });

  it('handles animation on theme change', () => {
    render(<ThemeButton onClick={vi.fn()} animateOnChange />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-all', 'duration-200');
  });
});
