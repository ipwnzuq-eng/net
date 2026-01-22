
export interface SystemStats {
  boardName: string;
  cpuModel: string;
  totalMemory: number;
  availableMemory: number;
  cpuTemp: number;
  battery: {
    state: string;
    percentage: number; // calculated from wear
    wear: number;
    currentNow: number;
    cycleCount: number;
  };
}

export interface ConnectedDevice {
  hostname: string;
  ip: string; // "N/A" for Bluetooth
  mac: string; // or UUID for Bluetooth
  type: 'PHONE' | 'LAPTOP' | 'TV' | 'IOT' | 'AUDIO' | 'CONTROLLER' | 'PERIPHERAL';
  connection: '5GHz' | '2.4GHz' | 'LAN' | 'BLUETOOTH';
  rssi?: number; // Signal strength for BT
  manufacturer?: string;
}

export interface WifiBand {
  frequency: '2.4GHz' | '5GHz';
  ssid: string;
  mac: string;
  hidden: boolean;
  auth: string;
  encryption: string;
}

export interface NetworkInfo {
  ssid: string;
  mac: string; // Active connection MAC
  lanMac: string;
  pin: string;
  yandexDns: string;
  gateway: string;
  ip: string;
  wanIp: string;
  ddns: string;
  routerModel: string;
  firmwareVersion: string;
  operationMode: string;
  securityType: string;
  wifiPassword: string;
  signalStrength: number;
  frequency: number;
  bands: WifiBand[];
  devices: ConnectedDevice[];
  tests: NetworkTest[];
}

export interface NetworkTest {
  name: string;
  status: 'Passed' | 'Failed' | 'Running';
  timestamp: string;
}

export interface Job {
  company: string;
  role: string;
  location: string;
  period: string;
  description: string[];
}

export interface Profile {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  skills: string[];
  jobs: Job[];
}
