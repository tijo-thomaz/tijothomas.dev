"use client";

import { QuickReplyButton } from "../atoms/QuickReplyButton";

interface QuickReplyListProps {
  replies: string[];
  onReplyClick: (reply: string) => void;
  isTyping: boolean;
  showQuickReplies: boolean;
}

export function QuickReplyList({ 
  replies, 
  onReplyClick, 
  isTyping, 
  showQuickReplies 
}: QuickReplyListProps) {
  if (!showQuickReplies) return null;

  return (
    <div className="flex flex-wrap gap-1 px-3" role="group" aria-label="Quick reply suggestions">
      {replies.map((reply, index) => (
        <QuickReplyButton
          key={index}
          text={reply}
          onClick={onReplyClick}
          disabled={isTyping}
        />
      ))}
    </div>
  );
}
