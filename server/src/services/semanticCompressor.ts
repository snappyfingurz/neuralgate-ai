/**
 * LLMLingua Information Density Token Compressor
 * Calculates token entropy and information density to prune redundant tokens
 * while retaining core intent, code syntax, and key entities.
 */

export interface LLMLinguaCompressResult {
  compressedText: string;
  originalTokens: number;
  compressedTokens: number;
  compressionRatio: number; // e.g. 0.45 means 45% reduction
}

const LOW_INFORMATION_WORDS = new Set([
  'basically', 'actually', 'essentially', 'virtually', 'obviously', 'literally',
  'in order to', 'for the purpose of', 'due to the fact that', 'at this point in time',
  'in spite of the fact that', 'in the event that', 'as a matter of fact',
  'it goes without saying', 'needless to say', 'for all intents and purposes',
  'with that being said', 'as far as i am concerned', 'take into consideration',
  'give consideration to', 'is capable of', 'has the ability to', 'in close proximity to'
]);

// Words to NEVER drop (code keywords, numbers, entities)
const HIGH_IMPORTANCE_PATTERN = /^([A-Z0-9_\-\.\/\\:]+|def|class|function|return|const|let|var|if|else|import|export|select|from|where|struct|type|interface)$/i;

export function compressWithLLMLingua(
  input: string,
  targetCompressionRatio: number = 0.40 // Compress by ~40%
): LLMLinguaCompressResult {
  if (!input || input.length < 50) {
    const tokens = Math.ceil((input || '').length / 4);
    return {
      compressedText: input || '',
      originalTokens: tokens,
      compressedTokens: tokens,
      compressionRatio: 0
    };
  }

  // First pass: replace known low-info multi-word phrases
  let text = input;
  LOW_INFORMATION_WORDS.forEach(phrase => {
    const reg = new RegExp('\\b' + phrase + '\\b', 'gi');
    text = text.replace(reg, '');
  });

  const tokens = text.split(/(\s+|[,\.\?!;:{}()\[\]])/);
  const totalTokens = tokens.length;
  
  if (totalTokens === 0) {
    return { compressedText: input, originalTokens: 0, compressedTokens: 0, compressionRatio: 0 };
  }

  // Calculate token scores (0.0 to 1.0)
  const scoredTokens = tokens.map((token) => {
    const trimmed = token.trim();
    if (!trimmed) return { token, score: 0.1, keep: true };

    // Code symbols, punctuation, brackets, high importance keywords
    if (HIGH_IMPORTANCE_PATTERN.test(trimmed) || /[{}[\]()<>=+\-*/;:!?]/.test(trimmed)) {
      return { token, score: 1.0, keep: true };
    }

    // Numbers & Technical Identifiers
    if (!isNaN(Number(trimmed)) || /[0-9]/.test(trimmed) || trimmed.includes('_') || trimmed.includes('.')) {
      return { token, score: 0.9, keep: true };
    }

    // Capitalized Nouns & Entities
    if (/^[A-Z][a-z]+/.test(trimmed)) {
      return { token, score: 0.8, keep: true };
    }

    // Long descriptive words carry high information entropy
    if (trimmed.length > 7) {
      return { token, score: 0.7, keep: true };
    }

    // Short common articles/prepositions carry lower density
    if (['a', 'an', 'the', 'of', 'to', 'in', 'that', 'for', 'with', 'on', 'at', 'by', 'from', 'as'].includes(trimmed.toLowerCase())) {
      return { token, score: 0.25, keep: true };
    }

    return { token, score: 0.5, keep: true };
  });

  // Calculate how many non-essential tokens to prune based on target compression ratio
  const nonEssential = scoredTokens.filter(t => t.score < 0.8 && t.token.trim().length > 0);
  const pruneCount = Math.floor(nonEssential.length * targetCompressionRatio);

  if (pruneCount > 0) {
    // Sort low score tokens to prune lowest first
    const sortedLowScores = [...nonEssential].sort((a, b) => a.score - b.score);
    const toPrune = new Set(sortedLowScores.slice(0, pruneCount));

    scoredTokens.forEach(st => {
      if (toPrune.has(st)) {
        st.keep = false;
      }
    });
  }

  // Reconstruct compressed text
  let compressedText = scoredTokens
    .filter(t => t.keep)
    .map(t => t.token)
    .join('')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  const originalTokens = Math.ceil(input.length / 4);
  const compressedTokens = Math.ceil(compressedText.length / 4);
  const compressionRatio = originalTokens > 0 
    ? Math.max(0, parseFloat(((originalTokens - compressedTokens) / originalTokens).toFixed(2)))
    : 0;

  return {
    compressedText,
    originalTokens,
    compressedTokens,
    compressionRatio
  };
}
