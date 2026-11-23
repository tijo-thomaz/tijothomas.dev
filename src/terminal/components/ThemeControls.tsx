"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Palette, ChevronDown } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const ThemeControls = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themes.find(t => t.value === theme);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 h-8 border transition-colors hover:opacity-80"
        style={{
          backgroundColor: "var(--theme-surface)",
          borderColor: "var(--theme-border)",
          color: "var(--theme-accent)"
        }}
        aria-label={`Change theme. Current theme: ${currentTheme?.label}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Palette className="w-4 h-4" aria-hidden="true" />
        <ChevronDown className="w-3 h-3" aria-hidden="true" />
      </Button>

      {isOpen && (
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
            <button
              key={themeOption.value}
              onClick={() => {
                setTheme(themeOption.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 first:rounded-t-lg last:rounded-b-lg transition-colors hover:opacity-80"
              style={{
                backgroundColor: theme === themeOption.value ? "var(--theme-muted)" : "transparent",
                color: theme === themeOption.value ? "var(--theme-accent)" : "var(--theme-text)"
              }}
              role="menuitem"
              aria-current={theme === themeOption.value ? 'true' : 'false'}
            >
              <div className="font-mono text-xs font-medium">{themeOption.label}</div>
              <div 
                className="font-mono text-xs"
                style={{ color: "var(--theme-secondary)" }}
              >
                {themeOption.description}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeControls;
