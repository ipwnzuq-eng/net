import React, { useEffect, useRef } from 'react';
import { NetworkTest } from '../types';
import { INITIAL_NETWORK_INFO } from '../constants';

interface Props {
  logs: NetworkTest[];
}

const TerminalLogs: React.FC<Props> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="font-mono text-xs h-full flex flex-col">
      <div className="bg-slate-900 border-b border-slate-700 p-2 flex justify-between items-center">
        <span className="text-cyber-500 font-bold">~/system/diagnostics.log</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-black bg-opacity-40">
        <div className="text-slate-500">--- Network Events ---</div>
        <div className="text-slate-300">
            22.01.26 2:12:27 - Associated with <span className="text-cyber-400">{INITIAL_NETWORK_INFO.ssid}</span> ({INITIAL_NETWORK_INFO.routerModel})
        </div>
        <div className="text-slate-500 mt-2">--- Test Routines ---</div>
        
        {logs.map((log, index) => (
          <div key={index} className="flex space-x-2">
            <span className="text-slate-500">22.01.26 {log.timestamp}</span>
            <span className="text-cyber-400">[{log.name}]</span>
            <span className={`font-bold ${log.status === 'Passed' ? 'text-cyber-accent' : 'text-cyber-danger'}`}>
              - {log.status}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
        
        {/* Blinking cursor */}
        <div className="mt-2 animate-pulse text-cyber-500">_</div>
      </div>
    </div>
  );
};

export default TerminalLogs;