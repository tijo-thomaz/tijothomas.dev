import { z } from 'zod';

// Chat message schema
export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
  timestamp: z.date().default(new Date()),
  isTyping: z.boolean().default(false),
});

// PromptShield config schema
export const PromptShieldConfigSchema = z.object({
  enableToxicityFilter: z.boolean().default(true),
  enableHallucinationDetection: z.boolean().default(true),
  enableContextValidation: z.boolean().default(true),
  maxResponseLength: z.number().min(1).max(5000).default(1000),
  confidenceThreshold: z.number().min(0).max(1).default(0.8),
});

// PromptShield response schema
export const PromptShieldResponseSchema = z.object({
  response: z.string(),
  model: z.string(),
  responseTime: z.number(),
  tokens: z.number().optional(),
  shieldChecks: z.object({
    toxicity: z.object({
      passed: z.boolean(),
      confidence: z.number().min(0).max(1),
    }),
    hallucination: z.object({
      passed: z.boolean(),
      confidence: z.number().min(0).max(1),
    }),
    context: z.object({
      passed: z.boolean(),
      confidence: z.number().min(0).max(1),
    }),
  }),
  flagged: z.boolean(),
  originalResponse: z.string().optional(),
});

// Chat session schema
export const ChatSessionSchema = z.object({
  sessionId: z.string(),
  messages: z.array(ChatMessageSchema).default([]),
  isOnline: z.boolean().default(true),
  isOpen: z.boolean().default(false),
  conversationContext: z.array(ChatMessageSchema).default([]),
});

// Portfolio context schema
export const PortfolioContextSchema = z.object({
  name: z.string().default('Tijo Thomas'),
  role: z.string().default('Senior Frontend Engineer'),
  location: z.string().default('Manchester, UK'),
  experience: z.string().default('4+ years'),
  email: z.string().email().default('tijo1293@gmail.com'),
  phone: z.string().default('+44 7818 989060'),
  linkedin: z.string().url().default('https://linkedin.com/in/tijo-thomas-6bb0791a5/'),
  currentWork: z.string().default('Freelance & Contract Work'),
  skills: z.object({
    frontend: z.array(z.string()).default(['React', 'TypeScript', 'Next.js']),
    backend: z.array(z.string()).default(['Node.js', 'Express.js']),
    stateManagement: z.array(z.string()).default(['Redux', 'Zustand']),
    testing: z.array(z.string()).default(['Jest', 'Vitest']),
    cloud: z.array(z.string()).default(['Vercel', 'AWS']),
    tools: z.array(z.string()).default(['Git', 'VS Code']),
  }).default({
    frontend: ['React', 'TypeScript', 'Next.js'],
    backend: ['Node.js', 'Express.js'],
    stateManagement: ['Redux', 'Zustand'],
    testing: ['Jest', 'Vitest'],
    cloud: ['Vercel', 'AWS'],
    tools: ['Git', 'VS Code'],
  }),
  companies: z.array(z.string()).default(['Freelance', 'Contract Work']),
  majorClients: z.array(z.string()).default(['Various UK Companies']),
  achievements: z.array(z.string()).default(['PromptShield AI Platform']),
  education: z.string().default('Software Engineering Background'),
  availability: z.string().default('Available for opportunities'),
});

// Export types
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type PromptShieldConfig = z.infer<typeof PromptShieldConfigSchema>;
export type PromptShieldResponse = z.infer<typeof PromptShieldResponseSchema>;
export type ChatSession = z.infer<typeof ChatSessionSchema>;
export type PortfolioContext = z.infer<typeof PortfolioContextSchema>;
