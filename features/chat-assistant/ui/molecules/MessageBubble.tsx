"use client";

import { UserIcon } from "../atoms/UserIcon";
import { BotIcon } from "../atoms/BotIcon";
import { Message } from "../../model/useChatAssistant";
import ContactMessage from "../../../../components/ContactMessage";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.isUser;

  return (
    <div
      className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex gap-2 max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="flex-shrink-0 mt-1">
          {isUser ? <UserIcon /> : <BotIcon />}
        </div>
        <div
          className="rounded-lg p-3 font-mono text-sm leading-relaxed break-words border transition-colors duration-300"
          style={
            isUser
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
          aria-label={`${isUser ? "User" : "AI Assistant"} message`}
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
  );
}
