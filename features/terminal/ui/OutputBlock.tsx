import { memo } from 'react';
import { Text } from '../../../shared/ui/atoms/Text';
import { TerminalIcon } from '../../../shared/ui/atoms/Icon';
import { cn, formatRelativeTime } from '../../../shared/lib/utils';
import type { TerminalOutput } from '../model/useTerminal';

interface OutputBlockProps {
  output: TerminalOutput;
  showTimestamp?: boolean;
  className?: string;
}

const typeConfig = {
  command: {
    icon: TerminalIcon,
    iconColor: 'text-green-400',
    textColor: 'text-green-400',
  },
  info: {
    icon: TerminalIcon,
    iconColor: 'text-blue-400',
    textColor: 'text-blue-400',
  },
  success: {
    icon: TerminalIcon,
    iconColor: 'text-green-500',
    textColor: 'text-green-400',
  },
  error: {
    icon: TerminalIcon,
    iconColor: 'text-red-400',
    textColor: 'text-red-400',
  },
};

/**
 * OutputBlock - Dumb component for displaying terminal output
 * Renders a single command output with appropriate styling
 */
const OutputBlock = memo<OutputBlockProps>(({
  output,
  showTimestamp = false,
  className,
}) => {
  const config = typeConfig[output.type];
  const IconComponent = config.icon;

  return (
    <div className={cn('py-2 space-y-2', className)}>
      {/* Command line */}
      <div className="flex items-center space-x-2">
        <IconComponent 
          size="xs" 
          className={config.iconColor}
        />
        <Text
          variant="terminal"
          size="sm"
          className="text-green-400/70"
        >
          tijo@portfolio:~$
        </Text>
        <Text
          variant="terminal"
          size="sm"
          weight="medium"
          className="text-green-400"
        >
          {output.command}
        </Text>
        {showTimestamp && (
          <Text
            variant="terminal"
            size="xs"
            className="text-green-400/50 ml-auto"
          >
            {formatRelativeTime(output.timestamp)}
          </Text>
        )}
      </div>
      
      {/* Output content */}
      {output.result && (
        <div className="pl-6">
          <Text
            variant="terminal"
            size="sm"
            className={cn(
              'whitespace-pre-wrap break-words',
              config.textColor
            )}
          >
            {output.result}
          </Text>
        </div>
      )}
    </div>
  );
});

OutputBlock.displayName = 'OutputBlock';

export { OutputBlock };
