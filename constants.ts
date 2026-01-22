import { Profile, SystemStats, NetworkInfo } from './types';

export const PROFILE_DATA: Profile = {
  name: "František Kalášek",
  tagline: "Bridge the gap, create the world. | TopBot.PwnZ™",
  email: "topbot@topwnz.com",
  phone: "(+420) 722426195",
  website: "https://topwnz.com/",
  skills: [
    "Python", "JavaScript/TypeScript", "PWA Development", "React", "Kubernetes", 
    "Reverse Engineering", "Edge Computing", "Logistics Operations", "Driving (A, B, C, T, E)"
  ],
  jobs: [
    {
      company: "GAMA GROUP a.s.",
      role: "Dělník ve výrobě",
      location: "Jimramov, Česko",
      period: "17/03/2025 - 06/09/2025",
      description: ["Obsluha strojů dle SOP", "Kontrola kvality", "Důsledné dodržování norem"]
    },
    {
      company: "BODOS Czechia a.s.",
      role: "Řidič nákladního vozidla",
      location: "Boskovice, Česko",
      period: "02/04/2024 - 01/03/2025",
      description: ["Mezinárodní přeprava (EU)", "Vedení dokumentace", "Samostatná správa nákladu"]
    },
    {
      company: "Jihozápadní Dřevařská spol. a.s.",
      role: "Řidič nákladního vozidla",
      location: "Sušice, Česko",
      period: "02/04/2023 - 02/04/2024",
      description: ["Specializovaná přeprava v náročném terénu", "Hydraulický jeřáb", "Nulová nehodovost"]
    }
  ]
};

export const INITIAL_SYSTEM_STATS: SystemStats = {
  boardName: "brunch",
  cpuModel: "Intel(R) Pentium(R) CPU 4425Y @ 1.70GHz",
  totalMemory: 8388608, // kib
  availableMemory: 3128733, // kib
  cpuTemp: 47,
  battery: {
    state: "kFull",
    percentage: 91, // Based on wear percentage in source
    wear: 91,
    currentNow: 0,
    cycleCount: 275
  }
};

export const INITIAL_NETWORK_INFO: NetworkInfo = {
  ssid: "iPwnZu",
  mac: "7C:10:C9:D6:0B:BC", // 5GHz MAC as active
  lanMac: "7C:10:C9:D6:0B:B8",
  pin: "02025841",
  yandexDns: "Zakázat",
  gateway: "192.168.50.1",
  ip: "192.168.50.42",
  wanIp: "193.165.79.58",
  ddns: "ipwnzu.asuscomm.com",
  routerModel: "RT-AC1200 V2",
  firmwareVersion: "3.0.0.4.382_70638",
  operationMode: "Wireless Router", 
  securityType: "WPA2-Personal",
  wifiPassword: "i miss U1***",
  signalStrength: 98,
  frequency: 5220,
  bands: [
    {
        frequency: '5GHz',
        ssid: 'iPwnZu',
        mac: '7C:10:C9:D6:0B:BC',
        hidden: false,
        auth: 'WPA2-Personal',
        encryption: 'AES'
    },
    {
        frequency: '2.4GHz',
        ssid: 'iPwnZ',
        mac: '7C:10:C9:D6:0B:B8',
        hidden: true,
        auth: 'WPA2-Personal',
        encryption: 'AES'
    }
  ],
  devices: [
    { hostname: "Frank's iPhone 15", ip: "192.168.50.154", mac: "8A:2F:11:XX:XX:XX", type: "PHONE", connection: "5GHz" },
    { hostname: "Samsung TV 55", ip: "192.168.50.201", mac: "CC:4B:73:XX:XX:XX", type: "TV", connection: "2.4GHz" },
    { hostname: "Workstation-PC", ip: "192.168.50.42", mac: "DC:41:A9:XX:XX:XX", type: "LAPTOP", connection: "LAN" }
  ],
  tests: [
    { name: "GatewayCanBePinged", status: "Passed", timestamp: "2:12:31" },
    { name: "LanConnectivity", status: "Passed", timestamp: "2:12:32" },
    { name: "DnsResolution", status: "Passed", timestamp: "2:12:35" },
    { name: "SignalStrength", status: "Passed", timestamp: "2:12:38" },
    { name: "HasSecureWiFiConnection", status: "Passed", timestamp: "2:12:40" },
    { name: "HttpsFirewall", status: "Passed", timestamp: "2:12:41" },
    { name: "ArcHttp", status: "Passed", timestamp: "2:12:44" }
  ]
};