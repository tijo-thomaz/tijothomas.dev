"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  onZoomChange: (zoom: number) => void;
}

const ZoomControls = ({ onZoomChange }: ZoomControlsProps) => {
  const [zoom, setZoom] = useState(100);
  const [isInitialized, setIsInitialized] = useState(false);

  const zoomLevels = [75, 85, 100, 115, 130, 150, 175, 200];
  
  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      const newZoom = zoomLevels[currentIndex + 1];
      setZoom(newZoom);
      onZoomChange(newZoom);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      const newZoom = zoomLevels[currentIndex - 1];
      setZoom(newZoom);
      onZoomChange(newZoom);
    }
  };

  const handleReset = () => {
    setZoom(100);
    onZoomChange(100);
  };

  // Load saved zoom level on mount
  useEffect(() => {
    const savedZoom = localStorage.getItem('tijothomas-zoom');
    if (savedZoom) {
      const zoomValue = parseInt(savedZoom);
      if (zoomLevels.includes(zoomValue)) {
        setZoom(zoomValue);
        onZoomChange(zoomValue);
      }
    }
    setIsInitialized(true);
  }, []); // Only run on mount

  // Save zoom level when it changes (but not on initial load)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('tijothomas-zoom', zoom.toString());
    }
  }, [zoom, isInitialized]);

  return (
    <div className="flex items-center gap-2 bg-gray-900 border border-green-400 rounded-lg p-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleZoomOut}
        disabled={zoom === zoomLevels[0]}
        className="bg-gray-800 border-green-400 text-green-300 hover:bg-gray-700 p-1 h-7 w-7"
        title="Zoom Out"
      >
        <ZoomOut className="w-3 h-3" />
      </Button>
      
      <span className="text-green-400 font-mono text-xs min-w-[3rem] text-center">
        {zoom}%
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleZoomIn}
        disabled={zoom === zoomLevels[zoomLevels.length - 1]}
        className="bg-gray-800 border-green-400 text-green-300 hover:bg-gray-700 p-1 h-7 w-7"
        title="Zoom In"
      >
        <ZoomIn className="w-3 h-3" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        disabled={zoom === 100}
        className="bg-gray-800 border-green-400 text-green-300 hover:bg-gray-700 p-1 h-7 w-7"
        title="Reset Zoom"
      >
        <RotateCcw className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default ZoomControls;
