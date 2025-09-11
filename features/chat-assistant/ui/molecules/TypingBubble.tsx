"use client";

import { BotIcon } from "../atoms/BotIcon";
import { AnimatedDots } from "../atoms/AnimatedDots";

interface TypingBubbleProps {
  isVisible: boolean;
}

export function TypingBubble({ isVisible }: TypingBubbleProps) {
  if (!isVisible) return null;

  return (
    <div className="flex gap-2 justify-start">
      <div className="flex gap-2">
        <BotIcon className="w-3 h-3 md:w-4 md:h-4 mt-1" />
        <div
          className="border rounded-lg p-2 md:p-3 font-mono zoom-text-sm md:zoom-text-base transition-colors duration-300"
          style={{
            backgroundColor: "var(--theme-muted)",
            color: "var(--theme-text)",
            borderColor: "var(--theme-border)",
          }}
        >
          <div className="flex gap-1 items-center">
            <span style={{ color: "var(--theme-accent)" }}>
              AI thinking
            </span>
            <AnimatedDots />
          </div>
        </div>
      </div>
    </div>
  );
}
