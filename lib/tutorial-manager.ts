export interface TutorialStep {
  command: string;
  delay: number;
  message: string;
  tip: string;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    command: "help",
    delay: 2500,
    message: "👋 Welcome to my interactive portfolio! Let me show you how to navigate...",
    tip: "💡 Tip: Type 'help' anytime to see all available commands",
  },
  {
    command: "ls",
    delay: 3000,
    message: "📁 These are the main sections available. Let's explore each one...",
    tip: "💡 Try: Use arrow keys ↑↓ to browse your command history",
  },
  {
    command: "experience",
    delay: 4000,
    message: "🏢 Here's my professional journey. Notice the interactive timeline!",
    tip: "💡 Click on any job to see detailed information",
  },
  {
    command: "skills",
    delay: 3500,
    message: "⚛️ My technical expertise organized by category and proficiency",
    tip: "💡 Try: Type 'vim-skills' for an interactive skill visualization",
  },
  {
    command: "projects",
    delay: 4000,
    message: "🚀 Key projects and achievements with live demos",
    tip: "💡 Use 'projects-demo' to access direct project links",
  },
  {
    command: "git-log",
    delay: 3000,
    message: "📜 A simulated git history showing my development journey",
    tip: "💡 Real terminal commands work here: try 'pwd', 'whoami', 'date'",
  },
  {
    command: "contact",
    delay: 2500,
    message: "📧 Multiple ways to connect - email, LinkedIn, or WhatsApp",
    tip: "💡 The AI assistant (chat bubble) can answer questions anytime!",
  },
  {
    command: "explore experience",
    delay: 3000,
    message: "🌟 Now for the real journey! This launches an immersive exploration...",
    tip: "💡 Journey Progress: Use 'explore <section>' to unlock portfolio sections and track your exploration progress!",
  },
  {
    command: "clear",
    delay: 2000,
    message: "✨ Tutorial complete! Start exploring on your own. Type 'help' for guidance.",
    tip: "💡 Pro tip: Use Tab for autocomplete, themes in top-right, zoom controls available",
  },
];

export class TutorialManager {
  private currentStep = 0;
  private isRunning = false;
  private isTyping = false;
  private timeouts: NodeJS.Timeout[] = [];
  private intervals: NodeJS.Timeout[] = [];
  
  constructor(
    private onTypeStart: () => void,
    private onTypeComplete: () => void,
    private onInputChange: (value: string) => void,
    private onExecuteCommand: (command: string) => void,
    private onStepComplete: (step: number) => void,
    private onTutorialComplete: () => void
  ) {}

  start() {
    console.log("[Tutorial] Starting tutorial");
    this.isRunning = true;
    this.currentStep = 0;
    this.executeStep();
  }

  stop() {
    console.log("[Tutorial] Stopping tutorial");
    this.isRunning = false;
    this.isTyping = false;
    this.currentStep = 0;
    this.clearAllTimeouts();
    this.onTypeComplete();
  }

  private clearAllTimeouts() {
    this.timeouts.forEach(clearTimeout);
    this.intervals.forEach(clearInterval);
    this.timeouts = [];
    this.intervals = [];
  }

  private executeStep() {
    if (!this.isRunning || this.currentStep >= TUTORIAL_STEPS.length) {
      console.log("[Tutorial] Tutorial completed or stopped");
      this.onTutorialComplete();
      return;
    }

    const step = TUTORIAL_STEPS[this.currentStep];
    console.log(`[Tutorial] Executing step ${this.currentStep + 1}: "${step.command}"`);

    // Notify step completion for UI updates
    this.onStepComplete(this.currentStep);

    // Wait for the delay, then start typing
    const delayTimeout = setTimeout(() => {
      if (!this.isRunning) return;
      this.typeCommand(step.command);
    }, step.delay);

    this.timeouts.push(delayTimeout);
  }

  private typeCommand(command: string) {
    if (!this.isRunning) return;

    console.log(`[Tutorial] Starting to type: "${command}"`);
    this.isTyping = true;
    this.onTypeStart();

    // Clear input first
    this.onInputChange('');

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(typeInterval);
        return;
      }

      if (charIndex < command.length) {
        this.onInputChange(command.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        this.finishTyping(command);
      }
    }, 100);

    this.intervals.push(typeInterval);
  }

  private finishTyping(command: string) {
    if (!this.isRunning) return;

    console.log(`[Tutorial] Finished typing: "${command}"`);
    this.isTyping = false;
    this.onTypeComplete();

    // Execute the command after a brief pause
    const executeTimeout = setTimeout(() => {
      if (!this.isRunning) return;
      
      console.log(`[Tutorial] Executing command: "${command}"`);
      this.onExecuteCommand(command);
      
      // Clear input and move to next step
      this.onInputChange('');
      this.currentStep++;
      
      // Continue to next step after execution pause
      const nextStepTimeout = setTimeout(() => {
        if (!this.isRunning) return;
        this.executeStep();
      }, 1000);
      
      this.timeouts.push(nextStepTimeout);
    }, 800);

    this.timeouts.push(executeTimeout);
  }

  getCurrentStep() {
    return this.currentStep;
  }

  isActive() {
    return this.isRunning;
  }

  isCurrentlyTyping() {
    return this.isTyping;
  }

  getTotalSteps() {
    return TUTORIAL_STEPS.length;
  }

  getCurrentStepData() {
    return TUTORIAL_STEPS[this.currentStep] || null;
  }
}
