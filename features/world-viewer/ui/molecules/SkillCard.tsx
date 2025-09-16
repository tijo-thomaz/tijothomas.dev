"use client";

import Card from "../atoms/Card";
import Badge from "../atoms/Badge";
import ProgressBar from "../atoms/ProgressBar";

interface SkillCardProps {
  category: string;
  items: string[];
  level: number;
  variant?: "primary" | "secondary";
  direction?: "left" | "right";
}

export default function SkillCard({
  category,
  items,
  level,
  variant = "primary",
  direction = "left",
}: SkillCardProps) {
  const isSecondary = variant === "secondary";
  const colorScheme = isSecondary ? "blue" : "purple";

  return (
    <Card
      variant="glass"
      className={`flex-shrink-0 w-72 md:w-80 lg:w-96 p-4 md:p-6 group cursor-pointer shadow-lg ${
        isSecondary
          ? "border-blue-400/40 shadow-blue-500/20 hover:border-blue-400"
          : "border-purple-400/40 shadow-purple-500/20 hover:border-purple-400"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`text-lg md:text-xl font-bold ${
          isSecondary ? "text-blue-300" : "text-purple-300"
        }`}>
          {category}
        </div>
        <div className={`text-2xl md:text-3xl font-bold ${
          isSecondary ? "text-blue-400" : "text-purple-400"
        }`}>
          {level}%
        </div>
      </div>

      <div className="mb-4">
        <ProgressBar
          value={level}
          color={colorScheme}
          size="md"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <Badge
            key={i}
            variant={isSecondary ? "secondary" : "accent"}
            size="xs"
            className={`transition-all duration-300 ${
              isSecondary
                ? "group-hover:bg-blue-500/50 group-hover:text-white"
                : "group-hover:bg-purple-500/50 group-hover:text-white"
            }`}
          >
            {item}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
