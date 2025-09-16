"use client";

import Card from "../atoms/Card";
import Badge from "../atoms/Badge";

interface ClientCardProps {
  name: string;
  logo: string;
  industry: string;
  role: string;
  achievement: string;
  tech: string[];
}

export default function ClientCard({
  name,
  logo,
  industry,
  role,
  achievement,
  tech,
}: ClientCardProps) {
  return (
    <Card
      variant="default"
      className="p-4 md:p-8 border-yellow-400/30 hover:border-yellow-400 group"
    >
      <div className="flex items-center mb-4 md:mb-6">
        <div className="text-3xl md:text-4xl mr-3 md:mr-4">
          {logo}
        </div>
        <div>
          <h3 className="text-lg md:text-2xl font-bold text-yellow-300">
            {name}
          </h3>
          <p className="text-gray-400 text-xs md:text-sm">
            {industry}
          </p>
        </div>
      </div>

      <div className="space-y-2 md:space-y-3">
        <div className="text-yellow-400 font-semibold text-sm md:text-base">
          {role}
        </div>
        <div className="text-gray-300 leading-relaxed font-medium text-sm md:text-base">
          "{achievement}"
        </div>
        <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
          {tech.map((techItem, i) => (
            <Badge
              key={i}
              variant="secondary"
              size="xs"
              className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 group-hover:bg-yellow-500/30 transition-colors"
            >
              {techItem}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}
