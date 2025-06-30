"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, MessageCircle, ChevronRight, ChevronLeft } from "lucide-react";
import EnhancedChatAgent from "./EnhancedChatAgent";

const FloatingAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = currentX - startX;

    // If swiped left more than 100px, close the drawer
    if (deltaX < -100) {
      setIsOpen(false);
    }

    setStartX(0);
    setCurrentX(0);
  };

  // Mouse handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = currentX - startX;

    // If dragged left more than 100px, close the drawer
    if (deltaX < -100) {
      setIsOpen(false);
    }

    setStartX(0);
    setCurrentX(0);
  };

  if (!isOpen) {
    return (
      <div
        className="fixed left-0 top-1/2 -translate-y-1/2 z-50 group cursor-pointer"
        onClick={toggleOpen}
      >
        <div className="w-12 h-24 rounded-r-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl border-2 border-white/20 backdrop-blur-sm flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-bounce hover:animate-none relative overflow-hidden active:scale-95 z-10">
          <MessageCircle className="w-5 h-5 animate-pulse" />
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />

          {/* Shimmer effect */}
          <div className="absolute inset-0 -left-4 top-0 w-6 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer"></div>
        </div>

        {/* Breathing glow animation - behind the button */}
        <div className="absolute inset-0 w-12 h-24 rounded-r-xl bg-gradient-to-r from-blue-400 to-purple-500 animate-ping opacity-30 -z-10 pointer-events-none"></div>
        <div className="absolute inset-0 w-12 h-24 rounded-r-xl bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse opacity-20 -z-10 pointer-events-none"></div>

        {/* Tooltip */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-lg">
          💬 Chat with Tijo's AI
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-black/90"></div>
        </div>

        {/* Floating notification badge */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce opacity-80 pointer-events-none">
          <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping pointer-events-none"></div>
        </div>
      </div>
    );
  }

  const calculateTransform = () => {
    if (isDragging && currentX !== 0) {
      const deltaX = currentX - startX;
      return Math.min(0, deltaX); // Only allow negative values (moving left)
    }
    return 0;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed left-0 top-0 h-full w-[400px] bg-gray-900/98 backdrop-blur-lg border-r border-gray-600/50 shadow-2xl z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          transform: `translateX(${calculateTransform()}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/80 to-purple-600/80 border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-white font-medium">Tijo's AI Assistant</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="w-8 h-8 p-0 text-white/70 hover:text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div
          className="h-[calc(100%-64px)] overflow-hidden"
          style={
            {
              "--theme-bg": "#1f2937",
              "--theme-text": "#f9fafb",
              "--theme-card": "#374151",
              "--theme-border": "#6b7280",
              "--theme-accent": "#10b981",
              "--theme-secondary": "#9ca3af",
              "--theme-muted": "#4b5563",
              "--theme-surface": "#374151",
            } as React.CSSProperties
          }
        >
          <EnhancedChatAgent />
        </div>
      </div>
    </>
  );
};

export default FloatingAIAssistant;
