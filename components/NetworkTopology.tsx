import React, { useState, useEffect, useRef } from 'react';
import { NetworkInfo, ConnectedDevice } from '../types';
import { Wifi, Globe, Router, Laptop, ShieldCheck, X, Activity, Key, Users, Smartphone, Tv, Monitor, RefreshCw, Server, Tablet, Play, Square, Zap, Eye, EyeOff, Lock, Radio, ArrowDown, ArrowUp, Cpu, HardDrive, Bluetooth, Headphones, Gamepad, Keyboard, Power, Volume2, Volume1, VolumeX, Menu, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Link, Trash2, AlertTriangle, Search } from 'lucide-react';

interface Props {
  info: NetworkInfo;
}

// Extended interface for UI state to handle real-time simulation and raw BLE objects
interface DisplayDevice extends ConnectedDevice {
  latency: number;
  status: 'ONLINE' | 'SYNC' | 'PAIRING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  discoveredAt: number;
  traffic: { up: number; down: number };
  rawDevice?: any; // Holds the BluetoothDevice instance
  pairingError?: string;
}

type NodeType = 'WAN' | 'ROUTER' | 'DEVICE' | null;

const NetworkTopology: React.FC<Props> = ({ info }) => {
  const [selectedNode, setSelectedNode] = useState<NodeType>(null);
  const [selectedDevice, setSelectedDevice] = useState<DisplayDevice | null>(null);
  
  // Monitoring State
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [isBleScanning, setIsBleScanning] = useState(false);
  const [isBleSupported, setIsBleSupported] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DisplayDevice[]>([]);
  const [bleDevices, setBleDevices] = useState<DisplayDevice[]>([]);
  const [filterText, setFilterText] = useState('');
  const [remoteSignal, setRemoteSignal] = useState<string | null>(null);
  
  // Refs
  const monitorInterval = useRef<number | null>(null);

  useEffect(() => {
    // Check for Web Bluetooth support on mount
    const nav = navigator as any;
    if (nav.bluetooth) {
      setIsBleSupported(true);
    }
  }, []);

  const handleNodeClick = (node: NodeType) => {
    if (node !== 'DEVICE') {
        setSelectedDevice(null);
    }
    setSelectedNode(selectedNode === node ? null : node);
  };

  const handleDeviceSelect = (device: DisplayDevice) => {
      setSelectedDevice(device);
      setSelectedNode('DEVICE');
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
        setIsMonitoring(false);
        if (monitorInterval.current) {
            window.clearInterval(monitorInterval.current);
            monitorInterval.current = null;
        }
    } else {
        setIsMonitoring(true);
    }
  };

  // --- Real Bluetooth Logic ---

  const scanBluetooth = async () => {
    const nav = navigator as any;
    if (!nav.bluetooth) {
        alert("Web Bluetooth API not supported in this browser. Use Chrome, Edge, or Bluefy (iOS).");
        return;
    }

    setIsBleScanning(true);
    try {
        // Request any device (user must select from browser prompt)
        const device = await nav.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service', 'device_information']
        });

        const newBleDevice: DisplayDevice = {
            hostname: device.name || `Unknown BT Device (${device.id.slice(0, 4)})`,
            ip: "N/A",
            mac: device.id,
            type: device.name?.toLowerCase().includes('phone') ? 'PHONE' : 
                  device.name?.toLowerCase().includes('head') ? 'AUDIO' : 'PERIPHERAL',
            connection: 'BLUETOOTH',
            latency: 0,
            status: 'DISCONNECTED', // Start disconnected to allow manual pairing flow
            discoveredAt: Date.now(),
            traffic: { up: 0, down: 0 },
            manufacturer: "Generic BLE",
            rawDevice: device
        };

        setBleDevices(prev => {
            if (prev.find(d => d.mac === newBleDevice.mac)) return prev;
            return [...prev, newBleDevice];
        });
        
        // Auto-select the new device to show pairing options
        handleDeviceSelect(newBleDevice);

    } catch (error) {
        console.log("Bluetooth scan cancelled or failed:", error);
    } finally {
        setIsBleScanning(false);
    }
  };

  const handlePairDevice = async (device: DisplayDevice) => {
    if (!device.rawDevice) {
        // Simulation fallback for demo purposes if rawDevice is missing
        updateBleDeviceStatus(device.mac, 'PAIRING');
        setTimeout(() => {
            updateBleDeviceStatus(device.mac, 'CONNECTED');
        }, 2000);
        return;
    }

    updateBleDeviceStatus(device.mac, 'PAIRING', undefined); // Clear errors
    
    try {
        if (device.rawDevice.gatt) {
             await device.rawDevice.gatt.connect();
             updateBleDeviceStatus(device.mac, 'CONNECTED');
        } else {
            throw new Error("GATT Server unavailable");
        }
    } catch (error: any) {
        console.error("Pairing failed:", error);
        updateBleDeviceStatus(device.mac, 'ERROR', error.message || "Connection failed");
    }
  };

  const handleForgetDevice = (device: DisplayDevice) => {
      setBleDevices(prev => prev.filter(d => d.mac !== device.mac));
      if (selectedDevice?.mac === device.mac) {
          setSelectedDevice(null);
          setSelectedNode(null);
      }
      if (device.rawDevice?.gatt?.connected) {
          device.rawDevice.gatt.disconnect();
      }
  };

  const updateBleDeviceStatus = (mac: string, status: DisplayDevice['status'], error?: string) => {
      setBleDevices(prev => prev.map(d => {
          if (d.mac === mac) {
              const updated = { ...d, status, pairingError: error };
              if (selectedDevice?.mac === mac) {
                  setSelectedDevice(updated);
              }
              return updated;
          }
          return d;
      }));
  };

  const sendRemoteCommand = (cmd: string) => {
    setRemoteSignal(cmd);
    setTimeout(() => setRemoteSignal(null), 300);
  };

  // --- IP Monitoring Logic ---
  // Combined list for display
  const allDevices = [...discoveredDevices, ...bleDevices];

  // Live Monitor Effect (Simulated IP)
  useEffect(() => {
    if (isMonitoring) {
        monitorInterval.current = window.setInterval(() => {
            setDiscoveredDevices(prev => {
                const now = Date.now();
                let next = [...prev];

                // Discovery Logic (Simulated IP)
                if (next.length < info.devices.length) {
                    if (Math.random() > 0.7) {
                        const newDeviceIndex = next.length;
                        const baseDevice = info.devices[newDeviceIndex];
                        const newDevice: DisplayDevice = {
                            ...baseDevice,
                            latency: Math.floor(Math.random() * 15) + 5,
                            status: 'ONLINE',
                            discoveredAt: now,
                            traffic: { up: 0, down: 0 }
                        };
                        next.push(newDevice);
                    }
                }

                // Update Logic
                return next.map(d => ({
                    ...d,
                    latency: Math.max(1, Math.floor(d.latency + (Math.random() * 6 - 3))),
                    status: Math.random() > 0.95 ? 'SYNC' : 'ONLINE',
                    traffic: {
                        up: Math.max(0, Math.floor(Math.random() * 100)),
                        down: Math.max(0, Math.floor(Math.random() * 5000))
                    }
                }));
            });
        }, 800);
    }

    return () => {
        if (monitorInterval.current) {
            window.clearInterval(monitorInterval.current);
        }
    };
  }, [isMonitoring, info.devices]);

  const getDeviceIcon = (type: string, className = "w-4 h-4") => {
    switch (type) {
        case 'PHONE': return <Smartphone className={className} />;
        case 'TV': return <Tv className={className} />;
        case 'LAPTOP': return <Laptop className={className} />;
        case 'IOT': return <Server className={className} />;
        case 'AUDIO': return <Headphones className={className} />;
        case 'CONTROLLER': return <Gamepad className={className} />;
        case 'PERIPHERAL': return <Keyboard className={className} />;
        default: return <Monitor className={className} />;
    }
  };

  const formatSpeed = (kbps: number) => {
    if (kbps > 1000) return `${(kbps / 1000).toFixed(1)} MB/s`;
    return `${kbps} KB/s`;
  };

  const renderRemoteControl = (device: DisplayDevice) => {
      // Show remote only for TV, AUDIO, IOT and only if connected
      if (!['TV', 'AUDIO', 'IOT'].includes(device.type)) return null;
      if (device.connection === 'BLUETOOTH' && device.status !== 'CONNECTED') return null;

      return (
        <div className="mt-4 pt-4 border-t border-slate-700 animate-in slide-in-from-bottom-2 duration-300 relative">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                    <Gamepad className="w-3 h-3 mr-1" />
                    Remote Command Deck
                </h3>
                {/* Signal Indicator */}
                <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full border bg-slate-900 transition-all ${remoteSignal ? 'border-cyber-accent text-cyber-accent shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-slate-800 text-slate-600'}`}>
                    <Radio className={`w-3 h-3 ${remoteSignal ? 'animate-ping' : ''}`} />
                    <span className="text-[8px] font-mono">{remoteSignal ? `TX: ${remoteSignal}` : 'IDLE'}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                {/* Power */}
                <button 
                    onClick={() => sendRemoteCommand('POWER_TOGGLE')}
                    className="col-span-1 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded flex flex-col items-center justify-center active:scale-95 transition-all group touch-manipulation min-h-[44px]"
                >
                    <Power className="w-4 h-4 text-red-500 group-hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    <span className="text-[8px] text-red-400 mt-1">PWR</span>
                </button>
                <div className="col-span-2 grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => sendRemoteCommand('MENU')}
                        className="p-2 bg-slate-800 hover:bg-cyber-700 border border-slate-700 rounded flex items-center justify-center active:scale-95 transition-all touch-manipulation min-h-[44px]"
                    >
                        <Menu className="w-3 h-3 text-slate-300" />
                    </button>
                    <button 
                        onClick={() => sendRemoteCommand('SOURCE')}
                        className="p-2 bg-slate-800 hover:bg-cyber-700 border border-slate-700 rounded flex items-center justify-center active:scale-95 transition-all touch-manipulation min-h-[44px]"
                    >
                        <Square className="w-3 h-3 text-slate-300" />
                    </button>
                </div>
                
                {/* D-Pad Area */}
                <div className="col-span-3 h-24 relative bg-slate-800 rounded-full my-1 border border-slate-700 mx-8">
                     <button onClick={() => sendRemoteCommand('UP')} className="absolute top-0 left-1/2 -translate-x-1/2 p-2 hover:text-cyber-400 active:scale-90 transition-transform touch-manipulation w-10 h-10 flex items-center justify-center"><ChevronUp className="w-6 h-6" /></button>
                     <button onClick={() => sendRemoteCommand('DOWN')} className="absolute bottom-0 left-1/2 -translate-x-1/2 p-2 hover:text-cyber-400 active:scale-90 transition-transform touch-manipulation w-10 h-10 flex items-center justify-center"><ChevronDown className="w-6 h-6" /></button>
                     <button onClick={() => sendRemoteCommand('LEFT')} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 hover:text-cyber-400 active:scale-90 transition-transform touch-manipulation w-10 h-10 flex items-center justify-center"><ChevronLeft className="w-6 h-6" /></button>
                     <button onClick={() => sendRemoteCommand('RIGHT')} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:text-cyber-400 active:scale-90 transition-transform touch-manipulation w-10 h-10 flex items-center justify-center"><ChevronRight className="w-6 h-6" /></button>
                     <button onClick={() => sendRemoteCommand('OK')} className="absolute inset-0 m-auto w-10 h-10 bg-slate-700 rounded-full border border-slate-600 hover:bg-cyber-600 active:scale-95 flex items-center justify-center transition-colors touch-manipulation">
                        <span className="text-[8px] font-bold">OK</span>
                     </button>
                </div>

                {/* Vol / CH */}
                <button 
                    onClick={() => sendRemoteCommand('VOL_UP')}
                    className="p-2 bg-slate-800 hover:bg-cyber-700 border border-slate-700 rounded flex flex-col items-center justify-center active:scale-95 transition-all touch-manipulation min-h-[44px]"
                >
                    <Volume2 className="w-3 h-3 text-slate-300" />
                    <span className="text-[8px] text-slate-500 mt-1">VOL+</span>
                </button>
                <button 
                    onClick={() => sendRemoteCommand('MUTE')}
                    className="p-2 bg-slate-800 hover:bg-cyber-700 border border-slate-700 rounded flex flex-col items-center justify-center active:scale-95 transition-all touch-manipulation min-h-[44px]"
                >
                    <VolumeX className="w-3 h-3 text-slate-300" />
                    <span className="text-[8px] text-slate-500 mt-1">MUTE</span>
                </button>
                <button 
                    onClick={() => sendRemoteCommand('VOL_DOWN')}
                    className="p-2 bg-slate-800 hover:bg-cyber-700 border border-slate-700 rounded flex flex-col items-center justify-center active:scale-95 transition-all touch-manipulation min-h-[44px]"
                >
                    <Volume1 className="w-3 h-3 text-slate-300" />
                    <span className="text-[8px] text-slate-500 mt-1">VOL-</span>
                </button>
            </div>
            <div className="text-[8px] text-center text-slate-600 mt-2 font-mono">
                IR_BLASTER::EMULATED || WAKE_ON_LAN::READY
            </div>
        </div>
      );
  };

  const renderDetailPanel = () => {
    if (!selectedNode) return null;

    let title = "";
    let icon = null;
    let sections: { header?: string; items: { label: string; value: string | number | React.ReactNode; sub?: string; icon?: React.ReactNode; valueColor?: string }[] }[] = [];
    let showMonitorControls = false;

    const totalDown = discoveredDevices.reduce((acc, d) => acc + d.traffic.down, 0);
    const totalUp = discoveredDevices.reduce((acc, d) => acc + d.traffic.up, 0);
    const activeClients = discoveredDevices.filter(d => d.status === 'ONLINE').length;

    switch (selectedNode) {
      case 'WAN':
        title = "Internet Status";
        icon = <Globe className="w-5 h-5 text-cyber-500" />;
        sections = [
            {
                header: "Real-time Throughput",
                items: [
                    { label: "Total Download", value: <span className="text-cyber-accent font-bold">{formatSpeed(totalDown)}</span>, icon: <ArrowDown className="w-3 h-3 text-cyber-accent" /> },
                    { label: "Total Upload", value: <span className="text-cyber-500 font-bold">{formatSpeed(totalUp)}</span>, icon: <ArrowUp className="w-3 h-3 text-cyber-500" /> },
                ]
            },
            {
                header: "Interface Config",
                items: [
                    { label: "Connection", value: "Connected", sub: "WAN Interface", valueColor: "text-cyber-accent" },
                    { label: "WAN IP", value: info.wanIp },
                ]
            }
        ];
        break;
      case 'ROUTER':
        title = "Gateway Controller";
        icon = <Router className="w-5 h-5 text-cyber-500" />;
        showMonitorControls = true;
        
        const cpuLoad = 15 + (activeClients * 8) + Math.floor(Math.random() * 10);
        const memLoad = 30 + (activeClients * 5);
        
        const resourceItems = [
            { label: "CPU Load", value: `${cpuLoad}%`, valueColor: cpuLoad > 80 ? "text-danger" : "text-cyber-400", icon: <Cpu className="w-3 h-3 text-slate-400" /> },
            { label: "RAM Usage", value: `${memLoad} MB`, sub: "Allocated", icon: <HardDrive className="w-3 h-3 text-slate-400" /> },
            { label: "Active Clients", value: activeClients, icon: <Users className="w-3 h-3 text-slate-400" /> }
        ];

        sections = [
            { header: "Resource Monitor", items: resourceItems },
            { header: "System Identity", items: [
                { label: "Model", value: info.routerModel },
                { label: "LAN IP", value: info.gateway }
            ]}
        ];
        break;

      case 'DEVICE':
        if (selectedDevice) {
            title = selectedDevice.hostname;
            icon = getDeviceIcon(selectedDevice.type, "w-5 h-5 text-cyber-500");
            
            // Build items specific to connection type
            let connectionItems = [];
            if (selectedDevice.connection === 'BLUETOOTH') {
                connectionItems = [
                    { label: "Device ID", value: selectedDevice.mac.slice(0, 18) + "..." },
                    { label: "Protocol", value: "BLE / GATT", icon: <Bluetooth className="w-3 h-3 text-blue-400" /> },
                    { label: "Signal Strength", value: selectedDevice.rssi ? `${selectedDevice.rssi} dBm` : "N/A" },
                ];
            } else {
                connectionItems = [
                    { label: "IP Address", value: selectedDevice.ip },
                    { label: "MAC Address", value: selectedDevice.mac },
                    { label: "Connection", value: selectedDevice.connection },
                    { label: "Latency", value: `${selectedDevice.latency} ms`, icon: <Activity className="w-3 h-3 text-cyber-400" /> },
                    { label: "Traffic", value: (
                        <div className="flex space-x-2 text-[10px] font-mono">
                            <span className="flex items-center text-cyber-accent"><ArrowDown className="w-3 h-3 mr-0.5" />{formatSpeed(selectedDevice.traffic.down)}</span>
                            <span className="flex items-center text-cyber-500"><ArrowUp className="w-3 h-3 mr-0.5" />{formatSpeed(selectedDevice.traffic.up)}</span>
                        </div>
                    )}
                ];
            }

            // Determine status color/text
            let statusColor = 'bg-yellow-500';
            let statusText = selectedDevice.status;
            
            if (selectedDevice.status === 'CONNECTED' || selectedDevice.status === 'ONLINE') {
                statusColor = 'bg-cyber-accent shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse';
            } else if (selectedDevice.status === 'PAIRING') {
                statusColor = 'bg-blue-500 animate-ping';
            } else if (selectedDevice.status === 'ERROR') {
                statusColor = 'bg-red-500';
            } else if (selectedDevice.status === 'DISCONNECTED') {
                statusColor = 'bg-slate-600';
            }

            sections = [{
                items: [
                    ...connectionItems,
                    { 
                        label: "Status", 
                        value: (
                            <div className="flex items-center justify-end space-x-2">
                                <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
                                <span>{statusText}</span>
                            </div>
                        ), 
                        sub: selectedDevice.connection === 'BLUETOOTH' ? "Low Energy" : "Real-time" 
                    }
                ]
            }];
        }
        break;
    }

    // Devices filtering logic for the list view
    const devicesToList = allDevices.filter(d => 
        filterText === '' ||
        d.hostname.toLowerCase().includes(filterText.toLowerCase()) ||
        d.ip.toLowerCase().includes(filterText.toLowerCase()) ||
        d.mac.toLowerCase().includes(filterText.toLowerCase())
    );

    return (
      <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-md p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-4 duration-200 rounded-lg flex flex-col border border-slate-700/50 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-3 flex-shrink-0 min-h-[44px]">
          <div className="flex items-center space-x-3 overflow-hidden">
            {icon}
            <span className="font-bold text-slate-200 text-sm uppercase tracking-wider truncate">{title}</span>
          </div>
          <button 
            onClick={() => setSelectedNode(null)}
            className="p-2 sm:p-1 hover:bg-slate-800 rounded-full transition-colors border border-transparent hover:border-slate-600 flex-shrink-0 touch-manipulation active:scale-90"
            aria-label="Close detail panel"
          >
            <X className="w-6 h-6 sm:w-5 sm:h-5 text-slate-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 touch-pan-y">
            <div className="space-y-4 mb-4">
            
            {/* BLE Specific Controls */}
            {selectedDevice?.connection === 'BLUETOOTH' && (
                <div className="bg-slate-800/50 p-2 rounded border border-slate-700 mb-4 space-y-2">
                    {/* Error Banner */}
                    {selectedDevice.pairingError && (
                        <div className="flex items-center space-x-2 text-danger text-[9px] font-mono border border-danger/20 bg-danger/10 p-2 rounded">
                            <AlertTriangle className="w-3 h-3" />
                            <span>ERR: {selectedDevice.pairingError}</span>
                        </div>
                    )}

                    <div className="flex space-x-2">
                        {/* Pair Button */}
                        {selectedDevice.status !== 'CONNECTED' && selectedDevice.status !== 'PAIRING' && (
                            <button 
                                onClick={() => handlePairDevice(selectedDevice)}
                                className="flex-1 flex items-center justify-center space-x-1 py-3 sm:py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/50 rounded transition-all text-[10px] font-bold uppercase tracking-wider active:scale-95 touch-manipulation"
                            >
                                <Link className="w-3 h-3" />
                                <span>Pair Device</span>
                            </button>
                        )}
                        
                        {/* Forget Button */}
                        <button 
                            onClick={() => handleForgetDevice(selectedDevice)}
                            className="flex-1 flex items-center justify-center space-x-1 py-3 sm:py-1.5 bg-slate-700/30 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/50 rounded transition-all text-[10px] font-bold uppercase tracking-wider active:scale-95 touch-manipulation"
                        >
                            <Trash2 className="w-3 h-3" />
                            <span>Forget</span>
                        </button>
                    </div>

                    {/* Pairing Spinner */}
                    {selectedDevice.status === 'PAIRING' && (
                        <div className="flex items-center justify-center space-x-2 py-1">
                            <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                            <span className="text-[9px] text-blue-400 font-mono animate-pulse">NEGOTIATING SECURITY KEYS...</span>
                        </div>
                    )}
                </div>
            )}

            {sections.map((section, sIdx) => (
                <div key={sIdx}>
                    {section.header && (
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1 flex items-center">
                            {section.header}
                        </h3>
                    )}
                    <div className="space-y-3">
                        {section.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start group border-b border-slate-800/50 pb-2 last:border-0 min-h-[32px]">
                            <div className="flex items-center space-x-2">
                                {item.icon}
                                <span className="text-xs text-slate-500 font-mono group-hover:text-cyber-400 transition-colors">{item.label}</span>
                            </div>
                            <div className="text-right pl-4">
                                <div className={`text-xs font-mono break-all ${item.valueColor || 'text-white'}`}>
                                    {item.value}
                                </div>
                                {item.sub && <div className="text-[9px] text-slate-600">{item.sub}</div>}
                            </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            
            {/* Remote Control Interface injection */}
            {selectedDevice && renderRemoteControl(selectedDevice)}
            </div>

            {/* Live Monitoring Interface for Router */}
            {showMonitorControls && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-300">HYBRID SCANNER</span>
                        <div className="flex space-x-2">
                            {/* Real Bluetooth Scan Trigger */}
                            <button 
                                onClick={scanBluetooth}
                                disabled={isBleScanning || !isBleSupported}
                                title={!isBleSupported ? "Browser does not support Web Bluetooth" : "Scan for BLE devices"}
                                className={`flex items-center space-x-1 px-3 py-1.5 sm:py-1 rounded border transition-all touch-manipulation ${!isBleSupported ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500' : isBleScanning ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-400 hover:text-blue-400'}`}
                            >
                                <Bluetooth className={`w-3 h-3 ${isBleScanning ? 'animate-pulse' : ''}`} />
                                <span className="text-[10px] font-bold">BLE SCAN</span>
                            </button>

                            <button 
                                onClick={toggleMonitoring}
                                className={`flex items-center space-x-1 px-3 py-1.5 sm:py-1 rounded border transition-all touch-manipulation ${isMonitoring ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20' : 'bg-cyber-500/10 border-cyber-500/50 text-cyber-500 hover:bg-cyber-500/20'}`}
                            >
                                {isMonitoring ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                                <span className="text-[10px] font-bold">{isMonitoring ? 'IP STOP' : 'IP START'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Input */}
                    <div className="mb-3 relative group">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <Search className="w-3 h-3 text-slate-500 group-focus-within:text-cyber-400 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Filter by Hostname, IP, MAC..." 
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="bg-slate-900/50 border border-slate-700 text-slate-300 text-[10px] rounded p-2 sm:p-1.5 pl-8 w-full focus:outline-none focus:border-cyber-500 transition-colors font-mono"
                        />
                        {filterText && (
                            <button 
                                onClick={() => setFilterText('')}
                                className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer text-slate-500 hover:text-white touch-manipulation p-2"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Active Discovery Animation */}
                    {(isMonitoring && discoveredDevices.length < info.devices.length) || isBleScanning ? (
                        <div className="mb-3 p-2 bg-slate-800/50 rounded border border-slate-700 flex items-center justify-center space-x-2">
                             <RefreshCw className="w-3 h-3 text-cyber-500 animate-spin" />
                             <span className="text-[10px] text-slate-400 font-mono animate-pulse">
                                 {isBleScanning ? "SCANNING PHYSICAL SPECTRUM..." : "MAPPING NETWORK TOPOLOGY..."}
                             </span>
                        </div>
                    ) : null}

                    {/* Device List - Responsive Grid */}
                    <div className="space-y-2 animate-in fade-in duration-300">
                        {devicesToList.length === 0 && !isMonitoring ? (
                             <div className="text-center py-6 border border-dashed border-slate-700 rounded bg-slate-800/20">
                                <Activity className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                                <div className="text-[10px] text-slate-500">System Idle. Start monitor to map network.</div>
                            </div>
                        ) : devicesToList.length === 0 && (isMonitoring || filterText) ? (
                            <div className="text-center py-4 text-[10px] text-slate-500 italic">
                                No devices found matching filter.
                            </div>
                        ) : (
                            devicesToList.map((device, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handleDeviceSelect(device)}
                                    className={`bg-slate-800/50 p-2 sm:p-2 rounded flex items-center justify-between border-l-2 cursor-pointer hover:bg-slate-700 transition-colors group touch-manipulation active:bg-slate-700 ${device.connection === 'BLUETOOTH' ? 'border-l-blue-500' : 'border-l-cyber-500'}`}
                                >
                                    <div className="flex items-center space-x-2 overflow-hidden">
                                        <div className="p-1.5 bg-slate-900 rounded border border-slate-800 group-hover:border-slate-600 transition-colors flex-shrink-0">
                                            {getDeviceIcon(device.type, device.connection === 'BLUETOOTH' ? "w-4 h-4 sm:w-3 sm:h-3 text-blue-400" : "w-4 h-4 sm:w-3 sm:h-3 text-slate-300 group-hover:text-white")}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[11px] sm:text-[10px] font-bold text-white truncate">{device.hostname}</div>
                                            <div className="text-[9px] sm:text-[8px] font-mono text-slate-500 flex items-center">
                                                {device.connection === 'BLUETOOTH' ? (
                                                    <span className="text-blue-400 flex items-center"><Bluetooth className="w-2 h-2 mr-1"/> BLE</span>
                                                ) : device.ip}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end flex-shrink-0 ml-2">
                                        <div className="flex items-center space-x-1 mb-0.5">
                                             {device.connection !== 'BLUETOOTH' && (
                                                 <div className="flex space-x-1 text-[8px] font-mono mr-1">
                                                    <span className="text-cyber-accent flex items-center"><ArrowDown className="w-2 h-2" /></span>
                                                    <span className="text-slate-400">{formatSpeed(device.traffic.down).split(' ')[0]}</span>
                                                </div>
                                             )}
                                            <span className={`w-2 h-2 sm:w-1.5 sm:h-1.5 rounded-full ${device.status === 'ONLINE' || device.status === 'CONNECTED' ? 'bg-cyber-accent animate-pulse' : device.status === 'PAIRING' ? 'bg-blue-500 animate-ping' : device.status === 'ERROR' ? 'bg-red-500' : 'bg-slate-600'}`}></span>
                                        </div>
                                        <div className="text-[9px] sm:text-[8px] text-slate-600">{device.latency}ms</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>

        <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-center text-slate-600 font-mono flex-shrink-0">
          SECURE ENCLAVE::ACCESS_GRANTED
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full py-4 overflow-hidden touch-pan-x touch-pan-y">
      
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #0ea5e9 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {renderDetailPanel()}

      <div className={`flex flex-col items-center justify-start w-full h-full transition-all duration-300 ${selectedNode ? 'opacity-20 blur-sm scale-95 pointer-events-none' : 'opacity-100'} overflow-y-auto custom-scrollbar`}>
        
        {/* Internet/WAN Node */}
        <div 
          onClick={() => handleNodeClick('WAN')}
          className="relative group flex flex-col items-center cursor-pointer transition-transform active:scale-95 z-10 flex-shrink-0 touch-manipulation mb-2"
        >
            <div className={`w-14 h-14 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)] z-10 relative transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.6)] ${selectedNode === 'WAN' ? 'bg-cyber-500 border-white' : 'bg-cyber-800 border-cyber-500'}`}>
                <Globe className={`w-7 h-7 sm:w-6 sm:h-6 transition-colors ${selectedNode === 'WAN' ? 'text-black' : 'text-cyber-500 animate-pulse'}`} />
            </div>
            
            <div className="text-center mt-1">
                <div className="text-[10px] sm:text-[9px] text-slate-500 font-mono group-hover:text-cyber-400">WAN IP</div>
                <div className="text-[9px] sm:text-[8px] text-cyber-400 font-mono block">{info.wanIp}</div>
            </div>
        </div>

        {/* Connection Line */}
        <div className="h-6 w-0.5 bg-gradient-to-b from-cyber-500 to-cyber-700 opacity-50 flex-shrink-0"></div>

        {/* Gateway Node (Router) with Radar Effect */}
        <div 
          onClick={() => handleNodeClick('ROUTER')}
          className="relative group w-full max-w-xs px-4 cursor-pointer z-10 flex-shrink-0 touch-manipulation"
        >
            {/* Radar Animation */}
            {(isMonitoring || isBleScanning) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-14 bg-cyber-500/10 rounded-lg animate-ping"></div>
                </div>
            )}
            
            <div className={`glass-panel p-4 sm:p-3 rounded-lg border transition-all duration-300 flex items-center justify-between active:scale-[0.98] shadow-lg relative bg-slate-900/80 group-hover:border-cyber-500 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.2)] ${isMonitoring ? 'border-cyber-500 shadow-[0_0_20px_rgba(14,165,233,0.2)]' : 'border-slate-700'}`}>
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded border transition-colors ${isMonitoring ? 'bg-cyber-900 border-cyber-500' : 'bg-cyber-900 border-slate-700 group-hover:bg-cyber-800'}`}>
                        <Router className={`w-6 h-6 sm:w-5 sm:h-5 transition-colors ${isMonitoring ? 'text-cyber-400' : 'text-slate-300 group-hover:text-cyber-400'}`} />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-sm sm:text-xs font-bold text-white group-hover:text-cyber-400 transition-colors">{info.routerModel}</div>
                        <div className="text-[10px] sm:text-[9px] font-mono text-slate-500 block">{info.firmwareVersion}</div>
                    </div>
                </div>
                {isMonitoring || isBleScanning ? (
                    <Activity className="w-4 h-4 sm:w-3 sm:h-3 text-cyber-accent animate-pulse" />
                ) : (
                    <div className={`w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full ${allDevices.length > 0 ? 'bg-cyber-500' : 'bg-slate-700'}`}></div>
                )}
            </div>
        </div>

        {/* Connection Flow */}
        <div className="h-8 w-0.5 bg-cyber-800 relative overflow-hidden my-1 flex-shrink-0">
          <div className="absolute top-0 left-0 w-full h-full bg-cyber-accent opacity-50 animate-[slideDown_1.5s_infinite]"></div>
        </div>

        {/* Dynamic Device Rendering */}
        {allDevices.length === 0 ? (
            /* Generic Device Placeholder */
            <div 
            onClick={() => handleNodeClick('DEVICE')}
            className="relative w-full max-w-xs px-4 cursor-pointer group z-10 flex-shrink-0 touch-manipulation"
            >
            <div className="glass-panel rounded-xl p-4 sm:p-3 flex items-center justify-between border-l-2 border-l-slate-600 hover:bg-slate-800/50 transition-all active:scale-[0.98] shadow-lg">
                <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyber-800 rounded-md">
                    <ShieldCheck className="w-6 h-6 sm:w-5 sm:h-5 text-slate-400 group-hover:text-white" />
                </div>
                <div>
                    <div className="text-sm sm:text-xs font-bold text-slate-300">Network Zone</div>
                    <div className="text-[10px] sm:text-[9px] font-mono text-slate-500">{isMonitoring ? 'Scanning...' : 'Offline'}</div>
                </div>
                </div>
                <div className="flex flex-col items-end">
                    {isMonitoring ? <RefreshCw className="w-4 h-4 sm:w-3 sm:h-3 text-cyber-500 animate-spin" /> : <Zap className="w-4 h-4 sm:w-3 sm:h-3 text-slate-600" />}
                </div>
            </div>
            </div>
        ) : (
            /* Discovered Devices Grid */
            <div className="w-full px-2 grid grid-cols-2 sm:grid-cols-3 gap-2 pb-4 overflow-y-auto">
                {allDevices.map((device, idx) => (
                    <div 
                        key={idx}
                        onClick={() => handleDeviceSelect(device)}
                        className={`glass-panel p-3 sm:p-2 rounded-lg cursor-pointer hover:border-cyber-500 transition-all hover:bg-slate-800 active:scale-95 flex flex-col items-center text-center animate-in zoom-in duration-300 border border-slate-700/50 touch-manipulation ${device.connection === 'BLUETOOTH' ? 'shadow-[0_0_10px_rgba(59,130,246,0.1)]' : ''}`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="relative">
                            <div className="p-2 sm:p-1.5 bg-slate-900 rounded-full mb-1 border border-slate-700">
                                {getDeviceIcon(device.type, device.connection === 'BLUETOOTH' ? "w-5 h-5 sm:w-4 sm:h-4 text-blue-400" : "w-5 h-5 sm:w-4 sm:h-4 text-cyber-400")}
                            </div>
                            <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full border border-slate-900 ${device.status === 'ONLINE' || device.status === 'CONNECTED' ? 'bg-cyber-accent shadow-[0_0_8px_rgba(16,185,129,0.5)]' : device.status === 'PAIRING' ? 'bg-blue-500 animate-ping' : device.status === 'ERROR' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                        </div>
                        <div className="text-[10px] sm:text-[9px] font-bold text-slate-200 truncate w-full">{device.hostname}</div>
                        <div className="flex items-center justify-center space-x-1 mt-0.5">
                            {device.connection === 'BLUETOOTH' ? (
                                <span className="text-[9px] sm:text-[8px] font-mono text-blue-400 flex items-center">
                                    <Bluetooth className="w-2.5 h-2.5 sm:w-2 sm:h-2 mr-0.5" /> BLE
                                </span>
                            ) : (
                                <>
                                <span className="text-[9px] sm:text-[8px] font-mono text-slate-500">{device.latency}ms</span>
                                <span className="text-[8px] sm:text-[7px] font-mono text-cyber-accent flex items-center">
                                    <ArrowDown className="w-2.5 h-2.5 sm:w-2 sm:h-2" />
                                </span>
                                </>
                            )}
                        </div>
                        <div className={`mt-1 h-0.5 w-4 rounded-full ${device.connection === 'BLUETOOTH' ? 'bg-blue-500/50' : 'bg-cyber-accent/50'}`}></div>
                    </div>
                ))}
            </div>
        )}

      </div>

      <style>{`
        @keyframes slideDown {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};

export default NetworkTopology;