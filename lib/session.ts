/**
 * Session management with persistent IDs across tabs and browser refreshes
 */

export class SessionManager {
  private static STORAGE_KEY = 'tijothomas_session_id';
  private static SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get or create a persistent session ID
   * Same user across tabs/refreshes gets same ID until expiry
   */
  static getSessionId(): string {
    if (typeof window === 'undefined') return '';

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (stored) {
        const { sessionId, timestamp } = JSON.parse(stored);
        const isExpired = Date.now() - timestamp > this.SESSION_DURATION;
        
        if (!isExpired) {
          return sessionId;
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve session ID:', error);
    }

    // Create new session
    return this.createNewSession();
  }

  /**
   * Create and store a new session ID
   */
  private static createNewSession(): string {
    const sessionId = this.generateSessionId();
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        sessionId,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to store session ID:', error);
    }

    return sessionId;
  }

  /**
   * Generate a unique session ID
   */
  private static generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    const userAgent = typeof navigator !== 'undefined' 
      ? navigator.userAgent.slice(-10).replace(/\W/g, '') 
      : '';
    
    return `${timestamp}_${random}_${userAgent}`.substring(0, 32);
  }

  /**
   * Get session metadata
   */
  static getSessionMetadata() {
    if (typeof window === 'undefined') {
      return {
        userAgent: '',
        language: 'en',
        timezone: 'UTC',
        screenResolution: '0x0',
        referrer: ''
      };
    }

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      referrer: document.referrer || 'direct'
    };
  }

  /**
   * Check if session is new (created in last 30 seconds)
   */
  static isNewSession(): boolean {
    if (typeof window === 'undefined') return true;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return true;

      const { timestamp } = JSON.parse(stored);
      return Date.now() - timestamp < 30000; // 30 seconds
    } catch {
      return true;
    }
  }

  /**
   * Force create new session (for testing)
   */
  static forceNewSession(): string {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    return this.createNewSession();
  }
}
