"use client";

import { type ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
}

export const Container = ({ children }: ContainerProps) => {
  return (
    <div 
      className="flex items-center gap-2 border rounded-lg p-2"
      style={{
        backgroundColor: "var(--theme-surface)",
        borderColor: "var(--theme-border)"
      }}
    >
      {children}
    </div>
  );
};
