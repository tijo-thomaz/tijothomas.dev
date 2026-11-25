"use client";

import { Bot } from "lucide-react";

interface TypingIndicatorProps {
  isVisible: boolean;
}

export function TypingIndicator({ isVisible }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className="flex gap-2 justify-start">
      <div className="flex gap-2">
        <Bot
          className="w-3 h-3 md:w-4 md:h-4 mt-1"
          style={{ color: "var(--theme-accent)" }}
        />
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
            <div className="flex gap-1 ml-2">
              <div
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{ backgroundColor: "var(--theme-accent)" }}
              ></div>
              <div
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  animationDelay: "0.1s",
                  backgroundColor: "var(--theme-accent)",
                }}
              ></div>
              <div
                className="w-1.5 h-1.5 rounded-full animate-bounce"
                style={{
                  animationDelay: "0.2s",
                  backgroundColor: "var(--theme-accent)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
