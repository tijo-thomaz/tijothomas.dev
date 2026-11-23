"use client";

interface ProgressIndicatorProps {
  current: number;
  total: number;
}

export const ProgressIndicator = ({ current, total }: ProgressIndicatorProps) => {
  const percentage = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="mb-2 sm:mb-3">
      <div
        className="flex justify-between text-xs font-mono mb-1"
        style={{ color: "var(--theme-secondary)" }}
      >
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div
        className="w-full rounded-full h-1.5 overflow-hidden"
        style={{ backgroundColor: "var(--theme-bg)" }}
      >
        <div
          className="h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: "var(--theme-accent)",
          }}
        />
      </div>
    </div>
  );
};
