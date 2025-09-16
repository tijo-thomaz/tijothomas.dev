"use client";

import { User } from "lucide-react";

interface UserIconProps {
  className?: string;
  color?: string;
}

export function UserIcon({ className = "w-3 h-3", color = "var(--theme-accent)" }: UserIconProps) {
  return (
    <User 
      className={className} 
      style={{ color }} 
      aria-hidden="true" 
    />
  );
}
