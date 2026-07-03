import React, { useState } from "react";
import { FolderOpen, File, FileCode, Plus, Trash2, FileText } from "lucide-react";
import { VirtualFile } from "../types";

interface FileExplorerProps {
  files: VirtualFile[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
}) => {
  const [newFileName, setNewFileName] = useState("");
  const [showCreateInput, setShowCreateInput] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFileName.trim();
    if (!trimmed) return;
    onCreateFile(trimmed);
    setNewFileName("");
    setShowCreateInput(false);
  };

  const getFileIcon = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "html":
        return <FileCode className="h-4 w-4 text-orange-400" />;
      case "css":
        return <FileCode className="h-4 w-4 text-blue-400" />;
      case "js":
      case "ts":
        return <FileCode className="h-4 w-4 text-yellow-400" />;
      case "tsx":
      case "jsx":
        return <FileCode className="h-4 w-4 text-sky-400" />;
      case "md":
        return <FileText className="h-4 w-4 text-emerald-400" />;
      default:
        return <File className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d0e] border-r border-zinc-850 w-full">
      {/* File Explorer Header */}
      <div className="p-3 border-b border-zinc-850 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FolderOpen className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-300">EXPLORER</span>
        </div>
        <button
          onClick={() => setShowCreateInput(!showCreateInput)}
          className="p-1 hover:bg-zinc-800 rounded transition text-zinc-400 hover:text-zinc-100 cursor-pointer"
          title="Create New File"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* New File Creation Input */}
      {showCreateInput && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-zinc-850 bg-zinc-950/40">
          <input
            type="text"
            placeholder="e.g. style.css"
            autoFocus
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="w-full bg-[#0a0a0b] border border-zinc-800 rounded px-2 py-1 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
          />
          <div className="flex justify-end gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => {
                setNewFileName("");
                setShowCreateInput(false);
              }}
              className="text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-300 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[10px] uppercase font-bold text-purple-400 hover:text-purple-300 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {files.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-600 italic">No files in workspace. Click '+' to add one.</div>
        ) : (
          files.map((file) => {
            const isActive = file.path === activeFilePath;
            return (
              <div
                key={file.path}
                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                  isActive ? "bg-purple-950/20 border border-purple-900/30 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200"
                }`}
                onClick={() => onSelectFile(file.path)}
              >
                <div className="flex items-center gap-2 truncate">
                  {getFileIcon(file.path)}
                  <span className="truncate">{file.path}</span>
                </div>

                {/* Prevent deleting 'index.html' so workspace doesn't crash */}
                {file.path !== "index.html" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete ${file.path}?`)) {
                        onDeleteFile(file.path);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-zinc-600 transition cursor-pointer rounded hover:bg-zinc-800"
                    title="Delete File"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
