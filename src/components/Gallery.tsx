import React from "react";
import { Sparkles, ArrowRight, Layers, LayoutGrid, Terminal, Eye, Check } from "lucide-react";
import { GALLERY_TEMPLATES } from "../data/templates";
import { GalleryTemplate } from "../types";

interface GalleryProps {
  onLoadTemplate: (template: GalleryTemplate) => void;
  activeTemplateId?: string;
}

export default function Gallery({ onLoadTemplate, activeTemplateId }: GalleryProps) {
  return (
    <div className="flex flex-col h-full bg-[#141414] text-zinc-300 select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2a2a] bg-[#141414]">
        <div className="flex items-center gap-1.5">
          <LayoutGrid className="h-4 w-4 text-[var(--accent)]" />
          <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">PUBLIC CANVAS GALLERY</span>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">
          Explore and launch high-fidelity, ready-made canvas templates with one click.
        </p>
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-[#0d0d0d]/10">
        {GALLERY_TEMPLATES.map((tpl) => {
          const isActive = activeTemplateId === tpl.id;

          return (
            <div
              key={tpl.id}
              className={`group relative bg-[#0d0d0d]/70 hover:bg-[#0d0d0d] border rounded p-5 transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? "border-[var(--accent)] shadow-[0_0_30px_var(--accent-glow)]"
                  : "border-[#2a2a2a] hover:border-[var(--accent)]/40"
              }`}
            >
              <div className="absolute top-0 right-0 h-24 w-24 bg-[var(--accent-glow)]/3 rounded-full blur-2xl pointer-events-none group-hover:bg-[var(--accent-glow)]/10 transition-all duration-300"></div>

              <div>
                {/* Badge Category */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent)] bg-[var(--accent-glow)] border border-[var(--accent)]/20 px-2.5 py-0.5 rounded-full">
                    {tpl.category}
                  </span>
                  {isActive && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      <Check className="h-3 w-3" /> Loaded
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-[var(--accent)] transition font-mono mb-2">
                  {tpl.title}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                  {tpl.description}
                </p>
              </div>

              {/* Loader Button */}
              <button
                onClick={() => onLoadTemplate(tpl)}
                disabled={isActive}
                className={`w-full py-2 px-4 text-xs font-bold uppercase tracking-wider rounded transition duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  isActive
                    ? "bg-[#1a1a1a] text-zinc-600 border border-[#2a2a2a] cursor-not-allowed"
                    : "bg-[var(--accent)] hover:opacity-90 text-[var(--accent-text)] font-black"
                }`}
              >
                <span>{isActive ? "Currently Active Workspace" : "Load Canvas Template"}</span>
                {!isActive && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
