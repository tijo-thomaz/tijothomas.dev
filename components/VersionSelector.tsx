"use client";

import { useState } from "react";
import { ChevronDown, Info, Zap, Cpu } from "lucide-react";
import { AVAILABLE_VERSIONS, CURRENT_VERSION, type Version } from "@/lib/version";

interface VersionSelectorProps {
  className?: string;
}

const VersionSelector = ({ className = "" }: VersionSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentVersion = AVAILABLE_VERSIONS.find(v => v.version === CURRENT_VERSION)!;

  const getVersionIcon = (version: Version) => {
    if (version.version.startsWith('2.')) return <Cpu className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'development': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'beta': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-mono bg-gray-800/50 border border-gray-600/50 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
        style={{
          color: "var(--theme-text)",
          borderColor: "var(--theme-border)",
          backgroundColor: "var(--theme-surface)",
        }}
      >
        {getVersionIcon(currentVersion)}
        <span>v{currentVersion.version}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-lg border border-gray-600/50 rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-600/50">
              <h3 className="text-sm font-semibold text-gray-200 mb-1">Portfolio Versions</h3>
              <p className="text-xs text-gray-400">Choose between different portfolio experiences</p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {AVAILABLE_VERSIONS.map((version) => (
                <div
                  key={version.version}
                  className={`p-4 border-b border-gray-700/50 last:border-b-0 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                    version.version === CURRENT_VERSION ? 'bg-blue-500/10' : ''
                  }`}
                  onClick={() => {
                    if (version.status === 'stable') {
                      window.location.href = version.route === '/v1' ? '/' : version.route;
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
                        <span className="text-xs text-blue-400 font-medium">CURRENT</span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded border font-medium ${getStatusColor(version.status)}`}>
                      {version.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-200 mb-1">{version.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{version.description}</p>
                  
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
                  
                  {version.status === 'development' && (
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
