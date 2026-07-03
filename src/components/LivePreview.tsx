import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCw, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { VirtualFile } from "../types";

interface LivePreviewProps {
  files: VirtualFile[];
  showCode: boolean;
  showPreview: boolean;
  onToggleLayout: (mode: "code" | "split" | "preview") => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  files,
  showCode,
  showPreview,
  onToggleLayout,
}) => {
  const [srcDoc, setSrcDoc] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Compile workspace files into a unified srcDoc
  useEffect(() => {
    const htmlFile = files.find((f) => f.path === "index.html");
    if (!htmlFile) {
      setSrcDoc(`
        <html>
          <body style="background:#09090b;color:#a1a1aa;font-family:sans-serif;padding:2rem;text-align:center;">
            <h3>Workspace Empty</h3>
            <p style="font-size:12px;">Create or load an <strong>index.html</strong> file to render a preview.</p>
          </body>
        </html>
      `);
      return;
    }

    let compiledHtml = htmlFile.content;

    // Inject any styles or scripts from other virtual files in the workspace
    files.forEach((file) => {
      if (file.path === "index.html") return;

      const ext = file.path.split(".").pop()?.toLowerCase();
      if (ext === "css") {
        // Inject stylesheet
        compiledHtml = compiledHtml.replace(
          "</head>",
          `<style id="injected-${file.path.replace(/\./g, "-")}">\n${file.content}\n</style>\n</head>`
        );
      } else if (ext === "js" || ext === "ts") {
        // Inject script
        compiledHtml = compiledHtml.replace(
          "</body>",
          `<script id="injected-${file.path.replace(/\./g, "-")}">\n${file.content}\n</script>\n</body>`
        );
      }
    });

    setSrcDoc(compiledHtml);
  }, [files]);

  const triggerReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([srcDoc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b]">
      {/* Sandbox Address Bar Simulation */}
      <div className="px-4 py-2 border-b border-zinc-850 flex items-center justify-between bg-[#0d0d0e] gap-4">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Play className="h-4 w-4 text-emerald-400 animate-pulse-soft" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-300">SANDBOX</span>
        </div>

        {/* Address bar simulation */}
        <div className="flex-1 max-w-xs md:max-w-sm bg-[#0a0a0b] border border-zinc-850 rounded-lg px-3 py-1 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            <span className="truncate">sandbox://workspace/index.html</span>
          </div>
          <span className="text-[9px] text-emerald-500/80 font-bold uppercase tracking-wider font-sans bg-emerald-950/20 px-1 rounded border border-emerald-900/30 hidden sm:inline">
            Secure
          </span>
        </div>

        {/* Layout Mode Toggles */}
        <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => onToggleLayout("code")}
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
              showCode && !showPreview
                ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
            title="Switch to Code Only View"
          >
            Code
          </button>
          <button
            onClick={() => onToggleLayout("split")}
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
              showCode && showPreview
                ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
            title="Switch to Split View"
          >
            Split
          </button>
          <button
            onClick={() => onToggleLayout("preview")}
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
              !showCode && showPreview
                ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/30 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
            title="Switch to Preview Only View"
          >
            Preview
          </button>
        </div>

        {/* Browser control triggers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={triggerReload}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
            title="Reload Preview Frame"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleOpenNewTab}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-100 transition cursor-pointer"
            title="Open Sandbox in New Window"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Viewer */}
      <div className="flex-1 bg-black relative">
        <iframe
          key={reloadKey}
          ref={iframeRef}
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-modals allow-same-origin"
          className="w-full h-full border-none bg-black"
          title="Live Workspace Runtime Sandbox"
        />

        {/* Dynamic Float hint */}
        <div className="absolute bottom-4 right-4 bg-zinc-950/90 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg select-none pointer-events-none">
          <Sparkles className="h-3 w-3 text-purple-400" />
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-black">
            Live Hot Compilation Active
          </span>
        </div>
      </div>
    </div>
  );
};
