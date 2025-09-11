import { z } from 'zod';

// Chat API request schema
export const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
  sessionId: z.string().min(1, 'Session ID required'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
  portfolioContext: z.record(z.string(), z.any()).optional(),
  promptShield: z.object({
    enabled: z.boolean().default(true),
    config: z.record(z.string(), z.any()).optional(),
    version: z.string().default('2.1.0'),
  }).optional(),
});

// Chat API response schema
export const ChatResponseSchema = z.object({
  response: z.string(),
  model: z.string(),
  responseTime: z.number(),
  debug: z.record(z.string(), z.any()).optional(),
});

// Analytics API schemas
export const AnalyticsEventSchema = z.object({
  type: z.enum(['visit', 'command', 'question']),
  data: z.record(z.string(), z.any()).optional(),
  timestamp: z.date().default(new Date()),
});

export const AnalyticsSummarySchema = z.object({
  visits: z.number().default(0),
  commands: z.number().default(0),
  questions: z.number().default(0),
  sessionTime: z.string().default('<1m'),
  lastCommand: z.string().default('none'),
});

// HTTP error schema
export const ApiErrorSchema = z.object({
  error: z.string(),
  status: z.number(),
  statusText: z.string().optional(),
  body: z.any().optional(),
});

// Export types
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
