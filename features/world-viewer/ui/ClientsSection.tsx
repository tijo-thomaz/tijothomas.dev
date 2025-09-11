"use client";

import { clientsData } from '../model/worldData';

export default function ClientsSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-4 md:px-8 py-8 bg-gradient-to-br from-yellow-900/20 to-orange-900/20">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-yellow-400 mb-2 md:mb-4">
          Client Gallery
        </h2>
        <p className="text-sm md:text-lg opacity-80 px-2">
          Success stories from major companies
        </p>
      </div>
      <div className="max-w-6xl mx-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {clientsData.map((client, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-4 md:p-8 hover:border-yellow-400 hover:bg-black/60 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-center mb-4 md:mb-6">
                <div className="text-3xl md:text-4xl mr-3 md:mr-4">
                  {client.logo}
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-yellow-300">
                    {client.name}
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm">
                    {client.industry}
                  </p>
                </div>
              </div>
              <div className="space-y-2 md:space-y-3">
                <div className="text-yellow-400 font-semibold text-sm md:text-base">
                  {client.role}
                </div>
                <div className="text-gray-300 leading-relaxed font-medium text-sm md:text-base">
                  "{client.achievement}"
                </div>
                <div className="flex flex-wrap gap-1.5 md:gap-2 mt-3 md:mt-4">
                  {client.tech.map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 md:py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-mono border border-yellow-500/30 group-hover:bg-yellow-500/30 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
