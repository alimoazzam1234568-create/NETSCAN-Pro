import React from 'react';
import { motion } from 'framer-motion';
import { ScanMode } from '../types/network';
import { Play, Square, Zap, Shield, Eye, RotateCcw } from 'lucide-react';

interface ScanControlsProps {
  isScanning: boolean;
  scanMode: ScanMode;
  scanProgress: number;
  onStartScan: () => void;
  onStopScan: () => void;
  onModeChange: (mode: ScanMode) => void;
  onReset: () => void;
  deviceCount: number;
}

const scanModes: { mode: ScanMode; label: string; description: string; icon: React.ReactNode; color: string }[] = [
  { mode: 'quick', label: 'Quick Scan', description: 'Fast device discovery', icon: <Zap size={14} />, color: '#00ff88' },
  { mode: 'full', label: 'Full Scan', description: 'Deep scan with ports', icon: <Shield size={14} />, color: '#00f0ff' },
  { mode: 'stealth', label: 'Stealth Scan', description: 'Low-profile scan', icon: <Eye size={14} />, color: '#a855f7' },
];

export const ScanControls: React.FC<ScanControlsProps> = ({
  isScanning, scanMode, scanProgress, onStartScan, onStopScan, onModeChange, onReset, deviceCount
}) => {
  return (
    <div className="space-y-4">
      {/* Scan Mode Selector */}
      <div className="grid grid-cols-3 gap-2">
        {scanModes.map(({ mode, label, description, icon, color }) => (
          <button
            key={mode}
            onClick={() => !isScanning && onModeChange(mode)}
            disabled={isScanning}
            className={`glass-panel rounded-xl p-3 text-left transition-all duration-300 ${
              scanMode === mode
                ? 'border-opacity-60'
                : 'border-opacity-20 opacity-60 hover:opacity-80'
            } ${isScanning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            style={{
              borderColor: scanMode === mode ? color : undefined,
              boxShadow: scanMode === mode ? `0 0 20px ${color}10` : undefined,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color }}>{icon}</span>
              <span className="text-xs font-semibold text-white">{label}</span>
            </div>
            <p className="text-[10px] text-cyber-text-dim">{description}</p>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      {isScanning && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyber-text-dim">Scanning network...</span>
            <span className="text-cyber-cyan font-mono">{Math.round(scanProgress)}%</span>
          </div>
          <div className="w-full h-2 bg-cyber-darker rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full relative"
              style={{
                width: `${scanProgress}%`,
                background: `linear-gradient(90deg, ${scanModes.find(m => m.mode === scanMode)?.color}40, ${scanModes.find(m => m.mode === scanMode)?.color})`,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </motion.div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {!isScanning ? (
          <button
            onClick={onStartScan}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${scanModes.find(m => m.mode === scanMode)?.color}20, ${scanModes.find(m => m.mode === scanMode)?.color}10)`,
              border: `1px solid ${scanModes.find(m => m.mode === scanMode)?.color}50`,
              color: scanModes.find(m => m.mode === scanMode)?.color,
              boxShadow: `0 0 30px ${scanModes.find(m => m.mode === scanMode)?.color}10`,
            }}
          >
            <Play size={16} />
            Start {scanModes.find(m => m.mode === scanMode)?.label}
          </button>
        ) : (
          <button
            onClick={onStopScan}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-cyber-red/10 border border-cyber-red/40 text-cyber-red hover:bg-cyber-red/20 transition-all"
          >
            <Square size={16} />
            Stop Scan
          </button>
        )}
        
        <button
          onClick={onReset}
          disabled={isScanning}
          className="w-11 h-11 rounded-xl glass-panel flex items-center justify-center text-cyber-text-dim hover:text-cyber-cyan transition-all disabled:opacity-30"
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Stats */}
      {deviceCount > 0 && (
        <div className="flex items-center justify-center gap-6 text-xs text-cyber-text-dim pt-2">
          <span>📡 <strong className="text-white">{deviceCount}</strong> devices found</span>
        </div>
      )}
    </div>
  );
};
