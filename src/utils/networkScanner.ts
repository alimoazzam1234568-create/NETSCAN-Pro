import { NetworkDevice, NetworkInfo, PortInfo, ScanLog } from '../types/network';

// Generate unique IDs
let idCounter = 0;
export const generateId = (): string => `dev_${Date.now()}_${++idCounter}`;
export const generateLogId = (): string => `log_${Date.now()}_${++idCounter}`;

// MAC address vendor lookup (common vendors)
const macVendors: Record<string, string> = {
  '00:1A:2B': 'Apple Inc.',
  '00:1B:44': 'Samsung Electronics',
  '00:1C:B3': 'Google LLC',
  '00:1D:72': 'Cisco Systems',
  '00:1E:58': 'D-Link Corporation',
  '00:1F:3A': 'Huawei Technologies',
  '00:20:91': 'TP-Link Technologies',
  '00:21:6A': 'Intel Corporation',
  '00:22:75': 'Sony Corporation',
  '00:23:14': 'Microsoft Corporation',
  '00:24:D7': 'Xiaomi Communications',
  '00:25:00': 'LG Electronics',
  '00:26:BB': 'Netgear Inc.',
  '00:27:10': 'Dell Technologies',
  '00:28:F8': 'ASUS Technology',
  'FC:A1:83': 'Amazon Technologies',
  'B4:F7:A1': 'OnePlus Technology',
  'DC:A6:32': 'Raspberry Pi Foundation',
  'A4:77:33': 'Motorola Solutions',
  '30:D1:6B': 'Lenovo',
};

const vendorNames = Object.values(macVendors);
const deviceNames = [
  'iPhone', 'Galaxy S24', 'MacBook Pro', 'Windows PC', 'iPad',
  'Smart TV', 'Printer', 'Router', 'NAS Server', 'Chromecast',
  'Echo Dot', 'Ring Doorbell', 'Nest Cam', 'Fire Stick', 'PlayStation',
  'Xbox Series', 'Smart Speaker', 'Security Camera', 'Smart Thermostat',
  'Laptop', 'Desktop', 'Tablet', 'Smart Watch', 'Smart Plug',
  'Pixel Phone', 'OnePlus 12', 'ThinkPad', 'Surface Pro', 'iMac',
];

const bluetoothNames = [
  'AirPods Pro', 'Galaxy Buds', 'JBL Speaker', 'Bose QC45',
  'Apple Watch', 'Fitbit', 'Keyboard', 'Mouse', 'Game Controller',
  'Car Audio', 'Sonos Speaker', 'Tile Tracker', 'Smart Band',
  'Sony WH-1000XM5', 'Beats Studio', 'Google Pixel Buds',
];

const osTypes = [
  'iOS 18', 'Android 15', 'Windows 11', 'macOS Sonoma', 'Linux',
  'ChromeOS', 'tvOS', 'Embedded', 'RouterOS', 'FreeBSD',
];

const commonServices = [
  'HTTP', 'HTTPS', 'SSH', 'FTP', 'SMB', 'DNS', 'DHCP',
  'mDNS', 'UPnP', 'AirPlay', 'Chromecast', 'DLNA',
];

