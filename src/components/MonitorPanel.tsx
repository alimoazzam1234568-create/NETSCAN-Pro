import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { NetworkDevice } from '../types/network';
import { getSignalQuality } from '../utils/networkScanner';
import { Activity, TrendingUp, Wifi, Bluetooth, BarChart3 } from 'lucide-react';

interface MonitorPanelProps {
  devices: NetworkDevice[];
}

interface SignalHistory {
  timestamp: number;
  values: Record<string, number>;
}

export const MonitorPanel: React.FC<MonitorPanelProps> = ({ devices }) => {
  const [signalHistory, setSignalHistory] = useState<SignalHistory[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update signal history every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (devices.length === 0) return;
      
      const values: Record<string, number> = {};
      devices.forEach(d => {
        // Add small random variation to simulate real-time monitoring
        values[d.id] = d.signalStrength + (Math.random() * 6 - 3);
      });
      
      setSignalHistory(prev => {
        const next = [...prev, { timestamp: Date.now(), values }];
        return next.slice(-60); // Keep last 60 readings (2 minutes)
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [devices]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = 'rgba(0,240,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      const y = (h / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let i = 0; i < 10; i++) {
      const x = (w / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    if (signalHistory.length < 2) {
      ctx.fillStyle = 'rgba(90,110,135,0.5)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Collecting signal data...', w / 2, h / 2);
      return;
    }

    const colors = ['#00f0ff', '#00ff88', '#a855f7', '#ff8800', '#ff3355', '#ffd700', '#3b82f6'];
    const targetDevices = selectedDeviceId 
      ? devices.filter(d => d.id === selectedDeviceId)
      : devices.slice(0, 7);

    targetDevices.forEach((device, di) => {
      const color = colors[di % colors.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      signalHistory.forEach((entry, i) => {
        const x = (i / (signalHistory.length - 1)) * w;
        const val = entry.values[device.id];
        if (val === undefined) return;
        const y = h - ((val + 100) / 100) * h;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();

      // Glow effect
      ctx.strokeStyle = color + '30';
      ctx.lineWidth = 4;
      ctx.stroke();
    });

    // Y axis labels
    ctx.fillStyle = 'rgba(90,110,135,0.8)';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('-0 dBm', 4, 12);
    ctx.fillText('-50 dBm', 4, h / 2);
    ctx.fillText('-100 dBm', 4, h - 4);
  }, [signalHistory, devices, selectedDeviceId]);

  const wifiCount = devices.filter(d => d.type === 'wifi').length;
  const btCount = devices.filter(d => d.type === 'bluetooth').length;
  const onlineCount = devices.filter(d => d.status === 'online').length;
  const avgSignal = devices.length > 0
    ? Math.round(devices.reduce((sum, d) => sum + d.signalStrength, 0) / devices.length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'WiFi Devices', value: wifiCount, icon: <Wifi size={16} />, color: '#00ff88' },
          { label: 'Bluetooth', value: btCount, icon: <Bluetooth size={16} />, color: '#3b82f6' },
          { label: 'Online', value: onlineCount, icon: <Activity size={16} />, color: '#00f0ff' },
          { label: 'Avg Signal', value: `${avgSignal} dBm`, icon: <TrendingUp size={16} />, color: '#ffd700' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: stat.color }}>{stat.icon}</span>
              <span className="text-[10px] text-cyber-text-dim uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Signal Chart */}
      <div className="glass-panel rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-cyber-cyan" />
            <span className="text-xs font-semibold text-white">Real-time Signal Monitor</span>
          </div>
          <select
            value={selectedDeviceId || ''}
            onChange={(e) => setSelectedDeviceId(e.target.value || null)}
            className="text-[10px] bg-cyber-darker border border-cyber-border rounded-lg px-2 py-1 text-cyber-text-dim outline-none focus:border-cyber-cyan/40"
          >
            <option value="">All Devices (top 7)</option>
            {devices.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-48 rounded-lg bg-cyber-darker/50"
          style={{ width: '100%', height: '192px' }}
        />
        <div className="flex items-center justify-between mt-2 text-[9px] text-cyber-text-dim">
          <span>2 min ago</span>
          <span>Now</span>
        </div>
      </div>

      {/* Device Signal List */}
      <div className="glass-panel rounded-2xl p-4">
        <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <Activity size={12} className="text-cyber-cyan" />
          Device Signal Strength
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {devices.map((device, i) => {
            const quality = getSignalQuality(device.signalStrength);
            return (
              <div
                key={device.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-cyber-border/10 transition-colors cursor-pointer"
                onClick={() => setSelectedDeviceId(selectedDeviceId === device.id ? null : device.id)}
              >
                <div className="flex items-center gap-2 min-w-[140px]">
                  {device.type === 'wifi' ? (
                    <Wifi size={12} className="text-cyber-green shrink-0" />
                  ) : (
                    <Bluetooth size={12} className="text-cyber-blue shrink-0" />
                  )}
                  <span className="text-xs text-white truncate">{device.name}</span>
                </div>
                <div className="flex-1 h-2 bg-cyber-darker rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${quality.percent}%` }}
                    transition={{ delay: i * 0.03, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${quality.color}40, ${quality.color})`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono shrink-0 w-16 text-right" style={{ color: quality.color }}>
                  {device.signalStrength} dBm
                </span>
              </div>
            );
          })}
          {devices.length === 0 && (
            <div className="text-center text-cyber-text-dim text-xs py-8">
              No devices scanned yet. Run a scan to see signal data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
