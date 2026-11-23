"use client";

interface ProgressBarProps {
  completed: number;
  total: number;
}

export const ProgressBar = ({ completed, total }: ProgressBarProps) => {
  const percentage = (completed / total) * 100;

  return (
    <div className="flex items-center gap-2 text-green-400/70">
      <span className="hidden md:inline">
        {completed}/{total}
      </span>
      <div className="w-12 md:w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-blue-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
