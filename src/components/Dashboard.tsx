import React, { useMemo, useState, useEffect } from "react";
import { VirtualFile, WorkspaceStats, AIConfig, Snapshot } from "../types";
import { FolderOpen, FileText, Code2, Cpu, BarChart2, Key, Bot, CheckCircle2, Sliders, Trash2, ShieldAlert, Lock, Unlock } from "lucide-react";
import { ProjectStatistics } from "./ProjectStatistics";

interface DashboardProps {
  files: VirtualFile[];
  config: AIConfig;
  onChangeConfig: (newConfig: AIConfig) => void;
  snapshots: Snapshot[];
}

export const Dashboard: React.FC<DashboardProps> = ({ files, config, onChangeConfig, snapshots }) => {
  const [geminiKey, setGeminiKey] = useState(config.customGeminiKey);
  const [ollamaUrl, setOllamaUrl] = useState(config.ollamaUrl);
  const [ollamaModel, setOllamaModel] = useState(config.ollamaModel);
  const [saved, setSaved] = useState(false);

  const [agent1Name, setAgent1Name] = useState(config.ollamaAgent1Name || "Ollama Coder");
  const [agent1Url, setAgent1Url] = useState(config.ollamaAgent1Url || "http://localhost:11434/api/generate");
  const [agent1Model, setAgent1Model] = useState(config.ollamaAgent1Model || "codellama");

  const [agent2Name, setAgent2Name] = useState(config.ollamaAgent2Name || "Ollama Designer");
  const [agent2Url, setAgent2Url] = useState(config.ollamaAgent2Url || "http://localhost:11434/api/generate");
  const [agent2Model, setAgent2Model] = useState(config.ollamaAgent2Model || "llama3");

  const [agent3Name, setAgent3Name] = useState(config.ollamaAgent3Name || "Ollama Reviewer");
  const [agent3Url, setAgent3Url] = useState(config.ollamaAgent3Url || "http://localhost:11434/api/generate");
  const [agent3Model, setAgent3Model] = useState(config.ollamaAgent3Model || "mistral");

  const [agent4Name, setAgent4Name] = useState(config.ollamaAgent4Name || "Ollama Architect");
  const [agent4Url, setAgent4Url] = useState(config.ollamaAgent4Url || "http://localhost:11434/api/generate");
  const [agent4Model, setAgent4Model] = useState(config.ollamaAgent4Model || "phi3");

  const [agent5Name, setAgent5Name] = useState(config.ollamaAgent5Name || "Ollama Writer");
  const [agent5Url, setAgent5Url] = useState(config.ollamaAgent5Url || "http://localhost:11434/api/generate");
  const [agent5Model, setAgent5Model] = useState(config.ollamaAgent5Model || "gemma2");

  const [agent6Name, setAgent6Name] = useState(config.ollamaAgent6Name || "Ollama Assistant");
  const [agent6Url, setAgent6Url] = useState(config.ollamaAgent6Url || "http://localhost:11434/api/generate");
  const [agent6Model, setAgent6Model] = useState(config.ollamaAgent6Model || "qwen2");

  // Admin Login Credentials & Session state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem("is_admin_logged_in") === "true";
  });
  const [adminEmail, setAdminEmail] = useState(() => {
    return localStorage.getItem("admin_email") || "nexusos@commandnexus.net";
  });
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem("admin_password") || "admin1234567";
  });

  const [loginEmailInput, setLoginEmailInput] = useState("");
  const [loginPasswordInput, setLoginPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");

  const [showChangeCreds, setShowChangeCreds] = useState(false);
  const [newEmail, setNewEmail] = useState(adminEmail);
  const [newPassword, setNewPassword] = useState(adminPassword);
  const [changeSuccess, setChangeSuccess] = useState(false);

  // Keep local states in sync when parent config changes
  useEffect(() => {
    setGeminiKey(config.customGeminiKey);
    setOllamaUrl(config.ollamaUrl);
    setOllamaModel(config.ollamaModel);

    setAgent1Name(config.ollamaAgent1Name || "Ollama Coder");
    setAgent1Url(config.ollamaAgent1Url || "http://localhost:11434/api/generate");
    setAgent1Model(config.ollamaAgent1Model || "codellama");

    setAgent2Name(config.ollamaAgent2Name || "Ollama Designer");
    setAgent2Url(config.ollamaAgent2Url || "http://localhost:11434/api/generate");
    setAgent2Model(config.ollamaAgent2Model || "llama3");

    setAgent3Name(config.ollamaAgent3Name || "Ollama Reviewer");
    setAgent3Url(config.ollamaAgent3Url || "http://localhost:11434/api/generate");
    setAgent3Model(config.ollamaAgent3Model || "mistral");

    setAgent4Name(config.ollamaAgent4Name || "Ollama Architect");
    setAgent4Url(config.ollamaAgent4Url || "http://localhost:11434/api/generate");
    setAgent4Model(config.ollamaAgent4Model || "phi3");

    setAgent5Name(config.ollamaAgent5Name || "Ollama Writer");
    setAgent5Url(config.ollamaAgent5Url || "http://localhost:11434/api/generate");
    setAgent5Model(config.ollamaAgent5Model || "gemma2");

    setAgent6Name(config.ollamaAgent6Name || "Ollama Assistant");
    setAgent6Url(config.ollamaAgent6Url || "http://localhost:11434/api/generate");
    setAgent6Model(config.ollamaAgent6Model || "qwen2");
  }, [config]);

  if (!isAdminLoggedIn) {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (loginEmailInput === adminEmail && loginPasswordInput === adminPassword) {
        setIsAdminLoggedIn(true);
        localStorage.setItem("is_admin_logged_in", "true");
        setLoginError("");
      } else {
        setLoginError("Invalid admin credentials. Please try again.");
      }
    };

    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#020502]/90 backdrop-blur-md border border-[#1ae854]/20 p-8 rounded-2xl shadow-2xl shadow-[#1ae854]/5 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-[#1ae854]/10 border border-[#1ae854]/25 rounded-xl text-[#1ae854] mb-2 animate-pulse-soft">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">
              ADMIN GATEWAY
            </h2>
            <p className="text-xs text-zinc-400">
              NexusOS Admin Control Panel. Enter credentials to unlock dashboard metrics & API settings.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@domain.com"
                  value={loginEmailInput}
                  onChange={(e) => setLoginEmailInput(e.target.value)}
                  className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#1ae854] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPasswordInput}
                onChange={(e) => setLoginPasswordInput(e.target.value)}
                className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#1ae854] transition-colors"
              />
            </div>

            {loginError && (
              <p className="text-[11px] text-red-400 font-medium bg-red-950/25 border border-red-900/30 p-2.5 rounded-lg">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1ae854] hover:bg-[#15cf4a] text-black font-black uppercase text-xs tracking-wider rounded-lg shadow-lg shadow-[#1ae854]/10 transition-all hover:scale-[1.01] active:scale-100 cursor-pointer text-center block"
            >
              UNLOCK SECURE SESSION
            </button>
          </form>

          <div className="pt-2 text-center text-[10px] text-zinc-600 font-mono">
            Nexus Panel V2.0 • COMMAND NEXUS SECURE ENCRYPTED
          </div>
        </div>
      </div>
    );
  }

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeConfig({
      ...config,
      customGeminiKey: geminiKey,
      ollamaUrl,
      ollamaModel,
      ollamaAgent1Name: agent1Name,
      ollamaAgent1Url: agent1Url,
      ollamaAgent1Model: agent1Model,
      ollamaAgent2Name: agent2Name,
      ollamaAgent2Url: agent2Url,
      ollamaAgent2Model: agent2Model,
      ollamaAgent3Name: agent3Name,
      ollamaAgent3Url: agent3Url,
      ollamaAgent3Model: agent3Model,
      ollamaAgent4Name: agent4Name,
      ollamaAgent4Url: agent4Url,
      ollamaAgent4Model: agent4Model,
      ollamaAgent5Name: agent5Name,
      ollamaAgent5Url: agent5Url,
      ollamaAgent5Model: agent5Model,
      ollamaAgent6Name: agent6Name,
      ollamaAgent6Url: agent6Url,
      ollamaAgent6Model: agent6Model,
    });
    // Write keys to localStorage as fallback
    localStorage.setItem("custom_gemini_key", geminiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearAllKeys = () => {
    if (window.confirm("Are you sure you want to completely erase your saved API keys from browser memory?")) {
      setGeminiKey("");
      onChangeConfig({
        ...config,
        customGeminiKey: "",
      });
      localStorage.removeItem("custom_gemini_key");
    }
  };

  const stats = useMemo<WorkspaceStats>(() => {
    let totalLines = 0;
    let totalCharacters = 0;
    const activeLanguageBreakdown: { [key: string]: number } = {};

    files.forEach((file) => {
      const content = file.content || "";
      totalLines += content.split("\n").length;
      totalCharacters += content.length;

      const ext = file.path.split(".").pop() || "unknown";
      activeLanguageBreakdown[ext] = (activeLanguageBreakdown[ext] || 0) + 1;
    });

    return {
      totalFiles: files.length,
      totalLines,
      totalCharacters,
      aiGenerationsCount: Number(localStorage.getItem("mycanvaslab_ai_generations_count") || "0"),
      activeLanguageBreakdown,
    };
  }, [files]);

  // Map file extension to standard language name and color
  const getLanguageMeta = (ext: string) => {
    const map: { [key: string]: { name: string; color: string } } = {
      ts: { name: "TypeScript", color: "bg-emerald-500" },
      tsx: { name: "React TypeScript", color: "bg-emerald-400" },
      js: { name: "JavaScript", color: "bg-yellow-500" },
      jsx: { name: "React JavaScript", color: "bg-orange-500" },
      css: { name: "CSS", color: "bg-green-500" },
      html: { name: "HTML", color: "bg-[#1ae854]" },
      json: { name: "JSON", color: "bg-zinc-600" },
      md: { name: "Markdown", color: "bg-teal-500" },
    };
    return map[ext.toLowerCase()] || { name: ext.toUpperCase(), color: "bg-zinc-500" };
  };

  const totalLanguagesCount = Object.values(stats.activeLanguageBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6 text-[#ecfdf5]">
      {/* Welcome Banner */}
      <div className="bg-[#020502]/80 backdrop-blur border border-[#1ae854]/12 p-6 rounded-2xl green-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#1ae854] animate-pulse-soft" />
            ADMIN DASHBOARD & CONTROLS
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time server metrics, compiler status, and LLM orchestration settings for MyCanvasLab.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 font-mono">Logged as Admin</p>
            <p className="text-xs font-mono font-bold text-[#1ae854] truncate max-w-[180px]">{adminEmail}</p>
          </div>
          <button
            onClick={() => {
              setIsAdminLoggedIn(false);
              localStorage.removeItem("is_admin_logged_in");
            }}
            className="px-3 py-1.5 rounded-lg border border-red-950 hover:border-red-500 bg-red-950/20 hover:bg-red-950/40 text-red-400 transition text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Files */}
        <div className="bg-[#020502]/45 backdrop-blur border border-[#1ae854]/10 p-5 rounded-xl hover:border-[#1ae854]/25 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Total Files</span>
            <div className="p-2 bg-[#1ae854]/10 rounded-lg text-[#1ae854]">
              <FolderOpen className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{stats.totalFiles}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Files tracked in editor</p>
        </div>

        {/* Code Lines */}
        <div className="bg-[#020502]/45 backdrop-blur border border-[#1ae854]/10 p-5 rounded-xl hover:border-[#1ae854]/25 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Lines of Code</span>
            <div className="p-2 bg-[#1ae854]/10 rounded-lg text-[#1ae854]">
              <Code2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{stats.totalLines}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Combined line count</p>
        </div>

        {/* Characters Count */}
        <div className="bg-[#020502]/45 backdrop-blur border border-[#1ae854]/10 p-5 rounded-xl hover:border-[#1ae854]/25 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Size in Characters</span>
            <div className="p-2 bg-[#1ae854]/10 rounded-lg text-[#1ae854]">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{(stats.totalCharacters / 1000).toFixed(2)} k</p>
          <p className="text-[10px] text-zinc-500 mt-1">Total characters on disk</p>
        </div>

        {/* AI Assistants Calls */}
        <div className="bg-[#020502]/45 backdrop-blur border border-[#1ae854]/10 p-5 rounded-xl hover:border-[#1ae854]/25 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">AI Sessions</span>
            <div className="p-2 bg-[#1ae854]/10 rounded-lg text-[#1ae854]">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{stats.aiGenerationsCount}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Total model runs</p>
        </div>
      </div>

      {/* Main Admin Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: API Keys Credentials Panel (7/12 width) */}
        <div className="lg:col-span-7 bg-[#020502]/60 border border-[#1ae854]/12 rounded-2xl p-5 space-y-4 green-glow">
          <div className="flex items-center justify-between border-b border-[#1ae854]/10 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4.5 w-4.5 text-[#1ae854]" />
              <h3 className="text-xs font-black text-white tracking-widest uppercase">
                ADMIN KEY ACCESS (GEMINI & OLLAMA)
              </h3>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950/20 border border-emerald-900/35 px-2 py-0.5 rounded">
              Active Session
            </span>
          </div>

          <form onSubmit={handleSaveKeys} className="space-y-4">
            {/* Gemini API Key Block */}
            <div className="space-y-1.5 bg-black/40 border border-[#1ae854]/5 p-3.5 rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-[#1ae854]" /> GOOGLE GEMINI CREDENTIALS
                </span>
                <span className="text-[8px] font-mono text-zinc-500">models/gemini-*</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal pb-1">
                Provides orchestration capabilities for the **Purpose Designer** and **Finisher** agents.
              </p>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-[#1ae854]/40" />
                <input
                  type="password"
                  placeholder={config.customGeminiKey ? "••••••••••••••••••••" : "Paste custom Gemini API key..."}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#1ae854] transition-colors"
                />
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[9px] text-zinc-600">Keys are proxied and stored locally in browser sandbox memory</span>
                <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-[9px] text-[#1ae854] hover:underline font-bold">
                  Get Key from AI Studio →
                </a>
              </div>
            </div>

            {/* Ollama API Block */}
            <div className="space-y-1.5 bg-black/40 border border-[#1ae854]/5 p-3.5 rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5 text-[#1ae854]" /> OLLAMA LOCAL ORCHESTRATION
                </span>
                <span className="text-[8px] font-mono text-zinc-500">Localhost GPU Node</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-normal pb-1">
                For running lightweight local models offline. Requires Ollama server running locally.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Local Server Endpoint</label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434/api/generate"
                    className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Active Model Tag</label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    placeholder="llama3"
                    className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Ollama Agents Dashboard Configuration */}
            <div className="space-y-3 bg-black/40 border border-[#1ae854]/5 p-3.5 rounded-xl">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                <span className="text-[10px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5 text-purple-400" /> OLLAMA MULTI-AGENT FLEET (6 AGENTS)
                </span>
                <span className="text-[8px] font-mono text-zinc-500">Autonomous Nodes</span>
              </div>
              
              <div className="space-y-4 divide-y divide-zinc-900/60 max-h-[350px] overflow-y-auto pr-1">
                {/* Agent 1 */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span className="text-[10px] font-bold text-zinc-400">Agent #1</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Name</label>
                      <input
                        type="text"
                        value={agent1Name}
                        onChange={(e) => setAgent1Name(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Server Endpoint URL</label>
                      <input
                        type="text"
                        value={agent1Url}
                        onChange={(e) => setAgent1Url(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Ollama Model Tag</label>
                      <input
                        type="text"
                        value={agent1Model}
                        onChange={(e) => setAgent1Model(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Agent 2 */}
                <div className="space-y-2 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span className="text-[10px] font-bold text-zinc-400">Agent #2</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Name</label>
                      <input
                        type="text"
                        value={agent2Name}
                        onChange={(e) => setAgent2Name(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Server Endpoint URL</label>
                      <input
                        type="text"
                        value={agent2Url}
                        onChange={(e) => setAgent2Url(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Ollama Model Tag</label>
                      <input
                        type="text"
                        value={agent2Model}
                        onChange={(e) => setAgent2Model(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Agent 3 */}
                <div className="space-y-2 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-400">Agent #3</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Name</label>
                      <input
                        type="text"
                        value={agent3Name}
                        onChange={(e) => setAgent3Name(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Server Endpoint URL</label>
                      <input
                        type="text"
                        value={agent3Url}
                        onChange={(e) => setAgent3Url(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Ollama Model Tag</label>
                      <input
                        type="text"
                        value={agent3Model}
                        onChange={(e) => setAgent3Model(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Agent 4 */}
                <div className="space-y-2 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-bold text-zinc-400">Agent #4</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Name</label>
                      <input
                        type="text"
                        value={agent4Name}
                        onChange={(e) => setAgent4Name(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Server Endpoint URL</label>
                      <input
                        type="text"
                        value={agent4Url}
                        onChange={(e) => setAgent4Url(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Ollama Model Tag</label>
                      <input
                        type="text"
                        value={agent4Model}
                        onChange={(e) => setAgent4Model(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Agent 5 */}
                <div className="space-y-2 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span className="text-[10px] font-bold text-zinc-400">Agent #5</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Name</label>
                      <input
                        type="text"
                        value={agent5Name}
                        onChange={(e) => setAgent5Name(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Server Endpoint URL</label>
                      <input
                        type="text"
                        value={agent5Url}
                        onChange={(e) => setAgent5Url(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Ollama Model Tag</label>
                      <input
                        type="text"
                        value={agent5Model}
                        onChange={(e) => setAgent5Model(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Agent 6 */}
                <div className="space-y-2 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span className="text-[10px] font-bold text-zinc-400">Agent #6</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Name</label>
                      <input
                        type="text"
                        value={agent6Name}
                        onChange={(e) => setAgent6Name(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Server Endpoint URL</label>
                      <input
                        type="text"
                        value={agent6Url}
                        onChange={(e) => setAgent6Url(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[8px] text-zinc-600 font-bold uppercase block">Ollama Model Tag</label>
                      <input
                        type="text"
                        value={agent6Model}
                        onChange={(e) => setAgent6Model(e.target.value)}
                        className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-md px-2.5 py-1 text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1ae854]/10">
              <button
                type="button"
                onClick={handleClearAllKeys}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-red-400 border border-red-950 bg-red-950/20 hover:bg-red-950/40 transition cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Flush Saved Keys
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4.5 py-1.5 bg-[#1ae854] hover:bg-[#15cf4a] text-black font-black uppercase text-[10px] tracking-wider rounded-lg shadow-lg shadow-[#1ae854]/10 transition-transform hover:scale-[1.02] active:scale-100 cursor-pointer"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    COMPILER STATE SAVED
                  </>
                ) : (
                  "SAVE AND APPLY KEYS"
                )}
              </button>
            </div>

            {/* Collapse Trigger for Change Credentials */}
            <div className="pt-2 border-t border-[#1ae854]/10">
              <button
                type="button"
                onClick={() => {
                  setShowChangeCreds(!showChangeCreds);
                  setNewEmail(adminEmail);
                  setNewPassword(adminPassword);
                  setChangeSuccess(false);
                }}
                className="text-[10px] text-zinc-500 hover:text-[#1ae854] transition font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                🔐 {showChangeCreds ? "Hide Admin Credentials Settings" : "Change Admin Credentials Settings"}
              </button>
            </div>

            {showChangeCreds && (
              <div className="space-y-3 bg-black/50 border border-yellow-500/15 p-4 rounded-xl mt-3 animate-fade-in">
                <span className="text-[10px] font-bold text-yellow-400 flex items-center gap-1.5 uppercase font-mono">
                  🔑 Change Nexus Admin Login
                </span>
                <p className="text-[10px] text-zinc-500 leading-normal font-sans">
                  Customize the admin gateway credentials. Changes will persist in browser sandbox storage.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 font-mono">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">New Admin Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-[#050705] border border-yellow-500/20 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500/40 transition-colors"
                    />
                  </div>
                  <div className="space-y-1 font-mono">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">New Admin Password</label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#050705] border border-yellow-500/20 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-yellow-500/40 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (!newEmail.trim() || !newPassword.trim()) {
                        alert("Email and password cannot be empty!");
                        return;
                      }
                      setAdminEmail(newEmail);
                      setAdminPassword(newPassword);
                      localStorage.setItem("admin_email", newEmail);
                      localStorage.setItem("admin_password", newPassword);
                      setChangeSuccess(true);
                      setTimeout(() => {
                        setChangeSuccess(false);
                        setShowChangeCreds(false);
                      }, 2000);
                    }}
                    className="px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-[9px] tracking-wider rounded-lg transition font-mono cursor-pointer"
                  >
                    {changeSuccess ? "✓ Credentials Changed!" : "Save New Credentials"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Column 2: File Type Composition (5/12 width) */}
        <div className="lg:col-span-5 bg-[#020502]/60 border border-[#1ae854]/12 rounded-2xl p-5 space-y-4 green-glow">
          <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2 border-b border-[#1ae854]/10 pb-3">
            <BarChart2 className="h-4.5 w-4.5 text-[#1ae854]" />
            FILE TYPE COMPOSITION
          </h3>

          {files.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No files inside the workspace to analyze.</p>
          ) : (
            <div className="space-y-4">
              {/* Horizontal Stacked Bar representing total composition */}
              <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden flex border border-[#1ae854]/10 p-0.5">
                {Object.entries(stats.activeLanguageBreakdown).map(([ext, count]) => {
                  const percentage = (count / totalLanguagesCount) * 100;
                  const meta = getLanguageMeta(ext);
                  return (
                    <div
                      key={ext}
                      style={{ width: `${percentage}%` }}
                      className={`${meta.color} h-full first:rounded-l-full last:rounded-r-full transition-all duration-500`}
                      title={`${meta.name}: ${percentage.toFixed(1)}%`}
                    />
                  );
                })}
              </div>

              {/* Language breakdown grid legends */}
              <div className="grid grid-cols-1 gap-2.5 pt-1.5 max-h-[220px] overflow-y-auto pr-1">
                {Object.entries(stats.activeLanguageBreakdown).map(([ext, count]) => {
                  const percentage = (count / totalLanguagesCount) * 100;
                  const meta = getLanguageMeta(ext);
                  return (
                    <div key={ext} className="flex items-center justify-between p-2 bg-black/40 rounded-lg border border-[#1ae854]/5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full ${meta.color} shrink-0`} />
                        <p className="text-xs font-black text-zinc-300 truncate font-mono">{meta.name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono font-bold text-[#1ae854] bg-[#1ae854]/10 px-2 py-0.5 rounded border border-[#1ae854]/10">
                          {count} {count === 1 ? "file" : "files"} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Project Analytics Visualization */}
      <div className="border-t border-[#1ae854]/10 pt-6">
        <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2 mb-4">
          <BarChart2 className="h-4.5 w-4.5 text-[#1ae854]" />
          COMPUTE & CODE STATISTICS VISUALIZER
        </h3>
        <ProjectStatistics files={files} snapshots={snapshots} />
      </div>

    </div>
  );
};
