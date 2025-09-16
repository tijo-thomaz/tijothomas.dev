"use client";

import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { IconButton } from '../atoms/IconButton';
import { ZoomDisplay } from '../atoms/ZoomDisplay';

interface ZoomControlGroupProps {
  zoom: number;
  zoomLevels: number[];
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const ZoomControlGroup = ({ 
  zoom, 
  zoomLevels, 
  onZoomIn, 
  onZoomOut, 
  onReset 
}: ZoomControlGroupProps) => {
  return (
    <>
      <IconButton
        icon={<ZoomOut className="w-3 h-3" />}
        onClick={onZoomOut}
        disabled={zoom === zoomLevels[0]}
        title="Zoom Out"
      />
      
      <ZoomDisplay zoom={zoom} />
      
      <IconButton
        icon={<ZoomIn className="w-3 h-3" />}
        onClick={onZoomIn}
        disabled={zoom === zoomLevels[zoomLevels.length - 1]}
        title="Zoom In"
      />
      
      <IconButton
        icon={<RotateCcw className="w-3 h-3" />}
        onClick={onReset}
        disabled={zoom === 100}
        title="Reset Zoom"
      />
    </>
  );
};
