"use client";

import AnimatedParticle from "../atoms/AnimatedParticle";

export default function BackgroundEffects() {
  return (
    <>
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-green-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-20 h-20 bg-yellow-500 rounded-full animate-ping"></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <AnimatedParticle
            key={i}
            size="sm"
            color="blue"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}
