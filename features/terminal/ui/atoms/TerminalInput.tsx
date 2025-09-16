import { forwardRef, InputHTMLAttributes } from 'react';

interface TerminalInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  isAutoTyping?: boolean;
}

/**
 * TerminalInput Atom - Terminal command input field
 */
export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ isAutoTyping = false, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="text"
        className={`ml-2 bg-transparent outline-none flex-1 font-mono terminal-cursor zoom-text-xs focus:outline-none ${className || ''}`}
        style={{ color: "var(--theme-text)" }}
        placeholder={isAutoTyping ? "Auto-typing..." : "Enter command..."}
        aria-label="Terminal command input. Use arrow keys for history, tab for autocomplete, type 'help' for commands"
        aria-describedby="terminal-help"
        autoComplete="off"
        spellCheck="false"
        data-auto-typing={isAutoTyping}
        readOnly={isAutoTyping}
        {...props}
      />
    );
  }
);

TerminalInput.displayName = 'TerminalInput';
