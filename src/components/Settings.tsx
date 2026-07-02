import React, { useState } from "react";
import { Settings, Github, Database, Shield, Radio, Check, Circle, ExternalLink } from "lucide-react";

import { TerminalTheme } from "../types";

interface SettingsProps {
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  terminalTheme: TerminalTheme;
  onTerminalThemeChange: (theme: TerminalTheme) => void;
}

export default function SettingsPanel({ 
  accentColor, 
  onAccentColorChange,
  terminalTheme,
  onTerminalThemeChange
}: SettingsProps) {
  const [gitConnected, setGitConnected] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);

  const colors = [
    { name: "orange", value: "orange" },
    { name: "cyan", value: "cyan" },
    { name: "purple", value: "purple" },
    { name: "emerald", value: "emerald" },
    { name: "green", value: "green" },
  ];

  const themes: { name: string; value: TerminalTheme; desc: string }[] = [
    { name: "Neon Cyber", value: "neon", desc: "Futuristic glow & neon accent highlights" },
    { name: "Classic Retro", value: "retro", desc: "Amber phosphor CRT command center" },
    { name: "Monochromatic", value: "monochromatic", desc: "High-contrast clean industrial grayscale" }
  ];

  return (
    <div className="flex flex-col h-full bg-[#141414] text-zinc-300 select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2a2a] bg-[#141414]">
        <div className="flex items-center gap-1.5">
          <Settings className="h-4 w-4 text-[var(--accent)]" />
          <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">SYSTEM SETTINGS</span>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">
          Configure IDE environment, external databases, and developer connections.
        </p>
      </div>

      {/* Settings Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin bg-[#0d0d0d]/10">
        {/* Accent customization */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">IDE ACCENT PRESET</span>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((c) => {
              const isSelected = accentColor === c.value;
              const colorClasses: Record<string, string> = {
                orange: "bg-[#F27D26] text-black",
                cyan: "bg-cyan-400 text-zinc-950",
                purple: "bg-purple-500 text-white",
                emerald: "bg-emerald-500 text-zinc-950",
                green: "bg-[#079C3C] text-white",
              };

              return (
                <button
                  key={c.name}
                  onClick={() => onAccentColorChange(c.value)}
                  className={`py-2 px-3 rounded font-bold uppercase text-[10px] tracking-wider transition cursor-pointer flex items-center justify-center gap-1 ${
                    isSelected
                      ? colorClasses[c.value]
                      : "bg-[#0d0d0d] hover:bg-[#1a1a1a] text-zinc-450 border border-[#2a2a2a]"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Terminal Theme Customization */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">TERMINAL LOGS THEME</span>
          <div className="flex flex-col gap-2">
            {themes.map((t) => {
              const isSelected = terminalTheme === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => onTerminalThemeChange(t.value)}
                  className={`w-full text-left p-3 rounded border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-[var(--accent)] bg-[var(--accent-glow)] text-zinc-100"
                      : "border-[#2a2a2a] bg-[#0d0d0d] hover:bg-[#1a1a1a] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold font-mono">{t.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{t.desc}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? "border-[var(--accent)]" : "border-[#3a3a3a]"
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Connectivity Connections */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">CONNECTIVITY INTEGRATIONS</span>
          
          <div className="space-y-3">
            {/* GitHub Connect */}
            <div className="p-4 bg-[#0d0d0d]/60 border border-[#2a2a2a] rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#141414] border border-[#2a2a2a] rounded text-zinc-300">
                  <Github className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 font-mono">GitHub Connection</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Commit and deploy sandboxes directly.</p>
                </div>
              </div>

              <button
                onClick={() => setGitConnected(!gitConnected)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition cursor-pointer ${
                  gitConnected
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-[#141414] hover:bg-[#1a1a1a] border-[#2a2a2a] text-zinc-300"
                }`}
              >
                {gitConnected ? "CONNECTED" : "CONNECT"}
              </button>
            </div>

            {/* Supabase Connect */}
            <div className="p-4 bg-[#0d0d0d]/60 border border-[#2a2a2a] rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#141414] border border-[#2a2a2a] rounded text-zinc-300">
                  <Database className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-100 font-mono">Supabase Core</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Save canvas files persistently in the cloud.</p>
                </div>
              </div>

              <button
                onClick={() => setDbConnected(!dbConnected)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition cursor-pointer ${
                  dbConnected
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-[#141414] hover:bg-[#1a1a1a] border-[#2a2a2a] text-zinc-300"
                }`}
              >
                {dbConnected ? "CONNECTED" : "CONNECT"}
              </button>
            </div>
          </div>
        </div>

        {/* Security Diagnostics info */}
        <div className="p-4 bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-[#2a2a2a] rounded space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-[var(--accent)]" />
            <h4 className="text-xs font-extrabold uppercase text-zinc-200">System Diagnostics</h4>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 space-y-1 bg-black/20 p-3 rounded border border-[#2a2a2a]">
            <div className="flex justify-between">
              <span className="text-zinc-600">IDE version:</span>
              <span>2.4.0-build</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Memory:</span>
              <span>64 MB / Browser Sandboxed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">Compiler pipeline:</span>
              <span>Babel ESNext Transpiler</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600">AI Service Status:</span>
              <span className="text-[var(--accent)] font-bold">GEMINI-2.5-FLASH</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
