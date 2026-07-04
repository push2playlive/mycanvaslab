import React, { useState } from "react";
import { Palette, Calculator, FileText, CheckCircle, HelpCircle, Code, Sparkles } from "lucide-react";
import { TEMPLATES } from "../data/templates";
import { Template } from "../types";

interface GalleryProps {
  onLoadTemplate: (template: Template) => void;
}

const getTemplateSrcDoc = (template: Template): string => {
  const htmlFile = template.files.find((f) => f.path === "index.html");
  if (!htmlFile) return "";
  let compiledHtml = htmlFile.content;

  template.files.forEach((file) => {
    if (file.path === "index.html") return;

    const ext = file.path.split(".").pop()?.toLowerCase();
    if (ext === "css") {
      compiledHtml = compiledHtml.replace(
        "</head>",
        `<style id="injected-${file.path.replace(/\./g, "-")}">\n${file.content}\n</style>\n</head>`
      );
    } else if (ext === "js" || ext === "ts") {
      compiledHtml = compiledHtml.replace(
        "</body>",
        `<script id="injected-${file.path.replace(/\./g, "-")}">\n${file.content}\n</script>\n</body>`
      );
    }
  });

  return compiledHtml;
};

const TemplateSnapshot: React.FC<{ name: string }> = ({ name }) => {
  switch (name) {
    case "Interactive Canvas Sketchpad":
      return (
        <div className="w-full h-full bg-[#0c0c0e] p-3 flex flex-col justify-between relative overflow-hidden select-none">
          <div className="flex justify-between items-center border-b border-zinc-800/80 pb-1.5">
            <span className="text-[8px] font-black text-purple-400 font-mono tracking-wider">NEON BRUSH LAB</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative my-1.5 bg-black rounded border border-zinc-900">
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 60">
              <path
                d="M10,35 Q30,10 50,35 T90,35"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path
                d="M15,45 Q35,15 55,45 T85,15"
                fill="none"
                stroke="#ec4899"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
            <span className="text-[7px] text-zinc-600 font-mono absolute bottom-1 right-1">Neon Canvas</span>
          </div>
          <div className="flex gap-1 items-center justify-between text-[7px] text-zinc-500 font-mono">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <div className="w-2 h-2 rounded-full bg-pink-500"></div>
              <div className="w-2 h-2 rounded-full bg-sky-400"></div>
            </div>
            <span>5px brush</span>
          </div>
        </div>
      );
    case "Cosmic Scientific Calculator":
      return (
        <div className="w-full h-full bg-[#07090e] p-3 flex flex-col justify-between select-none font-mono">
          <div className="bg-black border border-zinc-800 p-1.5 rounded text-right space-y-0.5">
            <div className="text-[6px] text-sky-500/80 tracking-widest">COSMIC COMPUTING</div>
            <div className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 leading-none">
              2.7182818
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-1.5 flex-1">
            {["C", "7", "8", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "="].map((val, idx) => (
              <div
                key={idx}
                className={`text-[7px] flex items-center justify-center rounded border ${
                  val === "="
                    ? "col-span-2 bg-gradient-to-r from-sky-500 to-indigo-600 border-sky-400/30 text-white font-black"
                    : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400"
                }`}
              >
                {val}
              </div>
            ))}
          </div>
        </div>
      );
    case "Elegant Markdown Document Editor":
      return (
        <div className="w-full h-full bg-[#0a0a0c] p-2.5 flex gap-1.5 select-none font-mono">
          <div className="flex-1 bg-zinc-900/40 border border-zinc-850 rounded p-1.5 flex flex-col justify-between">
            <span className="text-[6px] text-zinc-500 uppercase font-black">editor.md</span>
            <div className="space-y-1 my-1">
              <div className="h-1 bg-zinc-800 rounded w-11/12"></div>
              <div className="h-1 bg-zinc-800 rounded w-8/12"></div>
              <div className="h-1 bg-emerald-500/20 rounded w-full"></div>
            </div>
            <div className="h-1 bg-zinc-850 rounded w-2/5"></div>
          </div>
          <div className="flex-1 bg-black border border-zinc-900 rounded p-1.5 flex flex-col justify-between">
            <span className="text-[6px] text-emerald-500 uppercase font-black">compile</span>
            <div className="space-y-1 my-1">
              <div className="h-1 bg-emerald-500/30 rounded w-11/12"></div>
              <div className="h-1 bg-zinc-800 rounded w-10/12"></div>
              <div className="h-1 bg-zinc-800 rounded w-full"></div>
            </div>
            <div className="h-2 bg-emerald-950/40 border border-emerald-900/30 rounded flex items-center pl-1">
              <div className="w-1.5 h-1 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </div>
      );
    case "MyCanvasLab & utube.media Hub":
      return (
        <div className="w-full h-full bg-[#040804] p-3 flex flex-col justify-between relative overflow-hidden select-none font-mono">
          <div className="flex justify-between items-center border-b border-[#1ae854]/10 pb-1">
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#1ae854] animate-pulse"></span>
              <span className="text-[6px] font-black text-[#1ae854]">MYCANVASLAB</span>
            </div>
            <span className="text-[5px] text-zinc-500">utube.media</span>
          </div>
          <div className="flex-1 bg-black rounded border border-[#1ae854]/10 my-1 relative flex items-center justify-center">
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 50">
              <path
                d="M5,25 Q20,5 35,25 T65,25 T95,25"
                fill="none"
                stroke="#1ae854"
                strokeWidth="0.8"
                className="opacity-70"
              />
              <path
                d="M5,25 Q15,40 30,25 T60,25 T95,25"
                fill="none"
                stroke="#1ae854"
                strokeWidth="0.4"
                className="opacity-40"
              />
            </svg>
            <div className="absolute top-1 left-1 bg-red-950/60 border border-red-900/40 px-1 py-0.5 rounded flex items-center gap-0.5 scale-[0.8] origin-top-left">
              <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[5px] text-red-400 font-bold uppercase leading-none">LIVE</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[5.5px]">
            <span className="text-[#1ae854] font-bold">142,850 SUBS</span>
            <span className="text-zinc-500">STABLE</span>
          </div>
        </div>
      );
    default:
      return (
        <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-500 text-xs">
          Preview unavailable
        </div>
      );
  }
};

