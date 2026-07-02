import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  RotateCw, 
  AlertTriangle, 
  CheckCircle, 
  Terminal, 
  Eye, 
  EyeOff, 
  Layout,
  Search,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Info,
  XCircle,
  X,
  Sparkles
} from "lucide-react";
import { VirtualFile } from "../types";

interface LogItem {
  type: string;
  message: string;
  time: string;
  args?: { isObject: boolean; value: string }[];
}

interface LivePreviewProps {
  files: VirtualFile[];
  activeFile: string;
  triggerCompile: boolean;
  onResetTrigger: () => void;
}

export default function LivePreview({
  files,
  activeFile,
  triggerCompile,
  onResetTrigger,
}: LivePreviewProps) {
  const [compilerLoaded, setCompilerLoaded] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [iframeKey, setIframeKey] = useState(0);
  const [showConsole, setShowConsole] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "console">("preview");
  const [showOverlayConsole, setShowOverlayConsole] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "info" | "warn" | "error">("all");
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Dynamic Babel-standalone loader
  useEffect(() => {
    if ((window as any).Babel) {
      setCompilerLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/@babel/standalone@7.24.0/babel.min.js";
    script.async = true;
    script.onload = () => {
      setCompilerLoaded(true);
    };
    script.onerror = () => {
      setError("Failed to load Babel compiler CDN. Please check your internet connection.");
    };
    document.head.appendChild(script);
  }, []);

  // Receive logs and errors from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && data.source === "mycanvaslab-sandbox") {
        if (data.type === "log") {
          setLogs((prev) => [
            ...prev,
            { 
              type: data.logType, 
              message: data.message, 
              time: new Date().toLocaleTimeString(),
              args: data.args 
            },
          ].slice(-100)); // Keep last 100 logs for rich scroll history
        } else if (data.type === "error") {
          setError(`Runtime Error: ${data.message}`);
          setLogs((prev) => [
            ...prev,
            { 
              type: "error", 
              message: `Runtime Error: ${data.message}`, 
              time: new Date().toLocaleTimeString(),
              args: [{ isObject: false, value: `Runtime Error: ${data.message}` }]
            },
          ].slice(-100));
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const runCompiler = () => {
    if (!compilerLoaded) return;
    setCompiling(true);
    setError(null);
    setLogs([]);

    window.dispatchEvent(
      new CustomEvent("mycanvaslab-build", {
        detail: { type: "info", message: "Starting Babel bundler compilation pipeline..." },
      })
    );

    try {
      const Babel = (window as any).Babel;

      // Transpiled files registry
      const transpiledModules: Record<string, string> = {};

      for (const file of files) {
        if (file.path.endsWith(".tsx") || file.path.endsWith(".ts") || file.path.endsWith(".js")) {
          try {
            window.dispatchEvent(
              new CustomEvent("mycanvaslab-build", {
                detail: { type: "info", message: `Transpiling module: ${file.path}` },
              })
            );
            const transformFn = Babel.transformSync || Babel.transform;
            const compiled = transformFn(file.content, {
              filename: file.path || activeFile,
              presets: ["react", "typescript"],
              plugins: ["transform-modules-commonjs"],
            }).code;
            transpiledModules[file.path] = compiled;
          } catch (err: any) {
            window.dispatchEvent(
              new CustomEvent("mycanvaslab-build", {
                detail: { type: "error", message: `Syntax Error in ${file.path}: ${err.message}` },
              })
            );
            throw new Error(`Syntax Error in ${file.path}: ${err.message}`);
          }
        }
      }

      // Read or build target index.html
      const htmlFile = files.find((f) => f.path === "index.html");
      let baseHtml = htmlFile ? htmlFile.content : `<!DOCTYPE html><html><body><div id="root"></div></body></html>`;

      // Inject custom runtime script into index.html for module system & logger
      const runtimeScript = `
<script>
  (function() {
    // Intercept console logging
    const _log = console.log;
    const _error = console.error;
    const _warn = console.warn;

    function sendLog(type, args) {
      const formattedArgs = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try {
            return { isObject: true, value: JSON.stringify(arg, null, 2) };
          } catch(e) {
            return { isObject: false, value: String(arg) };
          }
        }
        return { isObject: false, value: String(arg) };
      });

      const message = args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try { return JSON.stringify(arg); } catch(e) { return String(arg); }
        }
        return String(arg);
      }).join(' ');
      
      window.parent.postMessage({
        source: 'mycanvaslab-sandbox',
        type: 'log',
        logType: type,
        args: formattedArgs,
        message: message
      }, '*');
    }

    console.log = function(...args) { _log(...args); sendLog('info', args); };
    console.error = function(...args) { _error(...args); sendLog('error', args); };
    console.warn = function(...args) { _warn(...args); sendLog('warn', args); };

    // Catch unhandled errors
    window.onerror = function(message, source, lineno, colno, error) {
      window.parent.postMessage({
        source: 'mycanvaslab-sandbox',
        type: 'error',
        message: message + ' (Line ' + lineno + ':' + colno + ')'
      }, '*');
      return false;
    };
  })();

  // Modular Require & Define Framework
  const modules = {};
  window.define = function(path, factory) {
    modules[path] = { factory, exports: {}, initialized: false };
  };

  window.require = function(path) {
    // Normalize path matches
    let cleanPath = path.replace(/^\\.\\//, 'src/').replace(/^\\.\\.\\//, 'src/');
    
    // Auto append extension if missing
    let mod = modules[cleanPath] || 
              modules[cleanPath + '.tsx'] || 
              modules[cleanPath + '.ts'] || 
              modules[cleanPath + '.js'] ||
              modules['src/' + path] ||
              modules['src/' + path + '.tsx'];

    if (!mod) {
      if (path === 'react') return window.React;
      if (path === 'react-dom') return window.ReactDOM;
      if (path === 'lucide-react') return window.lucideReact || window.LucideReact || window.lucide || window.Lucide;
      if (path === 'framer-motion' || path === 'motion/react' || path === 'motion') return window.Motion || window.FramerMotion;
      if (path === 'recharts') return window.Recharts;
      if (path === 'd3') return window.d3;
      throw new Error('Module not found inside virtual sandbox: ' + path);
    }

    if (!mod.initialized) {
      mod.initialized = true;
      mod.factory(window.require, mod.exports, mod);
    }
    return mod.exports;
  };
</script>

<!-- Preload React and Lucide standard globals inside IFrame -->
<script src="https://unpkg.com/react@18.2.0/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js"></script>
<script src="https://unpkg.com/lucide@latest"></script>
<script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
<script src="https://unpkg.com/d3@7.8.5/dist/d3.min.js"></script>
`;

      // Inject runtimeScript before </head>
      if (baseHtml.includes("</head>")) {
        baseHtml = baseHtml.replace("</head>", `${runtimeScript}</head>`);
      } else {
        baseHtml = runtimeScript + baseHtml;
      }

      // Build module define block
      let defineBlock = "<script>\n";
      Object.entries(transpiledModules).forEach(([path, code]) => {
        defineBlock += `define("${path}", function(require, exports, module) {\n${code}\n});\n\n`;
      });

      // Bootstrap entrypoint (usually src/main.tsx or src/App.tsx)
      const hasMain = files.some((f) => f.path === "src/main.tsx");
      const bootstrapPath = hasMain ? "src/main.tsx" : "src/App.tsx";

      defineBlock += `
  // Render application
  try {
    const AppMod = require("${bootstrapPath}");
    const Root = document.getElementById("root");
    if (Root) {
      const root = ReactDOM.createRoot(Root);
      // Support default exports or raw modules
      const AppElement = React.createElement(AppMod.default || AppMod);
      root.render(AppElement);
    }
  } catch (err) {
    console.error("Bootstrap failed: " + err.message);
  }
</script>
`;

      baseHtml += defineBlock;

      // Update iframe using srcDoc
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.srcdoc = baseHtml;
          setIframeKey((prev) => prev + 1);
        }
        setCompiling(false);
        window.dispatchEvent(
          new CustomEvent("mycanvaslab-build", {
            detail: { type: "success", message: `Compilation complete! Bundled ${Object.keys(transpiledModules).length} modules successfully.` },
          })
        );
      }, 300);

    } catch (err: any) {
      setError(err.message);
      setCompiling(false);
      window.dispatchEvent(
        new CustomEvent("mycanvaslab-build", {
          detail: { type: "error", message: `Sandbox build failed: ${err.message}` },
        })
      );
    }
  };

  useEffect(() => {
    if (triggerCompile && compilerLoaded) {
      runCompiler();
      onResetTrigger();
    }
  }, [triggerCompile, compilerLoaded]);

  // Run compilation on first load once Babel is loaded
  useEffect(() => {
    if (compilerLoaded) {
      runCompiler();
    }
  }, [compilerLoaded]);

  const handleTestLogs = () => {
    const testLogs = [
      {
        type: "info",
        message: "Utube Media initialized standard streaming buffers.",
        time: new Date().toLocaleTimeString(),
        args: [{ isObject: false, value: "Utube Media initialized standard streaming buffers." }]
      },
      {
        type: "warn",
        message: "Network jitter detected. Stabilizing socket frame latency.",
        time: new Date().toLocaleTimeString(),
        args: [{ isObject: false, value: "Network jitter detected. Stabilizing socket frame latency." }]
      },
      {
        type: "info",
        message: "Channel payload object received from endpoint:",
        time: new Date().toLocaleTimeString(),
        args: [
          { isObject: false, value: "Channel payload object received from endpoint:" },
          { 
            isObject: true, 
            value: JSON.stringify({
              channelId: "utube-media-live",
              subscriberCount: 2450900,
              verified: true,
              currentGiftRanking: "#1 Supreme Contributor",
              streamingServerHost: "rtmp://live.utubemedia.com:1935/live",
              hlsPlaylistUrl: "https://stream.utubemedia.com/hls/index.m3u8",
              activeFilters: ["4k-stream", "dolby-audio", "hdr-preset"]
            }, null, 2) 
          }
        ]
      },
      {
        type: "error",
        message: "Audio track synchronization offset: -140ms failed decoding.",
        time: new Date().toLocaleTimeString(),
        args: [{ isObject: false, value: "Audio track synchronization offset: -140ms failed decoding." }]
      }
    ];

    setLogs((prev) => [...prev, ...testLogs].slice(-100));
  };

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSeverity =
      severityFilter === "all" ||
      (severityFilter === "info" && log.type === "info") ||
      (severityFilter === "warn" && log.type === "warn") ||
      (severityFilter === "error" && log.type === "error");

    const matchesSearch =
      !searchQuery.trim() ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.args && log.args.some((arg) => arg.value.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] text-gray-300 select-none">
      
      {/* Enhanced Preview Tabs & Header */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#2a2a2a] bg-[#141414] h-11 flex-shrink-0">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
              activeTab === "preview"
                ? "bg-[#1d1d20] text-[var(--accent)]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1c]/45"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Live App</span>
          </button>
          
          <button
            onClick={() => setActiveTab("console")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer relative ${
              activeTab === "console"
                ? "bg-[#1d1d20] text-[var(--accent)]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1c]/45"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Preview Console</span>
            {logs.length > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
                logs.some(l => l.type === 'error') 
                  ? "bg-red-500 text-white animate-pulse" 
                  : logs.some(l => l.type === 'warn') 
                    ? "bg-amber-500 text-black" 
                    : "bg-[var(--accent)] text-[var(--accent-text)]"
              }`}>
                {logs.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {compiling ? (
            <span className="flex items-center gap-1.5 text-xs text-[var(--accent)]">
              <RotateCw className="h-3 w-3 animate-spin" /> Compiling...
            </span>
          ) : error ? (
            <span className="flex items-center gap-1.5 text-xs text-red-400 font-semibold">
              <AlertTriangle className="h-3 w-3" /> Failed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-green-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Running
            </span>
          )}

          <div className="h-4 w-[1px] bg-[#2a2a2a] mx-1"></div>

          <button
            onClick={runCompiler}
            disabled={!compilerLoaded}
            className="p-1.5 hover:bg-[#1a1a1a] text-zinc-400 hover:text-[var(--accent)] rounded transition cursor-pointer disabled:opacity-50"
            title="Force Hot-Reload"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tab Panel Frame */}
      <div className="flex-1 relative bg-[#0d0d0d] p-3 flex flex-col min-h-0 overflow-hidden">
        
        {activeTab === "preview" ? (
          <div className="flex-1 flex flex-col bg-black rounded border border-[#2a2a2a] overflow-hidden shadow-2xl relative">
            
            {/* Mock Browser Header Bar */}
            <div className="h-7 bg-[#141414] border-b border-[#2a2a2a] flex items-center px-3 justify-between flex-shrink-0">
              <div className="flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#27c93f]"></div>
              </div>
              <div className="text-[9px] text-gray-500 font-mono tracking-wide">http://localhost:3000/live-sandbox</div>
              
              <button
                onClick={() => setShowOverlayConsole(!showOverlayConsole)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border transition duration-150 cursor-pointer ${
                  showOverlayConsole
                    ? "bg-[var(--accent-glow)] border-[var(--accent)]/40 text-[var(--accent)]"
                    : "bg-[#1d1d20] border-[#2a2a2a] text-zinc-400 hover:text-white"
                }`}
              >
                <Terminal className="h-2.5 w-2.5" />
                <span>Console ({logs.length})</span>
              </button>
            </div>

            {/* Sandbox IFrame Container */}
            <div className="flex-1 relative bg-black">
              {!compilerLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0d0d] z-20 space-y-4">
                  <RotateCw className="h-6 w-6 text-[var(--accent)] animate-spin" />
                  <p className="text-xs font-mono text-zinc-500">Initializing sandboxed pipelines...</p>
                </div>
              )}

              {error ? (
                <div className="absolute inset-0 p-6 bg-[#0a0a0a] overflow-y-auto font-mono text-xs text-red-400 z-10 flex flex-col justify-start space-y-4 select-text">
                  <div className="flex items-center gap-2 border-b border-red-950/50 pb-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span className="font-bold text-sm">Compilation Sandbox Failed</span>
                  </div>
                  <pre className="p-4 bg-red-950/10 border border-red-900/30 rounded whitespace-pre-wrap leading-relaxed">
                    {error}
                  </pre>
                  <p className="text-zinc-500 italic text-[11px]">
                    Tip: Inspect line syntax, brackets pairing, or Lucide imports inside your file and click Run again.
                  </p>
                </div>
              ) : null}

              {/* Dynamic Sandboxed IFrame */}
              <iframe
                key={iframeKey}
                ref={iframeRef}
                title="Sandbox Preview"
                sandbox="allow-scripts allow-modals allow-same-origin"
                className="w-full h-full border-none bg-black"
              />

              {/* Glassmorphic Overlay Console */}
              {showOverlayConsole && (
                <div className="absolute bottom-0 left-0 right-0 h-44 bg-black/90 backdrop-blur-md border-t border-[#2a2a2a] z-30 flex flex-col font-mono text-[10px]">
                  <div className="flex items-center justify-between px-3 py-1 bg-[#141414] border-b border-[#2a2a2a] h-6 flex-shrink-0 select-none">
                    <span className="text-[9px] font-bold tracking-wider text-zinc-400 flex items-center gap-1">
                      <Terminal className="h-2.5 w-2.5 text-[var(--accent)]" /> OVERLAY PREVIEW CONSOLE
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setLogs([])}
                        className="text-[9px] hover:text-[var(--accent)] text-zinc-500 transition font-bold"
                      >
                        CLEAR
                      </button>
                      <button
                        onClick={() => setShowOverlayConsole(false)}
                        className="text-[9px] hover:text-[var(--accent)] text-zinc-500 transition font-bold"
                      >
                        CLOSE
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin select-text">
                    {logs.length === 0 ? (
                      <p className="text-zinc-600 italic">No output captured. Interact with the preview app to stream logs.</p>
                    ) : (
                      logs.map((log, index) => (
                        <div key={index} className="flex gap-2 text-zinc-400 border-b border-[#111] pb-1">
                          <span className="text-zinc-600 flex-shrink-0">[{log.time}]</span>
                          <span className={
                            log.type === "error" 
                              ? "text-red-400 font-medium" 
                              : log.type === "warn" 
                                ? "text-amber-400 font-medium" 
                                : "text-zinc-300"
                          }>
                            {log.message}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Dedicated 'Preview Console' Tab Panel Dashboard */
          <div className="flex-1 flex flex-col bg-black border border-[#2a2a2a] rounded-xl overflow-hidden min-h-0">
            
            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-3 bg-[#141414] border-b border-[#2a2a2a] flex-shrink-0">
              
              {/* Search & Filters */}
              <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#0d0d0d] border border-[#2a2a2a] rounded-md px-2.5 py-1 text-xs w-full sm:max-w-xs focus-within:border-[var(--accent)] transition duration-200">
                  <Search className="h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none text-zinc-350 outline-none w-full text-xs"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-zinc-500 hover:text-zinc-300">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-1 bg-[#0d0d0d] border border-[#2a2a2a] rounded-md p-0.5">
                  {(["all", "info", "warn", "error"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSeverityFilter(filter)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition ${
                        severityFilter === filter
                          ? "bg-[var(--accent)] text-[var(--accent-text)]"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1c1c1e]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Console operations */}
              <div className="flex items-center space-x-1.5 justify-end">
                <button
                  onClick={handleTestLogs}
                  className="px-2.5 py-1 bg-[#1a1a1c] border border-[#2a2a2a] rounded-md text-[10px] font-bold uppercase hover:bg-zinc-800 text-zinc-300 hover:text-[var(--accent)] transition flex items-center space-x-1"
                  title="Generate diagnostic sandbox console outputs"
                >
                  <Sparkles className="h-3 w-3 text-[var(--accent)] animate-pulse" />
                  <span>Test Logs</span>
                </button>

                <button
                  onClick={handleCopyLogs}
                  className="px-2.5 py-1 bg-[#1a1a1c] border border-[#2a2a2a] rounded-md text-[10px] font-bold uppercase hover:bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center space-x-1"
                  title="Copy log terminal outputs to clipboard"
                >
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-zinc-500" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={() => setLogs([])}
                  className="px-2.5 py-1 bg-[#1a1a1c] border border-[#2a2a2a] rounded-md text-[10px] font-bold uppercase hover:bg-red-950/20 text-zinc-300 hover:text-red-400 hover:border-red-900/40 transition flex items-center space-x-1"
                  title="Purge logs stack"
                >
                  <Trash2 className="h-3 w-3 text-zinc-500" />
                  <span>Clear</span>
                </button>
              </div>

            </div>

            {/* Log streams panel */}
            <div className="flex-1 overflow-y-auto bg-[#0d0d0d] scrollbar-thin flex flex-col">
              {filteredLogs.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-500 space-y-2">
                  <Terminal className="h-8 w-8 text-zinc-650" />
                  <p className="text-xs font-mono">No console streams found matching the filter constraints.</p>
                  <button
                    onClick={handleTestLogs}
                    className="text-[10px] text-[var(--accent)] hover:underline font-bold font-mono mt-2 uppercase tracking-wide"
                  >
                    Simulate Sample App Logs
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {filteredLogs.map((log, index) => (
                    <LogItemRow key={index} log={log} />
                  ))}
                </div>
              )}
            </div>

            {/* Status footer bar */}
            <div className="h-6 bg-[#141414] border-t border-[#2a2a2a] flex items-center px-3 justify-between flex-shrink-0 text-[10px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
                <span>Active Interceptor Pipeline Connected</span>
              </span>
              <span>Showing {filteredLogs.length} of {logs.length} entries</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// Collapsible expander row component for complex console objects
function LogItemRow({ log, key }: { log: any; key?: any }) {
  const [expanded, setExpanded] = useState(false);

  const getLogIcon = () => {
    switch (log.type) {
      case "error":
        return <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />;
      case "warn":
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />;
      default:
        return <Info className="h-3.5 w-3.5 text-sky-450 flex-shrink-0 mt-0.5" />;
    }
  };

  const getLogBg = () => {
    switch (log.type) {
      case "error":
        return "bg-red-950/5 border-l-2 border-red-500";
      case "warn":
        return "bg-amber-950/5 border-l-2 border-amber-500";
      default:
        return "border-l-2 border-zinc-700";
    }
  };

  return (
    <div className={`p-2 border-b border-[#1a1a1c] font-mono text-[11px] leading-relaxed flex flex-col ${getLogBg()}`}>
      <div className="flex items-start gap-2">
        {getLogIcon()}
        <span className="text-zinc-600 font-semibold select-none flex-shrink-0">[{log.time}]</span>
        <div className="flex-1 min-w-0">
          {log.args && log.args.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-2 items-center">
                {log.args.map((arg: any, i: number) => {
                  if (arg.isObject) {
                    return (
                      <div key={i} className="w-full mt-1">
                        <button
                          onClick={() => setExpanded(!expanded)}
                          className="flex items-center gap-1 text-[var(--accent)] hover:underline cursor-pointer bg-black/30 hover:bg-black/50 px-1.5 py-0.5 rounded border border-[#2a2a2a] text-[10px]"
                        >
                          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          <span>Object</span>
                        </button>
                        {expanded && (
                          <pre className="mt-1.5 p-2 bg-[#09090b] border border-[#222] rounded overflow-x-auto text-[10px] text-zinc-300 max-h-48 scrollbar-thin whitespace-pre select-text">
                            {arg.value}
                          </pre>
                        )}
                      </div>
                    );
                  }
                  return (
                    <span key={i} className={log.type === "error" ? "text-red-400 font-medium" : log.type === "warn" ? "text-amber-300 font-medium" : "text-zinc-200"}>
                      {arg.value}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <span className={log.type === "error" ? "text-red-400 font-medium" : log.type === "warn" ? "text-amber-300 font-medium" : "text-zinc-200"}>
              {log.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
