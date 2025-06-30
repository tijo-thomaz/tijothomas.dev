// Visitor Analytics System
import { SessionManager } from './session';

// Optional Supabase integration - gracefully fails if not configured
let supabaseAvailable = false; // Disabled pending GDPR compliance
let storeAnalyticsEvent: any = null;
let storeSessionData: any = null;
let userConsent = false;

try {
  // Enable Supabase analytics (set to false if you want local-only)
  const supabaseEnabled = true; // Tables created - ready for Supabase analytics

  if (typeof window !== 'undefined' &&
    supabaseEnabled &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('.supabase.co')) {
    const supabaseModule = require('./supabase');
    storeAnalyticsEvent = supabaseModule.storeAnalyticsEvent;
    storeSessionData = supabaseModule.storeSessionData;
    supabaseAvailable = true;
  }
} catch (error) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Supabase not configured - using local analytics only');
  }
  supabaseAvailable = false;
}

interface VisitorSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  commands: string[];
  chatQuestions: string[];
  device: string;
  userAgent: string;
  theme: string;
  soundEnabled: boolean;
  zoomLevel: number;
}

interface AnalyticsData {
  totalVisitors: number;
  totalSessions: number;
  popularCommands: { [key: string]: number };
  popularQuestions: { [key: string]: number };
  themes: { [key: string]: number };
  devices: { [key: string]: number };
  averageSessionDuration: number;
  totalCommands: number;
  totalQuestions: number;
  lastVisit: number;
  visitedSessions?: string[];
}

