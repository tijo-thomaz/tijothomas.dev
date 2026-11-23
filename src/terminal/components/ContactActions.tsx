"use client";

import { useState } from "react";
import { Mail, MessageSquare, Linkedin, ExternalLink, Copy, Check } from "lucide-react";

interface ContactActionsProps {
  className?: string;
}

export default function ContactActions({ className = "" }: ContactActionsProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  const contactInfo = {
    email: "tijo1293@gmail.com",
    linkedin: "https://linkedin.com/in/tijo-j-thomaz93",
    whatsapp: "https://wa.me/447818989060"
  };

  const handleEmailClick = async () => {
    try {
      await navigator.clipboard.writeText(contactInfo.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      
      // Also open email client
      window.open(`mailto:${contactInfo.email}?subject=Hello from your portfolio`, '_blank');
    } catch (error) {
      // Fallback if clipboard API fails
      window.open(`mailto:${contactInfo.email}?subject=Hello from your portfolio`, '_blank');
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hi Tijo! I found your portfolio and would like to connect.");
    window.open(`${contactInfo.whatsapp}?text=${message}`, '_blank');
  };

  const handleLinkedInClick = () => {
    window.open(contactInfo.linkedin, '_blank');
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={handleEmailClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:scale-105 group"
        style={{
          backgroundColor: "var(--theme-surface)",
          borderColor: "var(--theme-border)",
          color: "var(--theme-text)"
        }}
        title="Copy email and open email client"
      >
        {copiedEmail ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Mail className="w-4 h-4 group-hover:text-blue-400" />
        )}
        <span className="text-sm font-mono">
          {copiedEmail ? "Copied!" : "Email"}
        </span>
      </button>

      <button
        onClick={handleWhatsAppClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:scale-105 group"
        style={{
          backgroundColor: "var(--theme-surface)",
          borderColor: "var(--theme-border)",
          color: "var(--theme-text)"
        }}
        title="Send WhatsApp message"
      >
        <MessageSquare className="w-4 h-4 group-hover:text-green-500" />
        <span className="text-sm font-mono">WhatsApp</span>
        <ExternalLink className="w-3 h-3 opacity-60" />
      </button>

      <button
        onClick={handleLinkedInClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:scale-105 group"
        style={{
          backgroundColor: "var(--theme-surface)",
          borderColor: "var(--theme-border)",
          color: "var(--theme-text)"
        }}
        title="Connect on LinkedIn"
      >
        <Linkedin className="w-4 h-4 group-hover:text-blue-600" />
        <span className="text-sm font-mono">LinkedIn</span>
        <ExternalLink className="w-3 h-3 opacity-60" />
      </button>
    </div>
  );
}
