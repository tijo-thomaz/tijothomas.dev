"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "highlight" | "transparent" | "glass";
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function Card({
  children,
  variant = "default",
  className = "",
  onClick,
  hover = true,
  style,
}: CardProps) {
  const baseClasses = "rounded-xl transition-all duration-300";
  
  const variants = {
    default: "bg-black/40 backdrop-blur-sm border border-white/10",
    highlight: "bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20",
    transparent: "bg-transparent",
    glass: "bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl",
  };

  const hoverClasses = hover 
    ? "hover:border-green-400 hover:bg-black/60 hover:scale-105 cursor-pointer" 
    : "";

  return (
    <div
      onClick={onClick}
      style={style}
      className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
}
