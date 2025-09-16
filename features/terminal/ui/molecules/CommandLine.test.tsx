import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommandLine } from './CommandLine';

describe('CommandLine Molecule', () => {
  it('renders command correctly', () => {
    render(<CommandLine command="help" />);
    expect(screen.getByText('help')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('handles empty command', () => {
    render(<CommandLine command="" />);
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('displays complex commands', () => {
    render(<CommandLine command="git log --oneline" />);
    expect(screen.getByText('git log --oneline')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<CommandLine command="test" className="custom-class" />);
    const container = screen.getByText('test').closest('div')?.parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('uses atomic components correctly', () => {
    render(<CommandLine command="promptshield" />);
    
    // Should contain both the prompt symbol and command text
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('promptshield')).toBeInTheDocument();
  });

  it('handles special characters in commands', () => {
    render(<CommandLine command="echo 'Hello, World!'" />);
    expect(screen.getByText("echo 'Hello, World!'")).toBeInTheDocument();
  });
});
