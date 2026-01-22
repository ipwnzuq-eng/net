import React, { useEffect, useRef } from 'react';
import { SystemStats } from '../types';

interface Props {
  stats: SystemStats;
}

const SystemLogs: React.FC<Props> = ({ stats }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [stats]);

  const formatMem = (kib: number) => (kib / 1024 / 1024).toFixed(2);

  return (
    <div className="font-mono text-xs h-full flex flex-col">
      <div className="bg-slate-900 border-b border-slate-700 p-2 flex justify-between items-center">
        <span className="text-cyber-500 font-bold">~/system/hardware.log</span>
        <div className="flex space-x-1">
           <div className="w-2 h-2 rounded-full bg-slate-600"></div>
           <div className="w-2 h-2 rounded-full bg-slate-600"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-black bg-opacity-40">
        <div className="text-slate-500">--- Hardware Enumeration ---</div>
        
        <div className="flex flex-col space-y-1">
             <div className="flex space-x-2">
                <span className="text-slate-500">BOARD</span>
                <span className="text-cyber-400">::</span>
                <span className="text-white">{stats.boardName}</span>
             </div>
             <div className="flex space-x-2">
                <span className="text-slate-500">CPU  </span>
                <span className="text-cyber-400">::</span>
                <span className="text-white">{stats.cpuModel}</span>
             </div>
             <div className="flex space-x-2">
                <span className="text-slate-500">MEM_T</span>
                <span className="text-cyber-400">::</span>
                <span className="text-white">{formatMem(stats.totalMemory)} GB</span>
             </div>
             <div className="flex space-x-2">
                <span className="text-slate-500">MEM_A</span>
                <span className="text-cyber-400">::</span>
                <span className="text-cyber-accent">{formatMem(stats.availableMemory)} GB</span>
             </div>
        </div>

        <div className="text-slate-500 mt-2">--- Power Status ---</div>
        <div className="flex space-x-2">
            <span className="text-slate-500">BAT  </span>
            <span className="text-cyber-400">::</span>
            <span className="text-white">State: {stats.battery.state}, Cycle: {stats.battery.cycleCount}</span>
        </div>

        <div className="text-slate-500 mt-2">--- Sensors (Live) ---</div>
        <div className="flex space-x-2">
           <span className="text-slate-500">CPU_TEMP</span>
           <span className="text-cyber-400">::</span>
           <span className={stats.cpuTemp > 50 ? "text-warn" : "text-cyber-accent"}>{stats.cpuTemp}°C</span>
        </div>
        <div className="flex space-x-2">
           <span className="text-slate-500">PWR_DRAW</span>
           <span className="text-cyber-400">::</span>
           <span className="text-white">{stats.battery.currentNow} mA</span>
        </div>

        <div ref={bottomRef} />
        <div className="mt-2 animate-pulse text-cyber-500">_</div>
      </div>
    </div>
  );
};

export default SystemLogs;