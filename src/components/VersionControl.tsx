import React, { useState } from "react";
import { VirtualFile, Snapshot } from "../types";
import { GitCommit, History, RotateCcw, Eye, ArrowRight, Save } from "lucide-react";
import { CompareModal } from "./CompareModal";

interface VersionControlProps {
  files: VirtualFile[];
  snapshots: Snapshot[];
  onAddSnapshot: (message: string) => void;
  onRestoreSnapshot: (snapshot: Snapshot) => void;
}

export const VersionControl: React.FC<VersionControlProps> = ({
  files,
  snapshots,
  onAddSnapshot,
  onRestoreSnapshot,
}) => {
  const [commitMessage, setCommitMessage] = useState("");
  const [selectedSnapshot, setSelectedSnapshot] = useState<Snapshot | null>(null);
  const [diffFile, setDiffFile] = useState<{ path: string; oldContent: string; newContent: string } | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;

    onAddSnapshot(commitMessage.trim());
    setCommitMessage("");
  };

  const handleCompareFile = (snapshot: Snapshot, filePath: string) => {
    const snapFile = snapshot.files.find((f) => f.path === filePath);
    const currFile = files.find((f) => f.path === filePath);

    const oldContent = snapFile ? snapFile.content : "";
    const newContent = currFile ? currFile.content : "";

    setDiffFile({
      path: filePath,
      oldContent,
      newContent,
    });
    setIsCompareOpen(true);
  };

  return (
    <div className="space-y-6 text-zinc-300">
      {/* Compare Modal */}
      {diffFile && (
        <CompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          filename={diffFile.path}
          oldContent={diffFile.oldContent}
          newContent={diffFile.newContent}
          onApply={() => {
            // Apply this file back from the snapshot to the current files
            const snapFile = selectedSnapshot?.files.find((f) => f.path === diffFile.path);
            if (snapFile) {
              const fileToUpdate = files.map((f) =>
                f.path === diffFile.path ? { ...f, content: snapFile.content } : f
              );
              // Since we don't have the update files callback directly in the props of VersionControl (except indirectly via Restore),
              // we can let the user rollback the full snapshot, or they can use the direct rollback button below.
              // For individual file rollback, we notify them to perform full snapshot restore or use code editor.
            }
          }}
        />
      )}

      {/* Commit / Save Snapshot Card */}
      <form onSubmit={handleCreateSnapshot} className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-xl space-y-4">
        <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-purple-400" />
          CREATE WORKSPACE SNAPSHOT
        </h3>

        <div className="flex gap-3">
          <input
            type="text"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Type commit/snapshot message (e.g., 'Setup basic weather dashboard layout')..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-zinc-600"
            required
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-900/20 whitespace-nowrap"
          >
            <Save className="h-4 w-4" />
            Commit Snapshot
          </button>
        </div>
      </form>

      {/* Snapshot History list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* History List Side */}
        <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl overflow-hidden flex flex-col md:col-span-1 min-h-[300px]">
          <div className="px-5 py-3 border-b border-zinc-850 bg-zinc-950 flex items-center gap-2">
            <History className="h-4 w-4 text-purple-400" />
            <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              Commit History
            </span>
          </div>

          {snapshots.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-1">
              <History className="h-6 w-6 text-zinc-700" />
              <p className="text-xs">No snapshots taken yet.</p>
              <p className="text-[10px] text-zinc-600">Commit above to save your progress!</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-850/60 overflow-y-auto max-h-[350px]">
              {snapshots.map((snap) => {
                const isSelected = selectedSnapshot?.id === snap.id;
                return (
                  <button
                    key={snap.id}
                    onClick={() => setSelectedSnapshot(snap)}
                    className={`w-full text-left p-4 hover:bg-zinc-900/30 transition-colors flex flex-col gap-1.5 border-l-2 ${
                      isSelected ? "bg-purple-950/10 border-purple-600" : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-200 line-clamp-1">
                        {snap.message}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>{snap.files.length} {snap.files.length === 1 ? "file" : "files"}</span>
                      <span>{new Date(snap.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Snapshot Details Side */}
        <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl overflow-hidden md:col-span-2 min-h-[300px] flex flex-col">
          <div className="px-5 py-3 border-b border-zinc-850 bg-zinc-950 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              Snapshot Details
            </span>
            {selectedSnapshot && (
              <button
                onClick={() => onRestoreSnapshot(selectedSnapshot)}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow"
              >
                <RotateCcw className="h-3 w-3" />
                Rollback to this Commit
              </button>
            )}
          </div>

          {!selectedSnapshot ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-500 space-y-1">
              <Eye className="h-6 w-6 text-zinc-700" />
              <p className="text-xs">Select a commit from the history list to view files or compare changes.</p>
            </div>
          ) : (
            <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[350px]">
              <div>
                <p className="text-xs font-semibold text-white">{selectedSnapshot.message}</p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  ID: {selectedSnapshot.id} • Taken on {new Date(selectedSnapshot.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                  FILES IN THIS SNAPSHOT
                </p>
                <div className="divide-y divide-zinc-850 border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950/20">
                  {selectedSnapshot.files.map((file) => {
                    const currentFile = files.find((f) => f.path === file.path);
                    const isChanged = currentFile?.content !== file.content;

                    return (
                      <div key={file.path} className="px-4 py-2.5 flex items-center justify-between text-xs">
                        <span className="font-mono text-zinc-300 truncate max-w-[250px]">{file.path}</span>
                        <div className="flex items-center gap-3">
                          {isChanged ? (
                            <span className="text-[10px] bg-yellow-950/40 border border-yellow-900/30 text-yellow-500 px-1.5 py-0.5 rounded">
                              Modified
                            </span>
                          ) : (
                            <span className="text-[10px] bg-zinc-850 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                              Unchanged
                            </span>
                          )}

                          <button
                            onClick={() => handleCompareFile(selectedSnapshot, file.path)}
                            className="p-1 rounded hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors"
                            title="Compare code differences"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
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
  );
};
