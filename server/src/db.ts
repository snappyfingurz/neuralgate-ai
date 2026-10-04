import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { GatewaySettings, TelemetryLogRecord, CacheEntry } from './types';

const DB_PATH = path.join(process.cwd(), 'gateway.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at:', DB_PATH);
  }
});

// Initialize Tables
export function initDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Settings Table
      db.run(`
        CREATE TABLE IF NOT EXISTS gateway_settings (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          semantic_cache_enabled INTEGER DEFAULT 1,
          semantic_similarity_threshold REAL DEFAULT 0.95,
          prefix_caching_enabled INTEGER DEFAULT 1,
          lexical_compression_enabled INTEGER DEFAULT 1,
          llmlingua_compression_enabled INTEGER DEFAULT 1,
          target_compression_ratio REAL DEFAULT 0.40,
          dynamic_routing_enabled INTEGER DEFAULT 1,
          cheap_model_name TEXT DEFAULT 'gpt-4o-mini',
          flagship_model_name TEXT DEFAULT 'gpt-4o',
          confidence_threshold REAL DEFAULT 0.80,
          sliding_window_enabled INTEGER DEFAULT 1,
          max_history_turns INTEGER DEFAULT 6,
          output_constraining_enabled INTEGER DEFAULT 1,
          openai_api_key TEXT DEFAULT '',
          anthropic_api_key TEXT DEFAULT ''
        )
      `);

      // Telemetry Logs Table
      db.run(`
        CREATE TABLE IF NOT EXISTS telemetry_logs (
          id TEXT PRIMARY KEY,
          timestamp TEXT,
          original_prompt TEXT,
          final_prompt TEXT,
          response_text TEXT,
          original_model TEXT,
          routed_model TEXT,
          intent TEXT,
          tier TEXT,
          semantic_cache_hit INTEGER,
          similarity_score REAL,
          original_prompt_tokens INTEGER,
          compressed_prompt_tokens INTEGER,
          output_tokens INTEGER,
          saved_tokens INTEGER,
          original_cost_usd REAL,
          final_cost_usd REAL,
          saved_cost_usd REAL,
          latency_ms INTEGER,
          lexical_stripped_count INTEGER,
          compression_ratio REAL,
          confidence_escalated INTEGER
        )
      `);

      // Semantic Cache Table
      db.run(`
        CREATE TABLE IF NOT EXISTS semantic_cache (
          id TEXT PRIMARY KEY,
          prompt_text TEXT,
          prompt_embedding TEXT, -- JSON string array of numbers
          response_text TEXT,
          model TEXT,
          created_at TEXT,
          hit_count INTEGER DEFAULT 1
        )
      `, (err) => {
        if (err) return reject(err);
        
        // Seed default settings if empty
        db.get('SELECT COUNT(*) as count FROM gateway_settings', (err, row: any) => {
          if (row && row.count === 0) {
            db.run(`
              INSERT INTO gateway_settings (id) VALUES (1)
            `);
          }
          
          // Seed sample telemetry if empty so dashboard is rich out-of-the-box
          seedSampleDataIfNeeded().then(resolve).catch(reject);
        });
      });
    });
  });
}

// Get Gateway Settings
export function getSettings(): Promise<GatewaySettings> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM gateway_settings WHERE id = 1', (err, row: any) => {
      if (err) return reject(err);
      if (!row) {
        return resolve({
          semantic_cache_enabled: true,
          semantic_similarity_threshold: 0.95,
          prefix_caching_enabled: true,
          lexical_compression_enabled: true,
          llmlingua_compression_enabled: true,
          target_compression_ratio: 0.40,
          dynamic_routing_enabled: true,
          cheap_model_name: 'gpt-4o-mini',
          flagship_model_name: 'gpt-4o',
          confidence_threshold: 0.80,
          sliding_window_enabled: true,
          max_history_turns: 6,
          output_constraining_enabled: true,
          openai_api_key: '',
          anthropic_api_key: ''
        });
      }
      resolve({
        ...row,
        semantic_cache_enabled: Boolean(row.semantic_cache_enabled),
        prefix_caching_enabled: Boolean(row.prefix_caching_enabled),
        lexical_compression_enabled: Boolean(row.lexical_compression_enabled),
        llmlingua_compression_enabled: Boolean(row.llmlingua_compression_enabled),
        dynamic_routing_enabled: Boolean(row.dynamic_routing_enabled),
        sliding_window_enabled: Boolean(row.sliding_window_enabled),
        output_constraining_enabled: Boolean(row.output_constraining_enabled)
      });
    });
  });
}

