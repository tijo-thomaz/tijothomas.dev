"use client";

import { Button } from "../../../../components/ui/button";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
}

export function BackButton({ onClick, className = "" }: BackButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/20 ${className}`}
    >
      <ChevronLeft className="w-4 h-4" />
    </Button>
  );
}
