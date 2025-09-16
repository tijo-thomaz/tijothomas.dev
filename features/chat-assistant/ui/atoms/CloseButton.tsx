"use client";

import { Button } from "../../../../components/ui/button";
import { X } from "lucide-react";

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

export function CloseButton({ onClick, className = "" }: CloseButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/20 ${className}`}
    >
      <X className="w-4 h-4" />
    </Button>
  );
}
