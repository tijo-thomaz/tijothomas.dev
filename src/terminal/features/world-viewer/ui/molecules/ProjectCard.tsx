"use client";

import Card from "../atoms/Card";
import Badge from "../atoms/Badge";

interface ProjectCardProps {
  id: number;
  title: string;
  description: string;
  tech: string[];
  status: string;
  impact: string;
  link?: string;
  highlight?: boolean;
}

export default function ProjectCard({
  title,
  description,
  tech,
  status,
  impact,
  link,
  highlight = false,
}: ProjectCardProps) {
  const handleClick = () => {
    if (link) {
      window.open(link, "_blank");
    }
  };

  return (
    <Card
      variant={highlight ? "highlight" : "default"}
      onClick={handleClick}
      className="p-4 md:p-8 group transform"
    >
      {highlight && (
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="gradient" size="xs">
            🌟 FEATURED PROJECT
          </Badge>
          {link && (
            <span className="text-blue-300 text-xs">
              Click to view live demo →
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 space-y-3 md:space-y-0">
        <div className="flex-1 md:mr-4">
          <h3
            className={`text-lg md:text-xl font-bold mb-2 ${
              highlight ? "text-blue-300" : "text-green-300"
            }`}
          >
            {title}
          </h3>
          <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4">
            {description}
          </p>
        </div>

        <div className="text-left md:text-right">
          <Badge
            variant={highlight ? "accent" : "primary"}
            size="xs"
            className="mb-2 inline-block"
          >
            {status}
          </Badge>
          <div
            className={`font-bold text-sm ${
              highlight ? "text-blue-300" : "text-green-300"
            }`}
          >
            {impact}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {tech.map((techItem, i) => (
          <Badge
            key={i}
            variant={highlight ? "accent" : "primary"}
            size="xs"
            className={`transition-colors ${
              highlight
                ? "group-hover:bg-blue-500/30"
                : "group-hover:bg-green-500/30"
            }`}
          >
            {techItem}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
