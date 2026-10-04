export interface LexicalCompressResult {
  text: string;
  strippedCount: number;
  originalTokens: number;
  compressedTokens: number;
}

const FILLER_PATTERNS = [
  /\b(please|kindly|if you don't mind|would you mind|i was wondering if|could you please|can you please|thanks in advance|thank you in advance|as an ai language model|hi there|hello|dear ai|best regards|sincerely|thanks!|thank you!)\b/gi,
  /\b(i would like to request that you|is it possible for you to|would it be okay if you|do you think you could)\b/gi,
  /\b(i want to know|tell me if possible|give me an answer to|make sure to|be so kind as to)\b/gi
];

export function compressLexically(input: string): LexicalCompressResult {
  if (!input) {
    return { text: '', strippedCount: 0, originalTokens: 0, compressedTokens: 0 };
  }

  let text = input;
  let strippedCount = 0;

  FILLER_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      strippedCount += matches.length;
      text = text.replace(pattern, '');
    }
  });

  // Whitespace & line break normalization
  text = text
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();

  const originalTokens = Math.ceil(input.length / 4);
  const compressedTokens = Math.ceil(text.length / 4);

  return {
    text,
    strippedCount,
    originalTokens,
    compressedTokens
  };
}
