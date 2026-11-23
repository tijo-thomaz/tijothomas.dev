"use client";

import { useState } from "react";
import { Zap, Cpu } from "lucide-react";
import {
  AVAILABLE_VERSIONS,
  CURRENT_VERSION,
  type Version,
} from "@/lib/version";
import { VersionButton } from './atoms/VersionButton';
import { VersionDropdown } from './organisms/VersionDropdown';

interface VersionSelectorProps {
  className?: string;
}

export const VersionSelector = ({ className = "" }: VersionSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentVersion = AVAILABLE_VERSIONS.find(
    (v) => v.version === CURRENT_VERSION
  )!;

  const getVersionIcon = (version: Version) => {
    if (version.version.startsWith("2.")) return <Cpu className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const handleVersionSelect = (route: string, status: string) => {
    window.location.href = route;
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <VersionButton
        icon={getVersionIcon(currentVersion)}
        version={currentVersion.version}
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
      />

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <VersionDropdown
            versions={AVAILABLE_VERSIONS}
            currentVersion={CURRENT_VERSION}
            onVersionSelect={handleVersionSelect}
            getVersionIcon={getVersionIcon}
          />
        </>
      )}
    </div>
  );
};
