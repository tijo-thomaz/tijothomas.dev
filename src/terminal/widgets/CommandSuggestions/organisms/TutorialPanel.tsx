"use client";

import { TutorialStep } from "@/lib/tutorial-manager";
import { ProgressIndicator } from '../atoms/ProgressIndicator';

interface TutorialPanelProps {
  tutorialStep: number;
  tutorialSteps: TutorialStep[];
  onUserActivity: () => void;
}

export const TutorialPanel = ({ tutorialStep, tutorialSteps, onUserActivity }: TutorialPanelProps) => {
  return (
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
          />
          <span
            className="font-mono text-sm sm:text-sm text-xs font-bold"
            style={{ color: "var(--theme-accent)" }}
          >
            📚 Tutorial ({Math.min(tutorialStep + 1, tutorialSteps.length)}/
            {tutorialSteps.length})
          </span>
        </div>
        <button
          onClick={onUserActivity}
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

      <ProgressIndicator
        current={tutorialStep + 1}
        total={tutorialSteps.length}
      />

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
  );
};
