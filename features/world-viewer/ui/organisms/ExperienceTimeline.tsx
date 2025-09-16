"use client";

import SectionTitle from "../atoms/SectionTitle";
import TimelineItem from "../molecules/TimelineItem";
import { timelineData } from "../../model/worldData";

export default function ExperienceTimeline() {
  return (
    <section className="relative px-4 md:px-8 py-8 md:py-16">
      {/* Timeline Header */}
      <div className="relative z-10 bg-gray-900/50 backdrop-blur-sm py-4 md:py-8 rounded-xl mx-2 md:mx-0 mb-8 md:mb-16">
        <SectionTitle
          title="Experience"
          subtitle="8+ years of frontend development • Present ← 2016"
          color="green"
        />
      </div>

      {/* Central Timeline Spine - Hidden on mobile, positioned after header */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-green-400 via-blue-400 to-purple-400 z-0 hidden lg:block"
        style={{ top: "200px", height: "calc(100% - 200px)" }}
      ></div>

      {/* Timeline Items */}
      <div className="relative z-10 space-y-16 md:space-y-32 max-w-7xl mx-auto px-2 md:px-0">
        {timelineData.map((item, index) => (
          <TimelineItem
            key={item.id}
            {...(item as any)}
            index={index}
            totalItems={timelineData.length}
          />
        ))}
      </div>
    </section>
  );
}
