export interface VirtualFile {
  path: string;
  content: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  message: string;
  timestamp: string;
  pendingFiles?: VirtualFile[];
  applied?: boolean;
}

export interface Template {
  name: string;
  description: string;
  icon: string;
  files: VirtualFile[];
}

export interface AIConfig {
  provider: "gemini" | "openai" | "ollama";
  geminiModel: string;
  openaiModel: string;
  ollamaUrl: string;
  ollamaModel: string;
  customGeminiKey: string;
  customOpenaiKey: string;
}

export interface Snapshot {
  id: string;
  timestamp: string;
  message: string;
  files: VirtualFile[];
}

export interface TestCase {
  id: string;
  name: string;
  filePath: string;
  assertionType: "contains" | "not-contains" | "valid-html" | "no-empty";
  expectedValue: string;
  status: "idle" | "passed" | "failed";
  message?: string;
}

export interface SearchResult {
  filePath: string;
  lineNumber: number;
  lineContent: string;
  matchIndex: number;
  matchLength: number;
}

export interface WorkspaceStats {
  totalFiles: number;
  totalLines: number;
  totalCharacters: number;
  aiGenerationsCount: number;
  activeLanguageBreakdown: { [key: string]: number };
}

