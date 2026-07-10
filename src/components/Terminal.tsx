import React, { useState, useEffect, useRef } from "react";
import { Terminal as TermIcon, Trash2, Cpu, Sparkles, Columns, Rows, Square, X } from "lucide-react";

interface TerminalLog {
  id: string;
  type: "info" | "success" | "error" | "input";
  text: string;
  timestamp: string;
}

interface TerminalPane {
  id: string;
  logs: TerminalLog[];
  command: string;
  commandHistory: string[];
  historyIndex: number;
  tempCommand: string;
}

const SingleTerminalPane: React.FC<{
  pane: TerminalPane;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onUpdateCommand: (val: string) => void;
  onSubmitCommand: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showClose: boolean;
  onClear: () => void;
}> = ({
  pane,
  isActive,
  onFocus,
  onClose,
  onUpdateCommand,
  onSubmitCommand,
  onKeyDown,
  showClose,
  onClear,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [pane.logs]);

  // Auto-focus active pane
  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    }
  }, [isActive]);

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
    <div
      onClick={onFocus}
      className={`flex-1 flex flex-col min-h-0 min-w-0 font-mono text-xs transition-colors ${
        isActive ? "bg-[#080809]" : "bg-[#060607]/80 opacity-80"
      }`}
    >
      {/* Pane Header */}
      <div
        className={`px-3 py-1.5 border-b border-zinc-850 flex items-center justify-between text-[10px] uppercase font-bold tracking-wider select-none ${
          isActive ? "bg-[#0c0c0d] text-purple-400" : "bg-[#09090a] text-zinc-500"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-purple-400 animate-pulse" : "bg-zinc-600"}`} />
          <span>Pane: {pane.id === "pane_1" ? "Primary" : "Secondary"}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
            title="Clear Pane Logs"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          {showClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400 transition cursor-pointer"
              title="Close Split Pane"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Logger Canvas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 select-text leading-relaxed">
        {pane.logs.length === 0 ? (
          <div className="text-zinc-600 italic py-2">Terminal cleared. Type 'help' or enter a command.</div>
        ) : (
          pane.logs.map((log) => (
            <div key={log.id} className="flex gap-4">
              <span className="text-zinc-650 select-none">{log.timestamp}</span>
              <span className={`flex-1 whitespace-pre-line ${getLogColor(log.type)}`}>
                {log.text}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitCommand(pane.command);
        }}
        className={`flex items-center border-t border-zinc-850/80 ${
          isActive ? "bg-[#050506]" : "bg-[#050506]/50"
        }`}
      >
        <span className={`pl-4 pr-2 font-bold select-none ${isActive ? "text-purple-500" : "text-zinc-600"}`}>$</span>
        <input
          ref={inputRef}
          type="text"
          value={pane.command}
          onChange={(e) => onUpdateCommand(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type 'help' or enter commands..."
          className="flex-1 bg-transparent border-none outline-none py-2.5 text-zinc-300 font-mono text-xs placeholder-zinc-700"
        />
      </form>
    </div>
  );
};

export const Terminal: React.FC = () => {
  const [splitMode, setSplitMode] = useState<"none" | "vertical" | "horizontal">("none");
  const [activePaneId, setActivePaneId] = useState<string>("pane_1");

  const [panes, setPanes] = useState<TerminalPane[]>([
    {
      id: "pane_1",
      logs: [
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
      ],
      command: "",
      commandHistory: [],
      historyIndex: -1,
      tempCommand: "",
    },
  ]);

  const handleSplit = (mode: "vertical" | "horizontal") => {
    if (panes.length >= 2) {
      // Toggle to horizontal or vertical if already split, or merge
      setSplitMode(mode);
      return;
    }

    const time = new Date().toTimeString().split(" ")[0];
    const newPane: TerminalPane = {
      id: "pane_2",
      logs: [
        {
          id: Math.random().toString(),
          type: "info",
          text: `Secondary terminal pane initialized. [${mode.toUpperCase()} SPLIT]`,
          timestamp: time,
        },
        {
          id: Math.random().toString(),
          type: "success",
          text: "Ready for parallel command execution.",
          timestamp: time,
        },
      ],
      command: "",
      commandHistory: [],
      historyIndex: -1,
      tempCommand: "",
    };

    setPanes([...panes, newPane]);
    setSplitMode(mode);
    setActivePaneId("pane_2");
  };

  const handleClosePane = (paneId: string) => {
    const remaining = panes.filter((p) => p.id !== paneId);
    setPanes(remaining);
    setSplitMode("none");
    if (remaining.length > 0) {
      setActivePaneId(remaining[0].id);
    }
  };

  const handleClearPane = (paneId: string) => {
    setPanes((prev) =>
      prev.map((p) => (p.id === paneId ? { ...p, logs: [] } : p))
    );
  };

  const handleClearAll = () => {
    setPanes((prev) => prev.map((p) => ({ ...p, logs: [] })));
  };

  const handleUpdateCommand = (paneId: string, val: string) => {
    setPanes((prev) =>
      prev.map((p) => (p.id === paneId ? { ...p, command: val } : p))
    );
  };

  const handlePaneKeyDown = (paneId: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    const pane = panes.find((p) => p.id === paneId);
    if (!pane) return;

    // Ctrl+L to clear the console
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      handleClearPane(paneId);
      return;
    }

    // Up/Down arrows to cycle through previous commands
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (pane.commandHistory.length === 0) return;

      let newHistoryIndex = pane.historyIndex;
      let newCommand = pane.command;
      let newTempCommand = pane.tempCommand;

      if (pane.historyIndex === -1) {
        newTempCommand = pane.command;
        newHistoryIndex = pane.commandHistory.length - 1;
        newCommand = pane.commandHistory[newHistoryIndex];
      } else if (pane.historyIndex > 0) {
        newHistoryIndex = pane.historyIndex - 1;
        newCommand = pane.commandHistory[newHistoryIndex];
      }

      setPanes((prev) =>
        prev.map((p) =>
          p.id === paneId
            ? { ...p, historyIndex: newHistoryIndex, tempCommand: newTempCommand, command: newCommand }
            : p
        )
      );
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (pane.commandHistory.length === 0) return;

      let newHistoryIndex = pane.historyIndex;
      let newCommand = pane.command;

      if (pane.historyIndex !== -1) {
        if (pane.historyIndex < pane.commandHistory.length - 1) {
          newHistoryIndex = pane.historyIndex + 1;
          newCommand = pane.commandHistory[newHistoryIndex];
        } else {
          newHistoryIndex = -1;
          newCommand = pane.tempCommand;
        }
      }

      setPanes((prev) =>
        prev.map((p) =>
          p.id === paneId
            ? { ...p, historyIndex: newHistoryIndex, command: newCommand }
            : p
        )
      );
    }
  };

  const handlePaneCommandSubmit = (paneId: string, cmd: string) => {
    const pane = panes.find((p) => p.id === paneId);
    if (!pane) return;

    const trimmed = cmd.trim();
    if (!trimmed) return;

    const updatedHistory = [...pane.commandHistory];
    if (updatedHistory.length === 0 || updatedHistory[updatedHistory.length - 1] !== trimmed) {
      updatedHistory.push(trimmed);
    }

    const time = new Date().toTimeString().split(" ")[0];
    const newLogs: TerminalLog[] = [
      ...pane.logs,
      {
        id: Math.random().toString(),
        type: "input",
        text: `$ ${trimmed}`,
        timestamp: time,
      },
    ];

    if (trimmed.toLowerCase() === "clear") {
      setPanes((prev) =>
        prev.map((p) =>
          p.id === paneId
            ? {
                ...p,
                logs: [],
                command: "",
                commandHistory: updatedHistory,
                historyIndex: -1,
                tempCommand: "",
              }
            : p
        )
      );
      return;
    } else if (trimmed.toLowerCase() === "help") {
      newLogs.push(
        {
          id: Math.random().toString(),
          type: "info",
          text: "Available commands: help, clear, status, compile, doctor",
          timestamp: time,
        },
        {
          id: Math.random().toString(),
          type: "info",
          text: "You can also prompt the AI chat assistant to add features directly.",
          timestamp: time,
        }
      );
    } else if (trimmed.toLowerCase() === "status") {
      newLogs.push({
        id: Math.random().toString(),
        type: "success",
        text: "CONTAINER: ONLINE\nPORT: 3000\nDATABASE: OFF-LINE\nPROXY: HEALTHY",
        timestamp: time,
      });
    } else if (trimmed.toLowerCase() === "compile" || trimmed.toLowerCase() === "npm run build") {
      newLogs.push(
        {
          id: Math.random().toString(),
          type: "info",
          text: "Executing production build bundle run...",
          timestamp: time,
        },
        {
          id: Math.random().toString(),
          type: "success",
          text: "Vite build succeeded in 843ms. Static dist artifacts prepared.",
          timestamp: time,
        }
      );
    } else if (trimmed.toLowerCase() === "doctor") {
      newLogs.push(
        {
          id: Math.random().toString(),
          type: "info",
          text: "Analyzing workspace files integrity...",
          timestamp: time,
        },
        {
          id: Math.random().toString(),
          type: "success",
          text: "Integrity check passed. File tree synchronized perfectly.",
          timestamp: time,
        }
      );
    } else {
      newLogs.push({
        id: Math.random().toString(),
        type: "error",
        text: `Command not found: '${trimmed}'. Type 'help' for available workspace endpoints.`,
        timestamp: time,
      });
    }

    setPanes((prev) =>
      prev.map((p) =>
        p.id === paneId
          ? {
              ...p,
              logs: newLogs,
              command: "",
              commandHistory: updatedHistory,
              historyIndex: -1,
              tempCommand: "",
            }
          : p
      )
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#080809] font-mono text-xs select-none">
      {/* Terminal Main Header */}
      <div className="px-4 py-2 border-b border-zinc-850 flex items-center justify-between bg-[#0d0d0e]">
        <div className="flex items-center gap-2 text-zinc-400">
          <TermIcon className="h-3.5 w-3.5 text-purple-400" />
          <span className="text-[10px] font-black tracking-widest uppercase">Console Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Split buttons */}
          <button
            onClick={() => handleSplit("vertical")}
            className={`p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1 ${
              splitMode === "vertical" ? "bg-purple-950/30 text-purple-400 border border-purple-500/30" : ""
            }`}
            title="Split Terminal Vertically"
          >
            <Columns className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold hidden sm:inline">Split V</span>
          </button>
          <button
            onClick={() => handleSplit("horizontal")}
            className={`p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1 ${
              splitMode === "horizontal" ? "bg-purple-950/30 text-purple-400 border border-purple-500/30" : ""
            }`}
            title="Split Terminal Horizontally"
          >
            <Rows className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold hidden sm:inline">Split H</span>
          </button>

          <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

          {/* Clear all */}
          <button
            onClick={handleClearAll}
            className="p-1 hover:bg-zinc-850 rounded text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
            title="Clear All Panes"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Viewports Container */}
      <div
        className={`flex-1 flex overflow-hidden ${
          splitMode === "horizontal" ? "flex-col divide-y divide-zinc-850/80" : "flex-row divide-x divide-zinc-850/80"
        }`}
      >
        {panes.map((pane) => (
          <SingleTerminalPane
            key={pane.id}
            pane={pane}
            isActive={activePaneId === pane.id}
            onFocus={() => setActivePaneId(pane.id)}
            onClose={() => handleClosePane(pane.id)}
            onUpdateCommand={(val) => handleUpdateCommand(pane.id, val)}
            onSubmitCommand={(val) => handlePaneCommandSubmit(pane.id, val)}
            onKeyDown={(e) => handlePaneKeyDown(pane.id, e)}
            showClose={panes.length > 1}
            onClear={() => handleClearPane(pane.id)}
          />
        ))}
      </div>
    </div>
  );
};
