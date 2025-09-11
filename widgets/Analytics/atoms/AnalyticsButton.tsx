"use client";

import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

interface AnalyticsButtonProps {
  onClick: () => void;
}

export const AnalyticsButton = ({ onClick }: AnalyticsButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="p-2 h-8 w-8 border transition-colors hover:opacity-80"
      style={{
        backgroundColor: "var(--theme-surface)",
        borderColor: "var(--theme-border)",
        color: "var(--theme-accent)",
      }}
      title="View Anonymous Analytics"
    >
      <BarChart3 className="w-4 h-4" />
    </Button>
  );
};
