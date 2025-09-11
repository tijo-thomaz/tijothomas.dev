"use client";

import { Button } from '../../../components/ui/button';
import { Palette, ChevronDown } from 'lucide-react';

interface ThemeButtonProps {
  onClick: () => void;
  isOpen: boolean;
  currentThemeLabel: string;
}

export const ThemeButton = ({ onClick, isOpen, currentThemeLabel }: ThemeButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-1 px-2 h-8 border transition-colors hover:opacity-80"
      style={{
        backgroundColor: "var(--theme-surface)",
        borderColor: "var(--theme-border)",
        color: "var(--theme-accent)"
      }}
      aria-label={`Change theme. Current theme: ${currentThemeLabel}`}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <Palette className="w-4 h-4" aria-hidden="true" />
      <ChevronDown className="w-3 h-3" aria-hidden="true" />
    </Button>
  );
};
