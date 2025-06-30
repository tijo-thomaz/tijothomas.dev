"use client";

import { useState, useEffect } from 'react';

interface CommandSuggestionsProps {
  visitedSections: string[];
  onExecuteCommand: (command: string) => void;
  demoMode: boolean;
  demoStep: number;
  demoCommands: Array<{ command: string; delay: number; message: string }>;
  onUserActivity: () => void;
}

const popularCommands = [
  { command: 'help', icon: '❓', desc: 'Show all commands' },
  { command: 'experience', icon: '🏢', desc: 'View work history' },
  { command: 'projects', icon: '🚀', desc: 'See my projects' },
  { command: 'skills', icon: '⚛️', desc: 'Technical skills' },
  { command: 'contact', icon: '📧', desc: 'Get in touch' },
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
  onUserActivity
}: CommandSuggestionsProps) {
  const [currentAiMessage, setCurrentAiMessage] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Rotate AI messages
  useEffect(() => {
    if (!demoMode) {
      const interval = setInterval(() => {
        setCurrentAiMessage(prev => (prev + 1) % aiMessages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [demoMode]);

  // Get suggested commands based on what user hasn't visited
  const getSuggestions = () => {
    return popularCommands.filter(cmd => 
      !visitedSections.includes(cmd.command) || cmd.command === 'help'
    ).slice(0, 3);
  };

  const suggestions = getSuggestions();

  const handleCommandClick = (command: string) => {
    onUserActivity();
    onExecuteCommand(command);
  };

  if (!showSuggestions && !demoMode) return null;

  return (
    <div className="border-t border-green-400/30 bg-black/50 backdrop-blur-sm p-3">
      <div className="max-w-4xl mx-auto">
        
        {/* Demo Mode Indicator */}
        {demoMode && (
          <div className="mb-4 flex items-center justify-between bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 font-mono text-sm">
                {demoStep < demoCommands.length ? demoCommands[demoStep]?.message : '🎯 Demo completed! Feel free to explore...'}
              </span>
            </div>
            <button
              onClick={() => onUserActivity()}
              className="text-blue-300 hover:text-white text-xs font-mono px-2 py-1 border border-blue-400/30 rounded"
            >
              Skip Demo
            </button>
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
              {showSuggestions ? '👁️ Hide' : '💡 Show'} Tips
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
