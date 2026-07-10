import React, { useState, useMemo } from "react";
import { VirtualFile, SearchResult } from "../types";
import { Search, Replace, ReplaceAll, FileCode, CheckCircle, History, Trash2, X, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SearchReplacePanelProps {
  files: VirtualFile[];
  onUpdateFiles: (updatedFiles: VirtualFile[]) => void;
}

export const SearchReplacePanel: React.FC<SearchReplacePanelProps> = ({
  files,
  onUpdateFiles,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "info" } | null>(null);

  // Persistent search history
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("mycanvaslab_recent_searches");
    return saved ? JSON.parse(saved) : [];
  });

  const [isHistorySidebarOpen, setIsHistorySidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("mycanvaslab_history_sidebar_open");
    return saved !== "false"; // default to true
  });

  const toggleHistorySidebar = () => {
    setIsHistorySidebarOpen((prev) => {
      const updated = !prev;
      localStorage.setItem("mycanvaslab_history_sidebar_open", String(updated));
      return updated;
    });
  };

  const saveSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 20); // increased limit to 20 for sidebar
      localStorage.setItem("mycanvaslab_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteHistoryItem = (queryToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((q) => q !== queryToDelete);
      localStorage.setItem("mycanvaslab_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const getMatchCountForQuery = (query: string) => {
    if (!query) return 0;
    let count = 0;
    const lowerQuery = query.toLowerCase();
    files.forEach((file) => {
      const content = isCaseSensitive ? file.content : file.content.toLowerCase();
      const target = isCaseSensitive ? query : lowerQuery;
      let pos = 0;
      while (true) {
        const idx = content.indexOf(target, pos);
        if (idx === -1) break;
        count++;
        pos = idx + target.length;
      }
    });
    return count;
  };

  // Computed search results matching query
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery) return [];
    const results: SearchResult[] = [];

    files.forEach((file) => {
      const lines = file.content.split("\n");
      lines.forEach((line, lineIdx) => {
        let contentToSearch = line;
        let queryToSearch = searchQuery;

        if (!isCaseSensitive) {
          contentToSearch = contentToSearch.toLowerCase();
          queryToSearch = queryToSearch.toLowerCase();
        }

        let startPos = 0;
        while (true) {
          const matchIdx = contentToSearch.indexOf(queryToSearch, startPos);
          if (matchIdx === -1) break;

          results.push({
            filePath: file.path,
            lineNumber: lineIdx + 1,
            lineContent: line,
            matchIndex: matchIdx,
            matchLength: searchQuery.length,
          });

          // Move forward to find other occurrences in the same line
          startPos = matchIdx + searchQuery.length;
        }
      });
    });

    return results;
  }, [files, searchQuery, isCaseSensitive]);

  // Execute replace operation for ALL matches in files
  const handleReplaceAll = () => {
    if (!searchQuery) return;
    saveSearchQuery(searchQuery);

    let totalReplacements = 0;
    const updatedFiles = files.map((file) => {
      let content = file.content;
      let occurrences = 0;

      if (isCaseSensitive) {
        occurrences = (content.split(searchQuery).length - 1);
        content = content.replaceAll(searchQuery, replaceQuery);
      } else {
        // Case insensitive replacement using regex
        try {
          const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(escapedQuery, "gi");
          occurrences = (content.match(regex) || []).length;
          content = content.replace(regex, replaceQuery);
        } catch (e) {
          // Fallback simple replace
          occurrences = (content.split(searchQuery).length - 1);
          content = content.replaceAll(searchQuery, replaceQuery);
        }
      }

      totalReplacements += occurrences;
      return { ...file, content };
    });

    if (totalReplacements > 0) {
      onUpdateFiles(updatedFiles);
      setMessage({
        text: `Successfully replaced ${totalReplacements} occurrences across the workspace.`,
        type: "success",
      });
    } else {
      setMessage({ text: "No matching occurrences found to replace.", type: "info" });
    }
  };

  // Replace occurrences inside a single specific file
  const handleReplaceInFile = (filePath: string) => {
    if (!searchQuery) return;
    saveSearchQuery(searchQuery);

    let occurrences = 0;
    const updatedFiles = files.map((file) => {
      if (file.path !== filePath) return file;
      let content = file.content;

      if (isCaseSensitive) {
        occurrences = (content.split(searchQuery).length - 1);
        content = content.replaceAll(searchQuery, replaceQuery);
      } else {
        try {
          const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(escapedQuery, "gi");
          occurrences = (content.match(regex) || []).length;
          content = content.replace(regex, replaceQuery);
        } catch (e) {
          occurrences = (content.split(searchQuery).length - 1);
          content = content.replaceAll(searchQuery, replaceQuery);
        }
      }

      return { ...file, content };
    });

    if (occurrences > 0) {
      onUpdateFiles(updatedFiles);
      setMessage({
        text: `Replaced ${occurrences} occurrences in "${filePath}".`,
        type: "success",
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start text-zinc-300">
      {/* Search History Sidebar */}
      <AnimatePresence initial={false}>
        {isHistorySidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0, marginRight: 0 }}
            animate={{ width: "280px", opacity: 1, marginRight: "1.5rem" }}
            exit={{ width: 0, opacity: 0, marginRight: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full lg:w-[280px] shrink-0 bg-zinc-950/80 border border-zinc-850 rounded-xl p-4 space-y-4 overflow-hidden shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <History className="h-4 w-4 text-purple-400" />
                <span>Search History</span>
              </div>
              <div className="flex items-center gap-1.5">
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem("mycanvaslab_recent_searches");
                    }}
                    className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-red-400 transition-all cursor-pointer"
                    title="Clear All History"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleHistorySidebar}
                  className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                  title="Close Sidebar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {recentSearches.length === 0 ? (
              <div className="text-center py-8 text-zinc-600 space-y-1">
                <History className="h-5 w-5 mx-auto text-zinc-800" />
                <p className="text-[10px]">No search history yet.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
                {recentSearches.map((pastQuery, idx) => {
                  const matchCount = getMatchCountForQuery(pastQuery);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSearchQuery(pastQuery);
                        setMessage(null);
                      }}
                      className={`group flex items-center justify-between p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        searchQuery === pastQuery
                          ? "bg-purple-950/40 text-purple-400 border-purple-500/40 shadow-sm"
                          : "bg-zinc-900/40 hover:bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-900/60 hover:border-zinc-800"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="font-mono text-xs truncate font-medium pr-1">
                          {pastQuery}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-sans">
                          {matchCount} {matchCount === 1 ? "match" : "matches"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        <button
                          type="button"
                          className="p-1 rounded bg-zinc-950/60 border border-zinc-850 hover:border-purple-500/30 text-zinc-500 hover:text-purple-400 transition-all opacity-0 group-hover:opacity-100"
                          title="Run Search"
                        >
                          <Play className="h-2.5 w-2.5 fill-current" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => deleteHistoryItem(pastQuery, e)}
                          className="p-1 rounded bg-zinc-950/60 border border-zinc-850 hover:border-red-500/30 text-zinc-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                          title="Remove from history"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 w-full space-y-6">
        {/* Settings Grid */}
        <div className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
              <Search className="h-4 w-4 text-purple-400" />
              GLOBAL SEARCH & REPLACE
            </h3>
            
            {!isHistorySidebarOpen && (
              <button
                type="button"
                onClick={toggleHistorySidebar}
                className="px-2.5 py-1 text-[10px] bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
                title="Show Search History Sidebar"
              >
                <History className="h-3 w-3 text-purple-400 animate-pulse" />
                Show History
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Find input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-400">FIND WORD/STRING</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setMessage(null);
                  }}
                  onBlur={() => saveSearchQuery(searchQuery)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveSearchQuery(searchQuery);
                    }
                  }}
                  placeholder="Type query to search files..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-zinc-600"
                />
              </div>
            </div>

            {/* Replace input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-400">REPLACE WITH</label>
              <div className="relative">
                <Replace className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => {
                    setReplaceQuery(e.target.value);
                    setMessage(null);
                  }}
                  placeholder="Type replacement string..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-850/40">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-zinc-400">
              <input
                type="checkbox"
                checked={isCaseSensitive}
                onChange={(e) => setIsCaseSensitive(e.target.checked)}
                className="rounded bg-zinc-950 border-zinc-800 text-purple-600 focus:ring-purple-600"
              />
              Case Sensitive Matching
            </label>

            <button
              onClick={handleReplaceAll}
              disabled={!searchQuery || searchResults.length === 0}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                searchQuery && searchResults.length > 0
                  ? "bg-purple-600 hover:bg-purple-500 text-white"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              <ReplaceAll className="h-4 w-4" />
              Replace All ({searchResults.length})
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-3 rounded-lg flex items-center gap-2 text-xs ${
              message.type === "success"
                ? "bg-emerald-950/25 border border-emerald-900/30 text-emerald-400"
                : "bg-zinc-850 border border-zinc-800 text-zinc-400"
            }`}
          >
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Results view */}
        <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-850 bg-zinc-950 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              Search Results ({searchResults.length} matches)
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 space-y-1">
              <Search className="h-6 w-6 mx-auto text-zinc-700" />
              <p className="text-xs">
                {searchQuery ? "No matches found." : "Type a find query above to list workspace matches."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-850 max-h-[400px] overflow-y-auto">
              {/* Group results by file */}
              {Array.from(new Set(searchResults.map((r) => r.filePath))).map((filePath) => {
                const fileResults = searchResults.filter((r) => r.filePath === filePath);

                return (
                  <div key={filePath} className="p-4 space-y-3 bg-zinc-950/20">
                    {/* File Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
                        <FileCode className="h-4 w-4 text-blue-400" />
                        <span>{filePath}</span>
                        <span className="text-[10px] text-zinc-500">({fileResults.length} matches)</span>
                      </div>

                      <button
                        onClick={() => handleReplaceInFile(filePath)}
                        className="px-2.5 py-1 text-[10px] bg-zinc-800 hover:bg-purple-900/30 hover:text-purple-300 border border-zinc-750 hover:border-purple-900/40 text-zinc-300 font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Replace className="h-3 w-3" />
                        Replace In File
                      </button>
                    </div>

                    {/* Matching Lines list */}
                    <div className="space-y-1">
                      {fileResults.map((res, i) => {
                        const before = res.lineContent.substring(0, res.matchIndex);
                        const match = res.lineContent.substring(res.matchIndex, res.matchIndex + res.matchLength);
                        const after = res.lineContent.substring(res.matchIndex + res.matchLength);

                        return (
                          <div
                            key={i}
                            className="flex items-start gap-3 pl-6 pr-4 py-1.5 hover:bg-zinc-900/30 rounded font-mono text-[11px] leading-relaxed transition-colors border-l-2 border-transparent hover:border-purple-600"
                          >
                            <span className="text-zinc-600 select-none text-right w-8">
                              {res.lineNumber}
                            </span>
                            <span className="text-zinc-400 whitespace-pre truncate">
                              {before}
                              <mark className="bg-yellow-500/30 text-yellow-200 py-0.5 px-0.5 rounded border border-yellow-500/20">
                                {match}
                              </mark>
                              {after}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
