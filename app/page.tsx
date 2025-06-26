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
        {/* Header - Fixed height */}
        <div className="flex-shrink-0 p-3 text-center relative">
          <h1 className="text-lg md:text-xl font-bold font-mono mb-1">
            tijothomas.dev
          </h1>
          <p
            className="font-mono text-xs mb-3"
            style={{ color: "var(--theme-secondary)" }}
          >
            Interactive Portfolio Terminal + AI Assistant
          </p>

          {/* Controls */}
          <div className="flex justify-center items-center gap-3">
            <SoundControls />
            <ZoomControls onZoomChange={handleZoomChange} />
            <ThemeControls />
            <AnalyticsDisplay />
          </div>
        </div>

        {/* Main Content - Equal sized containers */}
        <div className="flex-1 flex flex-col gap-3 p-3 pt-0 min-h-0">
          {/* Terminal - Exactly 50% of available space */}
          <div className="h-1/2 min-h-0" style={{ fontSize: `${zoom}%` }}>
            <Terminal />
          </div>

          {/* Chat Agent - Exactly 50% of available space */}
          <div className="h-1/2 min-h-0" style={{ fontSize: `${zoom}%` }}>
            <EnhancedChatAgent />
          </div>
        </div>

        {/* Footer - Fixed height */}
        <div className="flex-shrink-0 p-2 text-center space-y-1">
          <div className="flex flex-wrap justify-center items-center gap-2 text-xs font-mono">
            <span style={{ color: "var(--theme-muted)" }}>Powered by:</span>
            <div className="flex flex-wrap justify-center gap-2">
              <a 
                href="https://nextjs.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2 py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80" 
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
                className="px-2 py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80" 
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
                className="px-2 py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80" 
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
                className="px-2 py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80" 
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
                className="px-2 py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80" 
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
                className="px-2 py-1 rounded border transition-all duration-200 hover:scale-105 hover:opacity-80" 
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
