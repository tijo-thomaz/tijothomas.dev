"use client";

import { VersionOption } from '../molecules/VersionOption';
import { type Version } from "@/lib/version";

interface VersionDropdownProps {
  versions: Version[];
  currentVersion: string;
  onVersionSelect: (route: string, status: string) => void;
  getVersionIcon: (version: Version) => React.ReactElement;
}

export const VersionDropdown = ({ versions, currentVersion, onVersionSelect, getVersionIcon }: VersionDropdownProps) => {
  const handleVersionSelect = (version: Version) => {
    if (version.status === "stable") {
      const targetRoute = version.route === "/v1" ? "/" : version.route;
      onVersionSelect(targetRoute, version.status);
    }
  };

  return (
    <div
      className="fixed top-16 left-4 right-4 backdrop-blur-lg border rounded-lg shadow-2xl z-50 overflow-hidden
                 max-w-sm mx-auto
                 sm:absolute sm:top-full sm:mt-2 sm:left-auto sm:right-0 sm:w-80 sm:max-w-none sm:mx-0"
      style={{
        backgroundColor: "var(--theme-surface)",
        borderColor: "var(--theme-border)",
      }}
    >
      <div
        className="p-3 border-b"
        style={{ borderColor: "var(--theme-border)" }}
      >
        <h3
          className="text-sm font-semibold mb-1"
          style={{ color: "var(--theme-text)" }}
        >
          Portfolio Versions
        </h3>
        <p
          className="text-xs"
          style={{ color: "var(--theme-secondary)" }}
        >
          Choose between different portfolio experiences
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {versions.map((version) => (
          <VersionOption
            key={version.version}
            version={version}
            isCurrentVersion={version.version === currentVersion}
            onSelect={() => handleVersionSelect(version)}
            getVersionIcon={getVersionIcon}
          />
        ))}
      </div>
    </div>
  );
};
