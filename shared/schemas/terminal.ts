import { z } from 'zod';

// Terminal command schema
export const TerminalCommandSchema = z.object({
  command: z.string().min(1, 'Command cannot be empty'),
  args: z.array(z.string()).default([]),
  timestamp: z.date().default(new Date()),
});

// Terminal output schema
export const TerminalOutputSchema = z.object({
  id: z.string(),
  command: z.string(),
  result: z.string(),
  timestamp: z.date(),
  type: z.enum(['command', 'error', 'info', 'success']),
});

// Terminal state schema
export const TerminalStateSchema = z.object({
  input: z.string().default(''),
  history: z.array(z.string()).default([]),
  output: z.array(TerminalOutputSchema).default([]),
  isProcessing: z.boolean().default(false),
  currentPath: z.string().default('~'),
});

// Command processor result schema
export const CommandResultSchema = z.object({
  output: z.string(),
  type: z.enum(['command', 'error', 'info', 'success']),
  path: z.string().optional(),
  action: z.string().optional(),
  worldName: z.string().optional(),
});

// Export types
export type TerminalCommand = z.infer<typeof TerminalCommandSchema>;
export type TerminalOutput = z.infer<typeof TerminalOutputSchema>;
export type TerminalState = z.infer<typeof TerminalStateSchema>;
export type CommandResult = z.infer<typeof CommandResultSchema>;
