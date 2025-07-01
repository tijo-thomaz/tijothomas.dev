"use client";

import { useState, useEffect } from "react";

interface CommandSuggestionsProps {
  visitedSections: string[];
  onExecuteCommand: (command: string) => void;
  demoMode: boolean;
  demoStep: number;
  demoCommands: Array<{
    command: string;
    delay: number;
    message: string;
    tip?: string;
  }>;
  onUserActivity: () => void;
  showWelcome?: boolean;
  onStartTutorial?: () => void;
}

const popularCommands = [
  { command: "help", icon: "❓", desc: "Show all commands" },
  { command: "experience", icon: "🏢", desc: "View work history" },
  { command: "projects", icon: "🚀", desc: "See my projects" },
  { command: "skills", icon: "⚛️", desc: "Technical skills" },
  { command: "contact", icon: "📧", desc: "Get in touch" },
];

const aiMessages = [
  "💡 New here? Try typing 'help' to get started!",
  "🎯 Want to see my experience? Type 'experience'",
  "🚀 Curious about projects? Try 'projects'",
  "⚛️ Check out my skills with 'skills'",
  "📧 Ready to connect? Use 'contact'",
];

export default function CommandSuggestions({
  visitedSections,
  onExecuteCommand,
  demoMode,
  demoStep,
  demoCommands,
  onUserActivity,
  showWelcome = false,
  onStartTutorial,
}: CommandSuggestionsProps) {
  const [currentAiMessage, setCurrentAiMessage] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Rotate AI messages
  useEffect(() => {
    if (!demoMode) {
      const interval = setInterval(() => {
        setCurrentAiMessage((prev) => (prev + 1) % aiMessages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [demoMode]);

  // Get suggested commands based on what user hasn't visited
  const getSuggestions = () => {
    return popularCommands
      .filter(
        (cmd) =>
          !visitedSections.includes(cmd.command) || cmd.command === "help"
      )
      .slice(0, 3);
  };

  const suggestions = getSuggestions();

  const handleCommandClick = (command: string) => {
    onUserActivity();
    onExecuteCommand(command);
  };

  if (!showSuggestions && !demoMode) return null;

  return (
    <div className="border-t backdrop-blur-sm p-3">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Message for New Visitors */}
        {showWelcome && !demoMode && (
          <div className="mb-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-mono text-lg font-bold">
                👋 Welcome to Tijo's Interactive Portfolio!
              </span>
            </div>
            <div className="space-y-2">
              <div className="text-green-200 font-mono text-sm">
                This isn't your typical portfolio - it's a fully interactive
                terminal experience! Here's how to get started:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                <div className="text-green-300/80 font-mono text-xs bg-green-500/10 rounded px-3 py-2">
                  💡 <strong>Type commands</strong> like 'help', 'experience',
                  'skills'
                </div>
                <div className="text-blue-300/80 font-mono text-xs bg-blue-500/10 rounded px-3 py-2">
                  🤖 <strong>Ask the AI</strong> any questions about my
                  background
                </div>
                <div className="text-purple-300/80 font-mono text-xs bg-purple-500/10 rounded px-3 py-2">
                  ⌨️ <strong>Use arrow keys</strong> to browse command history
                </div>
                <div className="text-orange-300/80 font-mono text-xs bg-orange-500/10 rounded px-3 py-2">
                  ✨ <strong>Wait 5 seconds</strong> for an interactive tutorial
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-3">
                <button
                  onClick={() => {
                    onUserActivity();
                    onExecuteCommand("help");
                  }}
                  className="text-green-300 hover:text-white font-mono text-sm px-3 py-2 border border-green-400/30 rounded hover:bg-green-400/10 transition-colors"
                >
                  🚀 Explore Now
                </button>
              <button
              onClick={() => onStartTutorial?.()}
                className="text-blue-300 hover:text-white font-mono text-sm px-3 py-2 border border-blue-400/30 rounded hover:bg-blue-400/10 transition-colors"
                >
                   📚 Start Tutorial
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* Enhanced Tutorial Mode */}
        {demoMode && (
          <div className="mb-4 bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 font-mono text-sm font-bold">
                📚 Interactive Tutorial ({Math.min(demoStep + 1, demoCommands.length)}/{demoCommands.length})
                </span>
              </div>
              <button
                onClick={() => onUserActivity()}
                className="text-blue-300 hover:text-white text-xs font-mono px-2 py-1 border border-blue-400/30 rounded hover:bg-blue-400/10 transition-colors"
                aria-label="Skip tutorial"
              >
                Skip
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
            <div className="flex justify-between text-xs text-blue-300/60 font-mono mb-1">
            <span>Progress</span>
            <span>
            {Math.min(100, Math.round(((demoStep + 1) / demoCommands.length) * 100))}%
            </span>
            </div>
            <div className="w-full bg-blue-900/30 rounded-full h-1.5 overflow-hidden">
            <div
            className="bg-blue-400 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{
            width: `${Math.min(100, ((demoStep + 1) / demoCommands.length) * 100)}%`,
            }}
            ></div>
            </div>
            </div>

            {demoStep < demoCommands.length && (
              <div className="space-y-2">
                <div className="text-blue-200 font-mono text-sm">
                  {demoCommands[demoStep]?.message}
                </div>
                {demoCommands[demoStep]?.tip && (
                  <div className="text-blue-300/80 font-mono text-xs bg-blue-500/10 rounded px-2 py-1 border-l-2 border-blue-400">
                    {demoCommands[demoStep].tip}
                  </div>
                )}
              </div>
            )}

            {demoStep >= demoCommands.length && (
              <div className="text-green-300 font-mono text-sm">
                🎯 Tutorial completed! You're now ready to explore
                independently. Type any command or ask the AI assistant
                questions.
              </div>
            )}
          </div>
        )}

        {/* AI Assistant Message */}
        {!demoMode && (
          <div className="mb-3 text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-400/30 rounded-lg px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 font-mono text-sm">
                {aiMessages[currentAiMessage]}
              </span>
            </div>
          </div>
        )}

        {/* Quick Command Buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((item) => (
            <button
              key={item.command}
              onClick={() => handleCommandClick(item.command)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 hover:border-green-400/50 rounded-lg transition-all duration-200 group"
              title={item.desc}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-green-400 font-mono text-sm group-hover:text-white">
                {item.command}
              </span>
            </button>
          ))}

          {visitedSections.length > 0 && (
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 hover:border-yellow-400/50 rounded-lg transition-all duration-200 text-yellow-400 font-mono text-sm"
            >
              {showSuggestions ? "👁️ Hide" : "💡 Show"} Tips
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {visitedSections.length > 0 && (
          <div className="mt-3 text-center">
            <div className="text-xs text-gray-400 font-mono">
              Explored: {visitedSections.length}/5 sections
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
