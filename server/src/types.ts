export type ModelTier = 'cheap' | 'flagship' | 'cached';

export type IntentType = 'extraction' | 'summarization' | 'simple_qa' | 'code' | 'reasoning';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  cache_control?: { type: 'ephemeral' };
}

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  user?: string;
  response_format?: { type: string };
  // Gateway specific overrides
  enable_semantic_cache?: boolean;
  enable_compression?: boolean;
  enable_routing?: boolean;
  enable_output_constraining?: boolean;
}

export interface PipelineBreakdown {
  originalPromptTokens: number;
  compressedPromptTokens: number;
  outputTokens: number;
  savedTokens: number;
  originalEstimatedCostUsd: number;
  finalCostUsd: number;
  savedCostUsd: number;
  latencyMs: number;
  semanticCacheHit: boolean;
  similarityScore?: number;
  lexicalStrippedCount: number;
  llmLinguaCompressionRatio: number;
  prefixCached: boolean;
  detectedIntent: IntentType;
  selectedModel: string;
  routedTier: ModelTier;
  confidenceEscalated: boolean;
  outputConstrained: boolean;
  windowTruncatedTurns: number;
}

export interface GatewayResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cached_tokens?: number;
  };
  gateway_telemetry: PipelineBreakdown;
}

export interface TelemetryLogRecord {
  id: string;
  timestamp: string;
  original_prompt: string;
  final_prompt: string;
  response_text: string;
  original_model: string;
  routed_model: string;
  intent: IntentType;
  tier: ModelTier;
  semantic_cache_hit: number;
  similarity_score: number;
  original_prompt_tokens: number;
  compressed_prompt_tokens: number;
  output_tokens: number;
  saved_tokens: number;
  original_cost_usd: number;
  final_cost_usd: number;
  saved_cost_usd: number;
  latency_ms: number;
  lexical_stripped_count: number;
  compression_ratio: number;
  confidence_escalated: number;
}

export interface GatewaySettings {
  id?: number;
  semantic_cache_enabled: boolean;
  semantic_similarity_threshold: number; // e.g. 0.95
  prefix_caching_enabled: boolean;
  lexical_compression_enabled: boolean;
  llmlingua_compression_enabled: boolean;
  target_compression_ratio: number; // e.g. 0.4 (compress by 40%)
  dynamic_routing_enabled: boolean;
  cheap_model_name: string; // e.g. 'gpt-4o-mini' or 'claude-3-haiku'
  flagship_model_name: string; // e.g. 'gpt-4o' or 'claude-3-5-sonnet'
  confidence_threshold: number; // e.g. 0.8
  sliding_window_enabled: boolean;
  max_history_turns: number;
  output_constraining_enabled: boolean;
  openai_api_key?: string;
  anthropic_api_key?: string;
}

export interface CacheEntry {
  id: string;
  prompt_text: string;
  prompt_embedding: number[];
  response_text: string;
  model: string;
  created_at: string;
  hit_count: number;
}
