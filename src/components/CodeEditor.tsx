import React, { useRef, useEffect, useState } from "react";
import { FileCode, Save, RefreshCw, Eye, EyeOff, Type, Sliders, Sparkles } from "lucide-react";
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

interface FoldRange {
  start: number; // 0-based line index
  end: number;   // 0-based line index
  label: string;
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

  // Code Folding States
  const [foldedBlocksByFile, setFoldedBlocksByFile] = useState<
    Record<string, Record<string, { content: string; placeholder: string }>>
  >({});
  const [localEditorContent, setLocalEditorContent] = useState<string>("");

  const currentFileFoldedBlocks = (activeFile && foldedBlocksByFile[activeFile.path]) || {};

  const reconstructFullContent = (
    editorText: string,
    blocks: Record<string, { content: string; placeholder: string }>
  ) => {
    let full = editorText;
    Object.entries(blocks).forEach(([id, block]) => {
      full = full.split(block.placeholder).join(block.content);
    });
    return full;
  };

  // Synchronize localEditorContent with activeFile.content from outside
  useEffect(() => {
    if (activeFile) {
      const currentUnfolded = reconstructFullContent(localEditorContent, currentFileFoldedBlocks);
      if (activeFile.content !== currentUnfolded) {
        setLocalEditorContent(activeFile.content);
        // Reset folded blocks for safety on external change or file switch
        setFoldedBlocksByFile((prev) => ({
          ...prev,
          [activeFile.path]: {},
        }));
      }
    } else {
      setLocalEditorContent("");
    }
  }, [activeFile?.content, activeFile?.path]);

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
      setLocalEditorContent(newValue);

