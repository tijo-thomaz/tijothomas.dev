"use client";

interface AnimatedParticleProps {
  size?: "xs" | "sm" | "md";
  color?: "blue" | "green" | "purple" | "yellow";
  style?: React.CSSProperties;
  className?: string;
}

export default function AnimatedParticle({
  size = "sm",
  color = "blue",
  style,
  className = "",
}: AnimatedParticleProps) {
  const sizes = {
    xs: "w-0.5 h-0.5",
    sm: "w-1 h-1",
    md: "w-2 h-2",
  };

  const colors = {
    blue: "bg-blue-400",
    green: "bg-green-400",
    purple: "bg-purple-400", 
    yellow: "bg-yellow-400",
  };

  return (
    <div
      className={`absolute ${sizes[size]} ${colors[color]} rounded-full animate-pulse pointer-events-none ${className}`}
      style={style}
    />
  );
}
