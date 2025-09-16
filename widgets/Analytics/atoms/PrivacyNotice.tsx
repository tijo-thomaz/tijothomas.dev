"use client";

import { Shield } from "lucide-react";

export const PrivacyNotice = () => {
  return (
    <div
      className="border rounded-lg p-3"
      style={{
        backgroundColor: "var(--theme-muted)",
        borderColor: "var(--theme-border)",
      }}
    >
      <div
        className="flex items-center gap-2 font-mono font-bold text-sm"
        style={{ color: "var(--theme-accent)" }}
      >
        <Shield className="w-3 h-3" />
        Truly Anonymous
      </div>
      <p
        className="text-xs font-mono mt-1"
        style={{ color: "var(--theme-secondary)" }}
      >
        No personal data, no tracking, just basic usage patterns.
      </p>
    </div>
  );
};
