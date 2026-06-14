import React from 'react';
import { motion } from 'framer-motion';
import { NetworkDevice } from '../types/network';
import { getSignalQuality, getDeviceCategory, formatTime } from '../utils/networkScanner';
import {
  Wifi, Bluetooth, Monitor, Smartphone, Laptop, Tv, Printer,
  Speaker, Watch, Camera, Gamepad2, HardDrive, HelpCircle,
  Signal, Clock, MapPin, Shield, Activity
} from 'lucide-react';

interface DeviceCardProps {
  device: NetworkDevice;
  index: number;
  onClick: () => void;
}

const deviceIcons: Record<string, React.ReactNode> = {
  smartphone: <Smartphone size={20} />,
  laptop: <Laptop size={20} />,
  tablet: <Smartphone size={20} />,
  tv: <Tv size={20} />,
  printer: <Printer size={20} />,
  router: <Wifi size={20} />,
  audio: <Speaker size={20} />,
  wearable: <Watch size={20} />,
  camera: <Camera size={20} />,
  assistant: <Speaker size={20} />,
  gaming: <Gamepad2 size={20} />,
  desktop: <Monitor size={20} />,
  unknown: <HelpCircle size={20} />,
};

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, index, onClick }) => {
  const quality = getSignalQuality(device.signalStrength);
  const category = getDeviceCategory(device);
  const icon = deviceIcons[category] || <HardDrive size={20} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className="glass-panel rounded-xl p-4 cursor-pointer hover:border-cyber-cyan/40 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${quality.color}15, ${quality.color}05)`,
                border: `1px solid ${quality.color}30`,
                color: quality.color,
              }}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white truncate max-w-[160px]">{device.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {device.type === 'wifi' ? (
                  <Wifi size={10} className="text-cyber-green" />
                ) : (
                  <Bluetooth size={10} className="text-cyber-blue" />
                )}
                <span className="text-[10px] text-cyber-text-dim uppercase tracking-wider">
                  {device.type}
                </span>
              </div>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: device.status === 'online' ? '#00ff88' : '#ff3355',
                boxShadow: device.status === 'online'
                  ? '0 0 8px rgba(0,255,136,0.5)'
                  : '0 0 8px rgba(255,51,85,0.5)',
              }}
            />
            <span className="text-[10px] text-cyber-text-dim">{device.status}</span>
          </div>
        </div>

        {/* Signal bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Signal size={10} style={{ color: quality.color }} />
              <span className="text-[10px]" style={{ color: quality.color }}>{quality.label}</span>
            </div>
            <span className="text-[10px] text-cyber-text-dim font-mono">{device.signalStrength} dBm</span>
          </div>
          <div className="w-full h-1.5 bg-cyber-darker rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${quality.percent}%` }}
              transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${quality.color}40, ${quality.color})`,
                boxShadow: `0 0 10px ${quality.color}50`,
              }}
            />
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {device.ip && (
            <div className="flex items-center gap-1 text-cyber-text-dim">
              <Activity size={9} className="text-cyber-cyan shrink-0" />
              <span className="font-mono truncate">{device.ip}</span>
            </div>
          )}
          {device.mac && (
            <div className="flex items-center gap-1 text-cyber-text-dim">
              <Shield size={9} className="text-cyber-purple shrink-0" />
              <span className="font-mono truncate">{device.mac}</span>
            </div>
          )}
          {device.vendor && (
            <div className="flex items-center gap-1 text-cyber-text-dim">
              <HardDrive size={9} className="text-cyber-orange shrink-0" />
              <span className="truncate">{device.vendor}</span>
            </div>
          )}
          {device.distance && (
            <div className="flex items-center gap-1 text-cyber-text-dim">
              <MapPin size={9} className="text-cyber-red shrink-0" />
              <span>{device.distance}</span>
            </div>
          )}
          {device.latency !== undefined && (
            <div className="flex items-center gap-1 text-cyber-text-dim">
              <Clock size={9} className="text-cyber-yellow shrink-0" />
              <span>{device.latency}ms</span>
            </div>
          )}
          {device.frequency && (
            <div className="flex items-center gap-1 text-cyber-text-dim">
              <Wifi size={9} className="text-cyber-green shrink-0" />
              <span>{device.frequency} Ch.{device.channel}</span>
            </div>
          )}
        </div>

        {/* Last seen */}
        <div className="mt-2 pt-2 border-t border-cyber-border/30 flex items-center justify-between">
          <span className="text-[9px] text-cyber-text-dim">Last seen {formatTime(device.lastSeen)}</span>
          <span className="text-[9px] text-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity">
            Click for details →
          </span>
        </div>
      </div>
    </motion.div>
  );
};
