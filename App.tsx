import React, { useState, useEffect } from 'react';
import { Activity, Battery, Cpu, Wifi, Terminal, Zap, Power, Shield, RefreshCw, Radio } from 'lucide-react';
import { INITIAL_SYSTEM_STATS, INITIAL_NETWORK_INFO } from './constants';
import NetworkTopology from './components/NetworkTopology';
import TelemetryGraph from './components/TelemetryGraph';
import TerminalLogs from './components/TerminalLogs';
import SystemLogs from './components/SystemLogs';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [stats, setStats] = useState(INITIAL_SYSTEM_STATS);
  const [logMode, setLogMode] = useState<'net' | 'sys'>('net');

  // Clock tick and System Simulation
  useEffect(() => {
    const tick = () => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('cs-CZ'));
    };
    tick();
    const interval = setInterval(tick, 1000);

    // Simulate real-time system fluctuations
    const simInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpuTemp: 42 + Math.floor(Math.random() * 15), // 42-57°C
        availableMemory: Math.max(100000, prev.availableMemory + Math.floor((Math.random() - 0.5) * 50000)), // Fluctuate memory
        battery: {
          ...prev.battery,
          currentNow: Math.floor(Math.random() * 450) + 150, // 150-600mA draw
          percentage: Math.max(0, Math.min(100, prev.battery.percentage - (Math.random() > 0.9 ? 1 : 0))) // Occasional drop
        }
      }));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(simInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-cyber-900 text-slate-200 flex flex-col font-sans selection:bg-cyber-500 selection:text-white pb-6 lg:pb-0">
      
      {/* Top Bar / Status Header */}
      <header className="h-14 lg:h-12 bg-cyber-800 border-b border-slate-700 flex items-center justify-between px-4 z-50 sticky top-0 shadow-lg shadow-cyber-900/50">
        <div className="flex items-center space-x-4">
            <div className="flex items-center text-cyber-500 space-x-2">
                <Terminal className="w-6 h-6 lg:w-5 lg:h-5" />
                <span className="font-mono font-bold tracking-widest text-sm hidden sm:block">TOPBOT.NEXUS_V3.0::MONITOR</span>
                <span className="font-mono font-bold tracking-widest text-xs sm:hidden">NEXUS_V3.0</span>
            </div>
            <div className="h-4 w-px bg-slate-600 hidden sm:block"></div>
            <div className="text-xs font-mono text-slate-400 hidden lg:block">
                SYS_INTEGRITY: 100% | ENCRYPTION: AES-256-GCM
            </div>
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="flex items-center space-x-2 text-xs font-mono">
                <Wifi className="w-4 h-4 text-cyber-accent" />
                <span className="hidden sm:inline">{INITIAL_NETWORK_INFO.ssid}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
                <Battery className="w-4 h-4 text-cyber-500" />
                <span>{stats.battery.percentage}%</span>
            </div>
            <div className="px-3 py-1 bg-cyber-900 rounded border border-slate-700 text-cyber-500 font-mono text-xs">
                {currentTime}
            </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 p-3 lg:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-min lg:auto-rows-auto">
        
        {/* Left Column: System Telemetry (Expanded to 8 cols) */}
        <section className="order-1 lg:col-span-8 flex flex-col gap-4 h-auto lg:h-[calc(100vh-6rem)]">
            
            {/* Top Row: Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
                {/* CPU Tile */}
                <div className="glass-panel p-3 rounded-lg border-l-2 border-l-cyber-500 active:bg-slate-800/80 transition-colors touch-manipulation">
                    <div className="flex justify-between items-start">
                        <div className="text-[10px] text-slate-400 uppercase">CPU Load</div>
                        <Cpu className="w-4 h-4 text-cyber-500" />
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold mt-1">31<span className="text-sm text-slate-500">%</span></div>
                    <div className="text-[10px] text-slate-500 truncate mt-1">{stats.cpuModel.split('@')[0]}</div>
                </div>

                {/* Temp Tile */}
                <div className="glass-panel p-3 rounded-lg border-l-2 border-l-warn active:bg-slate-800/80 transition-colors touch-manipulation">
                    <div className="flex justify-between items-start">
                        <div className="text-[10px] text-slate-400 uppercase">Core Temp</div>
                        <Activity className="w-4 h-4 text-warn" />
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold mt-1">{stats.cpuTemp}<span className="text-sm text-slate-500">°C</span></div>
                    <div className="text-[10px] text-slate-500 mt-1">Thermal Normal</div>
                </div>

                {/* Memory Tile */}
                <div className="glass-panel p-3 rounded-lg border-l-2 border-l-cyber-accent active:bg-slate-800/80 transition-colors touch-manipulation">
                    <div className="flex justify-between items-start">
                        <div className="text-[10px] text-slate-400 uppercase">Memory Free</div>
                        <div className="h-4 w-4 rounded-full border border-cyber-accent flex items-center justify-center">
                            <div className="h-2 w-2 bg-cyber-accent rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold mt-1">
                        {(stats.availableMemory / 1024 / 1024).toFixed(1)}<span className="text-sm text-slate-500">GB</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">of {(stats.totalMemory / 1024 / 1024).toFixed(1)} GB Total</div>
                </div>

                 {/* Battery Detail Tile */}
                 <div className="glass-panel p-3 rounded-lg border-l-2 border-l-purple-500 active:bg-slate-800/80 transition-colors touch-manipulation">
                    <div className="flex justify-between items-start">
                        <div className="text-[10px] text-slate-400 uppercase">Power Health</div>
                        <Power className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold mt-1">{stats.battery.wear}<span className="text-sm text-slate-500">%</span></div>
                    <div className="text-[10px] text-slate-500 mt-1">{stats.battery.state} (AC)</div>
                </div>
            </div>

            {/* Middle: Graph (Expanded Width) */}
            <div className="flex-1 glass-panel rounded-xl p-4 min-h-[250px] sm:min-h-[300px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 bg-cyber-500/10 rounded-bl-xl text-[10px] text-cyber-500 font-mono z-10">
                    LIVE_FEED::BRUNCH_BOARD
                </div>
                <TelemetryGraph />
            </div>

            {/* Bottom: Logs (Expanded Width) */}
            <div className="h-[250px] lg:h-1/3 glass-panel rounded-xl overflow-hidden border border-slate-700/50 flex flex-col relative">
                {/* Mode Switcher */}
                <div className="absolute top-2 right-12 z-10 flex space-x-1">
                    <button 
                        onClick={() => setLogMode('net')}
                        className={`text-[10px] px-3 py-1 sm:px-2 sm:py-0.5 rounded transition-colors touch-manipulation ${logMode === 'net' ? 'bg-cyber-500 text-black font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                        NET
                    </button>
                    <button 
                        onClick={() => setLogMode('sys')}
                        className={`text-[10px] px-3 py-1 sm:px-2 sm:py-0.5 rounded transition-colors touch-manipulation ${logMode === 'sys' ? 'bg-cyber-500 text-black font-bold' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                        SYS
                    </button>
                </div>

                {logMode === 'net' ? (
                    <TerminalLogs logs={INITIAL_NETWORK_INFO.tests} />
                ) : (
                    <SystemLogs stats={stats} />
                )}
            </div>
        </section>

        {/* Right Column: Network & Actions (Expanded to 4 cols) */}
        <section className="order-2 lg:col-span-4 flex flex-col gap-4 h-auto lg:h-[calc(100vh-6rem)]">
            {/* Network Topology Container */}
            <div className="flex-1 glass-panel rounded-xl p-4 flex flex-col min-h-[500px] sm:min-h-[400px]">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center">
                        <Wifi className="w-4 h-4 mr-2 text-cyber-accent" />
                        Network Map
                    </h2>
                    <div className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-cyber-accent rounded-full animate-pulse"></span>
                        <span className="text-[9px] text-cyber-accent font-mono">LIVE</span>
                    </div>
                </div>
                {/* The map container itself needs to be tall enough on mobile to fit the absolute detail panel */}
                <div className="flex-1 bg-cyber-900/50 rounded-lg border border-slate-700/50 relative overflow-hidden">
                     <NetworkTopology info={INITIAL_NETWORK_INFO} />
                </div>
            </div>

            {/* Connection Controller */}
            <div className="glass-panel rounded-xl p-4 sm:p-5 flex flex-col border border-cyber-500/30">
                <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-700">
                    <div className="w-10 h-10 rounded-full bg-cyber-500/20 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-cyber-500" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">Link Controller</h3>
                        <p className="text-[10px] text-slate-400 font-mono">ASUS RT-AC1200 V2 :: INTERFACE</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 w-full">
                    <button className="flex flex-col items-center justify-center p-3 bg-slate-800/50 hover:bg-cyber-900 border border-slate-700 hover:border-cyber-500 rounded transition-all group active:scale-95 touch-manipulation">
                        <RefreshCw className="w-4 h-4 text-slate-400 group-hover:text-cyber-500 mb-1" />
                        <span className="text-[10px] text-slate-300 group-hover:text-white font-mono">RENEW_IP</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-slate-800/50 hover:bg-cyber-900 border border-slate-700 hover:border-cyber-500 rounded transition-all group active:scale-95 touch-manipulation">
                        <Shield className="w-4 h-4 text-slate-400 group-hover:text-cyber-accent mb-1" />
                        <span className="text-[10px] text-slate-300 group-hover:text-white font-mono">FLUSH_DNS</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-slate-800/50 hover:bg-cyber-900 border border-slate-700 hover:border-cyber-500 rounded transition-all group col-span-2 active:scale-95 touch-manipulation">
                        <Radio className="w-4 h-4 text-slate-400 group-hover:text-warn mb-1" />
                        <span className="text-[10px] text-slate-300 group-hover:text-white font-mono">CYCLE_RADIO_POWER</span>
                    </button>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
};

export default App;