// LLM Service for real AI chat responses

export interface LLMResponse {
  content: string;
  model: string;
  responseTime: number;
  tokensUsed?: number;
}

export interface ResumeContext {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  experience: string;
  skills: {
    frontend: string[];
    backend: string[];
    cloud: string[];
    tools: string[];
  };
  companies: string[];
  achievements: string[];
  education: string;
  currentWork: string;
  availability: string;
}

const TIJO_RESUME_CONTEXT: ResumeContext = {
  name: "Tijo Thomas",
  role: "Senior Frontend Engineer",
  location: "Manchester, UK",
  email: "tijo1293@gmail.com",
  phone: "+44 7818 989060",
  linkedin: "linkedin.com/in/tijo-j-thomaz93",
  experience: "8+ years of frontend development experience",
  skills: {
    frontend: ["Angular", "React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Sass"],
    backend: ["Go", "Node.js"],
    cloud: ["AWS Amplify", "Lambda", "DynamoDB", "Cognito", "API Gateway", "S3"],
    tools: ["Git", "VS Code", "Chrome DevTools", "Postman", "Figma", "Highcharts", "Chart.js"]
  },
  companies: ["Bet365", "Infosys", "NetObjex", "QBurst Technologies", "Speridian Technologies"],
  achievements: [
    "Migrated legacy .NET systems to modern TypeScript + Go architecture at Bet365",
    "Led enterprise reporting dashboard development for Home Depot & eBay",
    "Mentored frontend developers and established coding best practices",
    "Built COVID-19 employee onboarding portal during pandemic",
    "Developed cloud-based parking dashboards with AWS stack",
    "Performance improvements of 40% through modern architecture migration"
  ],
  education: "MCA & BCA from M.G. University, Kottayam, India",
  currentWork: "Currently working at Bet365 on system modernization and Go backend services",
  availability: "Available for senior frontend roles, technical leadership positions, and consulting opportunities"
};

export class LLMService {
  private static readonly GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private static readonly MODEL = 'llama3-8b-8192'; // Fast and efficient
  
  // Alternative: Gemini API
  // private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  static async generateResponse(userMessage: string, conversationHistory: string[] = []): Promise<LLMResponse> {
    const startTime = Date.now();
    
