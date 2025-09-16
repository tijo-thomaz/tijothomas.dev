"use client";

import Button from "../atoms/Button";

interface NavigationItemProps {
  name: string;
  icon: string;
  description: string;
  section: number;
  currentSection: number;
  onClick: () => void;
}

export default function NavigationItem({
  name,
  icon,
  description,
  section,
  currentSection,
  onClick,
}: NavigationItemProps) {
  const isActive = currentSection === section;

  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
        isActive
          ? "bg-gradient-to-r from-green-500/40 to-blue-500/40 border border-green-400/60 shadow-lg scale-105"
          : "bg-white/5 hover:bg-white/15 border border-transparent hover:border-white/30 hover:scale-102"
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className="text-2xl">{icon}</div>
        <div className="text-left">
          <div className="text-white text-sm font-mono font-semibold">
            {name}
          </div>
          <div className="text-white/70 text-xs">
            {description}
          </div>
        </div>
      </div>
      <div
        className={`w-3 h-3 rounded-full transition-all ${
          isActive
            ? "bg-green-400 shadow-lg shadow-green-400/50"
            : "bg-white/40"
        }`}
      ></div>
    </Button>
  );
}
