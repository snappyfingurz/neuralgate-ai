import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';

interface TelemetryLogsProps {
  logs: any[];
}

export const TelemetryLogs: React.FC<TelemetryLogsProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const filtered = (logs || []).filter(log =>
    log.original_prompt?.toLowerCase().includes(search.toLowerCase()) ||
    log.routed_model?.toLowerCase().includes(search.toLowerCase()) ||
    log.intent?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="mac-window" style={{ padding: '16px' }}>
        <div className="mac-titlebar" style={{ margin: '-16px -16px 14px -16px', padding: '6px 12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>GATEWAY TELEMETRY LOG DATABASE</span>
        </div>

        {/* Filter Bar */}
        <div style={{ background: 'var(--bg-beige-light)', border: '2px solid var(--border-dark)', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={16} color="var(--text-dark)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH TELEMETRY LOGS BY PROMPT OR MODEL..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-dark)',
              fontFamily: 'var(--font-retro-code)',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          />
          <span className="badge-retro">{filtered.length} LOGS RECORDED</span>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', border: '2px solid var(--border-dark)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem', fontFamily: 'var(--font-retro-code)' }}>
            <thead>
              <tr style={{ background: 'var(--bg-bevel)', borderBottom: '2px solid var(--border-dark)', color: 'var(--text-dark)' }}>
                <th style={{ padding: '8px 12px' }}>TIME</th>
                <th style={{ padding: '8px 12px' }}>PROMPT PAYLOAD</th>
                <th style={{ padding: '8px 12px' }}>STATUS / INTENT</th>
                <th style={{ padding: '8px 12px' }}>ROUTED MODEL</th>
                <th style={{ padding: '8px 12px' }}>TOKENS SAVED</th>
                <th style={{ padding: '8px 12px' }}>USD SAVED</th>
                <th style={{ padding: '8px 12px' }}>LATENCY</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const isCacheHit = log.semantic_cache_hit === 1;
                return (
                  <tr
                    key={log.id}
                    style={{ borderBottom: '1px solid var(--border-dark)', background: isCacheHit ? '#f0f5ee' : 'var(--bg-beige-light)' }}
                  >
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '8px 12px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.original_prompt}
                    </td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                      {isCacheHit ? (
                        <span className="badge-retro badge-retro-green">CACHE HIT</span>
                      ) : (
                        <span className="badge-retro">{log.intent?.toUpperCase()}</span>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontWeight: 700 }}>
                      {log.routed_model}
                    </td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontWeight: 700, color: '#008800' }}>
                      {log.saved_tokens || 0}
                    </td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontWeight: 700, color: '#008800' }}>
                      +${log.saved_cost_usd?.toFixed(4) || '0.0000'}
                    </td>
                    <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>
                      {log.latency_ms} ms
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="btn-retro"
                        style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                      >
                        <Eye size={12} /> INSPECT
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Inspector */}
      {selectedLog && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="mac-window" style={{ maxWidth: '750px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '20px' }}>
            <div className="mac-titlebar" style={{ margin: '-20px -20px 16px -20px', padding: '6px 12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>TELEMETRY INSPECTOR [{selectedLog.id}]</span>
              <button
                onClick={() => setSelectedLog(null)}
                className="btn-retro"
                style={{ padding: '2px 6px', fontSize: '0.75rem' }}
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="crt-screen" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>&gt; ORIGINAL MODEL: {selectedLog.original_model}</div>
              <div>&gt; ROUTED GATEWAY MODEL: <span style={{ color: '#ffcc00' }}>{selectedLog.routed_model}</span></div>
              <div>&gt; ORIGINAL COST: ${selectedLog.original_cost_usd?.toFixed(6)} | GATEWAY COST: ${selectedLog.final_cost_usd?.toFixed(6)}</div>
              
              <div>
                <div style={{ color: '#ffcc00' }}>&gt; ORIGINAL PROMPT:</div>
                <div className="code-block-retro" style={{ fontSize: '0.95rem' }}>{selectedLog.original_prompt}</div>
              </div>

              <div>
                <div style={{ color: '#33ff33' }}>&gt; OPTIMIZED PROMPT:</div>
                <div className="code-block-retro" style={{ fontSize: '0.95rem' }}>{selectedLog.final_prompt}</div>
              </div>

              <div>
                <div style={{ color: '#33ff33' }}>&gt; MODEL COMPLETION RESPONSE:</div>
                <div className="code-block-retro" style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{selectedLog.response_text}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
