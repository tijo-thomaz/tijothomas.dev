"use client";

import Card from "../atoms/Card";
import Button from "../atoms/Button";
import ProgressBar from "../atoms/ProgressBar";
import NavigationItem from "../molecules/NavigationItem";

interface NavigationPanelProps {
  currentSection: number;
  navExpanded: boolean;
  setNavExpanded: (expanded: boolean) => void;
  scrollToSection: (section: number) => void;
}

const navigationItems = [
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
];

export default function NavigationPanel({
  currentSection,
  navExpanded,
  setNavExpanded,
  scrollToSection,
}: NavigationPanelProps) {
  const handleNavItemClick = (section: number) => {
    scrollToSection(section);
    setNavExpanded(false);
  };

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
            <Button
              onClick={() => setNavExpanded(!navExpanded)}
              variant="ghost"
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
            </Button>
          </div>

          {/* Navigation Panel */}
          <Card
            variant="glass"
            className={`border-l border-t border-b border-white/10 shadow-2xl transition-all duration-200 scrollbar-hide ${
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
                {navigationItems.map((item) => (
                  <NavigationItem
                    key={item.name}
                    name={item.name}
                    icon={item.icon}
                    description={item.description}
                    section={item.section}
                    currentSection={currentSection}
                    onClick={() => handleNavItemClick(item.section)}
                  />
                ))}
              </div>

              {/* Progress Indicator */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex justify-between text-xs text-white/50 mb-3">
                  <span>Journey Progress</span>
                  <span>{Math.round(((currentSection + 1) / 4) * 100)}%</span>
                </div>
                <ProgressBar
                  value={((currentSection + 1) / 4) * 100}
                  color="gradient"
                  size="md"
                />

                {/* Quick Actions */}
                <div className="mt-4 flex space-x-2">
                  <Button
                    onClick={() => handleNavItemClick(0)}
                    variant="ghost"
                    size="sm"
                    className="flex-1 bg-white/5 hover:bg-white/15 text-white/70"
                  >
                    ⏮ Start
                  </Button>
                  <Button
                    onClick={() => handleNavItemClick(3)}
                    variant="ghost"
                    size="sm"
                    className="flex-1 bg-white/5 hover:bg-white/15 text-white/70"
                  >
                    End ⏭
                  </Button>
                </div>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setNavExpanded(false)}
                variant="danger"
                className="w-full mt-4"
              >
                ✕ Close Navigator
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
