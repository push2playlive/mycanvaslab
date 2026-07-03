import React, { useState, useEffect } from "react";
import { Code, Palette, Terminal as TermIcon, Sliders, Shield, Sparkles, FolderOpen, BarChart3, Search, GitBranch, CheckSquare, Eye, EyeOff, LayoutGrid, Menu, ChevronDown } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { VirtualFile, ChatMessage, AIConfig, Template, Snapshot } from "./types";
import { FileExplorer } from "./components/FileExplorer";
import { CodeEditor } from "./components/CodeEditor";
import { LivePreview } from "./components/LivePreview";
import { AIChat } from "./components/AIChat";
import { Gallery } from "./components/Gallery";
import { Terminal } from "./components/Terminal";
import { Settings } from "./components/Settings";
import { CompareModal } from "./components/CompareModal";
import { Dashboard } from "./components/Dashboard";
import { SearchReplacePanel } from "./components/SearchReplacePanel";
import { VersionControl } from "./components/VersionControl";
import { TestingTab } from "./components/TestingTab";

// Seed workspace with a highly polished default starter pack
const INITIAL_FILES: VirtualFile[] = [
  {
    path: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyCanvasLab Workspace</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background: linear-gradient(135deg, #020402 0%, #050a05 100%);
      color: #ecfdf5;
      font-family: sans-serif;
    }
    .neon-glow {
      box-shadow: 0 0 35px rgba(26, 232, 84, 0.15);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-center p-6 text-center">
  <div class="max-w-2xl w-full bg-[#030603]/85 backdrop-blur border border-[#1ae854]/12 p-8 rounded-2xl neon-glow space-y-6">
    <div class="flex justify-center">
      <div class="p-3.5 bg-[#1ae854]/10 border border-[#1ae854]/25 rounded-xl">
        <svg class="h-10 w-10 text-[#1ae854]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
    </div>

    <div class="space-y-2">
      <h1 class="text-3xl font-black tracking-tight text-[#1ae854]">
        MYCANVASLAB WORKSPACE
      </h1>
      <p class="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
        Your virtual playground is loaded. Use our 3-Agent pipeline (Purpose Designer, Code Writer, Finisher) to outline purpose, generate code, and polish typography & interactions.
      </p>
    </div>

    <div class="border-t border-[#1ae854]/12 pt-4 flex justify-center gap-4 text-[10px] text-zinc-500 font-mono">
      <span class="flex items-center gap-1.5 text-[#1ae854]">
        <span class="w-1.5 h-1.5 rounded-full bg-[#1ae854] animate-pulse"></span>
        SANDBOX COMPILER READY
      </span>
      <span>•</span>
      <span>VITE IN-BROWSER</span>
    </div>
  </div>
</body>
</html>`
  },
  {
    path: "style.css",
    content: `/* Workspace CSS Global Directives */
body {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
`
  }
];

export default function App() {
  const [files, setFiles] = useState<VirtualFile[]>(() => {
    const saved = localStorage.getItem("virtual_workspace_files");
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  const [activeFilePath, setActiveFilePath] = useState<string>(() => {
    return files.length > 0 ? files[0].path : "";
  });

  const [activeTab, setActiveTab] = useState<
    "workspace" | "dashboard" | "search" | "vcs" | "testing" | "gallery" | "terminal" | "settings"
  >("workspace");

  const [showGhostDropdown, setShowGhostDropdown] = useState(false);

  // Layout column visibility toggles (3 columns + AI Chat)
  const [showExplorer, setShowExplorer] = useState(true);
  const [showCode, setShowCode] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [showAIChat, setShowAIChat] = useState(true);

  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    return {
      provider: "gemini",
      geminiModel: "gemini-3.5-flash",
      openaiModel: "gpt-4o-mini",
      ollamaUrl: "http://localhost:11434/api/generate",
      ollamaModel: "llama3",
      customGeminiKey: localStorage.getItem("custom_gemini_key") || "",
      customOpenaiKey: localStorage.getItem("custom_openai_key") || "",
    };
  });

  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    const saved = localStorage.getItem("virtual_workspace_snapshots");
    return saved ? JSON.parse(saved) : [];
  });

  // Compare modal hooks
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareMessage, setCompareMessage] = useState<ChatMessage | null>(null);

  // Sync virtual files to localstorage
  useEffect(() => {
    localStorage.setItem("virtual_workspace_files", JSON.stringify(files));
  }, [files]);

  // Sync snapshots to localstorage
  useEffect(() => {
    localStorage.setItem("virtual_workspace_snapshots", JSON.stringify(snapshots));
  }, [snapshots]);

  const handleAddSnapshot = (message: string) => {
    const newSnapshot: Snapshot = {
      id: "snap-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      message,
      files: JSON.parse(JSON.stringify(files)),
    };
    setSnapshots((prev) => [newSnapshot, ...prev]);
  };

  const handleRestoreSnapshot = (snapshot: Snapshot) => {
    setFiles(JSON.parse(JSON.stringify(snapshot.files)));
    if (snapshot.files.length > 0) {
      setActiveFilePath(snapshot.files[0].path);
    }
  };

  // Sync custom keys to localstorage when they change
  const handleChangeConfig = (newConfig: AIConfig) => {
    setAiConfig(newConfig);
    if (newConfig.customGeminiKey) {
      localStorage.setItem("custom_gemini_key", newConfig.customGeminiKey);
    }
    if (newConfig.customOpenaiKey) {
      localStorage.setItem("custom_openai_key", newConfig.customOpenaiKey);
    }
  };

  const handleSelectFile = (path: string) => {
    setActiveFilePath(path);
  };

  const handleCreateFile = (path: string) => {
    const trimmed = path.trim();
    if (!trimmed) return;
    if (files.some((f) => f.path.toLowerCase() === trimmed.toLowerCase())) {
      alert("A file with that name already exists in the workspace.");
      return;
    }
    const newFile: VirtualFile = { path: trimmed, content: "" };
    setFiles((prev) => [...prev, newFile]);
    setActiveFilePath(trimmed);
  };

  const handleDeleteFile = (path: string) => {
    if (path === "index.html") return; // Prevent deleting index.html
    const updated = files.filter((f) => f.path !== path);
    setFiles(updated);
    if (activeFilePath === path) {
      setActiveFilePath(updated.length > 0 ? updated[0].path : "");
    }
  };

  const handleUpdateContent = (content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === activeFilePath ? { ...f, content } : f))
    );
  };

  const handleLoadTemplate = (template: Template) => {
    setFiles(template.files);
    if (template.files.length > 0) {
      setActiveFilePath(template.files[0].path);
    }
    setActiveTab("workspace");
  };

  const handleApplyFilesFromAI = (explanation: string, pendingFiles: VirtualFile[]) => {
    setFiles((current) => {
      const copy = [...current];
      pendingFiles.forEach((pf) => {
        const existingIndex = copy.findIndex((cf) => cf.path === pf.path);
        if (existingIndex > -1) {
          copy[existingIndex] = pf;
        } else {
          copy.push(pf);
        }
      });
      return copy;
    });

    // Automatically set the first modified file as active
    if (pendingFiles.length > 0) {
      setActiveFilePath(pendingFiles[0].path);
    }
  };

  const handleToggleLayout = (mode: "code" | "split" | "preview") => {
    if (mode === "code") {
      setShowCode(true);
      setShowPreview(false);
    } else if (mode === "split") {
      setShowCode(true);
      setShowPreview(true);
    } else if (mode === "preview") {
      setShowCode(false);
      setShowPreview(true);
    }
  };

  const activeFile = files.find((f) => f.path === activeFilePath) || null;

  return (
    <div id="app-root" className="h-screen flex flex-col bg-[#050705] text-[#ecfdf5] overflow-hidden font-sans">
      {/* Workspace Primary Header */}
      <header className="px-6 py-3.5 bg-zinc-950/80 backdrop-blur border-b border-[#1ae854]/12 flex flex-col md:flex-row items-center justify-between gap-4 select-none flex-shrink-0 z-10">
        {/* Logo and build tag */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#1ae854]/10 border border-[#1ae854]/20 rounded-xl shadow-lg shadow-[#1ae854]/5">
            <Sparkles className="h-4.5 w-4.5 text-[#1ae854] animate-pulse-soft" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-widest text-[#1ae854]">
                MYCANVASLAB AI
              </span>
              <span className="text-[9px] bg-[#1ae854]/10 text-[#1ae854] px-1.5 py-0.2 rounded border border-[#1ae854]/20 font-mono font-bold tracking-wider">
                PIPELINE V2.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">3-Agent pipeline (Purpose Designer, Code Writer, Finisher)</p>
          </div>
        </div>

        {/* Workspace Navigation Tabs with green highlights & ghost hamburger dropdown */}
        <nav className="flex items-center gap-1.5 p-1 bg-zinc-950/60 rounded-xl border border-[#1ae854]/12 shrink-0 relative select-none">
          <button
            onClick={() => {
              setActiveTab("workspace");
              setShowGhostDropdown(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
              activeTab === "workspace"
                ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm shadow-[#1ae854]/10"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Workspace
          </button>

          {/* Ghost hamburger dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowGhostDropdown(!showGhostDropdown)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap border ${
                activeTab !== "workspace"
                  ? "bg-[#1ae854]/15 text-[#1ae854] border-[#1ae854]/35"
                  : "bg-transparent text-zinc-500 hover:text-zinc-300 border-transparent hover:bg-zinc-900/40"
              }`}
            >
              <Menu className="h-3.5 w-3.5" />
              <span>{activeTab === "workspace" ? "Lab Extras" : activeTab.toUpperCase()}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {showGhostDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#020502]/95 border border-[#1ae854]/25 shadow-2xl shadow-black p-1.5 z-50 space-y-0.5">
                <div className="px-2.5 py-1 text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-b border-[#1ae854]/10 mb-1">
                  Lab Extras & Tools
                </div>
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setShowGhostDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                    activeTab === "dashboard"
                      ? "bg-[#1ae854]/10 text-[#1ae854]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1ae854]/5"
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5 text-[#1ae854]" />
                  <span>Admin Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("search");
                    setShowGhostDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                    activeTab === "search"
                      ? "bg-[#1ae854]/10 text-[#1ae854]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1ae854]/5"
                  }`}
                >
                  <Search className="h-3.5 w-3.5 text-sky-400" />
                  <span>Find & Replace</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("vcs");
                    setShowGhostDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                    activeTab === "vcs"
                      ? "bg-[#1ae854]/10 text-[#1ae854]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1ae854]/5"
                  }`}
                >
                  <GitBranch className="h-3.5 w-3.5 text-purple-400" />
                  <span>Git VCS Sandbox</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("testing");
                    setShowGhostDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                    activeTab === "testing"
                      ? "bg-[#1ae854]/10 text-[#1ae854]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1ae854]/5"
                  }`}
                >
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Testing Suite</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("gallery");
                    setShowGhostDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                    activeTab === "gallery"
                      ? "bg-[#1ae854]/10 text-[#1ae854]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1ae854]/5"
                  }`}
                >
                  <Palette className="h-3.5 w-3.5 text-pink-400" />
                  <span>Templates Gallery</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("terminal");
                    setShowGhostDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                    activeTab === "terminal"
                      ? "bg-[#1ae854]/10 text-[#1ae854]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1ae854]/5"
                  }`}
                >
                  <TermIcon className="h-3.5 w-3.5 text-yellow-400" />
                  <span>Terminal Console</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("settings");
                    setShowGhostDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                    activeTab === "settings"
                      ? "bg-[#1ae854]/10 text-[#1ae854]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1ae854]/5"
                  }`}
                >
                  <Sliders className="h-3.5 w-3.5 text-zinc-400" />
                  <span>AI Credentials</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Global indicators in Green */}
        <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono text-[#1ae854]/80">
          <span className="flex items-center gap-1.5 bg-[#1ae854]/10 border border-[#1ae854]/25 px-2 py-1 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1ae854] animate-pulse"></span>
            PORT 3000 ACTIVE
          </span>
          <span className="flex items-center gap-1.5 text-zinc-500">
            <Shield className="h-3.5 w-3.5 text-zinc-600" />
            SECURE CONTAINER
          </span>
        </div>
      </header>

      {/* Sub-Header Workspace Column Layout Toolbar */}
      {activeTab === "workspace" && (
        <div className="px-6 py-2 bg-zinc-950/40 border-b border-[#1ae854]/12 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none flex-shrink-0 z-10">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-3.5 w-3.5 text-[#1ae854]" />
            <span className="text-[10px] font-black tracking-wider uppercase text-zinc-400">LAYOUT MANAGER:</span>
            <span className="text-[9px] font-mono text-zinc-600 bg-black/60 px-1.5 py-0.5 rounded border border-[#1ae854]/10">
              3 Columns + Side Agent
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Direct Preset Toggles */}
            <button
              onClick={() => {
                setShowExplorer(true);
                setShowCode(true);
                setShowPreview(true);
                setShowAIChat(false);
              }}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-zinc-800 bg-black/40 text-zinc-400 hover:text-[#1ae854] hover:border-[#1ae854]/30 transition"
              title="Focus exclusively on the 3 primary development columns"
            >
              📐 3 Columns Layout
            </button>
            <button
              onClick={() => {
                setShowExplorer(true);
                setShowCode(true);
                setShowPreview(true);
                setShowAIChat(true);
              }}
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-zinc-800 bg-black/40 text-zinc-400 hover:text-[#1ae854] hover:border-[#1ae854]/30 transition"
              title="Show all sections including the AI Pipeline assistant"
            >
              🖥️ Show All Columns
            </button>

            <span className="text-zinc-700 mx-1">|</span>

            {/* Individual Toggles with hot green indicators */}
            <button
              onClick={() => setShowExplorer(!showExplorer)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition border ${
                showExplorer
                  ? "bg-[#1ae854]/10 text-[#1ae854] border-[#1ae854]/25"
                  : "bg-black/20 text-zinc-500 border-zinc-900"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${showExplorer ? "bg-[#1ae854]" : "bg-zinc-700"}`} />
              Explorer Tree
            </button>

            {/* Center Panel Layout Mode Toggles */}
            <div className="flex items-center gap-0.5 bg-black/60 p-0.5 rounded-lg border border-zinc-800">
              <button
                onClick={() => handleToggleLayout("code")}
                className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  showCode && !showPreview
                    ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                📝 Code
              </button>
              <button
                onClick={() => handleToggleLayout("split")}
                className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  showCode && showPreview
                    ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                ↔️ Split
              </button>
              <button
                onClick={() => handleToggleLayout("preview")}
                className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  !showCode && showPreview
                    ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                👁️ Preview
              </button>
            </div>

            <button
              onClick={() => setShowAIChat(!showAIChat)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition border ${
                showAIChat
                  ? "bg-[#1ae854]/10 text-[#1ae854] border-[#1ae854]/25"
                  : "bg-black/20 text-zinc-500 border-zinc-900"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${showAIChat ? "bg-[#1ae854]" : "bg-zinc-700"}`} />
              AI Chat
            </button>
          </div>
        </div>
      )}

      {/* Main Sandbox Canvas Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === "workspace" && (
          <div className="flex-1 flex overflow-hidden">
            <Group orientation="horizontal" className="flex-1 h-full w-full">
              {/* Column 1: AI Proxy Chat Pilot Pipeline Sidebar (Leftmost) */}
              {showAIChat && (
                <>
                  <Panel id="panel-ai-chat" defaultSize="25%" minSize="15%" maxSize="45%">
                    <div className="w-full h-full flex z-10">
                      <AIChat
                        files={files}
                        config={aiConfig}
                        onChangeConfig={handleChangeConfig}
                        onApplyFiles={handleApplyFilesFromAI}
                        onOpenCompare={(msg) => {
                          setCompareMessage(msg);
                          setCompareOpen(true);
                        }}
                      />
                    </div>
                  </Panel>
                  {(showExplorer || showCode || showPreview) && (
                    <Separator className="group w-1.5 bg-[#020502]/40 hover:bg-[#1ae854]/10 active:bg-[#1ae854]/20 cursor-col-resize transition-all select-none relative flex items-center justify-center self-stretch">
                      <div className="w-[1.5px] h-full bg-[#1ae854]/12 group-hover:bg-[#1ae854]/40 group-active:bg-[#1ae854]/70 transition-colors" />
                    </Separator>
                  )}
                </>
              )}

              {/* Column 2: File Explorer Tree */}
              {showExplorer && (
                <>
                  <Panel id="panel-explorer" defaultSize="15%" minSize="10%" maxSize="30%">
                    <div className="w-full h-full flex bg-[#020502]/20 border-r border-[#1ae854]/12">
                      <FileExplorer
                        files={files}
                        activeFilePath={activeFilePath}
                        onSelectFile={handleSelectFile}
                        onCreateFile={handleCreateFile}
                        onDeleteFile={handleDeleteFile}
                      />
                    </div>
                  </Panel>
                  {(showCode || showPreview) && (
                    <Separator className="group w-1.5 bg-[#020502]/40 hover:bg-[#1ae854]/10 active:bg-[#1ae854]/20 cursor-col-resize transition-all select-none relative flex items-center justify-center self-stretch">
                      <div className="w-[1.5px] h-full bg-[#1ae854]/12 group-hover:bg-[#1ae854]/40 group-active:bg-[#1ae854]/70 transition-colors" />
                    </Separator>
                  )}
                </>
              )}

              {/* Column 3: Code Editor Page */}
              {showCode && (
                <>
                  <Panel id="panel-code" defaultSize="35%" minSize="20%">
                    <div className="w-full h-full flex flex-col border-r border-[#1ae854]/12">
                      <CodeEditor
                        activeFile={activeFile}
                        onUpdateContent={handleUpdateContent}
                        showCode={showCode}
                        showPreview={showPreview}
                        onToggleLayout={handleToggleLayout}
                      />
                    </div>
                  </Panel>
                  {showPreview && (
                    <Separator className="group w-1.5 bg-[#020502]/40 hover:bg-[#1ae854]/10 active:bg-[#1ae854]/20 cursor-col-resize transition-all select-none relative flex items-center justify-center self-stretch">
                      <div className="w-[1.5px] h-full bg-[#1ae854]/12 group-hover:bg-[#1ae854]/40 group-active:bg-[#1ae854]/70 transition-colors" />
                    </Separator>
                  )}
                </>
              )}

              {/* Column 4: Live Preview Web Sandbox Section (Rightmost) */}
              {showPreview && (
                <Panel id="panel-preview" defaultSize="25%" minSize="15%">
                  <div className="w-full h-full flex bg-black/40">
                    <LivePreview
                      files={files}
                      showCode={showCode}
                      showPreview={showPreview}
                      onToggleLayout={handleToggleLayout}
                    />
                  </div>
                </Panel>
              )}
            </Group>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#020402]">
            <div className="max-w-5xl mx-auto">
              <Dashboard files={files} config={aiConfig} onChangeConfig={handleChangeConfig} />
            </div>
          </div>
        )}

        {activeTab === "search" && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#020402]">
            <div className="max-w-5xl mx-auto">
              <SearchReplacePanel files={files} onUpdateFiles={setFiles} />
            </div>
          </div>
        )}

        {activeTab === "vcs" && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#020402]">
            <div className="max-w-5xl mx-auto">
              <VersionControl
                files={files}
                snapshots={snapshots}
                onAddSnapshot={handleAddSnapshot}
                onRestoreSnapshot={handleRestoreSnapshot}
              />
            </div>
          </div>
        )}

        {activeTab === "testing" && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#020402]">
            <div className="max-w-5xl mx-auto">
              <TestingTab files={files} />
            </div>
          </div>
        )}

        {activeTab === "gallery" && (
          <div className="flex-1 overflow-hidden bg-[#020402]">
            <Gallery onLoadTemplate={handleLoadTemplate} />
          </div>
        )}

        {activeTab === "terminal" && (
          <div className="flex-1 overflow-hidden">
            <Terminal />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex-1 overflow-hidden bg-[#020402]">
            <Settings config={aiConfig} onChangeConfig={handleChangeConfig} />
          </div>
        )}
      </main>

      {/* proposed file merge diff compare modal */}
      {compareMessage && compareMessage.pendingFiles && (
        <CompareModal
          isOpen={compareOpen}
          onClose={() => {
            setCompareOpen(false);
            setCompareMessage(null);
          }}
          pendingFiles={compareMessage.pendingFiles}
          currentFiles={files}
          onApply={() => {
            if (compareMessage.pendingFiles) {
              handleApplyFilesFromAI(compareMessage.message, compareMessage.pendingFiles);
              // Mark applied
              compareMessage.applied = true;
            }
          }}
        />
      )}
    </div>
  );
}
