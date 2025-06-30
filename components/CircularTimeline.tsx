"use client";

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface TimelineItem {
  id: string;
  year: string;
  title: string;
  company: string;
  description: string;
  tech: string[];
  achievements: string[];
  category: 'experience' | 'project' | 'education';
}

interface CircularTimelineProps {
  items: TimelineItem[];
  onWorldChange?: (world: string) => void;
  currentWorld?: string;
}

export default function CircularTimeline({ items, onWorldChange, currentWorld }: CircularTimelineProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const circleRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rotationRef = useRef<gsap.core.Tween | null>(null);

  const radius = 200; // Circle radius
  const selectedItem = items[selectedIndex];

  useEffect(() => {
    if (isRotating && circleRef.current) {
      // Continuous rotation animation
      rotationRef.current = gsap.to(circleRef.current, {
        rotation: 360,
        duration: 20,
        ease: "none",
        repeat: -1
      });
    } else if (rotationRef.current) {
      rotationRef.current.kill();
    }

    return () => {
      if (rotationRef.current) {
        rotationRef.current.kill();
      }
    };
  }, [isRotating]);

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
    setIsRotating(false);
    
    // Animate to focus on selected item
    if (circleRef.current && itemRefs.current[index]) {
      const angle = (index * 360) / items.length;
      gsap.to(circleRef.current, {
        rotation: -angle,
        duration: 1,
        ease: "power2.out"
      });
    }

    // Add selection animation to the item
    if (itemRefs.current[index]) {
      gsap.fromTo(itemRefs.current[index], 
        { scale: 1 },
        { scale: 1.2, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.inOut" }
      );
    }
  };

  const toggleRotation = () => {
    setIsRotating(!isRotating);
  };

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden">
      {/* Liquid Metal Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/40 to-purple-900/60 backdrop-blur-3xl">
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Controls */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-30">
        <div>
          <h2 className="text-2xl font-bold text-white/90 mb-1 backdrop-blur-sm">Career Journey</h2>
          <p className="text-white/60 text-sm">Interactive timeline experience</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={toggleRotation}
            className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white/80 hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            {isRotating ? '⏸️ Pause' : '▶️ Play'}
          </button>
        </div>
      </div>

      {/* Circular Timeline Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Rotating Circle */}
        <div 
          ref={circleRef}
          className="relative"
          style={{ width: radius * 2.5, height: radius * 2.5 }}
        >
          {items.map((item, index) => {
            const angle = (index * 360) / items.length;
            const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
            const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;

            return (
              <div
                key={item.id}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                onClick={() => handleItemClick(index)}
                className={`absolute cursor-pointer transition-all duration-500 ${
                  selectedIndex === index ? 'z-20' : 'z-10'
                }`}
                style={{
                  left: `50%`,
                  top: `50%`,
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${-angle}deg)`,
                }}
              >
                {/* Vinyl Record with Liquid Metal Effect */}
                <div className={`relative w-24 h-24 transition-all duration-500 ${
                  selectedIndex === index ? 'scale-125' : 'scale-100 hover:scale-110'
                }`}>
                  {/* Glow Effect */}
                  {selectedIndex === index && (
                    <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400/50 to-blue-400/50 blur-lg animate-pulse"></div>
                  )}
                  
                  {/* Vinyl Record */}
                  <div className={`relative w-24 h-24 rounded-full transition-all duration-500 ${
                    selectedIndex === index 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-2xl shadow-cyan-500/50' 
                      : 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700'
                  }`}>
                    
                    {/* Record Grooves */}
                    <div className="absolute inset-2 rounded-full border border-black/20"></div>
                    <div className="absolute inset-4 rounded-full border border-black/15"></div>
                    <div className="absolute inset-6 rounded-full border border-black/10"></div>
                    
                    {/* Center Label with Glass Morphism */}
                    <div className="absolute inset-8 rounded-full bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs font-bold text-white">{item.year}</div>
                        <div className="text-[8px] text-white/70 uppercase tracking-wider">{item.category}</div>
                      </div>
                    </div>

                    {/* Rotating Reflection */}
                    {selectedIndex === index && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-spin opacity-50"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Detail Panel with Liquid Metal Glass Morphism */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-80 h-96 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden">
            {/* Glass reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl"></div>
            
            {/* Content */}
            {selectedItem && (
              <div className="relative z-10 p-6 h-full flex flex-col">
                {/* Header */}
                <div className="mb-4">
                  <div className="text-cyan-300 text-sm font-mono mb-1 tracking-wider">{selectedItem.year}</div>
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">{selectedItem.title}</h3>
                  <p className="text-white/80 font-medium">{selectedItem.company}</p>
                </div>

                {/* Description */}
                <div className="mb-4 flex-1">
                  <p className="text-white/70 text-sm leading-relaxed">{selectedItem.description}</p>
                </div>

                {/* Technology Stack */}
                <div className="mb-4">
                  <h4 className="text-cyan-300 font-semibold mb-2 text-sm">Tech Stack</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.tech.slice(0, 4).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/10 backdrop-blur-sm text-white/90 rounded-lg text-xs border border-white/20 font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Achievement */}
                <div>
                  <h4 className="text-cyan-300 font-semibold mb-2 text-sm">Key Achievement</h4>
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-400/20 rounded-xl p-3">
                    <span className="text-white/80 text-xs leading-relaxed">
                      {selectedItem.achievements[0]}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* World Navigation */}
      {onWorldChange && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
          <div className="flex gap-2 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-2">
            {['experience', 'projects', 'skills', 'clients'].map((world) => (
              <button
                key={world}
                onClick={() => onWorldChange(world)}
                className={`px-4 py-2 rounded-xl font-mono text-xs transition-all duration-300 ${
                  currentWorld === world
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {world}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
