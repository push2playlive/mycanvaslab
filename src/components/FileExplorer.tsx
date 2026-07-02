import React, { useState } from "react";
import { Folder, File, Plus, Trash2, FolderPlus, ChevronDown, ChevronRight, FileCode, Check, X } from "lucide-react";
import { VirtualFile } from "../types";

interface FileExplorerProps {
  files: VirtualFile[];
  activeFile: string;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
}

export default function FileExplorer({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
}: FileExplorerProps) {
  const [isAdding, setIsAdding] = useState<"file" | "folder" | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
  });

  // Helper to build a nested tree from paths
  const buildTree = (filesList: VirtualFile[]) => {
    const root: any = { name: "root", type: "folder", children: {}, path: "" };

    filesList.forEach((file) => {
      const parts = file.path.split("/");
      let current = root;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const currentPath = parts.slice(0, index + 1).join("/");

        if (!current.children[part]) {
          if (isLast) {
            current.children[part] = {
              name: part,
              type: "file",
              path: file.path,
            };
          } else {
            current.children[part] = {
              name: part,
              type: "folder",
              path: currentPath,
              children: {},
            };
          }
        }
        current = current.children[part];
      });
    });

    return root;
  };

  const tree = buildTree(files);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCreate = () => {
    if (!newItemName.trim()) return;
    
    // Normalize path
    let targetPath = newItemName.trim();
    if (isAdding === "folder") {
      targetPath += "/placeholder.txt"; // Create dummy file inside folder to keep it in the virtual FS
    }
    
    onCreateFile(targetPath);
    setNewItemName("");
    setIsAdding(null);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".html")) return <FileCode className="h-4 w-4 text-[var(--accent)]" />;
    if (fileName.endsWith(".css")) return <FileCode className="h-4 w-4 text-cyan-400" />;
    if (fileName.endsWith(".tsx") || fileName.endsWith(".ts")) return <FileCode className="h-4 w-4 text-blue-400" />;
    return <File className="h-4 w-4 text-zinc-400" />;
  };

  // Recursive tree renderer
  const renderNode = (node: any, depth: number = 0) => {
    if (node.type === "file") {
      if (node.name === "placeholder.txt") return null; // Hide folder placeholder files
      const isActive = activeFile === node.path;
      return (
        <div
          key={node.path}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-md cursor-pointer transition ${
            isActive
              ? "bg-[var(--accent-glow)] text-[var(--accent)] border-l-2 border-[var(--accent)]"
              : "hover:bg-[#1a1a1a] text-zinc-400 hover:text-zinc-200"
          }`}
          onClick={() => onSelectFile(node.path)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {getFileIcon(node.name)}
            <span className="text-xs truncate font-mono">{node.name}</span>
          </div>
          {node.path !== "src/App.tsx" && node.path !== "index.html" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile(node.path);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400 transition"
              title="Delete File"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      );
    }

    // Folder node
    const isExpanded = expandedFolders[node.path] ?? false;
    const folderChildren = Object.values(node.children);

    return (
      <div key={node.path || "root-folder"} className="space-y-0.5">
        {node.name !== "root" && (
          <div
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            className="group flex items-center justify-between py-1.5 pr-2 rounded-md cursor-pointer text-zinc-300 hover:bg-zinc-900 transition"
            onClick={() => toggleFolder(node.path)}
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
              )}
              <Folder className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <span className="text-xs font-mono font-medium truncate">{node.name}</span>
            </div>
          </div>
        )}

        {(isExpanded || node.name === "root") && (
          <div className="space-y-0.5">
            {folderChildren.map((child: any) => renderNode(child, node.name === "root" ? 0 : depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] border-r border-[#2a2a2a] text-zinc-300 select-none">
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] bg-[#141414]">
        <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Project Tree</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsAdding("file")}
            className="p-1.5 hover:bg-[#1a1a1a] rounded text-zinc-400 hover:text-[var(--accent)] transition cursor-pointer"
            title="New File"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsAdding("folder")}
            className="p-1.5 hover:bg-[#1a1a1a] rounded text-zinc-400 hover:text-[var(--accent)] transition cursor-pointer"
            title="New Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Adding Input Area */}
      {isAdding && (
        <div className="p-3 bg-[#1a1a1a] border-b border-[#2a2a2a] space-y-2">
          <div className="text-[10px] text-zinc-500 uppercase font-semibold">
            Creating new {isAdding}
          </div>
          <div className="flex items-center gap-1 bg-[#0d0d0d] border border-[#2a2a2a] rounded px-2 py-1">
            <input
              type="text"
              autoFocus
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={isAdding === "file" ? "src/components/MyTimer.tsx" : "src/components"}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="flex-1 bg-transparent text-xs text-zinc-100 outline-none font-mono py-0.5"
            />
            <button
              onClick={handleCreate}
              className="p-1 text-emerald-400 hover:bg-[#1a1a1a] rounded cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setIsAdding(null);
                setNewItemName("");
              }}
              className="p-1 text-zinc-500 hover:bg-[#1a1a1a] rounded cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 italic">
            Press Enter or click check to confirm
          </p>
        </div>
      )}

      {/* Explorer Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {renderNode(tree)}
      </div>
    </div>
  );
}
