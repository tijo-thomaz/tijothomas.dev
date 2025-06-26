// Simplified chat route for testing
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Chat API called');
    
    const { message, sessionId } = await request.json();
    console.log('📝 Received message:', message);

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Check if we have environment variables
    const hasGroqKey = !!process.env.GROQ_API_KEY;
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    console.log('🔑 Environment check:', { hasGroqKey, hasSupabase });

    // Simple fallback response for testing
    let response = "I'm a test response! Your message was: " + message;
    
    // Try Groq if we have the key
    if (hasGroqKey) {
      try {
        console.log('🤖 Trying Groq API...');
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              { 
                role: 'system', 
                content: 'You are an AI assistant representing Tijo Thomas, a Senior Frontend Engineer from Manchester, UK. Be helpful and professional.' 
              },
              { role: 'user', content: message }
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          response = data.choices[0].message.content;
          console.log('✅ Groq response received');
        } else {
          console.error('❌ Groq API error:', groqResponse.status);
          response = "I'm using a fallback response since Groq API isn't working. " + response;
        }
      } catch (error) {
        console.error('❌ Groq error:', error);
        response = "Groq API failed, using fallback: " + response;
      }
    } else {
      response = "No Groq API key found, using fallback: " + response;
    }

    return NextResponse.json({
      response: response,
      model: hasGroqKey ? 'groq-test' : 'fallback',
      responseTime: 1000,
      debug: { hasGroqKey, hasSupabase }
    });

  } catch (error) {
    console.error('💥 Chat API Error:', error);
    return NextResponse.json(
      { 
        error: 'API Error: ' + (error as Error).message,
        fallback: true
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Chat API is working!',
    timestamp: new Date().toISOString(),
    env: {
      hasGroq: !!process.env.GROQ_API_KEY,
      hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  });
}
