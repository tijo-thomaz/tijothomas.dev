"use client";

interface NavigationProps {
  currentSection: number;
  navExpanded: boolean;
  setNavExpanded: (expanded: boolean) => void;
  scrollToSection: (section: number) => void;
}

export default function Navigation({
  currentSection,
  navExpanded,
  setNavExpanded,
  scrollToSection,
}: NavigationProps) {
  return (
    <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-20 pointer-events-none">
      <div className="pointer-events-auto">
        {/* Navigation Panel Container */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            navExpanded ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            width: "280px",
          }}
        >
          {/* Swipe Handle */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full">
            <button
              onClick={() => setNavExpanded(!navExpanded)}
              className="bg-black/40 backdrop-blur-md border border-white/20 shadow-xl hover:bg-black/60 transition-all duration-300 group p-3"
              style={{ borderRadius: "0.75rem 0 0 0.75rem" }}
            >
              <div className="flex flex-col items-center space-y-2">
                <div
                  className={`text-white/80 transition-transform duration-500 text-lg ${
                    navExpanded ? "rotate-180" : ""
                  }`}
                >
                  ▶
                </div>
                <div className="w-0.5 h-8 bg-gradient-to-b from-green-400 to-blue-500 rounded-full"></div>
                <div className="text-xs text-white/60 font-mono -rotate-90 whitespace-nowrap">
                  NAV
                </div>
              </div>
            </button>
          </div>

          {/* Navigation Panel */}
          <div
            className={`bg-black/20 backdrop-blur-md border-l border-t border-b border-white/10 shadow-2xl transition-all duration-200 scrollbar-hide ${
              navExpanded ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            style={{
              borderRadius: "1rem 0 0 1rem",
              width: "280px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div className="p-6">
              {/* AI Assistant Style Header */}
              <div className="text-center mb-6 pb-4 border-b border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-full animate-pulse"></div>
                </div>
                <div className="text-lg text-white font-mono font-bold">
                  Portfolio Navigator
                </div>
                <div className="text-xs text-white/60 mt-1">
                  Navigate through sections
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-4">
                {[
                  {
                    name: "Experience",
                    icon: "📈",
                    section: 0,
                    description: "Career Timeline",
                  },
                  {
                    name: "Skills",
                    icon: "⚛️",
                    section: 1,
                    description: "Tech Stack",
                  },
                  {
                    name: "Projects",
                    icon: "🚀",
                    section: 2,
                    description: "Portfolio Work",
                  },
                  {
                    name: "Gallery",
                    icon: "🏆",
                    section: 3,
                    description: "Client Success",
                  },
                ].map((item, index) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      scrollToSection(index);
                      setNavExpanded(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
                      currentSection === index
                        ? "bg-gradient-to-r from-green-500/40 to-blue-500/40 border border-green-400/60 shadow-lg scale-105"
                        : "bg-white/5 hover:bg-white/15 border border-transparent hover:border-white/30 hover:scale-102"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="text-left">
                        <div className="text-white text-sm font-mono font-semibold">
                          {item.name}
                        </div>
                        <div className="text-white/70 text-xs">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentSection === index
                          ? "bg-green-400 shadow-lg shadow-green-400/50"
                          : "bg-white/40"
                      }`}
                    ></div>
                  </button>
                ))}
              </div>

              {/* Progress Indicator */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between text-xs text-white/50 mb-3">
                  <span>Journey Progress</span>
                  <span>{Math.round(((currentSection + 1) / 4) * 100)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${((currentSection + 1) / 4) * 100}%` }}
                  ></div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => {
                      scrollToSection(0);
                      setNavExpanded(false);
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/15 rounded-lg p-2 text-xs text-white/70 transition-all font-mono"
                  >
                    ⏮ Start
                  </button>
                  <button
                    onClick={() => {
                      scrollToSection(3);
                      setNavExpanded(false);
                    }}
                    className="flex-1 bg-white/5 hover:bg-white/15 rounded-lg p-2 text-xs text-white/70 transition-all font-mono"
                  >
                    End ⏭
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setNavExpanded(false)}
                className="w-full mt-4 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 rounded-lg p-3 text-red-300 text-sm font-mono transition-all"
              >
                ✕ Close Navigator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
