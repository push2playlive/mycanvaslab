import React, { useState, useMemo } from "react";
import { 
  X, 
  Check, 
  Code, 
  FileText, 
  GitPullRequest, 
  Plus, 
  Minus, 
  Eye, 
  Sparkles, 
  AlertCircle 
} from "lucide-react";
import { VirtualFile } from "../types";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalFiles: VirtualFile[];
  pendingFiles: VirtualFile[];
  onApply: () => void;
  accentColor: string;
}

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  leftLineNum?: number;
  rightLineNum?: number;
}

// Highly optimized LCS line-by-line diffing algorithm
function computeLineDiff(oldStr: string, newStr: string): DiffLine[] {
  // Normalize line endings
  const cleanOld = oldStr.replace(/\r\n/g, "\n");
  const cleanNew = newStr.replace(/\r\n/g, "\n");

  const oldLines = cleanOld === "" ? [] : cleanOld.split("\n");
  const newLines = cleanNew === "" ? [] : cleanNew.split("\n");

  const oldLen = oldLines.length;
  const newLen = newLines.length;

  // Standard DP LCS Table
  const dp: number[][] = Array(oldLen + 1)
    .fill(null)
    .map(() => Array(newLen + 1).fill(0));

  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtracking to find edit actions
  const diff: DiffLine[] = [];
  let i = oldLen;
  let j = newLen;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diff.unshift({
        type: "unchanged",
        content: oldLines[i - 1],
        leftLineNum: i,
        rightLineNum: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        type: "added",
        content: newLines[j - 1],
        rightLineNum: j,
      });
      j--;
    } else {
      diff.unshift({
        type: "removed",
        content: oldLines[i - 1],
        leftLineNum: i,
      });
      i--;
    }
  }

  return diff;
}

