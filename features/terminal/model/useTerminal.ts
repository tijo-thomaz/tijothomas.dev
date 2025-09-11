import { useState, useCallback, useRef, useReducer } from 'react';
import { storage, generateId } from '../../../shared/lib/utils';

export interface TerminalState {
  input: string;
  history: string[];
  output: TerminalOutput[];
  isProcessing: boolean;
  currentPath: string;
}

export interface TerminalOutput {
  id: string;
  command: string;
  result: string;
  timestamp: Date;
  type: 'command' | 'error' | 'info' | 'success';
}

type TerminalAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'ADD_OUTPUT'; payload: Omit<TerminalOutput, 'id' | 'timestamp'> }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'CLEAR_OUTPUT' }
  | { type: 'SET_PATH'; payload: string };

// Welcome message function
const getWelcomeMessage = (): string[] => {
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth < 768;
  const isMediumScreen = typeof window !== "undefined" && window.innerWidth < 1024;

  if (isSmallScreen) {
    return [
      "Welcome to tijothomas.dev",
      "Portfolio Terminal v1.0",
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
      "Welcome to tijothomas.dev - Portfolio Terminal v1.0",
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
      "Senior Frontend Engineer | 4+ Years Experience | Manchester, UK",
      "🛡️ Featuring PromptShield - My flagship AI safety project",
      "",
      "🚀 Quick Start:",
      "  • 'help' - Show all available commands",
      "  • 'about' - Learn more about me",
      "  • 'skills' - View technical expertise", 
      "  • 'experience' - Professional background",
      "  • 'projects' - Portfolio showcase",
      "  • 'promptshield' - My flagship AI project",
      "  • 'contact' - Get in touch",
      "  • AI assistant chat available via floating button →",
      "",
      "Connect with me for exciting opportunities and collaborations!",
    ];
  } else {
    return [
      `Welcome to tijothomas.dev - Interactive Portfolio Terminal v1.0`,
      "",
      "████████╗██╗     ██╗ ██████╗     ████████╗██╗  ██╗ ██████╗ ███╗   ███╗ █████╗ ███████╗",
      "╚══██╔══╝██║     ██║██╔═══██╗    ╚══██╔══╝██║  ██║██╔═══██╗████╗ ████║██╔══██╗██╔════╝",
      "   ██║   ██║     ██║██║   ██║       ██║   ███████║██║   ██║██╔████╔██║███████║███████╗",
      "   ██║   ██║██   ██║██║   ██║       ██║   ██╔══██║██║   ██║██║╚██╔╝██║██╔══██║╚════██║",
      "   ██║   ██║╚█████╔╝╚██████╔╝       ██║   ██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║███████║",
      "   ╚═╝   ╚═╝ ╚════╝  ╚═════╝        ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝",
      "",
      "                     Senior Frontend Engineer | Manchester, UK | 4+ Years Experience",
      "",
      "🛡️ FLAGSHIP PROJECT: PromptShield - AI Safety Platform | https://promptshield.vercel.app/",
      "    🎯 Production-ready AI safety solution with 2.1k+ users",
      "    🔧 Next.js 14, TypeScript, OpenAI API, Advanced ML Algorithms", 
      "    📊 Featured in AI safety discussions and security conferences",
      "",
      "💡 Enhanced with command history, auto-complete, and interactive features!",
      "",
      "🚀 Quick Start Commands:",
      "  • 'help' - Show all available commands        • 'skills' - View technical expertise", 
      "  • 'about' - Learn more about me               • 'experience' - Professional timeline",
      "  • 'projects' - Portfolio showcase             • 'promptshield' - Flagship AI project",
      "  • 'contact' - Get in touch                    • AI assistant available via chat →",
      "",
      "Connect with me for exciting opportunities and collaborations!",
    ];
  }
};

const initialState: TerminalState = {
  input: '',
  history: storage.get('terminal-history', []),
  output: [{
    id: 'welcome',
    command: '',
    result: getWelcomeMessage().join('\n'),
    timestamp: new Date(),
    type: 'info',
  }],
  isProcessing: false,
  currentPath: '~',
};

function terminalReducer(state: TerminalState, action: TerminalAction): TerminalState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.payload };
      
    case 'ADD_OUTPUT':
      const newOutput: TerminalOutput = {
        ...action.payload,
        id: generateId('output'),
        timestamp: new Date(),
      };
      return { ...state, output: [...state.output, newOutput] };
      
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
      
    case 'CLEAR_OUTPUT':
      return { ...state, output: [] };
      
    case 'SET_PATH':
      return { ...state, currentPath: action.payload };
      
    default:
      return state;
  }
}

