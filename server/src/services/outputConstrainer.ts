import { ChatMessage, IntentType } from '../types';

export interface OutputConstrainResult {
  messages: ChatMessage[];
  maxTokens: number;
  outputConstrained: boolean;
}

export function applyOutputConstraining(
  messages: ChatMessage[],
  intent: IntentType,
  requestedMaxTokens?: number
): OutputConstrainResult {
  let outputConstrained = false;
  let maxTokens = requestedMaxTokens || 512;

  // Add system instruction for concise output
  let systemInstruction = " [SYSTEM DIRECTIVE: Output the concise answer directly. Omit conversational filler, polite greetings, and redundant preambles.]";

  if (intent === 'extraction') {
    systemInstruction += " [Ensure valid RFC-8259 JSON output.]";
    maxTokens = requestedMaxTokens || 350;
  } else if (intent === 'summarization') {
    maxTokens = requestedMaxTokens || 400;
  } else if (intent === 'simple_qa') {
    maxTokens = requestedMaxTokens || 250;
  } else if (intent === 'code') {
    maxTokens = requestedMaxTokens || 1024;
  }

  const updatedMessages = [...messages];
  const systemIdx = updatedMessages.findIndex(m => m.role === 'system');

  if (systemIdx >= 0) {
    updatedMessages[systemIdx] = {
      ...updatedMessages[systemIdx],
      content: updatedMessages[systemIdx].content + systemInstruction
    };
    outputConstrained = true;
  } else {
    updatedMessages.unshift({
      role: 'system',
      content: systemInstruction.trim()
    });
    outputConstrained = true;
  }

  return {
    messages: updatedMessages,
    maxTokens,
    outputConstrained
  };
}
