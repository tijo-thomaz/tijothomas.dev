"use client";

import { projectsData } from '../model/worldData';

export default function ProjectsSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-4 md:px-8 py-8 bg-gradient-to-br from-green-900/20 to-teal-900/20">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-green-400 mb-2 md:mb-4">
          Projects
        </h2>
        <p className="text-sm md:text-lg opacity-80 px-2">
          Major projects and technical implementations
        </p>
      </div>
      <div className="max-w-6xl mx-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {projectsData.map((project, index) => (
            <div
              key={project.id}
              className={`${
                project.highlight
                  ? "bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20"
                  : "bg-black/40 border border-green-400/30"
              } backdrop-blur-sm rounded-xl p-4 md:p-8 hover:border-green-400 hover:bg-black/60 transition-all duration-300 group cursor-pointer transform hover:scale-105`}
              onClick={() =>
                project.link && window.open(project.link, "_blank")
              }
            >
              {project.highlight && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-3 py-1 rounded-full text-xs font-bold">
                    🌟 FEATURED PROJECT
                  </span>
                  {project.link && (
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
                      project.highlight ? "text-blue-300" : "text-green-300"
                    }`}
                  >
                    {project.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4">
                    {project.description}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-mono mb-2 inline-block ${
                      project.highlight
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {project.status}
                  </div>
                  <div
                    className={`font-bold text-sm ${
                      project.highlight ? "text-blue-300" : "text-green-300"
                    }`}
                  >
                    {project.impact}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {project.tech.map((tech, i) => (
                  <span
                    key={i}
                    className={`px-2 md:px-3 py-0.5 md:py-1 rounded-md text-xs font-mono border transition-colors ${
                      project.highlight
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30 group-hover:bg-blue-500/30"
                        : "bg-green-500/20 text-green-300 border-green-500/30 group-hover:bg-green-500/30"
                    }`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
