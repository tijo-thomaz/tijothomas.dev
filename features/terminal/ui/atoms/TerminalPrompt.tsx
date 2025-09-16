interface TerminalPromptProps {
  user?: string;
  host?: string;
  path?: string;
  showDollar?: boolean;
  className?: string;
}

/**
 * TerminalPrompt Atom - Reusable prompt display
 */
export function TerminalPrompt({ 
  user = "tijo", 
  host = "tijothomas.dev", 
  path = "~", 
  showDollar = true,
  className 
}: TerminalPromptProps) {
  return (
    <div className={`flex items-center font-mono ${className || ''}`}>
      <span style={{ color: "var(--theme-muted)" }}>{user}@{host}:</span>
      <span style={{ color: "var(--theme-accent)" }}>{path}</span>
      {showDollar && <span style={{ color: "var(--theme-accent)" }} className="ml-1">$</span>}
    </div>
  );
}
