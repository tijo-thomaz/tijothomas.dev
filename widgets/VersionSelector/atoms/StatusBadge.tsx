"use client";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "stable":
        return {
          color: "var(--theme-accent)",
          backgroundColor: "var(--theme-muted)",
          borderColor: "var(--theme-border)",
        };
      case "development":
        return {
          color: "var(--theme-secondary)",
          backgroundColor: "var(--theme-bg)",
          borderColor: "var(--theme-border)",
        };
      case "beta":
        return {
          color: "var(--theme-text)",
          backgroundColor: "var(--theme-surface)",
          borderColor: "var(--theme-border)",
        };
      default:
        return {
          color: "var(--theme-secondary)",
          backgroundColor: "var(--theme-bg)",
          borderColor: "var(--theme-border)",
        };
    }
  };

  return (
    <span
      className="text-xs px-2 py-1 rounded border font-medium"
      style={getStatusStyle(status)}
    >
      {status.toUpperCase()}
    </span>
  );
};
