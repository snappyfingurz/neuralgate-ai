import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { Playground } from './components/Playground';
import { TelemetryLogs } from './components/TelemetryLogs';
import { SemanticCacheView } from './components/SemanticCacheView';
import { SettingsView } from './components/SettingsView';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchDashboardData = () => {
    fetch('/api/analytics/summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(console.error);

    fetch('/api/analytics/logs')
      .then(res => res.json())
      .then(data => setLogs(data || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Auto-refresh telemetry every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCostUsd={summary?.totalSavedCostUsd || 0}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '32px 24px', flex: 1 }}>
        {activeTab === 'overview' && <OverviewDashboard summary={summary} logs={logs} />}
        {activeTab === 'playground' && <Playground onRefresh={fetchDashboardData} />}
        {activeTab === 'logs' && <TelemetryLogs logs={logs} />}
        {activeTab === 'cache' && <SemanticCacheView />}
        {activeTab === 'settings' && <SettingsView onSettingsSaved={fetchDashboardData} />}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '20px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        NeuralGate Gateway Proxy v1.0.0 • Multi-Tier Semantic Caching & Algorithmic Token Compression • Built for High Throughput
      </footer>
    </div>
  );
}

export default App;
