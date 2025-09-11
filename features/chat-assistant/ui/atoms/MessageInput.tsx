"use client";

import { Input } from "../../../../components/ui/input";

interface MessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  placeholder: string;
  disabled?: boolean;
}

export function MessageInput({ 
  value, 
  onChange, 
  onKeyPress, 
  placeholder, 
  disabled 
}: MessageInputProps) {
  return (
    <Input
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      className="font-mono text-sm border transition-colors duration-300 flex-1 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      style={{
        backgroundColor: "var(--theme-muted)",
        borderColor: "var(--theme-border)",
        color: "var(--theme-text)",
      }}
      disabled={disabled}
      aria-label="Chat message input. Ask questions about skills, experience, or projects"
      aria-describedby="chat-help"
    />
  );
}
