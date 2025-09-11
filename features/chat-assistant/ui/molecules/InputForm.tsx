"use client";

import { MessageInput } from "../atoms/MessageInput";
import { SendButton } from "../atoms/SendButton";

interface InputFormProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isTyping: boolean;
  isOnline: boolean;
}

export function InputForm({
  input,
  setInput,
  onSendMessage,
  onKeyPress,
  isTyping,
  isOnline,
}: InputFormProps) {
  const placeholder = isOnline
    ? "Ask about skills, experience..."
    : "Currently offline";

  return (
    <div className="flex gap-3">
      <MessageInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={isTyping || !isOnline}
      />
      <SendButton
        onClick={onSendMessage}
        disabled={isTyping || !input.trim() || !isOnline}
      />
    </div>
  );
}
