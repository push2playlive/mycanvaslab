import React, { useState } from "react";
import { Palette, Calculator, FileText, CheckCircle, HelpCircle, Code, Sparkles, Eye, RefreshCw, Monitor, Tablet, Smartphone, X, Copy, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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

const TemplateMiniThumbnail: React.FC<{ name: string }> = ({ name }) => {
  switch (name) {
    case "Interactive Canvas Sketchpad":
      return (
        <div className="w-full h-full bg-[#0c0c0e] flex flex-col justify-between p-1.5 relative overflow-hidden select-none">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-0.5">
            <span className="text-[5px] font-black text-purple-400 font-mono tracking-wider">NEON</span>
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-purple-500"></span>
              <span className="w-1 h-1 rounded-full bg-pink-500"></span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative my-0.5 bg-black rounded border border-zinc-900/50">
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 80 40">
              <path
                d="M10,25 Q30,5 50,25 T70,15"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_3px_rgba(168,85,247,0.8)]"
              />
              <path
                d="M15,30 Q35,10 55,30"
                fill="none"
                stroke="#ec4899"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
      );
    case "Cosmic Scientific Calculator":
      return (
        <div className="w-full h-full bg-[#07090e] p-1.5 flex flex-col justify-between select-none font-mono">
          <div className="bg-black border border-zinc-900 p-1 rounded text-right space-y-0.5">
            <div className="text-[7px] font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 leading-none">
              3.14159
            </div>
          </div>
          <div className="grid grid-cols-4 gap-0.5 mt-1 flex-1">
            {["C", "7", "8", "/", "4", "5", "6", "*", "1", "2", "=", "+"].map((val, idx) => (
              <div
                key={idx}
                className={`text-[5px] flex items-center justify-center rounded-[2px] border ${
                  val === "="
                    ? "bg-gradient-to-r from-sky-500 to-indigo-600 border-sky-400/30 text-white font-black"
                    : "bg-zinc-900/60 border-zinc-850 text-zinc-500"
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
        <div className="w-full h-full bg-[#0a0a0c] p-1.5 flex gap-1 select-none font-mono">
          <div className="flex-1 bg-zinc-900/40 border border-zinc-850 rounded p-1 flex flex-col justify-between">
            <div className="space-y-0.5 my-0.5">
              <div className="h-0.5 bg-zinc-800 rounded w-11/12"></div>
              <div className="h-0.5 bg-zinc-800 rounded w-8/12"></div>
              <div className="h-0.5 bg-emerald-500/20 rounded w-full"></div>
            </div>
          </div>
          <div className="flex-1 bg-black border border-zinc-900 rounded p-1 flex flex-col justify-between">
            <div className="space-y-0.5 my-0.5">
              <div className="h-0.5 bg-emerald-500/30 rounded w-11/12"></div>
              <div className="h-0.5 bg-zinc-800 rounded w-10/12"></div>
            </div>
            <div className="h-1 bg-emerald-950/40 border border-emerald-900/30 rounded flex items-center pl-0.5">
              <div className="w-1 h-0.5 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </div>
      );
    case "MyCanvasLab & utube.media Hub":
      return (
        <div className="w-full h-full bg-[#040804] p-1.5 flex flex-col justify-between relative overflow-hidden select-none font-mono">
          <div className="flex justify-between items-center border-b border-[#1ae854]/10 pb-0.5">
            <span className="text-[5px] font-black text-[#1ae854]">LIVE</span>
          </div>
          <div className="flex-1 bg-black rounded border border-[#1ae854]/10 my-0.5 relative flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full absolute inset-0" viewBox="0 0 80 30">
              <path
                d="M5,15 Q20,2 35,15 T65,15 T75,15"
                fill="none"
                stroke="#1ae854"
                strokeWidth="1"
                className="opacity-70 drop-shadow-[0_0_2px_rgba(26,232,84,0.8)]"
              />
            </svg>
          </div>
        </div>
      );
    default:
      return (
        <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-500 text-[8px]">
          No Preview
        </div>
      );
  }
};

const TEMPLATE_CATEGORIES: Record<string, string[]> = {
  "Interactive Canvas Sketchpad": ["Interactive", "Creative", "Utility"],
  "Cosmic Scientific Calculator": ["Utility", "Tool"],
  "Elegant Markdown Document Editor": ["Editor", "Utility"],
  "MyCanvasLab & utube.media Hub": ["Dashboard", "Interactive", "Analytics"],
};

export const Gallery: React.FC<GalleryProps> = ({ onLoadTemplate }) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [activeHoverTemplate, setActiveHoverTemplate] = useState<Template | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [selectedDetailTemplate, setSelectedDetailTemplate] = useState<Template | null>(null);
  const [modalResponsiveMode, setModalResponsiveMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [modalSelectedFilePath, setModalSelectedFilePath] = useState<string | null>(null);
  const [modalIframeKey, setModalIframeKey] = useState<number>(0);
  const [copiedFilePath, setCopiedFilePath] = useState<string | null>(null);

  const getMiniIcon = (iconName: string) => {
    switch (iconName) {
      case "Palette":
        return <Palette className="h-3.5 w-3.5 text-purple-400" />;
      case "Calculator":
        return <Calculator className="h-3.5 w-3.5 text-sky-400" />;
      case "FileText":
        return <FileText className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <Code className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const handleSelectTemplate = (template: Template) => {
    if (confirm(`Loading the "${template.name}" template will overwrite files in your current virtual workspace. Do you wish to proceed?`)) {
      onLoadTemplate(template);
    }
  };

  const filteredTemplates = TEMPLATES.filter((template) => {
    if (selectedCategory === "All") return true;
    return TEMPLATE_CATEGORIES[template.name]?.includes(selectedCategory);
  });

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-400" />
            PLAYGROUND GALLERY
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Load fully functional frontend templates directly into your active workspace</p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto bg-black/40 p-1 rounded-xl border border-zinc-900">
          {["All", "Interactive", "Dashboard", "Utility", "Editor"].map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-purple-950/30 text-purple-400 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                    : "border border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="p-12 text-center text-xs text-zinc-500 font-mono italic border border-dashed border-zinc-900 rounded-xl">
          No templates found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 animate-fadeIn">
          {filteredTemplates.map((template) => (
            <div
              key={template.name}
              onMouseEnter={() => {
                setHoveredTemplate(template.name);
                setActiveHoverTemplate(template);
              }}
              onMouseLeave={() => {
                setHoveredTemplate(null);
                setActiveHoverTemplate(null);
              }}
              onMouseMove={(e) => {
                setMousePos({ x: e.clientX, y: e.clientY });
              }}
              className="group relative bg-zinc-950/60 hover:bg-[#0c0c0e] border border-zinc-850 hover:border-purple-500/30 p-4 rounded-xl transition-all duration-350 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center animate-fadeIn"
            >
              {/* Left group with details & files */}
              <div 
                onClick={() => {
                  setSelectedDetailTemplate(template);
                  setModalSelectedFilePath(null);
                  setModalResponsiveMode("desktop");
                }}
                className="flex-1 min-w-0 flex gap-4 cursor-pointer"
              >
                {/* Template thumbnail preview */}
                <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border border-zinc-800 bg-black shrink-0 self-start group-hover:scale-105 transition-all shadow-md group-hover:border-purple-500/30">
                  <TemplateMiniThumbnail name={template.name} />
                  
                  {/* Absolute Category Tags on the Thumbnail */}
                  <div className="absolute top-1 left-1 flex flex-col gap-0.5 pointer-events-none">
                    {(TEMPLATE_CATEGORIES[template.name] || []).slice(0, 1).map((tag) => (
                      <span 
                        key={tag} 
                        className="text-[5px] font-extrabold uppercase tracking-wide bg-purple-950/90 text-purple-300 border border-purple-950 px-1 py-0.2 rounded shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="absolute bottom-1 right-1 p-1 bg-black/85 backdrop-blur-sm border border-zinc-800 rounded-md">
                    {getMiniIcon(template.icon)}
                  </div>
                </div>

                {/* Template details */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-200 group-hover:text-purple-400 transition truncate">
                      {template.name}
                    </h3>
                  </div>
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

                  {/* Explicit action buttons */}
                  <div className="flex items-center gap-2 pt-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleSelectTemplate(template)}
                      className="px-2.5 py-1 bg-purple-950/45 hover:bg-purple-900/50 text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      title="Inject this template into your workspace"
                    >
                      <Sparkles className="h-2.5 w-2.5" /> Load Template
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDetailTemplate(template);
                        setModalSelectedFilePath(null);
                        setModalResponsiveMode("desktop");
                      }}
                      className="px-2.5 py-1 bg-zinc-900/80 hover:bg-zinc-850 text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-750 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                      title="Inspect code and view responsive live simulation"
                    >
                      <Eye className="h-2.5 w-2.5 text-zinc-400" /> View Details
                    </button>
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
      )}

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

      {/* Floating Hover live-rendered Popover Preview */}
      <AnimatePresence>
        {activeHoverTemplate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="fixed z-[9999] pointer-events-none w-[360px] h-[240px] bg-[#09090b]/95 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col"
            style={{
              left: `${Math.min(window.innerWidth - 380, mousePos.x + 20)}px`,
              top: `${Math.min(window.innerHeight - 260, mousePos.y + 20)}px`,
            }}
          >
            {/* Popover Header */}
            <div className="px-3.5 py-2 border-b border-zinc-800/80 bg-black/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1 bg-purple-500/10 border border-purple-500/25 rounded-md text-purple-400">
                  <Palette className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-200 truncate">
                  {activeHoverTemplate.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Live View
                </span>
              </div>
            </div>

            {/* Live-Rendered Iframe Body */}
            <div className="flex-1 bg-black relative overflow-hidden">
              <div 
                className="absolute origin-top-left"
                style={{
                  width: "720px",
                  height: "400px",
                  transform: "scale(0.5)",
                }}
              >
                <iframe
                  srcDoc={getTemplateSrcDoc(activeHoverTemplate)}
                  sandbox="allow-scripts allow-modals allow-same-origin"
                  className="w-full h-full border-none bg-black"
                  title={`${activeHoverTemplate.name} Popover Preview`}
                />
              </div>
            </div>

            {/* Popover Footer Info */}
            <div className="px-3 py-1.5 border-t border-zinc-900 bg-black/85 flex items-center justify-between shrink-0 text-[8px] font-mono text-zinc-500">
              <span>{activeHoverTemplate.files.length} Source files</span>
              <span className="text-purple-400 font-bold uppercase">Template Preview</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High-Fidelity Full-Screen Interactive Preview Modal */}
      <AnimatePresence>
        {selectedDetailTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full h-full max-w-7xl bg-zinc-950 border border-zinc-850 rounded-2xl shadow-[0_0_80px_rgba(168,85,247,0.15)] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                    <Palette className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">
                      {selectedDetailTemplate.name}
                    </h2>
                    <p className="text-[10px] text-zinc-500">
                      Isolated Sandbox Environment • Real-time interactive inspection
                    </p>
                  </div>
                </div>

                {/* Right actions: Load Template, Close */}
                <div className="flex items-center gap-4">
                  {/* Load Template directly from Modal */}
                  <button
                    onClick={() => {
                      handleSelectTemplate(selectedDetailTemplate);
                    }}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-[11px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                  >
                    <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Load into Workspace
                  </button>

                  <div className="h-6 w-[1px] bg-zinc-800 hidden sm:block"></div>

                  {/* Close button */}
                  <button
                    onClick={() => setSelectedDetailTemplate(null)}
                    className="p-1.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-850 rounded-lg text-zinc-400 hover:text-zinc-200 transition cursor-pointer flex items-center justify-center"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Workspace Split Layout */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left side: Navigation / File explorer & details */}
                <div className="w-[280px] bg-zinc-950/80 border-r border-zinc-900 flex flex-col shrink-0 overflow-y-auto p-4 space-y-4">
                  {/* Category Details & Description */}
                  <div className="space-y-1.5 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-850/60">
                    <div className="flex flex-wrap gap-1">
                      {(TEMPLATE_CATEGORIES[selectedDetailTemplate.name] || []).map((tag) => (
                        <span key={tag} className="text-[8px] font-extrabold uppercase tracking-wide bg-purple-950/40 text-purple-400 border border-purple-500/15 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-sans">
                      {selectedDetailTemplate.description}
                    </p>
                  </div>

                  {/* File inspector tree */}
                  <div className="space-y-2 flex-1 flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                      📚 Template Source Code Explorer
                    </span>

                    <div className="space-y-1 overflow-y-auto flex-1">
                      {/* Live Sandbox Interactive Option */}
                      <button
                        onClick={() => setModalSelectedFilePath(null)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-[10px] font-mono font-bold transition-all border text-left cursor-pointer ${
                          modalSelectedFilePath === null
                            ? "bg-purple-950/20 text-purple-300 border-purple-500/25"
                            : "bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/60 hover:text-zinc-300"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          <span>* Live Sandbox View</span>
                        </span>
                        <span className="text-[8px] uppercase tracking-wider px-1 bg-emerald-950/40 border border-emerald-500/20 rounded text-emerald-400 font-sans">
                          Active
                        </span>
                      </button>

                      {/* Individual files */}
                      {selectedDetailTemplate.files.map((file) => {
                        const isSelected = modalSelectedFilePath === file.path;
                        const ext = file.path.split(".").pop() || "";
                        return (
                          <button
                            key={file.path}
                            onClick={() => {
                              setModalSelectedFilePath(file.path);
                              setCopiedFilePath(null);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-[10px] font-mono transition-all border text-left cursor-pointer ${
                              isSelected
                                ? "bg-zinc-900 text-purple-400 border-zinc-800 font-bold"
                                : "bg-transparent text-zinc-500 border-transparent hover:bg-zinc-900/30 hover:text-zinc-400"
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-purple-400" : "text-zinc-600"}`} />
                              <span className="truncate">{file.path}</span>
                            </span>
                            <span className="text-[8px] uppercase tracking-wider font-sans text-zinc-600">
                              .{ext}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Main section: Sandbox Preview or Source Code Viewer */}
                <div className="flex-1 bg-black flex flex-col overflow-hidden relative">
                  {modalSelectedFilePath === null ? (
                    <>
                      {/* Responsive View Switcher Bar */}
                      <div className="px-4 py-2 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setModalResponsiveMode("desktop")}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide transition flex items-center gap-1.5 border cursor-pointer ${
                              modalResponsiveMode === "desktop"
                                ? "bg-purple-950/40 text-purple-400 border-purple-500/25"
                                : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300"
                            }`}
                          >
                            <Monitor className="h-3 w-3" /> Desktop
                          </button>
                          <button
                            onClick={() => setModalResponsiveMode("tablet")}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide transition flex items-center gap-1.5 border cursor-pointer ${
                              modalResponsiveMode === "tablet"
                                ? "bg-purple-950/40 text-purple-400 border-purple-500/25"
                                : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300"
                            }`}
                          >
                            <Tablet className="h-3 w-3" /> Tablet
                          </button>
                          <button
                            onClick={() => setModalResponsiveMode("mobile")}
                            className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide transition flex items-center gap-1.5 border cursor-pointer ${
                              modalResponsiveMode === "mobile"
                                ? "bg-purple-950/40 text-purple-400 border-purple-500/25"
                                : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300"
                            }`}
                          >
                            <Smartphone className="h-3 w-3" /> Mobile
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Live view tag */}
                          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline">
                            Width: {modalResponsiveMode === "desktop" ? "100%" : modalResponsiveMode === "tablet" ? "768px" : "375px"}
                          </span>
                          
                          {/* Refresh button */}
                          <button
                            onClick={() => setModalIframeKey((prev) => prev + 1)}
                            className="p-1 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded border border-transparent hover:border-zinc-850 transition cursor-pointer flex items-center justify-center"
                            title="Reload live preview sandbox"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Sandbox iframe Container with Spring-guided sizing */}
                      <div className="flex-1 overflow-auto p-6 bg-zinc-950/40 flex items-center justify-center">
                        <motion.div
                          layout
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="h-full bg-black border border-zinc-850 rounded-xl overflow-hidden shadow-2xl relative flex flex-col"
                          style={{
                            width:
                              modalResponsiveMode === "desktop"
                                ? "100%"
                                : modalResponsiveMode === "tablet"
                                ? "768px"
                                : "375px",
                            maxHeight: "100%",
                          }}
                        >
                          {/* Simulated Browser Bar */}
                          <div className="px-3.5 py-2 border-b border-zinc-900 bg-black/80 flex items-center justify-between shrink-0 font-mono select-none">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></span>
                            </div>
                            <div className="bg-zinc-900/60 border border-zinc-850/60 px-3 py-0.5 rounded text-[8px] text-zinc-500 tracking-wider w-[240px] truncate text-center font-mono">
                              sandbox://canvaslab.io/{selectedDetailTemplate.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                            </div>
                            <div className="w-10"></div>
                          </div>

                          {/* Render Area */}
                          <div className="flex-1 bg-black relative">
                            <iframe
                              key={modalIframeKey}
                              srcDoc={getTemplateSrcDoc(selectedDetailTemplate)}
                              sandbox="allow-scripts allow-modals allow-same-origin"
                              className="w-full h-full border-none bg-black"
                              title={`${selectedDetailTemplate.name} Live Sandbox`}
                            />
                          </div>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Code Inspector Header / Control Bar */}
                      {(() => {
                        const fileObj = selectedDetailTemplate.files.find((f) => f.path === modalSelectedFilePath);
                        return (
                          <>
                            <div className="px-5 py-3 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between flex-shrink-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-purple-400">
                                  {modalSelectedFilePath}
                                </span>
                                <span className="text-[9px] text-zinc-500 font-mono font-bold bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-md uppercase">
                                  {fileObj?.content.split("\n").length} Lines
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  if (fileObj) {
                                    navigator.clipboard.writeText(fileObj.content);
                                    setCopiedFilePath(modalSelectedFilePath);
                                    setTimeout(() => setCopiedFilePath(null), 2000);
                                  }
                                }}
                                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-[9px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
                              >
                                {copiedFilePath === modalSelectedFilePath ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 text-zinc-500" />
                                    <span>Copy Code</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Code Render Block */}
                            <div className="flex-1 overflow-auto p-5 bg-black/90 font-mono text-zinc-300 selection:bg-purple-900/30 selection:text-purple-200">
                              <pre className="text-xs leading-relaxed overflow-x-auto whitespace-pre">
                                <code>{fileObj?.content || "// File not found"}</code>
                              </pre>
                            </div>
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>

              {/* Modal footer info */}
              <div className="px-6 py-2.5 bg-zinc-950 border-t border-zinc-900 text-[9px] text-zinc-600 font-mono flex items-center justify-between flex-shrink-0">
                <span>Playground Template Environment v1.4</span>
                <span className="text-zinc-500">
                  Select files to inspect or choose "Live Sandbox View" to interact.
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
