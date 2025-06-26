// Database service for analytics and chat history
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for public operations
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Database Types
export interface VisitorSession {
  id?: string;
  session_id: string;
  visitor_id: string;
  start_time: string;
  end_time?: string;
  device_type: string;
  user_agent: string;
  theme_used: string;
  sound_enabled: boolean;
  zoom_level: number;
  commands_executed: string[];
  chat_questions: string[];
  duration_seconds?: number;
  created_at?: string;
}

export interface ChatInteraction {
  id?: string;
  session_id: string;
  question: string;
  response: string;
  model_used: string;
  response_time_ms: number;
  created_at?: string;
}

export interface Analytics {
  id?: string;
  metric_name: string;
  metric_value: number;
  metadata?: any;
  date: string;
  created_at?: string;
}

// Analytics Service
export class DatabaseService {
  // Store visitor session
  static async storeSession(session: VisitorSession) {
    try {
      const { data, error } = await supabaseAdmin
        .from('visitor_sessions')
        .insert([session])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing session:', error);
      return null;
    }
  }

  // Update session when it ends
  static async updateSession(sessionId: string, updates: Partial<VisitorSession>) {
    try {
      const { data, error } = await supabaseAdmin
        .from('visitor_sessions')
        .update(updates)
        .eq('session_id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating session:', error);
      return null;
    }
  }

  // Store chat interaction
  static async storeChatInteraction(interaction: ChatInteraction) {
    try {
      const { data, error } = await supabaseAdmin
        .from('chat_interactions')
        .insert([interaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error storing chat interaction:', error);
      return null;
    }
  }

  // Get analytics summary
  static async getAnalyticsSummary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get total visitors and sessions
      const { data: sessions, error: sessionsError } = await supabaseAdmin
        .from('visitor_sessions')
        .select('*');

      if (sessionsError) throw sessionsError;

      // Get chat interactions
      const { data: chats, error: chatsError } = await supabaseAdmin
        .from('chat_interactions')
        .select('*');

      if (chatsError) throw chatsError;

      // Process analytics
      const analytics = {
        totalVisitors: new Set(sessions?.map(s => s.visitor_id)).size || 0,
        totalSessions: sessions?.length || 0,
        totalChats: chats?.length || 0,
        averageSessionDuration: sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / (sessions?.length || 1),
        popularCommands: this.getPopularItems(sessions?.flatMap(s => s.commands_executed) || []),
        popularQuestions: this.getPopularItems(chats?.map(c => c.question) || []),
        deviceBreakdown: this.getBreakdown(sessions?.map(s => s.device_type) || []),
        themeBreakdown: this.getBreakdown(sessions?.map(s => s.theme_used) || []),
        dailyVisitors: await this.getDailyVisitors(lastWeek, today),
      };

      return analytics;
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return null;
    }
  }

  // Helper: Get popular items
  private static getPopularItems(items: string[]): Array<{item: string, count: number}> {
    const counts: {[key: string]: number} = {};
    items.forEach(item => {
      if (item) counts[item] = (counts[item] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([item, count]) => ({ item, count }));
  }

  // Helper: Get breakdown
  private static getBreakdown(items: string[]): {[key: string]: number} {
    const breakdown: {[key: string]: number} = {};
    items.forEach(item => {
      if (item) breakdown[item] = (breakdown[item] || 0) + 1;
    });
    return breakdown;
  }

  // Helper: Get daily visitors
  private static async getDailyVisitors(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabaseAdmin
        .from('visitor_sessions')
        .select('created_at, visitor_id')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;

      const dailyStats: {[key: string]: Set<string>} = {};
      data?.forEach(session => {
        const date = session.created_at.split('T')[0];
        if (!dailyStats[date]) dailyStats[date] = new Set();
        dailyStats[date].add(session.visitor_id);
      });

      return Object.entries(dailyStats).map(([date, visitors]) => ({
        date,
        visitors: visitors.size
      }));
    } catch (error) {
      console.error('Error getting daily visitors:', error);
      return [];
    }
  }
}
