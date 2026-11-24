import { useState, useCallback } from 'react';
import { CHAT_UNAVAILABLE_MESSAGE } from '../../chat-assistant/model/chatUnavailable';

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
  
  // U-04 (SQ-01 c): chat is off, so no request is ever in flight.
  const isLoading = false;
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<PromptShieldResponse | null>(null);

  // U-04 (SQ-01 c, ADR-P2): /api/chat is removed. No request is sent; the reply is the fixed
  // CHAT_UNAVAILABLE_MESSAGE, marked as passing so callers show it as is.
  const generateResponse = useCallback(async (
    _request: PromptShieldRequest
  ): Promise<PromptShieldResponse> => {
    const unavailable: PromptShieldResponse = {
      response: CHAT_UNAVAILABLE_MESSAGE,
      model: 'chat-disabled',
      responseTime: 0,
      shieldChecks: {
        toxicity: { passed: true, confidence: 1 },
        hallucination: { passed: true, confidence: 1 },
        context: { passed: true, confidence: 1 },
      },
      flagged: false,
    };
    setError(null);
    setLastResponse(unavailable);
    return unavailable;
  }, []);

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
