import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal as TerminalIcon, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Maximize2,
  Minimize2
} from "lucide-react";
import { VirtualFile, TerminalTheme } from "../types";

interface TerminalProps {
  files: VirtualFile[];
  onSelectFile: (path: string) => void;
  onRunCode: () => void;
  theme?: TerminalTheme;
}

interface TerminalLog {
  id: string;
  type: "info" | "warn" | "error" | "success" | "system" | "input";
  message: string;
  time: string;
}

const INITIAL_LOGS = (): TerminalLog[] => [
  { id: "1", type: "system", message: "Initializing virtual node-v20.11.0 runtime container...", time: new Date().toLocaleTimeString() },
  { id: "2", type: "system", message: "Docker sandbox networking listener started on port 3000.", time: new Date().toLocaleTimeString() },
  { id: "3", type: "success", message: "Utube Media container loaded successfully! Type 'help' to view terminal commands.", time: new Date().toLocaleTimeString() },
];

const THEME_STYLES: Record<TerminalTheme, {
  bg: string;
  textDefault: string;
  borderBottom: string;
  hoverBg: string;
  promptPrefix: string;
  inputCaret: string;
  logColors: Record<string, string>;
}> = {
  neon: {
    bg: "bg-[#0c0c0e]",
    textDefault: "text-zinc-300",
    borderBottom: "border-[#141414]",
    hoverBg: "hover:bg-[#111113]",
    promptPrefix: "text-[var(--accent)] font-bold font-mono",
    inputCaret: "caret-[var(--accent)] text-white",
    logColors: {
      info: "text-[var(--accent)]/70",
      error: "text-red-400 font-semibold bg-red-950/10 px-1 rounded",
      warn: "text-amber-400 font-semibold",
      success: "text-green-400 font-medium",
      system: "text-cyan-500 opacity-90",
      input: "text-[var(--accent)] font-bold",
    }
  },
  retro: {
    bg: "bg-[#040d04] border-t border-green-950/40 shadow-[inset_0_0_20px_rgba(0,255,100,0.05)]",
    textDefault: "text-[#4ef24e]",
    borderBottom: "border-[#061c06]",
    hoverBg: "hover:bg-[#061506]",
    promptPrefix: "text-[#00ff66] font-extrabold font-mono",
    inputCaret: "caret-[#00ff66] text-[#00ff66]",
    logColors: {
      info: "text-[#4ef24e]/80",
      error: "bg-[#4ef24e] text-[#040d04] font-black px-1 rounded animate-pulse",
      warn: "text-[#00ff66]/70 underline",
      success: "text-[#00ff66] font-bold border-b border-green-500/20",
      system: "text-[#00ff66]/90 font-semibold uppercase tracking-wider text-[10px]",
      input: "text-[#00ff66] font-bold",
    }
  },
  monochromatic: {
    bg: "bg-[#18181b]",
    textDefault: "text-zinc-300",
    borderBottom: "border-[#27272a]",
    hoverBg: "hover:bg-[#202023]",
    promptPrefix: "text-white font-extrabold font-mono",
    inputCaret: "caret-white text-white",
    logColors: {
      info: "text-zinc-300",
      error: "text-white font-bold bg-zinc-800 border border-zinc-700 px-1 rounded",
      warn: "text-zinc-500 font-medium",
      success: "text-white font-semibold underline",
      system: "text-zinc-400 opacity-80",
      input: "text-white font-extrabold",
    }
  }
};

