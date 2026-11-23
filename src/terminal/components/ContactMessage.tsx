"use client";

import { useState } from "react";
import { Mail, MessageSquare, Linkedin, ExternalLink, Copy, Check } from "lucide-react";

export default function ContactMessage() {
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
          onClick={handleEmailClick}
          className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] group font-mono text-sm"
          style={{
            backgroundColor: "var(--theme-surface)",
            borderColor: "var(--theme-border)",
            color: "var(--theme-text)"
          }}
        >
          {copiedEmail ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Mail className="w-4 h-4 group-hover:text-blue-400" />
          )}
          <div className="flex-1 text-left">
            <div className="font-bold">
              {copiedEmail ? "Email Copied!" : "Email"}
            </div>
            <div className="text-xs opacity-75">
              {copiedEmail ? "Opening email client..." : contactInfo.email}
            </div>
          </div>
        </button>

        <button
          onClick={handleWhatsAppClick}
          className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] group font-mono text-sm"
          style={{
            backgroundColor: "var(--theme-surface)",
            borderColor: "var(--theme-border)",
            color: "var(--theme-text)"
          }}
        >
          <MessageSquare className="w-4 h-4 group-hover:text-green-500" />
          <div className="flex-1 text-left">
            <div className="font-bold flex items-center gap-1">
              WhatsApp <ExternalLink className="w-3 h-3 opacity-60" />
            </div>
            <div className="text-xs opacity-75">+44 7818 989060</div>
          </div>
        </button>

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
      </div>
    </div>
  );
}
