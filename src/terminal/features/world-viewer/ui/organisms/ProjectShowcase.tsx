"use client";

import SectionTitle from "../atoms/SectionTitle";
import ProjectCard from "../molecules/ProjectCard";
import { projectsData } from "../../model/worldData";

export default function ProjectShowcase() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-4 md:px-8 py-8 bg-gradient-to-br from-green-900/20 to-teal-900/20">
      <div className="mb-6 md:mb-8">
        <SectionTitle
          title="Projects"
          subtitle="Major projects and technical implementations"
          color="green"
        />
      </div>
      
      <div className="max-w-6xl mx-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {projectsData.map((project) => (
            <ProjectCard
              key={project.id}
              {...project}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
