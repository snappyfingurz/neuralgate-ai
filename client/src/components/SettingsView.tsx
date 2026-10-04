import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

interface SettingsViewProps {
  onSettingsSaved: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSettingsSaved }) => {
  const [settings, setSettings] = useState<any>({
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

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSavedSuccess(true);
        onSettingsSaved();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save settings:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '850px', margin: '0 auto' }}>
      <div className="mac-window" style={{ padding: '20px' }}>
        <div className="mac-titlebar" style={{ margin: '-20px -20px 16px -20px', padding: '6px 12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>SYSTEM 7 CONFIGURATION DIALOG CONTROL</span>
        </div>

        {savedSuccess && (
          <div style={{ background: '#183318', border: '2px solid #33ff33', color: '#33ff33', padding: '10px', marginBottom: '16px', fontFamily: 'var(--font-retro-code)', fontWeight: 700 }}>
            ✓ SYSTEM CONFIGURATION UPDATED AND WRITTEN TO DISK LIVE.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Section 1 */}
          <div style={{ background: 'var(--bg-beige-light)', border: '2px solid var(--border-dark)', padding: '14px' }}>
            <span className="badge-retro" style={{ marginBottom: '8px' }}>SECTION 01</span>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>VECTOR CACHING & SIMILARITY CONTROL</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  SEMANTIC COSINE SIMILARITY THRESHOLD: {(settings.semantic_similarity_threshold * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="0.99"
                  step="0.01"
                  value={settings.semantic_similarity_threshold}
                  onChange={(e) => setSettings({ ...settings, semantic_similarity_threshold: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  PREFIX CACHING:
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={settings.prefix_caching_enabled}
                    onChange={(e) => setSettings({ ...settings, prefix_caching_enabled: e.target.checked })}
                  />
                  ENABLE PROVIDER PROMPT CACHING STRUCTURING (90% DISCOUNT)
                </label>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div style={{ background: 'var(--bg-beige-light)', border: '2px solid var(--border-dark)', padding: '14px' }}>
            <span className="badge-retro" style={{ marginBottom: '8px' }}>SECTION 02</span>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>PROMPT COMPRESSION ENGINE RATIOS</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  LLMLINGUA TARGET COMPRESSION RATIO: {(settings.target_compression_ratio * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0.10"
                  max="0.70"
                  step="0.05"
                  value={settings.target_compression_ratio}
                  onChange={(e) => setSettings({ ...settings, target_compression_ratio: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={settings.lexical_compression_enabled}
                    onChange={(e) => setSettings({ ...settings, lexical_compression_enabled: e.target.checked })}
                  />
                  ENABLE LEXICAL FILLER STRIPPING
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={settings.llmlingua_compression_enabled}
                    onChange={(e) => setSettings({ ...settings, llmlingua_compression_enabled: e.target.checked })}
                  />
                  ENABLE LLMLINGUA TOKEN DENSITY COMPRESSION
                </label>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div style={{ background: 'var(--bg-beige-light)', border: '2px solid var(--border-dark)', padding: '14px' }}>
            <span className="badge-retro" style={{ marginBottom: '8px' }}>SECTION 03</span>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>MODEL ROUTING TIER MAP</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  CHEAP TIER MODEL:
                </label>
                <select
                  value={settings.cheap_model_name}
                  onChange={(e) => setSettings({ ...settings, cheap_model_name: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-beige-light)', border: '2px solid var(--border-dark)', padding: '6px', fontFamily: 'var(--font-retro-code)', fontWeight: 700 }}
                >
                  <option value="gpt-4o-mini">gpt-4o-mini ($0.15/1M)</option>
                  <option value="claude-3-haiku">claude-3-haiku ($0.25/1M)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash ($0.15/1M)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                  FLAGSHIP TIER MODEL:
                </label>
                <select
                  value={settings.flagship_model_name}
                  onChange={(e) => setSettings({ ...settings, flagship_model_name: e.target.value })}
                  style={{ width: '100%', background: 'var(--bg-beige-light)', border: '2px solid var(--border-dark)', padding: '6px', fontFamily: 'var(--font-retro-code)', fontWeight: 700 }}
                >
                  <option value="gpt-4o">gpt-4o ($2.50/1M)</option>
                  <option value="claude-3-5-sonnet">claude-3-5-sonnet ($3.00/1M)</option>
                </select>
              </div>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="btn-retro active" style={{ padding: '12px', justifyContent: 'center' }}>
            <Save size={16} />
            {saving ? 'SAVING CONFIGURATION...' : 'SAVE SYSTEM CONFIGURATION'}
          </button>
        </div>
      </div>
    </div>
  );
};
