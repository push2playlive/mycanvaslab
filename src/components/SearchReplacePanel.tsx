import React, { useState, useMemo } from "react";
import { VirtualFile, SearchResult } from "../types";
import { Search, Replace, ReplaceAll, FileCode, CheckCircle, History } from "lucide-react";

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

  const saveSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, 8);
      localStorage.setItem("mycanvaslab_recent_searches", JSON.stringify(updated));
      return updated;
    });
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
    <div className="space-y-6 text-zinc-300">
      {/* Settings Grid */}
      <div className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-xl space-y-4">
        <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
          <Search className="h-4 w-4 text-purple-400" />
          GLOBAL SEARCH & REPLACE
        </h3>

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

            {/* Recent Searches Selection list */}
            {recentSearches.length > 0 && (
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1">
                    <History className="h-3 w-3 text-zinc-600" />
                    Past Searches:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem("mycanvaslab_recent_searches");
                    }}
                    className="text-[9px] text-zinc-600 hover:text-red-400 font-mono hover:underline cursor-pointer transition-colors"
                  >
                    Clear History
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pt-0.5">
                  {recentSearches.map((pastQuery, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(pastQuery);
                        setMessage(null);
                      }}
                      className={`px-2 py-0.5 text-[10px] rounded font-mono transition-all border text-left truncate max-w-[150px] cursor-pointer ${
                        searchQuery === pastQuery
                          ? "bg-purple-950/40 text-purple-400 border-purple-500/40"
                          : "bg-zinc-950/60 hover:bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-900 hover:border-zinc-800"
                      }`}
                      title={`Select "${pastQuery}"`}
                    >
                      {pastQuery}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
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
                      className="px-2.5 py-1 text-[10px] bg-zinc-800 hover:bg-purple-900/30 hover:text-purple-300 border border-zinc-750 hover:border-purple-900/40 text-zinc-300 font-medium rounded-md transition-all flex items-center gap-1.5"
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
  );
};
