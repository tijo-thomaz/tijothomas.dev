"use client";

import { useState, useRef, useCallback } from "react";

export function useFloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Touch/swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);
    setCurrentY(e.touches[0].clientY);
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
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
  }, [isDragging, currentX, startX, currentY, startY]);

  // Mouse handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = currentX - startX;

    // If dragged left more than 100px, close the drawer
    if (deltaX < -100) {
      setIsOpen(false);
    }

    setStartX(0);
    setCurrentX(0);
  }, [isDragging, currentX, startX]);

  const calculateTransform = useCallback(() => {
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
  }, [isDragging, currentX, currentY, startX, startY]);

  return {
    isOpen,
    isDragging,
    drawerRef,
    toggleOpen,
    handleClose,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    calculateTransform,
  };
}
