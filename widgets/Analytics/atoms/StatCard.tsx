"use client";

interface StatCardProps {
  label: string;
  value: string | number;
}

export const StatCard = ({ label, value }: StatCardProps) => {
  return (
    <div
      className="rounded-lg p-3 border"
      style={{
        backgroundColor: "var(--theme-card)",
        borderColor: "var(--theme-border)",
      }}
    >
      <div
        className="font-mono text-xs mb-1"
        style={{ color: "var(--theme-accent)" }}
      >
        {label}
      </div>
      <div
        className="text-lg font-bold font-mono"
        style={{ color: "var(--theme-text)" }}
      >
        {value}
      </div>
    </div>
  );
};
