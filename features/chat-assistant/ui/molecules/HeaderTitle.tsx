"use client";

import { StatusIndicator } from "../atoms/StatusIndicator";

interface HeaderTitleProps {
  isOnline: boolean;
}

export function HeaderTitle({ isOnline }: HeaderTitleProps) {
  return (
    <div className="flex items-center gap-2">
      <StatusIndicator isOnline={isOnline} />
      <span className="text-white font-medium">Tijo's AI Assistant</span>
    </div>
  );
}
