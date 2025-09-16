import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TerminalPrompt } from './TerminalPrompt';

describe('TerminalPrompt Atom', () => {
  it('renders prompt symbol correctly', () => {
    render(<TerminalPrompt />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('hides dollar symbol when showDollar is false', () => {
    render(<TerminalPrompt showDollar={false} />);
    expect(screen.queryByText('$')).not.toBeInTheDocument();
  });

  it('displays user, host and path correctly', () => {
    render(<TerminalPrompt user="testuser" host="testhost" path="/test/path" />);
    expect(screen.getByText('testuser@testhost:')).toBeInTheDocument();
    expect(screen.getByText('/test/path')).toBeInTheDocument();
  });

  it('applies correct default styling', () => {
    render(<TerminalPrompt />);
    const prompt = screen.getByText('$');
    expect(prompt).toHaveStyle({ color: 'var(--theme-accent)' });
  });

  it('uses defaults for user, host and path', () => {
    render(<TerminalPrompt />);
    expect(screen.getByText('tijo@tijothomas.dev:')).toBeInTheDocument();
    expect(screen.getByText('~')).toBeInTheDocument();
  });

  it('uses correct color scheme for different parts', () => {
    render(<TerminalPrompt />);
    
    const userHost = screen.getByText('tijo@tijothomas.dev:');
    const path = screen.getByText('~');
    const prompt = screen.getByText('$');
    
    expect(userHost).toHaveStyle({ color: 'var(--theme-muted)' });
    expect(path).toHaveStyle({ color: 'var(--theme-accent)' });
    expect(prompt).toHaveStyle({ color: 'var(--theme-accent)' });
  });

  it('accepts custom className', () => {
    render(<TerminalPrompt className="custom-prompt" />);
    const container = screen.getByText('$').parentElement;
    expect(container).toHaveClass('custom-prompt');
  });

  it('handles very long paths gracefully', () => {
    const longPath = '/very/long/path/that/might/overflow/the/terminal/width';
    render(<TerminalPrompt path={longPath} />);
    expect(screen.getByText(longPath)).toBeInTheDocument();
  });

  it('renders minimalist prompt when no user/path provided', () => {
    render(<TerminalPrompt />);
    const container = screen.getByText('$').parentElement;
    expect(container?.children).toHaveLength(1); // Only the $ symbol
  });

  it('displays hostname when provided', () => {
    render(<TerminalPrompt user="tijo" hostname="portfolio" path="~" />);
    expect(screen.getByText('tijo')).toBeInTheDocument();
    expect(screen.getByText('portfolio')).toBeInTheDocument();
    expect(screen.getByText('~')).toBeInTheDocument();
  });

  it('shows git branch when provided', () => {
    render(<TerminalPrompt user="tijo" path="~/project" gitBranch="main" />);
    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText('(')).toBeInTheDocument();
    expect(screen.getByText(')')).toBeInTheDocument();
  });

  it('applies font-mono class for consistent terminal styling', () => {
    render(<TerminalPrompt />);
    const container = screen.getByText('$').parentElement;
    expect(container).toHaveClass('font-mono');
  });
});
