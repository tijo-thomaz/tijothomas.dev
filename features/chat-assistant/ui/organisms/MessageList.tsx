"use client";

import { MessageBubble } from "../molecules/MessageBubble";
import { Message } from "../../model/useChatAssistant";

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({ messages, messagesEndRef }: MessageListProps) {
  return (
    <div 
      className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300"
      role="log"
      aria-live="polite"
      aria-label="Chat conversation history"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
