"use client";

import { useState, useEffect } from "react";
import { TutorialStep } from "@/lib/tutorial-manager";
import { CommandButton } from './atoms/CommandButton';
import { WelcomePanel } from './molecules/WelcomePanel';
import { TutorialPanel } from './organisms/TutorialPanel';

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

  useEffect(() => {
    if (!tutorialActive) {
      const interval = setInterval(() => {
        setCurrentAiMessage((prev) => (prev + 1) % aiMessages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [tutorialActive]);

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
        {showWelcome && !tutorialActive && (
          <WelcomePanel
            onStartTutorial={onStartTutorial}
            onExploreNow={() => {
              onUserActivity();
              onExecuteCommand("help");
            }}
            onUserActivity={onUserActivity}
          />
        )}

        {tutorialActive && (
          <TutorialPanel
            tutorialStep={tutorialStep}
            tutorialSteps={tutorialSteps}
            onUserActivity={onUserActivity}
          />
        )}

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
              />
              <span
                className="font-mono text-sm"
                style={{ color: "var(--theme-text)" }}
              >
                {aiMessages[currentAiMessage]}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((item) => (
            <CommandButton
              key={item.command}
              command={item.command}
              icon={item.icon}
              description={item.desc}
              onClick={() => handleCommandClick(item.command)}
            />
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
