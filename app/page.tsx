"use client";

import { useState, useEffect, useCallback } from "react";
import Terminal from "@/components/Terminal";
import ZoomControls from "@/components/ZoomControls";
import SoundControls from "@/components/SoundControls";
import ThemeControls from "@/components/ThemeControls";
import AnalyticsDisplay from "@/components/AnalyticsDisplay";
import EnhancedChatAgent from "@/components/EnhancedChatAgent";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
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

  return (
    <main
      className="h-screen flex flex-col overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: "var(--theme-bg)",
        color: "var(--theme-text)",
      }}
    >
      <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
        {/* Header - Responsive height */}
        <div className="flex-shrink-0 p-2 md:p-3 text-center relative">
          <h1 className="text-base md:text-lg lg:text-xl font-bold font-mono mb-1">
            tijothomas.dev
          </h1>
          <p
            className="font-mono text-xs mb-2 md:mb-3 hidden sm:block"
            style={{ color: "var(--theme-secondary)" }}
          >
            Interactive Portfolio Terminal + AI Assistant
          </p>

          {/* Controls */}
          <div className="flex justify-center items-center gap-2 md:gap-3 flex-wrap">
            <SoundControls />
            <ZoomControls onZoomChange={handleZoomChange} />
            <ThemeControls />
            <div className="hidden sm:block">
              <AnalyticsDisplay />
            </div>
          </div>
        </div>

        {/* Main Content - Responsive layout */}
        <div className="flex-1 flex flex-col gap-3 p-3 pt-0 min-h-0">
          {/* Terminal - Responsive height based on screen size */}
          <div className="h-3/5 md:h-1/2 min-h-0" style={{ fontSize: `${zoom}%` }}>
            <Terminal />
          </div>

          {/* Chat Agent - Responsive height based on screen size */}
          <div className="h-2/5 md:h-1/2 min-h-0" style={{ fontSize: `${zoom}%` }}>
            <EnhancedChatAgent />
          </div>
        </div>

        {/* Footer - Responsive height */}
        <div className="flex-shrink-0 p-1 md:p-2 text-center space-y-1">
          <div className="flex flex-wrap justify-center items-center gap-1 md:gap-2 text-xs font-mono">
            <span className="hidden sm:inline" style={{ color: "var(--theme-muted)" }}>Powered by:</span>
            <div className="flex flex-wrap justify-center gap-1 md:gap-2">
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
          <p
            className="font-mono text-xs"
            style={{ color: "var(--theme-muted)" }}
          >
            © 2024 Tijo Thomas | Interactive Portfolio Terminal
          </p>
        </div>
      </div>
    </main>
  );
}
