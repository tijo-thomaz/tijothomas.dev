"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { downloadFile, generatePDFResume } from "@/lib/utils";
import { soundManager } from "@/lib/sounds";
import { analytics } from "@/lib/analytics";

interface Command {
  input: string;
  output: string[];
  timestamp: Date;
}

const Terminal = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Command[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState("~");
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

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
    'vim-skills', 'projects-demo'
  ];

  const executeCommand = useCallback(async (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    if (trimmedCmd === "clear") {
      setHistory([]);
      soundManager.playCommand();
      return;
    }

    let output: string[];
    let isError = false;

    switch (trimmedCmd) {
      case "help":
        output = [
          "Available commands:",
          "",
          "about         - Learn about me",
          "skills        - View my technical skills",
          "projects      - See my recent projects",
          "projects-demo - View live project demos",
          "experience    - View my work experience",
          "contact       - Get my contact information",
          "resume        - Download my resume (PDF)",
          "git-log       - View my recent commits",
          "vim-skills    - Interactive skills explorer",
          "clear         - Clear the terminal",
          "ls            - List directory contents",
          "pwd           - Show current directory",
          "whoami        - Display current user",
          "date          - Show current date and time",
          "",
          "💡 Use ↑/↓ arrows to navigate command history",
          "💡 Try the AI chat assistant on the right for more interactive help!"
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
        output = portfolioData.skills;
        break;
      case "projects":
        output = portfolioData.projects;
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
        output = portfolioData.experience;
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
      default:
        if (trimmedCmd.startsWith('cd ')) {
          const dir = trimmedCmd.substring(3).trim();
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
            cmd.includes(trimmedCmd) || trimmedCmd.includes(cmd.substring(0, 3))
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
      setCommandHistory(prev => [...prev, cmd.trim()]);
    }
    setHistoryIndex(-1);

    // Play appropriate sound
    if (isError) {
      soundManager.playError();
    } else {
      soundManager.playCommand();
    }

    // Track command analytics
    analytics.trackCommand(cmd.trim());
  }, [commandHistory, currentDirectory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Play keypress sound for most keys
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
      soundManager.playKeypress();
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

  // Responsive ASCII art based on screen size
  const getWelcomeMessage = useCallback(() => {
    const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
    const isMediumScreen = typeof window !== 'undefined' && window.innerWidth < 1024;
    
    if (isSmallScreen) {
      return [
        "Welcome to tijothomas.dev",
        "Portfolio Terminal v2.0",
        "",
        "┌─────────────────────────────────┐",
        "│         TIJO THOMAS            │",
        "│    Senior Frontend Engineer   │",
        "│        Manchester, UK          │",
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
        "Welcome to tijothomas.dev - Portfolio Terminal v2.0",
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
        "Welcome to tijothomas.dev - Portfolio Terminal v2.0",
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
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="ml-2 bg-transparent outline-none flex-1 font-mono terminal-cursor zoom-text-xs"
            style={{ color: 'var(--theme-text)' }}
            placeholder="Enter command..."
            autoFocus
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default Terminal;