interface UseTerminalProps {
  onNavigateToWorld?: (world: string) => void;
  onEnter3DWorld?: (world: string) => void;
  onJourneyProgress?: (section: string) => void;
  onAddToCommandHistory?: (command: string) => void;
}

/**
 * Terminal Hook - Core terminal functionality
 * Manages command execution, history, and state
 */
export function useTerminal(props?: UseTerminalProps) {
  const [state, dispatch] = useReducer(terminalReducer, initialState);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const setInput = useCallback((value: string) => {
    dispatch({ type: 'SET_INPUT', payload: value });
  }, []);

  const addOutput = useCallback((output: Omit<TerminalOutput, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_OUTPUT', payload: output });
  }, []);

  const setProcessing = useCallback((processing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: processing });
  }, []);

  const clearOutput = useCallback(() => {
    dispatch({ type: 'CLEAR_OUTPUT' });
  }, []);

  const executeCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    setProcessing(true);
    
    // Add command to history
    const newHistory = [...state.history.filter(h => h !== command), command];
    storage.set('terminal-history', newHistory.slice(-50)); // Keep last 50 commands
    
    // Call external command history handler
    props?.onAddToCommandHistory?.(command);

    try {
      // Process command with callbacks
      const result = await processCommand(command.trim(), {
        onNavigateToWorld: props?.onNavigateToWorld,
        onEnter3DWorld: props?.onEnter3DWorld,
        onJourneyProgress: props?.onJourneyProgress,
      });
      
      // Add single command output entry
      addOutput({
        command,
        result: result.output,
        type: result.type,
      });
      
      if (result.path) {
        dispatch({ type: 'SET_PATH', payload: result.path });
      }
    } catch (error) {
      addOutput({
        command,
        result: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setProcessing(false);
      setInput('');
      setHistoryIndex(-1);
    }
  }, [state.history, addOutput, setInput, props]);

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    const history = state.history;
    if (history.length === 0) return;

    let newIndex = historyIndex;
    
    if (direction === 'up') {
      newIndex = Math.min(newIndex + 1, history.length - 1);
    } else {
      newIndex = Math.max(newIndex - 1, -1);
    }
    
    setHistoryIndex(newIndex);
    
    if (newIndex === -1) {
      setInput('');
    } else {
      setInput(history[history.length - 1 - newIndex]);
    }
  }, [state.history, historyIndex, setInput]);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const getAutoCompleteOptions = useCallback((input: string) => {
    const commands = [
      'help', 'about', 'skills', 'experience', 'projects', 'contact',
      'clear', 'ls', 'pwd', 'cd', 'cat', 'echo', 'whoami', 'date',
      'explore', 'world', '3d', 'promptshield', 'ai-help'
    ];
    
    return commands.filter(cmd => 
      cmd.toLowerCase().startsWith(input.toLowerCase())
    );
  }, []);

  return {
    state,
    inputRef,
    setInput,
    executeCommand,
    navigateHistory,
    focusInput,
    clearOutput,
    getAutoCompleteOptions,
  };
}

