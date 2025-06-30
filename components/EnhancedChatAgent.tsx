"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Sparkles, Wifi, WifiOff } from "lucide-react";
import { soundManager } from "@/lib/sounds";
// import { analytics } from "@/lib/analytics"; // Disabled - using simple analytics
import ContactActions from "./ContactActions";
import ContactMessage from "./ContactMessage";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  model?: string;
  responseTime?: number;
}

interface LLMResponse {
  response: string;
  model: string;
  responseTime: number;
  tokensUsed?: number;
  fallback?: boolean;
}

// Detailed portfolio context for enhanced responses
const portfolioContext = {
  name: "Tijo Thomas",
  role: "Senior Frontend Engineer",
  location: "Manchester, UK",
  experience: "8+ years of frontend development experience",
  email: "tijo1293@gmail.com",
  phone: "+44 7818 989060",
  whatsapp: "https://wa.me/447818989060",
  linkedin: "https://linkedin.com/in/tijo-j-thomaz93",

  skills: {
    frontend: [
      "Angular",
      "React",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Sass",
    ],
    backend: ["Go", "Node.js"],
    stateManagement: ["RxJS", "NgRx", "Redux", "Rematch"],
    testing: ["Jasmine", "Karma", "Jest", "Cypress"],
    cloud: [
      "AWS Amplify",
      "Lambda",
      "DynamoDB",
      "Cognito",
      "API Gateway",
      "S3",
    ],
    tools: ["Git", "VS Code", "Chrome DevTools", "Postman", "Figma"],
    dataViz: ["Highcharts", "Chart.js"],
  },

  companies: [
    "Bet365",
    "Infosys",
    "NetObjex",
    "QBurst Technologies",
    "Speridian Technologies",
  ],

  majorClients: ["Home Depot", "eBay", "Gogo Business Aviation"],

  achievements: [
    "Migrated legacy .NET systems to modern TypeScript + Go architecture at Bet365",
    "Led enterprise reporting dashboard development for Home Depot & eBay",
    "Mentored frontend developers and established coding best practices",
    "Built COVID-19 employee onboarding portal during pandemic",
    "Developed cloud-based parking dashboards with AWS stack",
    "Performance improvements of 40% through modern architecture migration",
  ],

  currentWork:
    "Currently working at Bet365 on system modernization and Go backend services",

  education: "MCA & BCA from M.G. University, Kottayam, India",

  personality:
    "passionate about frontend engineering, mentoring developers, and building scalable user interfaces",

  availability:
    "Available for senior frontend roles, technical leadership positions, and consulting opportunities",
};

