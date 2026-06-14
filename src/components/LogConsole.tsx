import React, { useRef, useEffect } from 'react';
import { ScanLog } from '../types/network';
import { formatTime } from '../utils/networkScanner';
import { Terminal, Trash2, Download } from 'lucide-react';

interface LogConsoleProps {
  logs: ScanLog[];
  onClear: () => void;
}

const typeColors: Record<string, string> = {
  info: '#00f0ff',
  success: '#00ff88',
  warning: '#ffd700',
  error: '#ff3355',
};

const typeLabels: Record<string, string> = {
  info: 'INF',
  success: 'OK ',
  warning: 'WRN',
  error: 'ERR',
};

export const LogConsole: React.FC<LogConsoleProps> = ({ logs, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const exportLogs = () => {
    const text = logs
      .map(l => `[${formatTime(l.timestamp)}] [${typeLabels[l.type]}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netscan-log-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyber-border/30">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-cyber-cyan" />
          <span className="text-xs font-semibold text-white">System Console</span>
          <span className="text-[10px] text-cyber-text-dim px-2 py-0.5 rounded-full bg-cyber-border/20">
            {logs.length} entries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportLogs}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-cyber-text-dim hover:text-cyber-cyan transition-colors"
            title="Export logs"
          >
            <Download size={13} />
          </button>
          <button
            onClick={onClear}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-cyber-text-dim hover:text-cyber-red transition-colors"
            title="Clear logs"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-0.5 min-h-[300px] max-h-[500px] bg-cyber-darker/50">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-cyber-text-dim text-xs">
            <span>Waiting for scan activity...</span>
            <span className="ml-1 animate-pulse">▊</span>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 py-0.5 hover:bg-cyber-border/10 px-1 rounded">
              <span className="text-cyber-text-dim shrink-0">{formatTime(log.timestamp)}</span>
              <span
                className="shrink-0 font-bold"
                style={{ color: typeColors[log.type] }}
              >
                [{typeLabels[log.type]}]
              </span>
              <span className="text-cyber-text break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-cyber-border/20 flex items-center">
        <span className="text-cyber-cyan text-[10px] font-mono">netscan@pro</span>
        <span className="text-cyber-text-dim text-[10px] font-mono">:~$ </span>
        <span className="text-cyber-text-dim text-[10px] animate-pulse ml-1">▊</span>
      </div>
    </div>
  );
};
