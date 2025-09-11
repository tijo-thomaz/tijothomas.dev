"use client";

import { BackButton } from "../atoms/BackButton";
import { CloseButton } from "../atoms/CloseButton";

interface HeaderButtonsProps {
  onClose: () => void;
}

export function HeaderButtons({ onClose }: HeaderButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <BackButton onClick={onClose} />
      <CloseButton onClick={onClose} />
    </div>
  );
}
