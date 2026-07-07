import React, { useRef, useEffect, useState } from "react";
import { FileCode, Save, RefreshCw, Eye, Type, Sliders, Sparkles } from "lucide-react";
import { VirtualFile } from "../types";
import { formatCode } from "../utils/formatter";

interface CodeEditorProps {
  activeFile: VirtualFile | null;
  onUpdateContent: (content: string) => void;
  onSave?: () => void;
  showCode: boolean;
  showPreview: boolean;
  onToggleLayout: (mode: "code" | "split" | "preview") => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  activeFile,
  onUpdateContent,
  onSave,
  showCode,
  showPreview,
  onToggleLayout,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem("mycanvaslab_editor_fontsize");
    return saved ? Number(saved) : 13;
  });

  const [lineHeight, setLineHeight] = useState<number>(() => {
    const saved = localStorage.getItem("mycanvaslab_editor_lineheight");
    return saved ? Number(saved) : 1.5;
  });

  const [formatMessage, setFormatMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("mycanvaslab_editor_fontsize", String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("mycanvaslab_editor_lineheight", String(lineHeight));
  }, [lineHeight]);

  const calculatedLineHeight = Math.round(fontSize * lineHeight);

  const triggerFormat = () => {
    if (!activeFile) return;
    const formatted = formatCode(activeFile.content, activeFile.path);
    if (formatted !== activeFile.content) {
      onUpdateContent(formatted);
      setFormatMessage("Formatted!");
      setTimeout(() => setFormatMessage(null), 1500);
    } else {
      setFormatMessage("Already clean!");
      setTimeout(() => setFormatMessage(null), 1500);
    }
  };

  // Tab Key and Formatter Shortcut interception
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Alt + Shift + F (or Option + Shift + F) or Ctrl + Alt + F
    const isAltShiftF = e.shiftKey && e.altKey && (e.key === "f" || e.key === "F" || e.key === "ƒ");
    const isCtrlAltF = e.ctrlKey && e.altKey && (e.key === "f" || e.key === "F");
    
    if (isAltShiftF || isCtrlAltF) {
      e.preventDefault();
      triggerFormat();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const content = textarea.value;

      const newValue = content.substring(0, start) + "  " + content.substring(end);
      onUpdateContent(newValue);

      // Reset selection coordinates
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Generate line numbers helper
  const lineNumbers = activeFile ? activeFile.content.split("\n").map((_, i) => i + 1) : [];

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0b] text-zinc-500 text-xs p-6 space-y-2">
        <FileCode className="h-10 w-10 text-zinc-700 animate-pulse-soft" />
        <span className="font-mono">Select a file from the Explorer to begin hacking</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0b] overflow-hidden">
      {/* Editor Header Bar */}
      <div className="px-4 py-2 border-b border-zinc-850 flex items-center justify-between bg-[#0d0d0e]">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-mono font-bold text-zinc-200">{activeFile.path}</span>
          <span className="text-[9px] bg-purple-950/40 text-purple-400 px-1.5 py-0.5 rounded border border-purple-900/30 font-mono font-bold">
            EDITING
          </span>
        </div>

        {/* Layout Mode Toggles & Editor Controls */}
        <div className="flex items-center gap-3">
          {/* Layout Mode Toggles */}
          <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-zinc-850">
            <button
              onClick={() => onToggleLayout("code")}
              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                showCode && !showPreview
                  ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                  : "text-zinc-300 hover:text-white border border-transparent"
              }`}
              title="Switch to Code Only View"
            >
              Code
            </button>
            <button
              onClick={() => onToggleLayout("split")}
              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                showCode && showPreview
                  ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                  : "text-zinc-300 hover:text-white border border-transparent"
              }`}
              title="Switch to Split View"
            >
              Split
            </button>
            <button
              onClick={() => onToggleLayout("preview")}
              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                !showCode && showPreview
                  ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                  : "text-zinc-300 hover:text-white border border-transparent"
              }`}
              title="Switch to Preview Only View"
            >
              Preview
            </button>
          </div>

          {/* Ergonomic Typography Controls */}
          <div className="flex items-center gap-2.5 bg-black/60 px-2 py-1 rounded-lg border border-zinc-850 text-zinc-400">
            <div className="flex items-center gap-1" title="Adjust Font Size">
              <Type className="h-3 w-3 text-purple-400" />
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded px-1 py-0.5 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {[10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22].map((sz) => (
                  <option key={sz} value={sz} className="bg-[#0c0c0e]">
                    {sz}px
                  </option>
                ))}
              </select>
            </div>
            
            <span className="text-zinc-800 text-[10px] select-none">|</span>

            <div className="flex items-center gap-1.5" title="Adjust Line Height Multiplier">
              <Sliders className="h-3 w-3 text-emerald-400" />
              <select
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded px-1 py-0.5 text-[10px] font-mono text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {[1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.0].map((lh) => (
                  <option key={lh} value={lh} className="bg-[#0c0c0e]">
                    {lh.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Format Code Button */}
          <button
            onClick={triggerFormat}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/20 border border-purple-900/40 hover:bg-purple-950/40 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer relative"
            title="Beautify & Format Code (Alt+Shift+F)"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            <span>Format</span>
            {formatMessage && (
              <span className="absolute top-8 left-1/2 -translate-x-1/2 bg-zinc-950 text-[9px] font-mono text-[#1ae854] border border-[#1ae854]/35 px-2 py-0.5 rounded shadow-lg z-50 whitespace-nowrap">
                {formatMessage}
              </span>
            )}
          </button>
        </div>

        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 border border-zinc-800 transition cursor-pointer"
          >
            <Save className="h-3.5 w-3.5 text-zinc-400" />
            SAVE FILE
          </button>
        )}
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 flex font-mono overflow-hidden relative">
        {/* Line Numbers gutter */}
        <div className="w-12 text-right text-zinc-600 bg-[#070708] py-4 pr-3 select-none font-mono border-r border-zinc-850 overflow-hidden" style={{ fontSize: `${fontSize}px` }}>
          {lineNumbers.map((num) => (
            <div
              key={num}
              style={{
                height: `${calculatedLineHeight}px`,
                lineHeight: `${calculatedLineHeight}px`
              }}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Text Area Input */}
        <textarea
          ref={textareaRef}
          value={activeFile.content}
          onChange={(e) => onUpdateContent(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 p-4 bg-[#0a0a0b] text-zinc-300 font-mono outline-none resize-none overflow-y-auto whitespace-pre h-full w-full focus:ring-0 focus:ring-offset-0"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: `${calculatedLineHeight}px`
          }}
          placeholder="Write magnificent code..."
        />
      </div>
    </div>
  );
};