// Import command processors
const processCommands = {
  help: () => ({
    output: `Available commands:
• help - Show this help message  
• about - Learn about Tijo Thomas
• skills - View technical skills
• experience - View work experience  
• projects - View portfolio projects
• contact - Get contact information
• promptshield - Learn about PromptShield (flagship AI project)
• resume - Download PDF resume
• git-log - View commit history
• vim-skills - Interactive skills visualization
• projects-demo - Direct project links
• world/3d - Explore interactive portfolio
• explore <world> - Enter specific world
• clear - Clear terminal output
• ls - List directory contents
• pwd - Show current directory  
• cd [dir] - Change directory
• cat [file] - Display file contents
• echo [text] - Display text
• whoami - Show current user
• date - Show current date and time
• ai-help [query] - Ask AI assistant for help`,
    type: 'info' as const,
  }),

  about: () => ({
    output: `👋 Hi! I'm Tijo Thomas
🎯 Senior Frontend Engineer from Manchester, UK
💻 Specialized in React, TypeScript, and modern web technologies
🚀 Founder of PromptShield - My flagship AI safety project (https://promptshield.vercel.app/)
📧 tijo1293@gmail.com | 🔗 LinkedIn: /in/tijo-thomas-6bb0791a5/

I build scalable web applications with focus on performance, user experience, and clean architecture. My flagship project PromptShield showcases my expertise in AI safety and responsible technology development.`,
    type: 'success' as const,
  }),

  skills: () => ({
    output: `🛠️ TECHNICAL SKILLS:

Frontend Technologies:
  ├── React              ████████████████████ 100%
  ├── TypeScript         ████████████████████ 95%
  ├── Next.js            ███████████████████  90%
  ├── JavaScript (ES6+)  ████████████████████ 100%
  ├── HTML5/CSS3         ████████████████████ 100%
  ├── Tailwind CSS       ███████████████████  90%
  └── Sass/SCSS          ████████████████     80%

Backend & Database:
  ├── Node.js            ██████████████████   85%
  ├── Express.js         ████████████████     80%
  ├── PostgreSQL         ███████████████      75%
  ├── MongoDB            ██████████████       70%
  ├── Supabase           ████████████████████ 90%
  └── GraphQL            ██████████████       70%

Development Tools:
  ├── Git/GitHub         ████████████████████ 100%
  ├── VS Code            ████████████████████ 100%
  ├── Docker             ███████████████      75%
  ├── Webpack/Vite       ████████████████     80%
  ├── Jest/Testing       ████████████████     80%
  └── CI/CD              ██████████████       70%

Cloud & Deployment:
  ├── Vercel             ████████████████████ 95%
  ├── AWS                ██████████████       70%
  ├── Firebase           ███████████████      75%
  └── Netlify            ████████████████     80%

Try 'vim-skills' for interactive visualization!`,
    type: 'success' as const,
  }),

  'vim-skills': () => ({
    output: `🎯 VIM-STYLE SKILLS INTERFACE:

:set syntax=typescript
:highlight ReactJS ctermfg=cyan
:highlight NextJS ctermfg=magenta  
:highlight PromptShield ctermfg=red

────────────────────────────────────────────
:e frontend_skills.js
  ├── React            ███████████████████  95%
  ├── TypeScript       ████████████████████ 100%
  ├── Next.js          ███████████████████  90%
  ├── Tailwind CSS     ████████████████     80%
  └── JavaScript       ████████████████████ 100%

:e backend_skills.js
  ├── Node.js          ████████████████     80%
  ├── Express.js       ███████████████      75%
  ├── PostgreSQL       ██████████████       70%
  └── Supabase         ████████████████████ 95%

:e state_management.js  
  ├── Redux            ███████████████      75%
  ├── Zustand          ████████████████████ 90%
  ├── Context API      ████████████████████ 95%
  └── React Query      ███████████████████  85%

:wq to exit vim mode 😉`,
    type: 'success' as const,
  }),

  experience: () => ({
    output: `💼 PROFESSIONAL EXPERIENCE:

┌─ Senior Frontend Engineer - Current
│  🏢 Freelance & Contract Work (2022 - Present)
│  🎯 Focus: React, TypeScript, Next.js applications
│  💡 Notable: PromptShield AI safety platform
│
├─ Frontend Developer - 2+ years
│  🏢 Various UK Companies (2020 - 2022)
│  🎯 Built responsive web applications
│  💡 Enhanced user experience and performance
│
└─ Full Stack Developer - 1+ years
   🏢 Early Career (2019 - 2020)
   🎯 JavaScript, Node.js, database integration
   💡 End-to-end application development

🚀 CURRENT PROJECTS:
  • PromptShield - AI Safety Platform (https://promptshield.vercel.app/)
  • Interactive Portfolio Terminal (This!)
  • Client React/Next.js Applications

📈 EXPERTISE GROWTH:
  React ████████████████████ 4+ years
  TypeScript ██████████████ 3+ years  
  Next.js ████████████████ 2+ years
  AI Integration ████████ 1+ years

Type 'explore experience' for interactive timeline!`,
    type: 'success' as const,
  }),

  projects: () => ({
    output: `🚀 FEATURED PROJECTS:

┌─ 🛡️ PromptShield - AI Safety Platform ⭐ FLAGSHIP
│  🔗 https://promptshield.vercel.app/
│  🛠️ Next.js 14, TypeScript, OpenAI API, TailwindCSS
│  💡 Detects prompt injection attacks, toxicity filtering
│  📊 Status: Production Ready v2.1
│  🎯 Featured in AI safety discussions
│
├─ 🖥️ Interactive Portfolio Terminal
│  🛠️ Next.js 14, React, TypeScript, Three.js
│  💡 Terminal-style portfolio with 3D experiences
│  🎮 Tutorial system, AI assistant, analytics
│  🎯 You're using it right now!
│
├─ 📊 Client Dashboard Applications
│  🛠️ React, Next.js, PostgreSQL, Supabase
│  💡 Real-time data visualization dashboards
│  🎯 Multiple successful client deployments
│
└─ 🔧 Open Source Contributions
   🛠️ React ecosystem, TypeScript utilities
   💡 Community-driven development tools
   🎯 Active GitHub contributor

💎 TECHNICAL HIGHLIGHTS:
  • Modern React patterns (Hooks, Context, Suspense)
  • TypeScript best practices and type safety
  • Performance optimization and code splitting
  • Responsive design and accessibility
  • AI/ML integration and safety protocols

Type 'projects-demo' for direct links!
Type 'explore projects' for interactive showcase!`,
    type: 'success' as const,
  }),

  'projects-demo': () => ({
    output: `🔗 DIRECT PROJECT LINKS:

🛡️ PromptShield AI Safety Platform
   → https://promptshield.vercel.app/
   📱 Live Demo | 🛡️ AI Safety | ⚡ Next.js 14

🖥️ Interactive Portfolio Terminal  
   → https://tijothomas.dev/
   📱 Live Terminal | 🎮 Interactive | 🤖 AI Assistant

📊 GitHub Portfolio
   → https://github.com/tijo-thomaz
   📦 Repositories | 🔧 Open Source | 📈 Contributions

🔗 LinkedIn Professional Profile
   → https://linkedin.com/in/tijo-thomas-6bb0791a5/
   💼 Experience | 🤝 Network | 📄 Credentials

📧 CONTACT FOR PROJECT DEMOS:
   Email: tijo1293@gmail.com
   Subject: "Project Demo Request"
   
   I'm happy to walk through any project in detail!`,
    type: 'success' as const,
  }),

  contact: () => ({
    output: `📧 GET IN TOUCH:

Primary Contact:
  📧 Email: tijo1293@gmail.com
  🔗 LinkedIn: /in/tijo-thomas-6bb0791a5/
  💬 WhatsApp: Available on request

Professional Profiles:
  🐙 GitHub: github.com/tijo-thomaz
  🌐 Portfolio: tijothomas.dev
  🛡️ PromptShield: promptshield.vercel.app

📍 Location: Manchester, UK
🕒 Timezone: GMT/BST
💼 Status: Open to opportunities

💡 BEST WAYS TO REACH ME:
  1. Email - Fastest response (usually within 24h)
  2. LinkedIn - Professional discussions
  3. WhatsApp - For urgent matters

📋 WHEN CONTACTING:
  ✅ Project requirements and timeline
  ✅ Technology preferences
  ✅ Budget considerations
  ✅ Team size and collaboration style

Let's build something amazing together! 🚀`,
    type: 'success' as const,
  }),

  resume: () => ({
    output: `📄 RESUME DOWNLOAD:

Preparing PDF resume...
📋 Including: Experience, skills, projects, contact info
🛡️ PromptShield project highlighted
📊 Interactive portfolio metrics included

📥 Download will start shortly...

Note: This is a demo terminal - actual PDF generation 
would be implemented with libraries like:
  • jsPDF for client-side generation
  • Puppeteer for server-side rendering  
  • React-PDF for component-based PDFs

For real resume: Contact tijo1293@gmail.com`,
    type: 'info' as const,
  }),

  'git-log': () => ({
    output: `🌳 GIT COMMIT HISTORY:

commit f4a2c8d (HEAD -> main, origin/main)
Author: Tijo Thomas <tijo1293@gmail.com>
Date: Sun Jan 7 2024 14:30:22 +0000

    feat: Launch PromptShield AI safety platform
    
    🛡️ Revolutionary AI safety features
    • Prompt injection detection
    • Toxicity filtering algorithms  
    • Real-time response validation
    • Production-ready v2.1

commit b3e7f91
Author: Tijo Thomas <tijo1293@gmail.com>
Date: Fri Dec 15 2023 09:15:44 +0000

    feat: Add interactive portfolio terminal
    
    🖥️ Terminal-style portfolio interface
    • Command-line navigation
    • 3D world experiences
    • AI assistant integration
    • Tutorial system

commit a8d4c32
Author: Tijo Thomas <tijo1293@gmail.com>
Date: Wed Nov 8 2023 16:45:12 +0000

    refactor: Migrate to Next.js 14 architecture
    
    ⚡ Performance and developer experience
    • App router implementation
    • TypeScript strict mode
    • Enhanced build optimization

commit 7c9e5a1
Author: Tijo Thomas <tijo1293@gmail.com>
Date: Mon Oct 23 2023 11:22:33 +0000

    feat: Add responsive design system
    
    📱 Mobile-first approach
    • Tailwind CSS integration
    • Component library setup
    • Accessibility improvements

Type 'git show <commit>' to view specific changes`,
    type: 'info' as const,
  }),

  promptshield: () => ({
    output: `🛡️ PROMPTSHIELD - MY FLAGSHIP AI SAFETY PROJECT

🌟 WHAT IT DOES:
  • Detects and prevents prompt injection attacks
  • Validates AI model responses for safety and accuracy
  • Provides real-time toxicity filtering
  • Implements hallucination detection
  • Ensures responsible AI deployment across applications

🔧 TECHNICAL IMPLEMENTATION:
  • Next.js 14 + TypeScript (Frontend Framework)
  • OpenAI/Groq API integration (LLM Interfaces)
  • TailwindCSS + shadcn/ui (Modern UI/UX)
  • Advanced ML safety algorithms (Core Engine)
  • Real-time processing pipeline (Backend Architecture)

🚀 LIVE PROJECT: https://promptshield.vercel.app/

📊 PROJECT DETAILS:
  • Status: Production Ready (v2.1)
  • Launch Date: January 2024
  • User Base: Growing community of developers
  • Recognition: Featured in AI safety discussions
  • Impact: Protecting AI interactions globally

💡 PROJECT VISION:
  As AI becomes ubiquitous, safety isn't optional—it's essential.
  PromptShield addresses this critical need by providing robust
  safety layers for AI applications across industries.

🎯 ACHIEVEMENTS:
  • Successfully deployed in production environments
  • Positive feedback from security researchers
  • Growing adoption among AI developers
  • Featured in technical conferences and discussions
  
This project demonstrates my expertise in AI safety and 
my commitment to responsible technology development! 🤖✨`,
    type: 'success' as const,
  }),

  world: () => ({
    output: `🌍 INTERACTIVE PORTFOLIO WORLDS AVAILABLE:

Available Interactive Experiences:
  • explore experience  - Enhanced career timeline
  • explore projects    - Detailed project showcase
  • explore skills      - Technology expertise display
  • explore clients     - Client success gallery

Usage: explore <world-name>
Example: explore experience

🎮 Interactive exploration with detailed insights
🤖 AI companion available via left drawer chat
⌨️  Press ESC anytime to return to terminal`,
    type: 'info' as const,
  }),

  '3d': () => processCommands.world(),

  explore: (args: string[]) => {
    if (args.length === 0) {
      return {
        output: `Please specify which world to explore:

Available worlds:
  • experience - Enhanced career journey
  • projects   - Interactive project showcase
  • skills     - Technology expertise visualization
  • clients    - Client success gallery

Usage: explore <world-name>
Example: explore experience`,
        type: 'info' as const,
      };
    } else {
      const worldName = args.join(" ").trim();
      const validWorlds = ["experience", "projects", "skills", "clients"];

      if (validWorlds.includes(worldName)) {
        return {
          output: `🚀 Launching ${worldName.toUpperCase()} World...

Initializing immersive environment...
Loading interactive portfolio...
Preparing enhanced experience...

🖱️  Click items to interact
🎯  Navigate between worlds
⌨️  Press ESC to return to terminal

Welcome to the ${worldName} universe! 🌟`,
          type: 'success' as const,
          action: 'navigate-to-world' as const,
          worldName: worldName,
        };
      } else {
        return {
          output: `Unknown world: ${worldName}

Available worlds:
  • experience
  • projects
  • skills
  • clients

Usage: explore <world-name>`,
          type: 'error' as const,
        };
      }
    }
  },

  // Basic shell commands
  clear: () => ({ output: '', type: 'command' as const }),
  whoami: () => ({ output: 'tijo@portfolio:~$ Senior Frontend Engineer', type: 'info' as const }),
  date: () => ({ output: new Date().toString(), type: 'info' as const }),
  pwd: () => ({ output: '/home/tijo/portfolio', type: 'info' as const }),
  
  ls: () => ({
    output: `drwxr-xr-x  4 tijo tijo  128 Jan  7 12:00 projects/
drwxr-xr-x  2 tijo tijo   64 Jan  7 12:00 skills/
drwxr-xr-x  3 tijo tijo   96 Jan  7 12:00 experience/
-rw-r--r--  1 tijo tijo 1024 Jan  7 12:00 README.md
-rw-r--r--  1 tijo tijo  512 Jan  7 12:00 contact.txt
-rwxr-xr-x  1 tijo tijo 2048 Jan  7 12:00 promptshield*`,
    type: 'info' as const,
  }),
  
  echo: (args: string[]) => ({ output: args.join(' '), type: 'info' as const }),
  
  'ai-help': (args: string[]) => {
    if (args.length === 0) {
      return {
        output: 'Usage: ai-help [your question]\nExample: ai-help What technologies do you work with?',
        type: 'info' as const,
      };
    }
    
    return {
      output: `🤖 AI Assistant (Powered by PromptShield):

Query: "${args.join(' ')}"

I'm Tijo Thomas, a Senior Frontend Engineer from Manchester, UK. I specialize in React, TypeScript, Next.js, and modern web technologies. My flagship project is PromptShield (https://promptshield.vercel.app/) - an AI safety platform that ensures responsible AI deployment.

Feel free to ask about my experience, projects, or how we can work together!`,
      type: 'success' as const,
    };
  },
};

