"use client";

import { useState } from 'react';
import { useTheme } from '../../components/ThemeProvider';
import { ThemeButton } from './atoms/ThemeButton';
import { ThemeDropdown } from './molecules/ThemeDropdown';
import { Backdrop } from './atoms/Backdrop';

const ThemeControls = () => {
  const { theme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themes.find(t => t.value === theme);

  return (
    <div className="relative">
      <ThemeButton
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
        currentThemeLabel={currentTheme?.label || ''}
      />

      {isOpen && (
        <>
          <ThemeDropdown
            themes={themes}
            currentTheme={theme}
            onThemeSelect={setTheme}
            onClose={() => setIsOpen(false)}
          />
          <Backdrop onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
};

export { ThemeControls };
