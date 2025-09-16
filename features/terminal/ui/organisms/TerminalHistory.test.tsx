import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TerminalHistory } from './TerminalHistory';

describe('TerminalHistory Organism', () => {
  const mockHistory = [
    { command: 'ls', output: 'file1.txt\nfile2.txt', type: 'default' as const, id: '1' },
    { command: 'pwd', output: '/home/user', type: 'default' as const, id: '2' },
    { command: 'error', output: 'Command not found', type: 'error' as const, id: '3' }
  ];

  it('renders command history correctly', () => {
    render(<TerminalHistory history={mockHistory} />);
    
    expect(screen.getByText('ls')).toBeInTheDocument();
    expect(screen.getByText('pwd')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('displays output for each command', () => {
    render(<TerminalHistory history={mockHistory} />);
    
    expect(screen.getByText('file1.txt')).toBeInTheDocument();
    expect(screen.getByText('/home/user')).toBeInTheDocument();
    expect(screen.getByText('Command not found')).toBeInTheDocument();
  });

  it('applies correct styling for error commands', () => {
    render(<TerminalHistory history={mockHistory} />);
    
    const errorOutput = screen.getByText('Command not found');
    expect(errorOutput).toHaveStyle({ color: 'var(--theme-destructive)' });
  });

  it('handles empty history', () => {
    render(<TerminalHistory history={[]} />);
    
    const container = document.querySelector('[data-testid="terminal-history"]') ||
                      document.querySelector('.terminal-history');
    expect(container).toBeInTheDocument();
  });

  it('scrolls to bottom when new entries are added', () => {
    const { rerender } = render(<TerminalHistory history={mockHistory} />);
    
    const newHistory = [...mockHistory, { 
      command: 'new-command', 
      output: 'new output', 
      type: 'default' as const, 
      id: '4' 
    }];
    
    rerender(<TerminalHistory history={newHistory} autoScroll />);
    expect(screen.getByText('new-command')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<TerminalHistory history={mockHistory} className="custom-history" />);
    
    const container = document.querySelector('.custom-history') ||
                      screen.getByText('ls').closest('.custom-history');
    expect(container).toBeInTheDocument();
  });

  it('renders command prompts correctly', () => {
    render(<TerminalHistory history={mockHistory} showPrompt />);
    
    const prompts = screen.getAllByText('$');
    expect(prompts.length).toBeGreaterThan(0);
  });

  it('handles very long command history', () => {
    const longHistory = Array.from({ length: 100 }, (_, i) => ({
      command: `command-${i}`,
      output: `output-${i}`,
      type: 'default' as const,
      id: `${i}`
    }));
    
    render(<TerminalHistory history={longHistory} />);
    
    expect(screen.getByText('command-0')).toBeInTheDocument();
    expect(screen.getByText('command-99')).toBeInTheDocument();
  });

  it('supports filtering history entries', () => {
    render(<TerminalHistory history={mockHistory} filter="ls" />);
    
    expect(screen.getByText('ls')).toBeInTheDocument();
    expect(screen.queryByText('pwd')).not.toBeInTheDocument();
  });

  it('handles multiline command output', () => {
    const multilineHistory = [{
      command: 'cat file.txt',
      output: `Line 1
Line 2
Line 3`,
      type: 'default' as const,
      id: '1'
    }];
    
    render(<TerminalHistory history={multilineHistory} />);
    
    expect(screen.getByText(content => 
      content.includes('Line 1') && 
      content.includes('Line 2') && 
      content.includes('Line 3')
    )).toBeInTheDocument();
  });

  it('shows timestamps when enabled', () => {
    const timestampedHistory = mockHistory.map(entry => ({
      ...entry,
      timestamp: new Date('2023-01-01T12:00:00Z')
    }));
    
    render(<TerminalHistory history={timestampedHistory} showTimestamp />);
    
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });

  it('supports success command styling', () => {
    const successHistory = [{
      command: 'npm install',
      output: 'Installation complete',
      type: 'success' as const,
      id: '1'
    }];
    
    render(<TerminalHistory history={successHistory} />);
    
    const output = screen.getByText('Installation complete');
    expect(output).toHaveStyle({ color: 'var(--theme-accent)' });
  });

  it('handles command execution context', () => {
    const contextHistory = mockHistory.map(entry => ({
      ...entry,
      path: '/home/user',
      user: 'testuser'
    }));
    
    render(<TerminalHistory history={contextHistory} showContext />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('/home/user')).toBeInTheDocument();
  });

  it('supports command selection', () => {
    const onSelectCommand = vi.fn();
    render(
      <TerminalHistory 
        history={mockHistory} 
        onSelectCommand={onSelectCommand}
        selectable 
      />
    );
    
    const commandElement = screen.getByText('ls');
    fireEvent.click(commandElement);
    
    expect(onSelectCommand).toHaveBeenCalledWith('ls');
  });

  it('applies correct scroll behavior', () => {
    render(<TerminalHistory history={mockHistory} maxHeight="400px" />);
    
    const container = document.querySelector('[data-testid="terminal-history"]') ||
                      document.querySelector('.terminal-history');
    expect(container).toHaveStyle({ maxHeight: '400px' });
    expect(container).toHaveClass('overflow-y-auto');
  });

  it('handles loading states', () => {
    render(<TerminalHistory history={mockHistory} loading />);
    
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('supports history clearing', () => {
    const onClear = vi.fn();
    render(
      <TerminalHistory 
        history={mockHistory} 
        onClear={onClear}
        clearable 
      />
    );
    
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);
    
    expect(onClear).toHaveBeenCalled();
  });

  it('maintains performance with large histories', () => {
    const start = performance.now();
    
    const largeHistory = Array.from({ length: 1000 }, (_, i) => ({
      command: `cmd-${i}`,
      output: `output-${i}`,
      type: 'default' as const,
      id: `${i}`
    }));
    
    render(<TerminalHistory history={largeHistory} virtualized />);
    
    const end = performance.now();
    expect(end - start).toBeLessThan(1000); // Should render within 1 second
  });

  it('preserves terminal formatting', () => {
    const formattedHistory = [{
      command: 'tree',
      output: `├── folder1/
│   ├── file1.txt
│   └── file2.txt
└── folder2/`,
      type: 'default' as const,
      id: '1'
    }];
    
    render(<TerminalHistory history={formattedHistory} />);
    
    const output = screen.getByText(content => content.includes('├──'));
    expect(output).toHaveClass('whitespace-pre-wrap');
  });
});
