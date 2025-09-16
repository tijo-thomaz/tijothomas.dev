"use client";

import { useState, useEffect } from "react";
import { useWorldNavigation } from '../model/useWorldNavigation';
import Navigation from './Navigation';
import ExperienceSection from './ExperienceSection';
import SkillsSection from './SkillsSection';
import ProjectsSection from './ProjectsSection';
import ClientsSection from './ClientsSection';

interface InteractiveWorldViewerProps {
  currentWorld: string;
  onWorldExit: () => void;
  onWorldChange: (world: string) => void;
  initialSection?: number; // For navigation sync
}

export default function InteractiveWorldViewer({
  currentWorld,
  onWorldExit,
  onWorldChange,
  initialSection = 0,
}: InteractiveWorldViewerProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  
  const {
    currentSection,
    navExpanded,
    setNavExpanded,
    scrollContainerRef,
    scrollToSection,
  } = useWorldNavigation(initialSection);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 2000);
    return () => clearTimeout(timer);
  }, [currentWorld]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white relative flex flex-col overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-green-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-20 h-20 bg-yellow-500 rounded-full animate-ping"></div>
      </div>
      
      {/* Main Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto md:scrollbar-hide"
        style={{
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          overscrollBehavior: "contain",
        }}
      >
        <ExperienceSection />
        <SkillsSection />
        <ProjectsSection />
        <ClientsSection />
      </div>

      {/* Glassmorphed Floating Navigation */}
      <Navigation
        currentSection={currentSection}
        navExpanded={navExpanded}
        setNavExpanded={setNavExpanded}
        scrollToSection={scrollToSection}
      />

      {/* Footer - Fixed at bottom */}
      <div className="relative z-10 text-center py-3 px-4 flex-shrink-0 bg-black/50 backdrop-blur-sm border-t border-blue-400/30">
        <button
          onClick={onWorldExit}
          className="bg-green-500 hover:bg-green-400 text-black px-6 py-2 rounded-lg font-mono transition-colors text-sm md:text-base"
        >
          ← Return to Terminal
        </button>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
