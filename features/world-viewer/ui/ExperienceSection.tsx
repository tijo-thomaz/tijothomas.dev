"use client";

import { timelineData } from '../model/worldData';

export default function ExperienceSection() {
  return (
    <section className="relative px-4 md:px-8 py-8 md:py-16">
      {/* Timeline Header */}
      <div className="text-center mb-8 md:mb-16 relative z-10 bg-gray-900/50 backdrop-blur-sm py-4 md:py-8 rounded-xl mx-2 md:mx-0">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-green-400 mb-2 md:mb-4">
          Experience
        </h2>
        <p className="text-sm md:text-lg opacity-80 px-2">
          8+ years of frontend development • Present ← 2016
        </p>
      </div>

      {/* Central Timeline Spine - Hidden on mobile, positioned after header */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-green-400 via-blue-400 to-purple-400 z-0 hidden lg:block"
        style={{ top: "200px", height: "calc(100% - 200px)" }}
      ></div>

      {/* Timeline Items */}
      <div className="relative z-10 space-y-16 md:space-y-32 max-w-7xl mx-auto px-2 md:px-0">
        {timelineData.map((item, index) => (
          <div key={item.id} className="relative">
            {/* SVG Curved Connector - Hidden on mobile */}
            {index < timelineData.length - 1 && (
              <svg
                className="absolute top-96 left-1/2 transform -translate-x-1/2 w-48 h-32 z-0 hidden lg:block"
                viewBox="0 0 200 120"
                style={{ overflow: "visible" }}
              >
                <path
                  d={`M 100 0 Q ${
                    item.position === "right" ? "150 60" : "50 60"
                  } 100 120`}
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  fill="none"
                  className="opacity-60"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
            )}

            {/* Timeline Item Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center">
              {/* Details Section */}
              <div
                className={`${
                  item.position === "right"
                    ? "order-1 lg:order-1 lg:text-right"
                    : "order-1 lg:order-2 lg:text-left"
                } space-y-4 md:space-y-6 bg-black/30 backdrop-blur-sm p-4 md:p-6 lg:p-8 rounded-xl border border-white/10`}
              >
                {/* Year Badge */}
                <div
                  className={`inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r ${item.color} text-white rounded-full font-bold text-lg md:text-xl`}
                >
                  {item.year}
                </div>

                {/* Company & Role */}
                <div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <a
                    href={item.companyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg md:text-xl text-green-400 font-semibold hover:text-green-300 transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    {item.company}
                    <span className="text-sm">🔗</span>
                  </a>
                  <p className="text-base md:text-lg text-blue-300">
                    {item.client}
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 font-mono">
                    {item.duration}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed text-sm md:text-base lg:text-lg">
                  {item.description}
                </p>

                {/* Achievements */}
                <div className="space-y-2">
                  <h4 className="text-green-400 font-semibold text-sm md:text-base">
                    Key Achievements:
                  </h4>
                  <ul
                    className={`space-y-1 ${
                      item.position === "right"
                        ? "list-none"
                        : "list-disc list-inside"
                    }`}
                  >
                    {item.achievements.map((achievement, i) => (
                      <li
                        key={i}
                        className="text-gray-300 text-xs md:text-sm"
                      >
                        {item.position === "right" && "• "}
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {item.tech.map((tech, i) => (
                    <span
                      key={i}
                      className={`px-2 md:px-3 py-0.5 md:py-1 bg-gradient-to-r ${item.color} bg-opacity-20 text-white rounded-full text-xs font-mono border border-white/20 hover:bg-opacity-30 transition-all`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Holographic Record Section */}
              <div
                className={`${
                  item.position === "right"
                    ? "order-2 lg:order-2"
                    : "order-2 lg:order-1"
                } relative flex justify-center items-center`}
              >
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
                  {/* Main Record */}
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black border-4 ${
                      item.position === "right"
                        ? "border-green-400"
                        : "border-blue-400"
                    } shadow-2xl relative overflow-hidden group hover:scale-105 transition-all duration-500`}
                  >
                    {/* Record Grooves */}
                    <div className="absolute inset-4 rounded-full border-2 border-gray-600/40"></div>
                    <div className="absolute inset-8 rounded-full border border-gray-600/30"></div>
                    <div className="absolute inset-12 rounded-full border border-gray-600/20"></div>
                    <div className="absolute inset-16 rounded-full border border-gray-600/10"></div>

                    {/* Center Label */}
                    <div
                      className={`absolute inset-12 sm:inset-16 lg:inset-20 rounded-full bg-gradient-to-br ${item.color} flex flex-col items-center justify-center text-white shadow-lg`}
                    >
                      <div className="text-lg sm:text-xl lg:text-3xl font-bold">
                        {item.year}
                      </div>
                      <div className="text-green-400 text-xs font-mono hidden sm:block">
                        {item.company.split(" ")[0]}
                      </div>
                    </div>
                  </div>

                  {/* Rotation Animation */}
                  <div
                    className="absolute inset-0 animate-spin"
                    style={{ animationDuration: "10s" }}
                  >
                    <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white/60 rounded-full absolute top-8 sm:top-16 left-1/2 transform -translate-x-1/2"></div>
                    <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/40 rounded-full absolute top-12 sm:top-20 right-8 sm:right-16"></div>
                    <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/40 rounded-full absolute bottom-12 sm:bottom-20 left-8 sm:left-16"></div>
                  </div>
                </div>

                {/* Connection Point to Central Line - Hidden on mobile */}
                <div
                  className={`absolute top-1/2 ${
                    item.position === "right" ? "-left-8" : "-right-8"
                  } w-8 h-1 bg-gradient-to-r ${
                    item.color
                  } transform -translate-y-1/2 hidden lg:block`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
