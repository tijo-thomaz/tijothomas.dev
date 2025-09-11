"use client";

import { useState, useEffect } from "react";
import { TutorialStep } from "@/lib/tutorial-manager";

interface CommandSuggestionsProps {
  visitedSections: string[];
  onExecuteCommand: (command: string) => void;
  tutorialActive: boolean;
  tutorialStep: number;
  tutorialSteps: TutorialStep[];
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

export const CommandSuggestions = ({
  visitedSections,
  onExecuteCommand,
  tutorialActive,
  tutorialStep,
  tutorialSteps,
  onUserActivity,
  showWelcome = false,
  onStartTutorial,
}: CommandSuggestionsProps) => {
  const [currentAiMessage, setCurrentAiMessage] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Rotate AI messages
  useEffect(() => {
    if (!tutorialActive) {
      const interval = setInterval(() => {
        setCurrentAiMessage((prev) => (prev + 1) % aiMessages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [tutorialActive]);

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

  if (!showSuggestions && !tutorialActive) return null;

  return (
    <div
      className="border-t backdrop-blur-sm p-3"
      style={{ borderColor: "var(--theme-border)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Welcome Message for New Visitors */}
        {showWelcome && !tutorialActive && (
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
              ></div>
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
                <div
                  className="font-mono text-xs rounded px-3 py-2 border"
                  style={{
                    backgroundColor: "var(--theme-bg)",
                    borderColor: "var(--theme-border)",
                    color: "var(--theme-text)",
                  }}
                >
                  💡 <strong>Type commands</strong> like 'help', 'experience',
                  'skills'
                </div>
                <div
                  className="font-mono text-xs rounded px-3 py-2 border"
                  style={{
                    backgroundColor: "var(--theme-bg)",
                    borderColor: "var(--theme-border)",
                    color: "var(--theme-text)",
                  }}
                >
                  🤖 <strong>Ask the AI</strong> any questions about my
                  background
                </div>
                <div
                  className="font-mono text-xs rounded px-3 py-2 border"
                  style={{
                    backgroundColor: "var(--theme-bg)",
                    borderColor: "var(--theme-border)",
                    color: "var(--theme-text)",
                  }}
                >
                  ⌨️ <strong>Use arrow keys</strong> to browse command history
                </div>
                <div
                  className="font-mono text-xs rounded px-3 py-2 border"
                  style={{
                    backgroundColor: "var(--theme-bg)",
                    borderColor: "var(--theme-border)",
                    color: "var(--theme-text)",
                  }}
                >
                  ✨ <strong>Tap below to start</strong> an interactive tutorial
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-3">
                <button
                  onClick={() => {
                    onUserActivity();
                    onExecuteCommand("help");
                  }}
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
                  onClick={() => onStartTutorial?.()}
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
        )}

        {/* Enhanced Tutorial Mode */}
        {tutorialActive && (
          <div
            className="mb-4 rounded-lg p-4 border backdrop-blur-md"
            style={{
              backgroundColor: "var(--theme-surface)",
              borderColor: "var(--theme-border)",
              color: "var(--theme-text)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: "var(--theme-accent)" }}
                ></div>
                <span
                  className="font-mono text-sm sm:text-sm text-xs font-bold"
                  style={{ color: "var(--theme-accent)" }}
                >
                  📚 Tutorial ({Math.min(tutorialStep + 1, tutorialSteps.length)}/
                  {tutorialSteps.length})
                </span>
              </div>
              <button
                onClick={() => onUserActivity()}
                className="text-xs font-mono px-2 py-1 border rounded transition-colors hover:opacity-80"
                style={{
                  color: "var(--theme-text)",
                  borderColor: "var(--theme-border)",
                  backgroundColor: "var(--theme-bg)",
                }}
                aria-label="Skip tutorial"
              >
                Skip
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-2 sm:mb-3">
              <div
                className="flex justify-between text-xs font-mono mb-1"
                style={{ color: "var(--theme-secondary)" }}
              >
                <span>Progress</span>
                <span>
                  {Math.min(
                    100,
                    Math.round(((tutorialStep + 1) / tutorialSteps.length) * 100)
                  )}
                  %
                </span>
              </div>
              <div
                className="w-full rounded-full h-1.5 overflow-hidden"
                style={{ backgroundColor: "var(--theme-bg)" }}
              >
                <div
                  className="h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(
                      100,
                      ((tutorialStep + 1) / tutorialSteps.length) * 100
                    )}%`,
                    backgroundColor: "var(--theme-accent)",
                  }}
                ></div>
              </div>
            </div>

            {tutorialStep < tutorialSteps.length && (
              <div className="space-y-2">
                <div
                  className="font-mono text-sm"
                  style={{ color: "var(--theme-text)" }}
                >
                  {tutorialSteps[tutorialStep]?.message}
                </div>
                {tutorialSteps[tutorialStep]?.tip && (
                  <div
                    className="font-mono text-xs rounded px-2 py-1 border-l-2"
                    style={{
                      color: "var(--theme-secondary)",
                      backgroundColor: "var(--theme-bg)",
                      borderLeftColor: "var(--theme-accent)",
                    }}
                  >
                    {tutorialSteps[tutorialStep].tip}
                  </div>
                )}
              </div>
            )}

            {tutorialStep >= tutorialSteps.length && (
              <div
                className="font-mono text-sm"
                style={{ color: "var(--theme-accent)" }}
              >
                🎯 Tutorial completed! You're now ready to explore
                independently. Type any command or ask the AI assistant
                questions.
              </div>
            )}
          </div>
        )}

        {/* AI Assistant Message */}
        {!tutorialActive && (
          <div className="mb-3 text-center">
            <div
              className="inline-flex items-center gap-2 border rounded-lg px-4 py-2 backdrop-blur-md"
              style={{
                backgroundColor: "var(--theme-surface)",
                borderColor: "var(--theme-border)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: "var(--theme-accent)" }}
              ></div>
              <span
                className="font-mono text-sm"
                style={{ color: "var(--theme-text)" }}
              >
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
};
