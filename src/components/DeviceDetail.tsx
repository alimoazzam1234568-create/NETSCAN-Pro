import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NetworkDevice } from '../types/network';
import { getSignalQuality, formatDateTime } from '../utils/networkScanner';
import {
  X, Wifi, Bluetooth, Signal, Shield, Clock, MapPin,
  Activity, Server, Globe, Cpu, HardDrive, Lock, Zap,
  Copy, CheckCircle2
} from 'lucide-react';

interface DeviceDetailProps {
  device: NetworkDevice | null;
  onClose: () => void;
}

export const DeviceDetail: React.FC<DeviceDetailProps> = ({ device, onClose }) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!device) return null;

  const quality = getSignalQuality(device.signalStrength);

  const InfoRow = ({ icon, label, value, copyable = false }: {
    icon: React.ReactNode;
    label: string;
    value: string | undefined;
    copyable?: boolean;
  }) => {
    if (!value) return null;
    return (
      <div className="flex items-center justify-between py-2 border-b border-cyber-border/20">
        <div className="flex items-center gap-2 text-cyber-text-dim">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white font-mono">{value}</span>
          {copyable && (
            <button
              onClick={() => copyToClipboard(value, label)}
              className="text-cyber-text-dim hover:text-cyber-cyan transition-colors"
            >
              {copiedField === label ? (
                <CheckCircle2 size={12} className="text-cyber-green" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-panel rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 glass-panel rounded-t-2xl p-5 border-b border-cyber-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${quality.color}20, ${quality.color}05)`,
                    border: `1px solid ${quality.color}40`,
                  }}
                >
                  {device.type === 'wifi' ? <Wifi size={24} style={{ color: quality.color }} /> : <Bluetooth size={24} style={{ color: quality.color }} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{device.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium"
                      style={{
                        backgroundColor: `${quality.color}15`,
                        color: quality.color,
                        border: `1px solid ${quality.color}30`,
                      }}
                    >
                      {device.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: device.status === 'online' ? '#00ff88' : '#ff3355' }}
                      />
                      <span className="text-[10px] text-cyber-text-dim">{device.status.toUpperCase()}</span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-cyber-text-dim hover:text-white hover:bg-cyber-border/30 transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Signal Strength Section */}
            <div>
              <h3 className="text-xs font-semibold text-cyber-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
                <Signal size={12} />
                Signal Analysis
              </h3>
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold font-mono" style={{ color: quality.color }}>
                    {device.signalStrength} dBm
                  </span>
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${quality.color}15`,
                      color: quality.color,
                    }}
                  >
                    {quality.label}
                  </span>
                </div>
                <div className="w-full h-3 bg-cyber-darker rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${quality.percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${quality.color}40, ${quality.color})`,
                      boxShadow: `0 0 15px ${quality.color}50`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-cyber-text-dim font-mono">
                  <span>-100 dBm</span>
                  <span>-50 dBm</span>
                  <span>0 dBm</span>
                </div>
              </div>
            </div>

            {/* Network Information */}
            <div>
              <h3 className="text-xs font-semibold text-cyber-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
                <Globe size={12} />
                Network Information
              </h3>
              <div className="glass-panel rounded-xl p-4">
                <InfoRow icon={<Activity size={12} />} label="IP Address" value={device.ip} copyable />
                <InfoRow icon={<Shield size={12} />} label="MAC Address" value={device.mac} copyable />
                <InfoRow icon={<Server size={12} />} label="Hostname" value={device.hostname} copyable />
                <InfoRow icon={<HardDrive size={12} />} label="Vendor" value={device.vendor} />
                <InfoRow icon={<Cpu size={12} />} label="Operating System" value={device.os} />
                <InfoRow icon={<Lock size={12} />} label="Encryption" value={device.encryption} />
                <InfoRow icon={<Wifi size={12} />} label="Frequency" value={device.frequency ? `${device.frequency} · Ch. ${device.channel}` : undefined} />
                <InfoRow icon={<Zap size={12} />} label="Latency" value={device.latency ? `${device.latency}ms` : undefined} />
                <InfoRow icon={<MapPin size={12} />} label="Est. Distance" value={device.distance} />
                {device.bluetoothClass && (
                  <InfoRow icon={<Bluetooth size={12} />} label="BT Class" value={device.bluetoothClass} />
                )}
                {device.paired !== undefined && (
                  <InfoRow icon={<Lock size={12} />} label="Paired" value={device.paired ? 'Yes' : 'No'} />
                )}
              </div>
            </div>

            {/* Open Ports */}
            {device.ports && device.ports.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-cyber-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Server size={12} />
                  Open Ports ({device.ports.length})
                </h3>
                <div className="glass-panel rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cyber-border/30">
                        <th className="text-left text-[10px] text-cyber-text-dim uppercase px-4 py-2">Port</th>
                        <th className="text-left text-[10px] text-cyber-text-dim uppercase px-4 py-2">Protocol</th>
                        <th className="text-left text-[10px] text-cyber-text-dim uppercase px-4 py-2">Service</th>
                        <th className="text-left text-[10px] text-cyber-text-dim uppercase px-4 py-2">State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {device.ports.map((port, i) => (
                        <tr key={i} className="border-b border-cyber-border/10">
                          <td className="text-xs text-white font-mono px-4 py-2">{port.port}</td>
                          <td className="text-xs text-cyber-text-dim uppercase px-4 py-2">{port.protocol}</td>
                          <td className="text-xs text-cyber-cyan px-4 py-2">{port.service}</td>
                          <td className="px-4 py-2">
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: port.state === 'open' ? 'rgba(0,255,136,0.1)' : 'rgba(255,136,0,0.1)',
                                color: port.state === 'open' ? '#00ff88' : '#ff8800',
                              }}
                            >
                              {port.state}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Services */}
            {device.services && device.services.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-cyber-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap size={12} />
                  Detected Services
                </h3>
                <div className="flex flex-wrap gap-2">
                  {device.services.map((service, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-3 py-1 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 font-mono"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="flex items-center justify-between pt-3 border-t border-cyber-border/30">
              <div className="flex items-center gap-1 text-[10px] text-cyber-text-dim">
                <Clock size={10} />
                <span>Last seen: {formatDateTime(device.lastSeen)}</span>
              </div>
              <span className="text-[10px] text-cyber-text-dim font-mono">ID: {device.id.slice(-8)}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
