"use client";

interface ZoomDisplayProps {
  zoom: number;
}

export const ZoomDisplay = ({ zoom }: ZoomDisplayProps) => {
  return (
    <span 
      className="font-mono text-xs min-w-[3rem] text-center"
      style={{ color: "var(--theme-accent)" }}
    >
      {zoom}%
    </span>
  );
};