    try {
      // Use Groq API (free tier)
      if (process.env.GROQ_API_KEY) {
        return await this.generateGroqResponse(userMessage, conversationHistory);
      }
      
      // Fallback to Gemini
      if (process.env.GEMINI_API_KEY) {
        return await this.generateGeminiResponse(userMessage, conversationHistory);
      }
      
      throw new Error('No LLM API key configured');
      
    } catch (error) {
      console.error('LLM Generation Error:', error);
      const responseTime = Date.now() - startTime;
      
      // Fallback to enhanced local response
      return {
        content: this.generateFallbackResponse(userMessage),
        model: 'fallback-enhanced',
        responseTime
      };
    }
  }

  private static async generateGroqResponse(userMessage: string, conversationHistory: string[]): Promise<LLMResponse> {
    const startTime = Date.now();
    
    const systemPrompt = this.buildSystemPrompt();
    const context = conversationHistory.slice(-4).join('\n'); // Last 4 messages for context
    
    const response = await fetch(this.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Context: ${context}\n\nQuestion: ${userMessage}` }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    return {
      content: data.choices[0].message.content,
      model: this.MODEL,
      responseTime,
      tokensUsed: data.usage?.total_tokens
    };
  }

  private static async generateGeminiResponse(userMessage: string, conversationHistory: string[]): Promise<LLMResponse> {
    const startTime = Date.now();
    
    const systemPrompt = this.buildSystemPrompt();
    const context = conversationHistory.slice(-4).join('\n');
    const fullPrompt = `${systemPrompt}\n\nContext: ${context}\n\nQuestion: ${userMessage}`;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    return {
      content: data.candidates[0].content.parts[0].text,
      model: 'gemini-pro',
      responseTime
    };
  }

  private static buildSystemPrompt(): string {
    const resume = TIJO_RESUME_CONTEXT;
    
    return `You are an AI assistant representing ${resume.name}, a ${resume.role} from ${resume.location}. 

PROFILE OVERVIEW:
- Name: ${resume.name}
- Role: ${resume.role} 
- Location: ${resume.location}
- Experience: ${resume.experience}
- Contact: ${resume.email}, ${resume.phone}
- LinkedIn: ${resume.linkedin}

CURRENT WORK:
${resume.currentWork}

TECHNICAL SKILLS:
- Frontend: ${resume.skills.frontend.join(', ')}
- Backend: ${resume.skills.backend.join(', ')}
- Cloud: ${resume.skills.cloud.join(', ')}
- Tools: ${resume.skills.tools.join(', ')}

WORK HISTORY:
Companies: ${resume.companies.join(', ')}

KEY ACHIEVEMENTS:
${resume.achievements.map(a => `- ${a}`).join('\n')}

EDUCATION:
${resume.education}

AVAILABILITY:
${resume.availability}

INSTRUCTIONS:
1. Always respond as if you are representing Tijo professionally
2. Be knowledgeable about his technical background and experience
3. Provide specific details about his work at each company when asked
4. Be enthusiastic about his skills and achievements
5. Always include contact information when relevant
6. Keep responses conversational but professional
7. If asked about something not in his background, politely redirect to his actual experience
8. Highlight his mentoring experience and leadership skills
9. Emphasize his expertise in modern web technologies and architecture migration

Respond naturally and helpfully to questions about Tijo's professional background, skills, and availability.`;
  }

  private static generateFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Enhanced fallback with more dynamic responses
    if (lowerMessage.includes('experience') || lowerMessage.includes('work')) {
      return `I'd be happy to tell you about Tijo's professional journey! He has ${TIJO_RESUME_CONTEXT.experience} and is currently working at ${TIJO_RESUME_CONTEXT.companies[0]} on system modernization. His career spans from trainee to senior engineer, with experience at major companies like ${TIJO_RESUME_CONTEXT.companies.slice(0, 3).join(', ')}. He's particularly known for migrating legacy systems and mentoring development teams. Would you like to know more about any specific role or project?`;
    }
    
    if (lowerMessage.includes('skill') || lowerMessage.includes('tech')) {
      return `Tijo is a well-rounded engineer with strong expertise in modern web technologies! His core skills include:\n\n**Frontend**: ${TIJO_RESUME_CONTEXT.skills.frontend.join(', ')}\n**Backend**: ${TIJO_RESUME_CONTEXT.skills.backend.join(', ')}\n**Cloud**: ${TIJO_RESUME_CONTEXT.skills.cloud.join(', ')}\n\nHe's particularly strong in Angular and TypeScript, currently working with Go at Bet365. His experience spans both frontend excellence and full-stack development. What specific technology would you like to know more about?`;
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('hire')) {
      return `Great question! Tijo is ${TIJO_RESUME_CONTEXT.availability.toLowerCase()}. You can reach him at:\n\n📧 **Email**: ${TIJO_RESUME_CONTEXT.email}\n📱 **Phone**: ${TIJO_RESUME_CONTEXT.phone}\n💼 **LinkedIn**: ${TIJO_RESUME_CONTEXT.linkedin}\n📍 **Location**: ${TIJO_RESUME_CONTEXT.location}\n\nHe's especially interested in senior frontend roles and technical leadership positions. Feel free to reach out to discuss opportunities!`;
    }
    
    return `Thanks for your question about Tijo! I'm currently running in enhanced mode with detailed knowledge about his ${TIJO_RESUME_CONTEXT.experience} as a ${TIJO_RESUME_CONTEXT.role}. Feel free to ask about his technical skills, work experience at companies like ${TIJO_RESUME_CONTEXT.companies.slice(0, 2).join(' and ')}, or how to get in touch. What would you like to know more about?`;
  }

  // Rate limiting helper
  static async checkRateLimit(sessionId: string): Promise<boolean> {
    // Implement simple in-memory rate limiting
    // In production, use Redis or database
    const key = `rate_limit_${sessionId}`;
    const limit = parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '10');
    
    // Simple implementation - in production use proper rate limiting
    return true; // For now, allow all requests
  }
}
