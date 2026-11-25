"use client";

import { Bot, Sparkles, Wifi, WifiOff } from "lucide-react";
import ContactActions from "../../../components/ContactActions";

interface ChatSubHeaderProps {
  isOnline: boolean;
}

export function ChatSubHeader({ isOnline }: ChatSubHeaderProps) {
  return (
    <div
      className="py-3 px-4 flex-shrink-0 border-b-0 transition-colors duration-300"
      style={{ borderColor: "transparent" }}
    >
      <div className="flex items-center justify-between">
        <div
          className="font-mono flex items-center gap-2 text-sm font-medium"
          style={{ color: "var(--theme-accent)" }}
        >
          <Bot className="w-4 h-4" />
          <span>Portfolio Chat</span>
          <Sparkles
            className="w-3 h-3"
            style={{ color: "var(--theme-secondary)" }}
          />
          {isOnline ? (
            <Wifi className="w-3 h-3 text-green-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-400" />
          )}
        </div>
        <ContactActions className="scale-75" />
      </div>
    </div>
  );
}
