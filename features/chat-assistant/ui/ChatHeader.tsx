"use client";

import { Button } from "../../../components/ui/button";
import { X, ChevronLeft } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  isOnline: boolean;
}

export function ChatHeader({ onClose, isOnline }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/80 to-purple-600/80 border-b border-gray-700/50">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
        <span className="text-white font-medium">Tijo's AI Assistant</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/20"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/20"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
