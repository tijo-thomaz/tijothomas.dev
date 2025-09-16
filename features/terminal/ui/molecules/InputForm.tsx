import { forwardRef } from 'react';
import { TerminalPrompt } from '../atoms/TerminalPrompt';
import { TerminalInput } from '../atoms/TerminalInput';

interface InputFormProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  isProcessing?: boolean;
  isAutoTyping?: boolean;
  currentPath?: string;
  className?: string;
}

/**
 * InputForm Molecule - Terminal input with prompt
 */
export const InputForm = forwardRef<HTMLInputElement, InputFormProps>(
  ({ 
    value, 
    onChange, 
    onKeyDown,
    onSubmit,
    isProcessing = false,
    isAutoTyping = false,
    currentPath = "~",
    className,
  }, ref) => {
    return (
      <form 
        className={`flex items-center flex-shrink-0 mt-2 ${className || ''}`}
        onSubmit={onSubmit}
      >
        <span style={{ color: "var(--theme-accent)" }}>$</span>
        <TerminalInput
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isProcessing}
          isAutoTyping={isAutoTyping}
          autoFocus={typeof window !== "undefined" && window.innerWidth >= 768}
        />
      </form>
    );
  }
);

InputForm.displayName = 'InputForm';
