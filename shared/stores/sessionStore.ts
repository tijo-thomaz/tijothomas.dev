import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  // User session data
  sessionId: string;
  isOnline: boolean;
  theme: string;
  zoom: number;
  soundEnabled: boolean;
  
  // Navigation state
  currentView: 'terminal' | 'interactive';
  current3DWorld: string | null;
  visitedSections: string[];
  commandHistory: string[];
  
  // Tutorial state
  tutorialActive: boolean;
  tutorialStep: number;
  showWelcome: boolean;
  lastActivity: number;
  
  // Actions
  setSessionId: (id: string) => void;
  setOnline: (online: boolean) => void;
  setTheme: (theme: string) => void;
  setZoom: (zoom: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  
  setCurrentView: (view: 'terminal' | 'interactive') => void;
  setCurrent3DWorld: (world: string | null) => void;
  addVisitedSection: (section: string) => void;
  addToCommandHistory: (command: string) => void;
  
  setTutorialActive: (active: boolean) => void;
  setTutorialStep: (step: number) => void;
  setShowWelcome: (show: boolean) => void;
  updateLastActivity: () => void;
  
  // Reset functions
  resetTutorial: () => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isOnline: true,
      theme: 'terminal',
      zoom: 100,
      soundEnabled: false,
      
      currentView: 'terminal',
      current3DWorld: null,
      visitedSections: [],
      commandHistory: [],
      
      tutorialActive: false,
      tutorialStep: 0,
      showWelcome: true,
      lastActivity: Date.now(),
      
      // Actions
      setSessionId: (id) => set({ sessionId: id }),
      setOnline: (online) => set({ isOnline: online }),
      setTheme: (theme) => set({ theme }),
      setZoom: (zoom) => set({ zoom }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      
      setCurrentView: (view) => set({ currentView: view }),
      setCurrent3DWorld: (world) => set({ current3DWorld: world }),
      addVisitedSection: (section) => set((state) => ({
        visitedSections: state.visitedSections.includes(section) 
          ? state.visitedSections 
          : [...state.visitedSections, section]
      })),
      addToCommandHistory: (command) => set((state) => ({
        commandHistory: [...state.commandHistory.filter(c => c !== command), command].slice(-50)
      })),
      
      setTutorialActive: (active) => set({ tutorialActive: active }),
      setTutorialStep: (step) => set({ tutorialStep: step }),
      setShowWelcome: (show) => set({ showWelcome: show }),
      updateLastActivity: () => set({ lastActivity: Date.now() }),
      
      // Reset functions
      resetTutorial: () => set({ 
        tutorialActive: false, 
        tutorialStep: 0, 
        showWelcome: true 
      }),
      resetSession: () => set({
        visitedSections: [],
        commandHistory: [],
        currentView: 'terminal',
        current3DWorld: null,
        lastActivity: Date.now(),
      }),
    }),
    {
      name: 'tijothomas-session',
      partialize: (state) => ({
        theme: state.theme,
        zoom: state.zoom,
        soundEnabled: state.soundEnabled,
        commandHistory: state.commandHistory,
        visitedSections: state.visitedSections,
      }),
    }
  )
);
