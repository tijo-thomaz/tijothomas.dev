"use client";

import { useState, useEffect } from 'react';
import { Container } from './atoms/Container';
import { ZoomControlGroup } from './molecules/ZoomControlGroup';

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
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('tijothomas-zoom', zoom.toString());
    }
  }, [zoom, isInitialized]);

  return (
    <Container>
      <ZoomControlGroup
        zoom={zoom}
        zoomLevels={zoomLevels}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />
    </Container>
  );
};

export { ZoomControls };
