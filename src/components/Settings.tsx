import React, { useState, useEffect } from "react";
import { Key, Bot, Cpu, Trash2, CheckCircle2, Sliders } from "lucide-react";
import { AIConfig } from "../types";

interface SettingsProps {
  config: AIConfig;
  onChangeConfig: (newConfig: AIConfig) => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, onChangeConfig }) => {
  const [geminiKey, setGeminiKey] = useState(config.customGeminiKey);
  const [openaiKey, setOpenaiKey] = useState(config.customOpenaiKey);
  const [ollamaUrl, setOllamaUrl] = useState(config.ollamaUrl);
  const [ollamaModel, setOllamaModel] = useState(config.ollamaModel);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setGeminiKey(config.customGeminiKey);
    setOpenaiKey(config.customOpenaiKey);
    setOllamaUrl(config.ollamaUrl);
    setOllamaModel(config.ollamaModel);
  }, [config]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeConfig({
      ...config,
      customGeminiKey: geminiKey,
      customOpenaiKey: openaiKey,
      ollamaUrl,
      ollamaModel,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearKeys = () => {
    if (confirm("Are you sure you want to delete all saved keys from local browser storage?")) {
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

        {/* OpenAI Provider Config */}
        <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">OpenAI Configuration</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">GPT Engine</span>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Custom OpenAI API Key</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
              <input
                type="password"
                placeholder="Paste your OpenAI API key (sk-...)"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-sky-500"
              />
            </div>
            <p className="text-[10px] text-zinc-600 leading-normal">
              Allows running builder prompts against GPT-4o systems. Ensure your balance contains sufficient billing credits.
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
