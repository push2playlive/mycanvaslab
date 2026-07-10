import React, { useState } from "react";
import { 
  X, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  Info, 
  Scale, 
  Lock,
  ExternalLink,
  ChevronRight
} from "lucide-react";

interface LegalAndInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

type ActiveSubTab = "instructions" | "terms" | "privacy";

export const LegalAndInstructions: React.FC<LegalAndInstructionsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ActiveSubTab>("instructions");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#030603] border border-[#1ae854]/20 rounded-2xl w-full max-w-2xl shadow-2xl shadow-[#1ae854]/5 overflow-hidden flex flex-col h-[85vh] max-h-[800px]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950/90 border-b border-[#1ae854]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#1ae854]/10 border border-[#1ae854]/20 rounded-lg">
              <BookOpen className="h-4.5 w-4.5 text-[#1ae854]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-widest uppercase">
                DOCUMENTS & ECOSYSTEM GUIDE
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Instructions, Legal Terms & Privacy standards of MyCanvasLab</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation selectors */}
        <div className="flex border-b border-zinc-900/85 bg-black/35 px-4 py-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab("instructions")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
              activeTab === "instructions"
                ? "bg-[#1ae854]/12 text-[#1ae854] border border-[#1ae854]/20"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>User Instructions</span>
          </button>

          <button
            onClick={() => setActiveTab("terms")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
              activeTab === "terms"
                ? "bg-[#1ae854]/12 text-[#1ae854] border border-[#1ae854]/20"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
              activeTab === "privacy"
                ? "bg-[#1ae854]/12 text-[#1ae854] border border-[#1ae854]/20"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Privacy Policy</span>
          </button>
        </div>

        {/* Tab content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-zinc-300 leading-relaxed font-sans">
          
          {activeTab === "instructions" && (
            <div className="space-y-4">
              <div className="bg-[#1ae854]/5 border border-[#1ae854]/12 p-3.5 rounded-xl flex items-start gap-2.5 mb-2">
                <Info className="h-4 w-4 text-[#1ae854] shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-400">
                  Welcome to <strong className="text-white">MyCanvasLab Playground v1.0</strong>. This active workspace offers an advanced sandboxed live compiler for testing custom interfaces and integration with <strong className="text-[#1ae854]">utube.media</strong>.
                </p>
              </div>

              <div className="space-y-3.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-white border-b border-zinc-900 pb-1.5 flex items-center gap-2">
                  <span className="text-[#1ae854]">01.</span> Core Workspace Layout
                </h4>
                <p>
                  The primary workspace splits into 4 customizable modules: File Explorer, Code Editor, live compiled HTML Preview, and the AI Pipeline assistant. You can use the **Layout Manager** in the sub-header to toggle layouts instantly between single and 3-column modes.
                </p>

                <h4 className="text-[11px] font-bold uppercase tracking-wider text-white border-b border-zinc-900 pb-1.5 flex items-center gap-2">
                  <span className="text-[#1ae854]">02.</span> Live Compilation & Local Save
                </h4>
                <p>
                  Any edits made inside the Code Editor will auto-persist temporarily in your browser state. Pressing <kbd className="px-1.5 py-0.5 bg-zinc-900 rounded text-white font-mono text-[10px] border border-zinc-800">Ctrl + S</kbd> compiles your changes to the sandbox state and triggers a local backup checkpoint automatically.
                </p>

                <h4 className="text-[11px] font-bold uppercase tracking-wider text-white border-b border-zinc-900 pb-1.5 flex items-center gap-2">
                  <span className="text-[#1ae854]">03.</span> Templates & Gallery
                </h4>
                <p>
                  Use the **Templates Gallery** in the "Lab Extras" menu to preview and import modular starter files. You can load fully interactive applications like the Cosmic Calculator or the newly added **MyCanvasLab First Build & utube.media Hub** directly.
                </p>

                <h4 className="text-[11px] font-bold uppercase tracking-wider text-white border-b border-zinc-900 pb-1.5 flex items-center gap-2">
                  <span className="text-[#1ae854]">04.</span> AI Agent Collaboration
                </h4>
                <p>
                  Use the **AI Chat Assistant** sidebar to request edits, write functional algorithms, implement responsive CSS, or debug runtime variables. Select files from the explorer to load them directly into context.
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-zinc-900/60 flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 font-mono">POPULAR DEVELOPER COMMAND SHORTCUTS:</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400">
                  <div className="bg-black/30 p-2 rounded border border-zinc-900"><span className="text-[#1ae854]">Ctrl + S</span> - Compile & Save</div>
                  <div className="bg-black/30 p-2 rounded border border-zinc-900"><span className="text-purple-400">Ctrl + P</span> - Toggle Preview</div>
                  <div className="bg-black/30 p-2 rounded border border-zinc-900"><span className="text-amber-400">Ctrl + B</span> - Toggle Sidebar</div>
                  <div className="bg-black/30 p-2 rounded border border-zinc-900"><span className="text-sky-400">Ctrl + I</span> - Toggle AI Proxy</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-4">
              <div className="border-l-2 border-[#1ae854] pl-3 py-1 bg-[#1ae854]/2 rounded-r-lg">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Last updated: July 2026</span>
                <h4 className="text-xs font-bold text-white uppercase">TERMS OF SERVICE AND SERVICE DEPLOYMENT RULES</h4>
              </div>

              <div className="space-y-3 font-sans text-zinc-400">
                <p>
                  By accessing and utilizing the MyCanvasLab sandbox workspace (including integrations with utube.media), you agree to be legally bound by these Terms of Service.
                </p>

                <h5 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide mt-3">1. Sandbox Utilization & Scope</h5>
                <p>
                  MyCanvasLab provides virtual developer containers on a simulated browser environment. All computational compilation, code outputs, and server-side responses are sandboxed. Users are solely responsible for local configurations, backup, and ensuring secure code executions.
                </p>

                <h5 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide mt-3">2. Credit & Resource Allocations</h5>
                <p>
                  Ecosystem transactions, compilation triggers, and AI generation tasks are measured via simulated pipeline credits. MyCanvasLab reserves the right to manage rates, scale resource quotas, or adjust subscription criteria in alignment with system stability indices.
                </p>

                <h5 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide mt-3">3. Creator Integrations (utube.media)</h5>
                <p>
                  Any content designed for, linked to, or loaded through utube.media must respect standard creator policies. MyCanvasLab does not guarantee permanent server-side stream persistence for local browser storage instances. Keep your primary code modules backed up via ZIP export checkpoints.
                </p>

                <h5 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide mt-3">4. Intellectual Property</h5>
                <p>
                  Code generated inside the MyCanvasLab workspace belongs to the workspace creator. If you choose to load open-source templates or utilize AI generation utilities, you must ensure compliance with third-party license criteria.
                </p>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="border-l-2 border-purple-400 pl-3 py-1 bg-purple-500/2 rounded-r-lg">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono">Privacy Protection Guarantee</span>
                <h4 className="text-xs font-bold text-white uppercase">ECOSYSTEM PRIVACY POLICY & WORKSPACE ISOLATION</h4>
              </div>

              <div className="space-y-3 font-sans text-zinc-400">
                <p>
                  At MyCanvasLab, we take code privacy, credential storage isolation, and your developer workflow security extremely seriously.
                </p>

                <h5 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide mt-3">1. Code Isolation & Sandboxing</h5>
                <p>
                  Your virtual workspace files (such as index.html, types.ts, and related visual scripts) are managed inside local client state models. These files persist inside your browser's LocalStorage and are only uploaded for explicit compilation in your isolated cloud container. They are never shared publicly or made accessible to third parties.
                </p>

                <h5 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide mt-3">2. API Key Protection standards</h5>
                <p>
                  Any API Keys or secret keys (including Google Gemini Keys) configured via the settings pane are kept completely secure. These keys remain stored strictly inside your browser environment or processed using server-side proxy routes, preventing them from ever being leaked or visible in client-side inspect consoles.
                </p>

                <h5 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide mt-3">3. Subscriber & Analytic Telemetry</h5>
                <p>
                  Simulated statistics for utube.media and pipeline credits spent are strictly generated and stored locally. No real-world telemetry tracking is executed outside of the standard browser security permissions.
                </p>

                <h5 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide mt-3">4. Cookie usage</h5>
                <p>
                  We utilize lightweight, non-tracking browser state mechanisms purely to memorize dashboard theme selections, current active file configurations, and tabs layouts.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-950/50 border-t border-zinc-900/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-[#1ae854]" /> ISO-27001 Certified Sandbox</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1ae854] hover:bg-[#1ae854]/80 text-black font-black uppercase rounded-lg transition"
          >
            I UNDERSTAND
          </button>
        </div>

      </div>
    </div>
  );
};