      const fullContent = reconstructFullContent(newValue, currentFileFoldedBlocks);
      onUpdateContent(fullContent);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Parse foldable brace and bracket blocks on the current visible editor layout
  const findFoldRangesInVisibleText = (visibleLines: string[]): FoldRange[] => {
    const ranges: FoldRange[] = [];
    const openBraceStack: number[] = [];
    const openBracketStack: number[] = [];

    for (let i = 0; i < visibleLines.length; i++) {
      const line = visibleLines[i];
      if (line.includes("⊞ [Folded Code Block:")) {
        continue;
      }

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === "{") {
          openBraceStack.push(i);
        } else if (char === "}") {
          const start = openBraceStack.pop();
          if (start !== undefined && start < i) {
            let label = visibleLines[start].trim();
            if (label.endsWith("{")) {
              label = label.slice(0, -1).trim();
            }
            ranges.push({
              start,
              end: i,
              label: label || "Block",
            });
          }
        } else if (char === "[") {
          openBracketStack.push(i);
        } else if (char === "]") {
          const start = openBracketStack.pop();
          if (start !== undefined && start < i) {
            let label = visibleLines[start].trim();
            if (label.endsWith("[")) {
              label = label.slice(0, -1).trim();
            }
            ranges.push({
              start,
              end: i,
              label: label || "Array",
            });
          }
        }
      }
    }

    const uniqueRanges: Record<number, FoldRange> = {};
    ranges.forEach((range) => {
      const existing = uniqueRanges[range.start];
      if (!existing || range.end - range.start > existing.end - existing.start) {
        uniqueRanges[range.start] = range;
      }
    });

    return Object.values(uniqueRanges).sort((a, b) => a.start - b.start);
  };

  const foldBlock = (range: FoldRange) => {
    if (!activeFile) return;
    const blockId = "block_" + Math.random().toString(36).substring(2, 11);
    const visibleLines = localEditorContent.split("\n");
    const blockContent = visibleLines.slice(range.start, range.end + 1).join("\n");
    const placeholder = `// ⊞ [Folded Code Block: ${range.label} - id: ${blockId}]`;

    const before = visibleLines.slice(0, range.start);
    const after = visibleLines.slice(range.end + 1);
    const newVisibleText = [...before, placeholder, ...after].join("\n");

    const updatedBlocks = {
      ...currentFileFoldedBlocks,
      [blockId]: {
        content: blockContent,
        placeholder,
      },
    };

    setFoldedBlocksByFile((prev) => ({
      ...prev,
      [activeFile.path]: updatedBlocks,
    }));
    setLocalEditorContent(newVisibleText);

    const fullContent = reconstructFullContent(newVisibleText, updatedBlocks);
    onUpdateContent(fullContent);
  };

  const unfoldBlock = (blockId: string) => {
    if (!activeFile) return;
    const block = currentFileFoldedBlocks[blockId];
    if (!block) return;

    const lines = localEditorContent.split("\n");
    const targetIndex = lines.findIndex((line) => line.includes(block.placeholder));
    if (targetIndex !== -1) {
      const before = lines.slice(0, targetIndex);
      const after = lines.slice(targetIndex + 1);
      const newVisibleText = [...before, block.content, ...after].join("\n");

      setLocalEditorContent(newVisibleText);

      const updatedBlocks = { ...currentFileFoldedBlocks };
      delete updatedBlocks[blockId];
      setFoldedBlocksByFile((prev) => ({
        ...prev,
        [activeFile.path]: updatedBlocks,
      }));

      const fullContent = reconstructFullContent(newVisibleText, updatedBlocks);
      onUpdateContent(fullContent);
    }
  };

  if (!activeFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0b] text-zinc-500 text-xs p-6 space-y-2">
        <FileCode className="h-10 w-10 text-zinc-700 animate-pulse-soft" />
        <span className="font-mono">Select a file from the Explorer to begin hacking</span>
      </div>
    );
  }

  const visibleLines = localEditorContent.split("\n");
  const lineNumbers = visibleLines.map((_, i) => i + 1);

  const foldRanges = findFoldRangesInVisibleText(visibleLines);
  const foldableLinesMap = new Map<number, FoldRange>();
  foldRanges.forEach((r) => {
    if (!foldableLinesMap.has(r.start)) {
      foldableLinesMap.set(r.start, r);
    }
  });

  const foldedLinesMap = new Map<number, string>();
  visibleLines.forEach((line, index) => {
    if (line.includes("⊞ [Folded Code Block:")) {
      const match = line.match(/- id: ([a-zA-Z0-9_]+)\]/);
      if (match && match[1]) {
        foldedLinesMap.set(index, match[1]);
      }
    }
  });

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

          {/* Expand/Collapse All Button */}
          {Object.keys(currentFileFoldedBlocks).length > 0 ? (
            <button
              onClick={() => {
                if (activeFile) {
                  setLocalEditorContent(activeFile.content);
                  setFoldedBlocksByFile((prev) => ({
                    ...prev,
                    [activeFile.path]: {},
                  }));
                  onUpdateContent(activeFile.content);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-[#1ae854] text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              title="Expand All Folded Code Blocks"
            >
              <Eye className="h-3.5 w-3.5 text-[#1ae854]" />
              <span>Expand All</span>
            </button>
          ) : (
            <button
              onClick={() => {
                const ranges = findFoldRangesInVisibleText(visibleLines);
                if (ranges.length > 0) {
                  let currentContent = localEditorContent;
                  let currentBlocks = { ...currentFileFoldedBlocks };
                  
                  const sortedRanges = [...ranges].sort((a, b) => b.start - a.start);
                  sortedRanges.forEach((range) => {
                    const blockId = "block_" + Math.random().toString(36).substring(2, 11);
                    const linesList = currentContent.split("\n");
                    const blockContent = linesList.slice(range.start, range.end + 1).join("\n");
                    const placeholder = `// ⊞ [Folded Code Block: ${range.label} - id: ${blockId}]`;

                    const before = linesList.slice(0, range.start);
                    const after = linesList.slice(range.end + 1);
                    currentContent = [...before, placeholder, ...after].join("\n");

                    currentBlocks[blockId] = {
                      content: blockContent,
                      placeholder,
                    };
                  });

                  setFoldedBlocksByFile((prev) => ({
                    ...prev,
                    [activeFile.path]: currentBlocks,
                  }));
                  setLocalEditorContent(currentContent);

                  const fullContent = reconstructFullContent(currentContent, currentBlocks);
                  onUpdateContent(fullContent);
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              title="Collapse All Foldable Blocks"
            >
              <EyeOff className="h-3.5 w-3.5 text-zinc-500" />
              <span>Collapse All</span>
            </button>
          )}
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
      <div className="flex-1 flex font-mono overflow-hidden relative animate-fade-in">
        {/* Line Numbers & folding gutter */}
        <div className="w-16 flex flex-col text-right text-zinc-600 bg-[#070708] py-4 pr-2 select-none font-mono border-r border-zinc-850 overflow-hidden" style={{ fontSize: `${fontSize}px` }}>
          {lineNumbers.map((num) => {
            const lineIndex = num - 1;
            const foldableRange = foldableLinesMap.get(lineIndex);
            const foldedBlockId = foldedLinesMap.get(lineIndex);

            return (
              <div
                key={num}
                className="group flex items-center justify-end gap-1 px-1 relative"
                style={{
                  height: `${calculatedLineHeight}px`,
                  lineHeight: `${calculatedLineHeight}px`
                }}
              >
                {/* Folding control button */}
                <span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded hover:bg-zinc-800 transition-colors">
                  {foldedBlockId ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unfoldBlock(foldedBlockId);
                      }}
                      className="text-[#1ae854] hover:text-white flex items-center justify-center cursor-pointer font-bold"
                      title="Unfold Code Block"
                    >
                      ⊞
                    </button>
                  ) : foldableRange ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        foldBlock(foldableRange);
                      }}
                      className="text-zinc-500 hover:text-purple-400 opacity-20 group-hover:opacity-100 flex items-center justify-center cursor-pointer font-bold transition-opacity"
                      title="Fold Code Block"
                    >
                      ⊟
                    </button>
                  ) : null}
                </span>

                {/* Line number display */}
                <span className="text-zinc-600 group-hover:text-zinc-400 text-[11px] min-w-[20px] font-mono tracking-tight select-none transition-colors">
                  {num}
                </span>
              </div>
            );
          })}
        </div>

        {/* Text Area Input */}
        <textarea
          ref={textareaRef}
          value={localEditorContent}
          onChange={(e) => {
            const val = e.target.value;
            setLocalEditorContent(val);
            const fullContent = reconstructFullContent(val, currentFileFoldedBlocks);
            onUpdateContent(fullContent);
          }}
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

