"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
// import { analytics } from "@/lib/analytics"; // Disabled - using simple analytics

type Theme = "terminal" | "light" | "dark" | "cyber";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; description: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>("dark");

  const themes = [
    {
      value: "terminal" as Theme,
      label: "Terminal",
      description: "Classic green on black",
    },
    {
      value: "light" as Theme,
      label: "Light",
      description: "Clean light theme",
    },
    { value: "dark" as Theme, label: "Dark", description: "Modern dark theme" },
    {
      value: "cyber" as Theme,
      label: "Cyber",
      description: "Neon cyberpunk style",
    },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem("tijothomas-theme") as Theme;
    if (savedTheme && themes.some((t) => t.value === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tijothomas-theme", theme);

    // Apply theme class to document
    const root = document.documentElement;
    root.className = root.className.replace(/theme-\w+/g, "");
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    // analytics.trackThemeChange(newTheme); // Disabled for privacy
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};
