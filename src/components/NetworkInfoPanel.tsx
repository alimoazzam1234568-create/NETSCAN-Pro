import React from 'react';
import { motion } from 'framer-motion';
import { NetworkInfo } from '../types/network';
import {
  Globe, Wifi, Server, Shield, MapPin, Gauge, Activity,
  Copy, CheckCircle2, Loader2
} from 'lucide-react';

interface NetworkInfoPanelProps {
  networkInfo: NetworkInfo | null;
  isLoading: boolean;
}

export const NetworkInfoPanel: React.FC<NetworkInfoPanelProps> = ({ networkInfo, isLoading }) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center">
        <Loader2 size={32} className="text-cyber-cyan animate-spin mb-3" />
        <p className="text-sm text-cyber-text-dim">Detecting network information...</p>
        <p className="text-[10px] text-cyber-text-dim mt-1">Querying network interfaces</p>
      </div>
    );
  }

  if (!networkInfo) return null;

  const infoCards = [
    {
      icon: <Globe size={18} />,
      label: 'Public IP',
      value: networkInfo.publicIP,
      color: '#00f0ff',
      copyable: true,
    },
    {
      icon: <Wifi size={18} />,
      label: 'Local IP',
      value: networkInfo.localIP,
      color: '#00ff88',
      copyable: true,
    },
    {
      icon: <Server size={18} />,
      label: 'Gateway',
      value: networkInfo.gateway,
      color: '#a855f7',
      copyable: true,
    },
    {
      icon: <Shield size={18} />,
      label: 'Subnet Mask',
      value: networkInfo.subnetMask,
      color: '#ff8800',
      copyable: false,
    },
    {
      icon: <MapPin size={18} />,
      label: 'Location',
      value: networkInfo.city !== 'Unknown' ? `${networkInfo.city}, ${networkInfo.country}` : 'Not available',
      color: '#ff3355',
      copyable: false,
    },
    {
      icon: <Activity size={18} />,
      label: 'ISP',
      value: networkInfo.isp,
      color: '#ffd700',
      copyable: false,
    },
    {
      icon: <Gauge size={18} />,
      label: 'Connection',
      value: networkInfo.connectionType !== 'Unknown' ? networkInfo.connectionType.toUpperCase() : 'Unknown',
      color: '#3b82f6',
      copyable: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {infoCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-panel rounded-xl p-4 group hover:border-opacity-40 transition-all"
            style={{ borderColor: `${card.color}20` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${card.color}10`, color: card.color }}
                >
                  {card.icon}
                </div>
                <span className="text-[10px] text-cyber-text-dim uppercase tracking-wider">{card.label}</span>
              </div>
              {card.copyable && card.value && !card.value.includes('Not') && !card.value.includes('Detect') && (
                <button
                  onClick={() => copyToClipboard(card.value!, card.label)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-cyber-text-dim hover:text-cyber-cyan"
                >
                  {copiedField === card.label ? (
                    <CheckCircle2 size={14} className="text-cyber-green" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              )}
            </div>
            <p className="text-sm font-mono text-white truncate" title={card.value}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Speed Info */}
      {(networkInfo.downlink || networkInfo.rtt) && (
        <div className="glass-panel rounded-xl p-4">
          <h4 className="text-xs text-cyber-text-dim uppercase tracking-wider mb-3 flex items-center gap-2">
            <Gauge size={12} />
            Connection Performance
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {networkInfo.downlink && (
              <div>
                <div className="text-2xl font-bold text-cyber-green font-mono">
                  {networkInfo.downlink} <span className="text-sm text-cyber-text-dim">Mbps</span>
                </div>
                <p className="text-[10px] text-cyber-text-dim">Estimated Downlink</p>
              </div>
            )}
            {networkInfo.rtt && (
              <div>
                <div className="text-2xl font-bold text-cyber-cyan font-mono">
                  {networkInfo.rtt} <span className="text-sm text-cyber-text-dim">ms</span>
                </div>
                <p className="text-[10px] text-cyber-text-dim">Round Trip Time</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-[10px] text-cyber-text-dim text-center py-2 px-4 glass-panel rounded-lg">
        ℹ️ Network info is detected using browser APIs. Some details may be limited by browser security policies.
        Only real, accessible information is displayed.
      </div>
    </div>
  );
};
