"use client";

interface WelcomePanelProps {
  onStartTutorial?: () => void;
  onExploreNow: () => void;
  onUserActivity: () => void;
}

export const WelcomePanel = ({ onStartTutorial, onExploreNow, onUserActivity }: WelcomePanelProps) => {
  return (
    <div
      className="mb-4 rounded-lg p-4 border backdrop-blur-md"
      style={{
        backgroundColor: "var(--theme-surface)",
        borderColor: "var(--theme-border)",
        color: "var(--theme-text)",
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-4 h-4 rounded-full animate-pulse"
          style={{ backgroundColor: "var(--theme-accent)" }}
        />
        <span
          className="font-mono text-lg font-bold"
          style={{ color: "var(--theme-accent)" }}
        >
          👋 Welcome to Tijo's Interactive Portfolio!
        </span>
      </div>
      
      <div className="space-y-2">
        <div
          className="font-mono text-sm"
          style={{ color: "var(--theme-secondary)" }}
        >
          This isn't your typical portfolio - it's a fully interactive
          terminal experience! Here's how to get started:
        </div>
        
        <div className="grid grid-cols-1 gap-2 mt-3">
          {[
            "💡 Type commands like 'help', 'experience', 'skills'",
            "🤖 Ask the AI any questions about my background",
            "⌨️ Use arrow keys to browse command history",
            "✨ Tap below to start an interactive tutorial"
          ].map((tip, index) => (
            <div
              key={index}
              className="font-mono text-xs rounded px-3 py-2 border"
              style={{
                backgroundColor: "var(--theme-bg)",
                borderColor: "var(--theme-border)",
                color: "var(--theme-text)",
              }}
            >
              <strong>{tip.split(' ')[0]}</strong> {tip.split(' ').slice(1).join(' ')}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center gap-3 mt-3">
          <button
            onClick={onExploreNow}
            className="font-mono text-sm px-3 py-2 border rounded transition-colors hover:opacity-80"
            style={{
              color: "var(--theme-accent)",
              borderColor: "var(--theme-border)",
              backgroundColor: "var(--theme-bg)",
            }}
          >
            🚀 Explore Now
          </button>
          <button
            onClick={onStartTutorial}
            className="font-mono text-sm px-4 py-3 sm:px-3 sm:py-2 border rounded transition-colors hover:opacity-80 min-h-[44px] sm:min-h-auto"
            style={{
              color: "var(--theme-accent)",
              borderColor: "var(--theme-border)",
              backgroundColor: "var(--theme-bg)",
            }}
          >
            📚 Start Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};
