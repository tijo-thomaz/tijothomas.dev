"use client";

import { useState } from "react";
import { ChevronDown, Info, Zap, Cpu } from "lucide-react";
import {
  AVAILABLE_VERSIONS,
  CURRENT_VERSION,
  type Version,
} from "@/lib/version";

interface VersionSelectorProps {
  className?: string;
}

const VersionSelector = ({ className = "" }: VersionSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentVersion = AVAILABLE_VERSIONS.find(
    (v) => v.version === CURRENT_VERSION
  )!;

  const getVersionIcon = (version: Version) => {
    if (version.version.startsWith("2.")) return <Cpu className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "stable":
        return {
          color: "var(--theme-accent)",
          backgroundColor: "var(--theme-muted)",
          borderColor: "var(--theme-border)",
        };
      case "development":
        return {
          color: "var(--theme-secondary)",
          backgroundColor: "var(--theme-bg)",
          borderColor: "var(--theme-border)",
        };
      case "beta":
        return {
          color: "var(--theme-text)",
          backgroundColor: "var(--theme-surface)",
          borderColor: "var(--theme-border)",
        };
      default:
        return {
          color: "var(--theme-secondary)",
          backgroundColor: "var(--theme-bg)",
          borderColor: "var(--theme-border)",
        };
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-mono border rounded-lg transition-all duration-200 hover:opacity-80"
        style={{
          color: "var(--theme-accent)",
          borderColor: "var(--theme-border)",
          backgroundColor: "var(--theme-surface)",
        }}
      >
        {getVersionIcon(currentVersion)}
        <span>v{currentVersion.version}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="absolute top-full mt-2 backdrop-blur-lg border rounded-lg shadow-2xl z-50 overflow-hidden
                       w-screen max-w-sm left-1/2 transform -translate-x-1/2
                       sm:w-80 sm:right-0 sm:left-auto sm:transform-none sm:translate-x-0"
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
              {AVAILABLE_VERSIONS.map((version) => (
                <div
                  key={version.version}
                  className={`p-4 border-b border-gray-700/50 last:border-b-0 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                    version.version === CURRENT_VERSION ? "bg-blue-500/10" : ""
                  }`}
                  onClick={() => {
                    if (version.status === "stable") {
                      const targetRoute =
                        version.route === "/v1" ? "/" : version.route;
                      window.location.href = targetRoute;
                    }
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getVersionIcon(version)}
                      <span className="font-mono text-sm text-gray-200">
                        v{version.version}
                      </span>
                      {version.version === CURRENT_VERSION && (
                        <span
                          className="text-xs font-medium"
                          style={{ color: "var(--theme-accent)" }}
                        >
                          CURRENT
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded border font-medium"
                      style={getStatusStyle(version.status)}
                    >
                      {version.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-200 mb-1">
                    {version.name}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">
                    {version.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {version.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-2 py-1 bg-gray-700/50 text-gray-300 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {version.status === "development" && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
                      <Info className="w-3 h-3" />
                      <span>Coming soon - in development</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VersionSelector;
