"use client";

import { BreadcrumbItem } from '../atoms/BreadcrumbItem';

interface SectionConfig {
  icon: string;
  label: string;
}

interface BreadcrumbNavigationProps {
  allSections: string[];
  sectionConfig: Record<string, SectionConfig>;
  visitedSections: string[];
  onNavigate: (section: string) => void;
}

export const BreadcrumbNavigation = ({ 
  allSections, 
  sectionConfig, 
  visitedSections, 
  onNavigate 
}: BreadcrumbNavigationProps) => {
  return (
    <div className="flex items-center gap-1 md:gap-2 flex-wrap">
      {allSections.map((section, index) => {
        const config = sectionConfig[section as keyof typeof sectionConfig];
        const isVisited = visitedSections.includes(section);
        const isAvailable = index === 0 || visitedSections.includes(allSections[index - 1]);
        
        return (
          <BreadcrumbItem
            key={section}
            icon={config.icon}
            label={config.label}
            isVisited={isVisited}
            isAvailable={isAvailable}
            onClick={() => onNavigate(section)}
          />
        );
      })}
    </div>
  );
};
