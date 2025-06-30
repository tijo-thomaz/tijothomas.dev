"use client";

import { useState, useEffect, useRef } from "react";
import TimelineCarousel from "./TimelineCarousel";

interface InteractiveWorldViewerProps {
  currentWorld: string;
  onWorldExit: () => void;
  onWorldChange: (world: string) => void;
  initialSection?: number; // For navigation sync
}

export default function InteractiveWorldViewer({
  currentWorld,
  onWorldExit,
  onWorldChange,
  initialSection = 0,
}: InteractiveWorldViewerProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [navExpanded, setNavExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 2000);
    return () => clearTimeout(timer);
  }, [currentWorld]);

  // Navigate to the correct section when world changes
  useEffect(() => {
    if (initialSection !== 0) {
      scrollToSection(initialSection);
    }
  }, [initialSection]);

  // Scroll to specific section
  const scrollToSection = (sectionIndex: number) => {
    const container = scrollContainerRef.current;
    if (container) {
      // Calculate section positions based on viewport height
      const sections = container.querySelectorAll("section");
      if (sections[sectionIndex]) {
        const targetSection = sections[sectionIndex] as HTMLElement;
        container.scrollTo({
          top: targetSection.offsetTop - 100, // Offset for header
          behavior: "smooth",
        });
      }
      setCurrentSection(sectionIndex);
    }
  };

  // Handle scroll to update current section indicator
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const sections = container.querySelectorAll("section");

      let currentSectionIndex = 0;
      sections.forEach((section, index) => {
        const sectionTop = (section as HTMLElement).offsetTop - 200;
        const sectionBottom =
          sectionTop + (section as HTMLElement).offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSectionIndex = index;
        }
      });

      setCurrentSection(currentSectionIndex);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Timeline data for experience world (reverse chronological order - latest first)
  const timelineData = [
    {
      id: "bet365-2023",
      year: "2023",
      title: "Senior Frontend Engineer",
      company: "Bet365",
      companyLink: "https://bet365.com",
      client: "Gaming & Sports Betting",
      duration: "2023-Present",
      description:
        "Leading legacy system modernization initiatives, migrating critical betting systems from .NET to TypeScript + Go architecture.",
      tech: ["TypeScript", "Go", "Angular", "Chrome DevTools", "Performance"],
      achievements: [
        "40% performance improvement in critical systems",
        "Reduced deployment time from hours to minutes",
        "Zero-downtime migration strategy",
        "Developed internal developer tools",
      ],
      position: "right", // Record on right, details on left
      color: "from-yellow-500 to-amber-500",
    },
    {
      id: "infosys-2021",
      year: "2021",
      title: "Frontend Consultant",
      company: "Infosys",
      companyLink: "https://infosys.com",
      client: "Home Depot & eBay",
      duration: "2021-2023",
      description:
        "Spearheaded Angular-based enterprise reporting dashboards serving 10k+ concurrent users with advanced optimization strategies.",
      tech: [
        "Angular",
        "NgRx",
        "RxJS",
        "OnPush Strategy",
        "Enterprise Architecture",
      ],
      achievements: [
        "60% render cycle reduction with OnPush strategy",
        "10,000+ concurrent user support",
        "Mentored frontend development teams",
        "Conducted comprehensive code reviews",
      ],
      position: "left", // Record on left, details on right
      color: "from-orange-500 to-red-500",
    },
    {
      id: "netobjex-2020",
      year: "2020",
      title: "Frontend Developer",
      company: "NetObjex",
      companyLink: "https://netobjex.com",
      client: "COVID-19 Response Team",
      duration: "2020-2021",
      description:
        "Developed COVID-19 employee onboarding portal using React during pandemic lockdown, facilitating rapid remote employee transitions.",
      tech: ["React", "Hooks", "Highcharts", "Rematch", "Rapid Development"],
      achievements: [
        "1000+ remote employees onboarded",
        "Rapid pandemic response deployment",
        "Modern React Hooks architecture",
        "Reusable chart component library",
      ],
      position: "right", // Record on right, details on left
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "qburst-2018",
      year: "2018",
      title: "Full Stack Engineer",
      company: "QBurst Technologies",
      companyLink: "https://qburst.com",
      client: "Parking Management Solutions",
      duration: "2018-2020",
      description:
        "Built cloud-based parking management dashboards with AWS integration and real-time data visualization capabilities.",
      tech: ["AWS", "Cognito", "Google Maps", "Real-time Data", "Full Stack"],
      achievements: [
        "AWS Cognito authentication integration",
        "Google Maps API implementation",
        "Real-time parking data visualization",
        "Scalable cloud architecture",
      ],
      position: "left", // Record on left, details on right
      color: "from-green-500 to-teal-500",
    },
    {
      id: "speridian-2016",
      year: "2016",
      title: "Associate Trainee",
      company: "Speridian Technologies",
      companyLink: "https://speridian.com",
      client: "Gogo Business Aviation",
      duration: "2016-2018",
      description:
        "Developed Chrome Extension for Gogo Business Aviation with video streaming capabilities and custom React components.",
      tech: ["React", "Chrome Extensions", "Video Streaming", "Aviation UI"],
      achievements: [
        "Cross-browser compatibility",
        "Video streaming integration",
        "Aviation-specific UI components",
        "Chrome extension architecture",
      ],
      position: "right", // Record on right, details on left
      color: "from-blue-500 to-cyan-500",
    },
  ];

  // Skills data for the skills section
  const skillsData = [
    {
      category: "⚛️ Frontend Frameworks",
      items: [
        "Angular",
        "React",
        "TypeScript",
        "JavaScript",
        "Next.js",
        "Vue.js",
      ],
      level: 95,
    },
    {
      category: "🔧 Backend & APIs",
      items: ["Go", "Node.js", "REST", "GraphQL", "Microservices", "Python"],
      level: 85,
    },
    {
      category: "🧪 Testing & Quality",
      items: ["Jest", "Cypress", "Jasmine", "TDD", "CI/CD", "Unit Testing"],
      level: 90,
    },
    {
      category: "☁️ Cloud & DevOps",
      items: ["AWS", "Lambda", "DynamoDB", "S3", "Docker", "Kubernetes"],
      level: 80,
    },
    {
      category: "🎨 UI/UX & Design",
      items: ["Material UI", "Tailwind", "Sass", "Responsive", "A11y", "Figma"],
      level: 88,
    },
  ];

  // Projects data
  const projectsData = [
    {
      id: 1,
      title: "Legacy .NET to TypeScript + Go Migration",
      description:
        "Modernizing critical betting systems with 40% performance improvement",
      tech: ["TypeScript", "Go", ".NET", "System Architecture"],
      status: "Production",
      impact: "40% Performance Boost",
    },
    {
      id: 2,
      title: "Enterprise Dashboards for Fortune 500",
      description: "Scalable Angular dashboards serving 10k+ concurrent users",
      tech: ["Angular", "NgRx", "OnPush Strategy", "Performance"],
      status: "Live",
      impact: "10k+ Users",
    },
    {
      id: 3,
      title: "COVID-19 Employee Onboarding Portal",
      description:
        "React-based rapid deployment solution for remote work transition",
      tech: ["React", "Hooks", "Rapid Development", "Remote Work"],
      status: "Deployed",
      impact: "1000+ Employees",
    },
    {
      id: 4,
      title: "Cloud-based Parking Management",
      description:
        "Real-time parking data with AWS integration and live tracking",
      tech: ["AWS", "Google Maps", "Real-time", "Authentication"],
      status: "Live",
      impact: "Real-time Data",
    },
  ];

  // Clients data
  const clientsData = [
    {
      name: "Bet365",
      logo: "🎯",
      industry: "Gaming & Sports Betting",
      role: "Senior Frontend Engineer",
      achievement: "40% performance improvement",
      tech: ["TypeScript", "Go", "Performance Optimization"],
    },
    {
      name: "Home Depot",
      logo: "🏠",
      industry: "Retail & E-commerce",
      role: "Frontend Consultant",
      achievement: "10k+ concurrent users",
      tech: ["Angular", "Enterprise Dashboards", "Scalability"],
    },
    {
      name: "eBay",
      logo: "🛒",
      industry: "E-commerce Platform",
      role: "Frontend Consultant",
      achievement: "60% render cycle reduction",
      tech: ["Angular", "OnPush Strategy", "Performance"],
    },
    {
      name: "Gogo Business Aviation",
      logo: "✈️",
      industry: "Aviation Technology",
      role: "Frontend Developer",
      achievement: "Video streaming integration",
      tech: ["React", "Chrome Extension", "Video Streaming"],
    },
  ];

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white relative flex flex-col overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-green-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-20 h-20 bg-yellow-500 rounded-full animate-ping"></div>
      </div>
      {/* Main Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto md:scrollbar-hide"
        style={{ 
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          overscrollBehavior: "contain"
        }}
      >
        {/* Section 1: Experience - Vertical Timeline */}
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

                  {/* Record Section */}
                  <div
                    className={`${
                      item.position === "right"
                        ? "order-2 lg:order-2"
                        : "order-2 lg:order-1"
                    } flex justify-center items-center`}
                  >
                    {/* Vinyl Record */}
                    <div className="relative group cursor-pointer">
                      {/* Main Record */}
                      <div
                        className={`w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br ${item.color} shadow-2xl transform group-hover:scale-105 transition-all duration-500 relative overflow-hidden`}
                      >
                        {/* Vinyl Grooves */}
                        <div className="absolute inset-4 rounded-full border-4 border-black/20"></div>
                        <div className="absolute inset-8 rounded-full border-2 border-black/20"></div>
                        <div className="absolute inset-12 rounded-full border border-black/20"></div>

                        {/* Center Label */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <div className="text-center">
                              <div className="text-white font-bold text-sm sm:text-xl lg:text-2xl">
                                {item.year}
                              </div>
                              <div className="text-green-400 text-xs font-mono hidden sm:block">
                                {item.company.split(" ")[0]}
                              </div>
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
              </div>
            ))}
          </div>

          {/* Smooth Transition to Skills */}
          <div className="relative z-10 mt-32 mb-16 text-center">
            <div className="max-w-2xl mx-auto bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm p-8 rounded-2xl border border-purple-400/30">
              <div className="w-1 h-12 bg-gradient-to-b from-green-400 via-purple-400 to-blue-400 mx-auto mb-6"></div>
              <h3 className="text-3xl font-bold text-purple-400 mb-4">
                Ready to Explore Skills?
              </h3>
              <p className="text-gray-300 mb-6">
                Discover the technologies and expertise gained throughout this
                journey
              </p>
              <div className="animate-bounce">
                <div className="text-purple-400 text-2xl">⬇️</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Skills - Futuristic Grid */}
        <section className="min-h-screen flex flex-col justify-center px-4 md:px-8 py-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-purple-400 mb-2 md:mb-4">
              Skills
            </h2>
            <p className="text-sm md:text-lg opacity-80 px-2">
              Tech constellation mastered over the years
            </p>
          </div>
          <div className="max-w-6xl mx-auto px-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {skillsData.map((skill, index) => (
                <div
                  key={index}
                  className="bg-black/40 backdrop-blur-sm border border-purple-400/30 rounded-xl p-4 md:p-6 hover:border-purple-400 hover:bg-black/60 transition-all duration-300 group"
                >
                  <div className="text-lg md:text-2xl mb-2 md:mb-3">
                    {skill.category}
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <div className="text-right text-xs md:text-sm text-purple-300 mt-1">
                      {skill.level}%
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {skill.items.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 md:py-1 bg-purple-500/20 text-purple-300 rounded text-xs font-mono border border-purple-500/30 group-hover:bg-purple-500/30 transition-colors"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Projects - Portfolio Grid */}
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
                  className="bg-black/40 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 md:p-8 hover:border-green-400 hover:bg-black/60 transition-all duration-300 group cursor-pointer transform hover:scale-105"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 space-y-3 md:space-y-0">
                    <div className="flex-1 md:mr-4">
                      <h3 className="text-lg md:text-xl font-bold text-green-300 mb-2">
                        {project.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4">
                        {project.description}
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-mono mb-2 inline-block">
                        {project.status}
                      </div>
                      <div className="text-green-300 font-bold text-sm">
                        {project.impact}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 md:px-3 py-0.5 md:py-1 bg-green-500/20 text-green-300 rounded-md text-xs font-mono border border-green-500/30 group-hover:bg-green-500/30 transition-colors"
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

        {/* Section 4: Client Gallery - Testimonials */}
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
      </div>

      {/* Glassmorphed Floating Navigation with Swipe */}
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

      {/* Footer - Fixed at bottom */}
      <div className="relative z-10 text-center py-3 px-4 flex-shrink-0 bg-black/50 backdrop-blur-sm border-t border-blue-400/30">
        <button
          onClick={onWorldExit}
          className="bg-green-500 hover:bg-green-400 text-black px-6 py-2 rounded-lg font-mono transition-colors text-sm md:text-base"
        >
          ← Return to Terminal
        </button>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
