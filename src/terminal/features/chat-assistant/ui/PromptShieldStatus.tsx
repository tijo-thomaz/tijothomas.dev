"use client";

import { ShieldBadge } from "../../prompt-shield/ui/ShieldBadge";
import { usePromptShield } from "../../prompt-shield/model/usePromptShield";

interface PromptShieldStatusProps {
  promptShield: ReturnType<typeof usePromptShield>;
}

export function PromptShieldStatus({ promptShield }: PromptShieldStatusProps) {
  if (!promptShield.lastResponse) return null;

  const getStatus = () => {
    if (promptShield.error) return 'error';
    if (promptShield.lastResponse?.flagged) return 'warning';
    if (promptShield.isLoading) return 'inactive';
    return 'active';
  };

  return (
    <div className="px-3 pb-2">
      <ShieldBadge
        version={promptShield.version}
        status={getStatus()}
        showVersion={true}
        size="sm"
      />
    </div>
  );
}
