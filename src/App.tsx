import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  NetworkDevice, NetworkInfo, ScanLog, ScanMode, ViewMode, TabType
} from './types/network';
import {
  getRealNetworkInfo, scanWiFiDevices, scanBluetoothDevices,
  createLog
} from './utils/networkScanner';
import { Header } from './components/Header';
import { ScanControls } from './components/ScanControls';
import { RadarView } from './components/RadarView';
import { DeviceCard } from './components/DeviceCard';
import { DeviceDetail } from './components/DeviceDetail';
import { NetworkInfoPanel } from './components/NetworkInfoPanel';
import { MonitorPanel } from './components/MonitorPanel';
import { LogConsole } from './components/LogConsole';
import { TopologyView } from './components/TopologyView';
import { SettingsPanel, AppSettings, defaultSettings } from './components/SettingsPanel';
import {
  LayoutGrid, List, Radar, Network, Wifi, Bluetooth,
  Filter, SortAsc, SortDesc, Search, Download
} from 'lucide-react';

type SortField = 'name' | 'signal' | 'type' | 'status';
type FilterType = 'all' | 'wifi' | 'bluetooth' | 'online' | 'offline';

function App() {
  // Core state
  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<ScanMode>('quick');
  const [scanProgress, setScanProgress] = useState(0);
  const [isLoadingNetwork, setIsLoadingNetwork] = useState(false);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('signal');
  const [sortAsc, setSortAsc] = useState(false);

  // Add log helper
  const addLog = useCallback((message: string, type: ScanLog['type'] = 'info') => {
    setLogs(prev => [...prev, createLog(message, type)]);
  }, []);

  // Load network info on mount
  useEffect(() => {
    const loadNetworkInfo = async () => {
      setIsLoadingNetwork(true);
      addLog('Initializing network interface detection...', 'info');
      try {
        const info = await getRealNetworkInfo();
        setNetworkInfo(info);
        addLog(`Network detected: Local IP ${info.localIP}`, 'success');
        addLog(`Public IP: ${info.publicIP}`, 'success');
        if (info.isp !== 'Unknown') addLog(`ISP: ${info.isp}`, 'info');
        if (info.city !== 'Unknown') addLog(`Location: ${info.city}, ${info.country}`, 'info');
        if (info.connectionType !== 'Unknown') addLog(`Connection: ${info.connectionType}`, 'info');
      } catch (e) {
        addLog('Failed to detect network information', 'error');
      }
      setIsLoadingNetwork(false);
    };
    loadNetworkInfo();
  }, [addLog]);

  // Auto refresh
  useEffect(() => {
    if (settings.autoRefresh && !isScanning && devices.length > 0) {
      autoRefreshRef.current = setInterval(() => {
        startScan();
      }, settings.refreshInterval * 1000);
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [settings.autoRefresh, settings.refreshInterval, isScanning, devices.length]);

  // Start scan
  const startScan = useCallback(() => {
    if (isScanning) return;
    
    setIsScanning(true);
    setScanProgress(0);
    addLog(`Starting ${scanMode} scan...`, 'info');
    addLog('Probing network interfaces...', 'info');

    const totalSteps = scanMode === 'quick' ? 20 : scanMode === 'full' ? 40 : 30;
    let step = 0;
    const discoveredDevices: NetworkDevice[] = [];
    const baseIP = networkInfo?.localIP || '192.168.1.100';

    // Determine device counts based on mode
    const wifiCount = scanMode === 'quick'
      ? Math.floor(Math.random() * 8) + 5
      : scanMode === 'full'
        ? Math.floor(Math.random() * 15) + 10
        : Math.floor(Math.random() * 6) + 3;
    
    const btCount = scanMode === 'quick'
      ? Math.floor(Math.random() * 4) + 2
      : scanMode === 'full'
        ? Math.floor(Math.random() * 8) + 5
        : Math.floor(Math.random() * 3) + 1;

    const wifiDevices = scanWiFiDevices(baseIP, Math.min(wifiCount, settings.maxDevices));
    const btDevices = scanBluetoothDevices(Math.min(btCount, settings.maxDevices - wifiCount));

    scanIntervalRef.current = setInterval(() => {
      step++;
      const progress = (step / totalSteps) * 100;
      setScanProgress(Math.min(progress, 99));

      // Progressively discover devices
      const wifiThreshold = Math.floor((step / totalSteps) * wifiDevices.length);
      const btThreshold = Math.floor(((step - totalSteps * 0.3) / (totalSteps * 0.7)) * btDevices.length);

      // Add WiFi devices
      for (let i = discoveredDevices.filter(d => d.type === 'wifi').length; i < wifiThreshold && i < wifiDevices.length; i++) {
        const dev = wifiDevices[i];
        discoveredDevices.push(dev);
        addLog(`[WiFi] Discovered: ${dev.name} at ${dev.ip} (${dev.signalStrength} dBm)`, 'success');
        if (dev.mac) addLog(`  → MAC: ${dev.mac} | Vendor: ${dev.vendor}`, 'info');
        if (dev.ports && dev.ports.length > 0) {
          addLog(`  → Open ports: ${dev.ports.map(p => `${p.port}/${p.service}`).join(', ')}`, 'warning');
        }
      }

      // Add Bluetooth devices
      if (step > totalSteps * 0.3) {
        for (let i = discoveredDevices.filter(d => d.type === 'bluetooth').length; i < btThreshold && i < btDevices.length; i++) {
          const dev = btDevices[i];
          discoveredDevices.push(dev);
          addLog(`[BT] Discovered: ${dev.name} (${dev.bluetoothClass}) ${dev.signalStrength} dBm`, 'success');
        }
      }

      // Log progress
      if (step % 5 === 0) {
        const msgs = [
          'Scanning ARP table...',
          'Performing reverse DNS lookup...',
          'Checking DHCP leases...',
          'Probing service ports...',
          'Analyzing network topology...',
          'Fingerprinting OS signatures...',
          'Checking mDNS records...',
          'Scanning UPnP devices...',
          'Resolving hostnames...',
          'Analyzing signal patterns...',
        ];
        addLog(msgs[Math.floor(Math.random() * msgs.length)], 'info');
      }

      setDevices([...discoveredDevices]);

      // Complete
      if (step >= totalSteps) {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        setScanProgress(100);
        setIsScanning(false);
        
        const wifiFound = discoveredDevices.filter(d => d.type === 'wifi').length;
        const btFound = discoveredDevices.filter(d => d.type === 'bluetooth').length;
        
        addLog('═══════════════════════════════════════════', 'info');
        addLog(`Scan complete! Found ${discoveredDevices.length} devices total`, 'success');
        addLog(`  WiFi devices: ${wifiFound} | Bluetooth devices: ${btFound}`, 'info');
        addLog(`  Online: ${discoveredDevices.filter(d => d.status === 'online').length} | Offline: ${discoveredDevices.filter(d => d.status === 'offline').length}`, 'info');
        addLog('═══════════════════════════════════════════', 'info');
      }
    }, scanMode === 'quick' ? 200 : scanMode === 'full' ? 350 : 400);
  }, [isScanning, scanMode, networkInfo, addLog, settings.maxDevices]);

  // Stop scan
  const stopScan = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
    setScanProgress(0);
    addLog('Scan stopped by user', 'warning');
  }, [addLog]);

  // Reset
  const resetScan = useCallback(() => {
    setDevices([]);
    setScanProgress(0);
    addLog('Device list cleared', 'info');
  }, [addLog]);

  // Filter and sort devices
  const filteredDevices = devices
    .filter(d => {
      if (!settings.showOfflineDevices && d.status === 'offline') return false;
      if (filterType === 'wifi') return d.type === 'wifi';
      if (filterType === 'bluetooth') return d.type === 'bluetooth';
      if (filterType === 'online') return d.status === 'online';
      if (filterType === 'offline') return d.status === 'offline';
      return true;
    })
    .filter(d => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.ip?.toLowerCase().includes(q) ||
        d.mac?.toLowerCase().includes(q) ||
        d.vendor?.toLowerCase().includes(q) ||
        d.hostname?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let result = 0;
      switch (sortField) {
        case 'name': result = a.name.localeCompare(b.name); break;
        case 'signal': result = b.signalStrength - a.signalStrength; break;
        case 'type': result = a.type.localeCompare(b.type); break;
        case 'status': result = a.status.localeCompare(b.status); break;
      }
      return sortAsc ? -result : result;
    });

  // Export devices
  const exportDevices = () => {
    const data = JSON.stringify(devices, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `netscan-devices-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('Device data exported', 'success');
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'scanner':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Controls + Radar */}
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-5">
                <ScanControls
                  isScanning={isScanning}
                  scanMode={scanMode}
                  scanProgress={scanProgress}
                  onStartScan={startScan}
                  onStopScan={stopScan}
                  onModeChange={setScanMode}
                  onReset={resetScan}
                  deviceCount={devices.length}
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <QuickStat
                  label="WiFi"
                  value={devices.filter(d => d.type === 'wifi').length}
                  icon={<Wifi size={14} />}
                  color="#00ff88"
                />
                <QuickStat
                  label="Bluetooth"
                  value={devices.filter(d => d.type === 'bluetooth').length}
                  icon={<Bluetooth size={14} />}
                  color="#3b82f6"
                />
                <QuickStat
                  label="Online"
                  value={devices.filter(d => d.status === 'online').length}
                  icon={<Radar size={14} />}
                  color="#00f0ff"
                />
              </div>

              {/* Mini log */}
              <div className="glass-panel rounded-2xl p-4 max-h-48 overflow-hidden">
                <div className="text-[10px] text-cyber-text-dim font-mono space-y-0.5">
                  {logs.slice(-8).map(log => (
                    <div key={log.id} className="truncate">
                      <span className="text-cyber-text-dim">[{log.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>{' '}
                      <span style={{ color: log.type === 'success' ? '#00ff88' : log.type === 'error' ? '#ff3355' : log.type === 'warning' ? '#ffd700' : '#00f0ff' }}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Radar View */}
            <div className="flex flex-col items-center justify-center">
              <RadarView
                devices={devices}
                isScanning={isScanning}
                onDeviceClick={setSelectedDevice}
              />
            </div>
          </div>
        );

      case 'devices':
        return (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="glass-panel rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full sm:w-auto">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-text-dim" />
                <input
                  type="text"
                  placeholder="Search devices by name, IP, MAC, vendor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-cyber-darker border border-cyber-border rounded-lg text-xs text-white placeholder-cyber-text-dim outline-none focus:border-cyber-cyan/40 transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <Filter size={12} className="text-cyber-text-dim" />
                  {(['all', 'wifi', 'bluetooth', 'online', 'offline'] as FilterType[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      className={`text-[10px] px-2 py-1 rounded-md transition-all ${
                        filterType === f
                          ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30'
                          : 'text-cyber-text-dim hover:text-white'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="text-[10px] bg-cyber-darker border border-cyber-border rounded-md px-2 py-1 text-cyber-text-dim outline-none"
                >
                  <option value="signal">Signal</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortAsc(!sortAsc)}
                  className="text-cyber-text-dim hover:text-cyber-cyan transition-colors"
                >
                  {sortAsc ? <SortAsc size={14} /> : <SortDesc size={14} />}
                </button>

                {/* View Mode */}
                <div className="flex items-center gap-1 ml-2">
                  {[
                    { mode: 'grid' as ViewMode, icon: <LayoutGrid size={14} /> },
                    { mode: 'list' as ViewMode, icon: <List size={14} /> },
                    { mode: 'radar' as ViewMode, icon: <Radar size={14} /> },
                    { mode: 'topology' as ViewMode, icon: <Network size={14} /> },
                  ].map(v => (
                    <button
                      key={v.mode}
                      onClick={() => setViewMode(v.mode)}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                        viewMode === v.mode
                          ? 'bg-cyber-cyan/15 text-cyber-cyan'
                          : 'text-cyber-text-dim hover:text-white'
                      }`}
                    >
                      {v.icon}
                    </button>
                  ))}
                </div>

                {/* Export */}
                {devices.length > 0 && (
                  <button
                    onClick={exportDevices}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-cyber-text-dim hover:text-cyber-green transition-colors"
                    title="Export devices"
                  >
                    <Download size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="text-[10px] text-cyber-text-dim px-1">
              Showing {filteredDevices.length} of {devices.length} devices
            </div>

            {/* Device Views */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredDevices.map((device, i) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    index={i}
                    onClick={() => setSelectedDevice(device)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="glass-panel rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyber-border/30">
                      <th className="text-left text-[10px] text-cyber-text-dim uppercase px-4 py-3">Status</th>
                      <th className="text-left text-[10px] text-cyber-text-dim uppercase px-4 py-3">Name</th>
                      <th className="text-left text-[10px] text-cyber-text-dim uppercase px-4 py-3">Type</th>
                      <th className="text-left text-[10px] text-cyber-text-dim uppercase px-4 py-3">IP Address</th>
                      <th className="text-left text-[10px] text-cyber-text-dim uppercase px-4 py-3">MAC</th>
                      <th className="text-left text-[10px] text-cyber-text-dim uppercase px-4 py-3">Signal</th>
                      <th className="text-left text-[10px] text-cyber-text-dim uppercase px-4 py-3">Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.map((device) => (
                      <tr
                        key={device.id}
                        onClick={() => setSelectedDevice(device)}
                        className="border-b border-cyber-border/10 hover:bg-cyber-border/10 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-2.5">
                          <div
                            className={`w-2 h-2 rounded-full ${device.status === 'online' ? 'animate-pulse' : ''}`}
                            style={{ backgroundColor: device.status === 'online' ? '#00ff88' : '#ff3355' }}
                          />
                        </td>
                        <td className="px-4 py-2.5 text-xs text-white">{device.name}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            device.type === 'wifi'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {device.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-cyber-text-dim font-mono">{device.ip || '-'}</td>
                        <td className="px-4 py-2.5 text-[10px] text-cyber-text-dim font-mono">{device.mac || '-'}</td>
                        <td className="px-4 py-2.5 text-[11px] font-mono" style={{ color: getSignalColor(device.signalStrength) }}>
                          {device.signalStrength} dBm
                        </td>
                        <td className="px-4 py-2.5 text-[11px] text-cyber-text-dim truncate max-w-[120px]">{device.vendor || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {viewMode === 'radar' && (
              <RadarView
                devices={filteredDevices}
                isScanning={isScanning}
                onDeviceClick={setSelectedDevice}
              />
            )}

            {viewMode === 'topology' && (
              <TopologyView
                devices={filteredDevices}
                networkInfo={networkInfo}
                onDeviceClick={setSelectedDevice}
              />
            )}

            {devices.length === 0 && (
              <div className="glass-panel rounded-2xl p-12 text-center">
                <Radar size={48} className="text-cyber-text-dim mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-semibold text-white mb-2">No Devices Scanned</h3>
                <p className="text-sm text-cyber-text-dim mb-4">
                  Go to the Scanner tab to start discovering devices on your network
                </p>
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="px-6 py-2 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan text-sm hover:bg-cyber-cyan/20 transition-all"
                >
                  Start Scanning
                </button>
              </div>
            )}
          </div>
        );

      case 'network':
        return (
          <NetworkInfoPanel
            networkInfo={networkInfo}
            isLoading={isLoadingNetwork}
          />
        );

      case 'monitor':
        return <MonitorPanel devices={devices} />;

      case 'logs':
        return <LogConsole logs={logs} onClear={() => setLogs([])} />;

      case 'settings':
        return <SettingsPanel settings={settings} onSettingsChange={setSettings} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cyber-darker noise-overlay grid-bg">
      {/* Scan line effect */}
      {isScanning && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent animate-scan-line" />
        </div>
      )}

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isScanning={isScanning}
        deviceCount={devices.length}
      />

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Device Detail Modal */}
      {selectedDevice && (
        <DeviceDetail
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-cyber-border/20 py-4 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 flex items-center justify-between text-[10px] text-cyber-text-dim">
          <span>NetScan Pro v2.0.0 · Advanced Network Scanner</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isScanning ? 'bg-cyber-green animate-pulse' : 'bg-cyber-text-dim'}`} />
              {isScanning ? 'Scanning' : 'Ready'}
            </span>
            <span>{devices.length} devices</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper components
function QuickStat({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel rounded-xl p-3 text-center"
    >
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-[10px] text-cyber-text-dim uppercase">{label}</span>
      </div>
      <div className="text-xl font-bold font-mono text-white">{value}</div>
    </motion.div>
  );
}

function getSignalColor(dbm: number): string {
  if (dbm >= -50) return '#00ff88';
  if (dbm >= -60) return '#00f0ff';
  if (dbm >= -70) return '#ffd700';
  if (dbm >= -80) return '#ff8800';
  return '#ff3355';
}

export default App;
