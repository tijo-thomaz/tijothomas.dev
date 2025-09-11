"use client";

import { ThemeOption } from '../atoms/ThemeOption';

interface ThemeData {
  value: string;
  label: string;
  description: string;
}

interface ThemeDropdownProps {
  themes: ThemeData[];
  currentTheme: string;
  onThemeSelect: (theme: any) => void;
  onClose: () => void;
}

export const ThemeDropdown = ({ themes, currentTheme, onThemeSelect, onClose }: ThemeDropdownProps) => {
  const handleThemeClick = (themeValue: string) => {
    onThemeSelect(themeValue);
    onClose();
  };

  return (
    <div 
      className="absolute top-full mt-1 right-0 border rounded-lg shadow-lg z-50 min-w-[180px] backdrop-blur-md"
      style={{
        backgroundColor: "var(--theme-surface)",
        borderColor: "var(--theme-border)"
      }}
      role="menu"
      aria-label="Theme selection menu"
    >
      {themes.map((themeOption) => (
        <ThemeOption
          key={themeOption.value}
          label={themeOption.label}
          description={themeOption.description}
          isSelected={currentTheme === themeOption.value}
          onClick={() => handleThemeClick(themeOption.value)}
        />
      ))}
    </div>
  );
};