export const Gallery: React.FC<GalleryProps> = ({ onLoadTemplate }) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

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
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-400" />
          PLAYGROUND GALLERY
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Load fully functional frontend templates directly into your active workspace</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {TEMPLATES.map((template) => (
          <div
            key={template.name}
            onMouseEnter={() => setHoveredTemplate(template.name)}
            onMouseLeave={() => setHoveredTemplate(null)}
            className="group relative bg-zinc-950/60 hover:bg-[#0c0c0e] border border-zinc-850 hover:border-purple-500/30 p-4 rounded-xl transition-all duration-350 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center"
          >
            {/* Left group with details & files */}
            <div 
              onClick={() => handleSelectTemplate(template)}
              className="flex-1 min-w-0 flex gap-3 cursor-pointer"
            >
              {/* Template icon */}
              <div className="p-2.5 bg-[#111113] border border-zinc-850 rounded-lg group-hover:scale-105 transition-all self-start shrink-0">
                {getIcon(template.icon)}
              </div>

              {/* Template details */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-200 group-hover:text-purple-400 transition truncate">
                  {template.name}
                </h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {template.files.map((file) => (
                    <span
                      key={file.path}
                      className="text-[8px] font-mono bg-zinc-900 border border-zinc-850 text-zinc-400 px-1.5 py-0.5 rounded shrink-0"
                    >
                      {file.path}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Group: Live Interactive Scaled Snapshot Preview */}
            <div 
              onClick={(e) => {
                // If they click inside this container, they can interact, but click on border/hover indicator doesn't load template
                e.stopPropagation();
              }}
              className="w-full sm:w-[180px] h-[120px] rounded-lg overflow-hidden border border-zinc-800 bg-black relative shrink-0 self-center shadow-lg group-hover:border-purple-500/40 transition-colors"
            >
              {hoveredTemplate === template.name ? (
                <div className="w-full h-full relative">
                  {/* Scaled-down interactive iframe */}
                  <div 
                    className="absolute origin-top-left"
                    style={{
                      width: "720px",
                      height: "480px",
                      transform: "scale(0.25)",
                      pointerEvents: "auto",
                    }}
                  >
                    <iframe
                      srcDoc={getTemplateSrcDoc(template)}
                      sandbox="allow-scripts allow-modals allow-same-origin"
                      className="w-full h-full border-none bg-black"
                      title={`${template.name} Hover Preview`}
                    />
                  </div>
                  {/* Interactive hint tag */}
                  <div className="absolute bottom-1 right-1 bg-purple-950/90 border border-purple-500/35 px-1 py-0.5 rounded text-[7px] text-purple-300 font-bold uppercase tracking-wider font-sans pointer-events-none select-none z-10 animate-pulse">
                    Interactive Preview
                  </div>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <TemplateSnapshot name={template.name} />
                  {/* Subtle hover instructions overlay */}
                  <div className="absolute inset-0 bg-black/40 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300 pointer-events-none">
                    <div className="bg-zinc-950/95 border border-zinc-800/80 px-2 py-1 rounded text-[8px] font-bold text-zinc-300 uppercase tracking-widest font-mono shadow-xl flex items-center gap-1">
                      <Sparkles className="h-2 w-2 text-purple-400 animate-spin" />
                      Hover to play
                    </div>
                  </div>
                </div>
              )}
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
