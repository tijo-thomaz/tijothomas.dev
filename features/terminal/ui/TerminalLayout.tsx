import { forwardRef, ReactNode } from 'react';
import { Card, CardContent, CardHeader } from '../../../shared/ui/molecules/Card';
import { Text } from '../../../shared/ui/atoms/Text';
import { TerminalIcon } from '../../../shared/ui/atoms/Icon';
import { ShieldBadge } from '../../prompt-shield/ui/ShieldBadge';
import { cn } from '../../../shared/lib/utils';

interface TerminalLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showPromptShield?: boolean;
  onPromptShieldClick?: () => void;
  onClick?: () => void;
  className?: string;
}

/**
 * TerminalLayout - Dumb component for terminal container
 * Pure UI component that wraps terminal content
 */
const TerminalLayout = forwardRef<HTMLDivElement, TerminalLayoutProps>(
  ({
    children,
    title = 'Terminal',
    subtitle = 'Interactive command-line interface',
    showPromptShield = true,
    onPromptShieldClick,
    onClick,
    className,
    ...props
  }, ref) => {
    return (
      <Card
        ref={ref}
        variant="terminal"
        padding="none"
        onClick={onClick}
        className={cn(
          'h-full flex flex-col bg-black border-green-400/30',
          'shadow-lg shadow-green-400/20',
          className
        )}
        {...props}
      >
        {/* Terminal Header */}
        <CardHeader className="border-b border-green-400/30 bg-green-400/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TerminalIcon 
                size="sm" 
                className="text-green-400" 
              />
              <div>
                <Text
                  variant="terminal"
                  size="sm"
                  weight="semibold"
                >
                  {title}
                </Text>
                <Text
                  variant="terminal"
                  size="xs"
                  className="text-green-400/70"
                >
                  {subtitle}
                </Text>
              </div>
            </div>
            
            {showPromptShield && (
              <ShieldBadge
                version="2.1"
                size="sm"
                onClick={onPromptShieldClick}
                className="hover:scale-105 transition-transform"
              />
            )}
          </div>
          
          {/* Terminal window controls */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
        </CardHeader>

        {/* Terminal Content */}
        <CardContent className="flex-1 overflow-auto p-4 bg-black">
          <div className="min-h-full">
            {children}
          </div>
        </CardContent>
        
        {/* Terminal Footer */}
        <div className="border-t border-green-400/30 bg-green-400/5 px-4 py-2">
          <div className="flex items-center justify-between">
            <Text
              variant="terminal"
              size="xs"
              className="text-green-400/60"
            >
              Use ↑↓ arrows for history, Tab for autocomplete, 'help' for commands
            </Text>
            
            <div className="flex items-center space-x-4">
              <Text
                variant="terminal"
                size="xs"
                className="text-green-400/60"
              >
                Powered by
              </Text>
              <ShieldBadge
                showVersion={false}
                size="sm"
                className="scale-75"
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

TerminalLayout.displayName = 'TerminalLayout';

export { TerminalLayout };
