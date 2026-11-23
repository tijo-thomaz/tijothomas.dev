import { forwardRef } from 'react';
import { Badge } from '../../../shared/ui/molecules/Badge';
import { ShieldIcon } from '../../../shared/ui/atoms/Icon';
import { Text } from '../../../shared/ui/atoms/Text';
import { cn } from '../../../shared/lib/utils';

interface ShieldBadgeProps {
  version?: string;
  status?: 'active' | 'inactive' | 'warning' | 'error';
  showVersion?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onClick?: () => void;
}

const statusConfig = {
  active: {
    variant: 'promptshield' as const,
    icon: 'text-white',
    pulse: false,
  },
  inactive: {
    variant: 'ghost' as const,
    icon: 'text-muted-foreground',
    pulse: false,
  },
  warning: {
    variant: 'warning' as const,
    icon: 'text-white',
    pulse: true,
  },
  error: {
    variant: 'destructive' as const,
    icon: 'text-white',
    pulse: true,
  },
};

/**
 * PromptShield Badge - Visual indicator of AI safety features
 * Displays the flagship PromptShield protection status
 */
const ShieldBadge = forwardRef<HTMLDivElement, ShieldBadgeProps>(
  ({ 
    version = '2.1', 
    status = 'active', 
    showVersion = true, 
    size = 'default',
    className,
    onClick,
    ...props 
  }, ref) => {
    const config = statusConfig[status];
    
    return (
      <Badge
        ref={ref}
        variant={config.variant}
        size={size}
        className={cn(
          'group cursor-pointer transition-all duration-200 hover:scale-105',
          {
            'animate-pulse': config.pulse,
            'pointer-events-none cursor-default': !onClick,
          },
          className
        )}
        onClick={onClick}
        {...props}
      >
        <ShieldIcon 
          size={size === 'sm' ? 'xs' : size === 'lg' ? 'default' : 'xs'} 
          className={cn(config.icon, 'mr-1')}
        />
        
        <Text 
          as="span" 
          size={size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'xs'}
          weight="semibold"
          className="text-inherit"
        >
          PromptShield
        </Text>
        
        {showVersion && (
          <Text 
            as="span" 
            size={size === 'sm' ? 'xs' : size === 'lg' ? 'sm' : 'xs'}
            className="ml-1 opacity-80 text-inherit"
          >
            v{version}
          </Text>
        )}
        
        {onClick && (
          <div className="ml-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </Badge>
    );
  }
);

ShieldBadge.displayName = 'ShieldBadge';

export { ShieldBadge };
