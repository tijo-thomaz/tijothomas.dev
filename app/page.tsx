"use client";

import { useState, useEffect, useCallback } from "react";
import Terminal from "@/components/Terminal";
import ZoomControls from "@/components/ZoomControls";
import SoundControls from "@/components/SoundControls";
import ThemeControls from "@/components/ThemeControls";
import AnalyticsDisplay from "@/components/AnalyticsDisplay";
import FloatingAIAssistant from "@/components/FloatingAIAssistant";
import SupabaseDebug from "@/components/SupabaseDebug";
import WorldViewer from "@/components/WorldViewer";
import Breadcrumbs from "@/components/Breadcrumbs";
import CommandSuggestions from "@/components/CommandSuggestions";
import CookieConsent from "@/components/CookieConsent";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import { analytics } from "@/lib/analytics";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [current3DWorld, setCurrent3DWorld] = useState<string | null>(null);
  
  // Persistent command history and navigation state
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [visitedSections, setVisitedSections] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'terminal' | 'interactive'>('terminal');
  
  // Auto-demo state
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // GDPR consent state
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handle3DWorldEnter = useCallback((world: string) => {
    setCurrent3DWorld(world);
  }, []);

  const handle3DWorldExit = useCallback(() => {
    setCurrent3DWorld(null);
    setCurrentView('terminal');
  }, []);

  // Command history management
  const handleAddToCommandHistory = useCallback((command: string) => {
    if (command.trim() && commandHistory[commandHistory.length - 1] !== command.trim()) {
      setCommandHistory(prev => [...prev, command.trim()]);
    }
  }, [commandHistory]);

  // Section visit tracking (just tracking, no navigation)
  const handleSectionVisit = useCallback((section: string) => {
    if (!visitedSections.includes(section)) {
      setVisitedSections(prev => [...prev, section]);
    }
  }, [visitedSections]);

  // Navigate to interactive world (for explore commands)
  const handleNavigateToWorld = useCallback((section: string) => {
    handleSectionVisit(section); // Track the visit
    if (section === 'experience' || section === 'projects' || section === 'skills' || section === 'clients') {
      setCurrentView('interactive');
      setCurrent3DWorld(section);
    }
  }, [handleSectionVisit]);

  // Get section index for InteractiveWorldViewer navigation
  const getSectionIndex = useCallback((section: string) => {
    switch (section) {
      case 'experience': return 0;
      case 'skills': return 1;
      case 'projects': return 2;
      case 'clients': return 3;
      default: return 0;
    }
  }, []);

  // Quick navigation from breadcrumbs
  const handleQuickNavigate = useCallback((section: string) => {
    handleNavigateToWorld(section);
    handleAddToCommandHistory(section);
    setLastActivity(Date.now());
    setDemoMode(false); // Stop demo if user takes control
  }, [handleNavigateToWorld, handleAddToCommandHistory]);

  // Auto-demo functionality
  const demoCommands = [
    { command: 'help', delay: 2000, message: '👋 Welcome! Let me show you around...' },
    { command: 'experience', delay: 3000, message: '🏢 Let\'s explore my professional journey...' },
    { command: 'projects', delay: 4000, message: '🚀 Check out some key projects...' },
    { command: 'skills', delay: 3000, message: '⚛️ Here are my technical skills...' },
    { command: 'contact', delay: 2000, message: '📧 Ready to connect? Here\'s how...' }
  ];

  // Track user activity to trigger demo
  const handleUserActivity = useCallback(() => {
    setLastActivity(Date.now());
    if (demoMode) {
      setDemoMode(false);
      setDemoStep(0);
    }
  }, [demoMode]);

  // Auto-demo timer effect
  useEffect(() => {
    if (currentView !== 'terminal' || visitedSections.length > 0) return;

    const timer = setTimeout(() => {
      const timeSinceActivity = Date.now() - lastActivity;
      if (timeSinceActivity >= 8000 && !demoMode) { // 8 seconds of inactivity
        setDemoMode(true);
        setDemoStep(0);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [lastActivity, demoMode, currentView, visitedSections.length]);

  // Execute command from suggestions or demo
  const handleExecuteCommand = useCallback((command: string) => {
    handleAddToCommandHistory(command);
    setLastActivity(Date.now());
    
    // If it's a section command, navigate to world
    if (['experience', 'projects', 'skills', 'clients'].includes(command)) {
      handleNavigateToWorld(command);
    }
  }, [handleAddToCommandHistory, handleNavigateToWorld]);

  // Handle GDPR consent
  const handleConsentChange = useCallback((consent: boolean) => {
    setConsentGiven(consent);
    analytics.setConsent(consent);
  }, []);

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
              <AnalyticsDisplay />
            </div>
          </div>
        </div>

        {/* Main Content - Full Terminal */}
        <div className="flex-1 flex flex-col gap-2 md:gap-3 p-2 md:p-3 pt-0 min-h-0">
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
              onDemoStepComplete={() => setDemoStep(prev => prev + 1)}
            />
          </div>
        </div>

        {/* Command Suggestions */}
        {currentView === 'terminal' && (
          <CommandSuggestions
            visitedSections={visitedSections}
            onExecuteCommand={handleExecuteCommand}
            demoMode={demoMode}
            demoStep={demoStep}
            demoCommands={demoCommands}
            onUserActivity={handleUserActivity}
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
            <span className="hidden md:inline" style={{ color: "var(--theme-muted)" }}>Powered by:</span>
            <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1 md:gap-2">
              <a 
                href="https://nextjs.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-1 py-0.5 md:px-2 md:py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80 text-xs" 
                style={{ 
                  backgroundColor: "var(--theme-surface)", 
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-accent)"
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
                  color: "var(--theme-accent)"
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
                  color: "var(--theme-accent)"
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
                  color: "var(--theme-accent)"
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
                  color: "var(--theme-accent)"
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
                  color: "var(--theme-accent)"
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
              © 2024 Tijo Thomas | Interactive Portfolio Terminal
            </p>
            <div className="flex items-center gap-3">
              <PrivacyPolicy />
              <span className="text-xs" style={{ color: "var(--theme-muted)" }}>
                {consentGiven === true ? '🟢 Analytics On' : 
                 consentGiven === false ? '🔴 Analytics Off' : 
                 '⚪ Pending Consent'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
      
      {/* GDPR Cookie Consent */}
      <CookieConsent onConsentChange={handleConsentChange} />
    </main>
  );
}