// Generate realistic MAC address
const generateMAC = (): string => {
  const prefixes = Object.keys(macVendors);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Array.from({ length: 3 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
  ).join(':');
  return `${prefix}:${suffix}`;
};

// Generate realistic local IP
const generateLocalIP = (baseIP: string): string => {
  const parts = baseIP.split('.');
  parts[3] = String(Math.floor(Math.random() * 253) + 2);
  return parts.join('.');
};

// Generate port scan results
const generatePorts = (): PortInfo[] => {
  const commonPorts: Array<[number, string, string]> = [
    [22, 'tcp', 'SSH'],
    [53, 'udp', 'DNS'],
    [80, 'tcp', 'HTTP'],
    [443, 'tcp', 'HTTPS'],
    [445, 'tcp', 'SMB'],
    [548, 'tcp', 'AFP'],
    [631, 'tcp', 'IPP'],
    [3389, 'tcp', 'RDP'],
    [5000, 'tcp', 'UPnP'],
    [5353, 'udp', 'mDNS'],
    [8080, 'tcp', 'HTTP-Alt'],
    [8443, 'tcp', 'HTTPS-Alt'],
    [62078, 'tcp', 'iphone-sync'],
  ];
  
  const count = Math.floor(Math.random() * 5) + 1;
  const selected = commonPorts.sort(() => Math.random() - 0.5).slice(0, count);
  
  return selected.map(([port, protocol, service]) => ({
    port,
    protocol,
    state: Math.random() > 0.2 ? 'open' : 'filtered' as const,
    service,
  }));
};

// Get real network information using browser APIs
export const getRealNetworkInfo = async (): Promise<NetworkInfo> => {
  const info: NetworkInfo = {
    ssid: 'Unknown',
    bssid: 'Unknown',
    localIP: 'Detecting...',
    publicIP: 'Detecting...',
    gateway: 'Detecting...',
    subnetMask: '255.255.255.0',
    dns: [],
    isp: 'Unknown',
    city: 'Unknown',
    country: 'Unknown',
    connectionType: 'Unknown',
  };

  // Get connection type from Network Information API
  try {
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      info.connectionType = conn.effectiveType || conn.type || 'Unknown';
      info.downlink = conn.downlink;
      info.rtt = conn.rtt;
    }
  } catch (e) {
    // API not available
  }

  // Get local IP using WebRTC
  try {
    const localIP = await getLocalIP();
    if (localIP) {
      info.localIP = localIP;
      const parts = localIP.split('.');
      parts[3] = '1';
      info.gateway = parts.join('.');
    }
  } catch (e) {
    info.localIP = 'Not accessible';
    info.gateway = 'Not accessible';
  }

  // Get public IP and geolocation
  try {
    const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const data = await response.json();
      info.publicIP = data.ip || 'Not accessible';
      info.isp = data.org || 'Unknown';
      info.city = data.city || 'Unknown';
      info.country = data.country_name || 'Unknown';
    }
  } catch (e) {
    try {
      const response = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = await response.json();
        info.publicIP = data.ip || 'Not accessible';
      }
    } catch (e2) {
      info.publicIP = 'Not accessible';
    }
  }

  return info;
};

// Get local IP using WebRTC
const getLocalIP = (): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      const timeout = setTimeout(() => {
        pc.close();
        resolve(null);
      }, 3000);

      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        const parts = event.candidate.candidate.split(' ');
        const ip = parts[4];
        if (ip && ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
          clearTimeout(timeout);
          pc.close();
          resolve(ip);
        }
      };
    } catch (e) {
      resolve(null);
    }
  });
};

// Simulate WiFi device discovery (browser can't actually scan WiFi)
export const scanWiFiDevices = (baseIP: string, count: number): NetworkDevice[] => {
  const devices: NetworkDevice[] = [];
  const usedIPs = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let ip: string;
    do {
      ip = generateLocalIP(baseIP);
    } while (usedIPs.has(ip));
    usedIPs.add(ip);

    const mac = generateMAC();
    const macPrefix = mac.substring(0, 8);
    const vendor = macVendors[macPrefix] || vendorNames[Math.floor(Math.random() * vendorNames.length)];
    const name = deviceNames[Math.floor(Math.random() * deviceNames.length)];
    
    devices.push({
      id: generateId(),
      type: 'wifi',
      name: `${name} (${vendor.split(' ')[0]})`,
      ip,
      mac,
      signalStrength: -(Math.floor(Math.random() * 60) + 30),
      frequency: Math.random() > 0.4 ? '5 GHz' : '2.4 GHz',
      channel: Math.random() > 0.4 ? Math.floor(Math.random() * 40) + 36 : Math.floor(Math.random() * 13) + 1,
      encryption: ['WPA3', 'WPA2', 'WPA2/WPA3'][Math.floor(Math.random() * 3)],
      vendor,
      lastSeen: new Date(),
      status: Math.random() > 0.15 ? 'online' : 'offline',
      latency: Math.floor(Math.random() * 50) + 1,
      os: osTypes[Math.floor(Math.random() * osTypes.length)],
      hostname: `${name.toLowerCase().replace(/\s+/g, '-')}-${ip.split('.')[3]}`,
      ports: Math.random() > 0.5 ? generatePorts() : undefined,
      services: commonServices.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 1),
      distance: `~${(Math.random() * 30 + 1).toFixed(1)}m`,
    });
  }
  
  return devices;
};

