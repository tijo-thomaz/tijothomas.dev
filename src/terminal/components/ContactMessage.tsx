"use client";

import { Github, Linkedin, ExternalLink } from "lucide-react";

// U-04 (SQ-05 a): email and WhatsApp options removed; contact goes through LinkedIn and GitHub only.
const contactInfo = {
  linkedin: "https://linkedin.com/in/tijo-j-thomaz93",
  github: "https://github.com/tijo-thomaz",
};

export default function ContactMessage() {
  const handleLinkedInClick = () => {
    window.open(contactInfo.linkedin, '_blank', 'noopener,noreferrer');
  };

  const handleGitHubClick = () => {
    window.open(contactInfo.github, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <p className="mb-2 font-mono text-sm">
          Tijo is based in <strong>Manchester, UK</strong> and available for senior frontend roles and consulting opportunities!
        </p>
        <p className="text-xs opacity-75 font-mono">
          Click any option below to get in touch:
        </p>
      </div>
      
      <div className="flex flex-col gap-2">
        <button
          onClick={handleLinkedInClick}
          className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] group font-mono text-sm"
          style={{
            backgroundColor: "var(--theme-surface)",
            borderColor: "var(--theme-border)",
            color: "var(--theme-text)"
          }}
        >
          <Linkedin className="w-4 h-4 group-hover:text-blue-600" />
          <div className="flex-1 text-left">
            <div className="font-bold flex items-center gap-1">
              LinkedIn <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
            <div className="text-xs opacity-75">Professional Profile</div>
          </div>
        </button>

        <button
          onClick={handleGitHubClick}
          className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] group font-mono text-sm"
          style={{
            backgroundColor: "var(--theme-surface)",
            borderColor: "var(--theme-border)",
            color: "var(--theme-text)"
          }}
        >
          <Github className="w-4 h-4 group-hover:text-blue-400" />
          <div className="flex-1 text-left">
            <div className="font-bold flex items-center gap-1">
              GitHub <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
            <div className="text-xs opacity-75">Code and projects</div>
          </div>
        </button>
      </div>
    </div>
  );
}
