import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DataPoint {
  time: string;
  cpu: number;
  memory: number;
}

const TelemetryGraph: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);

  // Simulate real-time data ingestion based on the snapshot "31% User Usage"
  useEffect(() => {
    const generateData = () => {
      const now = new Date();
      return {
        time: now.toLocaleTimeString('cs-CZ', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
        cpu: 25 + Math.random() * 15, // Fluctuates around 31%
        memory: 37 + Math.random() * 2, // (Total - Free) / Total roughly
      };
    };

    // Initialize with some history
    const initialData = Array.from({ length: 20 }).map((_, i) => {
        const d = generateData();
        // Shift time back
        return d;
    });
    setData(initialData);

    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev, generateData()];
        if (newData.length > 30) newData.shift();
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-mono flex-shrink-0">Real-time Performance Metrics</h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area 
              type="monotone" 
              dataKey="cpu" 
              stroke="#0ea5e9" 
              fillOpacity={1} 
              fill="url(#colorCpu)" 
              name="CPU Load %"
              isAnimationActive={false}
            />
            <Area 
              type="monotone" 
              dataKey="memory" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorMem)" 
              name="Mem Usage %"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TelemetryGraph;