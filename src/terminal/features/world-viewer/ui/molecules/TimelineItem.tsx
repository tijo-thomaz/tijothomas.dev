"use client";

import Card from "../atoms/Card";
import Badge from "../atoms/Badge";
import VinylRecord from "../atoms/VinylRecord";

interface TimelineItemProps {
  id: string;
  year: string;
  title: string;
  company: string;
  companyLink: string;
  client: string;
  duration: string;
  description: string;
  tech: string[];
  achievements: string[];
  position: "left" | "right";
  color: string;
  index: number;
  totalItems: number;
}

export default function TimelineItem({
  year,
  title,
  company,
  companyLink,
  client,
  duration,
  description,
  tech,
  achievements,
  position,
  color,
  index,
  totalItems,
}: TimelineItemProps) {
  return (
    <div className="relative">
      {/* SVG Curved Connector - Hidden on mobile */}
      {index < totalItems - 1 && (
        <svg
          className="absolute top-96 left-1/2 transform -translate-x-1/2 w-48 h-32 z-0 hidden lg:block"
          viewBox="0 0 200 120"
          style={{ overflow: "visible" }}
        >
          <path
            d={`M 100 0 Q ${
              position === "right" ? "150 60" : "50 60"
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
            position === "right"
              ? "order-1 lg:order-1 lg:text-right"
              : "order-1 lg:order-2 lg:text-left"
          }`}
        >
          <Card className="space-y-4 md:space-y-6 p-4 md:p-6 lg:p-8">
            {/* Year Badge */}
            <Badge
              variant="gradient"
              className={`inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r ${color} text-white font-bold text-lg md:text-xl`}
            >
              {year}
            </Badge>

            {/* Company & Role */}
            <div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                {title}
              </h3>
              <a
                href={companyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg md:text-xl text-green-400 font-semibold hover:text-green-300 transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                {company}
                <span className="text-sm">🔗</span>
              </a>
              <p className="text-base md:text-lg text-blue-300">
                {client}
              </p>
              <p className="text-xs md:text-sm text-gray-400 font-mono">
                {duration}
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed text-sm md:text-base lg:text-lg">
              {description}
            </p>

            {/* Achievements */}
            <div className="space-y-2">
              <h4 className="text-green-400 font-semibold text-sm md:text-base">
                Key Achievements:
              </h4>
              <ul
                className={`space-y-1 ${
                  position === "right"
                    ? "list-none"
                    : "list-disc list-inside"
                }`}
              >
                {achievements.map((achievement, i) => (
                  <li
                    key={i}
                    className="text-gray-300 text-xs md:text-sm"
                  >
                    {position === "right" && "• "}
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {tech.map((techItem, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  size="xs"
                  className={`bg-gradient-to-r ${color} bg-opacity-20 border-white/20 hover:bg-opacity-30 transition-all`}
                >
                  {techItem}
                </Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Holographic Record Section */}
        <div
          className={`${
            position === "right"
              ? "order-2 lg:order-2"
              : "order-2 lg:order-1"
          } relative flex justify-center items-center`}
        >
          <VinylRecord
            year={year}
            company={company}
            size="xl"
            color="gradient"
            isAnimating={true}
          />

          {/* Connection Point to Central Line - Hidden on mobile */}
          <div
            className={`absolute top-1/2 ${
              position === "right" ? "-left-8" : "-right-8"
            } w-8 h-1 bg-gradient-to-r ${
              color
            } transform -translate-y-1/2 hidden lg:block`}
          ></div>
        </div>
      </div>
    </div>
  );
}
