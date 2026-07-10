import React, { useState, useEffect, useRef } from "react";
import { Terminal as ConsoleIcon, AlertTriangle, XCircle, Info, Trash2, Search, Check, Copy, ChevronUp, ChevronDown, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LogMessage } from "../types";

interface LogsOverlayProps {
  logs: LogMessage[];
  onClear: () => void;
}

export const LogsOverlay: React.FC<LogsOverlayProps> = ({ logs, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "log" | "warn" | "error">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [shakeBadge, setShakeBadge] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const errorCount = logs.filter((l) => l.logType === "error").length;
  const warnCount = logs.filter((l) => l.logType === "warn").length;
  const infoCount = logs.filter((l) => l.logType === "log" || l.logType === "info").length;

  // Auto-scroll to bottom of logs on new logs
  useEffect(() => {
    if (isOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  // Shake badge/alert if a new error/warning arrives and panel is closed
  useEffect(() => {
    let timer: any;
    if (logs.length > 0 && !isOpen) {
      const lastLog = logs[logs.length - 1];
      if (lastLog.logType === "error" || lastLog.logType === "warn") {
        setShakeBadge(true);
        timer = setTimeout(() => setShakeBadge(false), 800);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [logs.length, isOpen]);

  const handleCopyLog = (text: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const getLogStyle = (type: string) => {
    switch (type) {
      case "error":
        return {
          bg: "bg-red-500/5 hover:bg-red-500/10 border-red-500/20 text-red-400",
          badge: "bg-red-500/25 text-red-300 border border-red-500/30",
          icon: <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />,
        };
      case "warn":
        return {
          bg: "bg-yellow-500/5 hover:bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
          badge: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/35",
          icon: <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />,
        };
      case "info":
        return {
          bg: "bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/10 text-blue-400",
          badge: "bg-blue-500/15 text-blue-300 border border-blue-500/20",
          icon: <Info className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />,
        };
      default:
        return {
          bg: "bg-zinc-900/10 hover:bg-zinc-900/20 border-zinc-850 text-zinc-300",
          badge: "bg-zinc-900 text-zinc-400 border border-zinc-800",
          icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mx-1 mt-1.5" />,
        };
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesType =
      filterType === "all" ||
      log.logType === filterType ||
      (filterType === "log" && log.logType === "info");
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="w-full bg-zinc-950/95 border-t border-zinc-900 select-none z-40 relative flex flex-col shrink-0">
      {/* Glow highlight for active errors/warnings */}
      {errorCount > 0 && (
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-red-500/0 via-red-500/40 to-red-500/0 pointer-events-none" />
      )}

      {/* Control / Toggle Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-2 bg-[#080908] hover:bg-[#0c0d0c] cursor-pointer flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 transition-colors select-none"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2 text-[#1ae854]">
            <ConsoleIcon className={`h-4 w-4 ${isOpen ? "rotate-90 text-[#1ae854]" : "text-zinc-400"} transition-transform duration-200`} />
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-300">
              Live Sandbox Console
            </span>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-1.5">
            {errorCount > 0 && (
              <motion.span
                animate={shakeBadge ? { x: [-4, 4, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-[9px] font-mono font-bold flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {errorCount} {errorCount === 1 ? "Error" : "Errors"}
              </motion.span>
            )}

            {warnCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-950/40 border border-yellow-500/35 text-yellow-400 text-[9px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                {warnCount} {warnCount === 1 ? "Warning" : "Warnings"}
              </span>
            )}

            {logs.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] font-mono">
                {logs.length} Total
              </span>
            )}

            {logs.length === 0 && (
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                No logs compiled
              </span>
            )}
          </div>
        </div>

        {/* Action Controls & Filters in Header when open or closed */}
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {logs.length > 0 && (
            <button
              onClick={onClear}
              id="header-clear-logs-btn"
              className="p-1 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 rounded border border-transparent hover:border-zinc-800 transition cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2"
              title="Clear Console History"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            id="header-console-toggle-btn"
            className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded border border-transparent hover:border-zinc-800 transition cursor-pointer"
            title={isOpen ? "Collapse Panel" : "Expand Console Panel"}
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Terminal View Area (Animate Height) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "320px" }}
            exit={{ height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full flex flex-col bg-[#030403] border-t border-zinc-900 overflow-hidden"
          >
            {/* Toolbar for Search & Filters */}
            <div className="px-4 py-2.5 bg-[#0a0c0a] border-b border-zinc-900/80 flex flex-col md:flex-row items-stretch md:items-center gap-3 select-none">
              {/* Search input with search icon and clear button */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search logs by text content or code..."
                  value={searchQuery}
                  id="log-search-input"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-zinc-850 hover:border-zinc-800 focus:border-[#1ae854]/40 rounded-lg pl-9 pr-8 py-1.5 text-[11px] font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all focus:ring-1 focus:ring-[#1ae854]/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    id="clear-search-query-btn"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 cursor-pointer"
                    title="Clear Search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Severity Toggles / Filters */}
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto scrollbar-none py-0.5">
                {(["all", "log", "warn", "error"] as const).map((type) => {
                  const isActive = filterType === type;
                  const count =
                    type === "all"
                      ? logs.length
                      : type === "log"
                      ? logs.filter((l) => l.logType === "log" || l.logType === "info").length
                      : type === "warn"
                      ? warnCount
                      : errorCount;

                  const getSeverityStyle = () => {
                    if (!isActive) return "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/60 border-zinc-900 hover:border-zinc-850";
                    switch (type) {
                      case "error":
                        return "bg-red-500/10 text-red-400 border-red-500/30 font-bold shadow-[0_0_10px_rgba(239,68,68,0.1)]";
                      case "warn":
                        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 font-bold shadow-[0_0_10px_rgba(234,179,8,0.1)]";
                      case "log":
                        return "bg-blue-500/10 text-blue-400 border-blue-500/30 font-bold shadow-[0_0_10px_rgba(59,130,246,0.1)]";
                      default:
                        return "bg-emerald-500/10 text-[#1ae854] border-[#1ae854]/25 font-bold shadow-[0_0_10px_rgba(26,232,84,0.1)]";
                    }
                  };

                  return (
                    <button
                      key={type}
                      id={`severity-filter-${type}`}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1.5 shrink-0 ${getSeverityStyle()}`}
                    >
                      <span className="flex items-center gap-1">
                        {type === "all" && <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />}
                        {type === "log" && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-soft" />}
                        {type === "warn" && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                        {type === "error" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                        {type === "all" ? "All" : type === "log" ? "Info" : type === "warn" ? "Warns" : "Errors"}
                      </span>
                      <span className="text-[9px] opacity-70 px-1 py-0.2 bg-black/40 rounded border border-zinc-900/30">
                        {count}
                      </span>
                    </button>
                  );
                })}

                {/* Inline Clear Button */}
                {logs.length > 0 && (
                  <button
                    onClick={onClear}
                    id="toolbar-clear-logs-btn"
                    className="ml-2 px-3 py-1 bg-zinc-900/40 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 rounded-md border border-zinc-850 hover:border-red-500/25 transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shrink-0"
                    title="Clear Sandbox Console Output"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable console area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin font-mono select-text text-left">
              {filteredLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-1.5 py-6 select-none">
                  <ConsoleIcon className="h-5 w-5 text-zinc-700 animate-pulse-soft" />
                  <div className="text-[9px] uppercase tracking-wider font-bold">No logs intercepted</div>
                  <div className="text-[8px] text-zinc-700 max-w-xs leading-relaxed font-sans">
                    All `console.log`, warnings, and errors from your workspace sandbox will appear here in real-time.
                  </div>
                </div>
              ) : (
                filteredLogs.map((log, index) => {
                  const style = getLogStyle(log.logType);
                  return (
                    <div
                      key={index}
                      className={`px-3 py-2 rounded-md border ${style.bg} transition-all duration-150 flex items-start gap-3 group relative`}
                    >
                      {/* Colored Status Tag */}
                      <span className={`text-[8px] font-sans font-extrabold uppercase px-1.5 py-0.2 rounded shrink-0 self-start ${style.badge}`}>
                        {log.logType === "log" ? "info" : log.logType}
                      </span>

                      {/* Log Message Content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-all font-mono select-text">
                          {log.message}
                        </pre>
                      </div>

                      {/* Timestamp & Individual Copy */}
                      <div className="flex items-center gap-2.5 shrink-0 self-start select-none">
                        <span className="text-[9px] text-zinc-600">
                          {log.timestamp}
                        </span>

                        <button
                          onClick={(e) => handleCopyLog(log.message, index, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 bg-zinc-950 border border-zinc-900 rounded hover:border-zinc-700 text-zinc-500 hover:text-zinc-200 transition cursor-pointer"
                          title="Copy Output"
                        >
                          {copiedIndex === index ? (
                            <Check className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Simulation Status Overlay Footer */}
            <div className="px-6 py-1.5 bg-[#060706] border-t border-zinc-900 flex items-center justify-between text-[9px] font-mono text-zinc-600 select-none">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="uppercase tracking-widest text-[8px] font-bold text-emerald-500/80">Sandbox Interpreter Bound</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Filtered: {filteredLogs.length} / {logs.length}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
