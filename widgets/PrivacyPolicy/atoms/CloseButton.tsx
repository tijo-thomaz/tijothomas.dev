"use client";

interface CloseButtonProps {
  onClick: () => void;
}

export const CloseButton = ({ onClick }: CloseButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="text-gray-400 hover:text-red-400 font-mono text-xl"
    >
      ✕
    </button>
  );
};
