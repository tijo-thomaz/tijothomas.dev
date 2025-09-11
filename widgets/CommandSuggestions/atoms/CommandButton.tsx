"use client";

interface CommandButtonProps {
  command: string;
  icon: string;
  description: string;
  onClick: () => void;
}

export const CommandButton = ({ command, icon, description, onClick }: CommandButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30 hover:border-green-400/50 rounded-lg transition-all duration-200 group"
      title={description}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-green-400 font-mono text-sm group-hover:text-white">
        {command}
      </span>
    </button>
  );
};
