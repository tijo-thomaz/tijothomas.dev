import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body; // 'visit', 'command', or 'question'
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    if (type === 'visit') {
      // Increment daily visit count
      const { error } = await supabase.rpc('increment_daily_visits', {
        input_date: today
      });
      
      if (error) {
        console.warn('Supabase visit tracking failed:', error);
        return NextResponse.json({ success: false, error: error.message });
      }
    } 
    else if (type === 'command') {
      // Increment commands used count
      const { error } = await supabase.rpc('increment_usage_stat', {
        input_date: today,
        input_type: 'commands_used'
      });
      
      if (error) {
        console.warn('Supabase command tracking failed:', error);
        return NextResponse.json({ success: false, error: error.message });
      }
    }
    else if (type === 'question') {
      // Increment AI questions count
      const { error } = await supabase.rpc('increment_usage_stat', {
        input_date: today,
        input_type: 'ai_questions'
      });
      
      if (error) {
        console.warn('Supabase question tracking failed:', error);
        return NextResponse.json({ success: false, error: error.message });
      }
    }

    return NextResponse.json({ success: true });

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
    // Get daily visits
    const { data: visitsData, error: visitsError } = await supabase
      .from('daily_visits')
      .select('*')
      .order('visit_date', { ascending: false })
      .limit(30); // Last 30 days

    // Get usage stats
    const { data: usageData, error: usageError } = await supabase
      .from('usage_stats')
      .select('*')
      .order('stat_date', { ascending: false })
      .limit(30); // Last 30 days

    if (visitsError || usageError) {
      console.warn('Supabase read error:', visitsError || usageError);
      return NextResponse.json({ 
        visits: [],
        usage: [],
        error: 'Database read failed'
      });
    }

    return NextResponse.json({
      visits: visitsData || [],
      usage: usageData || [],
      totalVisits: visitsData?.reduce((sum, day) => sum + (day.visit_count || 0), 0) || 0,
      totalCommands: usageData?.reduce((sum, day) => sum + (day.commands_used || 0), 0) || 0,
      totalQuestions: usageData?.reduce((sum, day) => sum + (day.ai_questions || 0), 0) || 0,
    });

  } catch (error) {
    console.error('Analytics GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
