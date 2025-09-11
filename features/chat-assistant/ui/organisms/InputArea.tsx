"use client";

import { InputForm } from "../molecules/InputForm";

interface InputAreaProps {
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isTyping: boolean;
  isOnline: boolean;
}

export function InputArea({
  input,
  setInput,
  onSendMessage,
  onKeyPress,
  isTyping,
  isOnline,
}: InputAreaProps) {
  return (
    <div
      className="border-t p-3 flex-shrink-0 transition-colors duration-300 sticky bottom-0 z-10"
      style={{
        borderColor: "var(--theme-border)",
        backgroundColor: "var(--theme-card)",
        boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      <InputForm
        input={input}
        setInput={setInput}
        onSendMessage={onSendMessage}
        onKeyPress={onKeyPress}
        isTyping={isTyping}
        isOnline={isOnline}
      />
      
      {/* Hidden help text for screen readers */}
      <div id="chat-help" className="sr-only">
        Interactive AI chat assistant. Ask questions about skills, experience, projects, or any portfolio-related topics.
        Use Enter to send messages.
      </div>
    </div>
  );
}
