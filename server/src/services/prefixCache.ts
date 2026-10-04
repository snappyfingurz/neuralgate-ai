import { ChatMessage } from '../types';

export interface PrefixCacheResult {
  reorderedMessages: ChatMessage[];
  prefixCached: boolean;
  staticTokenCount: number;
}

export function alignPrefixCache(messages: ChatMessage[]): PrefixCacheResult {
  if (!messages || messages.length === 0) {
    return { reorderedMessages: messages, prefixCached: false, staticTokenCount: 0 };
  }

  const systemMessages: ChatMessage[] = [];
  const ragOrToolMessages: ChatMessage[] = [];
  const userAndAssistantMessages: ChatMessage[] = [];

  messages.forEach(msg => {
    if (msg.role === 'system') {
      // Add Anthropic/OpenAI ephemeral prompt caching marker to static system block
      systemMessages.push({
        ...msg,
        cache_control: { type: 'ephemeral' }
      });
    } else if (msg.role === 'tool' || (msg.content && msg.content.length > 500 && msg.role !== 'user')) {
      // Large static documentation or tool definitions
      ragOrToolMessages.push({
        ...msg,
        cache_control: { type: 'ephemeral' }
      });
    } else {
      userAndAssistantMessages.push(msg);
    }
  });

  const reorderedMessages = [
    ...systemMessages,
    ...ragOrToolMessages,
    ...userAndAssistantMessages
  ];

  // Calculate static token count approximation
  const staticContent = [...systemMessages, ...ragOrToolMessages].map(m => m.content).join(' ');
  const staticTokenCount = Math.ceil(staticContent.length / 4);

  return {
    reorderedMessages,
    prefixCached: systemMessages.length > 0 || ragOrToolMessages.length > 0,
    staticTokenCount
  };
}
