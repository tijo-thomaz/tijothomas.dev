"use client";

interface BackdropProps {
  onClick: () => void;
}

export const Backdrop = ({ onClick }: BackdropProps) => {
  return (
    <div
      className="fixed inset-0 z-40"
      onClick={onClick}
    />
  );
};
