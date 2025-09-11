import { TerminalPrompt } from '../atoms/TerminalPrompt';
import { TerminalText } from '../atoms/TerminalText';

interface CommandLineProps {
  command: string;
  path?: string;
  className?: string;
}

/**
 * CommandLine Molecule - Display executed command
 */
export function CommandLine({ command, path = "~", className }: CommandLineProps) {
  return (
    <div className={`flex items-center ${className || ''}`}>
      <span style={{ color: "var(--theme-accent)" }}>$</span>
      <TerminalText className="ml-2">
        {command}
      </TerminalText>
    </div>
  );
}
