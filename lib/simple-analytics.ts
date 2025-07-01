// Truly anonymous analytics - localStorage + Supabase aggregate counts
interface SimpleAnalytics {
  visits: number;
  commands: number;
  questions: number;
  sessionStart: number;
  lastCommand: string;
}

const ANALYTICS_KEY = 'portfolio-analytics';
const SUPABASE_ENABLED = true; // Set to true to send aggregate counts to Supabase

function getSimpleAnalytics(): SimpleAnalytics {
  if (typeof window === 'undefined') {
    return {
      visits: 0,
      commands: 0,
      questions: 0,
      sessionStart: Date.now(),
      lastCommand: '',
    };
  }

  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    const defaultData: SimpleAnalytics = {
      visits: 0,
      commands: 0,
      questions: 0,
      sessionStart: Date.now(),
      lastCommand: '',
    };

    if (!stored) return defaultData;
    return { ...defaultData, ...JSON.parse(stored) };
  } catch {
    return {
      visits: 0,
      commands: 0,
      questions: 0,
      sessionStart: Date.now(),
      lastCommand: '',
    };
  }
}

function saveAnalytics(data: SimpleAnalytics) {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Analytics save failed:', error);
  }
}

// Send anonymous aggregate data to Supabase
async function sendToSupabase(type: 'visit' | 'command' | 'question') {
  if (!SUPABASE_ENABLED || typeof window === 'undefined') return;
  
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, timestamp: Date.now() })
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.warn('Supabase analytics failed:', error);
  }
}

export function trackVisit() {
  const data = getSimpleAnalytics();
  data.visits += 1;
  data.sessionStart = Date.now();
  saveAnalytics(data);
  
  // Send aggregate count to Supabase
  sendToSupabase('visit');
}

export function trackCommand(command: string) {
  const data = getSimpleAnalytics();
  data.commands += 1;
  data.lastCommand = command;
  saveAnalytics(data);
  
  // Send aggregate count to Supabase
  sendToSupabase('command');
}

export function trackQuestion() {
  const data = getSimpleAnalytics();
  data.questions += 1;
  saveAnalytics(data);
  
  // Send aggregate count to Supabase
  sendToSupabase('question');
}

export function getAnalyticsData(): SimpleAnalytics {
  return getSimpleAnalytics();
}

export function clearAnalytics() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ANALYTICS_KEY);
}

export function getAnalyticsSummary() {
  const data = getSimpleAnalytics();
  const sessionTime = Math.round((Date.now() - data.sessionStart) / 1000 / 60);
  
  return {
    visits: data.visits,
    commands: data.commands,
    questions: data.questions,
    sessionTime: sessionTime > 0 ? `${sessionTime}m` : '<1m',
    lastCommand: data.lastCommand || 'none',
  };
}
