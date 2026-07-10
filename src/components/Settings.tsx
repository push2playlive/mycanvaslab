import React, { useState, useEffect } from "react";
import { Key, Bot, Cpu, Trash2, CheckCircle2, Sliders, Download, Upload } from "lucide-react";
import { AIConfig } from "../types";

interface SettingsProps {
  config: AIConfig;
  onChangeConfig: (newConfig: AIConfig) => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, onChangeConfig }) => {
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

  const handleSave = (e: React.FormEvent) => {
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
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearKeys = () => {
    if (confirm("Are you sure you want to delete all saved keys from local browser storage?")) {
      setGeminiKey("");
      onChangeConfig({
        ...config,
        customGeminiKey: "",
      });
      localStorage.removeItem("custom_gemini_key");
    }
  };

  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExportConfig = () => {
    try {
      const exportData: AIConfig = {
        provider: config.provider || "gemini",
        geminiModel: config.geminiModel || "gemini-2.5-flash",
        ollamaUrl,
        ollamaModel,
        customGeminiKey: geminiKey,
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
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "utube_media_ai_config.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      setImportError("Failed to export configuration: " + err.message);
    }
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== "object") {
          throw new Error("Invalid JSON structure.");
        }

        const customGeminiKey = parsed.customGeminiKey || "";
        const oUrl = parsed.ollamaUrl || "";
        const oModel = parsed.ollamaModel || "";

        const a1Name = parsed.ollamaAgent1Name || "Ollama Coder";
        const a1Url = parsed.ollamaAgent1Url || "http://localhost:11434/api/generate";
        const a1Model = parsed.ollamaAgent1Model || "codellama";

        const a2Name = parsed.ollamaAgent2Name || "Ollama Designer";
        const a2Url = parsed.ollamaAgent2Url || "http://localhost:11434/api/generate";
        const a2Model = parsed.ollamaAgent2Model || "llama3";

        const a3Name = parsed.ollamaAgent3Name || "Ollama Reviewer";
        const a3Url = parsed.ollamaAgent3Url || "http://localhost:11434/api/generate";
        const a3Model = parsed.ollamaAgent3Model || "mistral";

        const a4Name = parsed.ollamaAgent4Name || "Ollama Architect";
        const a4Url = parsed.ollamaAgent4Url || "http://localhost:11434/api/generate";
        const a4Model = parsed.ollamaAgent4Model || "phi3";

        const a5Name = parsed.ollamaAgent5Name || "Ollama Writer";
        const a5Url = parsed.ollamaAgent5Url || "http://localhost:11434/api/generate";
        const a5Model = parsed.ollamaAgent5Model || "gemma2";

        const a6Name = parsed.ollamaAgent6Name || "Ollama Assistant";
        const a6Url = parsed.ollamaAgent6Url || "http://localhost:11434/api/generate";
        const a6Model = parsed.ollamaAgent6Model || "qwen2";

        setGeminiKey(customGeminiKey);
        setOllamaUrl(oUrl);
        setOllamaModel(oModel);

        setAgent1Name(a1Name);
        setAgent1Url(a1Url);
        setAgent1Model(a1Model);

        setAgent2Name(a2Name);
        setAgent2Url(a2Url);
        setAgent2Model(a2Model);

        setAgent3Name(a3Name);
        setAgent3Url(a3Url);
        setAgent3Model(a3Model);

        setAgent4Name(a4Name);
        setAgent4Url(a4Url);
        setAgent4Model(a4Model);

        setAgent5Name(a5Name);
        setAgent5Url(a5Url);
        setAgent5Model(a5Model);

        setAgent6Name(a6Name);
        setAgent6Url(a6Url);
        setAgent6Model(a6Model);

        const newConfig: AIConfig = {
          ...config,
          provider: parsed.provider || "gemini",
          geminiModel: parsed.geminiModel || config.geminiModel || "gemini-2.5-flash",
          customGeminiKey,
          ollamaUrl: oUrl,
          ollamaModel: oModel,
          ollamaAgent1Name: a1Name,
          ollamaAgent1Url: a1Url,
          ollamaAgent1Model: a1Model,
          ollamaAgent2Name: a2Name,
          ollamaAgent2Url: a2Url,
          ollamaAgent2Model: a2Model,
          ollamaAgent3Name: a3Name,
          ollamaAgent3Url: a3Url,
          ollamaAgent3Model: a3Model,
          ollamaAgent4Name: a4Name,
          ollamaAgent4Url: a4Url,
          ollamaAgent4Model: a4Model,
          ollamaAgent5Name: a5Name,
          ollamaAgent5Url: a5Url,
          ollamaAgent5Model: a5Model,
          ollamaAgent6Name: a6Name,
          ollamaAgent6Url: a6Url,
          ollamaAgent6Model: a6Model,
        };

        onChangeConfig(newConfig);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 4000);
      } catch (err: any) {
        setImportError("Failed to parse configuration JSON: " + err.message);
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center gap-2">
          <Sliders className="h-5 w-5 text-purple-400" />
          PLAYGROUND SETTINGS
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Configure your server-side proxy credentials and model choices</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini Provider Config */}
        <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Gemini (Recommended)</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Google GenAI</span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Custom Gemini API Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
              <input
                type="password"
                placeholder="Paste your AI Studio API key..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-purple-500"
              />
            </div>
            <p className="text-[10px] text-zinc-600 leading-normal">
              Keys are proxy-forwarded to our Cloud container and kept hidden from the browser. Obtain your key from the{" "}
              <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                Google AI Studio Console
              </a>.
            </p>
          </div>
        </div>



        {/* Ollama Local Host Configuration */}
        <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Ollama Local API</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Self-Hosted</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Ollama Server Endpoint</label>
              <input
                type="text"
                placeholder="http://localhost:11434/api/generate"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Local Model Tag</label>
              <input
                type="text"
                placeholder="llama3"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Ollama Agents Configuration */}
        <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Ollama Multi-Agent Fleet (6 Agents)</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Custom Profiles</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-normal pb-1">
            Configure independent Ollama agents next to your default system node. Each agent can reference its own model and URL.
          </p>
          
          <div className="space-y-4 divide-y divide-zinc-900">
            {/* Agent 1 */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-[11px] font-black tracking-wider uppercase text-zinc-400">Agent #1</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Agent Name</label>
                  <input
                    type="text"
                    placeholder="Ollama Coder"
                    value={agent1Name}
                    onChange={(e) => setAgent1Name(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Endpoint URL</label>
                  <input
                    type="text"
                    placeholder="http://localhost:11434/api/generate"
                    value={agent1Url}
                    onChange={(e) => setAgent1Url(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Ollama Model Tag</label>
                  <input
                    type="text"
                    placeholder="codellama"
                    value={agent1Model}
                    onChange={(e) => setAgent1Model(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Agent 2 */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                <span className="text-[11px] font-black tracking-wider uppercase text-zinc-400">Agent #2</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Agent Name</label>
                  <input
                    type="text"
                    placeholder="Ollama Designer"
                    value={agent2Name}
                    onChange={(e) => setAgent2Name(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Endpoint URL</label>
                  <input
                    type="text"
                    placeholder="http://localhost:11434/api/generate"
                    value={agent2Url}
                    onChange={(e) => setAgent2Url(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Ollama Model Tag</label>
                  <input
                    type="text"
                    placeholder="llama3"
                    value={agent2Model}
                    onChange={(e) => setAgent2Model(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Agent 3 */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-black tracking-wider uppercase text-zinc-400">Agent #3</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Agent Name</label>
                  <input
                    type="text"
                    placeholder="Ollama Reviewer"
                    value={agent3Name}
                    onChange={(e) => setAgent3Name(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Endpoint URL</label>
                  <input
                    type="text"
                    placeholder="http://localhost:11434/api/generate"
                    value={agent3Url}
                    onChange={(e) => setAgent3Url(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Ollama Model Tag</label>
                  <input
                    type="text"
                    placeholder="mistral"
                    value={agent3Model}
                    onChange={(e) => setAgent3Model(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Agent 4 */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-black tracking-wider uppercase text-zinc-400">Agent #4</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Agent Name</label>
                  <input
                    type="text"
                    placeholder="Ollama Architect"
                    value={agent4Name}
                    onChange={(e) => setAgent4Name(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Endpoint URL</label>
                  <input
                    type="text"
                    placeholder="http://localhost:11434/api/generate"
                    value={agent4Url}
                    onChange={(e) => setAgent4Url(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Ollama Model Tag</label>
                  <input
                    type="text"
                    placeholder="phi3"
                    value={agent4Model}
                    onChange={(e) => setAgent4Model(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Agent 5 */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[11px] font-black tracking-wider uppercase text-zinc-400">Agent #5</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Agent Name</label>
                  <input
                    type="text"
                    placeholder="Ollama Writer"
                    value={agent5Name}
                    onChange={(e) => setAgent5Name(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Endpoint URL</label>
                  <input
                    type="text"
                    placeholder="http://localhost:11434/api/generate"
                    value={agent5Url}
                    onChange={(e) => setAgent5Url(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Ollama Model Tag</label>
                  <input
                    type="text"
                    placeholder="gemma2"
                    value={agent5Model}
                    onChange={(e) => setAgent5Model(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Agent 6 */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[11px] font-black tracking-wider uppercase text-zinc-400">Agent #6</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Agent Name</label>
                  <input
                    type="text"
                    placeholder="Ollama Assistant"
                    value={agent6Name}
                    onChange={(e) => setAgent6Name(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Endpoint URL</label>
                  <input
                    type="text"
                    placeholder="http://localhost:11434/api/generate"
                    value={agent6Url}
                    onChange={(e) => setAgent6Url(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-zinc-600 block">Ollama Model Tag</label>
                  <input
                    type="text"
                    placeholder="qwen2"
                    value={agent6Model}
                    onChange={(e) => setAgent6Model(e.target.value)}
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Portability */}
        <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Configuration Portability</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Backup & Sync</span>
          </div>
          
          <p className="text-[10px] text-zinc-500 leading-normal">
            Export your current AI key, model choices, and multi-agent settings to a JSON file, or import an existing configuration file to restore your settings in any environment.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Export Button */}
            <button
              type="button"
              id="export-ai-config-btn"
              onClick={handleExportConfig}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer"
            >
              <Download className="h-4 w-4 text-purple-400" />
              Export Config to JSON
            </button>

            {/* Import Button */}
            <div className="relative">
              <label 
                id="import-ai-config-label"
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-700 transition cursor-pointer"
              >
                <Upload className="h-4 w-4 text-pink-400" />
                Import JSON Config
                <input
                  type="file"
                  id="import-ai-config-input"
                  accept=".json"
                  onChange={handleImportConfig}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {importError && (
            <p id="import-config-error" className="text-[10px] text-red-400 font-mono flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {importError}
            </p>
          )}
          {importSuccess && (
            <p id="import-config-success" className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5 pt-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Configuration successfully imported & applied!
            </p>
          )}
        </div>

        {/* Action controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleClearKeys}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 border border-red-950 bg-red-950/20 hover:bg-red-900/40 transition cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete All Local Keys
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 rounded-lg text-xs font-black text-white shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                SAVED SUCCESSFULLY
              </>
            ) : (
              "SAVE CHANGES"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
