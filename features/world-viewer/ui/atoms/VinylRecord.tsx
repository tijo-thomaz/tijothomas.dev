"use client";

interface VinylRecordProps {
  year: string;
  company?: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "green" | "blue" | "purple" | "gradient";
  isActive?: boolean;
  isAnimating?: boolean;
  className?: string;
}

export default function VinylRecord({
  year,
  company,
  size = "md",
  color = "green",
  isActive = false,
  isAnimating = false,
  className = "",
}: VinylRecordProps) {
  const sizes = {
    sm: "w-32 h-32",
    md: "w-48 h-48",
    lg: "w-64 h-64",
    xl: "w-80 h-80",
  };

  const centerSizes = {
    sm: "inset-8",
    md: "inset-12",
    lg: "inset-16",
    xl: "inset-20",
  };

  const colors = {
    green: "from-green-500 to-emerald-500 border-green-400",
    blue: "from-blue-500 to-cyan-500 border-blue-400", 
    purple: "from-purple-500 to-pink-500 border-purple-400",
    gradient: "from-green-400 to-blue-500 border-green-400",
  };

  const borderColor = isActive ? colors[color].split(' ')[2] : "border-gray-600";

  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      {/* Main Record */}
      <div
        className={`w-full h-full rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black border-4 ${borderColor} shadow-2xl relative overflow-hidden group transition-all duration-500 ${
          isActive ? "shadow-lg" : ""
        }`}
      >
        {/* Record Grooves */}
        <div className="absolute inset-4 rounded-full border-2 border-gray-600/40"></div>
        <div className="absolute inset-8 rounded-full border border-gray-600/30"></div>
        <div className="absolute inset-12 rounded-full border border-gray-600/20"></div>
        <div className="absolute inset-16 rounded-full border border-gray-600/10"></div>

        {/* Center Label */}
        <div
          className={`absolute ${centerSizes[size]} rounded-full bg-gradient-to-br ${colors[color].split(' ').slice(0, 2).join(' ')} flex flex-col items-center justify-center text-white shadow-lg`}
        >
          <div className={`font-bold ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl'}`}>
            {year}
          </div>
          {company && size !== 'sm' && (
            <div className="text-green-400 text-xs font-mono">
              {company.split(" ")[0]}
            </div>
          )}
        </div>

        {/* Spinning Animation */}
        {isAnimating && (
          <div
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "10s" }}
          >
            <div className="w-1 h-1 bg-white/60 rounded-full absolute top-8 left-1/2 transform -translate-x-1/2"></div>
            <div className="w-0.5 h-0.5 bg-white/40 rounded-full absolute top-12 right-8"></div>
            <div className="w-0.5 h-0.5 bg-white/40 rounded-full absolute bottom-12 left-8"></div>
          </div>
        )}
      </div>

      {/* Rotation Animation for Active State */}
      {isActive && (
        <div className="absolute inset-0 rounded-full animate-spin border-t-2 border-green-400 opacity-50"></div>
      )}
    </div>
  );
}
