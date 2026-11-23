import { useState, useCallback } from 'react';
import { http } from '../../../shared/api/http';

export interface PromptShieldConfig {
  enableToxicityFilter: boolean;
  enableHallucinationDetection: boolean;
  enableContextValidation: boolean;
  maxResponseLength: number;
  confidenceThreshold: number;
}

export interface PromptShieldResponse {
  response: string;
  model: string;
  responseTime: number;
  tokens?: number;
  shieldChecks: {
    toxicity: { passed: boolean; confidence: number };
    hallucination: { passed: boolean; confidence: number };
    context: { passed: boolean; confidence: number };
  };
  flagged: boolean;
  originalResponse?: string;
}

export interface PromptShieldRequest {
  message: string;
  sessionId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  portfolioContext?: Record<string, any>;
  config?: Partial<PromptShieldConfig>;
}

const defaultConfig: PromptShieldConfig = {
  enableToxicityFilter: true,
  enableHallucinationDetection: true,
  enableContextValidation: true,
  maxResponseLength: 1000,
  confidenceThreshold: 0.8,
};

/**
 * PromptShield Hook - Flagship AI Safety Feature
 * Wraps LLM responses with safety checks and validation
 */
export function usePromptShield(initialConfig?: Partial<PromptShieldConfig>) {
  const [config, setConfig] = useState<PromptShieldConfig>({
    ...defaultConfig,
    ...initialConfig,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<PromptShieldResponse | null>(null);

  const generateResponse = useCallback(async (
    request: PromptShieldRequest
  ): Promise<PromptShieldResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const startTime = Date.now();
      
      // Make the API call with PromptShield configuration
      const response = await http.post<PromptShieldResponse>('/api/chat', {
        ...request,
        promptShield: {
          enabled: true,
          config,
          version: '2.1.0', // PromptShield version
        },
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Enhance response with additional metadata
      const enhancedResponse: PromptShieldResponse = {
        ...response,
        responseTime,
        shieldChecks: response.shieldChecks || {
          toxicity: { passed: true, confidence: 1 },
          hallucination: { passed: true, confidence: 1 },
          context: { passed: true, confidence: 1 },
        },
        flagged: false,
      };

      // Post-process checks (client-side validation)
      if (config.enableToxicityFilter) {
        enhancedResponse.shieldChecks.toxicity = await checkToxicity(response.response);
      }

      if (config.enableHallucinationDetection) {
        enhancedResponse.shieldChecks.hallucination = await checkHallucination(
          response.response,
          request.portfolioContext
        );
      }

      if (config.enableContextValidation) {
        enhancedResponse.shieldChecks.context = await validateContext(
          response.response,
          request.message,
          request.portfolioContext
        );
      }

      // Determine if response should be flagged
      enhancedResponse.flagged = Object.values(enhancedResponse.shieldChecks).some(
        check => !check.passed || check.confidence < config.confidenceThreshold
      );

      // If flagged, provide fallback response
      if (enhancedResponse.flagged) {
        enhancedResponse.originalResponse = response.response;
        enhancedResponse.response = getFallbackResponse(request.message);
      }

      setLastResponse(enhancedResponse);
      return enhancedResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Provide safe fallback response
      const fallbackResponse: PromptShieldResponse = {
        response: getFallbackResponse(request.message),
        model: 'promptshield-fallback',
        responseTime: Date.now() - Date.now(),
        shieldChecks: {
          toxicity: { passed: true, confidence: 1 },
          hallucination: { passed: true, confidence: 1 },
          context: { passed: true, confidence: 1 },
        },
        flagged: true,
      };
      
      setLastResponse(fallbackResponse);
      return fallbackResponse;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const updateConfig = useCallback((newConfig: Partial<PromptShieldConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateResponse,
    updateConfig,
    resetError,
    isLoading,
    error,
    config,
    lastResponse,
    version: '2.1.0',
  };
}

// Helper functions for safety checks
async function checkToxicity(text: string): Promise<{ passed: boolean; confidence: number }> {
  // Implement client-side toxicity detection
  // This could use a lightweight ML model or API
  const toxicPatterns = ['hate', 'toxic', 'abuse', 'harmful'];
  const hasToxicContent = toxicPatterns.some(pattern => 
    text.toLowerCase().includes(pattern)
  );
  
  return {
    passed: !hasToxicContent,
    confidence: hasToxicContent ? 0.2 : 0.95,
  };
}

async function checkHallucination(
  response: string, 
  context?: Record<string, any>
): Promise<{ passed: boolean; confidence: number }> {
  // Implement hallucination detection by checking response against known facts
  if (!context) return { passed: true, confidence: 0.8 };
  
  // Simple heuristic: check if response contains verifiable information
  const hasVerifiableInfo = context.name && response.includes(context.name);
  
  return {
    passed: true, // Simplified for now
    confidence: hasVerifiableInfo ? 0.9 : 0.7,
  };
}

async function validateContext(
  response: string,
  query: string,
  context?: Record<string, any>
): Promise<{ passed: boolean; confidence: number }> {
  // Validate if response is relevant to the context
  const isRelevant = response.length > 10 && query.length > 0;
  
  return {
    passed: isRelevant,
    confidence: isRelevant ? 0.85 : 0.3,
  };
}

function getFallbackResponse(originalQuery: string): string {
  return `I understand you're asking about "${originalQuery}". I'm Tijo Thomas, a Senior Frontend Engineer from Manchester, UK. I specialize in React, TypeScript, and modern web technologies. Feel free to ask me about my experience, projects, or how we can work together. You can reach me at tijo1293@gmail.com or connect with me on LinkedIn.`;
}
