import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { IconButton } from './IconButton';

describe('IconButton Atom', () => {
  it('renders icon button correctly', () => {
    render(<IconButton icon="plus" onClick={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays correct icon', () => {
    render(<IconButton icon="minus" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button.querySelector('[data-icon="minus"]')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon="plus" onClick={onClick} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies default size correctly', () => {
    render(<IconButton icon="home" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8', 'w-8');
  });

  it('applies custom size correctly', () => {
    render(<IconButton icon="settings" onClick={vi.fn()} size="lg" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'w-10');
  });

  it('handles disabled state', () => {
    render(<IconButton icon="trash" onClick={vi.fn()} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('accepts custom className', () => {
    render(<IconButton icon="edit" onClick={vi.fn()} className="custom-icon-btn" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-icon-btn');
  });

  it('applies correct default styling', () => {
    render(<IconButton icon="star" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-md', 'border', 'bg-background');
  });

  it('shows tooltip when provided', () => {
    render(<IconButton icon="info" onClick={vi.fn()} tooltip="Information" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Information');
  });

  it('supports different variants', () => {
    render(<IconButton icon="check" onClick={vi.fn()} variant="ghost" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
  });

  it('applies hover effects', () => {
    render(<IconButton icon="heart" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent/90');
  });

  it('has correct accessibility attributes', () => {
    render(<IconButton icon="menu" onClick={vi.fn()} aria-label="Open menu" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Open menu');
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon="close" onClick={onClick} />);
    
    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('applies focus styling', async () => {
    const user = userEvent.setup();
    render(<IconButton icon="search" onClick={vi.fn()} />);
    
    const button = screen.getByRole('button');
    await user.tab();
    expect(button).toHaveFocus();
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('handles loading state', () => {
    render(<IconButton icon="save" onClick={vi.fn()} loading />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('[data-loading="true"]')).toBeInTheDocument();
  });

  it('maintains square aspect ratio', () => {
    render(<IconButton icon="download" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    // Should have equal height and width classes
    expect(button).toHaveClass('h-8', 'w-8');
  });

  it('applies theme colors correctly', () => {
    render(<IconButton icon="upload" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ 
      backgroundColor: 'var(--theme-background)',
      color: 'var(--theme-foreground)',
      borderColor: 'var(--theme-border)'
    });
  });

  it('supports active state', () => {
    render(<IconButton icon="bookmark" onClick={vi.fn()} active />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-accent', 'text-accent-foreground');
  });

  it('handles pressed state animation', () => {
    render(<IconButton icon="like" onClick={vi.fn()} />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('active:scale-95');
  });

  it('supports different border radius', () => {
    render(<IconButton icon="profile" onClick={vi.fn()} rounded="full" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-full');
  });

  it('handles icon color variants', () => {
    render(<IconButton icon="warning" onClick={vi.fn()} iconColor="destructive" />);
    const icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toHaveStyle({ color: 'var(--theme-destructive)' });
  });

  it('prevents double-click when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<IconButton icon="submit" onClick={onClick} disabled />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    await user.click(button);
    
    expect(onClick).not.toHaveBeenCalled();
  });
});
