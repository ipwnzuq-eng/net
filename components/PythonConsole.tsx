import React, { useState, useEffect, useRef } from 'react';
import { Play, Save, Trash2, FileCode, Terminal, RefreshCw, Plus, Menu, X, ChevronRight } from 'lucide-react';
import { loadScripts, saveScript, deleteScript, seedDatabase, StoredScript } from '../utils/db';

declare global {
  interface Window {
    loadPyodide: any;
  }
}

const PythonConsole: React.FC = () => {
  const [pyodide, setPyodide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [output, setOutput] = useState<string[]>([]);
  const [scripts, setScripts] = useState<StoredScript[]>([]);
  const [currentScript, setCurrentScript] = useState<StoredScript | null>(null);
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

  // Initialize Pyodide and Database
  useEffect(() => {
    const init = async () => {
      try {
        await seedDatabase();
        const stored = await loadScripts();
        setScripts(stored);
        if (stored.length > 0) {
            selectScript(stored[0]);
        } else {
            createNewScript();
        }

        if (window.loadPyodide && !pyodide) {
            addToOutput(">> System: Initializing Python 3.11 WASM Runtime...");
            const pyodideInstance = await window.loadPyodide();
            // Redirect stdout
            pyodideInstance.setStdout({ batched: (msg: string) => addToOutput(msg) });
            await pyodideInstance.loadPackage("micropip");
            setPyodide(pyodideInstance);
            addToOutput(">> System: Python Environment Ready.");
            setIsLoading(false);
        }
      } catch (err: any) {
        addToOutput(`>> Critical Error: ${err.message}`);
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const addToOutput = (msg: string) => {
    setOutput(prev => [...prev, msg]);
  };

  const selectScript = (script: StoredScript) => {
    setCurrentScript(script);
    setCode(script.code);
    setIsSidebarOpen(false); // Close sidebar on selection (mobile UX)
  };

  const createNewScript = () => {
      const newScript: StoredScript = {
          id: `script_${Date.now()}`,
          name: 'untitled.py',
          code: '# Write your python code here\nprint("Hello from TopBot!")',
          lastModified: Date.now()
      };
      setScripts(prev => [...prev, newScript]);
      selectScript(newScript);
  };

  const handleSave = async () => {
      if (!currentScript) return;
      const updated = { ...currentScript, code, lastModified: Date.now() };
      await saveScript(updated);
      setScripts(prev => prev.map(s => s.id === updated.id ? updated : s));
      addToOutput(`>> System: Saved ${updated.name}`);
  };

  const handleDelete = async () => {
      if (!currentScript) return;
      if (confirm(`Delete ${currentScript.name}?`)) {
          await deleteScript(currentScript.id);
          const remaining = scripts.filter(s => s.id !== currentScript.id);
          setScripts(remaining);
          if (remaining.length > 0) selectScript(remaining[0]);
          else createNewScript();
      }
  };

  const runCode = async () => {
    if (!pyodide) return;
    setIsRunning(true);
    setOutput([]); // Clear previous output
    addToOutput(`>> Executing ${currentScript?.name}...`);
    
    try {
        setTimeout(async () => {
            try {
                await pyodide.runPythonAsync(code);
            } catch (err: any) {
                addToOutput(`Traceback (most recent call last):\n${err.message}`);
            } finally {
                setIsRunning(false);
                addToOutput(">> Process terminated.");
            }
        }, 100);
    } catch (e) {
        setIsRunning(false);
    }
  };

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="h-full flex flex-col sm:flex-row font-mono text-xs relative overflow-hidden">
      
      {/* Mobile Sidebar Toggle Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 sm:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar / File List */}
      <div className={`absolute sm:relative z-30 h-full w-48 sm:w-48 bg-slate-900 border-r border-slate-700 flex flex-col transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}`}>
        <div className="p-2 border-b border-slate-700 flex justify-between items-center bg-slate-900">
            <span className="font-bold text-slate-400">FILES</span>
            <div className="flex space-x-1">
                <button onClick={createNewScript} className="p-1 hover:text-cyber-400 touch-manipulation"><Plus className="w-4 h-4" /></button>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:text-white sm:hidden touch-manipulation"><X className="w-4 h-4" /></button>
            </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {scripts.map(script => (
                <button 
                    key={script.id}
                    onClick={() => selectScript(script)}
                    className={`w-full text-left p-3 sm:p-2 flex items-center space-x-2 hover:bg-slate-800 transition-colors touch-manipulation ${currentScript?.id === script.id ? 'bg-cyber-900/80 text-cyber-400 border-l-2 border-cyber-500' : 'text-slate-500'}`}
                >
                    <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{script.name}</span>
                </button>
            ))}
        </div>
      </div>

      {/* Editor & Console Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50">
        
        {/* Toolbar */}
        <div className="p-2 border-b border-slate-700 bg-slate-900 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center space-x-2 min-w-0">
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    className="p-1.5 mr-1 bg-slate-800 rounded sm:hidden text-slate-400 hover:text-white touch-manipulation"
                >
                    <Menu className="w-3.5 h-3.5" />
                </button>
                <input 
                    type="text" 
                    value={currentScript?.name || ''} 
                    onChange={(e) => {
                        if (currentScript) {
                            const updated = { ...currentScript, name: e.target.value };
                            setCurrentScript(updated);
                            setScripts(prev => prev.map(s => s.id === updated.id ? updated : s));
                        }
                    }}
                    className="bg-transparent text-white font-bold focus:outline-none border-b border-transparent focus:border-cyber-500 w-24 sm:w-auto text-[11px] sm:text-xs"
                />
            </div>
            <div className="flex items-center space-x-1.5">
                <button onClick={handleSave} className="p-2 sm:p-1.5 bg-slate-800 rounded hover:text-cyber-400 transition-colors touch-manipulation" title="Save"><Save className="w-3.5 h-3.5" /></button>
                <button onClick={handleDelete} className="p-2 sm:p-1.5 bg-slate-800 rounded hover:text-red-400 transition-colors touch-manipulation" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                <div className="h-4 w-px bg-slate-700 mx-1"></div>
                <button 
                    onClick={runCode} 
                    disabled={isLoading || isRunning}
                    className={`flex items-center space-x-1 px-3 py-1.5 sm:py-1 rounded font-bold transition-all touch-manipulation ${isLoading || isRunning ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-cyber-500 text-slate-900 hover:bg-cyber-400'}`}
                >
                    {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>{isRunning ? '...' : 'RUN'}</span>
                </button>
            </div>
        </div>

        {/* Editor */}
        <div className="h-[40%] sm:h-1/2 bg-slate-900/80 relative flex-shrink-0">
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full bg-transparent text-slate-300 p-2 font-mono resize-none focus:outline-none custom-scrollbar text-xs leading-relaxed"
                spellCheck="false"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
            />
        </div>

        {/* Console Output */}
        <div className="flex-1 bg-black/40 border-t border-slate-700 flex flex-col min-h-0">
            <div className="p-1 bg-slate-900/80 text-[10px] text-slate-500 uppercase tracking-wider flex items-center">
                <Terminal className="w-3 h-3 mr-1" /> Console Output
            </div>
            <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
                {output.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap break-words text-slate-300">
                        {line.startsWith('>>') ? <span className="text-cyber-500">{line}</span> : line}
                    </div>
                ))}
                {isRunning && <div className="text-cyber-500 animate-pulse">Processing...</div>}
                <div ref={bottomRef} />
            </div>
        </div>

      </div>
    </div>
  );
};

export default PythonConsole;