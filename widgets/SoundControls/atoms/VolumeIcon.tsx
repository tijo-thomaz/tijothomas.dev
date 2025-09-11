"use client";

import { Volume2, VolumeX } from 'lucide-react';

interface VolumeIconProps {
  soundEnabled: boolean;
}

export const VolumeIcon = ({ soundEnabled }: VolumeIconProps) => {
  return soundEnabled ? (
    <Volume2 className="w-4 h-4" />
  ) : (
    <VolumeX className="w-4 h-4" />
  );
};
