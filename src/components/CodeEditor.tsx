import React, { useRef, useEffect } from "react";
import { FileCode, Save, RefreshCw, Eye } from "lucide-react";
import { VirtualFile } from "../types";

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

  // Tab Key interception to insert spaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
      <div className="flex-1 flex font-mono text-sm leading-6 overflow-hidden relative">
        {/* Line Numbers gutter */}
        <div className="w-12 text-right text-zinc-600 bg-[#070708] py-4 pr-3 select-none font-mono text-xs border-r border-zinc-850 overflow-hidden">
          {lineNumbers.map((num) => (
            <div key={num} className="h-6">
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
          className="flex-1 p-4 bg-[#0a0a0b] text-zinc-300 font-mono text-xs leading-6 outline-none resize-none overflow-y-auto whitespace-pre h-full w-full focus:ring-0 focus:ring-offset-0"
          placeholder="Write magnificent code..."
        />
      </div>
    </div>
  );
};
