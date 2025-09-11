"use client";

import { Bot } from "lucide-react";

interface BotIconProps {
  className?: string;
  color?: string;
}

export function BotIcon({ className = "w-3 h-3", color = "var(--theme-accent)" }: BotIconProps) {
  return (
    <Bot 
      className={className} 
      style={{ color }} 
      aria-hidden="true" 
    />
  );
}