export default function Terminal({ files, onSelectFile, onRunCode, theme = "neon" }: TerminalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [logs, setLogs] = useState<TerminalLog[]>(INITIAL_LOGS());
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  // Handle building events dispatched from LivePreview.tsx
  useEffect(() => {
    const handleBuildEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setLogs((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            type: detail.type,
            message: `[BUILD] ${detail.message}`,
            time: new Date().toLocaleTimeString(),
          }
        ].slice(-150));
      }
    };

    window.addEventListener("mycanvaslab-build", handleBuildEvent);
    return () => window.removeEventListener("mycanvaslab-build", handleBuildEvent);
  }, []);

  // Handle postMessage logs and runtime errors
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.source === "mycanvaslab-sandbox") {
        if (data.type === "log") {
          let logType: "info" | "warn" | "error" = "info";
          if (data.logType === "error") logType = "error";
          else if (data.logType === "warn") logType = "warn";

          setLogs((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              type: logType,
              message: `[CONSOLE] [${data.logType.toUpperCase()}] ${data.message}`,
              time: new Date().toLocaleTimeString(),
            }
          ].slice(-150));
        } else if (data.type === "error") {
          setLogs((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              type: "error",
              message: `[RUNTIME ERROR] ${data.message}`,
              time: new Date().toLocaleTimeString(),
            }
          ].slice(-150));
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Keyboard shortcut Ctrl + ` to toggle terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    // Add to logs
    const newLogs = [
      ...logs,
      {
        id: Math.random().toString(),
        type: "input" as const,
        message: `developer@mycanvaslab:~$ ${cmd}`,
        time: new Date().toLocaleTimeString(),
      }
    ];

    // Add to history
    setHistory((prev) => [cmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);
    setInputVal("");

    const parts = cmd.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let outputLogs: TerminalLog[] = [];

    switch (command) {
      case "help":
        outputLogs = [
          {
            id: Math.random().toString(),
            type: "info",
            message: `Available CLI commands:\n  ls              - List files in current virtual workspace\n  cat <file>      - Output file contents (e.g. cat src/App.tsx)\n  clear / cls     - Clear the terminal logs\n  npm run build   - Trigger compiler to transpile/bundle files\n  neofetch        - Display environment branding and stats\n  whoami          - Print active developer identity\n  date            - Print current system date/time\n  echo <text>     - Echo text in stdout`,
            time: new Date().toLocaleTimeString(),
          }
        ];
        break;

      case "ls":
        const fileNames = files.map((f) => `  ${f.path}`).join("\n");
        outputLogs = [
          {
            id: Math.random().toString(),
            type: "info",
            message: `Workspace files (${files.length}):\n${fileNames}`,
            time: new Date().toLocaleTimeString(),
          }
        ];
        break;

      case "cat":
        if (args.length === 0) {
          outputLogs = [
            {
              id: Math.random().toString(),
              type: "error",
              message: "cat: missing file operand. Usage: cat <filename>",
              time: new Date().toLocaleTimeString(),
            }
          ];
        } else {
          const targetPath = args[0];
          const file = files.find((f) => f.path.toLowerCase() === targetPath.toLowerCase() || f.path.toLowerCase().endsWith(targetPath.toLowerCase()));
          if (file) {
            outputLogs = [
              {
                id: Math.random().toString(),
                type: "info",
                message: `--- [${file.path}] --- \n${file.content}`,
                time: new Date().toLocaleTimeString(),
              }
            ];
          } else {
            outputLogs = [
              {
                id: Math.random().toString(),
                type: "error",
                message: `cat: ${targetPath}: No such file or directory`,
                time: new Date().toLocaleTimeString(),
              }
            ];
          }
        }
        break;

      case "clear":
      case "cls":
        setLogs([]);
        return;

      case "npm":
        if (args.join(" ") === "run build" || args.join(" ") === "run dev" || args.join(" ") === "start") {
          outputLogs = [
            {
              id: Math.random().toString(),
              type: "success",
              message: `Executing scripts: "npm ${args.join(" ")}" in virtual environment...`,
              time: new Date().toLocaleTimeString(),
            }
          ];
          setTimeout(() => {
            onRunCode();
          }, 300);
        } else {
          outputLogs = [
            {
              id: Math.random().toString(),
              type: "error",
              message: `npm ERR! Unknown script: "${args.join(" ")}". Did you mean "run build"?`,
              time: new Date().toLocaleTimeString(),
            }
          ];
        }
        break;

      case "neofetch":
        outputLogs = [
          {
            id: Math.random().toString(),
            type: "success",
            message: `      /\\      MyCanvasLab Cloud IDE v2.4.0\n     /  \\     OS: WebContainer Linux Sandbox (Alpine 3.19)\n    / /\\ \\    Host: Server-less Cloud Run Instance (Asia-Pac)\n   / /  \\ \\   Kernel: x86_64 Linux 6.1.0-custom\n  /_/    \\_\\  Uptime: 4 hours, 18 mins\n              Shell: sh (Bourne shell)\n              Active Branch: main (production-ready)\n              Babel Standalone: v7.24.0\n              React Version: React 18.2.0 (Dual-renderer)`,
            time: new Date().toLocaleTimeString(),
          }
        ];
        break;

      case "whoami":
        outputLogs = [
          {
            id: Math.random().toString(),
            type: "info",
            message: "developer@mycanvaslab-sandbox",
            time: new Date().toLocaleTimeString(),
          }
        ];
        break;

      case "date":
        outputLogs = [
          {
            id: Math.random().toString(),
            type: "info",
            message: new Date().toString(),
            time: new Date().toLocaleTimeString(),
          }
        ];
        break;

      case "echo":
        outputLogs = [
          {
            id: Math.random().toString(),
            type: "info",
            message: args.join(" "),
            time: new Date().toLocaleTimeString(),
          }
        ];
        break;

      default:
        outputLogs = [
          {
            id: Math.random().toString(),
            type: "error",
            message: `sh: command not found: ${command}. Type 'help' to see valid commands.`,
            time: new Date().toLocaleTimeString(),
          }
        ];
    }

    setLogs([...newLogs, ...outputLogs]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal("");
      }
    }
  };

  const errorCount = logs.filter((l) => l.type === "error").length;
  const warnCount = logs.filter((l) => l.type === "warn").length;

  const currentStyle = THEME_STYLES[theme] || THEME_STYLES.neon;

  return (
    <div 
      className={`border-t border-[#2a2a2a] transition-all duration-200 flex flex-col z-40 select-text ${currentStyle.bg} ${
        isOpen ? (isMaximized ? "h-[85%]" : "h-[260px]") : "h-8"
      }`}
    >
      {/* Terminal Header */}
      <div 
        onClick={() => !isOpen && setIsOpen(true)}
        className="h-8 bg-[#141414] border-b border-[#2a2a2a] px-3 flex items-center justify-between cursor-pointer flex-shrink-0"
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-zinc-450 hover:text-zinc-200 transition">
            <TerminalIcon className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">Terminal CLI</span>
          </div>

          <div className="h-3 w-[1px] bg-[#2a2a2a]"></div>

          <div className="flex items-center space-x-2 text-[10px] font-mono">
            {errorCount > 0 ? (
              <span className="flex items-center gap-1 text-red-400 bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                {errorCount} {errorCount === 1 ? "Error" : "Errors"}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-500 bg-green-950/10 px-1.5 py-0.5 rounded border border-green-900/20">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Build OK
              </span>
            )}

            {warnCount > 0 && (
              <span className="flex items-center gap-1 text-amber-400 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/30">
                <Info className="h-3 w-3 text-amber-500" />
                {warnCount} {warnCount === 1 ? "Warn" : "Warns"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setLogs(INITIAL_LOGS())}
            className="p-1 hover:bg-[#222] rounded text-zinc-500 hover:text-red-400 transition"
            title="Clear Logs"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          {isOpen && (
            <button 
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 hover:bg-[#222] rounded text-zinc-500 hover:text-white transition"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          )}

          <button 
            onClick={() => {
              setIsOpen(!isOpen);
              if (isMaximized) setIsMaximized(false);
            }}
            className="p-1 hover:bg-[#222] rounded text-zinc-500 hover:text-white transition"
            title={isOpen ? "Minimize Panel" : "Expand Panel"}
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      {isOpen && (
        <div 
          onClick={focusInput}
          className={`flex-1 overflow-y-auto p-3 font-mono text-[11px] leading-relaxed space-y-1 ${currentStyle.bg} ${currentStyle.textDefault} scrollbar-thin flex flex-col justify-start`}
        >
          {logs.map((log) => {
            const colorClass = currentStyle.logColors[log.type] || currentStyle.textDefault;

            return (
              <div key={log.id} className={`flex items-start gap-2 whitespace-pre-wrap border-b ${currentStyle.borderBottom} pb-1 ${currentStyle.hoverBg} px-1 rounded transition duration-75`}>
                <span className="opacity-60 flex-shrink-0 text-[10px]">[{log.time}]</span>
                <span className={colorClass}>{log.message}</span>
              </div>
            );
          })}
          
          <div ref={logsEndRef} />

          {/* Prompt Entry Input */}
          <form onSubmit={handleCommandSubmit} className="flex items-center space-x-2 pt-2 border-t border-[#1a1a1e] flex-shrink-0">
            <span className={currentStyle.promptPrefix}>developer@mycanvaslab:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-transparent border-none outline-none font-mono text-[11px] ${currentStyle.inputCaret} p-0`}
              placeholder="Type command here (e.g. 'help', 'npm run build', 'neofetch')..."
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </form>
        </div>
      )}
    </div>
  );
}
