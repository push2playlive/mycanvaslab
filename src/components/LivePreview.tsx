import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCw, ExternalLink, ShieldCheck, Sparkles, Terminal as ConsoleIcon, AlertTriangle, XCircle, Info, Trash2, Search, Check, Copy } from "lucide-react";
import { VirtualFile } from "../types";

interface LivePreviewProps {
  files: VirtualFile[];
  showCode: boolean;
  showPreview: boolean;
  onToggleLayout: (mode: "code" | "split" | "preview") => void;
}

interface LogMessage {
  logType: "log" | "warn" | "error" | "info";
  message: string;
  timestamp: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  files,
  showCode,
  showPreview,
  onToggleLayout,
}) => {
  const [srcDoc, setSrcDoc] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sub-tab selection for LivePreview panel: "preview" vs "console"
  const [activeSubTab, setActiveSubTab] = useState<"preview" | "console">("preview");
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [filterType, setFilterType] = useState<"all" | "log" | "warn" | "error">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Clear logs when reload key triggers or srcDoc compiles new code
  useEffect(() => {
    setLogs([]);
  }, [srcDoc, reloadKey]);

  // Intercept logs transmitted from frame message channel
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SANDBOX_CONSOLE_LOG") {
        const { logType, message, timestamp } = event.data;
        setLogs((prev) => [
          ...prev,
          { logType: logType as any, message, timestamp },
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Compile workspace files into a unified srcDoc with console interceptor pre-injected
  useEffect(() => {
    const htmlFile = files.find((f) => f.path === "index.html");
    if (!htmlFile) {
      setSrcDoc(`
        <html>
          <body style="background:#09090b;color:#a1a1aa;font-family:sans-serif;padding:2rem;text-align:center;">
            <h3>Workspace Empty</h3>
            <p style="font-size:12px;">Create or load an <strong>index.html</strong> file to render a preview.</p>
          </body>
        </html>
      `);
      return;
    }

    let compiledHtml = htmlFile.content;

    // Inject any styles or scripts from other virtual files in the workspace
    files.forEach((file) => {
      if (file.path === "index.html") return;

      const ext = file.path.split(".").pop()?.toLowerCase();
      if (ext === "css") {
        // Inject stylesheet
        compiledHtml = compiledHtml.replace(
          "</head>",
          `<style id="injected-${file.path.replace(/\./g, "-")}">\n${file.content}\n</style>\n</head>`
        );
      } else if (ext === "js" || ext === "ts") {
        // Inject script
        compiledHtml = compiledHtml.replace(
          "</body>",
          `<script id="injected-${file.path.replace(/\./g, "-")}">\n${file.content}\n</script>\n</body>`
        );
      }
    });

    // Code interceptor script to report all console logs, warnings, errors and runtime crash stacktraces
    const consoleInterceptorScript = `
<script id="console-interceptor">
(function() {
  const _log = console.log;
  const _warn = console.warn;
  const _error = console.error;
  const _info = console.info;

  function transmit(type, args) {
    const serialized = args.map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (arg instanceof Error) return arg.stack || arg.message;
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, (key, value) => {
            if (typeof value === 'function') return value.toString();
            return value;
          }, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    });

    window.parent.postMessage({
      type: 'SANDBOX_CONSOLE_LOG',
      logType: type,
      message: serialized.join(' '),
      timestamp: new Date().toLocaleTimeString()
    }, '*');
  }

  console.log = function(...args) {
    transmit('log', args);
    _log.apply(console, args);
  };
  console.warn = function(...args) {
    transmit('warn', args);
    _warn.apply(console, args);
  };
  console.error = function(...args) {
    transmit('error', args);
    _error.apply(console, args);
  };
  console.info = function(...args) {
    transmit('info', args);
    _info.apply(console, args);
  };

  window.addEventListener('error', function(e) {
    transmit('error', [e.message + ' (' + e.filename + ':' + e.lineno + ':' + e.colno + ')']);
  });

  window.addEventListener('unhandledrejection', function(e) {
    transmit('error', ['Unhandled Rejection: ' + (e.reason && e.reason.message || e.reason)]);
  });
})();
</script>
`;

    // Inject interceptor script early in document structure
    if (compiledHtml.includes("<head>")) {
      compiledHtml = compiledHtml.replace("<head>", `<head>${consoleInterceptorScript}`);
    } else if (compiledHtml.includes("<html>")) {
      compiledHtml = compiledHtml.replace("<html>", `<html>${consoleInterceptorScript}`);
    } else {
      compiledHtml = consoleInterceptorScript + compiledHtml;
    }

    setSrcDoc(compiledHtml);
  }, [files]);

  const triggerReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([srcDoc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const getLogStyle = (type: string) => {
    switch (type) {
      case "error":
        return {
          bg: "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/15",
          icon: <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />,
        };
      case "warn":
        return {
          bg: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/15",
          icon: <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0 mt-0.5" />,
        };
      case "info":
        return {
          bg: "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/15",
          icon: <Info className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />,
        };
      default:
        return {
          bg: "bg-zinc-900/40 border-zinc-850 text-zinc-300 hover:bg-zinc-900/60",
          icon: <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 flex-shrink-0 mx-1 mt-1.5" />,
        };
    }
  };

  const handleCopyLog = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === "all" || log.logType === filterType;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b]">
      {/* Sandbox Address Bar Simulation */}
      <div className="px-4 py-2 border-b border-zinc-850 flex items-center justify-between bg-[#0d0d0e] gap-4 shrink-0">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Play className="h-4 w-4 text-emerald-400 animate-pulse-soft" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-300">SANDBOX</span>
        </div>

        {/* Address bar simulation */}
        <div className="flex-1 max-w-xs md:max-w-sm bg-[#0a0a0b] border border-zinc-850 rounded-lg px-3 py-1 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            <span className="truncate">sandbox://workspace/index.html</span>
          </div>
          <span className="text-[9px] text-emerald-500/80 font-bold uppercase tracking-wider font-sans bg-emerald-950/20 px-1 rounded border border-emerald-900/30 hidden sm:inline">
            Secure
          </span>
        </div>

        {/* Layout Mode Toggles */}
        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => onToggleLayout("code")}
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
              showCode && !showPreview
                ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
            title="Switch to Code Only View"
          >
            Code
          </button>
          <button
            onClick={() => onToggleLayout("split")}
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
              showCode && showPreview
                ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
            title="Switch to Split View"
          >
            Split
          </button>
          <button
            onClick={() => onToggleLayout("preview")}
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
              !showCode && showPreview
                ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
            title="Switch to Preview Only View"
          >
            Preview
          </button>
        </div>

        {/* Browser control triggers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={triggerReload}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
            title="Reload Preview Frame"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleOpenNewTab}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
            title="Open Sandbox in New Window"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Sub tabs: Web Preview vs Console Monitor */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0b0b0c] border-b border-zinc-850 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("preview")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === "preview"
                ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            App Preview
          </button>
          <button
            onClick={() => setActiveSubTab("console")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === "console"
                ? "bg-purple-950/20 text-purple-400 border border-purple-500/30"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Console Monitor</span>
            {logs.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-black ${
                logs.some(l => l.logType === 'error')
                  ? "bg-red-500 text-white animate-pulse"
                  : logs.some(l => l.logType === 'warn')
                    ? "bg-yellow-500 text-black"
                    : "bg-zinc-700 text-zinc-300"
              }`}>
                {logs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Frame Viewer Pane (Kept alive in background with hidden state) */}
      <div className={activeSubTab === "preview" ? "flex-1 bg-black relative" : "hidden"}>
        <iframe
          key={reloadKey}
          ref={iframeRef}
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-modals allow-same-origin"
          className="w-full h-full border-none bg-black"
          title="Live Workspace Runtime Sandbox"
        />

        {/* Dynamic Float hint */}
        <div className="absolute bottom-4 right-4 bg-zinc-950/90 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg select-none pointer-events-none">
          <Sparkles className="h-3 w-3 text-purple-400" />
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-black">
            Live Hot Compilation Active
          </span>
        </div>
      </div>

      {/* Console Monitor View Pane */}
      <div className={activeSubTab === "console" ? "flex-1 flex flex-col overflow-hidden bg-[#040405] text-zinc-300 font-mono text-xs" : "hidden"}>
        {/* Console Controls / Filter bar */}
        <div className="p-3 border-b border-zinc-900 bg-black/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Log Type Filters */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-900">
            {(["all", "log", "warn", "error"] as const).map((type) => {
              const isActive = filterType === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? type === "error"
                        ? "bg-red-500/15 text-red-400 border border-red-500/30"
                        : type === "warn"
                        ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                        : "bg-purple-950/20 text-purple-400 border border-purple-500/30"
                      : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                  }`}
                >
                  {type === "all" ? "All" : type === "log" ? "Logs" : type === "warn" ? "Warnings" : "Errors"}
                </button>
              );
            })}
          </div>

          {/* Live Search and Clear log button */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 focus:border-purple-500/40 rounded-lg pl-8 pr-3 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all font-sans"
              />
            </div>

            <button
              onClick={() => setLogs([])}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-900 hover:border-red-950 bg-zinc-950 hover:bg-red-950/15 text-zinc-500 hover:text-red-400 transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Clear Logs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Logs List Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 select-text scrollbar-thin">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 space-y-2 py-12">
              <ConsoleIcon className="h-6 w-6 text-zinc-700 animate-pulse" />
              <div className="text-[10px] uppercase tracking-wider font-bold">No console messages received</div>
              <div className="text-[9px] text-zinc-600 max-w-xs leading-relaxed font-sans">
                Log messages, warning signals, and error traces inside your application sandbox will appear here instantly.
              </div>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const style = getLogStyle(log.logType);
              return (
                <div
                  key={index}
                  className={`p-2.5 rounded-lg border ${style.bg} transition-all duration-200 flex items-start gap-2.5 group relative`}
                >
                  {/* Log Type Icon */}
                  {style.icon}

                  {/* Timestamp & Message */}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-sans font-bold text-zinc-500 tracking-wider">
                        [{log.timestamp}]
                      </span>
                      <span className={`text-[8px] font-sans uppercase font-black px-1.5 py-0.5 rounded ${
                        log.logType === 'error' ? 'bg-red-950/40 text-red-400 border border-red-900/30' :
                        log.logType === 'warn' ? 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/30' :
                        'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}>
                        {log.logType}
                      </span>
                    </div>
                    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-all select-text font-mono">
                      {log.message}
                    </pre>
                  </div>

                  {/* Individual Copy Button */}
                  <button
                    onClick={() => handleCopyLog(log.message, index)}
                    className="absolute right-2 top-2 p-1 bg-zinc-950 border border-zinc-900 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:border-zinc-700 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                    title="Copy Log Message"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

