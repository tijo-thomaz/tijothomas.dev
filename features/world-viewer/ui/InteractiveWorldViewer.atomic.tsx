"use client";

import { useState, useEffect } from "react";
import { useWorldNavigation } from '../model/useWorldNavigation';
import NavigationPanel from './organisms/NavigationPanel';
import ExperienceTimeline from './organisms/ExperienceTimeline';
import SkillsConstellation from './organisms/SkillsConstellation';
import ProjectShowcase from './organisms/ProjectShowcase';
import ClientGallery from './organisms/ClientGallery';
import BackgroundEffects from './organisms/BackgroundEffects';
import Button from './atoms/Button';

interface InteractiveWorldViewerProps {
  currentWorld: string;
  onWorldExit: () => void;
  onWorldChange: (world: string) => void;
  initialSection?: number;
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
      <BackgroundEffects />
      
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
        <ExperienceTimeline />
        <SkillsConstellation />
        <ProjectShowcase />
        <ClientGallery />
      </div>

      {/* Navigation Panel */}
      <NavigationPanel
        currentSection={currentSection}
        navExpanded={navExpanded}
        setNavExpanded={setNavExpanded}
        scrollToSection={scrollToSection}
      />

      {/* Footer - Fixed at bottom */}
      <div className="relative z-10 text-center py-3 px-4 flex-shrink-0 bg-black/50 backdrop-blur-sm border-t border-blue-400/30">
        <Button onClick={onWorldExit} variant="primary" size="md">
          ← Return to Terminal
        </Button>
      </div>
    </div>
  );
}
