import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal' | 'both';
  variant?: 'default' | 'invisible' | 'minimal';
}

/**
 * ScrollArea - Styled scrollable container
 * Provides consistent scrolling experience across the app
 */
const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ 
    className, 
    orientation = 'vertical',
    variant = 'default',
    children, 
    ...props 
  }, ref) => {
    const getScrollClasses = () => {
      const baseClasses = 'overflow-auto';
      
      switch (orientation) {
        case 'horizontal':
          return 'overflow-x-auto overflow-y-hidden';
        case 'both':
          return 'overflow-auto';
        case 'vertical':
        default:
          return 'overflow-y-auto overflow-x-hidden';
      }
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'invisible':
          return 'scrollbar-none';
        case 'minimal':
          return 'scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent';
        case 'default':
        default:
          return 'scrollbar-thin scrollbar-thumb-border scrollbar-track-background hover:scrollbar-thumb-muted-foreground/50';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          getScrollClasses(),
          getVariantClasses(),
          'relative',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
