import React, { useState } from "react";
import { Palette, Calculator, FileText, CheckCircle, HelpCircle, Code, Sparkles, Eye, RefreshCw, Monitor, Tablet, Smartphone, X, Copy, Check, Grid, List, GitCompare, AlertTriangle, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { TEMPLATES } from "../data/templates";
import { Template, VirtualFile } from "../types";
import { FileStructureCanvas } from "./FileStructureCanvas";
import { DiffViewer } from "./DiffViewer";

interface GalleryProps {
  onLoadTemplate: (template: Template) => void;
  currentFiles?: VirtualFile[];
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

const TEMPLATE_TAGS: Record<string, string[]> = {
  "Interactive Canvas Sketchpad": ["HTML5", "Canvas", "Tailwind", "JavaScript", "Interactive", "Creative", "UI", "Animations"],
  "Cosmic Scientific Calculator": ["HTML5", "CSS Grid", "Tailwind", "JavaScript", "Math", "Utility", "UI", "Data"],
  "Elegant Markdown Document Editor": ["Markdown", "HTML5", "Tailwind", "JavaScript", "Editor", "Utility", "UI", "Data"],
  "MyCanvasLab & utube.media Hub": ["React", "TypeScript", "Tailwind", "Socket.io", "Zustand", "Framer Motion", "Dashboard", "Analytics", "Interactive", "UI", "Data", "Animations"],
};

export const Gallery: React.FC<GalleryProps> = ({ onLoadTemplate, currentFiles = [] }) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [activeHoverTemplate, setActiveHoverTemplate] = useState<Template | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [activeCardPreviews, setActiveCardPreviews] = useState<Record<string, boolean>>({});
  const [cardIframeKeys, setCardIframeKeys] = useState<Record<string, number>>({});

  const [selectedDetailTemplate, setSelectedDetailTemplate] = useState<Template | null>(null);
  const [modalResponsiveMode, setModalResponsiveMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [modalSelectedFilePath, setModalSelectedFilePath] = useState<string | null>(null);
  const [modalIframeKey, setModalIframeKey] = useState<number>(0);
  const [copiedFilePath, setCopiedFilePath] = useState<string | null>(null);
  const [rightPanelModes, setRightPanelModes] = useState<Record<string, "demo" | "structure">>({});

  const [quickPreviewTemplate, setQuickPreviewTemplate] = useState<Template | null>(null);
  const [quickPreviewSelectedFilePath, setQuickPreviewSelectedFilePath] = useState<string | null>(null);
  const [quickPreviewCopied, setQuickPreviewCopied] = useState<boolean>(false);
  const [quickPreviewFileSearchQuery, setQuickPreviewFileSearchQuery] = useState<string>("");

  // Advanced Diffing States and Helpers
  const [detailModalDiff, setDetailModalDiff] = useState<boolean>(false);
  const [quickPreviewDiff, setQuickPreviewDiff] = useState<boolean>(false);

  const getFileStatus = (filePath: string, templateFiles: VirtualFile[]) => {
    const currentFile = currentFiles.find((f) => f.path === filePath);
    if (!currentFile) return "added";
    const templateFile = templateFiles.find((f) => f.path === filePath);
    if (!templateFile) return "added";
    return currentFile.content === templateFile.content ? "unchanged" : "modified";
  };

  const getDeletedFiles = (templateFiles: VirtualFile[]) => {
    const templatePaths = new Set(templateFiles.map((f) => f.path));
    return currentFiles.filter((f) => !templatePaths.has(f.path));
  };

  const toggleCardPreview = (templateName: string) => {
    setActiveCardPreviews((prev) => ({
      ...prev,
      [templateName]: !prev[templateName],
    }));
  };

  const reloadCardIframe = (templateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardIframeKeys((prev) => ({
      ...prev,
      [templateName]: (prev[templateName] || 0) + 1,
    }));
  };

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
    const matchesCategory = selectedCategory === "All" || TEMPLATE_CATEGORIES[template.name]?.includes(selectedCategory);
    const matchesTag = !selectedTag || TEMPLATE_TAGS[template.name]?.includes(selectedTag);
    return matchesCategory && matchesTag;
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

        {/* Category Filter Pills & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-zinc-900">
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

          {/* View Mode Toggle Switch */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-zinc-900 select-none shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                viewMode === "grid"
                  ? "bg-purple-950/30 text-purple-400 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
              title="Grid View"
            >
              <Grid className="h-3 w-3" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                viewMode === "list"
                  ? "bg-purple-950/30 text-purple-400 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
              title="List View"
            >
              <List className="h-3 w-3" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Tag Filtering Section */}
      <div className="p-4 bg-zinc-950/40 border border-zinc-900 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
              Filter by Tech Stack / Library Tags
            </span>
          </div>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[9px] font-bold text-purple-400 hover:text-purple-350 cursor-pointer flex items-center gap-1 bg-purple-950/20 px-2 py-1 rounded-md border border-purple-500/20 transition-all"
            >
              Clear Tag <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Grouped Tag Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Core Capabilities Group */}
          <div className="space-y-2">
            <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              ⚡ Core Capabilities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["UI", "Data", "Animations", "Interactive", "Utility", "Creative", "Editor", "Dashboard"].map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`px-3 py-1.5 rounded-lg text-[9.5px] font-mono transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? "bg-purple-950/45 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)] font-bold animate-pulse"
                        : "bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      tag === "UI" ? "bg-[#8b5cf6]" :
                      tag === "Data" ? "bg-[#0ea5e9]" :
                      tag === "Animations" ? "bg-[#f43f5e]" :
                      tag === "Interactive" ? "bg-[#10b981]" :
                      tag === "Utility" ? "bg-[#f59e0b]" :
                      tag === "Creative" ? "bg-[#ec4899]" :
                      tag === "Editor" ? "bg-[#10b981]" :
                      tag === "Dashboard" ? "bg-[#a855f7]" :
                      "bg-zinc-600"
                    }`} />
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tech Stack / Languages Group */}
          <div className="space-y-2">
            <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
              🛠️ Tech Stack &amp; Libraries
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["React", "TypeScript", "Tailwind", "Socket.io", "Zustand", "Framer Motion", "HTML5", "CSS Grid", "JavaScript", "Markdown", "Math", "Canvas"].map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`px-3 py-1.5 rounded-lg text-[9.5px] font-mono transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? "bg-purple-950/45 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.25)] font-bold animate-pulse"
                        : "bg-zinc-950 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      tag === "React" ? "bg-[#14b8a6]" :
                      tag === "TypeScript" ? "bg-[#3b82f6]" :
                      tag === "Tailwind" ? "bg-[#06b6d4]" :
                      tag === "Socket.io" ? "bg-[#10b981]" :
                      tag === "Framer Motion" ? "bg-[#ec4899]" :
                      tag === "HTML5" ? "bg-[#f97316]" :
                      tag === "Canvas" ? "bg-[#e11d48]" :
                      "bg-zinc-600"
                    }`} />
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="p-12 text-center text-xs text-zinc-500 font-mono italic border border-dashed border-zinc-900 rounded-xl">
          No templates found in this category.
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 xl:grid-cols-2 gap-5 animate-fadeIn" : "flex flex-col gap-4 animate-fadeIn"}>
          {filteredTemplates.map((template) => {
            const isPreviewOpen = !!activeCardPreviews[template.name];
            return (
              <div
                key={template.name}
                onMouseEnter={() => {
                  if (!isPreviewOpen) {
                    setHoveredTemplate(template.name);
                    setActiveHoverTemplate(template);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredTemplate(null);
                  setActiveHoverTemplate(null);
                }}
                onMouseMove={(e) => {
                  if (!isPreviewOpen) {
                    setMousePos({ x: e.clientX, y: e.clientY });
                  }
                }}
                className={`group relative bg-zinc-950/60 hover:bg-[#0c0c0e] border p-4 rounded-xl transition-all duration-350 flex flex-col gap-4 animate-fadeIn ${
                  isPreviewOpen
                    ? "border-emerald-500/30 col-span-1 xl:col-span-2 shadow-[0_0_24px_rgba(16,185,129,0.06)] bg-zinc-950/95"
                    : "border-zinc-850 hover:border-purple-500/30 sm:flex-row justify-between items-stretch sm:items-center"
                }`}
              >
                {/* Top/Main Details Row */}
                <div className={`flex-1 min-w-0 flex flex-col sm:flex-row gap-4 justify-between ${isPreviewOpen ? "items-start w-full border-b border-zinc-900 pb-4" : "items-stretch sm:items-center"}`}>
                  
                  {/* Left block: details & thumbnail info */}
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

                      {/* Tech Tags on Card */}
                      <div className="flex flex-wrap gap-1 pt-2 items-center" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[7px] font-mono uppercase tracking-wider text-zinc-600 font-bold select-none mr-1">Tags:</span>
                        {(TEMPLATE_TAGS[template.name] || []).map((tag) => {
                          const isSelected = selectedTag === tag;
                          return (
                            <button
                              key={tag}
                              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                              className={`text-[8px] font-mono px-2 py-0.5 rounded-md border transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                                isSelected
                                  ? "bg-purple-950/45 text-purple-300 border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.2)]"
                                  : "bg-zinc-950/80 text-zinc-500 border-zinc-900 hover:text-zinc-300 hover:border-zinc-800"
                              }`}
                            >
                              <span className={`w-1 h-1 rounded-full ${
                                tag === "React" ? "bg-[#14b8a6]" :
                                tag === "TypeScript" ? "bg-[#3b82f6]" :
                                tag === "Tailwind" ? "bg-[#06b6d4]" :
                                tag === "Socket.io" ? "bg-[#10b981]" :
                                tag === "Framer Motion" ? "bg-[#ec4899]" :
                                tag === "HTML5" ? "bg-[#f97316]" :
                                tag === "UI" ? "bg-[#8b5cf6]" :
                                tag === "Data" ? "bg-[#0ea5e9]" :
                                tag === "Animations" ? "bg-[#f43f5e]" :
                                tag === "Interactive" ? "bg-[#10b981]" :
                                tag === "Utility" ? "bg-[#f59e0b]" :
                                tag === "Creative" ? "bg-[#ec4899]" :
                                tag === "Editor" ? "bg-[#10b981]" :
                                tag === "Dashboard" ? "bg-[#a855f7]" :
                                "bg-zinc-600"
                              }`} />
                              {tag}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explicit action buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSelectTemplate(template)}
                          className="px-2.5 py-1 bg-purple-950/45 hover:bg-purple-900/50 text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                          title="Inject this template into your workspace"
                        >
                          <Sparkles className="h-2.5 w-2.5" /> Load Template
                        </button>
                        <button
                          onClick={() => {
                            setQuickPreviewTemplate(template);
                            setQuickPreviewSelectedFilePath(template.files[0]?.path || null);
                            setQuickPreviewCopied(false);
                            setQuickPreviewFileSearchQuery("");
                          }}
                          className="px-2.5 py-1 bg-purple-900/20 hover:bg-purple-900/30 text-purple-300 hover:text-purple-200 border border-purple-500/25 hover:border-purple-500/40 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                          title="Quick preview file structure and read key files"
                        >
                          <FileText className="h-2.5 w-2.5 text-purple-400" /> Quick Preview
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
                        {/* Inline live preview switch */}
                        <button
                          onClick={() => toggleCardPreview(template.name)}
                          className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 border ${
                            isPreviewOpen
                              ? "bg-emerald-950/45 text-emerald-400 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                              : "bg-zinc-900/80 hover:bg-zinc-850 text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-750"
                          }`}
                          title="Open instant inline live preview box"
                        >
                          <Monitor className="h-2.5 w-2.5" />
                          {isPreviewOpen ? "Hide Sandbox" : "Live Sandbox"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Group: Live Interactive Scaled Snapshot Preview or Visual File Tree (Hidden when inline sandbox is active) */}
                  {!isPreviewOpen && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="w-full sm:w-[180px] h-[120px] rounded-lg overflow-hidden border border-zinc-800 bg-black relative shrink-0 self-center shadow-lg group-hover:border-purple-500/40 transition-colors flex flex-col"
                    >
                      {/* Tabs switch to select Panel Mode */}
                      <div className="absolute top-1.5 right-1.5 flex items-center bg-black/80 backdrop-blur-md border border-zinc-800 p-0.5 rounded-md z-30 select-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRightPanelModes((prev) => ({ ...prev, [template.name]: "demo" }));
                          }}
                          className={`px-1.5 py-0.5 rounded text-[6.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            (rightPanelModes[template.name] || "demo") === "demo"
                              ? "bg-purple-950/50 text-purple-400 border border-purple-500/30"
                              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                          }`}
                        >
                          Demo
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRightPanelModes((prev) => ({ ...prev, [template.name]: "structure" }));
                          }}
                          className={`px-1.5 py-0.5 rounded text-[6.5px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            (rightPanelModes[template.name] || "demo") === "structure"
                              ? "bg-purple-950/50 text-purple-400 border border-purple-500/30"
                              : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                          }`}
                        >
                          Structure
                        </button>
                      </div>

                      {/* Display either Architecture Tree or Live Demo IFrame */}
                      {(rightPanelModes[template.name] || "demo") === "structure" ? (
                        <div className="w-full h-full relative">
                          <FileStructureCanvas template={template} />
                        </div>
                      ) : hoveredTemplate === template.name ? (
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
                            <div className="bg-zinc-950/95 border border-zinc-850/80 px-2 py-1 rounded text-[8px] font-bold text-zinc-300 uppercase tracking-widest font-mono shadow-xl flex items-center gap-1">
                              <Sparkles className="h-2 w-2 text-purple-400 animate-spin" />
                              Hover to play
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Inline Live Preview Sandbox Box */}
                <AnimatePresence>
                  {isPreviewOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      className="w-full flex flex-col bg-black border border-zinc-850 rounded-xl overflow-hidden shadow-2xl relative"
                    >
                      {/* Interactive Header */}
                      <div className="px-4 py-2 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between font-mono select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40"></span>
                          <span className="text-[9px] text-zinc-500 ml-2 font-bold uppercase tracking-wide">
                            Live Card Sandbox
                          </span>
                        </div>

                        <div className="hidden md:flex items-center bg-zinc-900/60 border border-zinc-850 px-3 py-0.5 rounded-lg text-[8.5px] text-zinc-500 max-w-[280px] truncate">
                          sandbox://play.canvaslab.io/{template.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => reloadCardIframe(template.name, e)}
                            className="p-1 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded border border-transparent hover:border-zinc-800 transition flex items-center justify-center cursor-pointer"
                            title="Reset simulation state"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => toggleCardPreview(template.name)}
                            className="p-1 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 rounded border border-transparent hover:border-zinc-800 transition flex items-center justify-center cursor-pointer"
                            title="Close simulation"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Interactive iframe area */}
                      <div className="w-full h-[280px] bg-black relative">
                        <iframe
                          key={cardIframeKeys[template.name] || 0}
                          srcDoc={getTemplateSrcDoc(template)}
                          sandbox="allow-scripts allow-modals allow-same-origin"
                          className="w-full h-full border-none bg-black"
                          title={`${template.name} Inline Live Preview`}
                        />
                      </div>

                      {/* Simulation Controls footer */}
                      <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between text-[9px] font-mono text-zinc-500 select-none">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-emerald-400 font-bold uppercase tracking-widest text-[8px]">Active Play Session</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSelectTemplate(template)}
                            className="text-purple-400 hover:text-purple-300 font-bold uppercase flex items-center gap-1 cursor-pointer hover:underline"
                          >
                            <Sparkles className="h-3 w-3" />
                            Load into workspace
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
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
            className="hidden md:flex fixed z-[9999] pointer-events-none w-[620px] h-[280px] bg-[#09090b]/95 backdrop-blur-xl border border-purple-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)] flex-col"
            style={{
              left: `${Math.min(window.innerWidth - 640, mousePos.x + 20)}px`,
              top: `${Math.min(window.innerHeight - 300, mousePos.y + 20)}px`,
            }}
          >
            {/* Popover Header */}
            <div className="px-3.5 py-2 border-b border-zinc-800/80 bg-black/70 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1 bg-purple-500/10 border border-purple-500/25 rounded-md text-purple-400">
                  <Code className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-200 truncate">
                  {activeHoverTemplate.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Live Preview &amp; Code Structure
                </span>
              </div>
            </div>

            {/* Split Dual-Panel Body */}
            <div className="flex-1 flex overflow-hidden divide-x divide-zinc-900">
              {/* Left Column: Live Rendered Iframe */}
              <div className="w-[280px] bg-black relative shrink-0 overflow-hidden">
                <div 
                  className="absolute origin-top-left"
                  style={{
                    width: "560px",
                    height: "440px",
                    transform: "scale(0.5)",
                  }}
                >
                  <iframe
                    srcDoc={getTemplateSrcDoc(activeHoverTemplate)}
                    sandbox="allow-scripts allow-modals allow-same-origin"
                    className="w-full h-full border-none bg-black"
                    title={`${activeHoverTemplate.name} Popover Live Preview`}
                  />
                </div>
              </div>

              {/* Right Column: Code Structure & Scrollable Read-Only Preview */}
              <div className="flex-1 bg-zinc-950/80 p-3 flex flex-col gap-2 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between select-none shrink-0">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                    <FileText className="h-3 w-3 text-purple-400" /> File Structure
                  </span>
                  <span className="text-[7.5px] font-mono text-zinc-500">
                    {activeHoverTemplate.files.length} Files Total
                  </span>
                </div>

                {/* File list row */}
                <div className="flex flex-wrap gap-1 max-h-[55px] overflow-y-auto scrollbar-thin shrink-0 pb-1 border-b border-zinc-900">
                  {activeHoverTemplate.files.map((file) => (
                    <div 
                      key={file.path} 
                      className="flex items-center gap-1 bg-zinc-900/60 border border-zinc-850 px-1.5 py-0.5 rounded text-[7.5px] font-mono text-zinc-300"
                    >
                      <Code className="h-2 w-2 text-purple-400" />
                      <span className="truncate max-w-[90px]">{file.path}</span>
                      <span className="text-[6.5px] text-zinc-500">({file.content.split('\n').length} lines)</span>
                    </div>
                  ))}
                </div>

                {/* Read-Only File Content Preview */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between text-[7px] font-mono text-zinc-500 mb-1 select-none shrink-0">
                    <span className="truncate max-w-[150px]">PREVIEWING: {activeHoverTemplate.files[0]?.path}</span>
                    <span className="text-[6px] uppercase bg-purple-950/20 text-purple-400 border border-purple-500/10 px-1 rounded">
                      Scrollable Read-Only
                    </span>
                  </div>
                  
                  <div className="flex-1 min-h-0 bg-black/90 rounded-lg border border-zinc-900 p-2 overflow-y-auto scrollbar-thin text-left select-none">
                    <pre className="text-[7px] leading-relaxed font-mono text-zinc-400 whitespace-pre">
                      {activeHoverTemplate.files[0]?.content || "// Empty File"}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Popover Footer Info */}
            <div className="px-3 py-1.5 border-t border-zinc-900 bg-black/85 flex items-center justify-between shrink-0 text-[8px] font-mono text-zinc-500 select-none">
              <span>Hover template to explore files • Click card to open full responsive workspace</span>
              <span className="text-purple-400 font-bold uppercase">Template Inspect</span>
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
                        <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 bg-emerald-950/40 border border-emerald-500/20 rounded text-emerald-400 font-sans">
                          Active
                        </span>
                      </button>

                      {/* Full Workspace Diff Option */}
                      <button
                        onClick={() => {
                          setModalSelectedFilePath("__workspace_diff__");
                          setDetailModalDiff(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-[10px] font-mono font-bold transition-all border text-left cursor-pointer ${
                          modalSelectedFilePath === "__workspace_diff__"
                            ? "bg-purple-950/20 text-purple-300 border-purple-500/25"
                            : "bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/60 hover:text-zinc-300"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <GitCompare className="h-3.5 w-3.5 text-pink-400" />
                          <span>Full Workspace Diff</span>
                        </span>
                        <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 bg-pink-950/40 border border-pink-500/20 rounded text-pink-400 font-sans">
                          Report
                        </span>
                      </button>

                      {/* Individual files */}
                      {selectedDetailTemplate.files.map((file) => {
                        const isSelected = modalSelectedFilePath === file.path;
                        const ext = file.path.split(".").pop() || "";
                        const status = getFileStatus(file.path, selectedDetailTemplate.files);
                        let statusBadge = null;
                        if (status === "added") {
                          statusBadge = <span className="text-[7.5px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/20 shrink-0">New</span>;
                        } else if (status === "modified") {
                          statusBadge = <span className="text-[7.5px] font-mono font-bold bg-amber-500/10 text-amber-400 px-1 py-0.2 rounded border border-amber-500/20 shrink-0">Diff</span>;
                        } else {
                          statusBadge = <span className="text-[7.5px] font-mono text-zinc-600 shrink-0">Same</span>;
                        }

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
                            <span className="flex items-center gap-1.5 truncate mr-1.5">
                              <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-purple-400" : "text-zinc-600"}`} />
                              <span className="truncate">{file.path}</span>
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {statusBadge}
                              <span className="text-[8px] uppercase tracking-wider font-sans text-zinc-600">
                                .{ext}
                              </span>
                            </div>
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
                      {(() => {
                        if (modalSelectedFilePath === "__workspace_diff__") {
                          const deletedFiles = getDeletedFiles(selectedDetailTemplate.files);
                          const addedFiles = selectedDetailTemplate.files.filter(f => getFileStatus(f.path, selectedDetailTemplate.files) === "added");
                          const modifiedFiles = selectedDetailTemplate.files.filter(f => getFileStatus(f.path, selectedDetailTemplate.files) === "modified");
                          const unchangedFiles = selectedDetailTemplate.files.filter(f => getFileStatus(f.path, selectedDetailTemplate.files) === "unchanged");

                          return (
                            <div className="flex-1 overflow-y-auto p-6 bg-[#020402] space-y-6 scrollbar-thin">
                              <div className="space-y-1.5 border-b border-zinc-900 pb-4">
                                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                  <GitCompare className="h-4 w-4 text-purple-400" />
                                  Workspace Diff Report
                                </h2>
                                <p className="text-[10px] text-zinc-500 font-sans leading-normal">
                                  Detailed analysis of how loading this template will modify your current virtual workspace files.
                                </p>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                                <div className="bg-emerald-950/10 border border-emerald-500/20 p-3.5 rounded-xl">
                                  <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider block">Additions</span>
                                  <div className="text-lg font-bold text-white mt-1">+{addedFiles.length} <span className="text-[9px] font-normal text-zinc-500">files</span></div>
                                </div>
                                <div className="bg-amber-950/10 border border-amber-500/20 p-3.5 rounded-xl">
                                  <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider block">Modifications</span>
                                  <div className="text-lg font-bold text-white mt-1">Δ {modifiedFiles.length} <span className="text-[9px] font-normal text-zinc-500 font-sans">files</span></div>
                                </div>
                                <div className="bg-red-950/10 border border-red-500/20 p-3.5 rounded-xl">
                                  <span className="text-[8px] font-bold text-red-400 uppercase tracking-wider block">Deletions</span>
                                  <div className="text-lg font-bold text-white mt-1 font-mono">-{deletedFiles.length} <span className="text-[9px] font-normal text-zinc-500 font-sans">files</span></div>
                                </div>
                                <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-xl">
                                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Unchanged</span>
                                  <div className="text-lg font-bold text-white mt-1">{unchangedFiles.length} <span className="text-[9px] font-normal text-zinc-500 font-sans">files</span></div>
                                </div>
                              </div>

                              {/* Files Breakdown Lists */}
                              <div className="space-y-4">
                                {/* Modifications list */}
                                {modifiedFiles.length > 0 && (
                                  <div className="space-y-2 bg-zinc-900/20 border border-zinc-850/60 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                      <AlertTriangle className="h-3.5 w-3.5" /> Files with local changes (To be modified)
                                    </h3>
                                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                                      {modifiedFiles.map(f => (
                                        <div key={f.path} className="flex items-center justify-between p-2 bg-black/40 rounded border border-zinc-900 text-[11px] font-mono">
                                          <span className="text-zinc-300 truncate pr-4">{f.path}</span>
                                          <button
                                            onClick={() => {
                                              setModalSelectedFilePath(f.path);
                                              setDetailModalDiff(true);
                                            }}
                                            className="px-2.5 py-1 bg-amber-950/30 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 hover:text-amber-200 rounded text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                                          >
                                            View Diff
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Additions list */}
                                {addedFiles.length > 0 && (
                                  <div className="space-y-2 bg-zinc-900/20 border border-zinc-850/60 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                      <span>➕</span> New files to be added
                                    </h3>
                                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                                      {addedFiles.map(f => (
                                        <div key={f.path} className="flex items-center justify-between p-2 bg-black/40 rounded border border-zinc-900 text-[11px] font-mono">
                                          <span className="text-zinc-300 truncate pr-4">{f.path}</span>
                                          <button
                                            onClick={() => {
                                              setModalSelectedFilePath(f.path);
                                              setDetailModalDiff(true);
                                            }}
                                            className="px-2.5 py-1 bg-emerald-950/30 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:text-emerald-200 rounded text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                                          >
                                            Inspect Diff
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Deletions list */}
                                {deletedFiles.length > 0 && (
                                  <div className="space-y-2 bg-zinc-900/20 border border-zinc-850/60 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                                      <span>⚠️</span> Current workspace files to be deleted
                                    </h3>
                                    <p className="text-[10px] text-zinc-500 leading-normal font-sans">
                                      The following files exist in your active workspace but are not part of the template. Loading the template will permanently discard them.
                                    </p>
                                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin font-mono">
                                      {deletedFiles.map(f => (
                                        <div key={f.path} className="flex items-center justify-between p-2 bg-black/40 rounded border border-zinc-900 text-[11px]">
                                          <span className="text-zinc-400 line-through truncate pr-4">{f.path}</span>
                                          <span className="text-[9px] bg-red-950/20 text-red-500 border border-red-500/10 px-2 py-0.5 rounded font-bold uppercase shrink-0">To Be Deleted</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Unchanged list */}
                                {unchangedFiles.length > 0 && (
                                  <div className="space-y-2 bg-zinc-900/20 border border-zinc-850/40 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                      <span>✔️</span> Unchanged files (Already identical)
                                    </h3>
                                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                                      {unchangedFiles.map(f => (
                                        <div key={f.path} className="flex items-center justify-between p-2 bg-black/40 rounded border border-zinc-900 text-[11px] font-mono">
                                          <span className="text-zinc-500 truncate">{f.path}</span>
                                          <span className="text-[9px] bg-zinc-900 text-zinc-600 px-2 py-0.5 rounded uppercase font-mono shrink-0">Identical</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }

                        const fileObj = selectedDetailTemplate.files.find((f) => f.path === modalSelectedFilePath);
                        const workspaceFile = currentFiles.find((f) => f.path === modalSelectedFilePath);

                        if (detailModalDiff) {
                          return (
                            <>
                              {/* File Details bar */}
                              <div className="px-5 py-3 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between flex-shrink-0 select-none">
                                <div className="flex items-center gap-4 min-w-0">
                                  <span className="text-xs font-mono font-black text-purple-400 truncate">
                                    {modalSelectedFilePath}
                                  </span>
                                  <div className="flex items-center bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-850 shrink-0">
                                    <button
                                      onClick={() => setDetailModalDiff(false)}
                                      className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition text-zinc-500 hover:text-zinc-350 cursor-pointer"
                                    >
                                      Code
                                    </button>
                                    <button
                                      onClick={() => setDetailModalDiff(true)}
                                      className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition bg-zinc-850 text-purple-400 cursor-pointer"
                                    >
                                      Diff View
                                    </button>
                                  </div>
                                </div>

                                <span className="text-[9px] text-zinc-500 font-mono font-bold bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-md uppercase shrink-0">
                                  Comparing with Workspace
                                </span>
                              </div>

                              <div className="flex-1 overflow-auto bg-black/95">
                                <DiffViewer
                                  filename={modalSelectedFilePath || ""}
                                  oldContent={workspaceFile?.content || ""}
                                  newContent={fileObj?.content || ""}
                                />
                              </div>
                            </>
                          );
                        }

                        return (
                          <>
                            {/* Code Inspector Header / Control Bar */}
                            <div className="px-5 py-3 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between flex-shrink-0">
                              <div className="flex items-center gap-4 min-w-0">
                                <span className="font-mono text-xs font-black text-purple-400 truncate">
                                  {modalSelectedFilePath}
                                </span>
                                <div className="flex items-center bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-850 shrink-0">
                                  <button
                                    onClick={() => setDetailModalDiff(false)}
                                    className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition bg-zinc-850 text-purple-400 cursor-pointer"
                                  >
                                    Code
                                  </button>
                                  <button
                                    onClick={() => setDetailModalDiff(true)}
                                    className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition text-zinc-500 hover:text-zinc-350 cursor-pointer"
                                  >
                                    Diff View
                                  </button>
                                </div>
                                <span className="text-[9px] text-zinc-500 font-mono font-bold bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-md uppercase hidden sm:inline-block shrink-0">
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

      {/* State-of-the-Art Quick Preview Modal */}
      <AnimatePresence>
        {quickPreviewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10005] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-5xl h-[85vh] bg-zinc-950 border border-zinc-850 rounded-2xl shadow-[0_0_80px_rgba(168,85,247,0.15)] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      {quickPreviewTemplate.name}
                      <span className="text-[9px] bg-purple-950 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-bold">Quick Inspect</span>
                    </h2>
                    <p className="text-[10px] text-zinc-500">
                      Explore template files and read-only code preview before loading
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setQuickPreviewTemplate(null)}
                  className="p-1.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-850 rounded-lg text-zinc-400 hover:text-zinc-200 transition cursor-pointer flex items-center justify-center"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Workspace split view */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left side: Project File Structure list */}
                <div className="w-[280px] bg-zinc-950/80 border-r border-zinc-900 flex flex-col shrink-0 p-4 space-y-4">
                  <div className="space-y-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-850">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">Description</span>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-sans line-clamp-3">
                      {quickPreviewTemplate.description}
                    </p>
                  </div>

                  <div className="space-y-2 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between shrink-0">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                        📁 File Structure
                      </span>
                      <span className="text-[8px] text-zinc-500 font-mono">
                        {quickPreviewTemplate.files.length} Files
                      </span>
                    </div>

                    {/* File Search Input inside Quick Preview Modal */}
                    <div className="relative mb-1 shrink-0">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Filter template files..."
                        value={quickPreviewFileSearchQuery}
                        id="quick-preview-file-search"
                        onChange={(e) => setQuickPreviewFileSearchQuery(e.target.value)}
                        className="w-full bg-black border border-zinc-900 focus:border-purple-500/40 rounded-lg pl-8 pr-7 py-1 text-[10px] text-zinc-300 placeholder-zinc-600 focus:outline-none transition-all font-mono"
                      />
                      {quickPreviewFileSearchQuery && (
                        <button
                          onClick={() => setQuickPreviewFileSearchQuery("")}
                          id="clear-quick-preview-file-search-btn"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-full cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 overflow-y-auto flex-1 scrollbar-thin pr-1">
                      {/* Full Workspace Diff Option */}
                      <button
                        onClick={() => {
                          setQuickPreviewSelectedFilePath("__workspace_diff__");
                          setQuickPreviewDiff(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-[10px] font-mono font-bold transition-all border text-left cursor-pointer ${
                          quickPreviewSelectedFilePath === "__workspace_diff__"
                            ? "bg-purple-950/20 text-purple-300 border-purple-500/25 font-bold"
                            : "bg-transparent text-zinc-400 border-transparent hover:bg-zinc-900/60 hover:text-zinc-300"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <GitCompare className="h-3.5 w-3.5 text-pink-400" />
                          <span>Full Workspace Diff</span>
                        </span>
                        <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 bg-pink-950/40 border border-pink-500/20 rounded text-pink-400 font-sans font-bold">
                          Report
                        </span>
                      </button>

                      {(() => {
                        const filteredFiles = quickPreviewTemplate.files.filter((file) =>
                          file.path.toLowerCase().includes(quickPreviewFileSearchQuery.toLowerCase())
                        );

                        if (filteredFiles.length === 0) {
                          return (
                            <div className="py-8 text-center text-[10px] text-zinc-600 font-mono">
                              No matching files
                            </div>
                          );
                        }

                        return filteredFiles.map((file) => {
                          const isSelected = quickPreviewSelectedFilePath === file.path;
                          const linesCount = file.content.split('\n').length;
                          const status = getFileStatus(file.path, quickPreviewTemplate.files);
                          let statusBadge = null;
                          if (status === "added") {
                            statusBadge = <span className="text-[7.5px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/20 shrink-0">New</span>;
                          } else if (status === "modified") {
                            statusBadge = <span className="text-[7.5px] font-mono font-bold bg-amber-500/10 text-amber-400 px-1 py-0.2 rounded border border-emerald-500/20 shrink-0">Diff</span>;
                          } else {
                            statusBadge = <span className="text-[7.5px] font-mono text-zinc-600 shrink-0">Same</span>;
                          }

                          const ext = file.path.split('.').pop()?.toLowerCase();
                          let fileIcon = <Code className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-purple-400" : "text-zinc-600"}`} />;
                          if (ext === 'html') {
                            fileIcon = <Monitor className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-purple-400" : "text-orange-500/80"}`} />;
                          } else if (ext === 'css') {
                            fileIcon = <Palette className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-purple-400" : "text-teal-500/80"}`} />;
                          } else if (ext === 'json') {
                            fileIcon = <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-purple-400" : "text-amber-500/80"}`} />;
                          }

                          return (
                            <button
                              key={file.path}
                              onClick={() => {
                                setQuickPreviewSelectedFilePath(file.path);
                                setQuickPreviewCopied(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-[10px] font-mono transition-all border text-left cursor-pointer ${
                                isSelected
                                  ? "bg-purple-950/20 text-purple-300 border-purple-500/25 font-bold"
                                  : "bg-transparent text-zinc-500 border-transparent hover:bg-zinc-900/30 hover:text-zinc-400"
                              }`}
                            >
                              <span className="flex items-center gap-1.5 min-w-0 mr-1.5 truncate">
                                {fileIcon}
                                <span className="truncate">{file.path}</span>
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {statusBadge}
                                <span className="text-[8px] font-mono text-zinc-600 shrink-0">
                                  {linesCount}L
                                </span>
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Right side: Read-Only Code Viewer with line numbers */}
                <div className="flex-1 bg-black flex flex-col overflow-hidden">
                  {(() => {
                    if (quickPreviewSelectedFilePath === "__workspace_diff__") {
                      const deletedFiles = getDeletedFiles(quickPreviewTemplate.files);
                      const addedFiles = quickPreviewTemplate.files.filter(f => getFileStatus(f.path, quickPreviewTemplate.files) === "added");
                      const modifiedFiles = quickPreviewTemplate.files.filter(f => getFileStatus(f.path, quickPreviewTemplate.files) === "modified");
                      const unchangedFiles = quickPreviewTemplate.files.filter(f => getFileStatus(f.path, quickPreviewTemplate.files) === "unchanged");

                      return (
                        <div className="flex-1 overflow-y-auto p-6 bg-[#020402] space-y-6 scrollbar-thin text-left">
                          <div className="space-y-1.5 border-b border-zinc-900 pb-4">
                            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                              <GitCompare className="h-4 w-4 text-purple-400" />
                              Workspace Diff Report
                            </h2>
                            <p className="text-[10px] text-zinc-500 font-sans leading-normal">
                              Detailed analysis of how loading this template will modify your current virtual workspace files.
                            </p>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                            <div className="bg-emerald-950/10 border border-emerald-500/20 p-3.5 rounded-xl">
                              <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider block">Additions</span>
                              <div className="text-lg font-bold text-white mt-1">+{addedFiles.length} <span className="text-[9px] font-normal text-zinc-500">files</span></div>
                            </div>
                            <div className="bg-amber-950/10 border border-amber-500/20 p-3.5 rounded-xl">
                              <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider block">Modifications</span>
                              <div className="text-lg font-bold text-white mt-1">Δ {modifiedFiles.length} <span className="text-[9px] font-normal text-zinc-500 font-sans">files</span></div>
                            </div>
                            <div className="bg-red-950/10 border border-red-500/20 p-3.5 rounded-xl">
                              <span className="text-[8px] font-bold text-red-400 uppercase tracking-wider block">Deletions</span>
                              <div className="text-lg font-bold text-white mt-1 font-mono">-{deletedFiles.length} <span className="text-[9px] font-normal text-zinc-500 font-sans">files</span></div>
                            </div>
                            <div className="bg-zinc-900/40 border border-zinc-850 p-3.5 rounded-xl">
                              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Unchanged</span>
                              <div className="text-lg font-bold text-white mt-1">{unchangedFiles.length} <span className="text-[9px] font-normal text-zinc-500 font-sans">files</span></div>
                            </div>
                          </div>

                          {/* Files Breakdown Lists */}
                          <div className="space-y-4">
                            {/* Modifications list */}
                            {modifiedFiles.length > 0 && (
                              <div className="space-y-2 bg-zinc-900/20 border border-zinc-850/60 rounded-xl p-4">
                                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                                  <AlertTriangle className="h-3.5 w-3.5" /> Files with local changes (To be modified)
                                </h3>
                                <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                                  {modifiedFiles.map(f => (
                                    <div key={f.path} className="flex items-center justify-between p-2 bg-black/40 rounded border border-zinc-900 text-[11px] font-mono">
                                      <span className="text-zinc-300 truncate pr-4">{f.path}</span>
                                      <button
                                        onClick={() => {
                                          setQuickPreviewSelectedFilePath(f.path);
                                          setQuickPreviewDiff(true);
                                        }}
                                        className="px-2.5 py-1 bg-amber-950/30 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 hover:text-amber-200 rounded text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                                      >
                                        View Diff
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Additions list */}
                            {addedFiles.length > 0 && (
                              <div className="space-y-2 bg-zinc-900/20 border border-zinc-850/60 rounded-xl p-4">
                                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                                  <span>➕</span> New files to be added
                                </h3>
                                <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin font-mono">
                                  {addedFiles.map(f => (
                                    <div key={f.path} className="flex items-center justify-between p-2 bg-black/40 rounded border border-zinc-900 text-[11px]">
                                      <span className="text-zinc-300 truncate pr-4">{f.path}</span>
                                      <button
                                        onClick={() => {
                                          setQuickPreviewSelectedFilePath(f.path);
                                          setQuickPreviewDiff(true);
                                        }}
                                        className="px-2.5 py-1 bg-emerald-950/30 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:text-emerald-200 rounded text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                                      >
                                        Inspect Diff
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Deletions list */}
                            {deletedFiles.length > 0 && (
                              <div className="space-y-2 bg-zinc-900/20 border border-zinc-850/60 rounded-xl p-4">
                                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                                  <span>⚠️</span> Current workspace files to be deleted
                                </h3>
                                <p className="text-[10px] text-zinc-500 leading-normal font-sans">
                                  The following files exist in your active workspace but are not part of the template. Loading the template will permanently discard them.
                                </p>
                                <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin font-mono">
                                  {deletedFiles.map(f => (
                                    <div key={f.path} className="flex items-center justify-between p-2 bg-black/40 rounded border border-zinc-900 text-[11px]">
                                      <span className="text-zinc-400 line-through truncate pr-4">{f.path}</span>
                                      <span className="text-[9px] bg-red-950/20 text-red-500 border border-red-500/10 px-2 py-0.5 rounded font-bold uppercase shrink-0">To Be Deleted</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Unchanged list */}
                            {unchangedFiles.length > 0 && (
                              <div className="space-y-2 bg-zinc-900/20 border border-zinc-850/40 rounded-xl p-4">
                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                  <span>✔️</span> Unchanged files (Already identical)
                                </h3>
                                <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                                  {unchangedFiles.map(f => (
                                    <div key={f.path} className="flex items-center justify-between p-2 bg-black/40 rounded border border-zinc-900 text-[11px] font-mono">
                                      <span className="text-zinc-500 truncate">{f.path}</span>
                                      <span className="text-[9px] bg-zinc-900 text-zinc-600 px-2 py-0.5 rounded uppercase font-mono shrink-0">Identical</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    const activeFile = quickPreviewTemplate.files.find(f => f.path === quickPreviewSelectedFilePath);
                    const workspaceFile = currentFiles.find(f => f.path === quickPreviewSelectedFilePath);
                    const fileContent = activeFile?.content || "// No content";
                    const lines = fileContent.split('\n');

                    if (quickPreviewDiff) {
                      return (
                        <>
                          {/* File details bar */}
                          <div className="px-5 py-3 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between flex-shrink-0 select-none">
                            <div className="flex items-center gap-4 min-w-0">
                              <span className="text-xs font-mono font-bold text-purple-400 truncate">
                                {quickPreviewSelectedFilePath}
                              </span>
                              <div className="flex items-center bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-850 shrink-0">
                                <button
                                  onClick={() => setQuickPreviewDiff(false)}
                                  className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition text-zinc-500 hover:text-zinc-300 cursor-pointer"
                                >
                                  Code
                                </button>
                                <button
                                  onClick={() => setQuickPreviewDiff(true)}
                                  className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition bg-zinc-850 text-purple-400 cursor-pointer"
                                >
                                  Diff View
                                </button>
                              </div>
                            </div>

                            <span className="text-[9px] text-zinc-500 font-mono font-bold bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded-md uppercase shrink-0">
                              Comparing with Workspace
                            </span>
                          </div>

                          <div className="flex-1 overflow-auto bg-black/95">
                            <DiffViewer
                              filename={quickPreviewSelectedFilePath || ""}
                              oldContent={workspaceFile?.content || ""}
                              newContent={activeFile?.content || ""}
                            />
                          </div>
                        </>
                      );
                    }
                    
                    return (
                      <>
                        {/* File details bar */}
                        <div className="px-5 py-3 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between flex-shrink-0 select-none">
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="text-xs font-mono font-bold text-purple-400 truncate">
                              {quickPreviewSelectedFilePath}
                            </span>
                            <div className="flex items-center bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-850 shrink-0">
                              <button
                                onClick={() => setQuickPreviewDiff(false)}
                                className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition bg-zinc-850 text-purple-400 cursor-pointer"
                              >
                                Code
                              </button>
                              <button
                                onClick={() => setQuickPreviewDiff(true)}
                                className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider transition text-zinc-500 hover:text-zinc-300 cursor-pointer"
                              >
                                Diff View
                              </button>
                            </div>
                            <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500 border border-zinc-900 px-1.5 py-0.5 rounded bg-zinc-900/40 shrink-0">
                              {lines.length} Lines
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(fileContent);
                                setQuickPreviewCopied(true);
                                setTimeout(() => setQuickPreviewCopied(false), 2000);
                              }}
                              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-lg text-[9px] font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
                            >
                              {quickPreviewCopied ? (
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
                        </div>

                        {/* Read-Only Code Panel with custom line numbers */}
                        <div className="flex-1 overflow-auto p-5 bg-black/95 font-mono text-[11px] select-text selection:bg-purple-900/30 selection:text-purple-200 scrollbar-thin text-left">
                          <div className="flex leading-relaxed min-w-full">
                            {/* Numbers Column */}
                            <div className="text-zinc-600 text-right pr-4 select-none border-r border-zinc-900 mr-4 text-[10px] w-8 shrink-0">
                              {lines.map((_, i) => (
                                <div key={i}>{i + 1}</div>
                              ))}
                            </div>
                            
                            {/* Real Code Column */}
                            <pre className="text-zinc-300 overflow-x-auto whitespace-pre flex-1 text-[10.5px]">
                              <code>{fileContent}</code>
                            </pre>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Bottom Footer Actions block */}
              <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between flex-shrink-0">
                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" /> Confirm below to inject files into active workspace
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuickPreviewTemplate(null)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-750 text-zinc-400 hover:text-zinc-200 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      const templateToLoad = quickPreviewTemplate;
                      setQuickPreviewTemplate(null);
                      handleSelectTemplate(templateToLoad);
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Confirm Load Template
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
