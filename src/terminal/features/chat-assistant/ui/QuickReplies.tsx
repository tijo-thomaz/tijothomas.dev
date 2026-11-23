"use client";

import { Button } from "../../../components/ui/button";

interface QuickRepliesProps {
  replies: string[];
  onReplyClick: (reply: string) => void;
  isTyping: boolean;
  showQuickReplies: boolean;
}

export function QuickReplies({ 
  replies, 
  onReplyClick, 
  isTyping, 
  showQuickReplies 
}: QuickRepliesProps) {
  if (!showQuickReplies) return null;

  return (
    <div className="flex flex-wrap gap-1 px-3" role="group" aria-label="Quick reply suggestions">
      {replies.map((reply, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onReplyClick(reply)}
          className="border hover:opacity-80 zoom-text-xs px-2 py-1 transition-all duration-300 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          style={{
            backgroundColor: "var(--theme-muted)",
            borderColor: "var(--theme-border)",
            color: "var(--theme-text)",
          }}
          disabled={isTyping}
          aria-label={`Quick reply: ${reply}`}
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}
