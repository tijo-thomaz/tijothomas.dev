import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const textVariants = cva('', {
  variants: {
    variant: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      destructive: 'text-destructive',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600',
      terminal: 'text-green-400 font-mono',
      accent: 'text-accent-foreground',
      secondary: 'text-secondary-foreground',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      default: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    transform: {
      none: '',
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    weight: 'normal',
    align: 'left',
    transform: 'none',
  },
});

type TextElement = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'small' | 'strong' | 'em';

export interface TextProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: TextElement;
  truncate?: boolean;
  gradient?: boolean;
}

const Text = forwardRef<HTMLElement, TextProps>(
  ({ 
    className, 
    variant, 
    size, 
    weight, 
    align, 
    transform, 
    as: Component = 'p',
    truncate = false,
    gradient = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <Component
        className={cn(
          textVariants({ variant, size, weight, align, transform }),
          {
            'truncate': truncate,
            'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent': gradient,
          },
          className
        )}
        ref={ref as any}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

export { Text, textVariants };
