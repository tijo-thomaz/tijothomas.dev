"use client";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "green" | "blue" | "purple" | "gradient";
  showValue?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  size = "md",
  color = "green",
  showValue = false,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const colors = {
    green: "from-green-400 to-green-500 shadow-green-500/30",
    blue: "from-blue-400 to-blue-500 shadow-blue-500/30",
    purple: "from-purple-400 to-purple-500 shadow-purple-500/30",
    gradient: "from-green-400 to-blue-500 shadow-lg",
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`bg-gradient-to-r ${colors[color]} ${sizes[size]} rounded-full transition-all duration-1000 shadow-lg`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="absolute right-0 top-0 transform translate-y-full text-xs text-white/70 mt-1">
          {value}%
        </div>
      )}
    </div>
  );
}
