"use client";

import { useState, useEffect, useCallback, useRef } from "react";
// 🏗️ FSD ARCHITECTURE - CLEAN NEXT.JS STRUCTURE  
import { Terminal } from '../../features/terminal';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const FloatingAIAssistant = dynamic(() => import('../../features/chat-assistant'), {
  ssr: false,
});
const WorldViewer = dynamic(() => import('../../features/world-viewer'), {
  ssr: false,
});
import { ZoomControls } from '../../widgets/ZoomControls';
import { SoundControls } from '../../widgets/SoundControls';
import { ThemeControls } from '../../widgets/ThemeControls';
import { SimpleAnalyticsDisplay } from '../../widgets/Analytics';
import { VersionSelector } from '../../widgets/VersionSelector';
import { Breadcrumbs } from '../../widgets/Breadcrumbs';
import { CommandSuggestions } from '../../widgets/CommandSuggestions';
import { PrivacyPolicy } from '../../widgets/PrivacyPolicy';
import { trackVisit } from "@/lib/simple-analytics";
import { TutorialManager, TUTORIAL_STEPS } from "@/lib/tutorial-manager";

/**
 * V2 Page - EXACT replica of original UI using FSD architecture
 * Zero visual changes - just better architecture under the hood
 */
export default function V2Page() {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [current3DWorld, setCurrent3DWorld] = useState<string | null>(null);

  // Persistent command history and navigation state
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [visitedSections, setVisitedSections] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<"terminal" | "interactive">(
    "terminal"
  );

  // Tutorial state
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWelcome, setShowWelcome] = useState(true);
  const [terminalInput, setTerminalInput] = useState("");
  const tutorialManagerRef = useRef<TutorialManager | null>(null);
  const terminalRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
    trackVisit(); // Track anonymous visit

    // Initialize tutorial manager
    if (!tutorialManagerRef.current) {
      tutorialManagerRef.current = new TutorialManager(
        () => {
          // onTypeStart
          console.log("[Tutorial] Started typing");
        },
        () => {
          // onTypeComplete
          console.log("[Tutorial] Finished typing");
        },
        (value: string) => {
          // onInputChange
          setTerminalInput(value);
        },
        (command: string) => {
          // onExecuteCommand
          handleAddToCommandHistory(command);
          if (terminalRef.current) {
            terminalRef.current.executeCommand(command);
          }
        },
        (step: number) => {
          // onStepComplete
          setTutorialStep(step);
          console.log(`[Tutorial] Step ${step + 1} completed`);
        },
        () => {
          // onTutorialComplete
          setTutorialActive(false);
          setTutorialStep(0);
          console.log("[Tutorial] Tutorial completed!");
        }
      );
    }

    return () => {
      if (tutorialManagerRef.current) {
        tutorialManagerRef.current.stop();
      }
    };
  }, []);

  // Handle zoom changes
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  // Handle journey progress (breadcrumbs navigation)
  const handleJourneyProgress = useCallback((section: string) => {
    setVisitedSections((prev) => {
      if (!prev.includes(section)) {
        return [...prev, section];
      }
      return prev;
    });
  }, []);

  // Handle 3D world entry
  const handle3DWorldEnter = useCallback((world: string) => {
    setCurrent3DWorld(world);
    setCurrentView("interactive");
  }, []);

  // Handle 3D world exit
  const handle3DWorldExit = useCallback(() => {
    setCurrent3DWorld(null);
    setCurrentView("terminal");
  }, []);

  // Handle navigation to specific world
  const handleNavigateToWorld = useCallback((world: string) => {
    setCurrent3DWorld(world);
    setCurrentView("interactive");
    handleJourneyProgress(world);
  }, [handleJourneyProgress]);

  // Handle adding to command history
  const handleAddToCommandHistory = useCallback((command: string) => {
    setCommandHistory((prev) => [...prev, command]);
  }, []);

  // Handle quick navigation
  const handleQuickNavigate = useCallback((section: string) => {
    handleNavigateToWorld(section);
  }, [handleNavigateToWorld]);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Handle tutorial activity
  const handleTutorialActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Handle start tutorial
  const handleStartTutorial = useCallback(() => {
    if (tutorialManagerRef.current) {
      setTutorialActive(true);
      setTutorialStep(0);
      setShowWelcome(false);
      tutorialManagerRef.current.start();
    }
  }, []);

  // Get section index for world viewer
  const getSectionIndex = (world: string): number => {
    const sections = ["experience", "projects", "skills", "clients"];
    return sections.indexOf(world) || 0;
  };

  // Auto-start tutorial after inactivity
  useEffect(() => {
    if (!mounted || tutorialActive || !showWelcome) return;

    const timer = setTimeout(() => {
      const timeSinceActivity = Date.now() - lastActivity;

      // Check if on mobile device
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const requiredDelay = isMobile ? 8000 : 5000; // 8 seconds on mobile, 5 on desktop

      if (
        timeSinceActivity >= requiredDelay &&
        !tutorialActive &&
        showWelcome
      ) {
        // Start tutorial after delay (longer on mobile)
        console.log(
          `[Tutorial] Starting auto-tutorial on ${
            isMobile ? "mobile" : "desktop"
          } after ${requiredDelay}ms`
        );
        handleStartTutorial();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    lastActivity,
    tutorialActive,
    currentView,
    showWelcome,
    handleStartTutorial,
    mounted,
  ]);

  // Execute command from suggestions or tutorial
  const handleExecuteCommand = useCallback(
    (command: string) => {
      handleAddToCommandHistory(command);
      setLastActivity(Date.now());

      // If it's a section command, navigate to world
      if (["experience", "projects", "skills", "clients"].includes(command)) {
        handleNavigateToWorld(command);
      }
    },
    [handleAddToCommandHistory, handleNavigateToWorld]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400 font-mono">
          Loading tijothomas.dev...
        </div>
      </div>
    );
  }

  // If in 3D world mode, show full-screen world viewer
  if (current3DWorld) {
    return (
      <div className="h-screen w-screen">
        <WorldViewer
          world={current3DWorld}
          onExit={handle3DWorldExit}
          initialSection={getSectionIndex(current3DWorld)}
        />
        <FloatingAIAssistant />
      </div>
    );
  }

  return (
    <main
      className="h-screen flex flex-col overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: "var(--theme-bg)",
        color: "var(--theme-text)",
      }}
    >
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:no-underline"
      >
        Skip to main content
      </a>
      <div className="flex flex-col h-full max-w-7xl mx-auto w-full min-h-0">
        {/* Header - Minimal on mobile */}
        <div className="flex-shrink-0 p-1 sm:p-2 md:p-3 text-center relative">
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold font-mono mb-1">
            tijothomas.dev
          </h1>
          <p
            className="font-mono text-xs mb-2 md:mb-3 hidden md:block"
            style={{ color: "var(--theme-secondary)" }}
          >
            Interactive Portfolio Terminal + AI Assistant
          </p>

          {/* Controls */}
          <div className="flex justify-center items-center gap-1 sm:gap-2 md:gap-3 flex-wrap">
            <VersionSelector />
            <SoundControls />
            <ZoomControls onZoomChange={handleZoomChange} />
            <ThemeControls />
            <div className="hidden lg:block">
              <SimpleAnalyticsDisplay />
            </div>
          </div>
        </div>

        {/* Main Content - Full Terminal */}
        <div
          id="main-content"
          className="flex-1 flex flex-col gap-2 md:gap-3 p-2 md:p-3 pt-0 min-h-0"
        >
          {/* Terminal - Full height */}
          <div className="h-full min-h-0" style={{ fontSize: `${zoom}%` }}>
            <Terminal
              ref={terminalRef}
              className="h-full"
              // Original props that will be handled by our new Terminal
              onEnter3DWorld={handle3DWorldEnter}
              onJourneyProgress={handleJourneyProgress}
              onNavigateToWorld={handleNavigateToWorld}
              onAddToCommandHistory={handleAddToCommandHistory}
              commandHistory={commandHistory}
              tutorialManager={tutorialManagerRef.current}
              onUserActivity={handleUserActivity}
              onTutorialActivity={handleTutorialActivity}
              terminalInput={terminalInput}
            />
          </div>
        </div>

        {/* Command Suggestions */}
        {currentView === "terminal" && (
          <CommandSuggestions
            visitedSections={visitedSections}
            onExecuteCommand={handleExecuteCommand}
            tutorialActive={tutorialActive}
            tutorialStep={tutorialStep}
            tutorialSteps={TUTORIAL_STEPS}
            onUserActivity={handleUserActivity}
            showWelcome={showWelcome}
            onStartTutorial={handleStartTutorial}
          />
        )}

        {/* Breadcrumbs Navigation */}
        <Breadcrumbs
          visitedSections={visitedSections}
          onNavigate={handleQuickNavigate}
          currentView={currentView}
        />

        {/* Footer - Minimal on mobile */}
        <div className="flex-shrink-0 p-0.5 sm:p-1 md:p-2 text-center space-y-0.5 sm:space-y-1">
          <div className="flex flex-wrap justify-center items-center gap-0.5 sm:gap-1 md:gap-2 text-xs font-mono">
            <span
              className="hidden md:inline"
              style={{ color: "var(--theme-muted)" }}
            >
              Powered by:
            </span>
            <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1 md:gap-2">
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-0.5 md:px-2 md:py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80 text-xs"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-accent)",
                }}
              >
                Next.js 14
              </a>
              <a
                href="https://www.typescriptlang.org"
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-0.5 md:px-2 md:py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80 text-xs"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-accent)",
                }}
              >
                TypeScript
              </a>
              <a
                href="https://tailwindcss.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-0.5 md:px-2 md:py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80 text-xs"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-accent)",
                }}
              >
                Tailwind CSS
              </a>
              <a
                href="https://promptshield.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-0.5 md:px-2 md:py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80 text-xs bg-gradient-to-r from-blue-600 to-purple-600"
                style={{
                  borderColor: "var(--theme-border)",
                  color: "white",
                }}
              >
                🛡️ PromptShield AI
              </a>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-0.5 md:px-2 md:py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80 text-xs"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-accent)",
                }}
              >
                Supabase
              </a>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-0.5 md:px-2 md:py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80 text-xs"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-accent)",
                }}
              >
                Vercel
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p
              className="font-mono text-xs"
              style={{ color: "var(--theme-muted)" }}
            >
              © 2025 Tijo Thomas | Interactive Portfolio Terminal (FSD Architecture)
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs" style={{ color: "var(--theme-muted)" }}>
                🔒 Anonymous Analytics Only
              </span>
              <span className="text-xs" style={{ color: "var(--theme-muted)" }}>
                •
              </span>
              <PrivacyPolicy />
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </main>
  );
}


