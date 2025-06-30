"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupabaseDebug() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const log = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSupabaseConnection = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      // Check environment variables
      log(`🔍 Checking environment variables...`);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      log(`URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
      log(`Key: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);

      if (!supabaseUrl || !supabaseKey) {
        log('❌ Supabase credentials missing in environment');
        setTesting(false);
        return;
      }

      // Test Supabase import
      log(`📦 Testing Supabase import...`);
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      log('✅ Supabase client created');

      // Test basic connection
      log(`🔗 Testing database connection...`);
      const { data, error } = await supabase.from('user_sessions').select('count', { count: 'exact', head: true });
      
      if (error) {
        log(`❌ Connection error: ${error.message}`);
      } else {
        log(`✅ Connected! Found ${data} existing sessions`);
      }

      // Test insert permission
      log(`📝 Testing insert permissions...`);
      const testSession = {
        session_id: `test_${Date.now()}`,
        start_time: new Date().toISOString(),
        total_commands: 0,
        total_questions: 0,
        theme_used: 'test',
        device_info: 'test',
        user_agent: 'test',
        screen_resolution: '1920x1080'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('user_sessions')
        .insert([testSession])
        .select();

      if (insertError) {
        log(`❌ Insert failed: ${insertError.message}`);
        if (insertError.message.includes('RLS')) {
          log('💡 Hint: Row Level Security (RLS) might be blocking inserts');
        }
      } else {
        log(`✅ Insert successful! Created test session`);
        
        // Clean up test data
        await supabase.from('user_sessions').delete().eq('session_id', testSession.session_id);
        log(`🧹 Cleaned up test data`);
      }

      // Test analytics event insert
      log(`📊 Testing analytics event insert...`);
      const testEvent = {
        session_id: `test_${Date.now()}`,
        event_type: 'command',
        event_data: { command: 'test' },
        user_agent: 'test',
        device_type: 'test',
        screen_resolution: '1920x1080'
      };

      const { error: eventError } = await supabase
        .from('analytics_events')
        .insert([testEvent]);

      if (eventError) {
        log(`❌ Event insert failed: ${eventError.message}`);
      } else {
        log(`✅ Event insert successful!`);
        // Clean up
        await supabase.from('analytics_events').delete().eq('session_id', testEvent.session_id);
        log(`🧹 Cleaned up test event`);
      }

    } catch (error) {
      log(`💥 Unexpected error: ${error}`);
    }
    
    setTesting(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Supabase Connection Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testSupabaseConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testing...' : 'Test Supabase Connection'}
        </Button>
        
        {results.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="mb-1">{result}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
