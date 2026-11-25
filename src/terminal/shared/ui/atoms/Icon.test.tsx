import { createRef } from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  LoadingIcon,
  SendIcon,
  ShieldIcon,
  TerminalIcon,
} from './Icon';

const icons = [
  ['ChevronRightIcon', ChevronRightIcon],
  ['ChevronDownIcon', ChevronDownIcon],
  ['SendIcon', SendIcon],
  ['ShieldIcon', ShieldIcon],
  ['LoadingIcon', LoadingIcon],
  ['TerminalIcon', TerminalIcon],
] as const;

const renderSvg = (ui: React.ReactElement) => {
  const { container } = render(ui);
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('no svg rendered');
  return svg;
};

describe('Icon atoms', () => {
  describe.each(icons)('%s', (name, Icon) => {
    it('renders an svg with a 24x24 viewBox', () => {
      const svg = renderSvg(<Icon />);
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('applies the default size and base classes', () => {
      const svg = renderSvg(<Icon />);
      expect(svg).toHaveClass('inline-block', 'h-5', 'w-5', 'text-current');
    });

    it('applies the size variant', () => {
      const svg = renderSvg(<Icon size="xl" />);
      expect(svg).toHaveClass('h-8', 'w-8');
      expect(svg).not.toHaveClass('h-5');
    });

    it('applies the colour variant', () => {
      const svg = renderSvg(<Icon variant="terminal" />);
      expect(svg).toHaveClass('text-green-400');
    });

    it('merges a custom className', () => {
      const svg = renderSvg(<Icon className="custom-icon" />);
      expect(svg).toHaveClass('custom-icon', 'inline-block');
    });

    it('forwards the ref to the svg element', () => {
      const ref = createRef<SVGSVGElement>();
      render(<Icon ref={ref} />);
      expect(ref.current).toBeInstanceOf(SVGSVGElement);
    });

    it('passes through svg and aria attributes', () => {
      const svg = renderSvg(<Icon aria-hidden="true" data-testid={name} />);
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('data-testid', name);
    });

    it('has the displayName set', () => {
      expect(Icon.displayName).toBe(name);
    });
  });

  it('applies the animate variant to non-loading icons', () => {
    const svg = renderSvg(<ChevronRightIcon animate="pulse" />);
    expect(svg).toHaveClass('animate-pulse');
  });

  it('defaults to no animation', () => {
    const svg = renderSvg(<SendIcon />);
    expect(svg).not.toHaveClass('animate-spin');
    expect(svg).not.toHaveClass('animate-pulse');
  });

  it('LoadingIcon always spins', () => {
    const svg = renderSvg(<LoadingIcon />);
    expect(svg).toHaveClass('animate-spin');
  });

  it('stroked icons use currentColor', () => {
    const svg = renderSvg(<ShieldIcon />);
    expect(svg).toHaveAttribute('stroke', 'currentColor');
  });
});
