import React, { useState } from 'react';
import { Terminal, Send, RefreshCw } from 'lucide-react';

interface PlaygroundProps {
  onRefresh: () => void;
}

const SAMPLE_PROMPTS = [
  {
    title: "Verbose Summarization (Compress Test)",
    prompt: "Please kindly summarize the attached quarterly financial report and highlight key metrics if you don't mind. I would like to request that you provide a brief overview of revenue growth and profit margins."
  },
  {
    title: "Data Extraction (Cheap Tier Router)",
    prompt: "Extract customer name, email address, total order amount, and purchase items as valid RFC-8259 JSON from this email snippet: 'Hello, I am Sarah Connor (sarah@cyberdyne.io). Order total is $349.99 for Chipset v2'."
  },
  {
    title: "Complex Code Logic (Flagship Escalation)",
    prompt: "Write a high-performance Rust concurrent queue with lock-free ring buffer and atomic memory orderings. Provide detailed structural invariants."
  },
  {
    title: "Semantic Cache Test (Run 2x to test 0-cost Hit!)",
    prompt: "What is the capital city of France and what are its major landmarks?"
  }
];

export const Playground: React.FC<PlaygroundProps> = ({ onRefresh }) => {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0].prompt);
  const [model, setModel] = useState('gpt-4o');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [enableCache, setEnableCache] = useState(true);
  const [enableCompression, setEnableCompression] = useState(true);
  const [enableRouting, setEnableRouting] = useState(true);
  const [enableConstraining, setEnableConstraining] = useState(true);

  const handleRunGateway = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          enable_semantic_cache: enableCache,
          enable_compression: enableCompression,
          enable_routing: enableRouting,
          enable_output_constraining: enableConstraining
        })
      });

      const data = await response.json();
      setResult(data);
      onRefresh();
    } catch (err) {
      console.error('Playground request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const telemetry = result?.gateway_telemetry;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="mac-window" style={{ padding: '16px' }}>
        <div className="mac-titlebar" style={{ margin: '-16px -16px 14px -16px', padding: '6px 12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>CRT TERMINAL EXECUTION PLAYGROUND</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {/* Left Form Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--bg-beige-light)', border: '2px solid var(--border-dark)', padding: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                LOAD SAMPLE TEST PROMPT:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {SAMPLE_PROMPTS.map((sp, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(sp.prompt)}
                    className="btn-retro"
                    style={{ textAlign: 'left', fontSize: '0.78rem', justifyContent: 'flex-start' }}
                  >
                    <strong>{sp.title}:</strong> "{sp.prompt.substring(0, 40)}..."
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                TARGET LLM MODEL:
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-beige-light)',
                  color: 'var(--text-dark)',
                  border: '2px solid var(--border-dark)',
                  padding: '8px',
                  fontFamily: 'var(--font-retro-code)',
                  fontWeight: 700
                }}
              >
                <option value="gpt-4o">GPT-4o ($2.50 / 1M input)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet ($3.00 / 1M input)</option>
                <option value="gpt-4o-mini">GPT-4o Mini ($0.15 / 1M input)</option>
                <option value="claude-3-haiku">Claude 3 Haiku ($0.25 / 1M input)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                INPUT PROMPT PAYLOAD:
              </label>
              <textarea
                rows={5}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0c140c',
                  color: '#33ff33',
                  border: '2px solid var(--border-dark)',
                  padding: '10px',
                  fontFamily: 'var(--font-retro-term)',
                  fontSize: '1.1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ background: 'var(--bg-bevel)', border: '2px solid var(--border-dark)', padding: '10px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                PIPELINE LAYERS ACTIVE:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={enableCache} onChange={(e) => setEnableCache(e.target.checked)} />
                  SEMANTIC CACHE
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={enableCompression} onChange={(e) => setEnableCompression(e.target.checked)} />
                  COMPRESSION
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={enableRouting} onChange={(e) => setEnableRouting(e.target.checked)} />
                  DYNAMIC ROUTER
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={enableConstraining} onChange={(e) => setEnableConstraining(e.target.checked)} />
                  CONSTRAINING
                </label>
              </div>
            </div>

            <button
              onClick={handleRunGateway}
              disabled={loading}
              className="btn-retro active"
              style={{ justifyContent: 'center', padding: '12px' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} /> EXECUTING PIPELINE...
                </>
              ) : (
                <>
                  <Send size={16} /> EXECUTE GATEWAY PROXY REQUEST
                </>
              )}
            </button>
          </div>

          {/* Right CRT Display Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {!result && !loading && (
              <div className="crt-screen" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <Terminal size={48} color="#33ff33" style={{ opacity: 0.5, marginBottom: '12px' }} />
                <div style={{ fontSize: '1.4rem' }}>&gt; AWAITING INPUT PROMPT EXECUTION</div>
                <p style={{ fontSize: '1.1rem', color: '#88cc88' }}>PRESS "EXECUTE GATEWAY PROXY REQUEST" TO RUN</p>
              </div>
            )}

            {result && telemetry && (
              <div className="crt-screen" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ borderBottom: '1px dashed #33ff33', paddingBottom: '6px' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: telemetry.semanticCacheHit ? '#33ff33' : '#ffcc00' }}>
                    {telemetry.semanticCacheHit ? '⚡ ZERO-COST SEMANTIC CACHE HIT [API BYPASSED]' : '🔥 GATEWAY OPTIMIZATION COMPLETED'}
                  </div>
                  <div style={{ fontSize: '1rem', color: '#a0f0a0' }}>
                    SAVED: ${telemetry.savedCostUsd.toFixed(6)} USD | TOKENS: {telemetry.savedTokens} | LATENCY: {telemetry.latencyMs}ms
                  </div>
                </div>

                <div style={{ fontSize: '1.05rem', lineHeight: '1.4' }}>
                  <div>&gt; INTENT DETECTED: <span style={{ color: '#ffcc00' }}>{telemetry.detectedIntent?.toUpperCase()}</span></div>
                  <div>&gt; ROUTED MODEL: <span style={{ color: '#00ccff' }}>{telemetry.selectedModel}</span></div>
                  <div>&gt; PROMPT TOKENS: {telemetry.originalPromptTokens} → {telemetry.compressedPromptTokens} TOKENS</div>
                </div>

                <div>
                  <div style={{ fontSize: '1rem', color: '#ffcc00', marginBottom: '4px' }}>&gt; COMPRESSION PROMPT DIFF:</div>
                  <div className="code-block-retro" style={{ fontSize: '1rem' }}>
                    {prompt}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '1rem', color: '#33ff33', marginBottom: '4px' }}>&gt; GENERATED COMPLETION RESPONSE:</div>
                  <div className="code-block-retro" style={{ fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                    {result.choices?.[0]?.message?.content || 'No completion returned.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
