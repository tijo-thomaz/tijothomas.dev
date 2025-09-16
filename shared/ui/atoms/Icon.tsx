import { SVGProps, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const iconVariants = cva('inline-block', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      default: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
      '2xl': 'h-10 w-10',
    },
    variant: {
      default: 'text-current',
      muted: 'text-muted-foreground',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      destructive: 'text-destructive',
      info: 'text-blue-600',
      terminal: 'text-green-400',
    },
    animate: {
      none: '',
      spin: 'animate-spin',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
    animate: 'none',
  },
});

export interface IconProps
  extends Omit<SVGProps<SVGSVGElement>, 'ref'>,
    VariantProps<typeof iconVariants> {
  name?: string;
}

// Common icons as components
export const ChevronRightIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, variant, animate, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(iconVariants({ size, variant, animate }), className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
);

export const ChevronDownIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, variant, animate, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(iconVariants({ size, variant, animate }), className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
);

export const SendIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, variant, animate, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(iconVariants({ size, variant, animate }), className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )
);

export const ShieldIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, variant, animate, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(iconVariants({ size, variant, animate }), className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
);

export const LoadingIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, variant, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(iconVariants({ size, variant, animate: 'spin' }), className)}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
);

export const TerminalIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, variant, animate, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn(iconVariants({ size, variant, animate }), className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <polyline points="4,17 10,11 4,5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
      <line x1="12" y1="19" x2="20" y2="19" strokeLinecap="round" strokeWidth={2} />
    </svg>
  )
);

ChevronRightIcon.displayName = 'ChevronRightIcon';
ChevronDownIcon.displayName = 'ChevronDownIcon';
SendIcon.displayName = 'SendIcon';
ShieldIcon.displayName = 'ShieldIcon';
LoadingIcon.displayName = 'LoadingIcon';
TerminalIcon.displayName = 'TerminalIcon';
