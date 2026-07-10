import React, { useState, useEffect } from "react";
import { FolderOpen, File, FileCode, Plus, Trash2, FileText, FolderDown, Download, Lock, Settings, Check, AlertCircle, X, Folder, ChevronDown, ChevronRight, FolderPlus, Search } from "lucide-react";
import { VirtualFile } from "../types";

interface FileExplorerProps {
  files: VirtualFile[];
  activeFilePath: string;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onDeleteMultipleFiles?: (paths: string[]) => void;
  onRenameFile?: (oldPath: string, newPath: string) => void;
  onRenameMultipleFiles?: (renames: { oldPath: string; newPath: string }[]) => void;
  onDownloadZip?: () => void;
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: Record<string, TreeNode>;
  file?: VirtualFile;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files = [],
  activeFilePath,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onDeleteMultipleFiles,
  onRenameFile,
  onRenameMultipleFiles,
  onDownloadZip,
}) => {
  const [newFileName, setNewFileName] = useState("");
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showCreateFolderInput, setShowCreateFolderInput] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  const [showBulkRenamePanel, setShowBulkRenamePanel] = useState(false);
  const [bulkRenameMode, setBulkRenameMode] = useState<"prefix" | "suffix" | "replace" | "individual">("prefix");
  const [bulkPrefix, setBulkPrefix] = useState("");
  const [bulkSuffix, setBulkSuffix] = useState("");
  const [bulkFind, setBulkFind] = useState("");
  const [bulkReplace, setBulkReplace] = useState("");
  const [individualRenames, setIndividualRenames] = useState<Record<string, string>>({});

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const handleExportJSON = () => {
    try {
      const workspaceState = {
        name: "UTube Media Workspace",
        description: "A complete offline-enabled video platform workspace",
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        totalFiles: files.length,
        files: files.map((f) => ({
          path: f.path,
          content: f.content,
          size: f.content.length,
        })),
      };

      const blob = new Blob([JSON.stringify(workspaceState, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `utube-media-workspace-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export workspace JSON", err);
      alert("Error: Failed to export workspace JSON");
    }
  };

  // Synchronize and prune selected files list when workspace files list changes
  useEffect(() => {
    setSelectedFiles((prev) => prev.filter((path) => files.some((f) => f.path === path)));
  }, [files]);

  // Keep individualRenames synced with selection
  useEffect(() => {
    setIndividualRenames((prev) => {
      const next: Record<string, string> = {};
      selectedFiles.forEach((path) => {
        next[path] = prev[path] !== undefined ? prev[path] : path;
      });
      return next;
    });
  }, [selectedFiles]);

  // Auto-expand folder paths to display active file when selected
  useEffect(() => {
    if (activeFilePath) {
      const parts = activeFilePath.split("/");
      if (parts.length > 1) {
        setExpandedFolders((prev) => {
          const next = { ...prev };
          let currentPath = "";
          for (let i = 0; i < parts.length - 1; i++) {
            currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
            next[currentPath] = true;
          }
          return next;
        });
      }
    }
  }, [activeFilePath]);

  const handleSaveRename = (oldPath: string) => {
    const trimmed = (editingValue || "").trim();
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

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    
    // Standard .gitkeep style to instantiate the directory
    const placeholderPath = trimmed.endsWith("/") ? `${trimmed}.gitkeep` : `${trimmed}/.gitkeep`;
    onCreateFile(placeholderPath);
    setNewFolderName("");
    setShowCreateFolderInput(false);
  };

  const handleToggleSelect = (path: string) => {
    setSelectedFiles((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const deletableFiles = (files || []).filter((f) => f && f.path !== "index.html");
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
      setShowBulkRenamePanel(false);
    }
  };

  const buildTree = (filesList: VirtualFile[]) => {
    const root: TreeNode = {
      name: "Root",
      path: "",
      isFolder: true,
      children: {},
    };

    filesList.forEach((file) => {
      if (!file || !file.path) return;
      const parts = file.path.split("/");
      let current = root;
      let currentPath = "";

      parts.forEach((part, index) => {
        if (!part) return;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLast = index === parts.length - 1;

        if (isLast) {
          current.children[part] = {
            name: part,
            path: file.path,
            isFolder: false,
            children: {},
            file: file,
          };
        } else {
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              path: currentPath,
              isFolder: true,
              children: {},
            };
          }
          current = current.children[part];
        }
      });
    });

    return root;
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const getFilesInFolder = (node: TreeNode): string[] => {
    const paths: string[] = [];
    const traverse = (n: TreeNode) => {
      if (!n.isFolder) {
        if (n.path !== "index.html") {
          paths.push(n.path);
        }
      } else {
        Object.values(n.children).forEach(traverse);
      }
    };
    traverse(node);
    return paths;
  };

  const getFolderSelectionStatus = (node: TreeNode) => {
    const folderFiles = getFilesInFolder(node);
    if (folderFiles.length === 0) return "none";
    const selectedCount = folderFiles.filter((p) => selectedFiles.includes(p)).length;
    if (selectedCount === 0) return "none";
    if (selectedCount === folderFiles.length) return "all";
    return "partial";
  };

  const handleToggleSelectFolder = (node: TreeNode) => {
    const folderFiles = getFilesInFolder(node);
    const status = getFolderSelectionStatus(node);
    if (status === "all") {
      setSelectedFiles((prev) => prev.filter((p) => !folderFiles.includes(p)));
    } else {
      setSelectedFiles((prev) => {
        const filtered = prev.filter((p) => !folderFiles.includes(p));
        return [...filtered, ...folderFiles];
      });
    }
  };

  const handleDeleteFolder = (node: TreeNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const folderFiles = getFilesInFolder(node);
    if (folderFiles.length === 0) return;
    if (confirm(`Are you sure you want to delete folder "${node.path}" and all its ${folderFiles.length} files?`)) {
      if (onDeleteMultipleFiles) {
        onDeleteMultipleFiles(folderFiles);
      } else {
        folderFiles.forEach((f) => onDeleteFile(f));
      }
      setSelectedFiles([]);
    }
  };

  const getProposedName = (path: string) => {
    if (path === "index.html") return "index.html";
    switch (bulkRenameMode) {
      case "prefix": {
        if (!bulkPrefix) return path;
        return bulkPrefix + path;
      }
      case "suffix": {
        if (!bulkSuffix) return path;
        const lastDot = path.lastIndexOf(".");
        if (lastDot === -1) {
          return path + bulkSuffix;
        }
        return path.substring(0, lastDot) + bulkSuffix + path.substring(lastDot);
      }
      case "replace": {
        if (!bulkFind) return path;
        return path.replaceAll(bulkFind, bulkReplace);
      }
      case "individual": {
        return (individualRenames[path] || path).trim();
      }
      default:
        return path;
    }
  };

  const validateBulkRenames = () => {
    if (selectedFiles.length === 0) return "No files selected.";
    
    const renames = selectedFiles.map((path) => ({
      oldPath: path,
      newPath: getProposedName(path).trim(),
    }));

    // Check for empty names
    if (renames.some((r) => !r.newPath)) {
      return "One or more file names are empty.";
    }

    // Check for index.html protection
    if (renames.some((r) => r.newPath === "index.html" && r.oldPath !== "index.html")) {
      return "Cannot rename any file to index.html.";
    }

    // Check for internal duplicates in proposed names
    const newPaths = renames.map((r) => r.newPath.toLowerCase());
    const duplicates = newPaths.filter((item, index) => newPaths.indexOf(item) !== index);
    if (duplicates.length > 0) {
      return `Duplicate destination names: ${[...new Set(duplicates)].join(", ")}`;
    }

    // Check for collisions with other unselected files
    for (const r of renames) {
      if (r.oldPath === r.newPath) continue;
      const collision = files.some(
        (f) => !selectedFiles.includes(f.path) && f.path.toLowerCase() === r.newPath.toLowerCase()
      );
      if (collision) {
        return `Name collision: A file named "${r.newPath}" already exists.`;
      }
    }

    return null;
  };

  const handleApplyBulkRenames = () => {
    const errorMsg = validateBulkRenames();
    if (errorMsg) return;

    const renames = selectedFiles.map((path) => ({
      oldPath: path,
      newPath: getProposedName(path).trim(),
    }));

    const meaningfulRenames = renames.filter((r) => r.oldPath !== r.newPath);

    if (meaningfulRenames.length === 0) {
      setShowBulkRenamePanel(false);
      return;
    }

    if (onRenameMultipleFiles) {
      onRenameMultipleFiles(meaningfulRenames);
    } else if (onRenameFile) {
      meaningfulRenames.forEach(({ oldPath, newPath }) => {
        onRenameFile(oldPath, newPath);
      });
    }

    setSelectedFiles([]);
    setShowBulkRenamePanel(false);
  };

  const getFileIcon = (path: string) => {
    if (!path) return <File className="h-4 w-4 text-zinc-400 shrink-0" />;
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

  const renderNode = (node: TreeNode, depth: number) => {
    const isExpanded = searchQuery.trim() !== "" ? true : (expandedFolders[node.path] ?? false);
    const isFolder = node.isFolder;
    const indentStyle = { paddingLeft: `${depth * 10 + 6}px` };

    if (isFolder) {
      const folderStatus = getFolderSelectionStatus(node);
      const childNodes = Object.values(node.children).sort((a, b) => {
        if (a.isFolder && !b.isFolder) return -1;
        if (!a.isFolder && b.isFolder) return 1;
        return a.name.localeCompare(b.name);
      });

      if (node.path === "") {
        return (
          <div className="space-y-0.5">
            {childNodes.map((child) => renderNode(child, depth))}
          </div>
        );
      }

      return (
        <div key={node.path} className="space-y-0.5">
          <div
            style={indentStyle}
            onClick={() => toggleFolder(node.path)}
            className="group flex items-center justify-between py-1 px-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200 transition cursor-pointer select-none"
          >
            <div className="flex items-center gap-1.5 truncate flex-1 pr-2">
              <span className="text-zinc-600 group-hover:text-zinc-400 transition">
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                )}
              </span>

              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center"
              >
                <input
                  type="checkbox"
                  checked={folderStatus === "all"}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate = folderStatus === "partial";
                    }
                  }}
                  onChange={() => handleToggleSelectFolder(node)}
                  className="accent-purple-500 rounded border-zinc-700 bg-zinc-950 h-3.5 w-3.5 cursor-pointer focus:ring-0"
                />
              </div>

              <span className="text-purple-500/85">
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 shrink-0" />
                ) : (
                  <Folder className="h-4 w-4 shrink-0" />
                )}
              </span>

              <span className="truncate font-semibold text-zinc-300">
                {node.name}
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => {
                  setShowCreateInput(true);
                  setNewFileName(`${node.path}/`);
                }}
                className="p-0.5 hover:text-purple-400 text-zinc-600 transition cursor-pointer rounded hover:bg-zinc-850 shrink-0"
                title="Create file in folder"
              >
                <Plus className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => handleDeleteFolder(node, e)}
                className="p-0.5 hover:text-red-400 text-zinc-600 transition cursor-pointer rounded hover:bg-zinc-850 shrink-0 mr-1"
                title="Delete folder and contents"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          {isExpanded && childNodes.length > 0 && (
            <div className="space-y-0.5">
              {childNodes.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const file = node.file;
    if (!file) return null;
    const isActive = file.path === activeFilePath;

    return (
      <div
        key={file.path}
        style={indentStyle}
        className={`group flex items-center justify-between py-1 px-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
          isActive ? "bg-purple-950/20 border border-purple-900/30 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200"
        }`}
        onClick={() => onSelectFile(file.path)}
      >
        <div className="flex items-center gap-1.5 truncate flex-1 pr-2">
          <span className="w-3.5 h-3.5 shrink-0" />

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
              className="flex-1 bg-zinc-950 border border-purple-500 rounded px-1 py-0.5 text-xs text-zinc-100 font-mono focus:outline-none animate-pulse"
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
              {node.name}
            </span>
          )}
        </div>

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
  };

  const fuzzyMatch = (path: string, query: string) => {
    if (!query) return true;
    const cleanQuery = query.trim().toLowerCase();
    const cleanPath = path.toLowerCase();
    
    if (cleanPath.includes(cleanQuery)) return true;
    
    let queryIdx = 0;
    for (let i = 0; i < cleanPath.length; i++) {
      if (cleanPath[i] === cleanQuery[queryIdx]) {
        queryIdx++;
        if (queryIdx === cleanQuery.length) return true;
      }
    }
    return false;
  };

  const filteredFilesForTree = files.filter((f) => fuzzyMatch(f.path, searchQuery));
  const fileTree = buildTree(filteredFilesForTree);

  return (
    <div className="flex flex-col h-full bg-[#0d0d0e] border-r border-zinc-850 w-full select-none">
      {/* File Explorer Header */}
      <div className="p-3 border-b border-zinc-850 flex items-center justify-between flex-shrink-0">
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
            onClick={handleExportJSON}
            className="p-1 hover:bg-zinc-800 rounded transition text-zinc-400 hover:text-purple-400 cursor-pointer"
            title="Export All (JSON)"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setShowCreateFolderInput(false);
              setShowCreateInput(!showCreateInput);
            }}
            className="p-1 hover:bg-zinc-800 rounded transition text-zinc-400 hover:text-zinc-100 cursor-pointer"
            title="Create New File"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setShowCreateInput(false);
              setShowCreateFolderInput(!showCreateFolderInput);
            }}
            className="p-1 hover:bg-zinc-800 rounded transition text-zinc-400 hover:text-zinc-100 cursor-pointer"
            title="Create New Folder"
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search Filter Input */}
      <div className="p-2.5 border-b border-zinc-850 bg-zinc-950/40 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Fuzzy filter files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0b] border border-zinc-800 focus:border-purple-500/50 rounded-lg pl-8 pr-7 py-1 text-[11px] font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition cursor-pointer p-0.5 rounded"
              title="Clear Filter"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* New File Input */}
      {showCreateInput && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-zinc-850 bg-zinc-950/40 flex-shrink-0">
          <input
            type="text"
            placeholder="e.g. components/Button.tsx"
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

      {/* New Folder Input */}
      {showCreateFolderInput && (
        <form onSubmit={handleCreateFolderSubmit} className="p-2 border-b border-zinc-850 bg-zinc-950/40 flex-shrink-0">
          <input
            type="text"
            placeholder="e.g. components/layout"
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="w-full bg-[#0a0a0b] border border-zinc-800 rounded px-2 py-1 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-purple-500"
          />
          <div className="flex justify-end gap-1.5 mt-1.5">
            <button
              type="button"
              onClick={() => {
                setNewFolderName("");
                setShowCreateFolderInput(false);
              }}
              className="text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-300 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[10px] uppercase font-bold text-purple-400 hover:text-purple-300 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Create Folder
            </button>
          </div>
        </form>
      )}

      {/* Master Selection Row */}
      {deletableFiles.length > 0 && (
        <div className="px-3 py-1.5 border-b border-zinc-850 bg-zinc-950/20 flex items-center justify-between text-[10px] text-zinc-500 font-mono select-none flex-shrink-0">
          <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-300">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleToggleSelectAll}
              className="accent-purple-500 rounded border-zinc-700 bg-zinc-950 h-3.5 w-3.5 cursor-pointer focus:ring-0"
            />
            <span>Select All Deletable</span>
          </label>
          <div className="flex items-center gap-1.5">
            {selectedFiles.length > 0 && (
              <>
                <button
                  onClick={() => setShowBulkRenamePanel((prev) => !prev)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition border cursor-pointer ${
                    showBulkRenamePanel
                      ? "bg-purple-950/45 text-purple-400 border-purple-500/35"
                      : "bg-purple-900/10 text-purple-400 border-purple-950 hover:bg-purple-900/20 hover:border-purple-500/30"
                  }`}
                  title="Configure bulk renaming operations"
                >
                  ⚙️ Bulk Rename
                </button>
                <span className="text-zinc-400 font-bold">{selectedFiles.length} selected</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bulk Operations Panel */}
      {selectedFiles.length > 0 && showBulkRenamePanel && (
        <div className="p-3 border-b border-zinc-800 bg-zinc-950/90 space-y-3 text-xs animate-fadeIn flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black tracking-wider text-purple-400 uppercase flex items-center gap-1">
              <Settings className="h-3 w-3" /> Batch Rename Operations
            </span>
            <button
              onClick={() => setShowBulkRenamePanel(false)}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-black/60 p-0.5 rounded-lg border border-zinc-850/60 select-none">
            {(["prefix", "suffix", "replace", "individual"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setBulkRenameMode(mode)}
                className={`py-1 text-[8px] font-bold uppercase rounded transition cursor-pointer text-center ${
                  bulkRenameMode === mode
                    ? "bg-purple-900/30 text-purple-300 border border-purple-500/20 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                {mode === "replace" ? "Replace" : mode}
              </button>
            ))}
          </div>

          {/* Mode Inputs */}
          <div className="space-y-2">
            {bulkRenameMode === "prefix" && (
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Text to Prepend (Prefix):
                </label>
                <input
                  type="text"
                  placeholder="e.g. src_"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {bulkRenameMode === "suffix" && (
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                  Text to Append (Suffix before extension):
                </label>
                <input
                  type="text"
                  placeholder="e.g. _old"
                  value={bulkSuffix}
                  onChange={(e) => setBulkSuffix(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {bulkRenameMode === "replace" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    Find:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. old"
                    value={bulkFind}
                    onChange={(e) => setBulkFind(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                    Replace:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. new"
                    value={bulkReplace}
                    onChange={(e) => setBulkReplace(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {bulkRenameMode === "individual" && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono block">
                  Rename Selected Files:
                </label>
                {selectedFiles.map((path) => (
                  <div key={path} className="flex flex-col gap-1 p-1.5 bg-black/40 rounded border border-zinc-900">
                    <span className="text-[8px] font-mono text-zinc-600 truncate">{path}</span>
                    <input
                      type="text"
                      value={individualRenames[path] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setIndividualRenames((prev) => ({
                          ...prev,
                          [path]: val,
                        }));
                      }}
                      className="w-full bg-black border border-zinc-800 rounded px-1.5 py-0.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validation & Preview Block */}
          {(() => {
            const errorMsg = validateBulkRenames();
            return (
              <div className="space-y-2 pt-1">
                {errorMsg ? (
                  <div className="flex items-start gap-1 p-1.5 bg-red-950/20 border border-red-900/30 text-red-400 rounded text-[9px] font-mono leading-normal">
                    <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                ) : (
                  <div className="p-1.5 bg-[#1ae854]/5 border border-[#1ae854]/10 rounded space-y-1">
                    <div className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                      Proposed Changes Preview:
                    </div>
                    <div className="max-h-20 overflow-y-auto font-mono text-[8px] space-y-0.5 text-zinc-400 pr-1">
                      {selectedFiles.map((path) => {
                        const proposed = getProposedName(path);
                        return (
                          <div key={path} className="truncate flex items-center gap-1">
                            <span className="text-zinc-600 truncate max-w-[100px]">{path}</span>
                            <span className="text-[#1ae854]/40">➔</span>
                            <span className={`truncate ${path === proposed ? "text-zinc-500" : "text-[#1ae854] font-bold"}`}>
                              {proposed}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Confirm Apply Buttons */}
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulkRenamePanel(false);
                    }}
                    className="px-2 py-1 text-[9px] font-bold uppercase text-zinc-500 hover:text-zinc-300 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!!errorMsg || selectedFiles.length === 0}
                    onClick={handleApplyBulkRenames}
                    className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded transition flex items-center gap-1 cursor-pointer ${
                      errorMsg
                        ? "bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-850"
                        : "bg-purple-600 hover:bg-purple-500 text-white shadow-md border border-purple-500"
                    }`}
                  >
                    <Check className="h-3 w-3" /> Apply Batch
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {(!files || files.length === 0) ? (
          <div className="p-4 text-center text-xs text-zinc-600 italic">No files in workspace. Click '+' to add one.</div>
        ) : (
          renderNode(fileTree, 0)
        )}
      </div>
    </div>
  );
};
