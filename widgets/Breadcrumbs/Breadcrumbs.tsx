"use client";

import { useState, useEffect } from 'react';
import { BreadcrumbNavigation } from './molecules/BreadcrumbNavigation';
import { ProgressBar } from './atoms/ProgressBar';

interface BreadcrumbsProps {
  visitedSections: string[];
  onNavigate: (section: string) => void;
  currentView: 'terminal' | 'interactive';
}

const sectionConfig = {
  experience: { icon: '🏢', label: 'Experience' },
  skills: { icon: '⚛️', label: 'Skills' },
  projects: { icon: '🚀', label: 'Projects' },
  clients: { icon: '🏆', label: 'Gallery' },
};

const allSections = ['experience', 'skills', 'projects', 'clients'];

export const Breadcrumbs = ({ visitedSections, onNavigate, currentView }: BreadcrumbsProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(visitedSections.length > 0 || currentView === 'interactive');
  }, [visitedSections.length, currentView]);

  if (!isVisible) return null;

  return (
    <div 
      className="flex-shrink-0 px-2 md:px-4 py-2 backdrop-blur-sm border-t"
      style={{
        backgroundColor: "var(--theme-surface)",
        borderColor: "var(--theme-border)"
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between text-xs md:text-sm font-mono">
          <div 
            className="flex items-center gap-1"
            style={{ color: "var(--theme-secondary)" }}
          >
            <span className="hidden sm:inline">Journey Progress:</span>
            <span className="sm:hidden">Progress:</span>
          </div>
          
          <BreadcrumbNavigation
            allSections={allSections}
            sectionConfig={sectionConfig}
            visitedSections={visitedSections}
            onNavigate={onNavigate}
          />

          <ProgressBar 
            completed={visitedSections.length} 
            total={allSections.length} 
          />
        </div>
      </div>
    </div>
  );
};
