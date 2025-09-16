import { forwardRef } from 'react';
import { CommandLine } from '../molecules/CommandLine';
import { CommandOutput } from '../molecules/CommandOutput';
import type { TerminalOutput } from '../../model/useTerminal';

interface TerminalHistoryProps {
  output: TerminalOutput[];
  className?: string;
}

/**
 * TerminalHistory Organism - Complete command history display
 */
export const TerminalHistory = forwardRef<HTMLDivElement, TerminalHistoryProps>(
  ({ output, className }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-gray-800 min-h-0 ${className || ''}`}
        style={{ scrollBehavior: 'smooth' }}
        role="log"
        aria-live="polite" 
        aria-label="Terminal output history"
      >
        {output.map((entry) => (
          <div key={entry.id} className="mb-2">
            {entry.command && (
              <CommandLine 
                command={entry.command}
                path={entry.command ? undefined : "~"}
              />
            )}
            <CommandOutput 
              output={entry.result}
              type={entry.type}
            />
          </div>
        ))}
      </div>
    );
  }
);

TerminalHistory.displayName = 'TerminalHistory';
