"use client";

interface BreadcrumbItemProps {
  icon: string;
  label: string;
  isVisited: boolean;
  isAvailable: boolean;
  onClick: () => void;
}

export const BreadcrumbItem = ({ icon, label, isVisited, isAvailable, onClick }: BreadcrumbItemProps) => {
  return (
    <button
      onClick={isAvailable ? onClick : undefined}
      disabled={!isAvailable}
      className={`
        flex items-center gap-1 px-2 py-1 rounded-lg border transition-all duration-300
        ${!isAvailable ? 'opacity-50' : 'hover:scale-105 hover:opacity-80'}
      `}
      style={{
        color: isVisited 
          ? "var(--theme-accent)" 
          : isAvailable 
            ? "var(--theme-text)" 
            : "var(--theme-secondary)",
        backgroundColor: isVisited 
          ? "var(--theme-muted)" 
          : isAvailable 
            ? "var(--theme-bg)" 
            : "var(--theme-surface)",
        borderColor: "var(--theme-border)",
        cursor: !isAvailable ? 'not-allowed' : 'pointer'
      }}
      title={
        isVisited 
          ? `Revisit ${label}` 
          : isAvailable 
            ? `Explore ${label}` 
            : `Complete previous sections to unlock ${label}`
      }
    >
      <span className="text-sm">{icon}</span>
      <span className="hidden sm:inline text-xs">{label}</span>
      {isVisited && <span className="text-green-400 text-xs">✓</span>}
    </button>
  );
};
