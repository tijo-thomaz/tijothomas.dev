"use client";

interface StatusIndicatorProps {
  isOnline: boolean;
  className?: string;
}

export function StatusIndicator({ isOnline, className = "" }: StatusIndicatorProps) {
  return (
    <div 
      className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-400'} ${className}`}
      aria-label={isOnline ? "Online" : "Offline"}
    />
  );
}
