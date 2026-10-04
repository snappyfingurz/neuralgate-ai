import React from 'react';
import { Monitor, Terminal, Database, Sliders, HardDrive, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCostUsd: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, savedCostUsd }) => {
  const tabs = [
    { id: 'overview', label: 'SYSTEM OVERVIEW', icon: Monitor },
    { id: 'playground', label: 'CRT TERMINAL PLAYGROUND', icon: Terminal },
    { id: 'logs', label: 'TELEMETRY LOGS', icon: Cpu },
    { id: 'cache', label: 'VECTOR CACHE DB', icon: Database },
    { id: 'settings', label: 'SYSTEM CONFIG', icon: Sliders },
  ];

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Macintosh System Title Bar */}
      <div className="mac-titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="mac-close-btn"></div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em' }}>
             MACINTOSH SYSTEM 7.5.3 — NEURALGATE PROXY v1.0
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-retro-code)', fontWeight: 700 }}>
          GATEWAY SAVINGS: <span style={{ background: '#0c140c', color: '#33ff33', padding: '2px 6px', border: '1px solid #3a362d' }}>${savedCostUsd.toFixed(4)} USD</span>
        </div>
      </div>

      {/* Menu / Tab Bar */}
      <div style={{
        background: 'var(--bg-beige)',
        borderLeft: '3px solid var(--border-dark)',
        borderRight: '3px solid var(--border-dark)',
        borderBottom: '3px solid var(--border-dark)',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HardDrive size={22} color="var(--text-dark)" />
          <span className="mac-title-text">NEURALGATE AI PROXY</span>
          <span className="badge-retro badge-retro-green">STATUS: ONLINE [PORT 5000]</span>
        </div>

        <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn-retro ${isActive ? 'active' : ''}`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
