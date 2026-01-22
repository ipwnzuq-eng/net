import React, { useState, useEffect } from 'react';
import { Activity, Battery, Cpu, Wifi, Terminal, Zap, Power, Shield, RefreshCw, Radio, Code, Menu } from 'lucide-react';
import { INITIAL_SYSTEM_STATS, INITIAL_NETWORK_INFO } from './constants';
import NetworkTopology from './components/NetworkTopology';
import TelemetryGraph from './components/TelemetryGraph';
import TerminalLogs from './components/TerminalLogs';
import SystemLogs from './components/SystemLogs';
import PythonConsole from './components/PythonConsole';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [stats, setStats] = useState(INITIAL_SYSTEM_STATS);
  const [logMode, setLogMode] = useState<'net' | 'sys' | 'py'>('net');

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
    <div className="h-full flex flex-col font-sans selection:bg-cyber-500 selection:text-white">
      
      {/* Top Bar / Status Header */}
      <header className="h-14 lg:h-12 bg-cyber-800 border-b border-slate-700 flex items-center justify-between px-3 z-50 flex-shrink-0 shadow-lg shadow-cyber-900/50">
        <div className="flex items-center space-x-3">
            <div className="flex items-center text-cyber-500 space-x-2">
                <Terminal className="w-5 h-5" />
                <span className="font-mono font-bold tracking-widest text-sm hidden sm:block">TOPBOT.NEXUS_V3.0</span>
                <span className="font-mono font-bold tracking-widest text-xs sm:hidden">NEXUS</span>
            </div>
            <div className="h-4 w-px bg-slate-600 hidden sm:block"></div>
            <div className="text-[10px] font-mono text-slate-400 hidden lg:block">
                SYS_INTEGRITY: 100% | ENCRYPTION: AES-256-GCM
            </div>
        </div>
        
        <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs font-mono">
                <Wifi className="w-3.5 h-3.5 text-cyber-accent" />
                <span className="hidden sm:inline text-[10px]">{INITIAL_NETWORK_INFO.ssid}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs font-mono">
                <Battery className="w-3.5 h-3.5 text-cyber-500" />
                <span className="text-[10px]">{stats.battery.percentage}%</span>
            </div>
            <div className="px-2 py-0.5 bg-cyber-900 rounded border border-slate-700 text-cyber-500 font-mono text-[10px]">
                {currentTime}
            </div>
        </div>
      </header>

      {/* Main Grid Layout - Scrollable on mobile, Fixed on Desktop */}
      <main className="flex-1 overflow-y-auto lg:overflow-hidden p-2 lg:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 touch-pan-y">
        
        {/* Left Column: System Telemetry */}
        <section className="order-1 lg:col-span-8 flex flex-col gap-3 lg:gap-4 lg:h-full">
            
            {/* Top Row: Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-4 flex-shrink-0">
                {/* CPU Tile */}
                <div className="glass-panel p-3 rounded-lg border-l-2 border-l-cyber-500 active:bg-slate-800/80 transition-colors touch-manipulation">
                    <div className="flex justify-between items-start">
                        <div className="text-[10px] text-slate-400 uppercase">CPU</div>
                        <Cpu className="w-3.5 h-3.5 text-cyber-500" />
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold mt-1">31<span className="text-sm text-slate-500">%</span></div>
                </div>

                {/* Temp Tile */}
                <div className="glass-panel p-3 rounded-lg border-l-2 border-l-warn active:bg-slate-800/80 transition-colors touch-manipulation">
                    <div className="flex justify-between items-start">
                        <div className="text-[10px] text-slate-400 uppercase">Temp</div>
                        <Activity className="w-3.5 h-3.5 text-warn" />
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold mt-1">{stats.cpuTemp}<span className="text-sm text-slate-500">°C</span></div>
                </div>

                {/* Memory Tile */}
                <div className="glass-panel p-3 rounded-lg border-l-2 border-l-cyber-accent active:bg-slate-800/80 transition-colors touch-manipulation">
                    <div className="flex justify-between items-start">
                        <div className="text-[10px] text-slate-400 uppercase">RAM</div>
                        <div className="h-3.5 w-3.5 rounded-full border border-cyber-accent flex items-center justify-center">
                            <div className="h-1.5 w-1.5 bg-cyber-accent rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold mt-1">
                        {(stats.availableMemory / 1024 / 1024).toFixed(1)}<span className="text-sm text-slate-500">GB</span>
                    </div>
                </div>

                 {/* Battery Detail Tile */}
                 <div className="glass-panel p-3 rounded-lg border-l-2 border-l-purple-500 active:bg-slate-800/80 transition-colors touch-manipulation">
                    <div className="flex justify-between items-start">
                        <div className="text-[10px] text-slate-400 uppercase">Health</div>
                        <Power className="w-3.5 h-3.5 text-purple-500" />
                    </div>
                    <div className="text-xl sm:text-2xl font-mono font-bold mt-1">{stats.battery.wear}<span className="text-sm text-slate-500">%</span></div>
                </div>
            </div>

            {/* Middle: Graph - Mobile Optimized Height */}
            <div className="flex-none lg:flex-1 glass-panel rounded-xl p-4 h-[200px] lg:h-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 bg-cyber-500/10 rounded-bl-xl text-[10px] text-cyber-500 font-mono z-10">
                    LIVE_FEED
                </div>
                <TelemetryGraph />
            </div>

            {/* Bottom: Logs & Terminal */}
            <div className="flex-none h-[400px] lg:h-[35%] glass-panel rounded-xl overflow-hidden border border-slate-700/50 flex flex-col relative">
                {/* Mode Switcher */}
                <div className="absolute top-2 right-2 z-10 flex space-x-1">
                    <button 
                        onClick={() => setLogMode('net')}
                        className={`text-[10px] px-2 py-1 rounded font-mono touch-manipulation ${logMode === 'net' ? 'bg-cyber-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}
                    >
                        NET
                    </button>
                    <button 
                        onClick={() => setLogMode('sys')}
                        className={`text-[10px] px-2 py-1 rounded font-mono touch-manipulation ${logMode === 'sys' ? 'bg-cyber-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}
                    >
                        SYS
                    </button>
                    <button 
                        onClick={() => setLogMode('py')}
                        className={`text-[10px] px-2 py-1 rounded font-mono touch-manipulation flex items-center space-x-1 ${logMode === 'py' ? 'bg-purple-500 text-black font-bold' : 'bg-slate-800 text-slate-400'}`}
                    >
                        <Code className="w-3 h-3" />
                    </button>
                </div>

                <div className="h-full overflow-hidden">
                    {logMode === 'net' ? (
                        <TerminalLogs logs={INITIAL_NETWORK_INFO.tests} />
                    ) : logMode === 'sys' ? (
                        <SystemLogs stats={stats} />
                    ) : (
                        <PythonConsole />
                    )}
                </div>
            </div>
        </section>

        {/* Right Column: Network & Actions */}
        <section className="order-2 lg:col-span-4 flex flex-col gap-3 lg:gap-4 lg:h-full">
            {/* Network Topology Container */}
            <div className="flex-none lg:flex-1 glass-panel rounded-xl p-3 flex flex-col h-[450px] lg:h-auto">
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
                <div className="flex-1 bg-cyber-900/50 rounded-lg border border-slate-700/50 relative overflow-hidden">
                     <NetworkTopology info={INITIAL_NETWORK_INFO} />
                </div>
            </div>

            {/* Connection Controller - Grid layout optimization */}
            <div className="flex-none glass-panel rounded-xl p-4 flex flex-col border border-cyber-500/30 mb-4 lg:mb-0">
                <div className="flex items-center space-x-3 mb-3 pb-2 border-b border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-cyber-500/20 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-cyber-500" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-xs uppercase">Quick Actions</h3>
                        <p className="text-[9px] text-slate-400 font-mono">RT-AC1200 V2</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 w-full">
                    <button className="flex flex-col items-center justify-center p-2 bg-slate-800/50 active:bg-cyber-900 border border-slate-700 active:border-cyber-500 rounded transition-all group touch-manipulation h-16">
                        <RefreshCw className="w-4 h-4 text-slate-400 group-active:text-cyber-500 mb-1" />
                        <span className="text-[9px] text-slate-300 group-active:text-white font-mono">RENEW</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 bg-slate-800/50 active:bg-cyber-900 border border-slate-700 active:border-cyber-500 rounded transition-all group touch-manipulation h-16">
                        <Shield className="w-4 h-4 text-slate-400 group-active:text-cyber-accent mb-1" />
                        <span className="text-[9px] text-slate-300 group-active:text-white font-mono">FLUSH</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-2 bg-slate-800/50 active:bg-cyber-900 border border-slate-700 active:border-cyber-500 rounded transition-all group col-span-2 touch-manipulation h-12 flex-row gap-2">
                        <Radio className="w-4 h-4 text-slate-400 group-active:text-warn" />
                        <span className="text-[9px] text-slate-300 group-active:text-white font-mono">CYCLE RADIO POWER</span>
                    </button>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
};

export default App;