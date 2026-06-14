import React, { useMemo } from 'react';
import { NetworkDevice } from '../types/network';
import { getSignalQuality, getDeviceCategory } from '../utils/networkScanner';

interface RadarViewProps {
  devices: NetworkDevice[];
  isScanning: boolean;
  onDeviceClick: (device: NetworkDevice) => void;
}

const deviceEmojis: Record<string, string> = {
  smartphone: '📱',
  laptop: '💻',
  tablet: '📱',
  tv: '📺',
  printer: '🖨️',
  router: '📡',
  audio: '🎧',
  wearable: '⌚',
  camera: '📷',
  assistant: '🔊',
  gaming: '🎮',
  desktop: '🖥️',
  unknown: '❓',
};

export const RadarView: React.FC<RadarViewProps> = ({ devices, isScanning, onDeviceClick }) => {
  const devicePositions = useMemo(() => {
    return devices.map((device, i) => {
      const signalPercent = getSignalQuality(device.signalStrength).percent;
      const distanceFromCenter = ((100 - signalPercent) / 100) * 42;
      const angle = (i * 137.508 + 30) % 360;
      const rad = (angle * Math.PI) / 180;
      const x = 50 + distanceFromCenter * Math.cos(rad);
      const y = 50 + distanceFromCenter * Math.sin(rad);
      return { device, x, y, angle };
    });
  }, [devices]);

  return (
    <div className="relative w-full max-w-[600px] mx-auto aspect-square">
      {/* Radar background */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Grid circles */}
        {[10, 20, 30, 40].map((r) => (
          <circle
            key={r}
            cx="50" cy="50" r={r}
            fill="none"
            stroke="rgba(0,240,255,0.08)"
            strokeWidth="0.3"
          />
        ))}
        
        {/* Cross lines */}
        <line x1="50" y1="6" x2="50" y2="94" stroke="rgba(0,240,255,0.06)" strokeWidth="0.2" />
        <line x1="6" y1="50" x2="94" y2="50" stroke="rgba(0,240,255,0.06)" strokeWidth="0.2" />
        <line x1="14" y1="14" x2="86" y2="86" stroke="rgba(0,240,255,0.04)" strokeWidth="0.2" />
        <line x1="86" y1="14" x2="14" y2="86" stroke="rgba(0,240,255,0.04)" strokeWidth="0.2" />
        
        {/* Center dot */}
        <circle cx="50" cy="50" r="1.5" fill="#00f0ff" opacity="0.8" />
        <circle cx="50" cy="50" r="0.7" fill="#fff" />
        
        {/* Range labels */}
        <text x="50" y="41" textAnchor="middle" fill="rgba(0,240,255,0.3)" fontSize="1.8">10m</text>
        <text x="50" y="31" textAnchor="middle" fill="rgba(0,240,255,0.3)" fontSize="1.8">20m</text>
        <text x="50" y="21" textAnchor="middle" fill="rgba(0,240,255,0.3)" fontSize="1.8">30m</text>
        
        {/* Sweep line */}
        {isScanning && (
          <g className="animate-radar-sweep" style={{ transformOrigin: '50px 50px' }}>
            <defs>
              <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,240,255,0)" />
                <stop offset="100%" stopColor="rgba(0,240,255,0.4)" />
              </linearGradient>
            </defs>
            <line x1="50" y1="50" x2="50" y2="10" stroke="rgba(0,240,255,0.6)" strokeWidth="0.4" />
            <path d="M50,50 L50,10 A40,40 0 0,1 78,18 Z" fill="url(#sweepGrad)" opacity="0.3" />
          </g>
        )}
      </svg>

      {/* Device dots overlay */}
      {devicePositions.map(({ device, x, y }) => {
        const quality = getSignalQuality(device.signalStrength);
        const category = getDeviceCategory(device);
        const emoji = deviceEmojis[category] || '❓';
        
        return (
          <button
            key={device.id}
            onClick={() => onDeviceClick(device)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-300 hover:scale-150 z-10"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            title={`${device.name} (${device.signalStrength} dBm)`}
          >
            <div className="relative">
              {/* Ping animation */}
              {device.status === 'online' && (
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    backgroundColor: quality.color,
                    opacity: 0.2,
                    width: '24px',
                    height: '24px',
                    marginLeft: '-4px',
                    marginTop: '-4px',
                  }}
                />
              )}
              <span className="text-sm drop-shadow-lg" style={{ filter: `drop-shadow(0 0 4px ${quality.color})` }}>
                {emoji}
              </span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap">
              <div className="glass-panel rounded px-2 py-1 text-[10px]">
                <div className="text-white font-medium">{device.name}</div>
                <div style={{ color: quality.color }}>{device.signalStrength} dBm · {quality.label}</div>
                {device.ip && <div className="text-cyber-text-dim">{device.ip}</div>}
              </div>
            </div>
          </button>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 glass-panel rounded-lg p-2 text-[10px] text-cyber-text-dim">
        <div className="flex items-center gap-1 mb-1">
          <div className="w-2 h-2 rounded-full bg-cyber-green"></div>
          <span>WiFi</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-cyber-blue"></div>
          <span>Bluetooth</span>
        </div>
      </div>
      
      {/* Device count */}
      <div className="absolute top-2 right-2 glass-panel rounded-lg px-3 py-1.5 text-xs text-cyber-cyan">
        {devices.length} devices
      </div>
    </div>
  );
};