export default function CompareModal({
  isOpen,
  onClose,
  originalFiles,
  pendingFiles,
  onApply,
  accentColor,
}: CompareModalProps) {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    pendingFiles[0]?.path || ""
  );
  const [viewMode, setViewMode] = useState<"unified" | "split">("unified");

  if (!isOpen || pendingFiles.length === 0) return null;

  // Selected file details
  const selectedPendingFile = pendingFiles.find((f) => f.path === selectedFilePath);
  const selectedOriginalFile = originalFiles.find((f) => f.path === selectedFilePath);

  const originalContent = selectedOriginalFile ? selectedOriginalFile.content : "";
  const pendingContent = selectedPendingFile ? selectedPendingFile.content : "";

  // Compute live diff
  const diffLines = useMemo(() => {
    return computeLineDiff(originalContent, pendingContent);
  }, [originalContent, pendingContent]);

  // Calculate summary metrics
  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    diffLines.forEach((line) => {
      if (line.type === "added") additions++;
      if (line.type === "removed") deletions++;
    });
    return { additions, deletions };
  }, [diffLines]);

  // Aggregate metrics across all pending files
  const totalStats = useMemo(() => {
    let totalAdditions = 0;
    let totalDeletions = 0;

    pendingFiles.forEach((pendingFile) => {
      const origFile = originalFiles.find((f) => f.path === pendingFile.path);
      const origText = origFile ? origFile.content : "";
      const pendingText = pendingFile.content;
      const fileDiff = computeLineDiff(origText, pendingText);

      fileDiff.forEach((line) => {
        if (line.type === "added") totalAdditions++;
        if (line.type === "removed") totalDeletions++;
      });
    });

    return { totalAdditions, totalDeletions };
  }, [originalFiles, pendingFiles]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 select-text">
      {/* Backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Diff Modal */}
      <div 
        className="relative bg-[#121212] border border-[#2a2a2a] w-full max-w-6xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] transition-all duration-300"
        style={{ borderColor: accentColor + "33" }}
      >
        {/* Glow Header Accents */}
        <div 
          className="h-1.5 w-full bg-gradient-to-r"
          style={{ backgroundImage: `linear-gradient(to right, ${accentColor}, #0ea5e9, ${accentColor})` }}
        />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#222] bg-[#161616] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: accentColor + "15", color: accentColor }}
            >
              <GitPullRequest className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span>Compare AI Modifications</span>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-normal normal-case">
                  {pendingFiles.length} {pendingFiles.length === 1 ? "file" : "files"} staged
                </span>
              </h2>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Review additions (+{totalStats.totalAdditions}) and deletions (-{totalStats.totalDeletions}) before saving to workspace.
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-1.5 bg-[#1f1f1f] hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main Split Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden bg-[#0c0c0c]">
          
          {/* File Selector Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#1e1e1e] bg-[#141414] p-4 flex flex-col flex-shrink-0 overflow-y-auto">
            <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-3">
              Modified Workspace Files
            </div>
            <div className="space-y-1">
              {pendingFiles.map((file) => {
                const isSelected = file.path === selectedFilePath;
                const origFile = originalFiles.find((f) => f.path === file.path);
                const hasOriginal = !!origFile;

                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFilePath(file.path)}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition group font-mono text-xs cursor-pointer ${
                      isSelected 
                        ? "bg-[#1f1f1f] border border-zinc-800 text-white font-semibold" 
                        : "hover:bg-[#181818] border border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-400"}`} />
                      <span className="truncate">{file.path.split("/").pop()}</span>
                    </div>
                    <span className="text-[9px] uppercase px-1 rounded font-normal font-sans bg-zinc-800 text-zinc-500">
                      {hasOriginal ? "Edit" : "New"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-6 border-t border-[#222] hidden md:block space-y-4">
              <div className="p-3 bg-zinc-900/60 border border-[#222] rounded-xl space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" />
                  <span>Interactive Highlights</span>
                </div>
                <div className="text-[11px] text-zinc-500 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500/20 border border-emerald-500/60"></span>
                    <span>Green line: Added</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500/20 border border-rose-500/60"></span>
                    <span>Red line: Removed</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-zinc-600 font-mono leading-normal">
                Click <b>Accept and Deploy</b> to instantly commit these files and run compilation checks.
              </div>
            </div>
          </div>

          {/* Interactive Code Diff Panels */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#0d0d0d]">
            {/* Diff toolbar controls */}
            <div className="px-6 py-2.5 border-b border-[#1c1c1c] bg-[#141414] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3 text-xs">
                <span className="font-mono text-zinc-300 font-semibold truncate max-w-xs sm:max-w-md">
                  Comparing: <span className="text-zinc-500 font-normal">{selectedFilePath}</span>
                </span>
                <span className="text-zinc-600">|</span>
                <div className="flex items-center space-x-2 text-[11px] font-mono">
                  <span className="text-emerald-500 flex items-center">
                    <Plus className="h-3 w-3 inline mr-0.5" /> {stats.additions}
                  </span>
                  <span className="text-rose-500 flex items-center">
                    <Minus className="h-3 w-3 inline mr-0.5" /> {stats.deletions}
                  </span>
                </div>
              </div>

              {/* Unified vs Split view toggle */}
              <div className="flex bg-black/40 border border-[#242424] p-0.5 rounded text-[10px] uppercase font-mono font-bold">
                <button
                  onClick={() => setViewMode("unified")}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
                    viewMode === "unified" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Unified
                </button>
                <button
                  onClick={() => setViewMode("split")}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${
                    viewMode === "split" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Split View
                </button>
              </div>
            </div>

            {/* Diff content box */}
            <div className="flex-1 overflow-auto font-mono text-xs p-4 leading-normal bg-black/40 select-text">
              {viewMode === "unified" ? (
                /* Unified Single Pane View */
                <div className="min-w-full divide-y-0 select-text table font-mono text-[11px] whitespace-pre">
                  {diffLines.map((line, idx) => {
                    const isAdded = line.type === "added";
                    const isRemoved = line.type === "removed";
                    
                    let bgClass = "hover:bg-zinc-900/40 text-zinc-400";
                    let sign = " ";
                    let textColor = "text-zinc-400";
                    let numColor = "text-zinc-600";
                    
                    if (isAdded) {
                      bgClass = "bg-emerald-950/20 hover:bg-emerald-950/35 border-l-2 border-emerald-500/60";
                      sign = "+";
                      textColor = "text-emerald-300";
                      numColor = "text-emerald-600/80";
                    } else if (isRemoved) {
                      bgClass = "bg-rose-950/20 hover:bg-rose-950/35 border-l-2 border-rose-500/60";
                      sign = "-";
                      textColor = "text-rose-300";
                      numColor = "text-rose-600/80";
                    }

                    return (
                      <div key={idx} className={`flex w-full select-text py-0.5 px-2 ${bgClass}`}>
                        {/* Line number cols */}
                        <div className={`w-10 text-right pr-3 font-mono select-none ${numColor}`}>
                          {line.leftLineNum || ""}
                        </div>
                        <div className={`w-10 text-right pr-3 font-mono border-r border-[#222] select-none ${numColor}`}>
                          {line.rightLineNum || ""}
                        </div>
                        {/* Sign */}
                        <div className={`w-6 text-center font-mono select-none pl-1 ${numColor}`}>
                          {sign}
                        </div>
                        {/* Code Content */}
                        <div className={`flex-1 pl-2 select-text font-mono overflow-x-auto ${textColor}`}>
                          {line.content || " "}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Split Dual Pane View */
                <div className="grid grid-cols-2 gap-4 h-full min-w-[800px]">
                  
                  {/* Left Side (Original) */}
                  <div className="border border-[#1e1e1e] bg-[#090909] rounded-xl flex flex-col overflow-hidden">
                    <div className="px-4 py-1.5 border-b border-[#1c1c1c] bg-[#121212] font-mono text-[10px] text-zinc-500 uppercase flex-shrink-0">
                      Original File version
                    </div>
                    <div className="flex-1 overflow-auto p-3 font-mono text-[11px] whitespace-pre">
                      {diffLines
                        .filter((line) => line.type !== "added")
                        .map((line, idx) => {
                          const isRemoved = line.type === "removed";
                          const bgClass = isRemoved ? "bg-rose-950/20 text-rose-300 border-l border-rose-500/50" : "text-zinc-400";
                          return (
                            <div key={idx} className={`flex py-0.5 px-1.5 ${bgClass}`}>
                              <span className="w-8 text-right pr-3 font-mono select-none text-zinc-600">
                                {line.leftLineNum || ""}
                              </span>
                              <span className="flex-1 pl-2 font-mono overflow-x-auto">
                                {line.content || " "}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Right Side (New Proposal) */}
                  <div className="border border-[#1e1e1e] bg-[#090909] rounded-xl flex flex-col overflow-hidden">
                    <div className="px-4 py-1.5 border-b border-[#1c1c1c] bg-[#121212] font-mono text-[10px] text-zinc-500 uppercase flex-shrink-0">
                      AI Generated version
                    </div>
                    <div className="flex-1 overflow-auto p-3 font-mono text-[11px] whitespace-pre">
                      {diffLines
                        .filter((line) => line.type !== "removed")
                        .map((line, idx) => {
                          const isAdded = line.type === "added";
                          const bgClass = isAdded ? "bg-emerald-950/20 text-emerald-300 border-l border-emerald-500/50" : "text-zinc-400";
                          return (
                            <div key={idx} className={`flex py-0.5 px-1.5 ${bgClass}`}>
                              <span className="w-8 text-right pr-3 font-mono select-none text-zinc-600">
                                {line.rightLineNum || ""}
                              </span>
                              <span className="flex-1 pl-2 font-mono overflow-x-auto">
                                {line.content || " "}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#222] bg-[#161616] flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-zinc-500 font-mono hidden sm:block">
            Note: Applying changes will compile and Hot Reload the sandbox page.
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-bold uppercase transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              className="flex-1 sm:flex-none px-5 py-2 text-xs font-extrabold uppercase rounded-lg transition duration-150 cursor-pointer flex items-center justify-center space-x-2 shadow-lg"
              style={{
                backgroundColor: accentColor,
                color: "#121212",
                boxShadow: `0 0 15px ${accentColor}33`
              }}
            >
              <Check className="h-4 w-4" />
              <span>Accept and Deploy</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
