import { forwardRef, KeyboardEvent } from 'react';
import { Input } from '../../../shared/ui/atoms/Input';
import { Text } from '../../../shared/ui/atoms/Text';
import { cn } from '../../../shared/lib/utils';

interface PromptLineProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (command: string) => void;
  onNavigateHistory: (direction: 'up' | 'down') => void;
  onAutoComplete: () => void;
  disabled?: boolean;
  currentPath?: string;
  className?: string;
}

/**
 * PromptLine - Dumb component for terminal input
 * Purely presentational, receives all behavior via props
 */
const PromptLine = forwardRef<HTMLInputElement, PromptLineProps>(
  ({
    value,
    onChange,
    onSubmit,
    onNavigateHistory,
    onAutoComplete,
    disabled = false,
    currentPath = '~',
    className,
    ...props
  }, ref) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          if (!disabled && value.trim()) {
            onSubmit(value.trim());
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          onNavigateHistory('up');
          break;
          
        case 'ArrowDown':
          e.preventDefault();
          onNavigateHistory('down');
          break;
          
        case 'Tab':
          e.preventDefault();
          onAutoComplete();
          break;
      }
    };

    return (
      <div className={cn('flex items-center space-x-2 py-2', className)}>
        {/* Terminal prompt indicator */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <Text
            variant="terminal"
            size="sm"
            weight="medium"
            className="select-none"
          >
            tijo@portfolio
          </Text>
          <Text
            variant="terminal"
            size="sm"
            className="text-green-400/70 select-none"
          >
            :
          </Text>
          <Text
            variant="terminal"
            size="sm"
            className="text-blue-400 select-none"
          >
            {currentPath}
          </Text>
          <Text
            variant="terminal"
            size="sm"
            className="text-green-400 select-none"
          >
            $
          </Text>
        </div>
        
        {/* Input field */}
        <Input
          ref={ref}
          variant="terminal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type 'help' for available commands..."
          className={cn(
            'flex-1 border-0 bg-transparent p-0 text-green-400',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            {
              'opacity-50 cursor-not-allowed': disabled,
            }
          )}
          autoComplete="off"
          spellCheck="false"
          {...props}
        />
        
        {/* Cursor indicator */}
        {!disabled && (
          <div className="w-2 h-4 bg-green-400 animate-pulse flex-shrink-0" />
        )}
      </div>
    );
  }
);

PromptLine.displayName = 'PromptLine';

export { PromptLine };
