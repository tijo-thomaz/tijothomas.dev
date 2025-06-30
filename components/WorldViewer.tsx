"use client";

import { useState, useEffect } from 'react';
import InteractiveWorldViewer from './InteractiveWorldViewer';

interface WorldViewerProps {
  world: string;
  onExit: () => void;
  initialSection?: number;
}

export default function WorldViewer({ world, onExit, initialSection }: WorldViewerProps) {
  const [currentWorld, setCurrentWorld] = useState(world);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for 3D assets
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCurrentWorld(world);
  }, [world]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onExit]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black">
        <div className="text-green-400 font-mono text-lg mb-4 animate-pulse">
          Initializing {currentWorld.toUpperCase()} World...
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <div className="text-green-400 font-mono text-sm mt-4 opacity-70">
          Press ESC to return to terminal
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <InteractiveWorldViewer
        currentWorld={currentWorld}
        onWorldExit={onExit}
        onWorldChange={setCurrentWorld}
        initialSection={initialSection}
      />
    </div>
  );
}
