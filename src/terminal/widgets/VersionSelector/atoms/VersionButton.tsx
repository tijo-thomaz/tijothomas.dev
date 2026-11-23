"use client";

import { ChevronDown } from "lucide-react";
import { type ReactElement } from "react";

interface VersionButtonProps {
  icon: ReactElement;
  version: string;
  onClick: () => void;
  isOpen: boolean;
}

export const VersionButton = ({ icon, version, onClick, isOpen }: VersionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 text-sm font-mono border rounded-lg transition-all duration-200 hover:opacity-80"
      style={{
        color: "var(--theme-accent)",
        borderColor: "var(--theme-border)",
        backgroundColor: "var(--theme-surface)",
      }}
    >
      {icon}
      <span>v{version}</span>
      <ChevronDown
        className={`w-4 h-4 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );
};
