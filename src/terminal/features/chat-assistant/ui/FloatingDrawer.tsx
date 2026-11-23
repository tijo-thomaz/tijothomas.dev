"use client";

import EnhancedChatAgent from "./EnhancedChatAgent";
import { ChatHeader } from "./ChatHeader";

interface FloatingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDragging: boolean;
  drawerRef: React.RefObject<HTMLDivElement>;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  calculateTransform: () => number;
}

export function FloatingDrawer({
  isOpen,
  onClose,
  isDragging,
  drawerRef,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  calculateTransform,
}: FloatingDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
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
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {/* Header */}
        <ChatHeader onClose={onClose} isOnline={true} />

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
}