const EnhancedChatAgent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [sessionId] = useState(
    () => Date.now().toString(36) + Math.random().toString(36).substr(2)
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "Tell me about your experience",
    "What technologies do you work with?",
    "How can I contact you?",
    "What's your current role?",
    "Show me your projects",
  ];

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Enhanced local fallback with specific portfolio context
  const generateLocalResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Context-aware responses based on Tijo's actual CV
    if (
      lowerMessage.includes("skill") ||
      lowerMessage.includes("tech") ||
      lowerMessage.includes("stack")
    ) {
      return `Tijo is a Senior Frontend Engineer with expertise in **${portfolioContext.skills.frontend.join(
        ", "
      )}**, plus backend skills in **${portfolioContext.skills.backend.join(
        " and "
      )}**. He's particularly strong in state management with **${portfolioContext.skills.stateManagement.join(
        ", "
      )}** and has extensive AWS cloud experience. His testing toolkit includes **${portfolioContext.skills.testing.join(
        ", "
      )}**.`;
    }

    if (
      lowerMessage.includes("experience") ||
      lowerMessage.includes("work") ||
      lowerMessage.includes("career")
    ) {
      return `Tijo has **${
        portfolioContext.experience
      }**, currently working as a Software Engineer at **${
        portfolioContext.companies[0]
      }** in ${
        portfolioContext.location
      }. He's worked with major companies like **${portfolioContext.companies.join(
        ", "
      )}** and has delivered projects for enterprise clients including **${portfolioContext.majorClients.join(
        ", "
      )}**. His career spans from associate trainee to senior engineer, with a strong focus on mentoring and technical leadership.`;
    }

    if (lowerMessage.includes("bet365") || lowerMessage.includes("current")) {
      return `At **Bet365** since February 2023, Tijo has been instrumental in **${portfolioContext.achievements[0]}**. He's developed internal tools using VS Code extensions, engineered scalable backend services in Go, and contributed to performance tuning. This role showcases his ability to modernize complex systems while maintaining business continuity.`;
    }

    if (
      lowerMessage.includes("infosys") ||
      lowerMessage.includes("home depot") ||
      lowerMessage.includes("ebay")
    ) {
      return `During his time as Frontend Consultant at **Infosys** (2021-2023), Tijo **${portfolioContext.achievements[1]}**. He implemented advanced Angular patterns like OnPush change detection and smart/dumb component architecture, while mentoring fellow developers and enforcing TypeScript best practices.`;
    }

    if (
      lowerMessage.includes("project") ||
      lowerMessage.includes("portfolio")
    ) {
      return `Tijo's notable projects include: **${portfolioContext.achievements
        .slice(0, 3)
        .join(
          "**, **"
        )}**. Each project demonstrates his ability to work across different domains and technologies, with measurable impact like **${
        portfolioContext.achievements[5]
      }**.`;
    }

    if (
      lowerMessage.includes("contact") ||
      lowerMessage.includes("hire") ||
      lowerMessage.includes("reach")
    ) {
      return "SHOW_CONTACT_ACTIONS";
    }

    if (lowerMessage.includes("angular") || lowerMessage.includes("react")) {
      return `Tijo is highly proficient in both **Angular and React**! At ${portfolioContext.companies[0]}, he works with TypeScript, while at ${portfolioContext.companies[1]} he led Angular-based enterprise dashboards with advanced patterns like OnPush change detection. His React experience includes building COVID-19 portals, Chrome extensions, and various UI components. He's comfortable switching between frameworks based on project needs.`;
    }

    if (lowerMessage.includes("aws") || lowerMessage.includes("cloud")) {
      return `Tijo has extensive **AWS experience**, particularly from his time at QBurst Technologies where he **${
        portfolioContext.achievements[4]
      }**. He's worked with **${portfolioContext.skills.cloud.join(
        ", "
      )}**. This cloud expertise complements his frontend skills perfectly.`;
    }

    if (
      lowerMessage.includes("mentor") ||
      lowerMessage.includes("lead") ||
      lowerMessage.includes("team")
    ) {
      return `Tijo is a natural mentor and technical leader! At Infosys, he **${portfolioContext.achievements[2]}**. His leadership style focuses on knowledge sharing and elevating team performance. He's experienced in establishing coding standards and helping junior developers grow their skills.`;
    }

    if (
      lowerMessage.includes("education") ||
      lowerMessage.includes("study") ||
      lowerMessage.includes("university")
    ) {
      return `Tijo holds **${portfolioContext.education}**. His strong academic foundation in computer applications, combined with **${portfolioContext.experience}**, has equipped him with both theoretical knowledge and practical expertise in software engineering.`;
    }

    // Default response
    return `That's an interesting question! I'm here to help you learn about **${
      portfolioContext.name
    }**, a **${portfolioContext.role}** from **${
      portfolioContext.location
    }** with **${
      portfolioContext.experience
    }**. He's worked with major companies like **${portfolioContext.companies
      .slice(0, 3)
      .join(
        ", "
      )}** and has expertise in modern web technologies. Feel free to ask about his technical skills, work experience, or how to get in touch!`;
  };

  const generateLLMResponse = async (userMessage: string): Promise<string> => {
    if (!isOnline) {
      return "I'm currently offline. Please check your internet connection and try again, or contact Tijo directly at tijo1293@gmail.com.";
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          conversationHistory: conversationContext,
          portfolioContext: portfolioContext, // Pass the context to the API
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return "I'm receiving a lot of questions right now. Please wait a moment before asking another question, or contact Tijo directly at tijo1293@gmail.com for immediate assistance.";
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LLMResponse = await response.json();

      if (data.fallback) {
        // Use local context-aware response instead of generic fallback
        return generateLocalResponse(userMessage);
      }

      return data.response;
    } catch (error) {
      console.error("LLM Error:", error);
      // Use local context-aware response instead of generic error
      return generateLocalResponse(userMessage);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const messageToSend = messageText || input.trim();
    if (!messageToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Track chat question
    // analytics.trackChatQuestion(messageToSend); // Disabled for privacy

    // Add to conversation context
    const newContext = [...conversationContext, messageToSend].slice(-5);
    setConversationContext(newContext);

    try {
      const startTime = Date.now();
      const response = await generateLLMResponse(messageToSend);
      const responseTime = Date.now() - startTime;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        responseTime,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Play notification sound for bot response
      soundManager.playNotification();
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I encountered an error processing your question. Please try asking again, or contact Tijo directly at tijo1293@gmail.com for immediate assistance!",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
      text: `👋 **Welcome to Tijo's Enhanced AI Assistant!**\n\nI'm powered by advanced AI and have comprehensive knowledge about **Tijo Thomas**, a Senior Frontend Engineer from Manchester, UK with 8+ years of experience.\n\n🤖 **Enhanced Features:**\n• Real-time AI responses with context awareness\n• Deep knowledge of Tijo's technical background\n• Smart conversation memory\n• ${
        isOnline ? "✅ Connected to AI services" : "❌ Currently offline"
      }\n\n🎯 **About Tijo:**\n• Currently at **Bet365** working on system modernization\n• Expert in **Angular, React, TypeScript, Go**\n• Delivered projects for **Home Depot, eBay, and major enterprises**\n• **Available for senior frontend roles and consulting**\n\n💬 **Try asking me:**\n• "What's Tijo's experience with Angular?"\n• "Tell me about his current work at Bet365"\n• "How can I contact him for opportunities?"\n\nWhat would you like to know about Tijo's background and expertise?`,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, [isOnline]);

  return (
    <Card
      className="h-full flex flex-col border-0 transition-colors duration-300"
      style={{
        backgroundColor: "var(--theme-card)",
        borderColor: "transparent",
      }}
    >
      <CardHeader
        className="py-3 px-4 flex-shrink-0 border-b-0 transition-colors duration-300"
        style={{ borderColor: "transparent" }}
      >
        <div className="flex items-center justify-between">
          <CardTitle
            className="font-mono flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--theme-accent)" }}
          >
            <Bot className="w-4 h-4" />
            <span>Portfolio Chat</span>
            <Sparkles
              className="w-3 h-3"
              style={{ color: "var(--theme-secondary)" }}
            />
            {isOnline ? (
              <Wifi className="w-3 h-3 text-green-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-400" />
            )}
          </CardTitle>
          <ContactActions className="scale-75" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-2 max-w-[85%] ${
                  message.isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {message.isUser ? (
                    <User
                      className="w-3 h-3"
                      style={{ color: "var(--theme-accent)" }}
                    />
                  ) : (
                    <Bot
                      className="w-3 h-3"
                      style={{ color: "var(--theme-accent)" }}
                    />
                  )}
                </div>
                <div
                  className="rounded-lg p-3 font-mono text-sm leading-relaxed break-words border transition-colors duration-300"
                  style={
                    message.isUser
                      ? {
                          backgroundColor: "var(--theme-accent)",
                          color: "var(--theme-bg)",
                          borderColor: "var(--theme-accent)",
                        }
                      : {
                          backgroundColor: "var(--theme-muted)",
                          color: "var(--theme-text)",
                          borderColor: "var(--theme-border)",
                        }
                  }
                >
                  {message.text === "SHOW_CONTACT_ACTIONS" ? (
                    <ContactMessage />
                  ) : (
                    <>
                      {message.text.split("\n").map((line, index) => (
                        <div key={index} className="mb-1 last:mb-0">
                          {line.includes("**") ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: line
                                  .replace(
                                    /\*\*(.*?)\*\*/g,
                                    `<strong style="color: var(--theme-text); font-weight: bold;">$1</strong>`
                                  )
                                  .replace(
                                    /•/g,
                                    `<span style="color: var(--theme-accent);">•</span>`
                                  ),
                              }}
                            />
                          ) : (
                            line
                          )}
                        </div>
                      ))}
                    </>
                  )}
                  {message.responseTime && (
                    <div className="text-xs opacity-50 mt-1">
                      {message.responseTime}ms
                    </div>
                  )}
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
                    backgroundColor: "var(--theme-muted)",
                    borderColor: "var(--theme-border)",
                    color: "var(--theme-text)",
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
                <Bot
                  className="w-3 h-3 md:w-4 md:h-4 mt-1"
                  style={{ color: "var(--theme-accent)" }}
                />
                <div
                  className="border rounded-lg p-2 md:p-3 font-mono zoom-text-sm md:zoom-text-base transition-colors duration-300"
                  style={{
                    backgroundColor: "var(--theme-muted)",
                    color: "var(--theme-text)",
                    borderColor: "var(--theme-border)",
                  }}
                >
                  <div className="flex gap-1 items-center">
                    <span style={{ color: "var(--theme-accent)" }}>
                      AI thinking
                    </span>
                    <div className="flex gap-1 ml-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ backgroundColor: "var(--theme-accent)" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                          animationDelay: "0.1s",
                          backgroundColor: "var(--theme-accent)",
                        }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{
                          animationDelay: "0.2s",
                          backgroundColor: "var(--theme-accent)",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area - Always sticky at bottom */}
        <div
          className="border-t p-3 flex-shrink-0 transition-colors duration-300 sticky bottom-0 z-10"
          style={{
            borderColor: "var(--theme-border)",
            backgroundColor: "var(--theme-card)",
            boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isOnline
                  ? "Ask about skills, experience..."
                  : "Currently offline"
              }
              className="font-mono text-sm border transition-colors duration-300 flex-1"
              style={{
                backgroundColor: "var(--theme-muted)",
                borderColor: "var(--theme-border)",
                color: "var(--theme-text)",
              }}
              disabled={isTyping || !isOnline}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isTyping || !input.trim() || !isOnline}
              className="px-3 py-2 border transition-colors duration-300 flex-shrink-0"
              style={{
                backgroundColor: "var(--theme-accent)",
                borderColor: "var(--theme-accent)",
                color: "var(--theme-bg)",
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChatAgent;
