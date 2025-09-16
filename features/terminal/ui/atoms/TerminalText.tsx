import { ReactNode } from 'react';

interface TerminalTextProps {
  children: ReactNode;
  variant?: 'default' | 'error' | 'success' | 'muted' | 'accent';
  size?: 'xs' | 'sm' | 'base';
  className?: string;
}

/**
 * TerminalText Atom - Styled terminal text
 */
export function TerminalText({ 
  children, 
  variant = 'default',
  size = 'base',
  className 
}: TerminalTextProps) {
  const getColor = () => {
    switch (variant) {
      case 'error': return 'var(--theme-destructive)';
      case 'success': return 'var(--theme-accent)';
      case 'muted': return 'var(--theme-muted)';
      case 'accent': return 'var(--theme-accent)';
      default: return 'var(--theme-text)';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'xs': return 'zoom-text-xs';
      case 'sm': return 'text-sm';
      default: return 'text-base';
    }
  };

  return (
    <div 
      className={`font-mono whitespace-pre-wrap ${getSizeClass()} ${className || ''}`}
      style={{ color: getColor() }}
    >
      {children}
    </div>
  );
}
