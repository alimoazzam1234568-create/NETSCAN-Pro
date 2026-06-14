import React, { useState, useEffect } from 'react';
import { TabType } from '../types/network';
import {
  Radar, Monitor, Wifi, Activity, Terminal, Settings,
  Menu, X
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isScanning: boolean;
  deviceCount: number;
}

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'scanner', label: 'Scanner', icon: <Radar size={16} /> },
  { id: 'devices', label: 'Devices', icon: <Monitor size={16} /> },
  { id: 'network', label: 'Network', icon: <Wifi size={16} /> },
  { id: 'monitor', label: 'Monitor', icon: <Activity size={16} /> },
  { id: 'logs', label: 'Console', icon: <Terminal size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
];

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, isScanning, deviceCount }) => {
  const [time, setTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-cyber-border/30">
      <div className="max-w-[1600px] mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/images/logo.png" alt="NetScan" className="w-8 h-8 rounded-lg" />
              {isScanning && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-cyber-green rounded-full animate-pulse border-2 border-cyber-dark" />
              )}
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide">
                NET<span className="text-cyber-cyan">SCAN</span> <span className="text-cyber-text-dim font-normal">PRO</span>
              </h1>
              <p className="text-[9px] text-cyber-text-dim tracking-widest uppercase">Advanced Network Scanner</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30'
                    : 'text-cyber-text-dim hover:text-white hover:bg-cyber-border/20'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.id === 'devices' && deviceCount > 0 && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-cyber-cyan/20 text-cyber-cyan">
                    {deviceCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Status */}
            <div className="hidden sm:flex items-center gap-2 glass-panel rounded-lg px-3 py-1.5">
              <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-cyber-green animate-pulse' : 'bg-cyber-text-dim'}`} />
              <span className="text-[10px] text-cyber-text-dim font-mono">
                {isScanning ? 'SCANNING' : 'IDLE'}
              </span>
            </div>

            {/* Clock */}
            <div className="hidden sm:block text-[10px] text-cyber-text-dim font-mono">
              {time.toLocaleTimeString('en-US', { hour12: false })}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg glass-panel flex items-center justify-center text-cyber-text-dim hover:text-white"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-cyber-border/20 grid grid-cols-3 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl text-[10px] font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30'
                    : 'text-cyber-text-dim hover:text-white glass-panel'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
