// Truly Anonymous Analytics System
// No personal data, no tracking, no behavioral profiling

interface SimpleAnalytics {
  dailyVisits: number;
  popularCommands: { [key: string]: number };
  deviceTypes: { mobile: number; tablet: number; desktop: number };
  lastUpdated: string;
}

class SimpleAnalyticsSystem {
  private readonly STORAGE_KEY = 'tijothomas-simple-analytics';
  private hasCountedToday = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.incrementDailyVisit();
    }
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  private incrementDailyVisit(): void {
    const today = this.getTodayKey();
    const lastVisit = localStorage.getItem('tijothomas-last-visit');
    
    // Only count once per day per browser
    if (lastVisit !== today) {
      localStorage.setItem('tijothomas-last-visit', today);
      this.updateDailyCount();
      this.hasCountedToday = true;
    }
  }

  private updateDailyCount(): void {
    const analytics = this.getAnalytics();
    analytics.dailyVisits++;
    analytics.deviceTypes[this.getDeviceType()]++;
    analytics.lastUpdated = new Date().toISOString();
    this.saveAnalytics(analytics);
  }

  private getAnalytics(): SimpleAnalytics {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      dailyVisits: 0,
      popularCommands: {},
      deviceTypes: { mobile: 0, tablet: 0, desktop: 0 },
      lastUpdated: new Date().toISOString()
    };
  }

  private saveAnalytics(analytics: SimpleAnalytics): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(analytics));
  }

  // Public methods (no personal data involved)
  trackCommand(command: string): void {
    // Only track general command categories, not personal context
    const generalCommands = ['help', 'about', 'skills', 'experience', 'projects', 'contact', 'explore'];
    
    if (generalCommands.includes(command.toLowerCase())) {
      const analytics = this.getAnalytics();
      analytics.popularCommands[command] = (analytics.popularCommands[command] || 0) + 1;
      analytics.lastUpdated = new Date().toISOString();
      this.saveAnalytics(analytics);
    }
  }

  getStats(): SimpleAnalytics & { privacy: string } {
    return {
      ...this.getAnalytics(),
      privacy: 'Fully Anonymous - No Personal Data Collected'
    };
  }

  getTopCommands(limit: number = 5): Array<{command: string, count: number}> {
    const analytics = this.getAnalytics();
    return Object.entries(analytics.popularCommands)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([command, count]) => ({ command, count }));
  }

  // No user data to delete - everything is already anonymous
  clearLocalData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('tijothomas-last-visit');
  }

  // Export data (there's nothing personal to export, but for transparency)
  exportData(): SimpleAnalytics {
    return this.getAnalytics();
  }
}

export const simpleAnalytics = new SimpleAnalyticsSystem();
