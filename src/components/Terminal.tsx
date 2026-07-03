import React, { useState, useEffect, useRef } from "react";
import { Terminal as TermIcon, Trash2, Cpu, Sparkles } from "lucide-react";

interface TerminalLog {
  id: string;
  type: "info" | "success" | "error" | "input";
  text: string;
  timestamp: string;
}

export const Terminal: React.FC = () => {
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: "1",
      type: "info",
      text: "Initializing Sandbox Terminal v1.2.0...",
      timestamp: "18:43:50",
    },
    {
      id: "2",
      type: "success",
      text: "Port 3000 mapped successfully. Reverse Proxy ready.",
      timestamp: "18:43:51",
    },
    {
      id: "3",
      type: "info",
      text: "Hot Module Compile engine initialized (DISABLE_HMR=true).",
      timestamp: "18:43:51",
    },
    {
      id: "4",
      type: "success",
      text: "App compiled successfully. Preview fully functional.",
      timestamp: "18:43:52",
    },
  ]);
  const [command, setCommand] = useState("");
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = command.trim();
    if (!trimmed) return;

    const time = new Date().toTimeString().split(" ")[0];
    const newLogs: TerminalLog[] = [
      ...logs,
      {
        id: Math.random().toString(),
        type: "input",
        text: `$ ${trimmed}`,
        timestamp: time,
      },
    ];

    // Simple command processor
    if (trimmed.toLowerCase() === "clear") {
      setLogs([]);
      setCommand("");
      return;
    } else if (trimmed.toLowerCase() === "help") {
      newLogs.push({
        id: Math.random().toString(),
        type: "info",
        text: "Available commands: help, clear, status, compile, doctor",
        timestamp: time,
      }, {
        id: Math.random().toString(),
        type: "info",
        text: "You can also prompt the AI chat assistant to add features directly.",
        timestamp: time,
      });
    } else if (trimmed.toLowerCase() === "status") {
      newLogs.push({
        id: Math.random().toString(),
        type: "success",
        text: "CONTAINER: ONLINE\nPORT: 3000\nDATABASE: OFF-LINE\nPROXY: HEALTHY",
        timestamp: time,
      });
    } else if (trimmed.toLowerCase() === "compile" || trimmed.toLowerCase() === "npm run build") {
      newLogs.push({
        id: Math.random().toString(),
        type: "info",
        text: "Executing production build bundle run...",
        timestamp: time,
      }, {
        id: Math.random().toString(),
        type: "success",
        text: "Vite build succeeded in 843ms. Static dist artifacts prepared.",
        timestamp: time,
      });
    } else if (trimmed.toLowerCase() === "doctor") {
      newLogs.push({
        id: Math.random().toString(),
        type: "info",
        text: "Analyzing workspace files integrity...",
        timestamp: time,
      }, {
        id: Math.random().toString(),
        type: "success",
        text: "Integrity check passed. File tree synchronized perfectly.",
        timestamp: time,
      });
    } else {
      newLogs.push({
        id: Math.random().toString(),
        type: "error",
        text: `Command not found: '${trimmed}'. Type 'help' for available workspace endpoints.`,
        timestamp: time,
      });
    }

    setLogs(newLogs);
    setCommand("");
  };

  const getLogColor = (type: TerminalLog["type"]) => {
    switch (type) {
      case "success":
        return "text-emerald-400";
      case "error":
        return "text-red-400";
      case "input":
        return "text-purple-400 font-bold";
      default:
        return "text-zinc-400";
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#080809] font-mono text-xs">
      {/* Terminal Titlebar */}
      <div className="px-4 py-2 border-b border-zinc-850 flex items-center justify-between bg-[#0d0d0e]">
        <div className="flex items-center gap-2 text-zinc-400 select-none">
          <TermIcon className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-[10px] font-black tracking-widest uppercase">Console Terminal</span>
        </div>
        <button
          onClick={() => setLogs([])}
          className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
          title="Clear Console Output"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Terminal Logger Canvas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 select-text leading-relaxed">
        {logs.length === 0 ? (
          <div className="text-zinc-600 italic py-2">Terminal cleared. Type 'help' or enter a command.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-4">
              <span className="text-zinc-600 select-none">{log.timestamp}</span>
              <span className={`flex-1 whitespace-pre-line ${getLogColor(log.type)}`}>
                {log.text}
              </span>
            </div>
          ))
        )}
        <div ref={terminalBottomRef} />
      </div>

      {/* Terminal Input Row */}
      <form onSubmit={handleCommandSubmit} className="flex items-center border-t border-zinc-850 bg-[#060607]">
        <span className="pl-4 pr-2 text-purple-500 font-bold select-none">$</span>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Type 'help' or enter workspace CLI instructions..."
          className="flex-1 bg-transparent border-none outline-none py-2.5 text-zinc-300 font-mono text-xs placeholder-zinc-700"
        />
      </form>
    </div>
  );
};
