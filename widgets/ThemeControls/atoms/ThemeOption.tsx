"use client";

interface ThemeOptionProps {
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

export const ThemeOption = ({ label, description, isSelected, onClick }: ThemeOptionProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 first:rounded-t-lg last:rounded-b-lg transition-colors hover:opacity-80"
      style={{
        backgroundColor: isSelected ? "var(--theme-muted)" : "transparent",
        color: isSelected ? "var(--theme-accent)" : "var(--theme-text)"
      }}
      role="menuitem"
      aria-current={isSelected ? 'true' : 'false'}
    >
      <div className="font-mono text-xs font-medium">{label}</div>
      <div 
        className="font-mono text-xs"
        style={{ color: "var(--theme-secondary)" }}
      >
        {description}
      </div>
    </button>
  );
};