class Analytics {
  private currentSession: VisitorSession | null = null;
  private readonly STORAGE_KEY = 'tijothomas-analytics';
  private readonly SESSION_KEY = 'tijothomas-session';
  private readonly CONSENT_KEY = 'tijothomas-cookie-consent';

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkConsent();
      this.initSession();
      this.setupBeforeUnload();
    }
  }

  private checkConsent(): void {
    const consent = localStorage.getItem(this.CONSENT_KEY);
    userConsent = consent === 'true';
    supabaseAvailable = userConsent && supabaseAvailable;
  }

  public setConsent(consent: boolean): void {
    userConsent = consent;
    localStorage.setItem(this.CONSENT_KEY, consent.toString());
    supabaseAvailable = consent && storeAnalyticsEvent !== null;
    
    if (!consent) {
      // Clear any existing data if user revokes consent
      this.clearAllData();
    } else {
      // Re-initialize if consent is given
      this.initSession();
    }
  }

  public hasConsent(): boolean {
    return userConsent;
  }

  public clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentSession = null;
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getDeviceInfo(): string {
    if (typeof window === 'undefined') return 'unknown';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private initSession() {
    const persistentSessionId = SessionManager.getSessionId();
    const existingSession = sessionStorage.getItem(this.SESSION_KEY);

    if (!existingSession) {
      // New session
      this.currentSession = {
        sessionId: persistentSessionId,
        startTime: Date.now(),
        commands: [],
        chatQuestions: [],
        device: this.getDeviceInfo(),
        userAgent: navigator.userAgent,
        theme: localStorage.getItem('tijothomas-theme') || 'terminal',
        soundEnabled: localStorage.getItem('tijothomas-sounds') === 'true',
        zoomLevel: parseInt(localStorage.getItem('tijothomas-zoom') || '100')
      };

      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
      this.incrementVisitorCount();
      this.storeSessionToSupabase('start');
    } else {
      // Existing session - update with persistent session ID
      this.currentSession = JSON.parse(existingSession);
      if (this.currentSession) {
        this.currentSession.sessionId = persistentSessionId;
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
      }
    }
  }

  private incrementVisitorCount() {
    const analytics = this.getAnalyticsData();
    const sessionId = this.currentSession?.sessionId;
    const today = new Date().toDateString();
    const lastVisitDate = analytics.lastVisit ? new Date(analytics.lastVisit).toDateString() : '';

    // Track unique visitors by session ID
    const visitedSessions = analytics.visitedSessions || [];
    const isNewVisitor = sessionId && !visitedSessions.includes(sessionId);

    if (isNewVisitor) {
      analytics.totalVisitors++;
      visitedSessions.push(sessionId);
      analytics.visitedSessions = visitedSessions;
    }

    // Always increment session count
    analytics.totalSessions++;
    analytics.lastVisit = Date.now();
    this.saveAnalyticsData(analytics);
  }

  private getAnalyticsData(): AnalyticsData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      totalVisitors: 0,
      totalSessions: 0,
      popularCommands: {},
      popularQuestions: {},
      themes: {},
      devices: {},
      averageSessionDuration: 0,
      totalCommands: 0,
      totalQuestions: 0,
      lastVisit: 0
    };
  }

  private saveAnalyticsData(data: AnalyticsData) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private storeSessionToSupabase(event: 'start' | 'end') {
    if (!supabaseAvailable || !storeSessionData || !this.currentSession) return;

    try {
      const metadata = SessionManager.getSessionMetadata();
      const sessionData = {
        session_id: this.currentSession.sessionId,
        start_time: new Date(this.currentSession.startTime).toISOString(),
        end_time: event === 'end' && this.currentSession.endTime
          ? new Date(this.currentSession.endTime).toISOString()
          : undefined,
        duration: event === 'end' && this.currentSession.endTime
          ? this.currentSession.endTime - this.currentSession.startTime
          : undefined,
        total_commands: this.currentSession.commands.length,
        total_questions: this.currentSession.chatQuestions.length,
        theme_used: this.currentSession.theme,
        device_info: this.currentSession.device,
        user_agent: metadata.userAgent,
        screen_resolution: metadata.screenResolution
      };

      storeSessionData(sessionData).catch((error: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to store session to Supabase:', error);
        }
      });

      // Also store session event
      if (storeAnalyticsEvent) {
        storeAnalyticsEvent({
          session_id: this.currentSession.sessionId,
          event_type: `session_${event}` as any,
          event_data: {
            device: this.currentSession.device,
            theme: this.currentSession.theme
          },
          user_agent: metadata.userAgent,
          device_type: this.currentSession.device,
          screen_resolution: metadata.screenResolution
        }).catch((error: any) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to store session event to Supabase:', error);
          }
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Supabase session storage error:', error);
      }
    }
  }

  private setupBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Also end session on visibility change (tab switch, etc.)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.endSession();
      }
    });
  }

  private endSession() {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    const sessionDuration = this.currentSession.endTime - this.currentSession.startTime;

    const analytics = this.getAnalyticsData();

    // Update average session duration
    const totalDuration = analytics.averageSessionDuration * (analytics.totalSessions - 1) + sessionDuration;
    analytics.averageSessionDuration = totalDuration / analytics.totalSessions;

    // Update device stats
    analytics.devices[this.currentSession.device] = (analytics.devices[this.currentSession.device] || 0) + 1;

    // Update theme stats
    analytics.themes[this.currentSession.theme] = (analytics.themes[this.currentSession.theme] || 0) + 1;

    this.saveAnalyticsData(analytics);
    this.storeSessionToSupabase('end');
    sessionStorage.removeItem(this.SESSION_KEY);
  }

  trackCommand(command: string) {
    if (!this.currentSession) return;

    this.currentSession.commands.push(command);
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));

    const analytics = this.getAnalyticsData();
    analytics.popularCommands[command] = (analytics.popularCommands[command] || 0) + 1;
    analytics.totalCommands++;
    this.saveAnalyticsData(analytics);

    // Store to Supabase (if available)
    if (supabaseAvailable && storeAnalyticsEvent) {
      try {
        const metadata = SessionManager.getSessionMetadata();
        storeAnalyticsEvent({
          session_id: this.currentSession.sessionId,
          event_type: 'command',
          event_data: { command },
          user_agent: metadata.userAgent,
          device_type: this.getDeviceInfo(),
          screen_resolution: metadata.screenResolution
        }).catch((error: any) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to store command to Supabase:', error);
          }
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Supabase command tracking error:', error);
        }
      }
    }
  }

  trackChatQuestion(question: string) {
    if (!this.currentSession) return;

    // Extract key phrases for better analytics
    const keyPhrases = this.extractKeyPhrases(question);

    this.currentSession.chatQuestions.push(question);
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));

    const analytics = this.getAnalyticsData();

    keyPhrases.forEach(phrase => {
      analytics.popularQuestions[phrase] = (analytics.popularQuestions[phrase] || 0) + 1;
    });

    analytics.totalQuestions++;
    this.saveAnalyticsData(analytics);

    // Store to Supabase (if available)
    if (supabaseAvailable && storeAnalyticsEvent) {
      try {
        const metadata = SessionManager.getSessionMetadata();
        storeAnalyticsEvent({
          session_id: this.currentSession.sessionId,
          event_type: 'chat',
          event_data: { question, metadata: { keyPhrases } },
          user_agent: metadata.userAgent,
          device_type: this.getDeviceInfo(),
          screen_resolution: metadata.screenResolution
        }).catch((error: any) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Failed to store chat to Supabase:', error);
          }
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Supabase chat tracking error:', error);
        }
      }
    }
  }

  private extractKeyPhrases(question: string): string[] {
    const commonWords = ['i', 'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'to', 'of', 'in', 'for', 'on', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'and', 'or', 'but', 'so', 'if', 'when', 'where', 'why', 'how', 'what', 'who', 'which', 'that', 'this', 'these', 'those'];

    const words = question.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word));

    // Return top keywords and some common phrases
    const phrases = [];

    if (question.toLowerCase().includes('experience')) phrases.push('experience');
    if (question.toLowerCase().includes('skill')) phrases.push('skills');
    if (question.toLowerCase().includes('project')) phrases.push('projects');
    if (question.toLowerCase().includes('contact')) phrases.push('contact');
    if (question.toLowerCase().includes('work')) phrases.push('work');
    if (question.toLowerCase().includes('angular')) phrases.push('angular');
    if (question.toLowerCase().includes('react')) phrases.push('react');
    if (question.toLowerCase().includes('typescript')) phrases.push('typescript');
    if (question.toLowerCase().includes('bet365')) phrases.push('bet365');

    return Array.from(new Set([...phrases, ...words.slice(0, 3)]));
  }

  trackThemeChange(theme: string) {
    if (!this.currentSession) return;

    this.currentSession.theme = theme;
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
  }

  getAnalytics(): AnalyticsData & { supabaseStatus: string } {
    const data = this.getAnalyticsData();
    return {
      ...data,
      supabaseStatus: supabaseAvailable ? 'Connected' : 'Local Only'
    };
  }

  getTopCommands(limit: number = 5): Array<{ command: string, count: number }> {
    const analytics = this.getAnalyticsData();
    return Object.entries(analytics.popularCommands)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([command, count]) => ({ command, count }));
  }

  getTopQuestions(limit: number = 5): Array<{ question: string, count: number }> {
    const analytics = this.getAnalyticsData();
    return Object.entries(analytics.popularQuestions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([question, count]) => ({ question, count }));
  }

  formatSessionDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

export const analytics = new Analytics();
