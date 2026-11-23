"use client";

import { Card, CardContent } from "../../../components/ui/card";
import { useChatAssistant, quickReplies } from "../model/useChatAssistant";
import { ChatMessages } from "./ChatMessages";
import { QuickReplies } from "./QuickReplies";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { ChatSubHeader } from "./ChatSubHeader";
import { PromptShieldStatus } from "./PromptShieldStatus";

const EnhancedChatAgent = () => {
  const {
    messages,
    input,
    setInput,
    isTyping,
    isOnline,
    messagesEndRef,
    handleSendMessage,
    handleKeyPress,
    promptShield,
  } = useChatAssistant();

  return (
    <Card
      className="h-full flex flex-col border-0 transition-colors duration-300"
      style={{
        backgroundColor: "var(--theme-card)",
        borderColor: "transparent",
      }}
      role="region"
      aria-label="AI chat assistant"
    >
      <ChatSubHeader isOnline={isOnline} />

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />

        {/* Quick Reply Buttons */}
        <QuickReplies
          replies={quickReplies}
          onReplyClick={handleSendMessage}
          isTyping={isTyping}
          showQuickReplies={messages.length === 1}
        />

        <TypingIndicator isVisible={isTyping} />

        <PromptShieldStatus promptShield={promptShield} />

        {/* Input area - Always sticky at bottom */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
          onKeyPress={handleKeyPress}
          isTyping={isTyping}
          isOnline={isOnline}
        />
      </CardContent>
    </Card>
  );
};

export default EnhancedChatAgent;
