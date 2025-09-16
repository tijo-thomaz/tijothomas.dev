// Timeline data for experience world (reverse chronological order - latest first)
export const timelineData = [
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
export const skillsData = [
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
  {
    category: "🚀 Performance & Optimization",
    items: [
      "Webpack",
      "Vite",
      "Code Splitting",
      "Lazy Loading",
      "Bundle Analysis",
      "Web Vitals",
    ],
    level: 92,
  },
  {
    category: "🔄 State Management",
    items: ["NgRx", "Redux", "Zustand", "Context API", "MobX", "Recoil"],
    level: 87,
  },
  {
    category: "📱 Mobile & Cross-Platform",
    items: [
      "React Native",
      "PWA",
      "Ionic",
      "Capacitor",
      "Responsive Web",
      "Touch UI",
    ],
    level: 75,
  },
  {
    category: "🗄️ Database & Storage",
    items: ["PostgreSQL", "MongoDB", "Redis", "DynamoDB", "Firebase", "SQL"],
    level: 82,
  },
  {
    category: "🔐 Security & Authentication",
    items: ["JWT", "OAuth", "AWS Cognito", "CORS", "HTTPS", "API Security"],
    level: 85,
  },
];

// Projects data
export const projectsData = [
  {
    id: 1,
    title: "PromptShield - AI Security Sandbox",
    description:
      "Enterprise-grade security testing platform for detecting and preventing prompt injection attacks in LLM workflows",
    tech: ["Go", "React", "TypeScript", "Docker", "Multi-cloud"],
    status: "Live Demo",
    impact: "Featured Project",
    link: "https://promptshield.vercel.app/",
    highlight: true,
  },
  {
    id: 2,
    title: "Legacy .NET to TypeScript + Go Migration",
    description:
      "Modernizing critical betting systems with 40% performance improvement",
    tech: ["TypeScript", "Go", ".NET", "System Architecture"],
    status: "Production",
    impact: "40% Performance Boost",
  },
  {
    id: 3,
    title: "Enterprise Dashboards for Fortune 500",
    description: "Scalable Angular dashboards serving 10k+ concurrent users",
    tech: ["Angular", "NgRx", "OnPush Strategy", "Performance"],
    status: "Live",
    impact: "10k+ Users",
  },
  {
    id: 4,
    title: "COVID-19 Employee Onboarding Portal",
    description:
      "React-based rapid deployment solution for remote work transition",
    tech: ["React", "Hooks", "Rapid Development", "Remote Work"],
    status: "Deployed",
    impact: "1000+ Employees",
  },
  {
    id: 5,
    title: "Cloud-based Parking Management",
    description:
      "Real-time parking data with AWS integration and live tracking",
    tech: ["AWS", "Google Maps", "Real-time", "Authentication"],
    status: "Live",
    impact: "Real-time Data",
  },
];

// Clients data
export const clientsData = [
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
