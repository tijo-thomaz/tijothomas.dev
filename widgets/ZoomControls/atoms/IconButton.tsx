"use client";

import { Button } from '../../../components/ui/button';
import { type ReactElement } from 'react';

interface IconButtonProps {
  icon: ReactElement;
  onClick: () => void;
  disabled?: boolean;
  title: string;
}

export const IconButton = ({ icon, onClick, disabled = false, title }: IconButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="p-1 h-7 w-7 border transition-colors hover:opacity-80 disabled:opacity-50"
      style={{
        backgroundColor: "var(--theme-bg)",
        borderColor: "var(--theme-border)",
        color: "var(--theme-accent)"
      }}
      title={title}
    >
      {icon}
    </Button>
  );
};
