"use client";

import { useState } from "react";
import { PrivacyModal } from './molecules/PrivacyModal';

export const PrivacyPolicy = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-400 hover:text-green-400 font-mono underline transition-colors"
      >
        Privacy Notice
      </button>
    );
  }

  return <PrivacyModal onClose={() => setIsOpen(false)} />;
};
