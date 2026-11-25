"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  style,
}: ButtonProps) {
  const baseClasses = "rounded-lg font-mono transition-all duration-300 hover:scale-102";
  
  const variants = {
    primary: "bg-green-500 hover:bg-green-400 text-black",
    secondary: "bg-white/5 hover:bg-white/15 border border-transparent hover:border-white/30 text-white",
    danger: "bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-300",
    ghost: "bg-transparent hover:bg-white/10 text-white",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
}
