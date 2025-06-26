// Enhanced chat route with portfolio context
import { NextRequest, NextResponse } from 'next/server';

// Configure function timeout for Vercel
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Chat API called');
    
    const { message, sessionId, portfolioContext } = await request.json();
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
        
        // Build detailed system prompt with portfolio context
        const systemPrompt = portfolioContext ? `You are an AI assistant representing ${portfolioContext.name}, a ${portfolioContext.role} from ${portfolioContext.location}.

PROFILE OVERVIEW:
- Name: ${portfolioContext.name}
- Role: ${portfolioContext.role}
- Location: ${portfolioContext.location}
- Experience: ${portfolioContext.experience}
- Contact: ${portfolioContext.email}, ${portfolioContext.phone}
- LinkedIn: ${portfolioContext.linkedin}

CURRENT WORK:
${portfolioContext.currentWork}

TECHNICAL SKILLS:
- Frontend: ${portfolioContext.skills.frontend.join(', ')}
- Backend: ${portfolioContext.skills.backend.join(', ')}
- State Management: ${portfolioContext.skills.stateManagement.join(', ')}
- Testing: ${portfolioContext.skills.testing.join(', ')}
- Cloud: ${portfolioContext.skills.cloud.join(', ')}
- Tools: ${portfolioContext.skills.tools.join(', ')}

COMPANIES: ${portfolioContext.companies.join(', ')}
MAJOR CLIENTS: ${portfolioContext.majorClients.join(', ')}

KEY ACHIEVEMENTS:
${portfolioContext.achievements.map((a: string) => `- ${a}`).join('\n')}

EDUCATION: ${portfolioContext.education}

AVAILABILITY: ${portfolioContext.availability}

INSTRUCTIONS:
- Always respond as if you are representing Tijo professionally
- Provide specific details about his work and achievements
- Be enthusiastic about his technical expertise
- Include contact information when relevant
- Keep responses conversational but professional
- Focus on his actual experience and skills from the context above` 
        : 'You are an AI assistant representing Tijo Thomas, a Senior Frontend Engineer from Manchester, UK. Be helpful and professional.';
        
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 400,
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
