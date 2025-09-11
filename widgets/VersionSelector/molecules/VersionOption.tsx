"use client";

import { Info } from "lucide-react";
import { StatusBadge } from '../atoms/StatusBadge';
import { type Version } from "@/lib/version";

interface VersionOptionProps {
  version: Version;
  isCurrentVersion: boolean;
  onSelect: () => void;
  getVersionIcon: (version: Version) => React.ReactElement;
}

export const VersionOption = ({ version, isCurrentVersion, onSelect, getVersionIcon }: VersionOptionProps) => {
  return (
    <div
      className={`p-3 sm:p-4 border-b last:border-b-0 hover:opacity-80 transition-all cursor-pointer ${
        isCurrentVersion ? "opacity-90" : ""
      }`}
      style={{
        borderColor: "var(--theme-border)",
        backgroundColor: isCurrentVersion ? "var(--theme-muted)" : "transparent",
      }}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {getVersionIcon(version)}
          <span
            className="font-mono text-sm"
            style={{ color: "var(--theme-text)" }}
          >
            v{version.version}
          </span>
          {isCurrentVersion && (
            <span
              className="text-xs font-medium"
              style={{ color: "var(--theme-accent)" }}
            >
              CURRENT
            </span>
          )}
        </div>
        <StatusBadge status={version.status} />
      </div>

      <h4
        className="font-semibold mb-1 text-sm"
        style={{ color: "var(--theme-text)" }}
      >
        {version.name}
      </h4>
      <p
        className="text-xs mb-2"
        style={{ color: "var(--theme-secondary)" }}
      >
        {version.description}
      </p>

      <div className="flex flex-wrap gap-1">
        {version.features.map((feature) => (
          <span
            key={feature}
            className="text-xs px-2 py-1 rounded border"
            style={{
              backgroundColor: "var(--theme-muted)",
              color: "var(--theme-text)",
              borderColor: "var(--theme-border)",
            }}
          >
            {feature}
          </span>
        ))}
      </div>

      {version.status === "development" && (
        <div
          className="mt-2 flex items-center gap-1 text-xs"
          style={{ color: "var(--theme-secondary)" }}
        >
          <Info className="w-3 h-3" />
          <span>Coming soon - in development</span>
        </div>
      )}
    </div>
  );
};
