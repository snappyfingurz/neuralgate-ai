import crypto from 'crypto';
import { generateEmbedding, cosineSimilarity } from './embedding';
import { getCacheEntries, saveCacheEntry, incrementCacheHit } from '../db';
import { CacheEntry } from '../types';

export interface SemanticCacheResult {
  hit: boolean;
  similarityScore: number;
  cachedResponse?: string;
  cacheId?: string;
}

export async function checkSemanticCache(
  promptText: string,
  similarityThreshold: number
): Promise<SemanticCacheResult> {
  const queryVector = generateEmbedding(promptText);
  const cacheEntries = await getCacheEntries();

  let bestMatch: CacheEntry | null = null;
  let maxSimilarity = 0;

  for (const entry of cacheEntries) {
    if (!entry.prompt_embedding || entry.prompt_embedding.length === 0) continue;
    
    // Direct exact string check optimization
    if (entry.prompt_text.trim().toLowerCase() === promptText.trim().toLowerCase()) {
      bestMatch = entry;
      maxSimilarity = 1.0;
      break;
    }

    const sim = cosineSimilarity(queryVector, entry.prompt_embedding);
    if (sim > maxSimilarity) {
      maxSimilarity = sim;
      bestMatch = entry;
    }
  }

  if (bestMatch && maxSimilarity >= similarityThreshold) {
    await incrementCacheHit(bestMatch.id);
    return {
      hit: true,
      similarityScore: parseFloat(maxSimilarity.toFixed(4)),
      cachedResponse: bestMatch.response_text,
      cacheId: bestMatch.id
    };
  }

  return {
    hit: false,
    similarityScore: parseFloat(maxSimilarity.toFixed(4))
  };
}

export async function storeInSemanticCache(
  promptText: string,
  responseText: string,
  model: string
): Promise<void> {
  const queryVector = generateEmbedding(promptText);
  const newEntry: CacheEntry = {
    id: 'cache-' + crypto.randomUUID().substring(0, 8),
    prompt_text: promptText,
    prompt_embedding: queryVector,
    response_text: responseText,
    model: model,
    created_at: new Date().toISOString(),
    hit_count: 1
  };

  await saveCacheEntry(newEntry);
}
