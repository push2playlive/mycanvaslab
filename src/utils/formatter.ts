/**
 * Lightweight, robust, zero-dependency client-side code formatter
 * and beautifier for HTML, CSS, JavaScript, TypeScript, JSX, TSX, and JSON.
 */
export function formatCode(content: string, path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  
  if (!content || !content.trim()) return "";

  // 1. JSON Formatter
  if (ext === "json") {
    try {
      return JSON.stringify(JSON.parse(content), null, 2);
    } catch {
      return content; // If invalid JSON, leave as-is
    }
  }

  // 2. CSS Formatter
  if (ext === "css") {
    try {
      // Basic formatting rules for CSS
      const raw = content
        .replace(/\/\*[\s\S]*?\*\//g, (m) => m) // preserve comments
        .replace(/\s+/g, " ")
        .replace(/\{/g, " {\n")
        .replace(/\}/g, "\n}\n")
        .replace(/;/g, ";\n")
        .replace(/,\s*/g, ", ");
      
      const rawLines = raw.split("\n").map(l => l.trim()).filter(Boolean);
      let formatted = "";
      let indentLevel = 0;

      for (const line of rawLines) {
        if (line.startsWith("}")) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        formatted += "  ".repeat(indentLevel) + line + "\n";

        if (line.endsWith("{")) {
          indentLevel++;
        }
      }
      return formatted.trim() + "\n";
    } catch {
      return content;
    }
  }

  // 3. HTML Formatter
  if (ext === "html") {
    try {
      const raw = content
        .replace(/<!--[\s\S]*?-->/g, (m) => m) // preserve comments
        .replace(/(<[^>]+>)/g, "\n$1\n")
        .split("\n")
        .map(t => t.trim())
        .filter(Boolean);

      let formatted = "";
      let indentLevel = 0;
      const selfClosingTags = ["img", "br", "hr", "input", "meta", "link", "source", "embed"];

      for (const token of raw) {
        const isClosing = token.startsWith("</");
        const isOpening = token.startsWith("<") && !isClosing && !token.startsWith("<!") && !token.endsWith("/>");
        
        // Find tag name
        const match = token.match(/^<([a-z0-9:-]+)/i);
        const tagName = match ? match[1].toLowerCase() : "";
        const isSelfClosing = selfClosingTags.includes(tagName) || token.endsWith("/>");

        if (isClosing) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // Add line with indentation
        formatted += "  ".repeat(indentLevel) + token + "\n";

        if (isOpening && !isSelfClosing) {
          indentLevel++;
        }
      }
      return formatted.trim() + "\n";
    } catch {
      return content;
    }
  }

  // 4. JS/TS/JSX/TSX Formatter (State-based line-by-line inductive parser)
  if (["js", "ts", "jsx", "tsx"].includes(ext || "")) {
    try {
      const lines = content.split("\n").map(l => l.trimRight());
      let formatted = "";
      let indentLevel = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
          // Keep at most 1 blank line
          if (!formatted.endsWith("\n\n") && formatted.length > 0) {
            formatted += "\n";
          }
          continue;
        }

        // Bracket counting
        let closeCount = 0;
        let openCount = 0;
        let inSingleQuote = false;
        let inDoubleQuote = false;
        let inTemplateLiteral = false;

        for (let c = 0; c < trimmed.length; c++) {
          const char = trimmed[c];
          // Simple string escape skip
          if (char === "\\" && c + 1 < trimmed.length) {
            c++;
            continue;
          }
          if (char === "'" && !inDoubleQuote && !inTemplateLiteral) inSingleQuote = !inSingleQuote;
          if (char === '"' && !inSingleQuote && !inTemplateLiteral) inDoubleQuote = !inDoubleQuote;
          if (char === "`" && !inSingleQuote && !inDoubleQuote) inTemplateLiteral = !inTemplateLiteral;

          if (!inSingleQuote && !inDoubleQuote && !inTemplateLiteral) {
            if (char === "}" || char === "]" || char === ")") {
              closeCount++;
            } else if (char === "{" || char === "[" || char === "(") {
              openCount++;
            }
          }
        }

        // If the line starts with a closing symbol, we immediately decrease indent
        const startsWithClose = /^[\]})]/ .test(trimmed);
        if (startsWithClose) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        formatted += "  ".repeat(indentLevel) + trimmed + "\n";

        if (!startsWithClose) {
          // If the line ends with an opening symbol, next line is definitely indented
          const endsWithOpen = /[{[(]$/.test(trimmed);
          if (endsWithOpen) {
            indentLevel++;
          } else {
            const net = openCount - closeCount;
            if (net > 0) {
              indentLevel += net;
            } else if (net < 0) {
              indentLevel = Math.max(0, indentLevel + net);
            }
          }
        } else {
          // Line started with closing symbol, but may contain open symbols inside (e.g., `}) {`)
          const net = openCount - closeCount;
          if (net > 0) {
            indentLevel += net;
          }
        }
      }
      return formatted.trim() + "\n";
    } catch {
      return content;
    }
  }

  // 5. Default/Markdown Formatter
  return content.split("\n").map(l => l.trimRight()).join("\n").trim() + "\n";
}
