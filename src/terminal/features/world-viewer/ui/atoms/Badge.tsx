"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "gradient";
  size?: "xs" | "sm" | "md";
  className?: string;
}

export default function Badge({ 
  children, 
  variant = "primary", 
  size = "sm", 
  className = "" 
}: BadgeProps) {
  const baseClasses = "rounded-full font-mono border transition-all duration-300";
  
  const variants = {
    primary: "bg-green-500/20 text-green-300 border-green-500/30",
    secondary: "bg-white/5 text-white/70 border-white/20",
    accent: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    gradient: "bg-gradient-to-r from-green-400 to-blue-500 text-white border-transparent",
  };

  const sizes = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-3 py-1 text-xs",
    md: "px-4 py-1.5 text-sm",
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
