import React, { useState, useEffect } from "react";
import { Code, Palette, Terminal as TermIcon, Sliders, Shield, Sparkles, FolderOpen, BarChart3, Search, GitBranch, CheckSquare, Eye, EyeOff, LayoutGrid, Menu, ChevronDown, User, CreditCard, FolderDown, HelpCircle, Share2, Copy, ExternalLink, Trash2, RefreshCw } from "lucide-react";
import { Group, Panel, Separator } from "react-resizable-panels";
import JSZip from "jszip";
import { VirtualFile, ChatMessage, AIConfig, Template, Snapshot, LogMessage } from "./types";
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
import { MembersSpace } from "./components/MembersSpace";
import PricingPage from "./components/PricingPage";
import { KeyboardShortcutManager } from "./components/KeyboardShortcutManager";
import { LegalAndInstructions } from "./components/LegalAndInstructions";
import { LogsOverlay } from "./components/LogsOverlay";

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

export interface ShareLink {
  id: string;
  url: string;
  timestamp: string;
  fileCount: number;
}

export default function App() {
  const [files, setFiles] = useState<VirtualFile[]>(() => {
    const saved = localStorage.getItem("virtual_workspace_files");
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  const [activeFilePath, setActiveFilePath] = useState<string>(() => {
    return files.length > 0 ? files[0].path : "";
  });

  const [activeTab, setActiveTab] = useState<
    "workspace" | "dashboard" | "search" | "vcs" | "testing" | "gallery" | "terminal" | "settings" | "members" | "pricing"
  >("workspace");

  const [showGhostDropdown, setShowGhostDropdown] = useState(false);

  // Layout column visibility toggles (3 columns + AI Chat)
  const [showExplorer, setShowExplorer] = useState(true);
  const [showCode, setShowCode] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [showAIChat, setShowAIChat] = useState(true);

  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const defaultAgents = {
      ollamaAgent1Name: "Ollama Coder",
      ollamaAgent1Url: "http://localhost:11434/api/generate",
      ollamaAgent1Model: "codellama",
      ollamaAgent2Name: "Ollama Designer",
      ollamaAgent2Url: "http://localhost:11434/api/generate",
      ollamaAgent2Model: "llama3",
      ollamaAgent3Name: "Ollama Reviewer",
      ollamaAgent3Url: "http://localhost:11434/api/generate",
      ollamaAgent3Model: "mistral",
      ollamaAgent4Name: "Ollama Architect",
      ollamaAgent4Url: "http://localhost:11434/api/generate",
      ollamaAgent4Model: "phi3",
      ollamaAgent5Name: "Ollama Writer",
      ollamaAgent5Url: "http://localhost:11434/api/generate",
      ollamaAgent5Model: "gemma2",
      ollamaAgent6Name: "Ollama Assistant",
      ollamaAgent6Url: "http://localhost:11434/api/generate",
      ollamaAgent6Model: "qwen2",
    };
    const savedConfig = localStorage.getItem("mycanvaslab_ai_config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        return {
          provider: "gemini",
          geminiModel: "gemini-3.5-flash",
          ollamaUrl: "http://localhost:11434/api/generate",
          ollamaModel: "llama3",
          customGeminiKey: localStorage.getItem("custom_gemini_key") || "",
          ...defaultAgents,
          ...parsed,
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      provider: "gemini",
      geminiModel: "gemini-3.5-flash",
      ollamaUrl: "http://localhost:11434/api/generate",
      ollamaModel: "llama3",
      customGeminiKey: localStorage.getItem("custom_gemini_key") || "",
      ...defaultAgents,
    };
  });

  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    const saved = localStorage.getItem("virtual_workspace_snapshots");
    return saved ? JSON.parse(saved) : [];
  });

  // Compare modal hooks
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareMessage, setCompareMessage] = useState<ChatMessage | null>(null);

  const [showLegalModal, setShowLegalModal] = useState(false);

  // Capture sandbox logs transmitted from frame message channel
  const [sandboxLogs, setSandboxLogs] = useState<LogMessage[]>([]);

  useEffect(() => {
    const handleSandboxMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "SANDBOX_CONSOLE_LOG") {
        const { logType, message, timestamp } = event.data;
        setSandboxLogs((prev) => [
          ...prev,
          { logType: logType as any, message, timestamp },
        ]);
      }
    };

    window.addEventListener("message", handleSandboxMessage);
    return () => {
      window.removeEventListener("message", handleSandboxMessage);
    };
  }, []);

  // Sharing & Deployment states
  const [sharedLinks, setSharedLinks] = useState<ShareLink[]>(() => {
    const saved = localStorage.getItem("mycanvaslab_shared_links");
    return saved ? JSON.parse(saved) : [];
  });
  const [isSharing, setIsSharing] = useState(false);
  const [latestShareUrl, setLatestShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const isFirstRender = React.useRef(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>("saved");

  // Sync virtual files to localstorage (debounced for performance and 60fps typing)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSaveStatus("saving");

    const timer = setTimeout(() => {
      localStorage.setItem("virtual_workspace_files", JSON.stringify(files));
      setSaveStatus("saved");
      console.log("[MyCanvasLab] Auto-saved workspace files to localStorage.");
    }, 5000);

    return () => clearTimeout(timer);
  }, [files]);

  // Sync files immediately on beforeunload to prevent data loss on accidental refreshes/navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("virtual_workspace_files", JSON.stringify(files));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
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
    localStorage.setItem("mycanvaslab_ai_config", JSON.stringify(newConfig));
    if (newConfig.customGeminiKey) {
      localStorage.setItem("custom_gemini_key", newConfig.customGeminiKey);
    }
  };

  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const handleDownloadZip = async () => {
    if (isZipping) return;
    setIsZipping(true);
    setZipSuccess(false);
    try {
      const zip = new JSZip();
      files.forEach((file) => {
        zip.file(file.path, file.content);
      });
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mycanvaslab-workspace.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to compile ZIP workspace", err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleShareProject = async () => {
    if (isSharing) return;
    setIsSharing(true);
    setLatestShareUrl(null);
    setShowShareModal(true);
    setCopySuccess(false);

    try {
      // Simulate real API deployment call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockId = "share-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const mockUrl = `https://mycanvaslab-sandbox.live/share/${mockId}`;
      
      const newShare: ShareLink = {
        id: mockId,
        url: mockUrl,
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString().substring(0, 5),
        fileCount: files.length,
      };

      const updated = [newShare, ...sharedLinks];
      setSharedLinks(updated);
      localStorage.setItem("mycanvaslab_shared_links", JSON.stringify(updated));
      setLatestShareUrl(mockUrl);
    } catch (err) {
      console.error("Failed to generate shareable link", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeleteShareLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sharedLinks.filter((link) => link.id !== id);
    setSharedLinks(updated);
    localStorage.setItem("mycanvaslab_shared_links", JSON.stringify(updated));
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
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
    setFiles((prev) => {
      const updated = prev.filter((f) => f.path !== path);
      if (activeFilePath === path) {
        setActiveFilePath(updated.length > 0 ? updated[0].path : "");
      }
      return updated;
    });
  };

  const handleDeleteMultipleFiles = (paths: string[]) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => !paths.includes(f.path) || f.path === "index.html");
      if (paths.includes(activeFilePath)) {
        setActiveFilePath(updated.length > 0 ? updated[0].path : "");
      }
      return updated;
    });
  };

  const handleRenameFile = (oldPath: string, newPath: string) => {
    if (!oldPath || !newPath) return;
    const trimmedOld = oldPath.trim();
    const trimmedNew = newPath.trim();
    if (!trimmedNew || trimmedOld === trimmedNew) return;
    if (trimmedOld === "index.html" || trimmedNew === "index.html") {
      alert("Cannot rename index.html.");
      return;
    }
    setFiles((prev) => {
      if (prev.some((f) => f.path.toLowerCase() === trimmedNew.toLowerCase() && f.path !== trimmedOld)) {
        alert("A file with that name already exists in the workspace.");
        return prev;
      }
      const updated = prev.map((f) => (f.path === trimmedOld ? { ...f, path: trimmedNew } : f));
      if (activeFilePath === trimmedOld) {
        setActiveFilePath(trimmedNew);
      }
      return updated;
    });
  };

  const handleRenameMultipleFiles = (renames: { oldPath: string; newPath: string }[]) => {
    setFiles((prev) => {
      let updated = [...prev];
      let activePath = activeFilePath;
      
      renames.forEach(({ oldPath, newPath }) => {
        const trimmedOld = oldPath.trim();
        const trimmedNew = newPath.trim();
        if (!trimmedNew || trimmedOld === trimmedNew) return;
        if (trimmedOld === "index.html" || trimmedNew === "index.html") return;
        
        const exists = updated.some((f) => f.path.toLowerCase() === trimmedNew.toLowerCase() && f.path !== trimmedOld);
        if (exists) return;
        
        updated = updated.map((f) => f.path === trimmedOld ? { ...f, path: trimmedNew } : f);
        if (activePath === trimmedOld) {
          activePath = trimmedNew;
        }
      });
      
      if (activePath !== activeFilePath) {
        setActiveFilePath(activePath);
      }
      return updated;
    });
  };

  const handleUpdateContent = (content: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === activeFilePath ? { ...f, content } : f))
    );
  };

  const handleSaveFile = () => {
    localStorage.setItem("virtual_workspace_files", JSON.stringify(files));
    setSaveStatus("saved");
    console.log("[MyCanvasLab] Saved file checkpoint triggered.");
  };

  const handleLoadTemplate = (template: Template) => {
    setFiles(template.files);
    if (template.files.length > 0) {
      setActiveFilePath(template.files[0].path);
    }
    setSandboxLogs([]);
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
        <nav className="flex items-center gap-1.5 p-1 bg-zinc-950/60 rounded-xl border border-zinc-800 shrink-0 relative select-none">
          <button
            onClick={() => {
              setActiveTab("workspace");
              setShowGhostDropdown(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
              activeTab === "workspace"
                ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm shadow-[#1ae854]/10"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            <Code className={`h-3.5 w-3.5 ${activeTab === "workspace" ? "text-[#1ae854]" : "text-zinc-400"}`} />
            Workspace
          </button>

          <button
            onClick={() => {
              setActiveTab("members");
              setShowGhostDropdown(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
              activeTab === "members"
                ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm shadow-[#1ae854]/10"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            <User className={`h-3.5 w-3.5 ${activeTab === "members" ? "text-[#1ae854]" : "text-zinc-400"}`} />
            Members Portal
          </button>

          <button
            onClick={() => {
              setActiveTab("pricing");
              setShowGhostDropdown(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
              activeTab === "pricing"
                ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm shadow-[#1ae854]/10"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            <CreditCard className={`h-3.5 w-3.5 ${activeTab === "pricing" ? "text-[#1ae854]" : "text-zinc-400"}`} />
            Pricing Plans
          </button>

          <button
            onClick={() => {
              setShowLegalModal(true);
              setShowGhostDropdown(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition cursor-pointer whitespace-nowrap text-zinc-300 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
          >
            <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
            Help & Legal
          </button>

          {/* Ghost hamburger dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowGhostDropdown(!showGhostDropdown)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap border ${
                activeTab !== "workspace" && activeTab !== "members" && activeTab !== "pricing"
                  ? "bg-[#1ae854]/15 text-[#1ae854] border-[#1ae854]/35"
                  : "bg-transparent text-zinc-300 hover:text-zinc-100 border-transparent hover:bg-zinc-900/40"
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
                    setActiveTab("pricing");
                    setShowGhostDropdown(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition ${
                    activeTab === "pricing"
                      ? "bg-[#1ae854]/10 text-[#1ae854]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1ae854]/5"
                  }`}
                >
                  <CreditCard className="h-3.5 w-3.5 text-[#1ae854]" />
                  <span>Subscription Pricing</span>
                </button>
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

        {/* Global indicators in Green & Keyboard Shortcut Manager */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#1ae854]/80">
          <KeyboardShortcutManager
            onSave={handleSaveFile}
            onTogglePreview={() => setShowPreview((prev) => !prev)}
            onToggleExplorer={() => setShowExplorer((prev) => !prev)}
            onToggleAIChat={() => setShowAIChat((prev) => !prev)}
            onSwitchTab={setActiveTab}
            activeTab={activeTab}
            showPreview={showPreview}
            showExplorer={showExplorer}
            showAIChat={showAIChat}
          />
          {saveStatus && (
            <span className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded border transition-all duration-300 ${
              saveStatus === "saving"
                ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/25 text-[#1ae854]"
            }`}>
              {saveStatus === "saving" ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
                  <span className="uppercase tracking-wider font-bold text-[9px]">Autosaving...</span>
                </>
              ) : (
                <>
                  <CheckSquare className="h-3 w-3 text-[#1ae854]" />
                  <span className="uppercase tracking-wider font-bold text-[9px]">Saved</span>
                </>
              )}
            </span>
          )}
          <span className="hidden sm:flex items-center gap-1.5 bg-[#1ae854]/10 border border-[#1ae854]/25 px-2 py-1 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1ae854] animate-pulse"></span>
            PORT 3000 ACTIVE
          </span>
          <span className="hidden lg:flex items-center gap-1.5 text-zinc-500">
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
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-zinc-800 bg-black/40 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
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
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border border-zinc-800 bg-black/40 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
              title="Show all sections including the AI Pipeline assistant"
            >
              🖥️ Show All Columns
            </button>

            <span className="text-zinc-700 mx-1">|</span>

            {/* Individual Toggles with hot green indicators */}
            <button
              onClick={() => setShowExplorer(!showExplorer)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition border cursor-pointer ${
                showExplorer
                  ? "bg-[#1ae854]/10 text-[#1ae854] border-[#1ae854]/25"
                  : "bg-black/20 text-zinc-300 border-zinc-850 hover:text-white hover:border-zinc-700"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${showExplorer ? "bg-[#1ae854]" : "bg-zinc-700"}`} />
              Explorer Tree
            </button>

            {/* Center Panel Layout Mode Toggles */}
            <div className="flex items-center gap-0.5 bg-black/60 p-0.5 rounded-lg border border-zinc-850">
              <button
                onClick={() => handleToggleLayout("code")}
                className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  showCode && !showPreview
                    ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                    : "text-zinc-300 hover:text-white border border-transparent"
                }`}
              >
                📝 Code
              </button>
              <button
                onClick={() => handleToggleLayout("split")}
                className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  showCode && showPreview
                    ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                    : "text-zinc-300 hover:text-white border border-transparent"
                }`}
              >
                ↔️ Split
              </button>
              <button
                onClick={() => handleToggleLayout("preview")}
                className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                  !showCode && showPreview
                    ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                    : "text-zinc-300 hover:text-white border border-transparent"
                }`}
              >
                👁️ Preview
              </button>
            </div>

            <button
              onClick={() => setShowAIChat(!showAIChat)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition border cursor-pointer ${
                showAIChat
                  ? "bg-[#1ae854]/10 text-[#1ae854] border-[#1ae854]/25"
                  : "bg-black/20 text-zinc-300 border-zinc-850 hover:text-white hover:border-zinc-700"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${showAIChat ? "bg-[#1ae854]" : "bg-zinc-700"}`} />
              AI Chat
            </button>

            <span className="text-zinc-700 mx-1">|</span>

            <button
              onClick={handleShareProject}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition border cursor-pointer bg-zinc-900 text-[#1ae854] border-[#1ae854]/20 hover:bg-[#1ae854]/10 hover:border-[#1ae854]/40"
              title="Deploy snapshot to temporary shareable sandbox link"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Project</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition border cursor-pointer ${
                zipSuccess
                  ? "bg-[#1ae854]/15 text-[#1ae854] border-[#1ae854]/30"
                  : isZipping
                    ? "bg-zinc-850 text-zinc-600 border-zinc-800"
                    : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-850 hover:text-white hover:border-zinc-700"
              }`}
              title="Download your entire virtual workspace as a standalone ZIP archive"
            >
              <FolderDown className={`h-3.5 w-3.5 ${isZipping ? "animate-bounce" : ""}`} />
              <span>{zipSuccess ? "Downloaded ZIP!" : isZipping ? "Creating ZIP..." : "Download ZIP"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Sandbox Canvas Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === "workspace" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-hidden">
              <Group orientation="horizontal" className="flex-1 h-full w-full">
                {/* Column 1: AI Proxy Chat Pilot Pipeline Sidebar (Leftmost) */}
                {showAIChat && (
                  <>
                    <Panel id="panel-ai-chat" defaultSize="25%" minSize="15%" maxSize="45%">
                      <div className="w-full h-full flex z-10">
                        <AIChat
                          files={files}
                          activeFilePath={activeFilePath}
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
                          onDeleteMultipleFiles={handleDeleteMultipleFiles}
                          onRenameFile={handleRenameFile}
                          onRenameMultipleFiles={handleRenameMultipleFiles}
                          onDownloadZip={handleDownloadZip}
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
                          onSave={handleSaveFile}
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
            <LogsOverlay logs={sandboxLogs} onClear={() => setSandboxLogs([])} />
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#020402]">
            <div className="max-w-5xl mx-auto">
              <Dashboard files={files} config={aiConfig} onChangeConfig={handleChangeConfig} snapshots={snapshots} />
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#020402]">
            <div className="max-w-5xl mx-auto">
              <MembersSpace files={files} />
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="flex-1 overflow-y-auto p-6 bg-[#020402]">
            <div className="max-w-5xl mx-auto">
              <PricingPage />
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

      <LegalAndInstructions
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
      />

      {/* Share Sandbox Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-[#1ae854]/25 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl neon-glow">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#1ae854]/12 bg-black/40">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-[#1ae854]" />
                <h3 className="text-sm font-bold tracking-wider text-white uppercase">Share Sandbox Workspace</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-zinc-500 hover:text-white transition text-xs font-bold uppercase tracking-widest bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {isSharing ? (
                <div className="py-6 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="h-8 w-8 text-[#1ae854] animate-spin" />
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-[#1ae854] tracking-wide uppercase">Compiling & Bundling State...</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Mocking deployment trigger to sandbox edge server</p>
                  </div>
                </div>
              ) : latestShareUrl ? (
                <div className="space-y-4">
                  <div className="bg-[#1ae854]/5 border border-[#1ae854]/20 p-4 rounded-lg space-y-2">
                    <p className="text-[10px] font-bold text-[#1ae854] tracking-wider uppercase">🎉 Sandbox Compiled & Deployed Successfully!</p>
                    <p className="text-xs text-zinc-400">
                      Your current workspace files ({files.length} active files) are bundled into a temporary in-memory instance:
                    </p>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={latestShareUrl}
                        readOnly
                        className="flex-1 bg-black text-zinc-300 font-mono text-xs border border-zinc-800 rounded px-3 py-1.5 focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyLink(latestShareUrl)}
                        className="px-3 bg-[#1ae854] text-black font-bold text-xs rounded hover:bg-[#15b240] transition flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span>{copySuccess ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <a
                      href={latestShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#1ae854] hover:underline"
                    >
                      <span>Open live mock app</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ) : null}

              {/* History list of shared links */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-1.5 flex justify-between items-center">
                  <span>Previously Shared Deployments</span>
                  <span className="text-[9px] font-mono text-zinc-500">{sharedLinks.length} total</span>
                </h4>

                {sharedLinks.length === 0 ? (
                  <div className="text-center py-4 bg-zinc-900/30 border border-zinc-900 rounded-lg text-zinc-600 text-[10px] font-mono">
                    No active share links. Click 'Share Project' above to create one.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {sharedLinks.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between bg-black/60 hover:bg-black border border-zinc-900 hover:border-zinc-800 rounded p-2 text-[11px] transition group"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-mono text-[10px] text-zinc-300 truncate max-w-[180px]">
                              {link.url}
                            </span>
                            <span className="text-[8px] bg-zinc-800 text-zinc-400 px-1 rounded font-mono shrink-0">
                              {link.fileCount} files
                            </span>
                          </div>
                          <p className="text-[9px] text-zinc-500 font-mono">{link.timestamp}</p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleCopyLink(link.url)}
                            className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white hover:border-zinc-700 transition cursor-pointer"
                            title="Copy url"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-[#1ae854] hover:bg-[#1ae854]/10 hover:border-[#1ae854]/30 transition cursor-pointer"
                            title="Visit sandbox"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <button
                            onClick={(e) => handleDeleteShareLink(link.id, e)}
                            className="p-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-500 hover:text-red-400 hover:border-red-950 transition cursor-pointer"
                            title="Delete from history"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