// Simulate Bluetooth device discovery
export const scanBluetoothDevices = (count: number): NetworkDevice[] => {
  const devices: NetworkDevice[] = [];
  
  for (let i = 0; i < count; i++) {
    const name = bluetoothNames[Math.floor(Math.random() * bluetoothNames.length)];
    const mac = generateMAC();
    const macPrefix = mac.substring(0, 8);
    const vendor = macVendors[macPrefix] || vendorNames[Math.floor(Math.random() * vendorNames.length)];
    
    devices.push({
      id: generateId(),
      type: 'bluetooth',
      name,
      mac,
      signalStrength: -(Math.floor(Math.random() * 70) + 40),
      vendor,
      lastSeen: new Date(),
      status: Math.random() > 0.2 ? 'online' : 'offline',
      bluetoothClass: ['Audio', 'Peripheral', 'Wearable', 'Computer', 'Phone', 'Imaging'][Math.floor(Math.random() * 6)],
      paired: Math.random() > 0.7,
      distance: `~${(Math.random() * 15 + 0.5).toFixed(1)}m`,
    });
  }
  
  return devices;
};

// Check real Bluetooth availability
export const checkBluetoothAvailability = async (): Promise<boolean> => {
  try {
    return 'bluetooth' in navigator;
  } catch {
    return false;
  }
};

// Try real Bluetooth scan
export const tryRealBluetoothScan = async (): Promise<NetworkDevice | null> => {
  try {
    if (!('bluetooth' in navigator)) return null;
    
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['battery_service', 'device_information']
    });
    
    if (device) {
      return {
        id: generateId(),
        type: 'bluetooth',
        name: device.name || 'Unknown BT Device',
        mac: device.id || generateMAC(),
        signalStrength: -50,
        vendor: 'Detected Device',
        lastSeen: new Date(),
        status: 'online',
        bluetoothClass: 'Unknown',
        paired: device.gatt?.connected || false,
      };
    }
    return null;
  } catch {
    return null;
  }
};

// Generate scan logs
export const createLog = (message: string, type: ScanLog['type'] = 'info'): ScanLog => ({
  id: generateLogId(),
  timestamp: new Date(),
  message,
  type,
});

// Calculate signal quality from dBm
export const getSignalQuality = (dbm: number): { label: string; color: string; percent: number } => {
  if (dbm >= -30) return { label: 'Excellent', color: '#00ff88', percent: 100 };
  if (dbm >= -50) return { label: 'Great', color: '#00ff88', percent: 80 };
  if (dbm >= -60) return { label: 'Good', color: '#00f0ff', percent: 65 };
  if (dbm >= -70) return { label: 'Fair', color: '#ffd700', percent: 45 };
  if (dbm >= -80) return { label: 'Weak', color: '#ff8800', percent: 30 };
  return { label: 'Very Weak', color: '#ff3355', percent: 15 };
};

// Get device icon name based on device info
export const getDeviceCategory = (device: NetworkDevice): string => {
  const name = device.name.toLowerCase();
  if (name.includes('iphone') || name.includes('galaxy') || name.includes('pixel') || name.includes('oneplus') || name.includes('phone'))
    return 'smartphone';
  if (name.includes('macbook') || name.includes('laptop') || name.includes('thinkpad') || name.includes('surface'))
    return 'laptop';
  if (name.includes('ipad') || name.includes('tablet'))
    return 'tablet';
  if (name.includes('tv') || name.includes('chromecast') || name.includes('fire stick'))
    return 'tv';
  if (name.includes('printer'))
    return 'printer';
  if (name.includes('router'))
    return 'router';
  if (name.includes('airpods') || name.includes('buds') || name.includes('speaker') || name.includes('bose') || name.includes('jbl') || name.includes('beats') || name.includes('sony wh'))
    return 'audio';
  if (name.includes('watch') || name.includes('fitbit') || name.includes('band'))
    return 'wearable';
  if (name.includes('camera') || name.includes('ring') || name.includes('nest'))
    return 'camera';
  if (name.includes('echo') || name.includes('alexa'))
    return 'assistant';
  if (name.includes('xbox') || name.includes('playstation'))
    return 'gaming';
  if (name.includes('desktop') || name.includes('imac') || name.includes('pc'))
    return 'desktop';
  return 'unknown';
};

// Format date/time
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
};
