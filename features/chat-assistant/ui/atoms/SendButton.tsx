"use client";

import { Button } from "../../../../components/ui/button";
import { Send } from "lucide-react";

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function SendButton({ onClick, disabled }: SendButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-2 border transition-colors duration-300 flex-shrink-0 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      style={{
        backgroundColor: "var(--theme-accent)",
        borderColor: "var(--theme-accent)",
        color: "var(--theme-bg)",
      }}
      aria-label="Send message"
    >
      <Send className="w-4 h-4" aria-hidden="true" />
    </Button>
  );
}
