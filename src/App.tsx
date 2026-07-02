import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  FolderOpen, 
  Sparkles, 
  LayoutGrid, 
  Settings as SettingsIcon, 
  Github, 
  Database, 
  Eye, 
  Layout, 
  RotateCw, 
  Check, 
  Code,
  Globe,
  Download,
  Monitor,
  Smartphone,
  Laptop,
  Info,
  X,
  Share,
  PlusSquare,
  BarChart2,
  Beaker,
  Search
} from "lucide-react";
import FileExplorer from "./components/FileExplorer";
import CodeEditor from "./components/CodeEditor";
import LivePreview from "./components/LivePreview";
import AIChat from "./components/AIChat";
import Gallery from "./components/Gallery";
import SettingsPanel from "./components/Settings";
import Terminal from "./components/Terminal";
import Dashboard from "./components/Dashboard";
import TestingTab from "./components/TestingTab";
import SearchReplacePanel from "./components/SearchReplacePanel";
import { DEFAULT_FILES } from "./data/templates";
import { VirtualFile, SidebarTab, GalleryTemplate, TerminalTheme } from "./types";

export default function App() {
  const [files, setFiles] = useState<VirtualFile[]>(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState<string>("src/App.tsx");
  const [openTabs, setOpenTabs] = useState<string[]>(["src/App.tsx", "index.html"]);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("explorer");
  const [triggerCompile, setTriggerCompile] = useState(false);
  const [accentColor, setAccentColor] = useState("green");
  const [activeTemplateId, setActiveTemplateId] = useState<string>("nova-dashboard");
  const [terminalTheme, setTerminalTheme] = useState<TerminalTheme>("neon");
  const [activeLineNum, setActiveLineNum] = useState<number | undefined>(undefined);

  // PWA Standalone installer states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
      const isStandaloneNavigator = (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMedia || isStandaloneNavigator);
    };

    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User responded to PWA installation dialog: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  // Accent color mapping for UI borders/buttons
  const accentClasses: Record<string, { border: string; text: string; bg: string; fill: string }> = {
    orange: { 
      border: "border-[#F27D26]", 
      text: "text-[#F27D26]", 
      bg: "bg-[#F27D26] hover:opacity-90 text-zinc-950", 
      fill: "fill-[#F27D26]" 
    },
    cyan: { 
      border: "border-cyan-400", 
      text: "text-cyan-400", 
      bg: "bg-cyan-500 hover:bg-cyan-400 text-zinc-950", 
      fill: "fill-cyan-400" 
    },
    purple: { 
      border: "border-purple-500", 
      text: "text-purple-500", 
      bg: "bg-purple-600 hover:bg-purple-500 text-white", 
      fill: "fill-purple-500" 
    },
    emerald: { 
      border: "border-emerald-500", 
      text: "text-emerald-500", 
      bg: "bg-emerald-600 hover:bg-emerald-500 text-zinc-950", 
      fill: "fill-emerald-500" 
    },
    green: {
      border: "border-[#079C3C]",
      text: "text-[#079C3C]",
      bg: "bg-[#079C3C] hover:opacity-90 text-white",
      fill: "fill-[#079C3C]"
    }
  };

  const colorVariables: Record<string, { accent: string; accentGlow: string; bgHover: string; textOnAccent: string }> = {
    orange: {
      accent: "#F27D26",
      accentGlow: "rgba(242, 125, 38, 0.15)",
      bgHover: "rgba(242, 125, 38, 0.08)",
      textOnAccent: "#09090b",
    },
    cyan: {
      accent: "#22d3ee",
      accentGlow: "rgba(34, 211, 238, 0.15)",
      bgHover: "rgba(34, 211, 238, 0.08)",
      textOnAccent: "#09090b",
    },
    purple: {
      accent: "#a855f7",
      accentGlow: "rgba(168, 85, 247, 0.15)",
      bgHover: "rgba(168, 85, 247, 0.08)",
      textOnAccent: "#ffffff",
    },
    emerald: {
      accent: "#10b981",
      accentGlow: "rgba(16, 185, 129, 0.15)",
      bgHover: "rgba(16, 185, 129, 0.08)",
      textOnAccent: "#09090b",
    },
    green: {
      accent: "#079C3C", // Main requested green
      accentGlow: "rgba(11, 144, 50, 0.25)", // Dark transparent green (#0B9032)
      bgHover: "rgba(7, 156, 60, 0.1)",
      textOnAccent: "#ffffff",
    },
  };

  const vars = colorVariables[accentColor] || colorVariables.orange;
  const style = {
    "--accent": vars.accent,
    "--accent-glow": vars.accentGlow,
    "--accent-bg-hover": vars.bgHover,
    "--accent-text": vars.textOnAccent,
  } as React.CSSProperties;

  const activeAccent = accentClasses[accentColor] || accentClasses.orange;

  // File explorer actions
  const handleSelectFile = (path: string) => {
    setActiveFile(path);
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [...prev, path]);
    }
  };

  const handleCloseTab = (path: string) => {
    const nextTabs = openTabs.filter((t) => t !== path);
    setOpenTabs(nextTabs);

    if (activeFile === path && nextTabs.length > 0) {
      setActiveFile(nextTabs[nextTabs.length - 1]);
    }
  };

  const handleCreateFile = (path: string) => {
    // Prevent duplicates
    if (files.some((f) => f.path === path)) return;

    const newFile: VirtualFile = {
      path,
      content: path.endsWith(".html") 
        ? `<!DOCTYPE html><html><body><div id="root"></div></body></html>`
        : `import React from "react";\n\nexport default function Component() {\n  return <div>New Canvas Component</div>;\n}`,
    };

    setFiles((prev) => [...prev, newFile]);
    handleSelectFile(path);
  };

  const handleDeleteFile = (path: string) => {
    setFiles((prev) => prev.filter((f) => f.path !== path));
    handleCloseTab(path);
  };

  const handleCodeChange = (path: string, code: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === path ? { ...f, content: code } : f))
    );
  };

  // Compile Trigger
  const handleRunCode = () => {
    setTriggerCompile(true);
  };

  // Load a complete project from Gallery
  const handleLoadTemplate = (template: GalleryTemplate) => {
    setFiles(template.files);
    setActiveTemplateId(template.id);
    
    // Auto open main entry point
    const mainFile = template.files.some((f) => f.path === "src/main.tsx") ? "src/main.tsx" : "src/App.tsx";
    setActiveFile(mainFile);
    setOpenTabs([mainFile, "index.html"]);
    setTriggerCompile(true);
  };

  // Ingest generated files from AI assistant
  const handleApplyAIFiles = (explanation: string, generatedFiles: VirtualFile[]) => {
    setFiles((prev) => {
      const updated = [...prev];
      generatedFiles.forEach((newFile) => {
        const idx = updated.findIndex((f) => f.path === newFile.path);
        if (idx !== -1) {
          updated[idx] = newFile;
        } else {
          updated.push(newFile);
        }
      });
      return updated;
    });

    // Auto-select the first updated file
    if (generatedFiles.length > 0) {
      handleSelectFile(generatedFiles[0].path);
    }
    
    // Trigger Sandbox compiling
    setTriggerCompile(true);
  };

  return (
    <div style={style} className="h-screen w-screen bg-[#0d0d0d] text-gray-300 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Dynamic Shell Header */}
      <header className="h-12 border-b border-[#2a2a2a] bg-[#141414] px-4 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-[var(--accent)] rounded flex items-center justify-center text-[var(--accent-text)] font-bold text-xs">M</div>
            <span className="font-semibold text-white tracking-tight text-sm">MyCanvasLab</span>
          </div>
          <div className="h-4 w-[1px] bg-[#2a2a2a] hidden sm:block"></div>
          <div className="hidden sm:flex items-center space-x-2 text-[10px] uppercase tracking-widest text-gray-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Ollama Local: v0.1.32</span>
          </div>
        </div>

        {/* Status Indicators / Actions bar */}
        <div className="flex items-center space-x-3">
          {/* Display Mode Indicator or Standalone Button */}
          {isStandalone ? (
            <div className="px-2 py-1 bg-emerald-950/30 border border-emerald-500/40 text-emerald-400 rounded text-[10px] flex items-center space-x-1 font-mono font-bold uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <Laptop className="h-3 w-3" />
              <span>Standalone App</span>
            </div>
          ) : (
            <button 
              onClick={handleInstallClick}
              className="px-2.5 py-1 bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-300 hover:text-white hover:border-[var(--accent)]/40 text-[10px] font-bold rounded uppercase hover:bg-zinc-800 transition duration-150 cursor-pointer flex items-center space-x-1 font-mono"
              title="Run as Standalone App / PWA Install"
            >
              <Download className="h-3.5 w-3.5 text-[var(--accent)] animate-bounce" />
              <span>Install Standalone</span>
            </button>
          )}

          <div className="px-2 py-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[10px] flex items-center space-x-1 font-mono">
            <span className="text-gray-500 uppercase">Branch:</span>
            <span className="text-[var(--accent)] font-bold">main</span>
          </div>
          <button 
            onClick={handleRunCode}
            className="px-3 py-1 bg-[var(--accent)] text-[var(--accent-text)] text-[11px] font-bold rounded uppercase hover:opacity-90 transition duration-150 cursor-pointer"
          >
            Deploy App
          </button>
        </div>
      </header>

      {/* Main IDE grid layout */}
      <div className="flex-1 flex overflow-hidden w-full bg-[#0d0d0d]">
        
        {/* Navigation Rail & Sidebar Panel (Pane 1) */}
        <div className="w-[360px] flex border-r border-[#2a2a2a] bg-[#141414] flex-shrink-0">
          
          {/* Navigation rail icons (Left Rail) */}
          <div className="w-[64px] border-r border-[#2a2a2a] bg-[#141414]/50 flex flex-col items-center py-4 justify-between h-full flex-shrink-0">
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setSidebarTab("explorer")}
                className={`p-3 rounded-xl transition cursor-pointer relative ${
                  sidebarTab === "explorer"
                    ? `text-[var(--accent)] bg-[#1a1a1a]`
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]/40"
                }`}
                title="Workspace Explorer"
              >
                <FolderOpen className="h-5 w-5" />
                {sidebarTab === "explorer" && (
                  <span className="absolute left-0 top-1/3 bottom-1/3 w-[2px] bg-[var(--accent)] rounded-r"></span>
                )}
              </button>

              <button
                onClick={() => setSidebarTab("search")}
                className={`p-3 rounded-xl transition cursor-pointer relative ${
                  sidebarTab === "search"
                    ? `text-[var(--accent)] bg-[#1a1a1a]`
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]/40"
                }`}
                title="Global Search & Replace"
              >
                <Search className="h-5 w-5" />
                {sidebarTab === "search" && (
                  <span className="absolute left-0 top-1/3 bottom-1/3 w-[2px] bg-[var(--accent)] rounded-r"></span>
                )}
              </button>

              <button
                onClick={() => setSidebarTab("agent")}
                className={`p-3 rounded-xl transition cursor-pointer relative ${
                  sidebarTab === "agent"
                    ? `text-[var(--accent)] bg-[#1a1a1a]`
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]/40"
                }`}
                title="Gemini AI Coding Assistant"
              >
                <Sparkles className="h-5 w-5" />
                {sidebarTab === "agent" && (
                  <span className="absolute left-0 top-1/3 bottom-1/3 w-[2px] bg-[var(--accent)] rounded-r"></span>
                )}
              </button>

              <button
                onClick={() => setSidebarTab("gallery")}
                className={`p-3 rounded-xl transition cursor-pointer relative ${
                  sidebarTab === "gallery"
                    ? `text-[var(--accent)] bg-[#1a1a1a]`
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]/40"
                }`}
                title="Canvases Gallery"
              >
                <LayoutGrid className="h-5 w-5" />
                {sidebarTab === "gallery" && (
                  <span className="absolute left-0 top-1/3 bottom-1/3 w-[2px] bg-[var(--accent)] rounded-r"></span>
                )}
              </button>

              <button
                onClick={() => setSidebarTab("dashboard")}
                className={`p-3 rounded-xl transition cursor-pointer relative ${
                  sidebarTab === "dashboard"
                    ? `text-[var(--accent)] bg-[#1a1a1a]`
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]/40"
                }`}
                title="Project Statistics Dashboard"
              >
                <BarChart2 className="h-5 w-5" />
                {sidebarTab === "dashboard" && (
                  <span className="absolute left-0 top-1/3 bottom-1/3 w-[2px] bg-[var(--accent)] rounded-r"></span>
                )}
              </button>

              <button
                onClick={() => setSidebarTab("testing")}
                className={`p-3 rounded-xl transition cursor-pointer relative ${
                  sidebarTab === "testing"
                    ? `text-[var(--accent)] bg-[#1a1a1a]`
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]/40"
                }`}
                title="Vitest Unit Testing"
              >
                <Beaker className="h-5 w-5" />
                {sidebarTab === "testing" && (
                  <span className="absolute left-0 top-1/3 bottom-1/3 w-[2px] bg-[var(--accent)] rounded-r"></span>
                )}
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setSidebarTab("settings")}
                className={`p-3 rounded-xl transition cursor-pointer relative ${
                  sidebarTab === "settings"
                    ? `text-[var(--accent)] bg-[#1a1a1a]`
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1a1a]/40"
                }`}
                title="IDE Settings"
              >
                <SettingsIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Wider dynamic drawer panels (Left Sidebar contents) */}
          <div className="flex-1 overflow-hidden h-full bg-[#141414]">
            {sidebarTab === "explorer" && (
              <FileExplorer
                files={files}
                activeFile={activeFile}
                onSelectFile={(path) => {
                  handleSelectFile(path);
                  setActiveLineNum(undefined);
                }}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
              />
            )}

            {sidebarTab === "search" && (
              <SearchReplacePanel
                files={files}
                onSelectFile={handleSelectFile}
                onCodeChange={handleCodeChange}
                onNavigateToSnippet={(path, lineNum) => {
                  handleSelectFile(path);
                  setActiveLineNum(lineNum);
                }}
                accentColor={vars.accent}
              />
            )}

            {sidebarTab === "agent" && (
              <AIChat
                files={files}
                onApplyFiles={handleApplyAIFiles}
                accentColor={accentColor}
              />
            )}

            {sidebarTab === "gallery" && (
              <Gallery
                onLoadTemplate={handleLoadTemplate}
                activeTemplateId={activeTemplateId}
              />
            )}

            {sidebarTab === "settings" && (
              <SettingsPanel
                accentColor={accentColor}
                onAccentColorChange={(color) => setAccentColor(color)}
                terminalTheme={terminalTheme}
                onTerminalThemeChange={(theme) => setTerminalTheme(theme)}
              />
            )}

            {sidebarTab === "dashboard" && (
              <Dashboard
                files={files}
                onSelectFile={handleSelectFile}
                onClose={() => setSidebarTab("explorer")}
              />
            )}

            {sidebarTab === "testing" && (
              <TestingTab
                files={files}
                activeFile={activeFile}
                onSelectFile={handleSelectFile}
                onCodeChange={handleCodeChange}
                onCreateFile={handleCreateFile}
                accentColor={accentColor}
              />
            )}
          </div>
        </div>

        {/* 3-Pane Center (Code Editor) and Right (Live Preview) Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 h-full overflow-hidden bg-[#0d0d0d]">
          
          {/* Pane 2: Syntax Code Editor */}
          <div className="h-full overflow-hidden flex flex-col bg-[#141414]">
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <CodeEditor
                files={files}
                activeFile={activeFile}
                openTabs={openTabs}
                onSelectFile={(path) => {
                  handleSelectFile(path);
                  setActiveLineNum(undefined);
                }}
                onCloseTab={handleCloseTab}
                onCodeChange={handleCodeChange}
                onRunCode={handleRunCode}
                highlightedLine={activeLineNum}
              />
            </div>
            <Terminal
              files={files}
              onSelectFile={handleSelectFile}
              onRunCode={handleRunCode}
              theme={terminalTheme}
            />
          </div>

          {/* Pane 3: Sandboxed Compiler Live Preview */}
          <div className="h-full overflow-hidden flex flex-col border-l border-[#2a2a2a] bg-[#141414]">
            <LivePreview
              files={files}
              activeFile={activeFile}
              triggerCompile={triggerCompile}
              onResetTrigger={() => setTriggerCompile(false)}
            />
          </div>

        </div>

      </div>

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition duration-150 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-[var(--accent-glow)] text-[var(--accent)] rounded-xl">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Install Standalone App</h3>
                <p className="text-xs text-gray-500">Run MyCanvasLab as a high-performance native desktop/mobile app.</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Desktop Section */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                  <Monitor className="h-4 w-4 text-[var(--accent)]" />
                  <span>Desktop (Chrome, Edge, Brave, Opera)</span>
                </div>
                <p className="text-xs text-gray-400 pl-6 leading-relaxed">
                  Click the <span className="text-[var(--accent)] font-bold">Install</span> icon in the address bar (typically top-right in your URL bar), or authorize the browser prompt from this page.
                </p>
              </div>

              {/* iOS Safari Section */}
              <div className="space-y-2 border-t border-[#2a2a2a] pt-4">
                <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                  <Smartphone className="h-4 w-4 text-[var(--accent)]" />
                  <span>Apple iOS (Safari Browser)</span>
                </div>
                <div className="text-xs text-gray-400 pl-6 space-y-1.5 leading-relaxed">
                  <p>Safari on iPhone/iPad does not support one-click installer prompts. To install:</p>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1">
                    <li>Tap the <span className="inline-flex items-center text-white bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#2a2a2a] font-medium"><Share className="h-3 w-3 mr-1 text-sky-400" /> Share</span> icon in Safari's toolbar.</li>
                    <li>Scroll down and tap <span className="inline-flex items-center text-white bg-[#1a1a1a] px-1.5 py-0.5 rounded border border-[#2a2a2a] font-medium"><PlusSquare className="h-3 w-3 mr-1 text-[var(--accent)]" /> Add to Home Screen</span>.</li>
                    <li>Launch it directly from your iPhone/iPad Home Screen for a native standalone window!</li>
                  </ol>
                </div>
              </div>

              {/* Android Section */}
              <div className="space-y-2 border-t border-[#2a2a2a] pt-4">
                <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                  <Globe className="h-4 w-4 text-[var(--accent)]" />
                  <span>Google Android (Chrome, Firefox)</span>
                </div>
                <p className="text-xs text-gray-400 pl-6 leading-relaxed">
                  Tap the three-dots menu icon, tap <span className="text-[var(--accent)] font-bold">"Add to Home screen"</span> or <span className="text-[var(--accent)] font-bold">"Install App"</span>, and follow the simple on-screen instructions.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#2a2a2a] flex justify-end">
              <button
                onClick={() => setShowInstallGuide(false)}
                className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-text)] text-xs font-bold rounded uppercase hover:opacity-90 transition duration-150 cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
