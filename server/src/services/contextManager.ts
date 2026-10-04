import { ChatMessage } from '../types';

export interface SlidingWindowResult {
  messages: ChatMessage[];
  truncatedTurns: number;
}

export function applySlidingWindow(
  messages: ChatMessage[],
  maxTurns: number = 6
): SlidingWindowResult {
  if (!messages || messages.length <= maxTurns + 1) { // +1 for system message
    return { messages: messages || [], truncatedTurns: 0 };
  }

  const systemMessage = messages.find(m => m.role === 'system');
  const nonSystemMessages = messages.filter(m => m.role !== 'system');

  if (nonSystemMessages.length <= maxTurns) {
    return { messages, truncatedTurns: 0 };
  }

  const truncatedNonSystem = nonSystemMessages.slice(-maxTurns);
  const truncatedTurns = nonSystemMessages.length - maxTurns;

  const resultMessages: ChatMessage[] = [];
  if (systemMessage) {
    resultMessages.push(systemMessage);
  }
  resultMessages.push(...truncatedNonSystem);

  return {
    messages: resultMessages,
    truncatedTurns
  };
}
