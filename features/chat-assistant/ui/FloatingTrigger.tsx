"use client";

import { MessageCircle, ChevronRight } from "lucide-react";

interface FloatingTriggerProps {
  onClick: () => void;
}

export function FloatingTrigger({ onClick }: FloatingTriggerProps) {
  return (
    <>
      {/* Mobile: Top position */}
      <div
        className="fixed top-2 right-2 z-50 group cursor-pointer md:hidden"
        onClick={onClick}
      >
        <div className="w-14 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl border-2 border-white/20 backdrop-blur-sm flex items-center justify-center gap-1 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] relative overflow-hidden active:scale-95 z-10">
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs font-semibold">AI</span>

          {/* Shimmer effect */}
          <div className="absolute inset-0 -left-4 top-0 w-6 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer"></div>
        </div>

        {/* Subtle glow for mobile */}
        <div className="absolute inset-0 w-14 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse opacity-20 -z-10 pointer-events-none"></div>
      </div>

      {/* Desktop: Left position */}
      <div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 group cursor-pointer hidden md:block"
        onClick={onClick}
      >
        <div className="w-12 h-24 rounded-r-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl border-2 border-white/20 backdrop-blur-sm flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-bounce hover:animate-none relative overflow-hidden active:scale-95 z-10">
          <MessageCircle className="w-5 h-5" />
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />

          {/* Shimmer effect */}
          <div className="absolute inset-0 -left-4 top-0 w-6 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer"></div>
        </div>

        {/* Desktop glow animation */}
        <div className="absolute inset-0 w-12 h-24 rounded-r-xl bg-gradient-to-r from-blue-400 to-purple-500 animate-ping opacity-30 -z-10 pointer-events-none"></div>
        <div className="absolute inset-0 w-12 h-24 rounded-r-xl bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse opacity-20 -z-10 pointer-events-none"></div>

        {/* Tooltip */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-lg">
          💬 Chat with Tijo's AI
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-black/90"></div>
        </div>
      </div>
    </>
  );
}
