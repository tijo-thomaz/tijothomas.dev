"use client";

import { useState, useRef, useEffect } from 'react';

interface TimelineItem {
  id: string;
  year: string;
  title: string;
  company: string;
  description: string;
  image?: string;
  tech: string[];
  achievements: string[];
  category: 'experience' | 'project' | 'education';
}

interface TimelineCarouselProps {
  items: TimelineItem[];
  onItemSelect?: (item: TimelineItem) => void;
  onWorldChange?: (world: string) => void;
  currentWorld?: string;
}

export default function TimelineCarousel({ items, onItemSelect, onWorldChange, currentWorld }: TimelineCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filter, setFilter] = useState<'all' | 'experience' | 'project' | 'education'>('all');
  const carouselRef = useRef<HTMLDivElement>(null);

  const filteredItems = filter === 'all' ? items : items.filter(item => item.category === filter);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, filteredItems.length]);

  const handleItemClick = (index: number) => {
    setSelectedIndex(index);
    onItemSelect?.(filteredItems[index]);
  };

  const selectedItem = filteredItems[selectedIndex];

  return (
    <div className="w-full h-full text-white p-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-green-400 mb-2">Career Timeline</h2>
          <p className="text-gray-400">Journey through professional milestones</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Filter Controls */}
          <div className="flex gap-2">
            {['all', 'experience', 'project', 'education'].map(filterType => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                  filter === filterType 
                    ? 'bg-green-500 text-black' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>

          {/* Auto-play Control */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-full transition-all ${
              isPlaying ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-120px)]">
        {/* Timeline Carousel */}
        <div className="lg:col-span-2 relative">
          <div 
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800 pb-4"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(index)}
                className={`flex-shrink-0 w-64 cursor-pointer transition-all duration-500 ${
                  selectedIndex === index 
                    ? 'scale-105 opacity-100' 
                    : 'scale-95 opacity-60 hover:opacity-80'
                }`}
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Vinyl Record Style */}
                <div className="relative mb-4">
                  <div className={`w-48 h-48 mx-auto rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border-4 transition-all duration-1000 ${
                    selectedIndex === index ? 'border-green-400 shadow-lg shadow-green-400/50' : 'border-gray-600'
                  }`}>
                    {/* Record Grooves */}
                    <div className="absolute inset-4 rounded-full border border-gray-600 opacity-30"></div>
                    <div className="absolute inset-8 rounded-full border border-gray-600 opacity-20"></div>
                    <div className="absolute inset-12 rounded-full border border-gray-600 opacity-10"></div>
                    
                    {/* Center Label */}
                    <div className="absolute inset-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold">{item.year}</div>
                        <div className="text-xs opacity-80">{item.category.toUpperCase()}</div>
                      </div>
                    </div>

                    {/* Spinning Animation */}
                    {selectedIndex === index && (
                      <div className="absolute inset-0 rounded-full animate-spin border-t-2 border-green-400 opacity-50"></div>
                    )}
                  </div>
                </div>

                {/* Item Info */}
                <div className="text-center">
                  <h3 className="font-bold text-green-300 mb-1 truncate">{item.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{item.company}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-1">
                    {item.tech.slice(0, 3).map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Item Details */}
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-green-400/30">
          {selectedItem && (
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-green-500">
              <div className="mb-4">
                <div className="text-green-400 text-sm font-mono mb-1">{selectedItem.year}</div>
                <h3 className="text-xl font-bold text-green-300 mb-2">{selectedItem.title}</h3>
                <p className="text-lg text-gray-300 mb-4">{selectedItem.company}</p>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 leading-relaxed">{selectedItem.description}</p>
              </div>

              {/* Technology Stack */}
              <div className="mb-6">
                <h4 className="text-green-300 font-semibold mb-3">Technology Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.tech.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-500/30 text-green-200 rounded-full text-sm border border-green-400/50"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Achievements */}
              <div>
                <h4 className="text-green-300 font-semibold mb-3">Key Achievements</h4>
                <div className="space-y-2">
                  {selectedItem.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-gray-300 text-sm">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* World Navigation */}
      {onWorldChange && (
        <div className="mt-6 flex justify-center space-x-2 md:space-x-4 flex-wrap gap-2">
          {['experience', 'projects', 'skills', 'clients'].map((world) => (
            <button
              key={world}
              onClick={() => onWorldChange(world)}
              className={`px-3 py-2 md:px-4 md:py-2 rounded-lg font-mono text-xs md:text-sm transition-all ${
                currentWorld === world
                  ? 'bg-green-500 text-black'
                  : 'bg-black/30 text-green-400 hover:bg-black/50 hover:text-white'
              }`}
            >
              {world}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
