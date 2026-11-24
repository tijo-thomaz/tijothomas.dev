"use client";

import { Github, Linkedin, ExternalLink } from "lucide-react";

interface ContactActionsProps {
  className?: string;
}

// U-04 (SQ-05 a): email and WhatsApp buttons removed; contact goes through LinkedIn and GitHub only.
const contactInfo = {
  linkedin: "https://linkedin.com/in/tijo-j-thomaz93",
  github: "https://github.com/tijo-thomas",
};

const buttonStyle = {
  backgroundColor: "var(--theme-surface)",
  borderColor: "var(--theme-border)",
  color: "var(--theme-text)",
};

export default function ContactActions({ className = "" }: ContactActionsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={() => window.open(contactInfo.linkedin, '_blank')}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:scale-105 group"
        style={buttonStyle}
        title="Connect on LinkedIn"
      >
        <Linkedin className="w-4 h-4 group-hover:text-blue-600" />
        <span className="text-sm font-mono">LinkedIn</span>
        <ExternalLink className="w-3 h-3 opacity-60" />
      </button>

      <button
        onClick={() => window.open(contactInfo.github, '_blank')}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:scale-105 group"
        style={buttonStyle}
        title="View GitHub profile"
      >
        <Github className="w-4 h-4 group-hover:text-blue-400" />
        <span className="text-sm font-mono">GitHub</span>
        <ExternalLink className="w-3 h-3 opacity-60" />
      </button>
    </div>
  );
}
