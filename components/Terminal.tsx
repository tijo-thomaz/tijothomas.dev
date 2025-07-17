"use client"

import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { downloadFile, generatePDFResume } from "@/lib/utils";
import { soundManager } from "@/lib/sounds";
import { trackCommand } from "@/lib/simple-analytics";
import { CURRENT_VERSION } from "@/lib/version";
import { TutorialManager } from "@/lib/tutorial-manager";

interface Command {
  input: string;
  output: string[];
  timestamp: Date;
}

interface TerminalProps {
  onEnter3DWorld?: (world: string) => void;
  onJourneyProgress?: (section: string) => void;
  onNavigateToWorld?: (section: string) => void;
  onAddToCommandHistory?: (command: string) => void;
  commandHistory?: string[];
  tutorialManager?: TutorialManager | null;
  onUserActivity?: () => void;
  onTutorialActivity?: () => void;
  terminalInput?: string;
}

export interface TerminalHandle {
  executeCommand: (command: string) => void;
}

const Terminal = forwardRef<TerminalHandle, TerminalProps>(({ 
  onEnter3DWorld, 
  onJourneyProgress, 
  onNavigateToWorld,
  onAddToCommandHistory, 
  commandHistory: externalCommandHistory = [],
  tutorialManager,
  onUserActivity,
  onTutorialActivity,
  terminalInput
}, ref) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Command[]>([]);
  const [localCommandHistory, setLocalCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Use external command history if provided, otherwise use local
  const commandHistory = externalCommandHistory.length > 0 ? externalCommandHistory : localCommandHistory;
  const [currentDirectory, setCurrentDirectory] = useState("~");
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Tutorial state
  const isAutoTyping = tutorialManager?.isCurrentlyTyping() || false;
  const demoMode = tutorialManager?.isActive() || false;

  const portfolioData = {
    about: [
      "Tijo Thomas | Senior Frontend Engineer | Manchester, UK",
      "",
      "Software Engineer with over 8 years of experience in frontend development",
      "and a strong focus on building responsive UIs. Proficient in TypeScript,",
      "Angular, React and Golang with a proven track record of mentoring peers",
      "and leading successful projects.",
      "",
      "Notable achievements include the migration of legacy systems at Bet365",
      "and the development of enterprise-grade applications for major clients",
      "like Home Depot and eBay.",
      "",
      "📧 tijo1293@gmail.com | 📱 +44 7818 989060"
    ],
    skills: [
      "Frontend: Angular, React, TypeScript, JavaScript, HTML5, CSS3, Sass",
      "Backend: Go, Node.js",
      "State Management: RxJS, NgRx, Redux, Rematch",
      "Testing: Jasmine, Karma, Jest, Cypress",
      "Data Visualization: Highcharts, Chart.js",
      "UI Libraries: Material UI, Styled Components",
      "Cloud: AWS Amplify, Lambda, DynamoDB, Cognito, API Gateway, S3",
      "Tools: Git, VS Code, Chrome DevTools, Postman, Figma",
      "APIs: Google Maps API"
    ],
    projects: [
      "🏢 Legacy .NET to TypeScript + Go Migration (Bet365)",
      "   • Modernized legacy systems improving performance by 40%",
      "   • Reduced deployment time from hours to minutes",
      "",
      "📊 Enterprise Reporting Dashboards (Home Depot & eBay)",
      "   • Built scalable Angular dashboards serving 10k+ users",
      "   • Implemented OnPush strategy reducing render cycles by 60%",
      "",
      "🦠 COVID-19 Employee Onboarding Portal (React + Hooks)",
      "   • Rapid deployment during pandemic lockdown",
      "   • Streamlined onboarding for 1000+ remote employees",
      "",
      "🅿️ Cloud-based Parking Dashboards (AWS Stack)",
      "   • Real-time parking data visualization",
      "   • AWS Cognito + Google Maps integration",
      "",
      "🎬 Chrome Extension for Business Aviation (React)",
      "   • Video streaming capabilities for Gogo clients",
      "   • Custom React components for aviation UI"
    ],
    experience: [
      "Software Engineer @ Bet365 (02/2023 – Present)",
      "- Migrated legacy .NET pages to modern TypeScript + Go architecture",
      "- Developed internal tools using VS Code extensions and Chrome DevTools",
      "- Engineered scalable backend services in Go",
      "- Performance tuning and release optimization",
      "",
      "Frontend Consultant @ Infosys (05/2021 – 01/2023)",
      "- Client: Home Depot & eBay",
      "- Spearheaded Angular-based enterprise reporting dashboards",
      "- Implemented OnPush change detection and smart/dumb architecture",
      "- Mentored frontend developers and conducted code reviews",
      "",
      "Frontend Developer @ NetObjex (05/2020 – 05/2021)",
      "- Developed COVID-19 employee onboarding portal with React",
      "- Engineered reusable chart components using Highcharts",
      "- Managed state with Rematch and styled components",
      "",
      "Full Stack Engineer @ QBurst Technologies (11/2018 – 03/2020)",
      "- Built cloud-based parking dashboards with AWS stack",
      "- Integrated AWS Cognito authentication and Google Maps API",
      "",
      "Associate Trainee @ Speridian Technologies (11/2016 – 07/2018)",
      "- Client: Gogo Business Aviation",
      "- Developed Chrome Extension with React and video streaming"
    ],
    contact: [
      "📧 Email: tijo1293@gmail.com",
      "📱 Phone: +44 7818 989060",
      "💼 LinkedIn: linkedin.com/in/tijo-j-thomaz93",
      "📍 Location: Manchester, UK",
      "🎓 Education: MCA & BCA from M.G. University, Kottayam",
      "Available for exciting opportunities and collaborations"
    ],
    "git-log": [
      "commit a1b2c3d (HEAD -> main, origin/main)",
      "Author: Tijo Thomas <tijo1293@gmail.com>",
      "Date: Mon Dec 25 2023 14:30:00 +0000",
      "",
      "    feat: Enhanced terminal portfolio with AI chat integration",
      "",
      "commit d4e5f6g",
      "Author: Tijo Thomas <tijo1293@gmail.com>",
      "Date: Sun Dec 24 2023 09:15:00 +0000",
      "",
      "    refactor: Migrated legacy components to TypeScript",
      "",
      "commit h7i8j9k",
      "Author: Tijo Thomas <tijo1293@gmail.com>",
      "Date: Fri Dec 22 2023 16:45:00 +0000",
      "",
      "    perf: Optimized rendering performance by 40%"
    ]
  };

  const availableCommands = [
    'help', 'about', 'skills', 'projects', 'experience', 'contact',
    'ls', 'pwd', 'whoami', 'date', 'clear', 'resume', 'git-log',
    'vim-skills', 'projects-demo', 'world', '3d', 'explore'
  ];

  const executeCommand = useCallback(async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    if (trimmedCmd === "clear") {
      setHistory([]);
      soundManager.enableWithUserInteraction().then(() => soundManager.playCommand());
      return;
    }

    let output: string[];
    let isError = false;

    // Parse the command and arguments
    const commandParts = trimmedCmd.split(' ');
    const baseCommand = commandParts[0];
    const args = commandParts.slice(1);

    switch (baseCommand) {
      case "help":
        output = [
          "📋 PORTFOLIO COMMANDS:",
          "",
          "🏢 about         - Learn about me",
          "⚛️ skills        - View my technical skills", 
          "🚀 projects      - See my recent projects",
          "📈 experience    - View my work experience",
          "🏆 clients       - View client success stories",
          "📧 contact       - Get my contact information",
          "📄 resume        - Download my resume (PDF)",
          "",
          "🌟 INTERACTIVE EXPLORATION:",
          "explore experience - Immersive career timeline",
          "explore projects   - Interactive project showcase", 
          "explore skills     - Tech skills constellation",
          "explore clients    - Client success gallery",
          "",
          "🔧 TERMINAL COMMANDS:",
          "clear         - Clear the terminal",
          "ls            - List directory contents", 
          "",
          "💡 TIPS:",
          "• Use ↑/↓ arrows for command history",
          "• Try 'explore experience' for immersive journey!",
          "• AI assistant available for interactive help"
        ];
        break;
      case "ls":
        output = ["about.txt", "skills.json", "projects/", "experience.md", "contact.vcf", ".git/"];
        break;
      case "pwd":
        output = [`/home/tijo${currentDirectory === '~' ? '' : currentDirectory}`];
        break;
      case "whoami":
        output = ["portfolio_visitor"];
        break;
      case "date":
        output = [new Date().toString()];
        break;
      case "about":
        output = portfolioData.about;
        break;
      case "skills":
        output = [
          ...portfolioData.skills,
          "",
          "💡 Want to explore interactively? Try: explore skills"
        ];
        // Regular command - no journey progress tracking
        break;
      case "projects":
        output = [
          ...portfolioData.projects,
          "",
          "💡 Want to explore interactively? Try: explore projects"
        ];
        // Regular command - no journey progress tracking
        break;
      case "projects-demo":
        output = [
          "🔗 Live Project Demos & Repositories:",
          "",
          "🏢 Bet365 Migration Project",
          "   └─ [PROPRIETARY] Internal enterprise system",
          "",
          "📊 Enterprise Dashboards",
          "   └─ [CLIENT CONFIDENTIAL] Home Depot & eBay projects",
          "",
          "🦠 COVID-19 Portal Demo",
          "   └─ github.com/tijo-thomaz/covid-onboarding-demo",
          "",
          "🅿️ Parking Dashboard",
          "   └─ github.com/tijo-thomaz/aws-parking-dashboard",
          "",
          "🎬 Aviation Chrome Extension",
          "   └─ [PROPRIETARY] Gogo Business Aviation",
          "",
          "💼 This Portfolio",
          "   └─ github.com/tijo-thomaz/tijothomas.dev",
          "",
          "Note: Some projects are proprietary/confidential.",
          "Contact me for detailed case studies and demos!"
        ];
        break;
      case "experience":
        output = [
          ...portfolioData.experience,
          "",
          "💡 Want to explore interactively? Try: explore experience"
        ];
        // Regular command - no journey progress tracking
        break;
      case "clients":
        output = [
          "🏆 CLIENT SUCCESS STORIES:",
          "",
          "🎯 Bet365 - Gaming Industry Leader", 
          "   Role: Senior Frontend Engineer",
          "   Achievement: 40% performance improvement",
          "   Tech: TypeScript, Go, Performance Optimization",
          "",
          "🏠 Home Depot - Fortune 500 Retail",
          "   Role: Frontend Consultant", 
          "   Achievement: 10k+ concurrent users",
          "   Tech: Angular, Enterprise Dashboards, Scalability",
          "",
          "🛒 eBay - E-commerce Platform",
          "   Role: Frontend Consultant",
          "   Achievement: 60% render cycle reduction", 
          "   Tech: Angular, OnPush Strategy, Performance",
          "",
          "✈️ Gogo Business Aviation",
          "   Role: Frontend Developer",
          "   Achievement: Video streaming integration",
          "   Tech: React, Chrome Extension, Video Streaming",
          "",
          "💡 Use 'explore clients' for interactive gallery view!"
        ];
        // Regular command - no journey progress tracking
        break;
      case "contact":
        output = portfolioData.contact;
        break;
      case "resume":
        try {
          const resumeContent = generatePDFResume();
          downloadFile(resumeContent, 'Tijo_Thomas_Resume.txt', 'text/plain');
          output = [
            "📄 Resume downloaded: Tijo_Thomas_Resume.txt",
            "",
            "For the latest PDF version, please contact:",
            "📧 tijo1293@gmail.com",
            "💼 linkedin.com/in/tijo-j-thomaz93"
          ];
        } catch (error) {
          output = ["❌ Error downloading resume. Please contact tijo1293@gmail.com"];
        }
        break;
      case "git-log":
      case "git log":
        output = portfolioData["git-log"];
        break;
      case "vim-skills":
      case "vim skills.json":
        output = [
          "📝 Interactive Skills Explorer",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "",
          "🎯 CORE EXPERTISE",
          "  ├── TypeScript      ████████████████████ 95%",
          "  ├── Angular         ████████████████████ 90%",
          "  ├── React           ███████████████████  85%",
          "  └── JavaScript      ████████████████████ 95%",
          "",
          "⚡ BACKEND & CLOUD",
          "  ├── Go              ████████████████     80%",
          "  ├── Node.js         ███████████████      75%",
          "  └── AWS             ████████████████     80%",
          "",
          "🧪 TESTING & TOOLS",
          "  ├── Jest/Cypress    ████████████████     80%",
          "  ├── Git             ████████████████████ 95%",
          "  └── VS Code         ████████████████████ 90%",
          "",
          "💡 STATE MANAGEMENT",
          "  ├── NgRx            ███████████████████  85%",
          "  ├── Redux           ████████████████     80%",
          "  └── RxJS            ███████████████████  90%",
          "",
          ":wq to exit vim mode 😉"
        ];
        break;
      
      case 'world':
      case '3d':
        output = [
          "🌍 INTERACTIVE PORTFOLIO WORLDS AVAILABLE:",
          "",
          "Available Interactive Experiences:",
          "  • explore experience  - Enhanced career timeline",
          "  • explore projects    - Detailed project showcase", 
          "  • explore skills      - Technology expertise display",
          "  • explore clients     - Client success gallery",
          "",
          "Usage: explore <world-name>",
          "Example: explore experience",
          "",
          "🎮 Interactive exploration with detailed insights",
          "🤖 AI companion available via left drawer chat",
          "⌨️  Press ESC anytime to return to terminal"
        ];
        break;
        
      case 'explore':
        if (args.length === 0) {
          output = [
            "Please specify which world to explore:",
            "",
            "Available worlds:",
            "  • experience - Enhanced career journey",
            "  • projects   - Interactive project showcase", 
            "  • skills     - Technology expertise visualization",
            "  • clients    - Client success gallery",
            "",
            "Usage: explore <world-name>",
            "Example: explore experience"
          ];
        } else {
          const worldName = args.join(' ').trim(); // Get all arguments as world name
          const validWorlds = ['experience', 'projects', 'skills', 'clients'];
          
          if (validWorlds.includes(worldName)) {
            output = [
              `🚀 Launching ${worldName.toUpperCase()} World...`,
              "",
              "Initializing immersive environment...",
              "Loading interactive portfolio...",
              "Preparing enhanced experience...",
              "",
              "🖱️  Click items to interact",
              "🎯  Navigate between worlds", 
              "⌨️  Press ESC to return to terminal",
              "",
              `Welcome to the ${worldName} universe! 🌟`
            ];
            
            // Trigger 3D world after a short delay - using fallback for now
            setTimeout(() => {
              if (onNavigateToWorld) {
                onNavigateToWorld(worldName);
              }
              if (onEnter3DWorld) {
                onEnter3DWorld(worldName);
              }
            }, 1500);
          } else {
            output = [
              `Unknown world: ${worldName}`,
              "",
              "Available worlds:",
              "  • experience",
              "  • projects", 
              "  • skills",
              "  • clients",
              "",
              "Usage: explore <world-name>"
            ];
            isError = true;
          }
        }
        break;
        
      default:
        if (baseCommand === 'cd') {
          const dir = args.join(' ').trim() || '~';
          if (dir === '~' || dir === '/home/tijo') {
            setCurrentDirectory('~');
            output = [];
          } else if (dir === '..') {
            setCurrentDirectory('~');
            output = [];
          } else {
            output = [`cd: ${dir}: No such directory`];
            isError = true;
          }
        } else {
          // Auto-suggestion for similar commands
          const suggestions = availableCommands.filter(cmd => 
            cmd.includes(baseCommand) || baseCommand.includes(cmd.substring(0, 3))
          ).slice(0, 3);
          
          output = [
            `Command not found: ${cmd}`,
            suggestions.length > 0 ? `Did you mean: ${suggestions.join(', ')}?` : '',
            "Type 'help' for available commands."
          ].filter(Boolean);
          isError = true;
        }
    }

    const newCommand: Command = {
      input: cmd,
      output: output,
      timestamp: new Date()
    };

    setHistory(prev => [...prev, newCommand]);
    
    // Add to command history if not empty and not duplicate
    if (cmd.trim() && commandHistory[commandHistory.length - 1] !== cmd.trim()) {
      if (onAddToCommandHistory) {
        onAddToCommandHistory(cmd.trim());
      } else {
        setLocalCommandHistory(prev => [...prev, cmd.trim()]);
      }
    }
    setHistoryIndex(-1);

    // Play appropriate sound
    if (isError) {
      soundManager.enableWithUserInteraction().then(() => soundManager.playError());
    } else {
      soundManager.enableWithUserInteraction().then(() => soundManager.playCommand());
    }

    // Track command analytics (anonymous)
    trackCommand(cmd.trim());
  }, [commandHistory, currentDirectory, onEnter3DWorld, onJourneyProgress, onNavigateToWorld, onAddToCommandHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Only track activity if not auto-typing (to avoid canceling demo)
      if (!isAutoTyping) {
        // Use appropriate activity handler based on demo mode
        if (demoMode && onTutorialActivity) {
          onTutorialActivity();
        } else if (!demoMode && onUserActivity) {
          onUserActivity();
        }
      }
      executeCommand(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't track activity during auto-typing to prevent canceling demo
    if (!isAutoTyping) {
      // Special handling for arrow keys - always use tutorial activity to prevent demo cancellation
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        // Always use tutorial activity for arrow keys to prevent demo cancellation
        if (onTutorialActivity) {
          onTutorialActivity();
        }
      } else {
        // For other keys, use normal activity tracking
        if (demoMode && onTutorialActivity) {
          onTutorialActivity();
        } else if (!demoMode && onUserActivity) {
          onUserActivity();
        }
      }
    }
    
    // Enable audio on first interaction and play keypress sound
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
      soundManager.enableWithUserInteraction().then(() => {
        soundManager.playKeypress();
      });
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Auto-complete
      const currentInput = input.toLowerCase();
      const matches = availableCommands.filter(cmd => cmd.startsWith(currentInput));
      if (matches.length === 1) {
        setInput(matches[0]);
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus();
  }, []);

  // Tutorial effects handled by TutorialManager
  useEffect(() => {
    if (tutorialManager) {
      // No additional setup needed - manager handles everything
      console.log("[Tutorial] Tutorial manager connected to terminal");
    }
  }, [tutorialManager]);

  // Expose executeCommand method to parent
  useImperativeHandle(ref, () => ({
    executeCommand
  }));

  // Responsive ASCII art based on screen size
  const getWelcomeMessage = useCallback(() => {
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    const isMediumScreen = typeof window !== 'undefined' && window.innerWidth < 1024;
    
    if (isSmallScreen) {
      return [
        "Welcome to tijothomas.dev",
        `Portfolio Terminal v${CURRENT_VERSION}`,
        "",
        "┌─────────────────────────────────┐",
        "│         TIJO THOMAS             │",
        "│    Senior Frontend Engineer     │",
        "│        Manchester, UK           │",
        "└─────────────────────────────────┘",
        "",
        "💡 Interactive terminal features!",
        "",
        "🚀 Quick Start:",
        "  • 'help' - show commands",
        "  • ↑/↓ - command history",
        "  • 'resume' - download CV",
        "  • 'contact' - get in touch",
      ];
    } else if (isMediumScreen) {
      return [
        `Welcome to tijothomas.dev - Portfolio Terminal v${CURRENT_VERSION}`,
        "",
        "████████╗██╗     ██╗ ██████╗ ",
        "╚══██╔══╝██║     ██║██╔═══██╗",
        "   ██║   ██║     ██║██║   ██║",
        "   ██║   ██║██   ██║██║   ██║",
        "   ██║   ██║╚█████╔╝╚██████╔╝",
        "   ╚═╝   ╚═╝ ╚════╝  ╚═════╝ ",
        "",
        "████████╗██╗  ██╗ ██████╗ ███╗   ███╗ █████╗ ███████╗",
        "╚══██╔══╝██║  ██║██╔═══██╗████╗ ████║██╔══██╗██╔════╝",
        "   ██║   ███████║██║   ██║██╔████╔██║███████║███████╗",
        "   ██║   ██╔══██║██║   ██║██║╚██╔╝██║██╔══██║╚════██║",
        "   ██║   ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║███████║",
        "   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝",
        "",
        "Senior Frontend Engineer | 8+ Years Experience | Manchester, UK",
        "💡 Enhanced with command history, auto-complete, and interactive features!",
        "",
        "🚀 Quick Start:",
        "  • Type 'help' to see all available commands",
        "  • Use ↑/↓ arrows to navigate command history",
        "  • Try 'resume' to download my CV",
      ];
    } else {
      return [
        `Welcome to tijothomas.dev - Portfolio Terminal v${CURRENT_VERSION}`,
        "",
        "████████╗██╗     ██╗ ██████╗     ████████╗██╗  ██╗ ██████╗ ███╗   ███╗ █████╗ ███████╗",
        "╚══██╔══╝██║     ██║██╔═══██╗    ╚══██╔══╝██║  ██║██╔═══██╗████╗ ████║██╔══██╗██╔════╝",
        "   ██║   ██║     ██║██║   ██║       ██║   ███████║██║   ██║██╔████╔██║███████║███████╗",
        "   ██║   ██║██   ██║██║   ██║       ██║   ██╔══██║██║   ██║██║╚██╔╝██║██╔══██║╚════██║",
        "   ██║   ██║╚█████╔╝╚██████╔╝       ██║   ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║███████║",
        "   ╚═╝   ╚═╝ ╚════╝  ╚═════╝        ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝",
        "",
        "Senior Frontend Engineer | 8+ Years Experience | Manchester, UK",
        "💡 Enhanced with command history, auto-complete, and interactive features!",
        "",
        "🚀 Quick Start:",
        "  • Type 'help' to see all available commands",
        "  • Use ↑/↓ arrows to navigate command history",
        "  • Try 'resume' to download my CV",
      ];
    }
  }, []);

  useEffect(() => {
    // Initial welcome message with responsive ASCII art
    const welcomeCommand: Command = {
      input: "",
      output: getWelcomeMessage().concat([
        "  • Use the AI chat assistant for interactive help →",
        "",
        "Connect with me for exciting opportunities and collaborations!",
        ""
      ]),
      timestamp: new Date()
    };
    setHistory([welcomeCommand]);

    // Add resize listener to update ASCII art
    const handleResize = () => {
      const newWelcomeCommand: Command = {
        input: "",
        output: getWelcomeMessage().concat([
          "  • Use the AI chat assistant for interactive help →",
          "",
          "Connect with me for exciting opportunities and collaborations!",
          ""
        ]),
        timestamp: new Date()
      };
      setHistory([newWelcomeCommand]);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getWelcomeMessage]);

  return (
    <Card 
      className="h-full flex flex-col terminal-container border transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--theme-card)', 
        borderColor: 'var(--theme-border)' 
      }}
      role="application"
      aria-label="Interactive terminal interface"
    >
      <CardHeader 
        className="py-1.5 px-3 flex-shrink-0 border-b transition-colors duration-300"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          <span 
            className="font-mono zoom-text-xs ml-2 truncate"
            style={{ color: 'var(--theme-accent)' }}
          >
            tijo@tijothomas.dev:{currentDirectory}$
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
        <div 
          ref={terminalRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-gray-800 min-h-0"
          role="log"
          aria-live="polite"
          aria-label="Terminal output history"
        >
          {history.map((command, index) => (
            <div key={index} className="mb-2">
              {command.input && (
                <div className="flex">
                  <span style={{ color: 'var(--theme-accent)' }}>$</span>
                  <span className="ml-2" style={{ color: 'var(--theme-text)' }}>{command.input}</span>
                </div>
              )}
              {command.output.map((line, lineIndex) => (
                <div 
                  key={lineIndex} 
                  className="whitespace-pre-wrap zoom-text-xs break-words"
                  style={{ color: 'var(--theme-secondary)' }}
                >
                  {line}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Input form - Fixed at bottom */}
        <form 
          onSubmit={handleSubmit} 
          className="flex items-center mt-2 pt-2 border-t flex-shrink-0 transition-colors duration-300"
          style={{ borderColor: 'var(--theme-muted)' }}
        >
          <span className="zoom-text-xs" style={{ color: 'var(--theme-accent)' }}>$</span>
          
          {/* Mobile command history buttons */}
          <div className="flex items-center gap-1 mr-2 sm:hidden">
            <button
              type="button"
              onClick={() => {
                if (commandHistory.length > 0) {
                  const newIndex = historyIndex === -1 
                    ? commandHistory.length - 1 
                    : Math.max(0, historyIndex - 1);
                  setHistoryIndex(newIndex);
                  setInput(commandHistory[newIndex] || '');
                  
                  // Use tutorial activity to prevent demo cancellation
                  if (onTutorialActivity) {
                    onTutorialActivity();
                  }
                }
              }}
              disabled={commandHistory.length === 0 || isAutoTyping}
              className="p-1 rounded text-xs opacity-70 hover:opacity-100 transition-opacity disabled:opacity-30"
              style={{ color: 'var(--theme-accent)' }}
              aria-label="Previous command"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => {
                if (historyIndex > -1) {
                  const newIndex = historyIndex + 1;
                  if (newIndex >= commandHistory.length) {
                    setHistoryIndex(-1);
                    setInput('');
                  } else {
                    setHistoryIndex(newIndex);
                    setInput(commandHistory[newIndex]);
                  }
                  
                  // Use tutorial activity to prevent demo cancellation
                  if (onTutorialActivity) {
                    onTutorialActivity();
                  }
                }
              }}
              disabled={historyIndex === -1 || isAutoTyping}
              className="p-1 rounded text-xs opacity-70 hover:opacity-100 transition-opacity disabled:opacity-30"
              style={{ color: 'var(--theme-accent)' }}
              aria-label="Next command"
            >
              ↓
            </button>
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={terminalInput || input}
            onChange={(e) => {
              // Always allow input changes, but handle activity differently
              setInput(e.target.value);
              
              if (!isAutoTyping) {
                // Use appropriate activity handler based on demo mode
                if (demoMode && onTutorialActivity) {
                  onTutorialActivity();
                } else if (!demoMode && onUserActivity) {
                  onUserActivity();
                }
              }
            }}
            onKeyDown={handleKeyDown}
            className="ml-2 bg-transparent outline-none flex-1 font-mono terminal-cursor zoom-text-xs focus:outline-none"
            style={{ color: 'var(--theme-text)' }}
            placeholder={isAutoTyping ? "Auto-typing..." : "Enter command..."}
            aria-label="Terminal command input. Use arrow keys for history, tab for autocomplete, type 'help' for commands"
            aria-describedby="terminal-help"
            data-auto-typing={isAutoTyping}
            readOnly={isAutoTyping}
            autoFocus={typeof window !== 'undefined' && window.innerWidth >= 768}
          />
        </form>
        

        
        {/* Hidden help text for screen readers */}
        <div id="terminal-help" className="sr-only">
          Interactive terminal. Use arrow keys to navigate command history, tab for autocomplete, 
          and enter to execute commands. Type 'help' to see available commands.
        </div>
      </CardContent>
    </Card>
  );
});

Terminal.displayName = "Terminal";

export default Terminal;
