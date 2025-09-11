"use client";

import { useState, useEffect } from 'react';
import { soundManager } from '../../lib/sounds';
import { SoundButton } from './atoms/SoundButton';
import { VolumeIcon } from './atoms/VolumeIcon';

const SoundControls = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    setSoundEnabled(soundManager.isEnabled());
  }, []);

  const toggleSound = async () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setEnabled(newState);
    
    if (newState) {
      await soundManager.playNotification();
    }
  };

  return (
    <SoundButton
      onClick={toggleSound}
      title={soundEnabled ? "Disable Sound" : "Enable Sound"}
    >
      <VolumeIcon soundEnabled={soundEnabled} />
    </SoundButton>
  );
};

export { SoundControls };
