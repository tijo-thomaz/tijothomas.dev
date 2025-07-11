"use client";

import { useState, useEffect, useCallback } from "react";
import Terminal from "@/components/Terminal";
import ZoomControls from "@/components/ZoomControls";
import SoundControls from "@/components/SoundControls";
import ThemeControls from "@/components/ThemeControls";
import SimpleAnalyticsDisplay from "@/components/SimpleAnalyticsDisplay";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import WorldViewer from "@/components/WorldViewer";
import Breadcrumbs from "@/components/Breadcrumbs";
import CommandSuggestions from "@/components/CommandSuggestions";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import { trackVisit } from "@/lib/simple-analytics";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [current3DWorld, setCurrent3DWorld] = useState<string | null>(null);

  // Persistent command history and navigation state
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [visitedSections, setVisitedSections] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<"terminal" | "interactive">(
    "terminal"
  );

  // Auto-demo state
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    setMounted(true);
    trackVisit(); // Track anonymous visit
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handle3DWorldEnter = useCallback((world: string) => {
    setCurrent3DWorld(world);
  }, []);

  const handle3DWorldExit = useCallback(() => {
    setCurrent3DWorld(null);
    setCurrentView("terminal");
  }, []);

  // Command history management
  const handleAddToCommandHistory = useCallback(
    (command: string) => {
      if (
        command.trim() &&
        commandHistory[commandHistory.length - 1] !== command.trim()
      ) {
        setCommandHistory((prev) => [...prev, command.trim()]);
      }
    },
    [commandHistory]
  );

  // Section visit tracking (just tracking, no navigation)
  const handleSectionVisit = useCallback(
    (section: string) => {
      if (!visitedSections.includes(section)) {
        setVisitedSections((prev) => [...prev, section]);
      }
    },
    [visitedSections]
  );

  // Navigate to interactive world (for explore commands)
  const handleNavigateToWorld = useCallback(
    (section: string) => {
      handleSectionVisit(section); // Track the visit
      if (
        section === "experience" ||
        section === "projects" ||
        section === "skills" ||
        section === "clients"
      ) {
        setCurrentView("interactive");
        setCurrent3DWorld(section);
      }
    },
    [handleSectionVisit]
  );

  // Get section index for InteractiveWorldViewer navigation
  const getSectionIndex = useCallback((section: string) => {
    switch (section) {
      case "experience":
        return 0;
      case "skills":
        return 1;
      case "projects":
        return 2;
      case "clients":
        return 3;
      default:
        return 0;
    }
  }, []);

  // Quick navigation from breadcrumbs
  const handleQuickNavigate = useCallback(
    (section: string) => {
      handleNavigateToWorld(section);
      handleAddToCommandHistory(section);
      setLastActivity(Date.now());
      setDemoMode(false); // Stop demo if user takes control
    },
    [handleNavigateToWorld, handleAddToCommandHistory]
  );

  // Enhanced tutorial demo - comprehensive guide
  const demoCommands = [
    {
      command: "help",
      delay: 2500,
      message:
        "👋 Welcome to my interactive portfolio! Let me show you how to navigate...",
      tip: "💡 Tip: Type 'help' anytime to see all available commands",
    },
    {
      command: "ls",
      delay: 3000,
      message:
        "📁 These are the main sections available. Let's explore each one...",
      tip: "💡 Try: Use arrow keys ↑↓ to browse your command history",
    },
    {
      command: "experience",
      delay: 4000,
      message:
        "🏢 Here's my professional journey. Notice the interactive timeline!",
      tip: "💡 Click on any job to see detailed information",
    },
    {
      command: "skills",
      delay: 3500,
      message:
        "⚛️ My technical expertise organized by category and proficiency",
      tip: "💡 Try: Type 'vim-skills' for an interactive skill visualization",
    },
    {
      command: "projects",
      delay: 4000,
      message: "🚀 Key projects and achievements with live demos",
      tip: "💡 Use 'projects-demo' to access direct project links",
    },
    {
      command: "git-log",
      delay: 3000,
      message: "📜 A simulated git history showing my development journey",
      tip: "💡 Real terminal commands work here: try 'pwd', 'whoami', 'date'",
    },
    {
      command: "contact",
      delay: 2500,
      message: "📧 Multiple ways to connect - email, LinkedIn, or WhatsApp",
      tip: "💡 The AI assistant (chat bubble) can answer questions anytime!",
    },
    {
      command: "clear",
      delay: 2000,
      message:
        "✨ Tutorial complete! Start exploring on your own. Type 'help' for guidance.",
      tip: "💡 Pro tip: Use Tab for autocomplete, themes in top-right, zoom controls available",
    },
  ];

  // Track user activity to trigger demo
  const handleUserActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWelcome(false); // Hide welcome message on any activity

    // Only cancel demo if user is doing something OTHER than following the tutorial
    // This allows tutorial to continue while user types guided commands
    if (demoMode) {
      setDemoMode(false);
      setDemoStep(0);
    }
  }, [demoMode]);

  // Separate handler for tutorial-specific user activity (doesn't cancel demo)
  const handleTutorialActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWelcome(false);
    // Don't cancel demo mode - let tutorial continue
  }, []);

  // Manual tutorial trigger for testing
  const handleStartTutorial = useCallback(() => {
    setDemoMode(true);
    setDemoStep(0);
    setShowWelcome(false);
    // Ensure we're in terminal view for tutorial
    setCurrentView("terminal");
  }, []);

  // Auto-demo timer effect
  useEffect(() => {
    // Only check for terminal view and if demo hasn't started yet
    if (currentView !== "terminal" || demoMode) {
      return;
    }

    const timer = setTimeout(() => {
      const timeSinceActivity = Date.now() - lastActivity;

      // Check if on mobile device
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const requiredDelay = isMobile ? 8000 : 5000; // 8 seconds on mobile, 5 on desktop
      
      if (timeSinceActivity >= requiredDelay && !demoMode && showWelcome) {
        // Start tutorial after delay (longer on mobile)
        setDemoMode(true);
        setDemoStep(0);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [lastActivity, demoMode, currentView, showWelcome]);

  // Handle viewport changes during tutorial
  useEffect(() => {
    if (!demoMode) return;

    const handleResize = () => {
      // Force re-render of tutorial components on viewport change
      const isMobile = window.innerWidth < 768;
      console.log(`[Tutorial] Viewport changed, mobile: ${isMobile}, step: ${demoStep + 1}`);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [demoMode, demoStep]);

  // Execute command from suggestions or demo
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
              onEnter3DWorld={handle3DWorldEnter}
              onSectionVisit={handleSectionVisit}
              onNavigateToWorld={handleNavigateToWorld}
              onAddToCommandHistory={handleAddToCommandHistory}
              commandHistory={commandHistory}
              demoMode={demoMode}
              demoStep={demoStep}
              demoCommands={demoCommands}
              onUserActivity={handleUserActivity}
              onTutorialActivity={handleTutorialActivity}
              onDemoStepComplete={() => {
                console.log(`[Tutorial] Step completion callback triggered, current step: ${demoStep}`);
                setDemoStep((prev) => {
                  console.log(`[Tutorial] Advancing from step ${prev} to step ${prev + 1}`);
                  return prev + 1;
                });
              }}
            />
          </div>
        </div>

        {/* Command Suggestions */}
        {currentView === "terminal" && (
          <CommandSuggestions
            visitedSections={visitedSections}
            onExecuteCommand={handleExecuteCommand}
            demoMode={demoMode}
            demoStep={demoStep}
            demoCommands={demoCommands}
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
                href="https://groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-1 py-0.5 md:px-2 md:py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80 text-xs"
                style={{
                  backgroundColor: "var(--theme-surface)",
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-accent)",
                }}
              >
                Groq AI
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
              © 2025 Tijo Thomas | Interactive Portfolio Terminal
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
