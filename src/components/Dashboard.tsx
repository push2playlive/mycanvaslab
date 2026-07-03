import React, { useMemo, useState, useEffect } from "react";
import { VirtualFile, WorkspaceStats, AIConfig } from "../types";
import { FolderOpen, FileText, Code2, Cpu, BarChart2, Key, Bot, CheckCircle2, Sliders, Trash2, ShieldAlert } from "lucide-react";

interface DashboardProps {
  files: VirtualFile[];
  config: AIConfig;
  onChangeConfig: (newConfig: AIConfig) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ files, config, onChangeConfig }) => {
  const [geminiKey, setGeminiKey] = useState(config.customGeminiKey);
  const [openaiKey, setOpenaiKey] = useState(config.customOpenaiKey);
  const [ollamaUrl, setOllamaUrl] = useState(config.ollamaUrl);
  const [ollamaModel, setOllamaModel] = useState(config.ollamaModel);
  const [saved, setSaved] = useState(false);

  // Keep local states in sync when parent config changes
  useEffect(() => {
    setGeminiKey(config.customGeminiKey);
    setOpenaiKey(config.customOpenaiKey);
    setOllamaUrl(config.ollamaUrl);
    setOllamaModel(config.ollamaModel);
  }, [config]);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeConfig({
      ...config,
      customGeminiKey: geminiKey,
      customOpenaiKey: openaiKey,
      ollamaUrl,
      ollamaModel,
    });
    // Write keys to localStorage as fallback
    localStorage.setItem("custom_gemini_key", geminiKey);
    localStorage.setItem("custom_openai_key", openaiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClearAllKeys = () => {
    if (window.confirm("Are you sure you want to completely erase your saved API keys from browser memory?")) {
      setGeminiKey("");
      setOpenaiKey("");
      onChangeConfig({
        ...config,
        customGeminiKey: "",
        customOpenaiKey: "",
      });
      localStorage.removeItem("custom_gemini_key");
      localStorage.removeItem("custom_openai_key");
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
      <div className="bg-[#020502]/80 backdrop-blur border border-[#1ae854]/12 p-6 rounded-2xl green-glow flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#1ae854] animate-pulse-soft" />
            ADMIN DASHBOARD & CONTROLS
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time server metrics, compiler status, and LLM orchestration settings for MyCanvasLab.
          </p>
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
    </div>
  );
};
