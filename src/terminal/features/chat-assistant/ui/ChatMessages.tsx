"use client";

import { Bot, User } from "lucide-react";
import { Message } from "../model/useChatAssistant";
import ContactMessage from "../../../components/ContactMessage";

interface ChatMessagesProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessages({ messages, messagesEndRef }: ChatMessagesProps) {
  return (
    <div 
      className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300"
      role="log"
      aria-live="polite"
      aria-label="Chat conversation history"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-2 ${
            message.isUser ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`flex gap-2 max-w-[85%] ${
              message.isUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {message.isUser ? (
                <User
                  className="w-3 h-3"
                  style={{ color: "var(--theme-accent)" }}
                  aria-hidden="true"
                />
              ) : (
                <Bot
                  className="w-3 h-3"
                  style={{ color: "var(--theme-accent)" }}
                  aria-hidden="true"
                />
              )}
            </div>
            <div
              className="rounded-lg p-3 font-mono text-sm leading-relaxed break-words border transition-colors duration-300"
              style={
                message.isUser
                  ? {
                      backgroundColor: "var(--theme-accent)",
                      color: "var(--theme-bg)",
                      borderColor: "var(--theme-accent)",
                    }
                  : {
                      backgroundColor: "var(--theme-muted)",
                      color: "var(--theme-text)",
                      borderColor: "var(--theme-border)",
                    }
              }
              role="article"
              aria-label={`${message.isUser ? "User" : "AI Assistant"} message`}
            >
              {message.text === "SHOW_CONTACT_ACTIONS" ? (
                <ContactMessage />
              ) : (
                <>
                  {message.text.split("\n").map((line, index) => (
                    <div key={index} className="mb-1 last:mb-0">
                      {line.includes("**") ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: line
                              .replace(
                                /\*\*(.*?)\*\*/g,
                                `<strong style="color: var(--theme-text); font-weight: bold;">$1</strong>`
                              )
                              .replace(
                                /•/g,
                                `<span style="color: var(--theme-accent);">•</span>`
                              ),
                          }}
                        />
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </>
              )}
              {message.responseTime && (
                <div className="text-xs opacity-50 mt-1">
                  {message.responseTime}ms
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
