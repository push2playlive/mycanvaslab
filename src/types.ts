export interface VirtualFile {
  path: string;
  content: string;
}

export interface LogMessage {
  logType: "log" | "warn" | "error" | "info";
  message: string;
  timestamp: string;
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
  provider: "gemini" | "ollama" | "ollama_agent_1" | "ollama_agent_2" | "ollama_agent_3" | "ollama_agent_4" | "ollama_agent_5" | "ollama_agent_6";
  geminiModel: string;
  ollamaUrl: string;
  ollamaModel: string;
  customGeminiKey: string;
  
  // Custom 3 Ollama Agent configurations
  ollamaAgent1Name?: string;
  ollamaAgent1Url?: string;
  ollamaAgent1Model?: string;

  ollamaAgent2Name?: string;
  ollamaAgent2Url?: string;
  ollamaAgent2Model?: string;

  ollamaAgent3Name?: string;
  ollamaAgent3Url?: string;
  ollamaAgent3Model?: string;

  // Additional 3 Ollama Agent configurations
  ollamaAgent4Name?: string;
  ollamaAgent4Url?: string;
  ollamaAgent4Model?: string;

  ollamaAgent5Name?: string;
  ollamaAgent5Url?: string;
  ollamaAgent5Model?: string;

  ollamaAgent6Name?: string;
  ollamaAgent6Url?: string;
  ollamaAgent6Model?: string;
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

export interface ChatSession {
  id: string;
  name: string;
  timestamp: string;
  purposeMessages: ChatMessage[];
  codeMessages: ChatMessage[];
  finisherMessages: ChatMessage[];
  specPurpose: string;
  specColors: string;
  specFunctions: string;
  customSystemPrompt?: string;
}

