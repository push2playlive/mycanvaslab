import React from "react";
import { Palette, Calculator, FileText, CheckCircle, HelpCircle, Code } from "lucide-react";
import { TEMPLATES } from "../data/templates";
import { Template } from "../types";

interface GalleryProps {
  onLoadTemplate: (template: Template) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ onLoadTemplate }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Palette":
        return <Palette className="h-6 w-6 text-purple-400" />;
      case "Calculator":
        return <Calculator className="h-6 w-6 text-sky-400" />;
      case "FileText":
        return <FileText className="h-6 w-6 text-emerald-400" />;
      default:
        return <Code className="h-6 w-6 text-zinc-400" />;
    }
  };

  const handleSelectTemplate = (template: Template) => {
    if (confirm(`Loading the "${template.name}" template will overwrite files in your current virtual workspace. Do you wish to proceed?`)) {
      onLoadTemplate(template);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-400" />
          PLAYGROUND GALLERY
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Load fully functional frontend templates directly into your active workspace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map((template) => (
          <div
            key={template.name}
            onClick={() => handleSelectTemplate(template)}
            className="group relative bg-zinc-950/60 hover:bg-[#0c0c0e] border border-zinc-800 hover:border-purple-500/30 p-5 rounded-xl transition-all duration-350 cursor-pointer flex gap-4"
          >
            {/* Template icon */}
            <div className="p-3 bg-[#111113] border border-zinc-850 rounded-lg group-hover:scale-105 transition-all self-start">
              {getIcon(template.icon)}
            </div>

            {/* Template details */}
            <div className="space-y-1.5 flex-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 group-hover:text-purple-400 transition">
                {template.name}
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {template.description}
              </p>
              <div className="flex gap-2 pt-1">
                {template.files.map((file) => (
                  <span
                    key={file.path}
                    className="text-[9px] font-mono bg-zinc-900 border border-zinc-850 text-zinc-400 px-1.5 py-0.5 rounded"
                  >
                    {file.path}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage card */}
      <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-900 space-y-2 flex gap-3">
        <HelpCircle className="h-5 w-5 text-zinc-500 flex-shrink-0" />
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Custom Workspace Injection</span>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            These templates serve as baseline sandbox targets. You can modify their code, create additional files, or use the built-in **AI Chat Assistant** to write secondary layouts, add animations, or integrate custom endpoints dynamically.
          </p>
        </div>
      </div>
    </div>
  );
};