// Enhanced command processor with all original functionality
async function processCommand(
  command: string,
  callbacks?: {
    onNavigateToWorld?: (world: string) => void;
    onEnter3DWorld?: (world: string) => void;
    onJourneyProgress?: (section: string) => void;
  }
): Promise<{
  output: string;
  type: 'command' | 'error' | 'info' | 'success';
  path?: string;
}> {
  const [cmd, ...args] = command.split(' ');
  const baseCommand = cmd.toLowerCase();
  
  // Get processor function
  const processor = processCommands[baseCommand as keyof typeof processCommands];
  
  if (processor) {
    const result = typeof processor === 'function' ? processor(args) : processor;
    
    // Handle special actions
    if ('action' in result && result.action === 'navigate-to-world') {
      const worldName = (result as any).worldName as string;
      
      // Trigger navigation after a delay
      setTimeout(() => {
        callbacks?.onNavigateToWorld?.(worldName);
        callbacks?.onEnter3DWorld?.(worldName);
        callbacks?.onJourneyProgress?.(worldName);
      }, 1500);
    }
    
    return {
      output: result.output,
      type: result.type,
    };
  }
  
  // Handle cd command separately
  if (baseCommand === 'cd') {
    const dir = args.join(' ').trim() || '~';
    if (dir === '~' || dir === '/home/tijo' || dir === '..') {
      return {
        output: '',
        type: 'info',
        path: '~',
      };
    } else {
      return {
        output: `cd: ${dir}: No such file or directory`,
        type: 'error',
      };
    }
  }
  
  // Handle cat command
  if (baseCommand === 'cat') {
    const filename = args.join(' ').trim();
    const files: Record<string, string> = {
      'README.md': `# Tijo Thomas - Senior Frontend Engineer

🛡️ Welcome to my interactive portfolio powered by PromptShield!

## 🚀 Featured Project: PromptShield
https://promptshield.vercel.app/

AI Safety Platform that ensures responsible AI deployment through:
- Prompt injection detection
- Toxicity filtering  
- Response validation
- Real-time safety checks

## 💼 Professional Focus
- React & TypeScript expert
- Next.js application development
- AI integration and safety
- Modern web architecture

## 📧 Contact
Email: tijo1293@gmail.com
LinkedIn: /in/tijo-thomas-6bb0791a5/

Type 'help' for available commands!`,
      
      'contact.txt': `📧 Tijo Thomas - Contact Information

Email: tijo1293@gmail.com
LinkedIn: https://linkedin.com/in/tijo-thomas-6bb0791a5/
GitHub: https://github.com/tijo-thomaz
Portfolio: https://tijothomas.dev
PromptShield: https://promptshield.vercel.app/

Location: Manchester, UK
Timezone: GMT/BST
Status: Available for opportunities

Specializes in:
- React & TypeScript development  
- Next.js applications
- AI safety and integration
- Modern web architecture`,
    };
    
    if (files[filename]) {
      return {
        output: files[filename],
        type: 'info',
      };
    } else {
      return {
        output: `cat: ${filename}: No such file or directory`,
        type: 'error',
      };
    }
  }
  
  // Default: command not found
  return {
    output: `Command not found: ${cmd}\nType 'help' for available commands.`,
    type: 'error',
  };
}
