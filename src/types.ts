export interface VirtualFile {
  path: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  message: string;
  timestamp: string;
  filesChanged?: string[];
  pendingFiles?: VirtualFile[];
  applied?: boolean;
  isThinking?: boolean;
}

export type SidebarTab = "explorer" | "agent" | "gallery" | "settings" | "dashboard" | "testing" | "search" | "git";

export type TerminalTheme = "neon" | "retro" | "monochromatic";

export interface GalleryTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  files: VirtualFile[];
}
