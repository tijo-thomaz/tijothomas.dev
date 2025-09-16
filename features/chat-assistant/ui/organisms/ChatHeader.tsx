"use client";

import { HeaderTitle } from "../molecules/HeaderTitle";
import { HeaderButtons } from "../molecules/HeaderButtons";

interface ChatHeaderProps {
  onClose: () => void;
  isOnline: boolean;
}

export function ChatHeader({ onClose, isOnline }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/80 to-purple-600/80 border-b border-gray-700/50">
      <HeaderTitle isOnline={isOnline} />
      <HeaderButtons onClose={onClose} />
    </div>
  );
}
