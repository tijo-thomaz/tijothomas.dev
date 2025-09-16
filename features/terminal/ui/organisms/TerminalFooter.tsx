interface TerminalFooterProps {
  className?: string;
}

/**
 * TerminalFooter Organism - Terminal status and branding
 */
export function TerminalFooter({ className }: TerminalFooterProps) {
  return (
    <div 
      className={`flex-shrink-0 px-4 py-2 text-xs ${className || ''}`}
      style={{
        backgroundColor: "var(--theme-muted)",
        borderTopColor: "var(--theme-border)",
        color: "var(--theme-secondary)"
      }}
    >
      <div className="flex items-center justify-between">
        <span>Use ↑↓ for history, Tab for autocomplete, 'help' for commands</span>
        <div className="flex items-center gap-2">
          <span>Featuring</span>
          <a
            href="https://promptshield.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
            style={{ color: "var(--theme-accent)" }}
          >
            🛡️ PromptShield
          </a>
        </div>
      </div>
    </div>
  );
}
