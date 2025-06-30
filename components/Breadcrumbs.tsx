"use client";

import { useState, useEffect } from 'react';

interface BreadcrumbsProps {
  visitedSections: string[];
  onNavigate: (section: string) => void;
  currentView: 'terminal' | 'interactive';
}

const sectionConfig = {
  experience: { icon: '🏢', label: 'Experience', color: 'text-green-400' },
  skills: { icon: '⚛️', label: 'Skills', color: 'text-purple-400' },
  projects: { icon: '🚀', label: 'Projects', color: 'text-blue-400' },
  clients: { icon: '🏆', label: 'Gallery', color: 'text-yellow-400' },
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
    <div className="flex-shrink-0 px-2 md:px-4 py-2 bg-black/50 backdrop-blur-sm border-t border-green-400/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between text-xs md:text-sm font-mono">
          <div className="flex items-center gap-1 text-green-400/70">
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
                    ${isVisited 
                      ? `${config.color} bg-green-400/10 border-green-400/30 hover:bg-green-400/20 cursor-pointer` 
                      : isAvailable
                        ? 'text-gray-400 bg-gray-800/50 border-gray-600/30 hover:bg-gray-700/50 cursor-pointer hover:text-white'
                        : 'text-gray-600 bg-gray-900/50 border-gray-700/20 cursor-not-allowed'
                    }
                    ${!isAvailable ? 'opacity-50' : 'hover:scale-105'}
                  `}
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
