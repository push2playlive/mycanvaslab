import React, { useState, useMemo } from "react";
import { 
  Search, 
  Replace, 
  ReplaceAll, 
  ChevronRight, 
  ChevronDown, 
  FileCode, 
  Check, 
  X, 
  CaseSensitive, 
  WholeWord, 
  ArrowRight, 
  Sparkles, 
  Info,
  Beaker,
  AlertCircle
} from "lucide-react";
import { VirtualFile } from "../types";

interface SearchReplacePanelProps {
  files: VirtualFile[];
  onSelectFile: (path: string) => void;
  onCodeChange: (path: string, code: string) => void;
  onNavigateToSnippet?: (path: string, lineNum: number) => void;
  accentColor: string;
}

interface SearchMatch {
  lineNum: number;
  text: string;
  startIndex: number;
  length: number;
}

interface FileSearchMatches {
  path: string;
  matches: SearchMatch[];
}

export default function SearchReplacePanel({
  files,
  onSelectFile,
  onCodeChange,
  onNavigateToSnippet,
  accentColor,
}: SearchReplacePanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [showReplaceControls, setShowReplaceControls] = useState(true);
  
  // Track expanded state of files in results list
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});
  
  // Action notifications
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "info"; text: string } | null>(null);

  // Core Search Engine: parses all files and finds matches
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const results: FileSearchMatches[] = [];

    files.forEach((file) => {
      const lines = file.content.split("\n");
      const fileMatches: SearchMatch[] = [];

      lines.forEach((lineText, index) => {
        let tempLine = lineText;
        let tempSearch = searchTerm;

        if (!matchCase) {
          tempLine = lineText.toLowerCase();
          tempSearch = searchTerm.toLowerCase();
        }

        let indexPos = 0;
        while ((indexPos = tempLine.indexOf(tempSearch, indexPos)) !== -1) {
          // Check whole word if option is enabled
          let isMatch = true;
          if (wholeWord) {
            const charBefore = indexPos > 0 ? lineText[indexPos - 1] : "";
            const charAfter = indexPos + searchTerm.length < lineText.length 
              ? lineText[indexPos + searchTerm.length] 
              : "";
            
            const wordRegex = /[a-zA-Z0-9_]/;
            if (wordRegex.test(charBefore) || wordRegex.test(charAfter)) {
              isMatch = false;
            }
          }

          if (isMatch) {
            fileMatches.push({
              lineNum: index + 1,
              text: lineText,
              startIndex: indexPos,
              length: searchTerm.length,
            });
          }

          indexPos += searchTerm.length || 1;
        }
      });

      if (fileMatches.length > 0) {
        results.push({
          path: file.path,
          matches: fileMatches,
        });
      }
    });

    // Auto-expand newly discovered matching files by default
    const initialExpanded: Record<string, boolean> = {};
    results.forEach((res) => {
      initialExpanded[res.path] = true;
    });
    setExpandedFiles((prev) => ({ ...initialExpanded, ...prev }));

    return results;
  }, [files, searchTerm, matchCase, wholeWord]);

  // Aggregate metrics
  const totalMatchesCount = useMemo(() => {
    return searchResults.reduce((acc, curr) => acc + curr.matches.length, 0);
  }, [searchResults]);

  // Handle selective replace on a single specific match
  const handleReplaceSingle = (path: string, match: SearchMatch) => {
    const file = files.find((f) => f.path === path);
    if (!file) return;

    const lines = file.content.split("\n");
    const lineText = lines[match.lineNum - 1];

    if (!lineText) return;

    // Splice the string to do exact positional replacement
    const newLineText = 
      lineText.substring(0, match.startIndex) + 
      replaceTerm + 
      lineText.substring(match.startIndex + match.length);

    lines[match.lineNum - 1] = newLineText;
    const newContent = lines.join("\n");
    
    onCodeChange(path, newContent);
    triggerNotice("success", `Replaced matching snippet in ${path.split("/").pop()}!`);
  };

  // Helper helper to execute replacement inside single file
  const performReplaceInFile = (file: VirtualFile) => {
    const lines = file.content.split("\n");
    const newLines = lines.map((lineText) => {
      let tempLine = lineText;
      let tempSearch = searchTerm;
      if (!matchCase) {
        tempLine = lineText.toLowerCase();
        tempSearch = searchTerm.toLowerCase();
      }

      let newText = "";
      let lastIdx = 0;
      let idx = 0;

      while ((idx = tempLine.indexOf(tempSearch, lastIdx)) !== -1) {
        let isMatch = true;
        if (wholeWord) {
          const charBefore = idx > 0 ? lineText[idx - 1] : "";
          const charAfter = idx + searchTerm.length < lineText.length 
            ? lineText[idx + searchTerm.length] 
            : "";
          const wordRegex = /[a-zA-Z0-9_]/;
          if (wordRegex.test(charBefore) || wordRegex.test(charAfter)) {
            isMatch = false;
          }
        }

        if (isMatch) {
          newText += lineText.substring(lastIdx, idx) + replaceTerm;
          lastIdx = idx + searchTerm.length;
        } else {
          newText += lineText.substring(lastIdx, idx + 1);
          lastIdx = idx + 1;
        }
      }
      newText += lineText.substring(lastIdx);
      return newText;
    });

    return newLines.join("\n");
  };

  // Handle selective file-level replacement
  const handleReplaceFile = (path: string) => {
    const file = files.find((f) => f.path === path);
    if (!file) return;

    const newContent = performReplaceInFile(file);
    onCodeChange(path, newContent);
    triggerNotice("success", `Refactored all matches in ${path.split("/").pop()}!`);
  };

  // Handle global global "Replace All" across all matching files
  const handleReplaceAll = () => {
    if (!searchTerm) return;
    let filesAffected = 0;

    searchResults.forEach((res) => {
      const file = files.find((f) => f.path === res.path);
      if (file) {
        const newContent = performReplaceInFile(file);
        onCodeChange(res.path, newContent);
        filesAffected++;
      }
    });

    triggerNotice(
      "success", 
      `Successfully replaced ${totalMatchesCount} matches across ${filesAffected} files!`
    );
  };

  const triggerNotice = (type: "success" | "info", text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => setActionNotice(null), 3500);
  };

  const toggleFileExpanded = (path: string) => {
    setExpandedFiles((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Helper to render matched text with a visual highlighted overlay
  const renderHighlightedText = (text: string, startIdx: number, length: number) => {
    const before = text.substring(0, startIdx);
    const match = text.substring(startIdx, startIdx + length);
    const after = text.substring(startIdx + length);

    return (
      <span className="font-mono text-[11px] truncate block text-zinc-400">
        <span className="text-zinc-600">{before}</span>
        <span 
          className="px-1 py-0.5 rounded font-extrabold shadow-sm bg-amber-500/25 text-amber-300 border border-amber-500/40"
          style={{ textShadow: "0 0 8px rgba(245, 158, 11, 0.5)" }}
        >
          {match}
        </span>
        <span className="text-zinc-500">{after}</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] border-r border-[#2a2a2a] text-zinc-300">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a] bg-[#141414]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-zinc-800 text-[var(--accent)]">
            <Search className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Search & Replace</span>
        </div>
        <button
          onClick={() => setShowReplaceControls(!showReplaceControls)}
          className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
            showReplaceControls 
              ? "bg-[var(--accent-glow)] text-[var(--accent)] border-[var(--accent)]/30" 
              : "bg-zinc-900 text-zinc-500 border-[#222] hover:text-zinc-300"
          }`}
          title="Toggle Replace Controls"
        >
          {showReplaceControls ? "Replace Mode" : "Search Only"}
        </button>
      </div>

      {/* Inputs Section */}
      <div className="p-4 border-b border-[#222] bg-[#161616] space-y-3 flex-shrink-0">
        
        {/* Search Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Search Query</label>
          <div className="relative flex items-center bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg focus-within:border-[var(--accent)] transition">
            <Search className="h-4 w-4 absolute left-3 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search across files..."
              className="w-full bg-transparent pl-9 pr-20 py-2.5 text-xs text-zinc-100 outline-none font-mono"
            />
            {/* Quick Match Options Bar inside input */}
            <div className="absolute right-2 flex items-center space-x-1.5 bg-[#141414] p-1 rounded border border-zinc-800">
              <button
                onClick={() => setMatchCase(!matchCase)}
                className={`p-1 rounded transition text-[10px] cursor-pointer ${
                  matchCase 
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" 
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
                title="Match Case"
              >
                <CaseSensitive className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setWholeWord(!wholeWord)}
                className={`p-1 rounded transition text-[10px] cursor-pointer ${
                  wholeWord 
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/40" 
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
                title="Match Whole Word"
              >
                <WholeWord className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Replace Field (if enabled) */}
        {showReplaceControls && (
          <div className="space-y-1.5 pt-1 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Replace With</label>
              {searchTerm && totalMatchesCount > 0 && (
                <button
                  onClick={handleReplaceAll}
                  className="text-[10px] uppercase font-extrabold text-amber-400 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
                  title="Refactor everywhere instantly"
                >
                  <ReplaceAll className="h-3.5 w-3.5" />
                  <span>Replace All ({totalMatchesCount})</span>
                </button>
              )}
            </div>
            <div className="relative flex items-center bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg focus-within:border-amber-500 transition">
              <Replace className="h-4 w-4 absolute left-3 text-zinc-500" />
              <input
                type="text"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                placeholder="Replace with..."
                className="w-full bg-transparent pl-9 pr-12 py-2.5 text-xs text-zinc-100 outline-none font-mono"
              />
              <span className="absolute right-3 text-[10px] text-zinc-600 font-mono select-none">
                Refactor
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Notification banner */}
      {actionNotice && (
        <div className="mx-4 mt-3 p-2 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <span className="line-clamp-2 leading-relaxed font-sans">{actionNotice.text}</span>
        </div>
      )}

      {/* Search results info / Welcome tips */}
      {!searchTerm ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500 space-y-4">
          <div className="p-3 bg-zinc-900 rounded-2xl">
            <Search className="h-8 w-8 text-zinc-700" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Global Search Engine</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
              Type above to perform sub-string regex searches, locate snippets in code, or perform large refactoring sweeps.
            </p>
          </div>
        </div>
      ) : searchResults.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-zinc-500 space-y-2">
          <AlertCircle className="h-6 w-6 text-zinc-700" />
          <p className="text-xs font-medium text-zinc-400">No matches found for "{searchTerm}"</p>
          <p className="text-[11px] text-zinc-600">Check spelling or change case-sensitivity options.</p>
        </div>
      ) : (
        /* Results list */
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
          <div className="text-[10px] uppercase font-bold text-zinc-500 px-1 tracking-wider flex items-center justify-between">
            <span>Results in Workspace</span>
            <span className="font-mono text-zinc-400">
              {searchResults.length} {searchResults.length === 1 ? "file" : "files"}, {totalMatchesCount} {totalMatchesCount === 1 ? "match" : "matches"}
            </span>
          </div>

          <div className="space-y-2">
            {searchResults.map((fileRes) => {
              const isExpanded = expandedFiles[fileRes.path] ?? true;
              const fileName = fileRes.path.split("/").pop() || "";

              return (
                <div key={fileRes.path} className="border border-zinc-900 bg-[#111] rounded-xl overflow-hidden shadow-sm">
                  
                  {/* File group Header */}
                  <div 
                    onClick={() => toggleFileExpanded(fileRes.path)}
                    className="flex items-center justify-between px-3 py-2 bg-[#171717] hover:bg-[#1c1c1c] cursor-pointer select-none border-b border-zinc-900 transition"
                  >
                    <div className="flex items-center space-x-2 overflow-hidden">
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                      )}
                      <FileCode className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <div className="font-mono text-xs text-zinc-300 font-semibold truncate">
                        {fileName}
                        <span className="text-[10px] text-zinc-500 font-normal ml-2 font-sans">
                          ({fileRes.matches.length} {fileRes.matches.length === 1 ? "match" : "matches"})
                        </span>
                      </div>
                    </div>

                    {/* Quick replace in file */}
                    {showReplaceControls && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReplaceFile(fileRes.path);
                        }}
                        className="px-2 py-0.5 text-[9px] uppercase font-extrabold bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/20 hover:border-amber-500/40 rounded transition flex items-center gap-1 cursor-pointer"
                        title={`Replace all ${fileRes.matches.length} matches in this file`}
                      >
                        <Replace className="h-3 w-3" />
                        <span>Replace File</span>
                      </button>
                    )}
                  </div>

                  {/* Lines list */}
                  {isExpanded && (
                    <div className="divide-y divide-zinc-900/60 bg-[#0c0c0c]/80 select-text">
                      {fileRes.matches.map((match, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            onSelectFile(fileRes.path);
                            if (onNavigateToSnippet) {
                              onNavigateToSnippet(fileRes.path, match.lineNum);
                            }
                          }}
                          className="group flex items-start gap-3 p-2.5 hover:bg-[#1a1a1a]/40 cursor-pointer transition select-text"
                        >
                          {/* Line gutter index */}
                          <div className="w-8 text-right font-mono text-[10px] text-zinc-600 select-none pt-0.5">
                            {match.lineNum}
                          </div>

                          {/* Highlighted text match */}
                          <div className="flex-1 min-w-0 select-text">
                            {renderHighlightedText(match.text, match.startIndex, match.length)}
                          </div>

                          {/* Single replace action button */}
                          {showReplaceControls && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReplaceSingle(fileRes.path, match);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-[10px] hover:bg-zinc-800 rounded text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center justify-center gap-1 self-center"
                              title="Replace this single match"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
