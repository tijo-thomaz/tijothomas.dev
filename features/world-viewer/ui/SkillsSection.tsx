"use client";

import { skillsData } from '../model/worldData';

export default function SkillsSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-4 md:px-8 py-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="text-center mb-8 md:mb-12 relative z-10">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-purple-400 mb-2 md:mb-4">
          Skills Constellation
        </h2>
        <p className="text-sm md:text-lg opacity-80 px-2">
          Technologies mastered over the years • Hover to explore • Infinite
          scroll
        </p>
      </div>

      {/* Main Carousel Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Top Row - Moving Left */}
        <div className="relative h-32 md:h-40 mb-8 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-transparent to-purple-900/40 z-10 pointer-events-none"></div>
          <div className="flex animate-scroll-left space-x-4 md:space-x-6 h-full group-hover:animation-play-state-paused">
            {/* Duplicate skills for infinite scroll */}
            {[...skillsData, ...skillsData, ...skillsData].map(
              (skill, index) => (
                <div
                  key={`top-${index}`}
                  className="flex-shrink-0 w-72 md:w-80 lg:w-96 bg-gradient-to-br from-purple-900/60 to-blue-900/60 backdrop-blur-sm border border-purple-400/40 rounded-2xl p-4 md:p-6 hover:border-purple-400 hover:scale-105 transition-all duration-300 group cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg md:text-xl font-bold text-purple-300">
                      {skill.category}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-purple-400">
                      {skill.level}%
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-1000 shadow-lg shadow-purple-500/30"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-purple-500/30 text-purple-200 rounded-full text-xs font-mono border border-purple-400/40 group-hover:bg-purple-500/50 group-hover:text-white transition-all duration-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Center Focus Section */}
        <div className="text-center mb-8 relative">
          <div className="inline-block bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm border border-purple-400/50 rounded-full px-8 py-4 shadow-xl shadow-purple-500/30">
            <div className="text-purple-400 text-lg md:text-xl font-bold mb-2">
              🚀 8+ Years Experience
            </div>
            <div className="text-purple-300 text-sm md:text-base">
              Full Stack • Enterprise • Performance
            </div>
          </div>
        </div>

        {/* Bottom Row - Moving Right */}
        <div className="relative h-32 md:h-40 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-transparent to-blue-900/40 z-10 pointer-events-none"></div>
          <div className="flex animate-scroll-right space-x-4 md:space-x-6 h-full group-hover:animation-play-state-paused">
            {/* Duplicate skills for infinite scroll */}
            {[...skillsData, ...skillsData, ...skillsData].map(
              (skill, index) => (
                <div
                  key={`bottom-${index}`}
                  className="flex-shrink-0 w-72 md:w-80 lg:w-96 bg-gradient-to-br from-blue-900/60 to-purple-900/60 backdrop-blur-sm border border-blue-400/40 rounded-2xl p-4 md:p-6 hover:border-blue-400 hover:scale-105 transition-all duration-300 group cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg md:text-xl font-bold text-blue-300">
                      {skill.category}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-blue-400">
                      {skill.level}%
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/30"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-xs font-mono border border-blue-400/40 group-hover:bg-blue-500/50 group-hover:text-white transition-all duration-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
