import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnimatedDots } from './AnimatedDots';

describe('AnimatedDots Atom', () => {
  it('renders three animated dots by default', () => {
    render(<AnimatedDots />);
    const container = screen.getByRole('generic', { hidden: true });
    const dots = container.children;
    expect(dots).toHaveLength(3);
  });

  it('applies correct base styling', () => {
    render(<AnimatedDots />);
    const container = screen.getByRole('generic', { hidden: true });
    expect(container).toHaveClass('flex', 'gap-1', 'ml-2');
  });

  it('applies bouncing animation to all dots', () => {
    render(<AnimatedDots />);
    const container = screen.getByRole('generic', { hidden: true });
    const dots = Array.from(container.children);
    
    dots.forEach(dot => {
      expect(dot).toHaveClass('animate-bounce');
    });
  });

  it('uses correct color styling', () => {
    render(<AnimatedDots />);
    const container = screen.getByRole('generic', { hidden: true });
    const dots = Array.from(container.children);
    
    dots.forEach(dot => {
      expect(dot).toHaveStyle({ backgroundColor: 'var(--theme-accent)' });
    });
  });

  it('applies animation delays correctly', () => {
    render(<AnimatedDots />);
    const container = screen.getByRole('generic', { hidden: true });
    const dots = Array.from(container.children) as HTMLElement[];
    
    expect(dots[0].style.animationDelay).toBe('');
    expect(dots[1].style.animationDelay).toBe('0.1s');
    expect(dots[2].style.animationDelay).toBe('0.2s');
  });

  it('applies correct dot dimensions', () => {
    render(<AnimatedDots />);
    const container = screen.getByRole('generic', { hidden: true });
    const dots = Array.from(container.children);
    
    dots.forEach(dot => {
      expect(dot).toHaveClass('w-1.5', 'h-1.5', 'rounded-full');
    });
  });

  it('renders as visual indicator for loading state', () => {
    render(<AnimatedDots />);
    const container = screen.getByRole('generic', { hidden: true });
    expect(container).toBeInTheDocument();
  });
});
