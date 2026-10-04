import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getSettings, saveTelemetryLog } from '../db';
import { ChatCompletionRequest, ChatMessage, GatewayResponse, PipelineBreakdown, TelemetryLogRecord } from '../types';
import { checkSemanticCache, storeInSemanticCache } from '../services/semanticCache';
import { applySlidingWindow } from '../services/contextManager';
import { alignPrefixCache } from '../services/prefixCache';
import { compressLexically } from '../services/lexicalCompressor';
import { compressWithLLMLingua } from '../services/semanticCompressor';
import { routeRequest, RouteDecision } from '../services/router';
import { applyOutputConstraining } from '../services/outputConstrainer';
import { executeLLMCall, calculateCostUsd } from '../services/llmExecution';

const router = Router();

// OpenAI Compatible Endpoint: POST /v1/chat/completions
router.post('/v1/chat/completions', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const body: ChatCompletionRequest = req.body;
  const settings = await getSettings();

  const originalMessages: ChatMessage[] = body.messages || [];
  if (originalMessages.length === 0) {
    return res.status(400).json({ error: { message: "Messages array cannot be empty." } });
  }

  const lastUserMsg = originalMessages.filter(m => m.role === 'user').pop();
  const rawUserPrompt = lastUserMsg ? lastUserMsg.content : '';

  // Original prompt token calculation (before optimization)
  const originalFullText = originalMessages.map(m => m.content).join(' ');
  const originalPromptTokens = Math.ceil(originalFullText.length / 4);

  const requestedModel = body.model || 'gpt-4o';

  // Toggle checks (Request body overrides global settings if provided)
  const isSemanticCacheActive = body.enable_semantic_cache !== undefined ? body.enable_semantic_cache : settings.semantic_cache_enabled;
  const isCompressionActive = body.enable_compression !== undefined ? body.enable_compression : (settings.lexical_compression_enabled || settings.llmlingua_compression_enabled);
  const isRoutingActive = body.enable_routing !== undefined ? body.enable_routing : settings.dynamic_routing_enabled;
  const isConstrainingActive = body.enable_output_constraining !== undefined ? body.enable_output_constraining : settings.output_constraining_enabled;

  // STEP 1: Multi-Tier Semantic Caching Engine (Zero Cost)
  if (isSemanticCacheActive && rawUserPrompt) {
    const cacheResult = await checkSemanticCache(rawUserPrompt, settings.semantic_similarity_threshold);
    if (cacheResult.hit && cacheResult.cachedResponse) {
      const latencyMs = Date.now() - startTime;
      const outputTokens = Math.ceil(cacheResult.cachedResponse.length / 4);
      const originalCostUsd = calculateCostUsd(requestedModel, originalPromptTokens, outputTokens, false);

      const telemetry: PipelineBreakdown = {
        originalPromptTokens,
        compressedPromptTokens: 0,
        outputTokens,
        savedTokens: originalPromptTokens,
        originalEstimatedCostUsd: originalCostUsd,
        finalCostUsd: 0,
        savedCostUsd: originalCostUsd,
        latencyMs,
        semanticCacheHit: true,
        similarityScore: cacheResult.similarityScore,
        lexicalStrippedCount: 0,
        llmLinguaCompressionRatio: 1.0,
        prefixCached: false,
        detectedIntent: 'simple_qa',
        selectedModel: 'cache-hit',
        routedTier: 'cached',
        confidenceEscalated: false,
        outputConstrained: false,
        windowTruncatedTurns: 0
      };

      // Record Telemetry Log for Cache Hit
      const logRecord: TelemetryLogRecord = {
        id: 'log-' + crypto.randomUUID().substring(0, 8),
        timestamp: new Date().toISOString(),
        original_prompt: rawUserPrompt,
        final_prompt: '[SEMANIC CACHE HIT - API BYPASSED]',
        response_text: cacheResult.cachedResponse,
        original_model: requestedModel,
        routed_model: 'cache-hit',
        intent: 'simple_qa',
        tier: 'cached',
        semantic_cache_hit: 1,
        similarity_score: cacheResult.similarityScore,
        original_prompt_tokens: originalPromptTokens,
        compressed_prompt_tokens: 0,
        output_tokens: outputTokens,
        saved_tokens: originalPromptTokens,
        original_cost_usd: originalCostUsd,
        final_cost_usd: 0,
        saved_cost_usd: originalCostUsd,
        latency_ms: latencyMs,
        lexical_stripped_count: 0,
        compression_ratio: 1.0,
        confidence_escalated: 0
      };
      await saveTelemetryLog(logRecord);

      const responsePayload: GatewayResponse = {
        id: 'chatcmpl-' + crypto.randomUUID().substring(0, 12),
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'semantic-cache-v1',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: cacheResult.cachedResponse },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: outputTokens,
          total_tokens: outputTokens,
          cached_tokens: originalPromptTokens
        },
        gateway_telemetry: telemetry
      };

      return res.json(responsePayload);
    }
  }

  // STEP 2: Sliding Window Memory Management
  let workingMessages = [...originalMessages];
  let truncatedTurns = 0;
  if (settings.sliding_window_enabled) {
    const windowResult = applySlidingWindow(workingMessages, settings.max_history_turns);
    workingMessages = windowResult.messages;
    truncatedTurns = windowResult.truncatedTurns;
  }

  // STEP 3: Prefix Caching Alignment
  let prefixCached = false;
  if (settings.prefix_caching_enabled) {
    const prefixResult = alignPrefixCache(workingMessages);
    workingMessages = prefixResult.reorderedMessages;
    prefixCached = prefixResult.prefixCached;
  }

  // STEP 4: Algorithmic Prompt Compression (Lexical + LLMLingua)
  let lexicalStrippedCount = 0;
  let llmLinguaCompressionRatio = 0;

  if (isCompressionActive) {
    workingMessages = workingMessages.map(msg => {
      let content = msg.content;
      
      // Lexical Stripping
      if (settings.lexical_compression_enabled && msg.role === 'user') {
        const lexicalResult = compressLexically(content);
        content = lexicalResult.text;
        lexicalStrippedCount += lexicalResult.strippedCount;
      }

      // LLMLingua Token Density Compression
      if (settings.llmlingua_compression_enabled && (msg.role === 'user' || msg.role === 'assistant')) {
        const lingResult = compressWithLLMLingua(content, settings.target_compression_ratio);
        content = lingResult.compressedText;
        llmLinguaCompressionRatio = Math.max(llmLinguaCompressionRatio, lingResult.compressionRatio);
      }

      return { ...msg, content };
    });
  }

  const finalPromptText = workingMessages.map(m => m.content).join(' ');
  const compressedPromptTokens = Math.ceil(finalPromptText.length / 4);

  // STEP 5: Dynamic Model Routing
  let routeDecision: RouteDecision = {
    intent: 'simple_qa',
    selectedModel: requestedModel,
    tier: 'flagship',
    confidenceEscalated: false,
    reason: 'Routing disabled'
  };

  if (isRoutingActive) {
    routeDecision = routeRequest(
      rawUserPrompt,
      requestedModel,
      settings.cheap_model_name,
      settings.flagship_model_name,
      settings.confidence_threshold
    );
  }

  // STEP 6: Output Constraining
  let maxTokens = body.max_tokens || 512;
  let outputConstrained = false;
  if (isConstrainingActive) {
    const outputResult = applyOutputConstraining(workingMessages, routeDecision.intent, body.max_tokens);
    workingMessages = outputResult.messages;
    maxTokens = outputResult.maxTokens;
    outputConstrained = outputResult.outputConstrained;
  }

  // STEP 7: LLM Execution
  const llmResult = await executeLLMCall(
    workingMessages,
    routeDecision.selectedModel,
    settings,
    routeDecision.intent,
    maxTokens
  );

  const totalLatencyMs = Date.now() - startTime;

  // STEP 8: Telemetry & Cost Savings Calculation
  const originalCostUsd = calculateCostUsd(requestedModel, originalPromptTokens, llmResult.outputTokens, false);
  const finalCostUsd = calculateCostUsd(routeDecision.selectedModel, compressedPromptTokens, llmResult.outputTokens, prefixCached);
  const savedCostUsd = Math.max(0, parseFloat((originalCostUsd - finalCostUsd).toFixed(6)));
  const savedTokens = Math.max(0, originalPromptTokens - compressedPromptTokens);

  const telemetry: PipelineBreakdown = {
    originalPromptTokens,
    compressedPromptTokens,
    outputTokens: llmResult.outputTokens,
    savedTokens,
    originalEstimatedCostUsd: originalCostUsd,
    finalCostUsd,
    savedCostUsd,
    latencyMs: totalLatencyMs,
    semanticCacheHit: false,
    similarityScore: 0,
    lexicalStrippedCount,
    llmLinguaCompressionRatio,
    prefixCached,
    detectedIntent: routeDecision.intent,
    selectedModel: routeDecision.selectedModel,
    routedTier: routeDecision.tier,
    confidenceEscalated: routeDecision.confidenceEscalated,
    outputConstrained,
    windowTruncatedTurns: truncatedTurns
  };

  // Save Telemetry Log
  const logRecord: TelemetryLogRecord = {
    id: 'log-' + crypto.randomUUID().substring(0, 8),
    timestamp: new Date().toISOString(),
    original_prompt: rawUserPrompt,
    final_prompt: finalPromptText,
    response_text: llmResult.responseText,
    original_model: requestedModel,
    routed_model: routeDecision.selectedModel,
    intent: routeDecision.intent,
    tier: routeDecision.tier,
    semantic_cache_hit: 0,
    similarity_score: 0,
    original_prompt_tokens: originalPromptTokens,
    compressed_prompt_tokens: compressedPromptTokens,
    output_tokens: llmResult.outputTokens,
    saved_tokens: savedTokens,
    original_cost_usd: originalCostUsd,
    final_cost_usd: finalCostUsd,
    saved_cost_usd: savedCostUsd,
    latency_ms: totalLatencyMs,
    lexical_stripped_count: lexicalStrippedCount,
    compression_ratio: llmLinguaCompressionRatio,
    confidence_escalated: routeDecision.confidenceEscalated ? 1 : 0
  };
  await saveTelemetryLog(logRecord);

  // Store in Semantic Cache for future queries
  if (isSemanticCacheActive && rawUserPrompt) {
    storeInSemanticCache(rawUserPrompt, llmResult.responseText, routeDecision.selectedModel).catch(console.error);
  }

  const responsePayload: GatewayResponse = {
    id: 'chatcmpl-' + crypto.randomUUID().substring(0, 12),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: routeDecision.selectedModel,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: llmResult.responseText },
        finish_reason: 'stop'
      }
    ],
    usage: {
      prompt_tokens: compressedPromptTokens,
      completion_tokens: llmResult.outputTokens,
      total_tokens: compressedPromptTokens + llmResult.outputTokens,
      cached_tokens: prefixCached ? Math.floor(compressedPromptTokens * 0.7) : 0
    },
    gateway_telemetry: telemetry
  };

  return res.json(responsePayload);
});

export default router;
