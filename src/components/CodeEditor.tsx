import React, { useState, useEffect, useRef } from "react";
import { 
  FileCode, X, Play, Save, Check, Code, FileCode2, Sparkles,
  HelpCircle, Trash2, MousePointer, ChevronUp, ChevronDown, CopyPlus, Info
} from "lucide-react";
import { VirtualFile } from "../types";

interface CodeEditorProps {
  files: VirtualFile[];
  activeFile: string;
  openTabs: string[];
  onSelectFile: (path: string) => void;
  onCloseTab: (path: string) => void;
  onCodeChange: (path: string, code: string) => void;
  onRunCode: () => void;
  highlightedLine?: number;
}

export default function CodeEditor({
  files,
  activeFile,
  openTabs,
  onSelectFile,
  onCloseTab,
  onCodeChange,
  onRunCode,
  highlightedLine,
}: CodeEditorProps) {
  const currentFile = files.find((f) => f.path === activeFile);
  const code = currentFile ? currentFile.content : "";
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showFormattedToast, setShowFormattedToast] = useState(false);

  // Multi-cursor state configuration
  const [cursors, setCursors] = useState<number[]>([]);
  const [primaryCursor, setPrimaryCursor] = useState<number>(0);
  const [multiCursorMode, setMultiCursorMode] = useState(false);
  const [showMultiCursorHub, setShowMultiCursorHub] = useState(false);
  const [multiCursorNotice, setMultiCursorNotice] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Clear secondary cursors upon switching files
  useEffect(() => {
    setCursors([]);
    setPrimaryCursor(0);
  }, [activeFile]);

  const triggerNotice = (msg: string) => {
    setMultiCursorNotice(msg);
    setTimeout(() => setMultiCursorNotice(null), 3000);
  };

  // Sync scroll of textarea and pre code container
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Dynamic scroll-to-line when a specific snippet is navigated
  useEffect(() => {
    if (highlightedLine && textareaRef.current && preRef.current) {
      const lineOffset = (highlightedLine - 1) * 24; // 24px is standard for text-xs leading-6
      const viewportHeight = textareaRef.current.clientHeight;
      const targetScroll = Math.max(0, lineOffset - viewportHeight / 2 + 12);
      
      textareaRef.current.scrollTop = targetScroll;
      preRef.current.scrollTop = targetScroll;
    }
  }, [highlightedLine, activeFile]);

  // Syntax highlighting logic
  const highlightCode = (rawCode: string) => {
    if (!rawCode) return "";

    // Escape HTML characters
    let html = rawCode
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Rules for styling
    // 1. Comments
    html = html.replace(/(\/\/.*)/g, '<span class="text-zinc-500 italic">$1</span>');
    html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-zinc-500 italic">$1</span>');

    // 2. Strings
    html = html.replace(/(["'`])(.*?)\1/g, '<span class="text-amber-300">$1$2$1</span>');

    // 3. Keywords
    const keywords = [
      "import", "export", "default", "function", "const", "let", "var", "return",
      "if", "else", "for", "while", "from", "class", "extends", "true", "false",
      "null", "undefined", "interface", "type", "as", "from", "new", "async", "await", "try", "catch"
    ];
    const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    html = html.replace(keywordRegex, '<span class="text-[#F27D26] font-semibold">$1</span>');

    // 4. TSX Tags (e.g. &lt;div&gt;, &lt;button&gt;)
    html = html.replace(/(&lt;\/?[a-zA-Z0-9_-]+&gt;)/g, '<span class="text-rose-400">$1</span>');
    html = html.replace(/(&lt;[a-zA-Z0-9_-]+)/g, '<span class="text-rose-400">$1</span>');
    html = html.replace(/([a-zA-Z0-9_-]+=)/g, '<span class="text-sky-400">$1</span>');

    // 5. Hooks & React functions
    html = html.replace(/\b(useState|useEffect|useRef|useMemo|useCallback|useContext|React)\b/g, '<span class="text-cyan-400">$1</span>');

    return html;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If there are no secondary cursors, fallback to the standard single cursor behavior
    if (cursors.length === 0) {
      // Standard tab handling
      if (e.key === "Tab") {
        e.preventDefault();
        const start = e.currentTarget.selectionStart;
        const end = e.currentTarget.selectionEnd;
        const newCode = code.substring(0, start) + "  " + code.substring(end);
        onCodeChange(activeFile, newCode);
        
        // Reset caret position
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
      return;
    }

    // Multi-cursor handling
    const textarea = textareaRef.current;
    if (!textarea) return;

    const currentSelectionStart = textarea.selectionStart;

    // Combine primary cursor index and secondary cursors, sorted ascending
    let allCursors = [...cursors];
    if (!allCursors.includes(currentSelectionStart)) {
      allCursors.push(currentSelectionStart);
    }
    allCursors.sort((a, b) => a - b);

    // 1. Backspace
    if (e.key === "Backspace") {
      e.preventDefault();
      let newCode = code;
      let shift = 0;
      const newCursors: number[] = [];

      allCursors.forEach((pos) => {
        const actualPos = pos - shift;
        if (actualPos > 0) {
          newCode = newCode.substring(0, actualPos - 1) + newCode.substring(actualPos);
          newCursors.push(pos - 1 - shift);
          shift += 1;
        } else {
          newCursors.push(0);
        }
      });

      onCodeChange(activeFile, newCode);
      
      const primaryIndex = allCursors.indexOf(currentSelectionStart);
      const newPrimary = newCursors[primaryIndex];
      const newSecondaries = newCursors.filter((_, idx) => idx !== primaryIndex);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPrimary;
          setPrimaryCursor(newPrimary);
          setCursors(newSecondaries);
        }
      }, 0);
      return;
    }

    // 2. Delete
    if (e.key === "Delete") {
      e.preventDefault();
      let newCode = code;
      let shift = 0;
      const newCursors: number[] = [];

      allCursors.forEach((pos) => {
        const actualPos = pos - shift;
        if (actualPos < newCode.length) {
          newCode = newCode.substring(0, actualPos) + newCode.substring(actualPos + 1);
          shift += 1;
        }
        newCursors.push(pos - shift);
      });

      onCodeChange(activeFile, newCode);
      
      const primaryIndex = allCursors.indexOf(currentSelectionStart);
      const newPrimary = newCursors[primaryIndex];
      const newSecondaries = newCursors.filter((_, idx) => idx !== primaryIndex);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPrimary;
          setPrimaryCursor(newPrimary);
          setCursors(newSecondaries);
        }
      }, 0);
      return;
    }

    // 3. Enter
    if (e.key === "Enter") {
      e.preventDefault();
      let newCode = code;
      let shift = 0;
      const newCursors: number[] = [];

      allCursors.forEach((pos) => {
        const actualPos = pos + shift;
        newCode = newCode.substring(0, actualPos) + "\n" + newCode.substring(actualPos);
        newCursors.push(pos + 1 + shift);
        shift += 1;
      });

      onCodeChange(activeFile, newCode);

      const primaryIndex = allCursors.indexOf(currentSelectionStart);
      const newPrimary = newCursors[primaryIndex];
      const newSecondaries = newCursors.filter((_, idx) => idx !== primaryIndex);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPrimary;
          setPrimaryCursor(newPrimary);
          setCursors(newSecondaries);
        }
      }, 0);
      return;
    }

    // 4. Tab
    if (e.key === "Tab") {
      e.preventDefault();
      let newCode = code;
      let shift = 0;
      const newCursors: number[] = [];

      allCursors.forEach((pos) => {
        const actualPos = pos + shift;
        newCode = newCode.substring(0, actualPos) + "  " + newCode.substring(actualPos);
        newCursors.push(pos + 2 + shift);
        shift += 2;
      });

      onCodeChange(activeFile, newCode);

      const primaryIndex = allCursors.indexOf(currentSelectionStart);
      const newPrimary = newCursors[primaryIndex];
      const newSecondaries = newCursors.filter((_, idx) => idx !== primaryIndex);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPrimary;
          setPrimaryCursor(newPrimary);
          setCursors(newSecondaries);
        }
      }, 0);
      return;
    }

    // 5. Arrow Keys (Left / Right)
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const newCursors = allCursors.map((pos) => Math.max(0, pos - 1));
      const primaryIndex = allCursors.indexOf(currentSelectionStart);
      const newPrimary = newCursors[primaryIndex];
      const newSecondaries = newCursors.filter((_, idx) => idx !== primaryIndex);

      textarea.selectionStart = textarea.selectionEnd = newPrimary;
      setPrimaryCursor(newPrimary);
      setCursors(newSecondaries);
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const newCursors = allCursors.map((pos) => Math.min(code.length, pos + 1));
      const primaryIndex = allCursors.indexOf(currentSelectionStart);
      const newPrimary = newCursors[primaryIndex];
      const newSecondaries = newCursors.filter((_, idx) => idx !== primaryIndex);

      textarea.selectionStart = textarea.selectionEnd = newPrimary;
      setPrimaryCursor(newPrimary);
      setCursors(newSecondaries);
      return;
    }

    // 6. Arrow Keys (Up / Down)
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const lines = code.split("\n");
      
      const indexToPos = (idx: number) => {
        let currentLen = 0;
        for (let i = 0; i < lines.length; i++) {
          const lineLen = lines[i].length + 1;
          if (currentLen + lineLen > idx) {
            return { line: i, col: idx - currentLen };
          }
          currentLen += lineLen;
        }
        return { line: lines.length - 1, col: lines[lines.length - 1].length };
      };

      const posToIndex = (line: number, col: number) => {
        let idx = 0;
        for (let i = 0; i < line; i++) {
          idx += lines[i].length + 1;
        }
        return idx + Math.min(col, lines[line]?.length || 0);
      };

      const isUp = e.key === "ArrowUp";
      const newCursors = allCursors.map((pos) => {
        const { line, col } = indexToPos(pos);
        const targetLine = isUp ? Math.max(0, line - 1) : Math.min(lines.length - 1, line + 1);
        return posToIndex(targetLine, col);
      });

      const primaryIndex = allCursors.indexOf(currentSelectionStart);
      const newPrimary = newCursors[primaryIndex];
      const newSecondaries = newCursors.filter((_, idx) => idx !== primaryIndex);

      textarea.selectionStart = textarea.selectionEnd = newPrimary;
      setPrimaryCursor(newPrimary);
      setCursors(newSecondaries);
      return;
    }

    // 7. Regular Text Input / Printable character
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const char = e.key;
      let newCode = code;
      let shift = 0;
      const newCursors: number[] = [];

      allCursors.forEach((pos) => {
        const actualPos = pos + shift;
        newCode = newCode.substring(0, actualPos) + char + newCode.substring(actualPos);
        newCursors.push(pos + 1 + shift);
        shift += 1;
      });

      onCodeChange(activeFile, newCode);

      const primaryIndex = allCursors.indexOf(currentSelectionStart);
      const newPrimary = newCursors[primaryIndex];
      const newSecondaries = newCursors.filter((_, idx) => idx !== primaryIndex);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPrimary;
          setPrimaryCursor(newPrimary);
          setCursors(newSecondaries);
        }
      }, 0);
    }
  };

  // Click-to-add multi-cursor logic
  const handleMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    setPrimaryCursor(start);

    // Skip if dragging or highlighting multiple characters
    if (start !== end) {
      return;
    }

    if (e.altKey || multiCursorMode) {
      if (cursors.includes(start)) {
        setCursors((prev) => prev.filter((pos) => pos !== start));
        triggerNotice("Cursor removed");
      } else {
        setCursors((prev) => [...prev, start].sort((a, b) => a - b));
        triggerNotice("Cursor added");
      }
    } else {
      // Clear secondary cursors on normal click
      if (cursors.length > 0) {
        setCursors([]);
        triggerNotice("Secondary cursors cleared");
      }
    }
  };

  // Select all occurrences of the highlighted word or the word under the cursor
  const selectAllOccurrences = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    let targetWord = "";
    if (start === end) {
      const text = code;
      let left = start;
      while (left > 0 && /[a-zA-Z0-9_]/.test(text[left - 1])) {
        left--;
      }
      let right = start;
      while (right < text.length && /[a-zA-Z0-9_]/.test(text[right])) {
        right++;
      }
      if (left !== right) {
        targetWord = text.substring(left, right);
      }
    } else {
      targetWord = code.substring(start, end);
    }

    if (!targetWord.trim()) {
      triggerNotice("Place your cursor inside a word first!");
      return;
    }

    const newCursors: number[] = [];
    let idx = code.indexOf(targetWord);
    while (idx !== -1) {
      newCursors.push(idx + targetWord.length);
      idx = code.indexOf(targetWord, idx + 1);
    }

    if (newCursors.length > 0) {
      const primary = newCursors[newCursors.length - 1];
      const secondaries = newCursors.slice(0, -1);

      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = primary;
      setPrimaryCursor(primary);
      setCursors(secondaries);
      triggerNotice(`Placed ${newCursors.length} cursors on "${targetWord}"!`);
    }
  };

  // Add cursor at same column on the line above
  const addCursorAbove = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const primaryPos = textarea.selectionStart;
    const lines = code.split("\n");

    const indexToPos = (idx: number) => {
      let currentLen = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineLen = lines[i].length + 1;
        if (currentLen + lineLen > idx) {
          return { line: i, col: idx - currentLen };
        }
        currentLen += lineLen;
      }
      return { line: lines.length - 1, col: lines[lines.length - 1].length };
    };

    const posToIndex = (line: number, col: number) => {
      let idx = 0;
      for (let i = 0; i < line; i++) {
        idx += lines[i].length + 1;
      }
      return idx + Math.min(col, lines[line]?.length || 0);
    };

    const { line, col } = indexToPos(primaryPos);
    if (line > 0) {
      const targetPos = posToIndex(line - 1, col);
      if (!cursors.includes(targetPos)) {
        setCursors((prev) => [...prev, targetPos].sort((a, b) => a - b));
        triggerNotice("Cursor added on line above");
      }
    } else {
      triggerNotice("Already on first line");
    }
  };

  // Add cursor at same column on the line below
  const addCursorBelow = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const primaryPos = textarea.selectionStart;
    const lines = code.split("\n");

    const indexToPos = (idx: number) => {
      let currentLen = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineLen = lines[i].length + 1;
        if (currentLen + lineLen > idx) {
          return { line: i, col: idx - currentLen };
        }
        currentLen += lineLen;
      }
      return { line: lines.length - 1, col: lines[lines.length - 1].length };
    };

    const posToIndex = (line: number, col: number) => {
      let idx = 0;
      for (let i = 0; i < line; i++) {
        idx += lines[i].length + 1;
      }
      return idx + Math.min(col, lines[line]?.length || 0);
    };

    const { line, col } = indexToPos(primaryPos);
    if (line < lines.length - 1) {
      const targetPos = posToIndex(line + 1, col);
      if (!cursors.includes(targetPos)) {
        setCursors((prev) => [...prev, targetPos].sort((a, b) => a - b));
        triggerNotice("Cursor added on line below");
      }
    } else {
      triggerNotice("Already on last line");
    }
  };

  const clearCursors = () => {
    setCursors([]);
    triggerNotice("Secondary cursors cleared");
  };

  // Render highlighted HTML overlay including active cursors
  const renderHighlightedWithCursors = (rawCode: string) => {
    const allActiveCursors = [...cursors];
    if (!allActiveCursors.includes(primaryCursor)) {
      allActiveCursors.push(primaryCursor);
    }
    allActiveCursors.sort((a, b) => a - b);

    let tempCode = rawCode;
    const sortedPositions = [...allActiveCursors].sort((a, b) => b - a);
    sortedPositions.forEach((pos, idx) => {
      if (pos >= 0 && pos <= tempCode.length) {
        const originalIdx = sortedPositions.length - 1 - idx;
        tempCode = tempCode.substring(0, pos) + `§§${originalIdx}§§` + tempCode.substring(pos);
      }
    });

    let html = highlightCode(tempCode);

    allActiveCursors.forEach((pos, idx) => {
      const placeholder = `§§${idx}§§`;
      const isPrimary = pos === primaryCursor;
      const hasSelection = textareaRef.current && textareaRef.current.selectionStart !== textareaRef.current.selectionEnd;
      
      if (isPrimary && hasSelection) {
        html = html.replace(new RegExp(placeholder, "g"), "");
      } else {
        const cursorHtml = `<span class="relative inline-block select-none pointer-events-none" style="width: 0px; height: 1.2em; vertical-align: text-bottom; margin-left: -1px; margin-right: -1px;"><span class="absolute left-0 w-[2.2px] h-[15px] bg-[var(--accent)] multi-cursor-blink rounded-sm" style="box-shadow: 0 0 8px var(--accent);"></span></span>`;
        html = html.replace(new RegExp(placeholder, "g"), cursorHtml);
      }
    });

    return html;
  };

  const styleContent = `
    @keyframes cursorBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .multi-cursor-blink {
      animation: cursorBlink 1s step-end infinite;
    }
  `;

  const formatCode = (rawCode: string, fileName: string): string => {
    if (!rawCode) return "";
    
    const lines = rawCode.split("\n");
    const formattedLines: string[] = [];
    let indentLevel = 0;
    let inTemplateLiteral = false;
    let inBlockComment = false;
    let consecutiveBlankLines = 0;

    const isHtml = fileName.endsWith(".html");

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      // Preserve space inside block comments or template literals
      if (inTemplateLiteral || inBlockComment) {
        formattedLines.push(rawLine);
        if (inTemplateLiteral && rawLine.includes("`")) {
          const backticks = (rawLine.match(/`/g) || []).length;
          if (backticks % 2 !== 0) {
            inTemplateLiteral = false;
          }
        }
        if (inBlockComment && rawLine.includes("*/")) {
          inBlockComment = false;
        }
        continue;
      }

      if (trimmed === "") {
        consecutiveBlankLines++;
        if (consecutiveBlankLines <= 1) {
          formattedLines.push("");
        }
        continue;
      }
      consecutiveBlankLines = 0;

      // Detect toggle comments or template strings
      const backticks = (trimmed.match(/`/g) || []).length;
      if (backticks % 2 !== 0) {
        inTemplateLiteral = true;
      }
      if (trimmed.includes("/*") && !trimmed.includes("*/")) {
        inBlockComment = true;
      }

      // HTML-specific or standard curly-bracket-specific checks
      let startsWithClose = false;
      let opens = 0;
      let closes = 0;

      if (isHtml) {
        startsWithClose = trimmed.startsWith("</");
        const openTags = trimmed.match(/<[a-zA-Z0-9]+(?:\s+[^>]*[^/>])?>/g) || [];
        const closeTags = trimmed.match(/<\/[a-zA-Z0-9]+>/g) || [];
        opens = openTags.length;
        closes = closeTags.length;
      } else {
        startsWithClose = /^[}\])]+/.test(trimmed);
        const cleanLine = trimmed
          .replace(/\/\/.*$/g, "")
          .replace(/(["'])(.*?)\1/g, "");
        opens = (cleanLine.match(/[{[(]/g) || []).length;
        closes = (cleanLine.match(/[}\]]/g) || []).length;
      }

      let currentLineIndent = indentLevel;
      if (startsWithClose && currentLineIndent > 0) {
        currentLineIndent = Math.max(0, currentLineIndent - 1);
      }

      indentLevel = Math.max(0, indentLevel + opens - closes);

      const indentSpaces = "  ".repeat(currentLineIndent);
      formattedLines.push(indentSpaces + trimmed);
    }

    // Trim leading/trailing blank lines
    while (formattedLines.length > 0 && formattedLines[0] === "") {
      formattedLines.shift();
    }
    while (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] === "") {
      formattedLines.pop();
    }

    return formattedLines.join("\n") + "\n";
  };

  const formatCodePrettier = async (rawCode: string, fileName: string): Promise<string> => {
    try {
      // Dynamically load Prettier to keep bundle lightweight and load on demand
      const prettier = await import("prettier/standalone");
      const babelPlugin = await import("prettier/plugins/babel");
      const estreePlugin = await import("prettier/plugins/estree");
      const htmlPlugin = await import("prettier/plugins/html");
      const postcssPlugin = await import("prettier/plugins/postcss");

      let parser = "babel-ts";
      if (fileName.endsWith(".html")) {
        parser = "html";
      } else if (fileName.endsWith(".css")) {
        parser = "css";
      } else if (fileName.endsWith(".js") || fileName.endsWith(".jsx")) {
        parser = "babel";
      }

      const formatted = await prettier.format(rawCode, {
        parser,
        plugins: [
          babelPlugin.default || babelPlugin,
          estreePlugin.default || estreePlugin,
          htmlPlugin.default || htmlPlugin,
          postcssPlugin.default || postcssPlugin,
        ] as any,
        semi: true,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: "es5",
        printWidth: 80,
      });

      return formatted;
    } catch (err) {
      console.warn("Prettier standalone formatting failed, falling back to basic formatter:", err);
      return formatCode(rawCode, fileName);
    }
  };

  const handleFormatCode = async () => {
    if (!currentFile) return;
    const formatted = await formatCodePrettier(code, activeFile);
    onCodeChange(activeFile, formatted);
    setShowFormattedToast(true);
    setTimeout(() => setShowFormattedToast(false), 2000);
  };

  const saveFile = () => {
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".html")) return <FileCode2 className="h-4 w-4 text-[var(--accent)]" />;
    if (fileName.endsWith(".css")) return <FileCode className="h-4 w-4 text-cyan-400" />;
    return <FileCode className="h-4 w-4 text-blue-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-zinc-100 border-r border-[#2a2a2a]">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] bg-[#141414] px-2 overflow-x-auto scrollbar-none h-9">
        <div className="flex items-center h-full">
          {openTabs.map((tabPath) => {
            const isActive = tabPath === activeFile;
            const parts = tabPath.split("/");
            const name = parts[parts.length - 1];

            return (
              <div
                key={tabPath}
                className={`group flex items-center gap-1.5 h-full px-4 border-r border-[#2a2a2a] cursor-pointer select-none text-xs transition-all ${
                  isActive
                    ? "bg-[#1e1e1e] text-[var(--accent)] font-medium"
                    : "text-gray-500 hover:text-gray-300 hover:bg-[#1e1e1e]/45"
                }`}
                onClick={() => onSelectFile(tabPath)}
              >
                {getFileIcon(name)}
                <span className="font-mono">{name}</span>
                {openTabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tabPath);
                    }}
                    className="p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pr-2">
          {/* Saved notification */}
          {showFormattedToast && (
            <span className="flex items-center gap-1 text-[11px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20 animate-fadeIn">
              <Sparkles className="h-3.5 w-3.5 animate-spin" /> Formatted!
            </span>
          )}
          {showSavedToast && (
            <span className="flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 animate-fadeIn">
              <Check className="h-3 w-3" /> Saved!
            </span>
          )}

          {/* Multi-Cursor Hub Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowMultiCursorHub(!showMultiCursorHub)}
              className={`p-1 px-2 rounded transition cursor-pointer flex items-center gap-1 text-xs border ${
                cursors.length > 0 || multiCursorMode
                  ? "bg-[var(--accent-glow)] border-[var(--accent)]/30 text-[var(--accent)] font-bold shadow-[0_0_10px_rgba(34,197,94,0.1)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1e1e1e] border-transparent"
              }`}
              title="Multi-Cursor Control Hub"
            >
              <MousePointer className="h-4 w-4" />
              <span className="text-[11px] hidden sm:inline">Cursors</span>
              {(cursors.length > 0 || multiCursorMode) && (
                <span className="font-mono text-[10px] bg-[var(--accent)] text-[var(--accent-text)] px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {cursors.length + 1}
                </span>
              )}
            </button>

            {showMultiCursorHub && (
              <div className="absolute right-0 top-8 z-50 w-72 p-4 bg-[#141414] border border-[#2a2a2a] rounded-xl shadow-2xl space-y-3 text-zinc-300 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#222] pb-2">
                  <div className="flex items-center gap-1.5">
                    <MousePointer className="h-4 w-4 text-[var(--accent)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Multi-Cursor Hub</span>
                  </div>
                  <button
                    onClick={() => setShowMultiCursorHub(false)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between bg-zinc-900/60 p-2 rounded-lg border border-zinc-800">
                  <span className="text-[11px] text-zinc-400">Active Cursors</span>
                  <span className="font-mono text-xs text-[var(--accent)] font-bold">
                    {cursors.length + 1} position{cursors.length > 0 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Click-to-add mode toggle */}
                  <button
                    onClick={() => {
                      setMultiCursorMode(!multiCursorMode);
                      triggerNotice(multiCursorMode ? "Normal click mode" : "Click-to-add cursor mode");
                    }}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                      multiCursorMode
                        ? "bg-[var(--accent-glow)] text-[var(--accent)] border-[var(--accent)]/30"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">Click-to-Add Mode</span>
                      <span className="text-[10px] text-zinc-500">Add cursors on tap/click (No Alt key needed)</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${multiCursorMode ? "bg-[var(--accent)] animate-pulse" : "bg-zinc-600"}`} />
                  </button>

                  {/* Select All Occurrences button */}
                  <button
                    onClick={selectAllOccurrences}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-left text-xs transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">Select All Occurrences</span>
                      <span className="text-[10px] text-zinc-500">Places cursors on all matches of word</span>
                    </div>
                    <CopyPlus className="h-4 w-4 text-zinc-500" />
                  </button>

                  {/* Add Cursor Above / Below */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={addCursorAbove}
                      className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs transition flex items-center gap-1.5 justify-center cursor-pointer"
                      title="Add cursor on line above"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                      <span>Cursor Above</span>
                    </button>
                    <button
                      onClick={addCursorBelow}
                      className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs transition flex items-center gap-1.5 justify-center cursor-pointer"
                      title="Add cursor on line below"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                      <span>Cursor Below</span>
                    </button>
                  </div>

                  {/* Clear all cursors */}
                  {cursors.length > 0 && (
                    <button
                      onClick={clearCursors}
                      className="w-full p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 justify-center cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear Extra Cursors</span>
                    </button>
                  )}
                </div>

                {/* Helpful instructions */}
                <div className="pt-2 border-t border-[#222] flex items-start gap-1.5 text-[10px] text-zinc-500 leading-relaxed">
                  <HelpCircle className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Hold <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-400 font-mono">Alt</kbd> and click inside the file to insert secondary cursors. Press any key to type or backspace simultaneously!
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleFormatCode}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-[#1e1e1e] rounded transition cursor-pointer"
            title="Format Code"
          >
            <Sparkles className="h-4 w-4" />
          </button>
 
          <button
            onClick={saveFile}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-[#1e1e1e] rounded transition cursor-pointer"
            title="Save changes (Local)"
          >
            <Save className="h-4 w-4" />
          </button>
 
          <button
            onClick={onRunCode}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[var(--accent)] hover:opacity-90 text-[var(--accent-text)] px-3 py-1 rounded transition cursor-pointer"
            title="Compile & Render"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Run
          </button>
        </div>
      </div>
 
      {/* Editor Body */}
      {currentFile ? (
        <div className="flex-1 flex overflow-hidden relative">
          <style dangerouslySetInnerHTML={{ __html: styleContent }} />

          {/* Toast Notification for Multi-Cursor Actions */}
          {multiCursorNotice && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-[#161616]/95 border border-[var(--accent)]/30 text-zinc-100 font-mono text-[11px] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 backdrop-blur-md animate-fadeIn">
              <Info className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span>{multiCursorNotice}</span>
            </div>
          )}

          {/* Line Numbers */}
          <div className="w-12 bg-[#141414] py-4 border-r border-[#2a2a2a] text-right pr-3 select-none text-gray-600 font-mono text-xs leading-6">
            {lineNumbers.map((lineNum) => {
              const isHighlighted = highlightedLine === lineNum;
              return (
                <div 
                  key={lineNum}
                  className={`transition-all duration-250 ${
                    isHighlighted 
                      ? "text-[var(--accent)] font-extrabold bg-[var(--accent-glow)] px-1 border-r border-[var(--accent)]" 
                      : ""
                  }`}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>
 
          {/* Interactive Stacked Editor */}
          <div className="flex-1 relative overflow-hidden h-full bg-[#1e1e1e]">
            {/* Viewport for formatted highlights with custom cursors embedded */}
            <pre
              ref={preRef}
              className="absolute inset-0 p-4 m-0 font-mono text-xs leading-6 overflow-hidden pointer-events-none select-none bg-[#1e1e1e]"
              aria-hidden="true"
            >
              <code
                ref={codeRef}
                dangerouslySetInnerHTML={{ __html: renderHighlightedWithCursors(code) }}
                className="block min-w-full font-mono whitespace-pre text-transparent"
              />
            </pre>
 
            {/* Hidden, transparent input textarea styled EXACTLY identical */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onCodeChange(activeFile, e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              onMouseUp={handleMouseUp}
              onSelect={(e) => setPrimaryCursor(e.currentTarget.selectionStart)}
              className="absolute inset-0 p-4 m-0 w-full h-full bg-transparent text-zinc-300 caret-transparent focus:outline-none font-mono text-xs leading-6 resize-none overflow-auto border-none select-text"
              spellCheck="false"
              autoFocus
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-4">
          <Code className="h-12 w-12 text-zinc-700 animate-pulse" />
          <p className="text-sm font-mono">Select a file from workspace to begin coding.</p>
        </div>
      )}
    </div>
  );
}
