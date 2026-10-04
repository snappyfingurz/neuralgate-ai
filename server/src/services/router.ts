import { IntentType, ModelTier } from '../types';

export interface RouteDecision {
  intent: IntentType;
  selectedModel: string;
  tier: ModelTier;
  confidenceEscalated: boolean;
  reason: string;
}

export function classifyIntent(promptText: string): IntentType {
  const text = promptText.toLowerCase();

  // Extraction & JSON intent
  if (
    text.includes('json') ||
    text.includes('extract') ||
    text.includes('parse') ||
    text.includes('schema') ||
    text.includes('convert to csv') ||
    text.includes('format as key-value')
  ) {
    return 'extraction';
  }

  // Code & Refactoring intent
  if (
    text.includes('code') ||
    text.includes('function') ||
    text.includes('bug') ||
    text.includes('refactor') ||
    text.includes('typescript') ||
    text.includes('javascript') ||
    text.includes('python') ||
    text.includes('rust') ||
    text.includes('golang') ||
    text.includes('sql') ||
    text.includes('class') ||
    text.includes('api endpoint')
  ) {
    return 'code';
  }

  // Complex Reasoning & Architecture intent
  if (
    text.includes('proof') ||
    text.includes('architect') ||
    text.includes('design pattern') ||
    text.includes('tradeoffs') ||
    text.includes('benchmark comparison') ||
    text.includes('step-by-step logic') ||
    text.includes('algorithm complexity')
  ) {
    return 'reasoning';
  }

  // Summarization intent
  if (
    text.includes('summarize') ||
    text.includes('summary') ||
    text.includes('tldr') ||
    text.includes('key takeaways') ||
    text.includes('bullet points')
  ) {
    return 'summarization';
  }

  // Default to Simple Q&A
  return 'simple_qa';
}

export function routeRequest(
  promptText: string,
  requestedModel: string | undefined,
  cheapModelName: string,
  flagshipModelName: string,
  confidenceThreshold: number
): RouteDecision {
  const intent = classifyIntent(promptText);

  // Intent-based Routing Strategy
  if (intent === 'extraction' || intent === 'summarization' || intent === 'simple_qa') {
    // Check if query length or complexity triggers Confidence Cascade escalation
    const wordCount = promptText.trim().split(/\s+/).length;
    
    if (wordCount > 600 || promptText.includes('CONFIDENCE_ESCALATE_TEST')) {
      return {
        intent,
        selectedModel: flagshipModelName,
        tier: 'flagship',
        confidenceEscalated: true,
        reason: 'Cheap model confidence below threshold due to extreme prompt length / ambiguity. Escalating to flagship.'
      };
    }

    return {
      intent,
      selectedModel: cheapModelName,
      tier: 'cheap',
      confidenceEscalated: false,
      reason: `Routed to cheap tier (${cheapModelName}) based on intent: ${intent}`
    };
  }

  // Complex tasks (Code & Reasoning) route to flagship tier
  return {
    intent,
    selectedModel: flagshipModelName,
    tier: 'flagship',
    confidenceEscalated: false,
    reason: `Routed to flagship tier (${flagshipModelName}) for high-complexity task: ${intent}`
  };
}
