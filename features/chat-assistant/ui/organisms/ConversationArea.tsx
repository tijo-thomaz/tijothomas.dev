"use client";

import { MessageList } from "./MessageList";
import { QuickReplyList } from "../molecules/QuickReplyList";
import { TypingBubble } from "../molecules/TypingBubble";
import { PromptShieldStatus } from "../PromptShieldStatus";
import { Message } from "../../model/useChatAssistant";
import { usePromptShield } from "../../../prompt-shield/model/usePromptShield";

interface ConversationAreaProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  quickReplies: string[];
  onReplyClick: (reply: string) => void;
  isTyping: boolean;
  promptShield: ReturnType<typeof usePromptShield>;
}

export function ConversationArea({
  messages,
  messagesEndRef,
  quickReplies,
  onReplyClick,
  isTyping,
  promptShield,
}: ConversationAreaProps) {
  const showQuickReplies = messages.length === 1;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <MessageList messages={messages} messagesEndRef={messagesEndRef} />

      <QuickReplyList
        replies={quickReplies}
        onReplyClick={onReplyClick}
        isTyping={isTyping}
        showQuickReplies={showQuickReplies}
      />

      <TypingBubble isVisible={isTyping} />

      <PromptShieldStatus promptShield={promptShield} />
    </div>
  );
}
