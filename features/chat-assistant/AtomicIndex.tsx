"use client";

import { useFloatingAssistant } from "./model/useFloatingAssistant";
import { FloatingTrigger } from "./ui/FloatingTrigger";
import { AtomicFloatingDrawer } from "./ui/AtomicFloatingDrawer";

const AtomicFloatingAIAssistant = () => {
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
    <AtomicFloatingDrawer
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

export default AtomicFloatingAIAssistant;
