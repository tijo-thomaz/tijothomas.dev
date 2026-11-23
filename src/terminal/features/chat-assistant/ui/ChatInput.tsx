"use client";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isTyping: boolean;
  isOnline: boolean;
}

export function ChatInput({
  input,
  setInput,
  onSendMessage,
  onKeyPress,
  isTyping,
  isOnline,
}: ChatInputProps) {
  return (
    <div
      className="border-t p-3 flex-shrink-0 transition-colors duration-300 sticky bottom-0 z-10"
      style={{
        borderColor: "var(--theme-border)",
        backgroundColor: "var(--theme-card)",
        boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={
            isOnline
              ? "Ask about skills, experience..."
              : "Currently offline"
          }
          className="font-mono text-sm border transition-colors duration-300 flex-1 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          style={{
            backgroundColor: "var(--theme-muted)",
            borderColor: "var(--theme-border)",
            color: "var(--theme-text)",
          }}
          disabled={isTyping || !isOnline}
          aria-label="Chat message input. Ask questions about skills, experience, or projects"
          aria-describedby="chat-help"
        />
        <Button
          onClick={onSendMessage}
          disabled={isTyping || !input.trim() || !isOnline}
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
      </div>
      
      {/* Hidden help text for screen readers */}
      <div id="chat-help" className="sr-only">
        Interactive AI chat assistant. Ask questions about skills, experience, projects, or any portfolio-related topics.
        Use Enter to send messages.
      </div>
    </div>
  );
}
