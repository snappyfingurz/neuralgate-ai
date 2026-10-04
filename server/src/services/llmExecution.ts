import { ChatMessage, GatewaySettings, IntentType } from '../types';

export interface LLMExecutionResult {
  responseText: string;
  outputTokens: number;
  actualLatencyMs: number;
}

// Current LLM Provider Pricing per 1,000,000 Tokens (USD)
export const MODEL_PRICING: Record<string, { input: number; output: number; cachedInput: number }> = {
  'gpt-4o': { input: 2.50, output: 10.00, cachedInput: 1.25 },
  'claude-3-5-sonnet': { input: 3.00, output: 15.00, cachedInput: 0.30 },
  'gpt-4o-mini': { input: 0.15, output: 0.60, cachedInput: 0.075 },
  'claude-3-haiku': { input: 0.25, output: 1.25, cachedInput: 0.03 },
  'gemini-1.5-flash': { input: 0.15, output: 0.60, cachedInput: 0.0375 }
};

export function calculateCostUsd(
  model: string,
  promptTokens: number,
  outputTokens: number,
  prefixCached: boolean = false
): number {
  const price = MODEL_PRICING[model] || MODEL_PRICING['gpt-4o'];
  const inputRate = prefixCached ? price.cachedInput : price.input;
  
  const inputCost = (promptTokens / 1_000_000) * inputRate;
  const outputCost = (outputTokens / 1_000_000) * price.output;
  
  return parseFloat((inputCost + outputCost).toFixed(6));
}

export async function executeLLMCall(
  messages: ChatMessage[],
  model: string,
  settings: GatewaySettings,
  intent: IntentType,
  maxTokens: number
): Promise<LLMExecutionResult> {
  const startTime = Date.now();
  const userPrompt = messages.filter(m => m.role === 'user').pop()?.content || '';

  // If user provided a real OpenAI API key, we can execute real fetch if desired
  if (settings.openai_api_key && settings.openai_api_key.startsWith('sk-')) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.openai_api_key}`
        },
        body: JSON.stringify({
          model: model.includes('mini') ? 'gpt-4o-mini' : 'gpt-4o',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: maxTokens
        })
      });
      if (response.ok) {
        const data: any = await response.json();
        const responseText = data.choices?.[0]?.message?.content || 'No response generated.';
        const outputTokens = data.usage?.completion_tokens || Math.ceil(responseText.length / 4);
        return {
          responseText,
          outputTokens,
          actualLatencyMs: Date.now() - startTime
        };
      }
    } catch (e) {
      console.warn('Real OpenAI API call failed, falling back to gateway execution sandbox:', e);
    }
  }

  // Realistic Gateway Execution Sandbox (No key required for full feature demo!)
  const simulatedDelay = model.includes('mini') || model.includes('haiku') || model.includes('flash')
    ? 180 + Math.floor(Math.random() * 120)
    : 650 + Math.floor(Math.random() * 400);

  await new Promise(res => setTimeout(res, simulatedDelay));

  let responseText = '';
  if (intent === 'extraction') {
    responseText = JSON.stringify({
      status: "success",
      extracted_data: {
        query_intent: intent,
        extracted_entities: ["Entity_A", "Entity_B"],
        processed_at: new Date().toISOString()
      }
    }, null, 2);
  } else if (intent === 'summarization') {
    responseText = `Summary (${model}):\n1. Key objective analyzed and verified.\n2. Information processed concisely eliminating redundancy.\n3. Core conclusions delivered.`;
  } else if (intent === 'code') {
    responseText = `\`\`\`typescript\n// Generated using ${model}\nexport function processQuery(input: string): string {\n  return input.trim().toUpperCase();\n}\n\`\`\``;
  } else if (intent === 'reasoning') {
    responseText = `Step-by-step Analysis (${model}):\n1. Premise evaluation.\n2. Logical step deduction.\n3. Final synthesized conclusion verified.`;
  } else {
    responseText = `Answer (${model}): Here is the requested response to: "${userPrompt.substring(0, 60)}..."`;
  }

  const outputTokens = Math.ceil(responseText.length / 4);
  const actualLatencyMs = Date.now() - startTime;

  return {
    responseText,
    outputTokens,
    actualLatencyMs
  };
}
