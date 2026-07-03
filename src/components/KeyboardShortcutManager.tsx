import React, { useState, useEffect } from "react";
import { 
  Keyboard, 
  X, 
  Save, 
  Eye, 
  FolderOpen, 
  MessageSquare, 
  LayoutGrid, 
  Play, 
  Settings, 
  Info,
  CheckCircle,
  HelpCircle
} from "lucide-react";

interface KeyboardShortcutManagerProps {
  onSave: () => void;
  onTogglePreview: () => void;
  onToggleExplorer: () => void;
  onToggleAIChat: () => void;
  onSwitchTab: (tab: any) => void;
  activeTab: string;
  showPreview: boolean;
  showExplorer: boolean;
  showAIChat: boolean;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  actionName: string;
  category: "Files" | "Interface" | "Navigation" | "Help";
  icon: React.ReactNode;
}

export const KeyboardShortcutManager: React.FC<KeyboardShortcutManagerProps> = ({
  onSave,
  onTogglePreview,
  onToggleExplorer,
  onToggleAIChat,
  onSwitchTab,
  activeTab,
  showPreview,
  showExplorer,
  showAIChat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show a momentary floating neon HUD toast when a hotkey triggers
  const showToast = (message: string) => {
    setToastMessage(message);
    const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA== "); // Silenced or simple pulse if played
    audio.volume = 0.1;
    audio.play().catch(() => {}); // Graceful catch if user hasn't interacted yet
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      // Ctrl + S (Save)
      if (isMod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
        showToast("✓ File Compiled and Saved locally");
      }

      // Ctrl + P (Toggle Preview)
      if (isMod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        onTogglePreview();
        showToast(`Preview Pane: ${!showPreview ? "ENABLED" : "DISABLED"}`);
      }

      // Ctrl + B (Toggle Sidebar / Explorer)
      if (isMod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        onToggleExplorer();
        showToast(`Explorer: ${!showExplorer ? "VISIBLE" : "HIDDEN"}`);
      }

      // Ctrl + I (Toggle AI Chat)
      if (isMod && e.key.toLowerCase() === "i") {
        e.preventDefault();
        onToggleAIChat();
        showToast(`AI Proxy Chat: ${!showAIChat ? "OPEN" : "CLOSED"}`);
      }

      // Ctrl + K (Toggle Keyboard Shortcuts Cheatsheet Modal)
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Ctrl + D (Toggle main Tabs workspace <-> dashboard)
      if (isMod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        const nextTab = activeTab === "workspace" ? "dashboard" : "workspace";
        onSwitchTab(nextTab);
        showToast(`Switched Tab to ${nextTab.toUpperCase()}`);
      }

      // Escape key to close the modal
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    onSave,
    onTogglePreview,
    onToggleExplorer,
    onToggleAIChat,
    onSwitchTab,
    activeTab,
    showPreview,
    showExplorer,
    showAIChat,
    isOpen,
  ]);

  const shortcuts: ShortcutItem[] = [
    {
      keys: ["Ctrl", "S"],
      description: "Trigger workspace file compile & save checkpoint",
      actionName: "Save Work",
      category: "Files",
      icon: <Save className="h-4 w-4 text-[#1ae854]" />,
    },
    {
      keys: ["Ctrl", "P"],
      description: "Toggle the dynamic HTML layout rendering preview panel",
      actionName: "Toggle Preview",
      category: "Interface",
      icon: <Eye className="h-4 w-4 text-purple-400" />,
    },
    {
      keys: ["Ctrl", "B"],
      description: "Collapse or expand the vertical project workspace file explorer",
      actionName: "Toggle Explorer",
      category: "Interface",
      icon: <FolderOpen className="h-4 w-4 text-amber-400" />,
    },
    {
      keys: ["Ctrl", "I"],
      description: "Toggle AI Prompt helper Pilot dashboard",
      actionName: "Toggle AI Assistant",
      category: "Interface",
      icon: <MessageSquare className="h-4 w-4 text-sky-400" />,
    },
    {
      keys: ["Ctrl", "D"],
      description: "Alternate quickly between Workspace sandbox & Analytics dashboard",
      actionName: "Toggle Main Views",
      category: "Navigation",
      icon: <LayoutGrid className="h-4 w-4 text-pink-400" />,
    },
    {
      keys: ["Ctrl", "K"],
      description: "Summon or dismiss this global developer hotkey interface overlay",
      actionName: "Hotkey Cheat Sheet",
      category: "Help",
      icon: <Keyboard className="h-4 w-4 text-zinc-400" />,
    },
  ];

  return (
    <>
      {/* Small floating hint in bottom header or left bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#020502]/60 hover:bg-[#1ae854]/10 text-[10px] font-mono text-[#1ae854] border border-[#1ae854]/15 hover:border-[#1ae854]/30 transition cursor-pointer select-none"
        title="View Keyboard Shortcuts (Ctrl + K)"
      >
        <Keyboard className="h-3.5 w-3.5" />
        <span>HOTKEYS</span>
        <span className="text-[8px] bg-[#1ae854]/10 px-1 py-0.2 rounded border border-[#1ae854]/30 font-bold opacity-80">
          Ctrl + K
        </span>
      </button>

      {/* Floating Tactical Notification Toast (HUD vibe) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-slide-up">
          <div className="bg-[#020502]/95 backdrop-blur-md border border-[#1ae854]/40 text-[#1ae854] px-4 py-2.5 rounded-xl shadow-lg shadow-[#1ae854]/10 flex items-center gap-3 font-mono text-xs border-l-4 border-l-[#1ae854]">
            <div className="p-1 bg-[#1ae854]/10 rounded border border-[#1ae854]/25">
              <Keyboard className="h-3.5 w-3.5 text-[#1ae854]" />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 font-bold block leading-none mb-1">HOTKEY COMMAND EXEC</span>
              <span className="font-bold text-white">{toastMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modern High-End Shortcuts Dialog Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#030603] border border-[#1ae854]/20 rounded-2xl w-full max-w-xl shadow-2xl shadow-[#1ae854]/5 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="px-6 py-4 bg-zinc-950/90 border-b border-[#1ae854]/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#1ae854]/10 border border-[#1ae854]/20 rounded-lg">
                  <Keyboard className="h-4.5 w-4.5 text-[#1ae854]" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white tracking-widest uppercase">
                    DEVELOPER KEYBOARD SHORTCUTS
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Streamline your virtual playground workflow with hotkeys</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Info banner */}
              <div className="bg-[#1ae854]/5 border border-[#1ae854]/12 p-3.5 rounded-xl flex items-start gap-2.5">
                <Info className="h-4 w-4 text-[#1ae854] shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-400 leading-normal">
                  All commands use standard modifier keys. On MacOS devices, you can substitute <strong className="text-white font-mono">Ctrl</strong> with <strong className="text-white font-mono">Cmd ⌘</strong> key structures seamlessly.
                </p>
              </div>

              {/* Categorized lists */}
              <div className="space-y-4">
                {(["Files", "Interface", "Navigation", "Help"] as const).map((cat) => {
                  const catShortcuts = shortcuts.filter(s => s.category === cat);
                  if (catShortcuts.length === 0) return null;

                  return (
                    <div key={cat} className="space-y-2">
                      <h4 className="text-[10px] font-black tracking-widest text-[#1ae854]/70 uppercase font-mono">
                        {cat} Operations
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {catShortcuts.map((shortcut) => (
                          <div
                            key={shortcut.actionName}
                            className="bg-[#050905]/40 border border-zinc-900 hover:border-[#1ae854]/10 p-3.5 rounded-xl flex items-center justify-between transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-850 group-hover:border-[#1ae854]/12 transition-colors">
                                {shortcut.icon}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-white block">
                                  {shortcut.actionName}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block leading-normal">
                                  {shortcut.description}
                                </span>
                              </div>
                            </div>

                            {/* Hotkey Badge Pair */}
                            <div className="flex items-center gap-1 shrink-0">
                              {shortcut.keys.map((key, kIdx) => (
                                <React.Fragment key={key}>
                                  <kbd className="px-2 py-1 bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-[10px] rounded shadow font-black min-w-[24px] text-center">
                                    {key}
                                  </kbd>
                                  {kIdx < shortcut.keys.length - 1 && (
                                    <span className="text-zinc-600 font-mono text-xs font-bold">+</span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-zinc-950/50 border-t border-zinc-900/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>Press <strong className="text-white">ESC</strong> to close cheatsheet</span>
              <span className="text-[#1ae854]/60">SANDBOX DEVELOPER MODE</span>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
