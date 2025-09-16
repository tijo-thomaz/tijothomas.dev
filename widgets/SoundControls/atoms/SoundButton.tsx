"use client";

import { Button } from '../../../components/ui/button';
import { type ReactNode } from 'react';

interface SoundButtonProps {
  onClick: () => void;
  title: string;
  children: ReactNode;
}

export const SoundButton = ({ onClick, title, children }: SoundButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="p-2 h-8 w-8 border transition-colors hover:opacity-80"
      style={{
        backgroundColor: "var(--theme-surface)",
        borderColor: "var(--theme-border)",
        color: "var(--theme-accent)"
      }}
      title={title}
    >
      {children}
    </Button>
  );
};