// Update Gateway Settings
export function updateSettings(settings: Partial<GatewaySettings>): Promise<void> {
  return new Promise((resolve, reject) => {
    getSettings().then(current => {
      const merged = { ...current, ...settings };
      db.run(`
        UPDATE gateway_settings SET
          semantic_cache_enabled = ?,
          semantic_similarity_threshold = ?,
          prefix_caching_enabled = ?,
          lexical_compression_enabled = ?,
          llmlingua_compression_enabled = ?,
          target_compression_ratio = ?,
          dynamic_routing_enabled = ?,
          cheap_model_name = ?,
          flagship_model_name = ?,
          confidence_threshold = ?,
          sliding_window_enabled = ?,
          max_history_turns = ?,
          output_constraining_enabled = ?,
          openai_api_key = ?,
          anthropic_api_key = ?
        WHERE id = 1
      `, [
        merged.semantic_cache_enabled ? 1 : 0,
        merged.semantic_similarity_threshold,
        merged.prefix_caching_enabled ? 1 : 0,
        merged.lexical_compression_enabled ? 1 : 0,
        merged.llmlingua_compression_enabled ? 1 : 0,
        merged.target_compression_ratio,
        merged.dynamic_routing_enabled ? 1 : 0,
        merged.cheap_model_name,
        merged.flagship_model_name,
        merged.confidence_threshold,
        merged.sliding_window_enabled ? 1 : 0,
        merged.max_history_turns,
        merged.output_constraining_enabled ? 1 : 0,
        merged.openai_api_key || '',
        merged.anthropic_api_key || ''
      ], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

// Insert Telemetry Log
export function saveTelemetryLog(log: TelemetryLogRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO telemetry_logs (
        id, timestamp, original_prompt, final_prompt, response_text,
        original_model, routed_model, intent, tier, semantic_cache_hit,
        similarity_score, original_prompt_tokens, compressed_prompt_tokens,
        output_tokens, saved_tokens, original_cost_usd, final_cost_usd,
        saved_cost_usd, latency_ms, lexical_stripped_count, compression_ratio,
        confidence_escalated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      log.id, log.timestamp, log.original_prompt, log.final_prompt, log.response_text,
      log.original_model, log.routed_model, log.intent, log.tier, log.semantic_cache_hit,
      log.similarity_score, log.original_prompt_tokens, log.compressed_prompt_tokens,
      log.output_tokens, log.saved_tokens, log.original_cost_usd, log.final_cost_usd,
      log.saved_cost_usd, log.latency_ms, log.lexical_stripped_count, log.compression_ratio,
      log.confidence_escalated
    ], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Get Recent Telemetry Logs
export function getTelemetryLogs(limit = 100): Promise<TelemetryLogRecord[]> {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM telemetry_logs ORDER BY timestamp DESC LIMIT ?`, [limit], (err, rows: any[]) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

// Get Aggregate Analytics Metrics
export function getAnalyticsSummary(): Promise<{
  totalRequests: number;
  totalOriginalTokens: number;
  totalCompressedTokens: number;
  totalSavedTokens: number;
  totalOriginalCostUsd: number;
  totalFinalCostUsd: number;
  totalSavedCostUsd: number;
  cacheHitRatePct: number;
  avgCompressionRatioPct: number;
  avgLatencyMs: number;
  intentBreakdown: Record<string, number>;
  tierBreakdown: Record<string, number>;
}> {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM telemetry_logs', (err, rows: any[]) => {
      if (err) return reject(err);
      if (!rows || rows.length === 0) {
        return resolve({
          totalRequests: 0,
          totalOriginalTokens: 0,
          totalCompressedTokens: 0,
          totalSavedTokens: 0,
          totalOriginalCostUsd: 0,
          totalFinalCostUsd: 0,
          totalSavedCostUsd: 0,
          cacheHitRatePct: 0,
          avgCompressionRatioPct: 0,
          avgLatencyMs: 0,
          intentBreakdown: {},
          tierBreakdown: {}
        });
      }

      let totalOriginalTokens = 0;
      let totalCompressedTokens = 0;
      let totalSavedTokens = 0;
      let totalOriginalCostUsd = 0;
      let totalFinalCostUsd = 0;
      let totalSavedCostUsd = 0;
      let cacheHits = 0;
      let totalRatioSum = 0;
      let totalLatencySum = 0;

      const intentBreakdown: Record<string, number> = {};
      const tierBreakdown: Record<string, number> = {};

      rows.forEach(r => {
        totalOriginalTokens += r.original_prompt_tokens || 0;
        totalCompressedTokens += r.compressed_prompt_tokens || 0;
        totalSavedTokens += r.saved_tokens || 0;
        totalOriginalCostUsd += r.original_cost_usd || 0;
        totalFinalCostUsd += r.final_cost_usd || 0;
        totalSavedCostUsd += r.saved_cost_usd || 0;
        if (r.semantic_cache_hit) cacheHits++;
        totalRatioSum += r.compression_ratio || 0;
        totalLatencySum += r.latency_ms || 0;

        const intent = r.intent || 'unknown';
        intentBreakdown[intent] = (intentBreakdown[intent] || 0) + 1;

        const tier = r.tier || 'flagship';
        tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
      });

      const totalRequests = rows.length;
      resolve({
        totalRequests,
        totalOriginalTokens,
        totalCompressedTokens,
        totalSavedTokens,
        totalOriginalCostUsd: parseFloat(totalOriginalCostUsd.toFixed(4)),
        totalFinalCostUsd: parseFloat(totalFinalCostUsd.toFixed(4)),
        totalSavedCostUsd: parseFloat(totalSavedCostUsd.toFixed(4)),
        cacheHitRatePct: parseFloat(((cacheHits / totalRequests) * 100).toFixed(1)),
        avgCompressionRatioPct: parseFloat(((totalRatioSum / totalRequests) * 100).toFixed(1)),
        avgLatencyMs: Math.round(totalLatencySum / totalRequests),
        intentBreakdown,
        tierBreakdown
      });
    });
  });
}

// Get All Cache Entries
export function getCacheEntries(): Promise<CacheEntry[]> {
  return new Promise((resolve, reject) => {
    db.all(`SELECT id, prompt_text, prompt_embedding, response_text, model, created_at, hit_count FROM semantic_cache ORDER BY hit_count DESC`, (err, rows: any[]) => {
      if (err) return reject(err);
      const items = (rows || []).map(r => ({
        ...r,
        prompt_embedding: JSON.parse(r.prompt_embedding || '[]')
      }));
      resolve(items);
    });
  });
}

// Save Cache Entry
export function saveCacheEntry(entry: CacheEntry): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO semantic_cache (id, prompt_text, prompt_embedding, response_text, model, created_at, hit_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      entry.id,
      entry.prompt_text,
      JSON.stringify(entry.prompt_embedding),
      entry.response_text,
      entry.model,
      entry.created_at,
      entry.hit_count || 1
    ], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Increment Cache Hit Count
export function incrementCacheHit(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE semantic_cache SET hit_count = hit_count + 1 WHERE id = ?`, [id], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Seed initial realistic telemetry data for instant wow factor
async function seedSampleDataIfNeeded(): Promise<void> {
  return new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM telemetry_logs', (err, row: any) => {
      if (row && row.count > 0) return resolve();

      const sampleQueries = [
        {
          prompt: "Please kindly summarize the attached quarterly financial report and highlight key metrics if you don't mind.",
          finalPrompt: "Summarize quarterly financial report and highlight key metrics.",
          response: "Financial Summary Q3:\n- Revenue: $4.2M (+14% YoY)\n- Gross Margin: 68%\n- Net Profit: $820K\n- Key Highlight: Enterprise ARR grew by 22% driven by new SaaS integrations.",
          intent: 'summarization', tier: 'cheap', origTokens: 850, compTokens: 240, outTokens: 110, origCost: 0.0042, finalCost: 0.0003, savedCost: 0.0039, latency: 280, lexical: 12, ratio: 0.71, cacheHit: 0, sim: 0.42
        },
        {
          prompt: "Please kindly summarize the attached quarterly financial report and highlight key metrics if you don't mind.",
          finalPrompt: "Summarize quarterly financial report and highlight key metrics.",
          response: "Financial Summary Q3:\n- Revenue: $4.2M (+14% YoY)\n- Gross Margin: 68%\n- Net Profit: $820K\n- Key Highlight: Enterprise ARR grew by 22% driven by new SaaS integrations.",
          intent: 'summarization', tier: 'cached', origTokens: 850, compTokens: 0, outTokens: 110, origCost: 0.0042, finalCost: 0.0000, savedCost: 0.0042, latency: 4, lexical: 0, ratio: 1.0, cacheHit: 1, sim: 0.98
        },
        {
          prompt: "Extract customer name, email address, total order amount, and purchase items as valid JSON from this text.",
          finalPrompt: "Extract name, email, order total, purchase items as JSON.",
          response: '{\n  "customer_name": "Sarah Connor",\n  "email": "sarah@cyberdyne.io",\n  "total_amount": 349.99,\n  "items": ["Neural Network Chipset v2", "Cybernetic Cooling Kit"]\n}',
          intent: 'extraction', tier: 'cheap', origTokens: 420, compTokens: 160, outTokens: 75, origCost: 0.0021, finalCost: 0.0001, savedCost: 0.0020, latency: 190, lexical: 8, ratio: 0.62, cacheHit: 0, sim: 0.35
        },
        {
          prompt: "Write a high-performance Rust concurrent queue with lock-free ring buffer and atomic memory orderings.",
          finalPrompt: "Write high-performance Rust concurrent queue with lock-free ring buffer and atomic memory orderings.",
          response: "```rust\nuse std::sync::atomic::{AtomicUsize, Ordering};\n// Lock-free SPSC Ring Buffer implementation\npub struct RingBuffer<T> {\n    buffer: Vec<T>,\n    head: AtomicUsize,\n    tail: AtomicUsize,\n}\n```",
          intent: 'code', tier: 'flagship', origTokens: 1200, compTokens: 680, outTokens: 450, origCost: 0.0125, finalCost: 0.0035, savedCost: 0.0090, latency: 1420, lexical: 6, ratio: 0.43, cacheHit: 0, sim: 0.21
        },
        {
          prompt: "What is the capital city of France?",
          finalPrompt: "Capital city France?",
          response: "Paris.",
          intent: 'simple_qa', tier: 'cheap', origTokens: 45, compTokens: 12, outTokens: 5, origCost: 0.0003, finalCost: 0.00002, savedCost: 0.00028, latency: 110, lexical: 4, ratio: 0.73, cacheHit: 0, sim: 0.15
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO telemetry_logs (
          id, timestamp, original_prompt, final_prompt, response_text,
          original_model, routed_model, intent, tier, semantic_cache_hit,
          similarity_score, original_prompt_tokens, compressed_prompt_tokens,
          output_tokens, saved_tokens, original_cost_usd, final_cost_usd,
          saved_cost_usd, latency_ms, lexical_stripped_count, compression_ratio,
          confidence_escalated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = new Date();
      sampleQueries.forEach((q, idx) => {
        const timeOffset = new Date(now.getTime() - (idx * 15 * 60 * 1000)).toISOString();
        const id = 'log-seed-' + (idx + 1);
        stmt.run([
          id, timeOffset, q.prompt, q.finalPrompt, q.response,
          'gpt-4o', q.tier === 'cached' ? 'cache-hit' : (q.tier === 'cheap' ? 'gpt-4o-mini' : 'gpt-4o'),
          q.intent, q.tier, q.cacheHit, q.sim,
          q.origTokens, q.compTokens, q.outTokens, (q.origTokens - q.compTokens),
          q.origCost, q.finalCost, q.savedCost, q.latency, q.lexical, q.ratio, 0
        ]);
      });

      stmt.finalize(() => resolve());
    });
  });
}
