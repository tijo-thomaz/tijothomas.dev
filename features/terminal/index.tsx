'use client';

import { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { useTerminal } from './model/useTerminal';
import { cn } from '../../shared/lib/utils';
import { trackCommand } from '../../lib/simple-analytics';
// Atomic design components
import { TerminalHeader } from './ui/organisms/TerminalHeader';
import { TerminalHistory } from './ui/organisms/TerminalHistory';
import { TerminalFooter } from './ui/organisms/TerminalFooter';
import { InputForm } from './ui/molecules/InputForm';

interface TerminalHandle {
  executeCommand: (command: string) => void;
  focusInput: () => void;
  clearOutput: () => void;
}

interface TerminalProps {
  onPromptShieldClick?: () => void;
  className?: string;
  // Original Terminal props for compatibility
  onEnter3DWorld?: (world: string) => void;
  onJourneyProgress?: (section: string) => void;
  onNavigateToWorld?: (world: string) => void;
  onAddToCommandHistory?: (command: string) => void;
  commandHistory?: string[];
  tutorialManager?: any;
  onUserActivity?: () => void;
  onTutorialActivity?: () => void;
  terminalInput?: string;
}

/**
 * Terminal - ATOMIC DESIGN implementation
 * Smart component using atoms/molecules/organisms
 */
const Terminal = forwardRef<TerminalHandle, TerminalProps>(
  ({ 
    onPromptShieldClick, 
    className,
    onEnter3DWorld,
    onJourneyProgress,
    onNavigateToWorld,
    onAddToCommandHistory,
    commandHistory,
    tutorialManager,
    onUserActivity,
    onTutorialActivity,
    terminalInput,
    ...props 
  }, ref) => {
    const {
      state,
      inputRef,
      setInput,
      executeCommand,
      navigateHistory,
      focusInput,
      clearOutput,
    } = useTerminal({
      onNavigateToWorld,
      onEnter3DWorld,
      onJourneyProgress,
      onAddToCommandHistory,
    });

    // Tutorial integration
    const isAutoTyping = tutorialManager?.isCurrentlyTyping() || false;
    const demoMode = tutorialManager?.isActive() || false;

    // Expose methods for external access (tutorial system)
    useImperativeHandle(ref, () => ({
      executeCommand: (command: string) => {
        trackCommand(command);
        setInput(command);
        executeCommand(command);
      },
      focusInput,
      clearOutput,
    }), [executeCommand, focusInput, clearOutput, setInput]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Don't handle events during auto-typing
      if (isAutoTyping) {
        e.preventDefault();
        return;
      }
      
      // Handle activity appropriately based on mode
      if (demoMode && onTutorialActivity) {
        onTutorialActivity();
      } else if (!demoMode && onUserActivity) {
        onUserActivity();
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        const commandToExecute = terminalInput || state.input;
        if (commandToExecute.trim()) {
          trackCommand(commandToExecute);
          executeCommand(commandToExecute);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!demoMode) {
          navigateHistory('up');
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!demoMode) {
          navigateHistory('down');
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Auto-complete logic could go here
      }
    };

    // Ref for auto-scroll
    const terminalScrollRef = useRef<HTMLDivElement>(null);

    // Focus input on mount and clicks
    useEffect(() => {
      focusInput();
    }, [focusInput]);

    // Sync external terminalInput with internal state
    useEffect(() => {
      if (terminalInput !== undefined && terminalInput !== state.input) {
        setInput(terminalInput);
      }
    }, [terminalInput, state.input, setInput]);

    // Auto-scroll to bottom when output changes
    useEffect(() => {
      if (terminalScrollRef.current) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          if (terminalScrollRef.current) {
            terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
          }
        }, 100);
      }
    }, [state.output, state.isProcessing]);

    const handleCardClick = () => {
      focusInput();
      onUserActivity?.();
    };

    return (
      <Card
        className={cn('h-full flex flex-col terminal-container border transition-colors duration-300', className)}
        style={{
          backgroundColor: "var(--theme-card)",
          borderColor: "var(--theme-border)",
        }}
        onClick={handleCardClick}
        role="application"
        aria-label="Interactive terminal interface"
        {...props}
      >
        <TerminalHeader currentPath={state.currentPath} />

        <CardContent className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
          <TerminalHistory 
            ref={terminalScrollRef}
            output={state.output}
          />
          
          <InputForm
            ref={inputRef}
            value={terminalInput || state.input}
            onChange={(value) => {
              setInput(value);
              if (!isAutoTyping) {
                if (demoMode && onTutorialActivity) {
                  onTutorialActivity();
                } else if (!demoMode && onUserActivity) {
                  onUserActivity();
                }
              }
            }}
            onKeyDown={handleKeyDown}
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (state.input.trim()) {
                executeCommand(state.input);
              }
            }}
            isProcessing={state.isProcessing}
            isAutoTyping={isAutoTyping}
            currentPath={state.currentPath}
          />

          {/* Hidden help text for screen readers */}
          <div id="terminal-help" className="sr-only">
            Interactive terminal. Use arrow keys to navigate command history,
            tab for autocomplete, and enter to execute commands. Type 'help' to
            see available commands.
          </div>
        </CardContent>

        <TerminalFooter />
      </Card>
    );
  }
);

Terminal.displayName = 'Terminal';

export { Terminal };
export type { TerminalHandle };
