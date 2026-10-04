import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie } from 'recharts';

interface OverviewDashboardProps {
  summary: any;
  logs: any[];
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ summary, logs }) => {
  if (!summary) return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-retro-code)' }}>LOADING TELEMETRY DATA...</div>;

  const chartData = (logs || []).slice().reverse().map((log, index) => ({
    name: `REQ #${index + 1}`,
    originalCost: log.original_cost_usd * 1000,
    finalCost: log.final_cost_usd * 1000,
    savedCost: log.saved_cost_usd * 1000,
  }));

  const intentData = Object.entries(summary.intentBreakdown || {}).map(([name, value]) => ({
    name: name.toUpperCase(),
    value: value as number
  }));

  const RETRO_COLORS = ['#33ff33', '#ffcc00', '#00ccff', '#ff6666', '#cccccc'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* CRT Main Banner */}
      <div className="crt-screen">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px dashed #33ff33', paddingBottom: '6px' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            &gt; SYSTEM MONITOR: TELEMETRY & COST OPTIMIZATION
          </span>
          <span style={{ fontSize: '1rem', color: '#ffcc00' }}>[CRT MONOCHROME PHOSPHOR DISPLAY]</span>
        </div>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.3' }}>
          MULTI-TIER CACHING & ALGORITHMIC PROMPT COMPRESSION ACTIVE.
          SIMILARITY MATCH THRESHOLD: 95% COSINE VECTOR DISTANCE.
        </p>
      </div>

      {/* Retro Bevel Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Card 1 */}
        <div className="mac-window" style={{ padding: '16px' }}>
          <div className="mac-titlebar" style={{ margin: '-16px -16px 12px -16px', padding: '4px 8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>STAT 01 // TOTAL USD SAVED</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-retro-term)', fontWeight: 700, color: 'var(--text-dark)' }}>
            ${summary.totalSavedCostUsd?.toFixed(4) || '0.0000'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Token cost dropped by up to <strong>90%</strong>
          </div>
        </div>

        {/* Card 2 */}
        <div className="mac-window" style={{ padding: '16px' }}>
          <div className="mac-titlebar" style={{ margin: '-16px -16px 12px -16px', padding: '4px 8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>STAT 02 // TOKENS SAVED</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-retro-term)', fontWeight: 700, color: 'var(--text-dark)' }}>
            {summary.totalSavedTokens?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Avg compression ratio: <strong>{summary.avgCompressionRatioPct}%</strong>
          </div>
        </div>

        {/* Card 3 */}
        <div className="mac-window" style={{ padding: '16px' }}>
          <div className="mac-titlebar" style={{ margin: '-16px -16px 12px -16px', padding: '4px 8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>STAT 03 // CACHE HIT RATE</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-retro-term)', fontWeight: 700, color: 'var(--text-dark)' }}>
            {summary.cacheHitRatePct}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Threshold: <strong>95% Cosine Similarity</strong>
          </div>
        </div>

        {/* Card 4 */}
        <div className="mac-window" style={{ padding: '16px' }}>
          <div className="mac-titlebar" style={{ margin: '-16px -16px 12px -16px', padding: '4px 8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>STAT 04 // LATENCY</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontFamily: 'var(--font-retro-term)', fontWeight: 700, color: 'var(--text-dark)' }}>
            {summary.avgLatencyMs} ms
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Cache hit latency: <strong>~4ms</strong>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '20px' }}>
        {/* Area Chart */}
        <div className="mac-window" style={{ padding: '16px' }}>
          <div className="mac-titlebar" style={{ margin: '-16px -16px 14px -16px', padding: '6px 12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>API COST COMPARISON (ORIGINAL VS GATEWAY OPTIMIZED)</span>
          </div>
          <div style={{ height: '260px', width: '100%', background: '#0c140c', padding: '10px', border: '2px solid #3a362d' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f331f" />
                <XAxis dataKey="name" stroke="#33ff33" fontSize={11} fontFamily="VT323" />
                <YAxis stroke="#33ff33" fontSize={11} fontFamily="VT323" unit="m$" />
                <Tooltip contentStyle={{ backgroundColor: '#0c140c', borderColor: '#33ff33', color: '#33ff33', fontFamily: 'VT323', fontSize: '16px' }} />
                <Area type="monotone" dataKey="originalCost" name="Original Cost" stroke="#ff6666" fill="#ff6666" fillOpacity={0.3} />
                <Area type="monotone" dataKey="finalCost" name="Gateway Cost" stroke="#33ff33" fill="#33ff33" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intent Distribution */}
        <div className="mac-window" style={{ padding: '16px' }}>
          <div className="mac-titlebar" style={{ margin: '-16px -16px 14px -16px', padding: '6px 12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>QUERY INTENT CLASSIFICATION BREAKDOWN</span>
          </div>
          <div style={{ height: '260px', width: '100%', background: '#0c140c', padding: '10px', border: '2px solid #3a362d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={intentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {intentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={RETRO_COLORS[index % RETRO_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0c140c', borderColor: '#33ff33', color: '#33ff33', fontFamily: 'VT323' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Layer Architecture Box */}
      <div className="mac-window" style={{ padding: '20px' }}>
        <div className="mac-titlebar" style={{ margin: '-20px -20px 16px -20px', padding: '6px 12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>FOUR-LAYER GATEWAY ARCHITECTURE SPECIFICATION</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          <div style={{ background: 'var(--bg-beige-light)', border: '2px solid var(--border-dark)', padding: '12px' }}>
            <span className="badge-retro" style={{ marginBottom: '6px' }}>LAYER 1</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>SEMANTIC VECTOR CACHING</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Vector similarity matching (threshold ≥ 95%) bypasses LLM API for 100% cost reduction.
            </p>
          </div>

          <div style={{ background: 'var(--bg-beige-light)', border: '2px solid var(--border-dark)', padding: '12px' }}>
            <span className="badge-retro" style={{ marginBottom: '6px' }}>LAYER 2</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>PREFIX CACHING ALIGNMENT</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Reorders static system rules & RAG documents at prompt head to trigger provider cache (90% discount).
            </p>
          </div>

          <div style={{ background: 'var(--bg-beige-light)', border: '2px solid var(--border-dark)', padding: '12px' }}>
            <span className="badge-retro" style={{ marginBottom: '6px' }}>LAYER 3</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>ALGORITHMIC COMPRESSION</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Regex lexical stripping & LLMLingua token density scoring compress prompts up to 70%.
            </p>
          </div>

          <div style={{ background: 'var(--bg-beige-light)', border: '2px solid var(--border-dark)', padding: '12px' }}>
            <span className="badge-retro" style={{ marginBottom: '6px' }}>LAYER 4</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>DYNAMIC MODEL ROUTER</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Routes simple tasks to gpt-4o-mini / Haiku, restricting max output tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
