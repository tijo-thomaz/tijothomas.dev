"use client";

import { Button } from "../../../../components/ui/button";

interface QuickReplyButtonProps {
  text: string;
  onClick: (text: string) => void;
  disabled?: boolean;
}

export function QuickReplyButton({ text, onClick, disabled }: QuickReplyButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onClick(text)}
      className="border hover:opacity-80 zoom-text-xs px-2 py-1 transition-all duration-300 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      style={{
        backgroundColor: "var(--theme-muted)",
        borderColor: "var(--theme-border)",
        color: "var(--theme-text)",
      }}
      disabled={disabled}
      aria-label={`Quick reply: ${text}`}
    >
      {text}
    </Button>
  );
}
