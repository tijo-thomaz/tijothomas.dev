"use client";

import { StatCard } from '../atoms/StatCard';

interface StatGridProps {
  stats: Record<string, string | number>;
  columns?: 2 | 3;
}

export const StatGrid = ({ stats, columns = 2 }: StatGridProps) => {
  return (
    <div className={`grid grid-cols-${columns} gap-3`}>
      {Object.entries(stats).map(([label, value]) => (
        <StatCard key={label} label={label} value={value} />
      ))}
    </div>
  );
};
