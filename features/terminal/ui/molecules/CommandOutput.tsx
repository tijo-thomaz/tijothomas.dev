import { TerminalText } from '../atoms/TerminalText';

interface CommandOutputProps {
  output: string;
  type: 'command' | 'error' | 'info' | 'success';
  className?: string;
}

/**
 * CommandOutput Molecule - Display command result
 */
export function CommandOutput({ output, type, className }: CommandOutputProps) {
  if (!output) return null;

  const getVariant = () => {
    switch (type) {
      case 'error': return 'error';
      case 'success': return 'success'; 
      case 'info': return 'default';
      default: return 'default';
    }
  };

  return (
    <TerminalText 
      variant={getVariant()}
      size="xs"
      className={`mt-1 ${className || ''}`}
    >
      {output}
    </TerminalText>
  );
}
