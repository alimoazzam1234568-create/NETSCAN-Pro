export interface NetworkDevice {
  id: string;
  type: 'wifi' | 'bluetooth' | 'unknown';
  name: string;
  ip?: string;
  mac?: string;
  signalStrength: number; // -100 to 0 dBm
  frequency?: string;
  channel?: number;
  encryption?: string;
  vendor?: string;
  lastSeen: Date;
  status: 'online' | 'offline' | 'scanning';
  latency?: number;
  bandwidth?: string;
  os?: string;
  hostname?: string;
  ports?: PortInfo[];
  services?: string[];
  bluetoothClass?: string;
  paired?: boolean;
  distance?: string;
}

export interface PortInfo {
  port: number;
  protocol: string;
  state: 'open' | 'closed' | 'filtered';
  service: string;
}

export interface ScanResult {
  totalDevices: number;
  wifiDevices: number;
  bluetoothDevices: number;
  scanDuration: number;
  timestamp: Date;
  networkInfo: NetworkInfo;
}

export interface NetworkInfo {
  ssid: string;
  bssid: string;
  localIP: string;
  publicIP: string;
  gateway: string;
  subnetMask: string;
  dns: string[];
  isp: string;
  city: string;
  country: string;
  connectionType: string;
  downlink?: number;
  rtt?: number;
}

export interface ScanLog {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type ScanMode = 'quick' | 'full' | 'stealth';
export type ViewMode = 'grid' | 'list' | 'radar' | 'topology';
export type TabType = 'scanner' | 'devices' | 'network' | 'monitor' | 'logs' | 'settings';
