"use client";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  color?: "green" | "blue" | "purple" | "yellow";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function SectionTitle({
  title,
  subtitle,
  color = "green",
  size = "lg",
  className = "",
}: SectionTitleProps) {
  const colors = {
    green: "text-green-400",
    blue: "text-blue-400", 
    purple: "text-purple-400",
    yellow: "text-yellow-400",
  };

  const sizes = {
    sm: "text-lg md:text-xl",
    md: "text-xl md:text-2xl",
    lg: "text-2xl md:text-4xl lg:text-5xl",
    xl: "text-3xl md:text-5xl lg:text-6xl",
  };

  return (
    <div className={`text-center ${className}`}>
      <h2 className={`font-bold ${colors[color]} ${sizes[size]} mb-2 md:mb-4`}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm md:text-lg opacity-80 px-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}
