"use client";

import { useFloatingAssistant } from "./model/useFloatingAssistant";
import { FloatingTrigger } from "./ui/FloatingTrigger";
import { FloatingDrawer } from "./ui/FloatingDrawer";

const FloatingAIAssistant = () => {
  const {
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
  } = useFloatingAssistant();

  if (!isOpen) {
    return <FloatingTrigger onClick={toggleOpen} />;
  }

  return (
    <FloatingDrawer
      isOpen={isOpen}
      onClose={handleClose}
      isDragging={isDragging}
      drawerRef={drawerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      calculateTransform={calculateTransform}
    />
  );
};

export default FloatingAIAssistant;
