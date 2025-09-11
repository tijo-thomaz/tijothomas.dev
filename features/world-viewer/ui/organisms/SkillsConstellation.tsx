"use client";

import SectionTitle from "../atoms/SectionTitle";
import SkillCarousel from "../molecules/SkillCarousel";
import Badge from "../atoms/Badge";
import { skillsData } from "../../model/worldData";

export default function SkillsConstellation() {
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

      <div className="relative z-10 mb-8 md:mb-12">
        <SectionTitle
          title="Skills Constellation"
          subtitle="Technologies mastered over the years • Hover to explore • Infinite scroll"
          color="purple"
        />
      </div>

      {/* Main Carousel Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        {/* Top Row - Moving Left */}
        <SkillCarousel
          skills={skillsData}
          direction="left"
          variant="primary"
        />

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
        <SkillCarousel
          skills={skillsData}
          direction="right"
          variant="secondary"
        />
      </div>
    </section>
  );
}
