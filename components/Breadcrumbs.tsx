"use client";

import { useState, useEffect } from 'react';

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

export default function Breadcrumbs({ visitedSections, onNavigate, currentView }: BreadcrumbsProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show breadcrumbs after first section visit or if user is in interactive mode
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
          
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            {allSections.map((section, index) => {
              const config = sectionConfig[section as keyof typeof sectionConfig];
              const isVisited = visitedSections.includes(section);
              const isAvailable = index === 0 || visitedSections.includes(allSections[index - 1]);
              
              return (
                <button
                  key={section}
                  onClick={() => isAvailable ? onNavigate(section) : null}
                  disabled={!isAvailable}
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded-lg border transition-all duration-300
                    ${!isAvailable ? 'opacity-50' : 'hover:scale-105 hover:opacity-80'}
                  `}
                  style={{
                    color: isVisited 
                      ? "var(--theme-accent)" 
                      : isAvailable 
                        ? "var(--theme-text)" 
                        : "var(--theme-secondary)",
                    backgroundColor: isVisited 
                      ? "var(--theme-muted)" 
                      : isAvailable 
                        ? "var(--theme-bg)" 
                        : "var(--theme-surface)",
                    borderColor: "var(--theme-border)",
                    cursor: !isAvailable ? 'not-allowed' : 'pointer'
                  }}
                  title={
                    isVisited 
                      ? `Revisit ${config.label}` 
                      : isAvailable 
                        ? `Explore ${config.label}` 
                        : `Complete previous sections to unlock ${config.label}`
                  }
                >
                  <span className="text-sm">{config.icon}</span>
                  <span className="hidden sm:inline text-xs">{config.label}</span>
                  {isVisited && <span className="text-green-400 text-xs">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-green-400/70">
            <span className="hidden md:inline">
              {visitedSections.length}/{allSections.length}
            </span>
            <div className="w-12 md:w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-500"
                style={{ width: `${(visitedSections.length / allSections.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
