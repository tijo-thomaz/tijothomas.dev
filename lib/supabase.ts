/**
 * Supabase client configuration for analytics
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Analytics data structure
export interface AnalyticsEvent {
  id?: string;
  session_id: string;
  event_type: 'command' | 'chat' | 'theme_change' | 'session_start' | 'session_end';
  event_data: {
    command?: string;
    question?: string;
    theme?: string;
    metadata?: any;
  };
  created_at?: string;
  user_agent?: string;
  device_type?: string;
  screen_resolution?: string;
}

export interface SessionData {
  id?: string;
  session_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  total_commands: number;
  total_questions: number;
  theme_used: string;
  device_info: string;
  user_agent: string;
  screen_resolution: string;
  created_at?: string;
}

/**
 * Store analytics event to Supabase
 */
export async function storeAnalyticsEvent(event: AnalyticsEvent): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert([event]);
    
    if (error) {
      console.warn('Failed to store analytics event:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Analytics storage error:', error);
    return false;
  }
}

/**
 * Store session data to Supabase
 */
export async function storeSessionData(session: SessionData): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .upsert([session], { onConflict: 'session_id' });
    
    if (error) {
      console.warn('Failed to store session data:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Session storage error:', error);
    return false;
  }
}

/**
 * SQL schema for Supabase tables
 * Run these in your Supabase SQL editor:
 */
/**
 * Get aggregated analytics data from Supabase
 */
export async function getSupabaseAnalytics() {
  try {
    // Get unique session count (total visitors)
    const { data: sessions, error: sessionsError } = await supabase
      .from('user_sessions')
      .select('session_id, total_commands, total_questions, theme_used, device_info, start_time, end_time, duration');

    if (sessionsError) {
      console.warn('Error fetching sessions:', sessionsError);
      return null;
    }

    // Get command events
    const { data: commandEvents, error: commandsError } = await supabase
      .from('analytics_events')
      .select('event_data')
      .eq('event_type', 'command');

    if (commandsError) {
      console.warn('Error fetching commands:', commandsError);
    }

    // Get chat events  
    const { data: chatEvents, error: chatError } = await supabase
      .from('analytics_events')
      .select('event_data')
      .eq('event_type', 'chat');

    if (chatError) {
      console.warn('Error fetching chat events:', chatError);
    }

    // Process the data
    const uniqueSessions = new Set(sessions?.map(s => s.session_id)).size;
    const totalSessions = sessions?.length || 0;
    
    // Calculate average session duration
    const validDurations = sessions?.filter(s => s.duration).map(s => s.duration) || [];
    const avgDuration = validDurations.length > 0 
      ? validDurations.reduce((a, b) => a + b, 0) / validDurations.length 
      : 0;

    // Count commands
    const commandCounts: { [key: string]: number } = {};
    commandEvents?.forEach(event => {
      const command = event.event_data?.command;
      if (command) {
        commandCounts[command] = (commandCounts[command] || 0) + 1;
      }
    });

    // Count chat topics
    const questionCounts: { [key: string]: number } = {};
    chatEvents?.forEach(event => {
      const question = event.event_data?.question;
      const keywords = event.event_data?.metadata?.keyPhrases || [];
      keywords.forEach((keyword: string) => {
        questionCounts[keyword] = (questionCounts[keyword] || 0) + 1;
      });
    });

    // Count themes and devices
    const themeCounts: { [key: string]: number } = {};
    const deviceCounts: { [key: string]: number } = {};
    
    sessions?.forEach(session => {
      if (session.theme_used) {
        themeCounts[session.theme_used] = (themeCounts[session.theme_used] || 0) + 1;
      }
      if (session.device_info) {
        deviceCounts[session.device_info] = (deviceCounts[session.device_info] || 0) + 1;
      }
    });

    return {
      totalVisitors: uniqueSessions,
      totalSessions,
      averageSessionDuration: avgDuration,
      totalCommands: commandEvents?.length || 0,
      totalQuestions: chatEvents?.length || 0,
      popularCommands: commandCounts,
      popularQuestions: questionCounts,
      themes: themeCounts,
      devices: deviceCounts,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching Supabase analytics:', error);
    return null;
  }
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export const SUPABASE_SCHEMA = `
-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('command', 'chat', 'theme_change', 'session_start', 'session_end')),
  event_data JSONB NOT NULL DEFAULT '{}',
  user_agent TEXT,
  device_type TEXT,
  screen_resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in milliseconds
  total_commands INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  theme_used TEXT DEFAULT 'terminal',
  device_info TEXT,
  user_agent TEXT,
  screen_resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON user_sessions(start_time);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for portfolio visitors)
CREATE POLICY "Allow anonymous inserts" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous upserts" ON user_sessions
  FOR UPDATE WITH CHECK (true);
`;
