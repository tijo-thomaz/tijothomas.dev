"use client";

import SkillCard from "./SkillCard";

interface SkillCarouselProps {
  skills: Array<{
    category: string;
    items: string[];
    level: number;
  }>;
  direction?: "left" | "right";
  variant?: "primary" | "secondary";
}

export default function SkillCarousel({
  skills,
  direction = "left", 
  variant = "primary",
}: SkillCarouselProps) {
  const animationClass = direction === "left" ? "animate-scroll-left" : "animate-scroll-right";
  const gradientClass = variant === "primary" 
    ? "from-purple-900/40 via-transparent to-purple-900/40" 
    : "from-blue-900/40 via-transparent to-blue-900/40";

  return (
    <div className="relative h-32 md:h-40 mb-8 overflow-hidden group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} z-10 pointer-events-none`}></div>
      <div className={`flex ${animationClass} space-x-4 md:space-x-6 h-full group-hover:animation-play-state-paused`}>
        {/* Duplicate skills for infinite scroll */}
        {[...skills, ...skills, ...skills].map((skill, index) => (
          <SkillCard
            key={`${direction}-${index}`}
            category={skill.category}
            items={skill.items}
            level={skill.level}
            variant={variant}
            direction={direction}
          />
        ))}
      </div>
    </div>
  );
}
