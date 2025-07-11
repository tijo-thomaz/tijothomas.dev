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
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
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
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // For mobile (top drawer): swipe up to close, for desktop (left drawer): swipe left to close
    const isMobile = window.innerWidth < 768;
    const shouldClose = isMobile ? deltaY < -100 : deltaX < -100;
    
    if (shouldClose) {
      setIsOpen(false);
    }

    setStartX(0);
    setCurrentX(0);
    setStartY(0);
    setCurrentY(0);
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
      <>
        {/* Mobile: Top position */}
        <div
          className="fixed top-2 right-2 z-50 group cursor-pointer md:hidden"
          onClick={toggleOpen}
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
          onClick={toggleOpen}
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

  const calculateTransform = () => {
    if (isDragging && (currentX !== 0 || currentY !== 0)) {
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        const deltaY = currentY - startY;
        return Math.min(0, deltaY); // Only allow negative values (moving up)
      } else {
        const deltaX = currentX - startX;
        return Math.min(0, deltaX); // Only allow negative values (moving left)
      }
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
        className={`fixed z-50 bg-gray-900/98 backdrop-blur-lg shadow-2xl transition-all duration-300
          md:left-0 md:top-0 md:h-full md:w-[400px] md:border-r md:border-gray-600/50
          max-md:top-0 max-md:left-0 max-md:right-0 max-md:h-[60vh] max-md:rounded-b-2xl max-md:border-b max-md:border-gray-600/50
          ${isOpen 
            ? "md:translate-x-0 max-md:translate-y-0" 
            : "md:-translate-x-full max-md:-translate-y-full"
          }`}
        style={{
          transform: window.innerWidth < 768 
            ? `translateY(${calculateTransform()}px)`
            : `translateX(${calculateTransform()}px)`,
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
