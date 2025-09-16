import { CardHeader } from '../../../../components/ui/card';

interface TerminalHeaderProps {
  currentPath?: string;
  className?: string;
}

/**
 * TerminalHeader Organism - Terminal window header with controls
 */
export function TerminalHeader({ currentPath = "~", className }: TerminalHeaderProps) {
  return (
    <CardHeader 
      className={`py-1.5 px-3 flex-shrink-0 border-b transition-colors duration-300 ${className || ''}`}
      style={{ borderColor: "var(--theme-border)" }}
    >
      <div className="flex items-center space-x-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
        <span
          className="font-mono zoom-text-xs ml-2 truncate"
          style={{ color: "var(--theme-accent)" }}
        >
          tijo@tijothomas.dev:{currentPath}$
        </span>
      </div>
    </CardHeader>
  );
}
