/**
 * Local Vector Embedding Generator & Cosine Similarity Engine
 * Converts text prompts into a 128-dimensional normalized dense vector representation.
 * Allows zero-cost, high-speed semantic similarity matching.
 */

const VECTOR_DIM = 128;

export function generateEmbedding(text: string): number[] {
  const normalized = text.toLowerCase().trim();
  const vector = new Array(VECTOR_DIM).fill(0);
  
  if (!normalized) return vector;

  // 1. Word tokenization
  const words = normalized.split(/\s+/);
  
  // 2. Character n-gram hashing to populate dense vector buckets
  words.forEach(word => {
    // Word hashing
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash * 31 + word.charCodeAt(i)) % VECTOR_DIM;
      if (hash < 0) hash += VECTOR_DIM;
      vector[hash] += 1.0;
    }
    
    // Subword n-grams (3-grams, 4-grams) for semantic similarity resilience
    for (let n = 3; n <= 4; n++) {
      if (word.length >= n) {
        for (let i = 0; i <= word.length - n; i++) {
          const ngram = word.substring(i, i + n);
          let nHash = 0;
          for (let j = 0; j < ngram.length; j++) {
            nHash = (nHash * 37 + ngram.charCodeAt(j)) % VECTOR_DIM;
            if (nHash < 0) nHash += VECTOR_DIM;
          }
          vector[nHash] += 0.5;
        }
      }
    }
  });

  // 3. L2 Normalization (Unit Length vector)
  let norm = 0;
  for (let i = 0; i < VECTOR_DIM; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < VECTOR_DIM; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  
  return dotProduct / denom;
}
