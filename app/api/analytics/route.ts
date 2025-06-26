import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, VisitorSession } from '@/lib/database';

// Configure function timeout for Vercel
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'start_session':
        const session: VisitorSession = {
          session_id: data.sessionId,
          visitor_id: data.visitorId,
          start_time: new Date().toISOString(),
          device_type: data.deviceType,
          user_agent: data.userAgent,
          theme_used: data.theme,
          sound_enabled: data.soundEnabled,
          zoom_level: data.zoomLevel,
          commands_executed: [],
          chat_questions: [],
        };

        const result = await DatabaseService.storeSession(session);
        return NextResponse.json({ success: true, session: result });

      case 'update_session':
        const updates = {
          commands_executed: data.commands || [],
          chat_questions: data.questions || [],
          theme_used: data.theme,
          sound_enabled: data.soundEnabled,
          zoom_level: data.zoomLevel,
        };

        await DatabaseService.updateSession(data.sessionId, updates);
        return NextResponse.json({ success: true });

      case 'end_session':
        const endUpdates = {
          end_time: new Date().toISOString(),
          duration_seconds: data.durationSeconds,
          commands_executed: data.commands || [],
          chat_questions: data.questions || [],
        };

        await DatabaseService.updateSession(data.sessionId, endUpdates);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const analytics = await DatabaseService.getAnalyticsSummary();

    if (!analytics) {
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Analytics GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
