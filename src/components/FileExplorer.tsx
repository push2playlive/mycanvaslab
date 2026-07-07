import React, { useState } from "react";
import { FolderOpen, File, FileCode, Plus, Trash2, FileText, FolderDown, Lock } from "lucide-react";
import { VirtualFile } from "../types";

interface FileExplorerProps {
  files: VirtualFile[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onDeleteMultipleFiles?: (paths: string[]) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  onDownloadZip?: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onDeleteMultipleFiles,
  onRenameFile,
  onDownloadZip,
}) => {
  const [newFileName, setNewFileName] = useState("");
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const handleSaveRename = (oldPath: string) => {
    const trimmed = editingValue.trim();
    if (!trimmed || trimmed === oldPath) {
      setEditingPath(null);
      return;
    }
    
    // Check if another file has the same name
    if (files.some((f) => f.path.toLowerCase() === trimmed.toLowerCase() && f.path !== oldPath)) {
      alert("A file with that name already exists in the workspace.");
      setEditingPath(null);
      return;
    }

    if (onRenameFile) {
      onRenameFile(oldPath, trimmed);
    }
    setEditingPath(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFileName.trim();
    if (!trimmed) return;
    onCreateFile(trimmed);
    setNewFileName("");
    setShowCreateInput(false);
  };

  const handleToggleSelect = (path: string) => {
    setSelectedFiles((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const deletableFiles = files.filter((f) => f.path !== "index.html");
  const isAllSelected = deletableFiles.length > 0 && deletableFiles.every((f) => selectedFiles.includes(f.path));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(deletableFiles.map((f) => f.path));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedFiles.length === 0) return;
    if (confirm(`Are you sure you want to delete the selected ${selectedFiles.length} files?`)) {
      if (onDeleteMultipleFiles) {
        onDeleteMultipleFiles(selectedFiles);
      } else {
        selectedFiles.forEach((f) => onDeleteFile(f));
      }
      setSelectedFiles([]);
    }
  };

  const getFileIcon = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "html":
        return <FileCode className="h-4 w-4 text-orange-400 shrink-0" />;
      case "css":
        return <FileCode className="h-4 w-4 text-blue-400 shrink-0" />;
      case "js":
      case "ts":
        return <FileCode className="h-4 w-4 text-yellow-400 shrink-0" />;
      case "tsx":
      case "jsx":
        return <FileCode className="h-4 w-4 text-sky-400 shrink-0" />;
      case "md":
        return <FileText className="h-4 w-4 text-emerald-400 shrink-0" />;
      default:
        return <File className="h-4 w-4 text-zinc-400 shrink-0" />;
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
        <div className="flex items-center gap-1">
          {selectedFiles.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="p-1.5 hover:bg-red-950/30 border border-red-900/30 text-red-500 hover:text-red-400 rounded transition cursor-pointer flex items-center gap-1 mr-1 animate-pulse"
              title={`Delete ${selectedFiles.length} Selected Files`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black">{selectedFiles.length}</span>
            </button>
          )}
          {onDownloadZip && (
            <button
              onClick={onDownloadZip}
              className="p-1 hover:bg-zinc-800 rounded transition text-zinc-400 hover:text-[#1ae854] cursor-pointer"
              title="Download Workspace as ZIP"
            >
              <FolderDown className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setShowCreateInput(!showCreateInput)}
            className="p-1 hover:bg-zinc-800 rounded transition text-zinc-400 hover:text-zinc-100 cursor-pointer"
            title="Create New File"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
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

      {/* Master Selection Row (appears when multiple files are available) */}
      {deletableFiles.length > 0 && (
        <div className="px-3.5 py-1.5 border-b border-zinc-850 bg-zinc-950/20 flex items-center justify-between text-[10px] text-zinc-500 font-mono select-none">
          <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-300">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleToggleSelectAll}
              className="accent-purple-500 rounded border-zinc-700 bg-zinc-950 h-3.5 w-3.5 cursor-pointer focus:ring-0"
            />
            <span>Select All Deletable</span>
          </label>
          {selectedFiles.length > 0 && (
            <span className="text-zinc-400 font-bold">{selectedFiles.length} selected</span>
          )}
        </div>
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
                <div className="flex items-center gap-2 truncate flex-1 pr-2">
                  {file.path !== "index.html" ? (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.path)}
                        onChange={() => handleToggleSelect(file.path)}
                        className="accent-purple-500 rounded border-zinc-700 bg-zinc-950 h-3.5 w-3.5 cursor-pointer focus:ring-0"
                      />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 flex items-center justify-center select-none" title="System protected file">
                      <Lock className="h-2.5 w-2.5 text-zinc-600" />
                    </div>
                  )}
                  {getFileIcon(file.path)}
                  {editingPath === file.path ? (
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveRename(file.path);
                        } else if (e.key === "Escape") {
                          setEditingPath(null);
                        }
                      }}
                      onBlur={() => handleSaveRename(file.path)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-zinc-950 border border-purple-500 rounded px-1.5 py-0.5 text-xs text-zinc-100 font-mono focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="truncate flex-1 select-none"
                      title="Double-click to rename"
                      onDoubleClick={(e) => {
                        if (file.path === "index.html") return;
                        e.stopPropagation();
                        setEditingPath(file.path);
                        setEditingValue(file.path);
                      }}
                    >
                      {file.path}
                    </span>
                  )}
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
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-zinc-600 transition cursor-pointer rounded hover:bg-zinc-800 shrink-0"
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
