import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';

export const SemanticCacheView: React.FC = () => {
  const [cacheItems, setCacheItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/cache')
      .then(res => res.json())
      .then(data => {
        setCacheItems(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch semantic cache:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="mac-window" style={{ padding: '16px' }}>
        <div className="mac-titlebar" style={{ margin: '-16px -16px 14px -16px', padding: '6px 12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>SEMANTIC VECTOR CACHE DATABASE (128D COSINE VECTOR STORE)</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'var(--font-retro-code)' }}>LOADING CACHE EMBEDDINGS...</div>
        ) : cacheItems.length === 0 ? (
          <div className="crt-screen" style={{ padding: '40px', textAlign: 'center' }}>
            <Database size={40} color="#33ff33" style={{ opacity: 0.5, marginBottom: '12px' }} />
            <div style={{ fontSize: '1.3rem' }}>&gt; NO CACHED EMBEDDINGS FOUND IN VECTOR DATABASE</div>
            <p style={{ fontSize: '1rem', color: '#a0f0a0' }}>EXECUTE PROMPTS IN PLAYGROUND TO STORE CACHE ENTRIES.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '14px' }}>
            {cacheItems.map((item) => (
              <div key={item.id} className="mac-window" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge-retro badge-retro-green">HIT COUNT: {item.hit_count}x</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.78rem', display: 'block' }}>PROMPT VECTOR:</strong>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)' }}>"{item.prompt_text}"</div>
                </div>

                <div>
                  <strong style={{ fontSize: '0.78rem', display: 'block' }}>DENSE VECTOR EMBEDDING (128D):</strong>
                  <div className="code-block-retro" style={{ fontSize: '0.85rem', padding: '6px' }}>
                    [{item.prompt_embedding?.slice(0, 8).map((n: number) => n.toFixed(3)).join(', ')}... (+120 dims)]
                  </div>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <strong style={{ fontSize: '0.78rem', display: 'block' }}>CACHED ANSWER:</strong>
                  <div className="code-block-retro" style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto' }}>
                    {item.response_text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
