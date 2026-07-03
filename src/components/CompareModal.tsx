import React, { useState } from "react";
import { DiffViewer } from "./DiffViewer";
import { VirtualFile } from "../types";
import { X, Check, RefreshCw, FileCode } from "lucide-react";

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  // Options for single file comparison (Version Control)
  filename?: string;
  oldContent?: string;
  newContent?: string;
  // Options for multi-file comparison (AI Assistant Proposals)
  pendingFiles?: VirtualFile[];
  currentFiles?: VirtualFile[];
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  onApply,
  filename,
  oldContent = "",
  newContent = "",
  pendingFiles,
  currentFiles = [],
}) => {
  if (!isOpen) return null;

  // For multi-file AI proposals, track which file is currently active/selected
  const [activeProposalIndex, setActiveProposalIndex] = useState(0);

  const isMultiFile = pendingFiles && pendingFiles.length > 0;

  // Determine what to display based on mode
  let displayFilename = filename || "";
  let displayOldContent = oldContent;
  let displayNewContent = newContent;

  if (isMultiFile) {
    const activeFile = pendingFiles[activeProposalIndex];
    if (activeFile) {
      displayFilename = activeFile.path;
      displayNewContent = activeFile.content;
      
      const currentMatchingFile = currentFiles.find((f) => f.path === activeFile.path);
      displayOldContent = currentMatchingFile ? currentMatchingFile.content : "";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-zinc-100 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-purple-400 animate-spin-slow" />
              REVIEW CODE ADJUSTMENTS
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isMultiFile 
                ? "Compare the AI's suggested modifications file-by-file before accepting them"
                : "Compare differences for selected workspace file rollbacks"
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden min-h-[350px]">
          {/* Left Sidebar for Multi-File proposal picker */}
          {isMultiFile && (
            <div className="w-56 border-r border-zinc-800 bg-zinc-950/40 p-4 overflow-y-auto space-y-2 select-none">
              <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block mb-2">
                PROPOSED BUNDLE ({pendingFiles.length})
              </span>
              <div className="space-y-1">
                {pendingFiles.map((file, idx) => {
                  const isActive = idx === activeProposalIndex;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setActiveProposalIndex(idx)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 truncate transition-colors ${
                        isActive
                          ? "bg-purple-950/20 border border-purple-900/30 text-purple-300"
                          : "text-zinc-400 hover:bg-zinc-850/50 hover:text-zinc-250"
                      }`}
                    >
                      <FileCode className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-purple-400' : 'text-zinc-500'}`} />
                      <span className="truncate font-mono">{file.path}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Diffs Viewer Area */}
          <div className="flex-1 p-6 bg-zinc-900 overflow-y-auto">
            {displayFilename ? (
              <DiffViewer
                filename={displayFilename}
                oldContent={displayOldContent}
                newContent={displayNewContent}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                No files to compare.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-850 rounded-lg hover:text-zinc-200 transition-colors"
          >
            Discard Changes
          </button>
          
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/20"
          >
            <Check className="h-4 w-4" />
            {isMultiFile ? "Accept All Suggested Diffs" : "Accept & Apply Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
