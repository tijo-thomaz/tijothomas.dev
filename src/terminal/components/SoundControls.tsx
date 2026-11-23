"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { soundManager } from '@/lib/sounds';

const SoundControls = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setSoundEnabled(soundManager.isEnabled());
  }, []);

  const toggleSound = async () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setEnabled(newState);
    
    // Play a test sound when enabling
    if (newState) {
      await soundManager.playNotification();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleSound}
      className="p-2 h-8 w-8 border transition-colors hover:opacity-80"
      style={{
        backgroundColor: "var(--theme-surface)",
        borderColor: "var(--theme-border)",
        color: "var(--theme-accent)"
      }}
      title={soundEnabled ? "Disable Sound" : "Enable Sound"}
    >
      {soundEnabled ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
    </Button>
  );
};

export default SoundControls;
