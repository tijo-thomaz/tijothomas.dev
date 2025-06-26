"use client"

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { analytics } from "@/lib/analytics";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatAgent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const portfolioContext = {
    name: "Tijo Thomas",
    role: "Senior Frontend Engineer",
    location: "Manchester, UK",
    experience: "8+ years of frontend development experience",
    email: "tijo1293@gmail.com",
    phone: "+44 7818 989060",
    linkedin: "linkedin.com/in/tijo-j-thomaz93",
    
    skills: {
      frontend: ["Angular", "React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Sass"],
      backend: ["Go", "Node.js"],
      stateManagement: ["RxJS", "NgRx", "Redux", "Rematch"],
      testing: ["Jasmine", "Karma", "Jest", "Cypress"],
      cloud: ["AWS Amplify", "Lambda", "DynamoDB", "Cognito", "API Gateway", "S3"],
      tools: ["Git", "VS Code", "Chrome DevTools", "Postman", "Figma"],
      dataViz: ["Highcharts", "Chart.js"]
    },
    
    companies: ["Bet365", "Infosys", "NetObjex", "QBurst Technologies", "Speridian Technologies"],
    
    majorClients: ["Home Depot", "eBay", "Gogo Business Aviation"],
    
    achievements: [
      "Migrated legacy .NET systems to modern TypeScript + Go architecture at Bet365",
      "Led enterprise reporting dashboard development for Home Depot & eBay",
      "Mentored frontend developers and established coding best practices",
      "Built COVID-19 employee onboarding portal during pandemic",
      "Developed cloud-based parking dashboards with AWS stack",
      "Performance improvements of 40% through modern architecture migration"
    ],
    
    currentWork: "Currently working at Bet365 on system modernization and Go backend services",
    
    education: "MCA & BCA from M.G. University, Kottayam, India",
    
    personality: "passionate about frontend engineering, mentoring developers, and building scalable user interfaces",
    
    availability: "Available for senior frontend roles, technical leadership positions, and consulting opportunities"
  };

  const quickReplies = [
    "Tell me about your experience",
    "What technologies do you work with?",
    "How can I contact you?",
    "What's your current role?",
    "Show me your projects"
  ];

  const generateResponse = async (userMessage: string, context: string[]): Promise<string> => {
    // Simulate AI thinking time with more realistic delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1500));

    const lowerMessage = userMessage.toLowerCase();
    const recentContext = context.slice(-3).join(' ').toLowerCase();
    
    // Enhanced context-aware responses
    if (lowerMessage.includes("skill") || lowerMessage.includes("tech") || lowerMessage.includes("stack")) {
      if (recentContext.includes("specific") || lowerMessage.includes("favorite") || lowerMessage.includes("best")) {
        return `My strongest skills are **TypeScript** and **Angular** - I've been working with them for 5+ years. At Bet365, I'm currently using TypeScript + Go for our modernization project. I love Angular's enterprise-grade features like dependency injection and OnPush change detection. For state management, I'm expert in **NgRx** and **RxJS**. My AWS experience includes Lambda, DynamoDB, and Cognito from my QBurst days building parking dashboards.`;
      }
      return `Tijo's technical expertise spans the full modern web stack:\n\n**Frontend Excellence**: ${portfolioContext.skills.frontend.join(", ")}\n**Backend & Cloud**: ${portfolioContext.skills.backend.join(", ")} + ${portfolioContext.skills.cloud.join(", ")}\n**State Management**: ${portfolioContext.skills.stateManagement.join(", ")}\n**Testing**: ${portfolioContext.skills.testing.join(", ")}\n\nHe's particularly strong in enterprise Angular applications and modern TypeScript patterns. Currently working with Go at Bet365 for backend services.`;
    }
    
    if (lowerMessage.includes("experience") || lowerMessage.includes("work") || lowerMessage.includes("career")) {
      if (recentContext.includes("bet365") || lowerMessage.includes("current")) {
        return `At **Bet365** (current role since Feb 2023), Tijo is leading a major modernization effort - migrating legacy .NET systems to TypeScript + Go architecture. This is massive undertaking affecting core betting systems. He's also developing internal VS Code extensions and performance tuning critical systems. The Go backend services he's building handle high-volume betting transactions. This role showcases his ability to work with enterprise-scale systems while mentoring the team on modern practices.`;
      }
      return `Tijo's career progression shows consistent growth:\n\n🏢 **Bet365** (Current) - Software Engineer modernizing legacy systems\n🏢 **Infosys** - Frontend Consultant for Fortune 500 clients\n🏢 **NetObjex** - React developer during COVID pandemic\n🏢 **QBurst** - Full-stack engineer with AWS expertise\n🏢 **Speridian** - Started as trainee, grew to Chrome extension developer\n\nHe's worked with major clients like ${portfolioContext.majorClients.join(", ")} and has a proven track record of mentoring developers while delivering enterprise-grade solutions.`;
    }
    
    if (lowerMessage.includes("bet365") || lowerMessage.includes("current")) {
      return `${portfolioContext.currentWork}. This is a fascinating technical challenge - imagine migrating betting systems that handle millions of transactions while maintaining 99.99% uptime! Tijo's working with legacy .NET code that's been running for years and transforming it into modern, scalable TypeScript + Go microservices. He's not just coding but also mentoring the team on TypeScript best practices and Go patterns. The internal tooling he's building includes VS Code extensions that help developers work more efficiently with their codebase.`;
    }
    
    if (lowerMessage.includes("infosys") || lowerMessage.includes("home depot") || lowerMessage.includes("ebay") || lowerMessage.includes("enterprise")) {
      return `During his **Infosys** consulting period (2021-2023), Tijo was the go-to Angular expert for major enterprise clients. For **Home Depot**, he built reporting dashboards that warehouse managers use daily - handling millions of inventory records with smart caching and OnPush change detection. The **eBay** project involved seller analytics dashboards with real-time data visualization. He established the smart/dumb component architecture that became the standard across both projects, mentored 6+ developers, and his code review standards are still being used today.`;
    }
    
    if (lowerMessage.includes("project") || lowerMessage.includes("portfolio") || lowerMessage.includes("built") || lowerMessage.includes("demo")) {
      return `Here are Tijo's standout projects:\n\n🏢 **Bet365 Migration** - Legacy .NET → TypeScript+Go (40% performance improvement)\n📊 **Enterprise Dashboards** - Angular apps for Home Depot & eBay (10k+ daily users)\n🦠 **COVID Portal** - React onboarding system (deployed in 2 weeks, 1000+ users)\n🅿️ **AWS Parking System** - Serverless dashboard with real-time maps\n🎬 **Aviation Extension** - Chrome extension for Gogo's in-flight entertainment\n\nEach project solved real business problems with measurable impact. The COVID portal was particularly challenging - built during lockdown with remote team coordination, tight deadline, but it successfully onboarded 1000+ remote employees safely.`;
    }
    
    if (lowerMessage.includes("contact") || lowerMessage.includes("hire") || lowerMessage.includes("reach") || lowerMessage.includes("available")) {
      return `Tijo is actively open to new opportunities! 🚀\n\n📧 **Email**: ${portfolioContext.email}\n📱 **Phone**: ${portfolioContext.phone}\n💼 **LinkedIn**: ${portfolioContext.linkedin}\n📍 **Location**: ${portfolioContext.location}\n\n${portfolioContext.availability}. He's particularly interested in roles where he can combine technical leadership with hands-on development, especially in modern TypeScript/Angular environments or Go backend services. Remote-friendly roles are welcome too!`;
    }
    
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      if (messages.length > 2) {
        return `Good to chat more! 👋 What specific aspect of Tijo's experience interests you most? His current work at Bet365, the enterprise projects with Home Depot/eBay, or perhaps his mentoring and leadership experience?`;
      }
      return `Hello! 👋 I'm Tijo's AI assistant, here to help you learn about his ${portfolioContext.experience} as a Senior Frontend Engineer. Currently at Bet365 in ${portfolioContext.location}, he's worked with major clients like ${portfolioContext.majorClients.slice(0, 2).join(" and ")}. What would you like to know about his technical expertise or career journey?`;
    }
    
    if (lowerMessage.includes("angular") || lowerMessage.includes("react")) {
      return `Tijo is **highly proficient in both Angular and React**! 🎯\n\n**Angular** is his strongest suit - 5+ years of enterprise experience. At Infosys, he architected Angular dashboards using OnPush change detection, smart/dumb components, and NgRx for state management. His Angular code reviews became the standard for the team.\n\n**React** expertise includes the COVID-19 portal (React Hooks), Chrome extensions for Gogo Aviation, and various UI components with styled-components. He's comfortable with both class and functional components, Redux, and modern React patterns.\n\nHe can easily switch between frameworks based on project needs - Angular for enterprise apps, React for rapid prototyping and modern UIs.`;
    }
    
    if (lowerMessage.includes("aws") || lowerMessage.includes("cloud") || lowerMessage.includes("backend")) {
      return `Tijo's **cloud and backend experience** is quite impressive! ☁️\n\nAt **QBurst Technologies**, he built a complete serverless parking management system using:\n• **AWS Cognito** for authentication\n• **Lambda functions** for API endpoints\n• **DynamoDB** for real-time parking data\n• **S3** for file storage\n• **API Gateway** for microservices\n• **Google Maps API** integration\n\nCurrently at **Bet365**, he's developing **Go backend services** for high-volume betting systems. His Go code handles critical transaction processing with proper error handling, testing, and performance optimization. This combination of cloud architecture and systems programming makes him versatile for full-stack roles.`;
    }
    
    if (lowerMessage.includes("mentor") || lowerMessage.includes("lead") || lowerMessage.includes("team") || lowerMessage.includes("management")) {
      return `Tijo is a **natural technical leader and mentor**! 👥\n\nAt **Infosys**, he mentored 6+ frontend developers, establishing:\n• TypeScript coding standards that are still in use\n• Code review processes that improved code quality by 50%\n• Angular architecture patterns (smart/dumb components)\n• Knowledge sharing sessions on modern JS/TS features\n\nAt **Bet365**, he's mentoring the team on Go best practices and TypeScript migration strategies. His leadership style focuses on **growing others** while maintaining high technical standards. He's the kind of senior engineer who makes the whole team better, not just delivers his own work.`;
    }

    if (lowerMessage.includes("go") || lowerMessage.includes("golang") || lowerMessage.includes("backend")) {
      return `Tijo's **Go expertise** is growing rapidly at Bet365! 🚀\n\nHe's building **production Go services** for betting systems that handle:\n• High-volume transaction processing\n• Real-time data streaming\n• Database optimization\n• Microservices architecture\n• Performance monitoring\n\nWhat's impressive is how quickly he picked up Go coming from a frontend background. His TypeScript experience translates well to Go's strong typing, and he's applying frontend performance optimization mindset to backend services. The systems he's building need to handle massive scale with 99.99% uptime - it's serious backend engineering work.`;
    }

    if (lowerMessage.includes("covid") || lowerMessage.includes("pandemic") || lowerMessage.includes("netojex")) {
      return `The **COVID-19 onboarding portal** at NetObjex was Tijo's standout rapid-deployment project! 🦠\n\nBuilt during the **2020 lockdown** when companies needed to quickly onboard remote employees safely:\n• **2-week development cycle** from concept to production\n• **React with Hooks** for modern, fast development\n• **Highcharts integration** for health data visualization\n• **Rematch** for state management\n• **Responsive design** for mobile health check-ins\n\nThis project showcased his ability to deliver under pressure while maintaining code quality. The portal successfully onboarded **1000+ remote employees**, helping the company adapt to pandemic work conditions. It's a great example of his problem-solving skills during challenging times.`;
    }

    if (lowerMessage.includes("education") || lowerMessage.includes("study") || lowerMessage.includes("university") || lowerMessage.includes("degree")) {
      return `Tijo holds **${portfolioContext.education}** 🎓\n\nHis **Master's in Computer Applications (MCA)** provided deep theoretical foundations in:\n• Software engineering principles\n• Database design and optimization\n• System architecture\n• Programming paradigms\n\nCombined with **${portfolioContext.experience}** of hands-on development, this gives him both the theoretical understanding and practical skills needed for complex enterprise projects. His academic background shows in his systematic approach to problem-solving and ability to architect scalable solutions.`;
    }

    if (lowerMessage.includes("why") || lowerMessage.includes("choose") || lowerMessage.includes("hire")) {
      return `Here's why Tijo stands out as a **Senior Frontend Engineer** 🌟:\n\n✅ **Proven Enterprise Experience** - Built systems for Bet365, Home Depot, eBay\n✅ **Modern Tech Stack** - TypeScript, Angular, React, Go, AWS\n✅ **Performance Focus** - 40% improvements through architecture modernization\n✅ **Mentoring Skills** - Developed 6+ junior developers\n✅ **Full-Stack Capability** - Frontend expertise + Go backend services\n✅ **Problem Solver** - Delivered COVID portal in 2 weeks during pandemic\n✅ **Enterprise Scale** - Systems handling millions of transactions\n\nHe combines deep technical skills with leadership experience and a track record of delivering business-critical applications. Perfect for senior roles requiring both hands-on development and team leadership.`;
    }
    
    // Context-aware follow-up questions
    if (recentContext.includes("experience") && (lowerMessage.includes("more") || lowerMessage.includes("detail"))) {
      return `Let me dive deeper into Tijo's experience! Which aspect interests you most?\n\n🏢 **Current Bet365 role** - System modernization and Go development\n📊 **Enterprise consulting** - Home Depot & eBay dashboard projects\n🚀 **Rapid development** - COVID portal built in 2 weeks\n☁️ **Cloud architecture** - AWS serverless parking system\n👥 **Team leadership** - Mentoring and establishing best practices\n\nI can provide detailed insights into any of these areas!`;
    }
    
    // Default contextual response
    const contextualResponses = [
      `That's a great question about Tijo! He's a Senior Frontend Engineer from ${portfolioContext.location} with ${portfolioContext.experience}. His expertise spans ${portfolioContext.skills.frontend.slice(0, 3).join(", ")} and he's currently working at ${portfolioContext.companies[0]} on system modernization. What specific aspect would you like to explore?`,
      
      `I'd love to help you learn more about Tijo Thomas! He's worked with major companies like ${portfolioContext.companies.slice(0, 3).join(", ")} and has delivered projects for ${portfolioContext.majorClients.join(", ")}. His technical leadership and mentoring experience make him ideal for senior roles. What interests you most about his background?`,
      
      `Excellent question! Tijo's career journey from trainee to Senior Frontend Engineer showcases consistent growth and learning. His current work at Bet365 involves ${portfolioContext.currentWork.toLowerCase()}. He's also ${portfolioContext.availability.toLowerCase()}. How can I help you understand his qualifications better?`
    ];
    
    return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
  };

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input.trim();
    if (!messageToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageToSend,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Track chat question
    analytics.trackChatQuestion(messageToSend);

    // Add to conversation context
    const newContext = [...conversationContext, messageToSend].slice(-5); // Keep last 5 messages for context
    setConversationContext(newContext);

    try {
      const response = await generateResponse(messageToSend, newContext);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Play notification sound for bot response
      soundManager.playNotification();
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an error processing your question. Please try asking again, or contact Tijo directly at tijo1293@gmail.com for immediate assistance!",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    // Enhanced initial greeting
    const greeting: Message = {
      id: "initial",
      text: `👋 **Welcome to Tijo's AI Assistant!**\n\nI'm here to help you learn about **Tijo Thomas**, a Senior Frontend Engineer from ${portfolioContext.location} with ${portfolioContext.experience}.\n\n🎯 **Quick Facts:**\n• Currently at **${portfolioContext.companies[0]}** working on system modernization\n• Expert in **${portfolioContext.skills.frontend.slice(0, 3).join(", ")}** + **${portfolioContext.skills.backend.join(" & ")}\n• Delivered projects for **${portfolioContext.majorClients.join(", ")}**\n• **${portfolioContext.availability}**\n\n💬 **Try asking me:**\n• "Tell me about your experience"\n• "What technologies do you work with?"\n• "How can I contact you?"\n\nWhat would you like to know about Tijo's technical expertise and career journey?`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([greeting]);
  }, []);

  return (
    <Card 
      className="h-full flex flex-col border transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--theme-card)', 
        borderColor: 'var(--theme-border)' 
      }}
    >
      <CardHeader 
        className="py-1.5 px-3 flex-shrink-0 border-b transition-colors duration-300"
        style={{ borderColor: 'var(--theme-border)' }}
      >
        <CardTitle 
          className="font-mono flex items-center gap-2 zoom-text-sm"
          style={{ color: 'var(--theme-accent)' }}
        >
          <Bot className="w-4 h-4" />
          Tijo's AI Assistant
          <Sparkles className="w-3 h-3" style={{ color: 'var(--theme-secondary)' }} />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-2 max-w-[85%] ${message.isUser ? "flex-row-reverse" : "flex-row"}`}>
                <div className="flex-shrink-0 mt-1">
                  {message.isUser ? (
                    <User className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                  ) : (
                    <Bot className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                  )}
                </div>
                <div
                  className="rounded-lg p-2 font-mono zoom-text-xs leading-relaxed break-words border transition-colors duration-300"
                  style={message.isUser ? {
                    backgroundColor: 'var(--theme-accent)',
                    color: 'var(--theme-bg)',
                    borderColor: 'var(--theme-accent)'
                  } : {
                    backgroundColor: 'var(--theme-muted)',
                    color: 'var(--theme-text)',
                    borderColor: 'var(--theme-border)'
                  }}
                >
                  {message.text.split('\n').map((line, index) => (
                    <div key={index} className="mb-1 last:mb-0">
                      {line.includes('**') ? (
                        <span
                          dangerouslySetInnerHTML={{
                            __html: line
                              .replace(/\*\*(.*?)\*\*/g, `<strong style="color: var(--theme-text); font-weight: bold;">$1</strong>`)
                              .replace(/•/g, `<span style="color: var(--theme-accent);">•</span>`)
                          }}
                        />
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          {/* Quick Reply Buttons */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-1 px-3">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(reply)}
                  className="border hover:opacity-80 zoom-text-xs px-2 py-1 transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--theme-muted)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text)'
                  }}
                  disabled={isTyping}
                >
                  {reply}
                </Button>
              ))}
            </div>
          )}
          
          {isTyping && (
            <div className="flex gap-2 justify-start">
              <div className="flex gap-2">
                <Bot className="w-4 h-4 mt-1" style={{ color: 'var(--theme-accent)' }} />
                <div 
                  className="border rounded-lg p-2 font-mono zoom-text-xs transition-colors duration-300"
                  style={{
                    backgroundColor: 'var(--theme-muted)',
                    color: 'var(--theme-text)',
                    borderColor: 'var(--theme-border)'
                  }}
                >
                  <div className="flex gap-1 items-center">
                    <span style={{ color: 'var(--theme-accent)' }}>Thinking</span>
                    <div className="flex gap-1 ml-2">
                      <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--theme-accent)' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{animationDelay: '0.1s', backgroundColor: 'var(--theme-accent)' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{animationDelay: '0.2s', backgroundColor: 'var(--theme-accent)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area - Fixed at bottom */}
        <div 
          className="border-t p-3 flex-shrink-0 transition-colors duration-300"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about skills, experience, projects..."
              className="font-mono zoom-text-xs border transition-colors duration-300"
              style={{
                backgroundColor: 'var(--theme-muted)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)'
              }}
              disabled={isTyping}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isTyping || !input.trim()}
              className="px-2 border transition-colors duration-300"
              style={{
                backgroundColor: 'var(--theme-accent)',
                borderColor: 'var(--theme-accent)',
                color: 'var(--theme-bg)'
              }}
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatAgent;
