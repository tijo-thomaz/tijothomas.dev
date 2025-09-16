"use client";

import { Card, CardContent } from "../../../components/ui/card";
import { useChatAssistant, quickReplies } from "../model/useChatAssistant";
import { ConversationArea } from "./organisms/ConversationArea";
import { InputArea } from "./organisms/InputArea";
import { ChatSubHeader } from "./ChatSubHeader";

const AtomicEnhancedChatAgent = () => {
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
        <ConversationArea
          messages={messages}
          messagesEndRef={messagesEndRef}
          quickReplies={quickReplies}
          onReplyClick={handleSendMessage}
          isTyping={isTyping}
          promptShield={promptShield}
        />

        <InputArea
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

export default AtomicEnhancedChatAgent;
