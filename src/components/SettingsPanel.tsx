import React from 'react';
import { Info, Shield, Zap, Eye } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export interface AppSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  showOfflineDevices: boolean;
  soundEffects: boolean;
  darkMode: boolean;
  maxDevices: number;
  scanTimeout: number;
}

export const defaultSettings: AppSettings = {
  autoRefresh: false,
  refreshInterval: 30,
  showOfflineDevices: true,
  soundEffects: true,
  darkMode: true,
  maxDevices: 50,
  scanTimeout: 30,
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const Toggle = ({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-cyber-border/20">
      <div>
        <div className="text-sm text-white">{label}</div>
        <div className="text-[10px] text-cyber-text-dim">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-all duration-300 relative ${
          checked ? 'bg-cyber-cyan/30' : 'bg-cyber-border/30'
        }`}
        style={{ border: `1px solid ${checked ? '#00f0ff40' : '#1a274440'}` }}
      >
        <div
          className={`w-4 h-4 rounded-full transition-all duration-300 absolute top-0.5 ${
            checked ? 'left-6 bg-cyber-cyan shadow-lg' : 'left-0.5 bg-cyber-text-dim'
          }`}
          style={{
            boxShadow: checked ? '0 0 10px rgba(0,240,255,0.5)' : 'none',
          }}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Scan Settings */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Zap size={14} className="text-cyber-cyan" />
          Scan Settings
        </h3>
        
        <Toggle
          label="Auto Refresh"
          description="Automatically re-scan at set intervals"
          checked={settings.autoRefresh}
          onChange={(v) => updateSetting('autoRefresh', v)}
        />

        <div className="py-3 border-b border-cyber-border/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white">Refresh Interval</div>
              <div className="text-[10px] text-cyber-text-dim">Time between auto-scans (seconds)</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={settings.refreshInterval}
                onChange={(e) => updateSetting('refreshInterval', Number(e.target.value))}
                className="w-24 accent-cyan-400"
              />
              <span className="text-xs font-mono text-cyber-cyan w-8 text-right">{settings.refreshInterval}s</span>
            </div>
          </div>
        </div>

        <div className="py-3 border-b border-cyber-border/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white">Max Devices</div>
              <div className="text-[10px] text-cyber-text-dim">Maximum devices to discover per scan</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.maxDevices}
                onChange={(e) => updateSetting('maxDevices', Number(e.target.value))}
                className="w-24 accent-cyan-400"
              />
              <span className="text-xs font-mono text-cyber-cyan w-8 text-right">{settings.maxDevices}</span>
            </div>
          </div>
        </div>

        <div className="py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white">Scan Timeout</div>
              <div className="text-[10px] text-cyber-text-dim">Maximum scan duration (seconds)</div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={settings.scanTimeout}
                onChange={(e) => updateSetting('scanTimeout', Number(e.target.value))}
                className="w-24 accent-cyan-400"
              />
              <span className="text-xs font-mono text-cyber-cyan w-8 text-right">{settings.scanTimeout}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Eye size={14} className="text-cyber-purple" />
          Display Settings
        </h3>

        <Toggle
          label="Show Offline Devices"
          description="Display devices that are no longer responding"
          checked={settings.showOfflineDevices}
          onChange={(v) => updateSetting('showOfflineDevices', v)}
        />

        <Toggle
          label="Sound Effects"
          description="Play sounds on device discovery"
          checked={settings.soundEffects}
          onChange={(v) => updateSetting('soundEffects', v)}
        />
      </div>

      {/* About */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Info size={14} className="text-cyber-green" />
          About NetScan Pro
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyber-text-dim">Version</span>
            <span className="text-white font-mono">2.0.0</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyber-text-dim">Build</span>
            <span className="text-white font-mono">2025.01.15</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyber-text-dim">Engine</span>
            <span className="text-white font-mono">React + TypeScript</span>
          </div>
          
          <div className="pt-3 border-t border-cyber-border/20">
            <div className="glass-panel rounded-lg p-3 text-[10px] text-cyber-text-dim space-y-1">
              <div className="flex items-center gap-1 text-cyber-yellow">
                <Shield size={10} />
                <span className="font-semibold">Privacy Notice</span>
              </div>
              <p>
                This application uses browser APIs to detect network information.
                WiFi and Bluetooth device scanning is simulated as browsers cannot
                directly scan networks. Only your own network information (public IP,
                local IP, connection type) is real data obtained through standard APIs.
              </p>
              <p>
                No data is sent to any server. All processing happens locally in your browser.
              </p>
            </div>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl glass-panel text-sm text-cyber-text-dim hover:text-white hover:border-cyber-cyan/30 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
};
