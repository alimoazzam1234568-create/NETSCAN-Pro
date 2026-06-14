import React, { useMemo } from 'react';
import { NetworkDevice, NetworkInfo } from '../types/network';
import { getSignalQuality } from '../utils/networkScanner';
import { Wifi, Bluetooth, Globe, Router } from 'lucide-react';

interface TopologyViewProps {
  devices: NetworkDevice[];
  networkInfo: NetworkInfo | null;
  onDeviceClick: (device: NetworkDevice) => void;
}

export const TopologyView: React.FC<TopologyViewProps> = ({ devices, networkInfo, onDeviceClick }) => {
  const wifiDevices = useMemo(() => devices.filter(d => d.type === 'wifi'), [devices]);
  const btDevices = useMemo(() => devices.filter(d => d.type === 'bluetooth'), [devices]);

  return (
    <div className="glass-panel rounded-2xl p-6 overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Internet */}
        <div className="flex justify-center mb-4">
          <div className="glass-panel rounded-xl px-6 py-3 flex items-center gap-3 glow-cyan">
            <Globe size={20} className="text-cyber-cyan" />
            <div>
              <div className="text-xs font-semibold text-white">Internet</div>
              <div className="text-[10px] text-cyber-text-dim font-mono">
                {networkInfo?.publicIP || 'Unknown'}
              </div>
            </div>
          </div>
        </div>

        {/* Connection line */}
        <div className="flex justify-center">
          <div className="w-0.5 h-8 bg-gradient-to-b from-cyber-cyan/50 to-cyber-green/50" />
        </div>

        {/* Router */}
        <div className="flex justify-center mb-4">
          <div className="glass-panel rounded-xl px-6 py-3 flex items-center gap-3 glow-green">
            <Router size={20} className="text-cyber-green" />
            <div>
              <div className="text-xs font-semibold text-white">Gateway / Router</div>
              <div className="text-[10px] text-cyber-text-dim font-mono">
                {networkInfo?.gateway || 'Unknown'} · {networkInfo?.ssid || 'WiFi'}
              </div>
            </div>
          </div>
        </div>

        {/* Branch lines */}
        <div className="flex justify-center gap-40">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-cyber-green/50 to-cyber-green/20" />
            <div className="w-40 h-0.5 bg-cyber-green/20" />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-cyber-green/50 to-cyber-blue/20" />
            <div className="w-40 h-0.5 bg-cyber-blue/20" />
          </div>
        </div>

        {/* WiFi and Bluetooth sections */}
        <div className="grid grid-cols-2 gap-8 mt-2">
          {/* WiFi Section */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wifi size={14} className="text-cyber-green" />
              <span className="text-xs font-semibold text-cyber-green">WiFi Network ({wifiDevices.length})</span>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {wifiDevices.map(device => {
                const quality = getSignalQuality(device.signalStrength);
                return (
                  <button
                    key={device.id}
                    onClick={() => onDeviceClick(device)}
                    className="w-full glass-panel rounded-lg p-3 text-left hover:border-cyber-green/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: device.status === 'online' ? '#00ff88' : '#ff3355' }}
                        />
                        <span className="text-[11px] text-white truncate max-w-[120px]">{device.name}</span>
                      </div>
                      <span className="text-[9px] font-mono" style={{ color: quality.color }}>
                        {device.signalStrength} dBm
                      </span>
                    </div>
                    <div className="text-[9px] text-cyber-text-dim font-mono mt-1">
                      {device.ip} · {device.mac?.slice(0, 8)}...
                    </div>
                  </button>
                );
              })}
              {wifiDevices.length === 0 && (
                <div className="text-center text-cyber-text-dim text-[10px] py-4">No WiFi devices</div>
              )}
            </div>
          </div>

          {/* Bluetooth Section */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Bluetooth size={14} className="text-cyber-blue" />
              <span className="text-xs font-semibold text-cyber-blue">Bluetooth ({btDevices.length})</span>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {btDevices.map(device => {
                const quality = getSignalQuality(device.signalStrength);
                return (
                  <button
                    key={device.id}
                    onClick={() => onDeviceClick(device)}
                    className="w-full glass-panel rounded-lg p-3 text-left hover:border-cyber-blue/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: device.status === 'online' ? '#00ff88' : '#ff3355' }}
                        />
                        <span className="text-[11px] text-white truncate max-w-[120px]">{device.name}</span>
                      </div>
                      <span className="text-[9px] font-mono" style={{ color: quality.color }}>
                        {device.signalStrength} dBm
                      </span>
                    </div>
                    <div className="text-[9px] text-cyber-text-dim font-mono mt-1">
                      {device.bluetoothClass} · {device.paired ? 'Paired' : 'Not paired'}
                    </div>
                  </button>
                );
              })}
              {btDevices.length === 0 && (
                <div className="text-center text-cyber-text-dim text-[10px] py-4">No Bluetooth devices</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
