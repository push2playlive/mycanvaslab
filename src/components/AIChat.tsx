import React, { useState, useRef, useEffect } from "react";
import { Send, Cpu, Bot, Sparkles, AlertTriangle, Check, RefreshCw, Layers, Palette, Code, CheckCircle2, ArrowRight, Paintbrush, Plus, Trash2, Edit2, History, ChevronDown } from "lucide-react";
import { ChatMessage, VirtualFile, AIConfig, ChatSession } from "../types";

interface AIChatProps {
  files: VirtualFile[];
  config: AIConfig;
  onChangeConfig: (newConfig: AIConfig) => void;
  onApplyFiles: (explanation: string, pendingFiles: VirtualFile[]) => void;
  onOpenCompare: (msg: ChatMessage) => void;
}

export type StageId = "purpose" | "code" | "finisher";

export const AIChat: React.FC<AIChatProps> = ({
  files,
  config,
  onChangeConfig,
  onApplyFiles,
  onOpenCompare,
}) => {
  const [activeStage, setActiveStage] = useState<StageId>(() => {
    return (localStorage.getItem("active_agent_stage") as StageId) || "purpose";
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("chat_sessions_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return localStorage.getItem("current_chat_session_id") || "default-session";
  });

  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionName, setEditSessionName] = useState("");

  // Three separate chat histories for the 3 stages
  const [purposeMessages, setPurposeMessages] = useState<ChatMessage[]>(() => {
    const savedSessions = localStorage.getItem("chat_sessions_list");
    const activeId = localStorage.getItem("current_chat_session_id") || "default-session";
    if (savedSessions) {
      try {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        const match = parsed.find(s => s.id === activeId);
        if (match) return match.purposeMessages;
      } catch {}
    }
    const saved = localStorage.getItem("chat_messages_purpose");
    return saved ? JSON.parse(saved) : [
      {
        id: "purpose-welcome",
        role: "assistant",
        message: "Hello! I am your Purpose Designer Agent. 🎨\n\nMy job is to talk to you and isolate the main purpose of your application, narrow down a beautiful color layout, and map out the core functions before writing any code. Let's talk! What would you like to build today?",
        timestamp: new Date().toLocaleTimeString().split(" ")[0],
      }
    ];
  });

  const [codeMessages, setCodeMessages] = useState<ChatMessage[]>(() => {
    const savedSessions = localStorage.getItem("chat_sessions_list");
    const activeId = localStorage.getItem("current_chat_session_id") || "default-session";
    if (savedSessions) {
      try {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        const match = parsed.find(s => s.id === activeId);
        if (match) return match.codeMessages;
      } catch {}
    }
    const saved = localStorage.getItem("chat_messages_code");
    return saved ? JSON.parse(saved) : [
      {
        id: "code-welcome",
        role: "assistant",
        message: "Code Writer Agent at your service! 💻\n\nOnce the Purpose Designer has refined your vision into a structured specification, I will take over to write complete, clean, and fully-functional code files in the workspace. Let me know what to write or use the brief below to build your core files!",
        timestamp: new Date().toLocaleTimeString().split(" ")[0],
      }
    ];
  });

  const [finisherMessages, setFinisherMessages] = useState<ChatMessage[]>(() => {
    const savedSessions = localStorage.getItem("chat_sessions_list");
    const activeId = localStorage.getItem("current_chat_session_id") || "default-session";
    if (savedSessions) {
      try {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        const match = parsed.find(s => s.id === activeId);
        if (match) return match.finisherMessages;
      } catch {}
    }
    const saved = localStorage.getItem("chat_messages_finisher");
    return saved ? JSON.parse(saved) : [
      {
        id: "finisher-welcome",
        role: "assistant",
        message: "Greetings! I am your Finisher Agent. ✨\n\nI am here to polish, style, and perfect your application to make it look stunning. I'll add gorgeous entrance and hover animations, optimize typography, verify responsive layouts, and fine-tune spacing to make it flow effortlessly. Let me know what visual or operational details to refine!",
        timestamp: new Date().toLocaleTimeString().split(" ")[0],
      }
    ];
  });

  // Structured specification wizard state (helps isolate layout & functions)
  const [specPurpose, setSpecPurpose] = useState(() => {
    const savedSessions = localStorage.getItem("chat_sessions_list");
    const activeId = localStorage.getItem("current_chat_session_id") || "default-session";
    if (savedSessions) {
      try {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        const match = parsed.find(s => s.id === activeId);
        if (match) return match.specPurpose;
      } catch {}
    }
    return localStorage.getItem("spec_purpose") || "";
  });

  const [specColors, setSpecColors] = useState(() => {
    const savedSessions = localStorage.getItem("chat_sessions_list");
    const activeId = localStorage.getItem("current_chat_session_id") || "default-session";
    if (savedSessions) {
      try {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        const match = parsed.find(s => s.id === activeId);
        if (match) return match.specColors;
      } catch {}
    }
    return localStorage.getItem("spec_colors") || "";
  });

  const [specFunctions, setSpecFunctions] = useState(() => {
    const savedSessions = localStorage.getItem("chat_sessions_list");
    const activeId = localStorage.getItem("current_chat_session_id") || "default-session";
    if (savedSessions) {
      try {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        const match = parsed.find(s => s.id === activeId);
        if (match) return match.specFunctions;
      } catch {}
    }
    return localStorage.getItem("spec_functions") || "";
  });

  const [customSystemPrompt, setCustomSystemPrompt] = useState(() => {
    const savedSessions = localStorage.getItem("chat_sessions_list");
    const activeId = localStorage.getItem("current_chat_session_id") || "default-session";
    if (savedSessions) {
      try {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        const match = parsed.find(s => s.id === activeId);
        if (match) return match.customSystemPrompt || "";
      } catch {}
    }
    return localStorage.getItem("custom_system_prompt") || "";
  });

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Migrate old messages if needed on initial mount
  useEffect(() => {
    const saved = localStorage.getItem("chat_sessions_list");
    if (!saved || JSON.parse(saved).length === 0) {
      const initialSession: ChatSession = {
        id: "default-session",
        name: "Current Prototype Chat",
        timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString().substring(0, 5),
        purposeMessages,
        codeMessages,
        finisherMessages,
        specPurpose,
        specColors,
        specFunctions,
        customSystemPrompt,
      };
      const initialList = [initialSession];
      setSessions(initialList);
      setCurrentSessionId("default-session");
      localStorage.setItem("chat_sessions_list", JSON.stringify(initialList));
      localStorage.setItem("current_chat_session_id", "default-session");
    }
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("active_agent_stage", activeStage);
  }, [activeStage]);

  // Auto-sync states of the active session to the sessions list
  useEffect(() => {
    if (!currentSessionId) return;
    setSessions((prevSessions) => {
      const targetSession = prevSessions.find(s => s.id === currentSessionId);
      if (
        targetSession &&
        targetSession.purposeMessages === purposeMessages &&
        targetSession.codeMessages === codeMessages &&
        targetSession.finisherMessages === finisherMessages &&
        targetSession.specPurpose === specPurpose &&
        targetSession.specColors === specColors &&
        targetSession.specFunctions === specFunctions &&
        targetSession.customSystemPrompt === customSystemPrompt
      ) {
        return prevSessions;
      }

      const updated = prevSessions.map((s) => {
        if (s.id === currentSessionId) {
          let newName = s.name;
          if (s.name.startsWith("Conversation") || s.name === "Current Prototype Chat") {
            const firstUserMsg = purposeMessages.find(m => m.role === "user") || 
                                 codeMessages.find(m => m.role === "user") || 
                                 finisherMessages.find(m => m.role === "user");
            if (firstUserMsg) {
              newName = firstUserMsg.message.substring(0, 24) + (firstUserMsg.message.length > 24 ? "..." : "");
            }
          }

          return {
            ...s,
            name: newName,
            purposeMessages,
            codeMessages,
            finisherMessages,
            specPurpose,
            specColors,
            specFunctions,
            customSystemPrompt,
          };
        }
        return s;
      });

      localStorage.setItem("chat_sessions_list", JSON.stringify(updated));
      return updated;
    });
  }, [purposeMessages, codeMessages, finisherMessages, specPurpose, specColors, specFunctions, customSystemPrompt, currentSessionId]);

  // Sync back-compat states individually
  useEffect(() => {
    localStorage.setItem("custom_system_prompt", customSystemPrompt);
  }, [customSystemPrompt]);

  // Sync back-compat states individually
  useEffect(() => {
    localStorage.setItem("chat_messages_purpose", JSON.stringify(purposeMessages));
  }, [purposeMessages]);

  useEffect(() => {
    localStorage.setItem("chat_messages_code", JSON.stringify(codeMessages));
  }, [codeMessages]);

  useEffect(() => {
    localStorage.setItem("chat_messages_finisher", JSON.stringify(finisherMessages));
  }, [finisherMessages]);

  useEffect(() => {
    localStorage.setItem("spec_purpose", specPurpose);
    localStorage.setItem("spec_colors", specColors);
    localStorage.setItem("spec_functions", specFunctions);
  }, [specPurpose, specColors, specFunctions]);

  // Auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeStage, purposeMessages, codeMessages, finisherMessages, loading]);

  const activeMessages = 
    activeStage === "purpose" ? purposeMessages :
    activeStage === "code" ? codeMessages : finisherMessages;

  const setActiveMessages = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    if (activeStage === "purpose") {
      setPurposeMessages(updater);
    } else if (activeStage === "code") {
      setCodeMessages(updater);
    } else {
      setFinisherMessages(updater);
    }
  };

  const handleSwitchSession = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (!target) return;

    setCurrentSessionId(sessionId);
    localStorage.setItem("current_chat_session_id", sessionId);

    setPurposeMessages(target.purposeMessages);
    setCodeMessages(target.codeMessages);
    setFinisherMessages(target.finisherMessages);
    setSpecPurpose(target.specPurpose);
    setSpecColors(target.specColors);
    setSpecFunctions(target.specFunctions);
    setCustomSystemPrompt(target.customSystemPrompt || "");
  };

  const handleCreateNewSession = () => {
    const newId = "session-" + Date.now();
    const newSession: ChatSession = {
      id: newId,
      name: `Conversation ${sessions.length + 1}`,
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString().substring(0, 5),
      purposeMessages: [
        {
          id: "purpose-welcome",
          role: "assistant",
          message: "Hello! I am your Purpose Designer Agent. 🎨\n\nMy job is to talk to you and isolate the main purpose of your application, narrow down a beautiful color layout, and map out the core functions before writing any code. Let's talk! What would you like to build today?",
          timestamp: new Date().toLocaleTimeString().split(" ")[0],
        }
      ],
      codeMessages: [
        {
          id: "code-welcome",
          role: "assistant",
          message: "Code Writer Agent at your service! 💻\n\nOnce the Purpose Designer has refined your vision into a structured specification, I will take over to write complete, clean, and fully-functional code files in the workspace. Let me know what to write or use the brief below to build your core files!",
          timestamp: new Date().toLocaleTimeString().split(" ")[0],
        }
      ],
      finisherMessages: [
        {
          id: "finisher-welcome",
          role: "assistant",
          message: "Greetings! I am your Finisher Agent. ✨\n\nI am here to polish, style, and perfect your application to make it look stunning. I'll add gorgeous entrance and hover animations, optimize typography, verify responsive layouts, and fine-tune spacing to make it flow effortlessly. Let me know what visual or operational details to refine!",
          timestamp: new Date().toLocaleTimeString().split(" ")[0],
        }
      ],
      specPurpose: "",
      specColors: "",
      specFunctions: "",
      customSystemPrompt: "",
    };

    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    setCurrentSessionId(newId);
    localStorage.setItem("chat_sessions_list", JSON.stringify(updatedSessions));
    localStorage.setItem("current_chat_session_id", newId);

    setPurposeMessages(newSession.purposeMessages);
    setCodeMessages(newSession.codeMessages);
    setFinisherMessages(newSession.finisherMessages);
    setSpecPurpose("");
    setSpecColors("");
    setSpecFunctions("");
    setCustomSystemPrompt("");
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      alert("Cannot delete the only remaining session. Resetting its messages instead!");
      handleResetCurrentSession();
      return;
    }

    const filtered = sessions.filter((s) => s.id !== sessionId);
    setSessions(filtered);
    localStorage.setItem("chat_sessions_list", JSON.stringify(filtered));

    if (currentSessionId === sessionId) {
      const nextSession = filtered[0];
      handleSwitchSession(nextSession.id);
    }
  };

  const handleResetCurrentSession = () => {
    const welcomePurpose: ChatMessage[] = [
      {
        id: "purpose-welcome",
        role: "assistant",
        message: "Hello! I am your Purpose Designer Agent. 🎨\n\nMy job is to talk to you and isolate the main purpose of your application, narrow down a beautiful color layout, and map out the core functions before writing any code. Let's talk! What would you like to build today?",
        timestamp: new Date().toLocaleTimeString().split(" ")[0],
      }
    ];
    const welcomeCode: ChatMessage[] = [
      {
        id: "code-welcome",
        role: "assistant",
        message: "Code Writer Agent at your service! 💻\n\nOnce the Purpose Designer has refined your vision into a structured specification, I will take over to write complete, clean, and fully-functional code files in the workspace. Let me know what to write or use the brief below to build your core files!",
        timestamp: new Date().toLocaleTimeString().split(" ")[0],
      }
    ];
    const welcomeFinisher: ChatMessage[] = [
      {
        id: "finisher-welcome",
        role: "assistant",
        message: "Greetings! I am your Finisher Agent. ✨\n\nI am here to polish, style, and perfect your application to make it look stunning. I'll add gorgeous entrance and hover animations, optimize typography, verify responsive layouts, and fine-tune spacing to make it flow effortlessly. Let me know what visual or operational details to refine!",
        timestamp: new Date().toLocaleTimeString().split(" ")[0],
      }
    ];

    setPurposeMessages(welcomePurpose);
    setCodeMessages(welcomeCode);
    setFinisherMessages(welcomeFinisher);
    setSpecPurpose("");
    setSpecColors("");
    setSpecFunctions("");
    setCustomSystemPrompt("");
  };

  const startRenameSession = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(id);
    setEditSessionName(name);
  };

  const saveRenameSession = (id: string) => {
    if (!editSessionName.trim()) return;
    setSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === id) {
          return { ...s, name: editSessionName.trim() };
        }
        return s;
      });
      localStorage.setItem("chat_sessions_list", JSON.stringify(updated));
      return updated;
    });
    setEditingSessionId(null);
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const promptText = (customText || inputValue).trim();
    if (!promptText || loading) return;

    if (!customText) {
      setInputValue("");
    }
    setError(null);

    const time = new Date().toLocaleTimeString().split(" ")[0];
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      message: promptText,
      timestamp: time,
    };

    const updatedMessages = [...activeMessages, userMsg];
    setActiveMessages(updatedMessages);
    setLoading(true);

    try {
      // Build stage-specific system directives to guide the prompt logic
      let directive = "";
      if (activeStage === "purpose") {
        directive = `[STAGES DIRECTIVE - ROLE: PURPOSE DESIGNER AGENT]
Your goal is to converse with the user, find out their core purpose, desired colors/layout, and main functions.
Do not write complete code yet. Instead, discuss options, propose beautiful visual specifications, and structure their ideas.
Once they are happy, output a structured Markdown brief of the design specs.
Current Specs collected so far:
- Main Purpose: ${specPurpose || "Not set yet"}
- Color Layout: ${specColors || "Not set yet"}
- Core Functions: ${specFunctions || "Not set yet"}

Encourage the user to refine these specs.`;
      } else if (activeStage === "code") {
        directive = `[STAGES DIRECTIVE - ROLE: CODE WRITER AGENT]
Your goal is to write fully complete, highly polished code for the virtual files.
Do NOT output placeholders or "// rest of code goes here".
Create or modify index.html, style.css, or any required script files.
Focus on building the complete requested architecture based on the specifications.
Specifications brief:
- Main Purpose: ${specPurpose || "General Prototype App"}
- Color Layout: ${specColors || "Green #1ae854 and dark transparent green"}
- Core Functions: ${specFunctions || "Standard functional UI controls"}`;
      } else {
        directive = `[STAGES DIRECTIVE - ROLE: FINISHER AGENT]
Your goal is to polish, refine, optimize, and style the current app to make it look absolutely stunning, pixel-perfect, and flow effortlessly.
Specifically look at adding:
- Dynamic CSS entrance animations (or using framer-motion if applicable).
- Polishing typography hierarchies, font pairings, text tracking.
- Aligning and perfecting spacing, margins, responsive paddings.
- Visual micro-interactions on hover, active states, buttons.
Keep files completely intact, updating details seamlessly.`;
      }

      let customSystemPromptContext = "";
      if (customSystemPrompt.trim()) {
        customSystemPromptContext = `[CUSTOM USER SYSTEM PROMPT]\n${customSystemPrompt.trim()}\n\n`;
      }

      const fullPromptWithDirective = `${customSystemPromptContext}${directive}\n\nUser request: ${promptText}`;

      if (config.provider === "ollama") {
        const response = await fetch(config.ollamaUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: config.ollamaModel,
            prompt: `Workspace Files Context:\n${JSON.stringify(files, null, 2)}\n\n${fullPromptWithDirective}\n\nRespond in JSON matching the schema:\n{ "explanation": "friendly message string", "files": [ { "path": "filename", "content": "file contents" } ] }`,
            stream: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama returned status code: ${response.status}`);
        }

        const rawData = await response.json();
        let parsed;
        try {
          parsed = JSON.parse(rawData.response);
        } catch {
          parsed = { explanation: rawData.response, files: [] };
        }

        const assMsg: ChatMessage = {
          id: Math.random().toString(),
          role: "assistant",
          message: parsed.explanation || "Processed local Ollama completion.",
          timestamp: new Date().toLocaleTimeString().split(" ")[0],
          pendingFiles: parsed.files && parsed.files.length > 0 ? parsed.files : undefined,
          applied: false,
        };
        setActiveMessages((prev) => [...prev, assMsg]);
      } else {
        const response = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: fullPromptWithDirective,
            files: files,
            chatHistory: updatedMessages.map((m) => ({
              role: m.role,
              message: m.message,
            })),
            provider: config.provider,
            geminiModel: config.geminiModel,
            openaiModel: config.openaiModel,
            customGeminiKey: config.customGeminiKey,
            customOpenaiKey: config.customOpenaiKey,
          }),
        });

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
          let errMsg = `Proxy returned code: ${response.status}`;
          if (contentType && contentType.includes("application/json")) {
            const errData = await response.json();
            errMsg = errData.error || errMsg;
          }
          throw new Error(errMsg);
        }

        const data = await response.json();
        const assMsg: ChatMessage = {
          id: Math.random().toString(),
          role: "assistant",
          message: data.explanation || "Completed stage execution successfully.",
          timestamp: new Date().toLocaleTimeString().split(" ")[0],
          pendingFiles: data.files && data.files.length > 0 ? data.files : undefined,
          applied: false,
        };

        setActiveMessages((prev) => [...prev, assMsg]);

        // If we are in the Purpose Designer stage, let's try to extract key details automatically from the response to help populate our specification wizard
        if (activeStage === "purpose" && data.explanation) {
          const expLower = data.explanation.toLowerCase();
          // Heuristics for purpose extraction
          if (specPurpose === "") {
            const purposeMatch = data.explanation.match(/(?:purpose|app is a|building a|goal is to)\s+([^.\n]+)/i);
            if (purposeMatch && purposeMatch[1]) {
              setSpecPurpose(purposeMatch[1].trim().substring(0, 100));
            }
          }
        }
      }
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySingleMessage = (msg: ChatMessage) => {
    if (msg.pendingFiles) {
      onApplyFiles(msg.message, msg.pendingFiles);
      setActiveMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, applied: true } : m))
      );
    }
  };

  // Stage Hand-off Actions
  const transferToCodeWriter = () => {
    if (!specPurpose) {
      alert("Please enter a basic app purpose or discuss with the Designer first!");
      return;
    }

    const compiledBrief = `DESIGN SPECIFICATIONS BRIEF:
- App Core Purpose: ${specPurpose}
- Color Palette & Aesthetics: ${specColors || "Electric green #1ae854 and dark transparent green theme"}
- Core Functions: ${specFunctions || "Interactive controls & dynamic local states"}

Let's begin writing the application code based on this finalized specifications brief!`;

    // Append to Code messages list
    const systemBriefMsg: ChatMessage = {
      id: "brief-" + Math.random().toString(),
      role: "assistant",
      message: `📥 RECEIVED DESIGN SPEC BRIEF:\n\n${compiledBrief}\n\nI am compiling the workspace strategy now. What should we build first? I recommend writing our main layout!`,
      timestamp: new Date().toLocaleTimeString().split(" ")[0],
    };

    setCodeMessages((prev) => [...prev, systemBriefMsg]);
    setActiveStage("code");
  };

  const transferToFinisher = () => {
    const handoffMsg: ChatMessage = {
      id: "handoff-" + Math.random().toString(),
      role: "assistant",
      message: `⚡ Workspace files are written. I am ready to polish your design! I will focus on visual balance, spacing, typography alignment, CSS glows, and adding micro-interactions using our green #1ae854 palette. Let's make it flow effortlessly!`,
      timestamp: new Date().toLocaleTimeString().split(" ")[0],
    };
    setFinisherMessages((prev) => [...prev, handoffMsg]);
    setActiveStage("finisher");
  };

  // Quick prompt helper functions
  const applyQuickSuggestion = (text: string) => {
    setInputValue(text);
    handleSendMessage(undefined, text);
  };

  const handlePresetFill = (purpose: string, colors: string, functions: string) => {
    setSpecPurpose(purpose);
    setSpecColors(colors);
    setSpecFunctions(functions);
    const textPrompt = `I'd like to design an app with this setup:\n- Purpose: ${purpose}\n- Theme: ${colors}\n- Functions: ${functions}. Can you review this specification?`;
    applyQuickSuggestion(textPrompt);
  };

  return (
    <div className="flex flex-col h-full bg-[#050705] border-r border-[#1ae854]/12 w-full overflow-hidden">
      {/* 3-Agent Stage Indicator Progress Header */}
      <div className="p-3 bg-[#020502]/90 border-b border-[#1ae854]/12 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#1ae854] animate-pulse-soft" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#1ae854]">AI AGENT PIPELINE</span>
          </div>
          <span className="text-[9px] text-[#1ae854]/70 font-mono font-bold bg-[#1ae854]/10 px-1.5 py-0.5 rounded border border-[#1ae854]/15">
            3 STAGES
          </span>
        </div>

        {/* Session Selector & Manager Bar */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-zinc-800/80 relative">
          <History className="h-3.5 w-3.5 text-zinc-400 shrink-0 ml-1" />
          <div className="flex-1 min-w-0">
            {sessions.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSessionDropdown(!showSessionDropdown)}
                  className="w-full flex items-center justify-between text-left px-2 py-1 bg-zinc-950/80 border border-zinc-800/60 rounded text-[10px] text-zinc-300 font-bold hover:text-white hover:border-zinc-700 transition cursor-pointer"
                >
                  <span className="truncate">
                    {sessions.find((s) => s.id === currentSessionId)?.name || "Current Session"}
                  </span>
                  <ChevronDown className="h-3 w-3 text-zinc-500 shrink-0 ml-1" />
                </button>

                {showSessionDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl z-50 max-h-[220px] overflow-y-auto p-1 space-y-0.5">
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          handleSwitchSession(s.id);
                          setShowSessionDropdown(false);
                        }}
                        className={`flex items-center justify-between px-2 py-1.5 rounded text-[10px] cursor-pointer transition ${
                          s.id === currentSessionId
                            ? "bg-[#1ae854]/10 text-[#1ae854] font-black border border-[#1ae854]/20"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                        }`}
                      >
                        {editingSessionId === s.id ? (
                          <input
                            type="text"
                            value={editSessionName}
                            onChange={(e) => setEditSessionName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveRenameSession(s.id);
                              }
                            }}
                            className="bg-black text-white px-1 py-0.5 border border-[#1ae854]/30 rounded text-[10px] focus:outline-none w-full mr-2"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate mr-2 max-w-[130px]">{s.name}</span>
                        )}

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {editingSessionId === s.id ? (
                            <button
                              type="button"
                              onClick={() => saveRenameSession(s.id)}
                              className="p-1 hover:bg-zinc-800 rounded text-emerald-400 cursor-pointer"
                              title="Save name"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => startRenameSession(s.id, s.name, e)}
                              className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-300 cursor-pointer"
                              title="Rename session"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(s.id, e)}
                            className="p-1 hover:bg-red-950/40 rounded text-zinc-500 hover:text-red-400 transition cursor-pointer"
                            title="Delete session"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleCreateNewSession}
            className="p-1 bg-[#1ae854]/10 hover:bg-[#1ae854]/20 border border-[#1ae854]/20 rounded text-[#1ae854] transition cursor-pointer flex items-center justify-center mr-1"
            title="Start New Chat Session"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Horizontal 3-Stage Progress Nav */}
        <div className="grid grid-cols-3 gap-1 bg-[#010301] p-0.5 rounded-lg border border-[#1ae854]/10">
          <button
            onClick={() => setActiveStage("purpose")}
            className={`py-2 px-1 rounded text-[9px] font-black uppercase tracking-wider transition cursor-pointer flex flex-col items-center gap-1 justify-center relative ${
              activeStage === "purpose"
                ? "bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/25"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            <Palette className={`h-3 w-3 ${activeStage === "purpose" ? "text-[#1ae854]" : "text-zinc-400"}`} />
            <span>1. Designer</span>
            {specPurpose && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#1ae854] rounded-full"></span>
            )}
          </button>
          <button
            onClick={() => setActiveStage("code")}
            className={`py-2 px-1 rounded text-[9px] font-black uppercase tracking-wider transition cursor-pointer flex flex-col items-center gap-1 justify-center ${
              activeStage === "code"
                ? "bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/25"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            <Code className={`h-3 w-3 ${activeStage === "code" ? "text-[#1ae854]" : "text-zinc-400"}`} />
            <span>2. Writer</span>
          </button>
          <button
            onClick={() => setActiveStage("finisher")}
            className={`py-2 px-1 rounded text-[9px] font-black uppercase tracking-wider transition cursor-pointer flex flex-col items-center gap-1 justify-center ${
              activeStage === "finisher"
                ? "bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/25"
                : "text-zinc-300 hover:text-white"
            }`}
          >
            <Paintbrush className="h-3 w-3" />
            <span>3. Finisher</span>
          </button>
        </div>
      </div>

      {/* STAGE SPECIFIC PANEL (Upper half, collapsing if empty) */}
      <div className="border-b border-[#1ae854]/12 bg-[#020502]/40">
        {activeStage === "purpose" && (
          <div className="p-3 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">STAGE 1: DEFINE SPECIFICATIONS</span>
              <span className="text-[9px] font-mono text-emerald-400">Talk to Customer</span>
            </div>

            {/* Spec Wizard Fields */}
            <div className="space-y-1.5 bg-[#010301]/60 p-2.5 rounded-lg border border-[#1ae854]/10">
              <div>
                <label className="text-[9px] text-[#1ae854]/70 font-bold uppercase block mb-1">Main Purpose of App</label>
                <input
                  type="text"
                  placeholder="e.g. Budget calculator with neon bar charts..."
                  value={specPurpose}
                  onChange={(e) => setSpecPurpose(e.target.value)}
                  className="w-full bg-[#050705] border border-[#1ae854]/15 rounded p-1.5 text-xs font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-[#1ae854]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <label className="text-[9px] text-[#1ae854]/70 font-bold uppercase block mb-1">Color Palette</label>
                  <input
                    type="text"
                    placeholder="e.g. Transparent Green"
                    value={specColors}
                    onChange={(e) => setSpecColors(e.target.value)}
                    className="w-full bg-[#050705] border border-[#1ae854]/15 rounded p-1.5 text-[11px] font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-[#1ae854]/40"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-[#1ae854]/70 font-bold uppercase block mb-1">Core Functions</label>
                  <input
                    type="text"
                    placeholder="e.g. Local Storage, D3 Visuals"
                    value={specFunctions}
                    onChange={(e) => setSpecFunctions(e.target.value)}
                    className="w-full bg-[#050705] border border-[#1ae854]/15 rounded p-1.5 text-[11px] font-mono text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-[#1ae854]/40"
                  />
                </div>
              </div>

              {/* Hand-off trigger */}
              {specPurpose && (
                <button
                  onClick={transferToCodeWriter}
                  className="w-full mt-2 bg-[#1ae854] hover:bg-[#15bd42] text-black font-black uppercase text-[10px] py-1.5 rounded transition flex items-center justify-center gap-1 shadow-md cursor-pointer"
                >
                  🚀 Export Brief to Code Writer
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="space-y-1 pt-0.5">
              <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider">Quick Preset Specs:</span>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => handlePresetFill("Retro Synthwave Audio Dashboard", "Emerald & Black transparent", "Visual Equalizer, local sound toggles")}
                  className="text-left text-[10px] font-mono bg-[#010301] hover:bg-[#1ae854]/5 border border-[#1ae854]/10 text-zinc-400 p-1.5 rounded truncate transition"
                >
                  📟 Synthwave Audio Dashboard
                </button>
                <button 
                  onClick={() => handlePresetFill("Local Finance & Budget Planner", "Dark Transparent Green (#1ae854)", "Visual bar charts, CRUD expense tracker, CSV export")}
                  className="text-left text-[10px] font-mono bg-[#010301] hover:bg-[#1ae854]/5 border border-[#1ae854]/10 text-zinc-400 p-1.5 rounded truncate transition"
                >
                  💸 Finance & Budget Planner
                </button>
              </div>
            </div>
          </div>
        )}

        {activeStage === "code" && (
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">STAGE 2: CODE GENERATION ENGINE</span>
              <span className="text-[9px] font-mono text-sky-400">Writer Active</span>
            </div>

            {/* Current Active Specs Display */}
            <div className="p-2 bg-[#010301]/80 rounded border border-[#1ae854]/12 text-[10px] text-zinc-400 space-y-1">
              <span className="font-bold text-[#1ae854] uppercase tracking-wider block">Compiled Specifications:</span>
              <p className="truncate"><strong className="text-zinc-300">Purpose:</strong> {specPurpose || "General app prototype"}</p>
              <p className="truncate"><strong className="text-zinc-300">Colors:</strong> {specColors || "Green #1ae854 & dark translucent"}</p>
              
              <div className="flex gap-1 pt-1">
                <button
                  onClick={() => applyQuickSuggestion(`Draft the complete index.html and style.css for my app: ${specPurpose} using colors ${specColors || 'green #1ae854 and dark transparent green'} and functions: ${specFunctions || 'basic widgets'}`)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded py-1 text-[9px] uppercase font-bold transition truncate"
                >
                  🔨 Write Initial Code
                </button>
                <button
                  onClick={transferToFinisher}
                  className="flex-1 bg-[#1ae854]/10 hover:bg-[#1ae854]/20 text-[#1ae854] border border-[#1ae854]/25 rounded py-1 text-[9px] uppercase font-bold transition flex items-center justify-center gap-0.5"
                >
                  ✨ Send to Finisher
                  <ArrowRight className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeStage === "finisher" && (
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">STAGE 3: REFINEMENT & POLISH</span>
              <span className="text-[9px] font-mono text-purple-400">Finisher Active</span>
            </div>

            {/* Polish Prompt Actions */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => applyQuickSuggestion("Can you inspect my files and polish the visual design to make it highly immersive with beautiful green #1ae854 layout accents, neon glowing borders, dynamic entrance transitions, and polished typography?")}
                className="bg-[#1ae854]/5 hover:bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/20 p-2 rounded text-[9px] text-left font-mono font-bold leading-tight transition"
              >
                ✨ Visual & Neon Glow Polish
              </button>
              <button
                onClick={() => applyQuickSuggestion("Add gorgeous smooth exit/entry fade animations and sleek micro-interactions/hover-scale states to all buttons, cards, list items in the codebase to make it flow effortlessly.")}
                className="bg-[#1ae854]/5 hover:bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/20 p-2 rounded text-[9px] text-left font-mono font-bold leading-tight transition"
              >
                🛸 Smooth Micro-interactions
              </button>
              <button
                onClick={() => applyQuickSuggestion("Polish typography by pairing Space Grotesk/Inter fonts beautifully, adjusting letter-spacing (tracking-tight), line-heights, custom headings, and spacing layout balances.")}
                className="bg-[#1ae854]/5 hover:bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/20 p-2 rounded text-[9px] text-left font-mono font-bold leading-tight transition"
              >
                ✍️ Perfect Typography & Fonts
              </button>
              <button
                onClick={() => applyQuickSuggestion("Polish responsiveness, clean up files, adjust spacing/paddings so everything scales wonderfully on mobile views, and verify that there are no layout overflows.")}
                className="bg-[#1ae854]/5 hover:bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/20 p-2 rounded text-[9px] text-left font-mono font-bold leading-tight transition"
              >
                📱 Mobile Fluidity & Margins
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Provider Selector Panel (Collapsible / Compact) */}
      <div className="p-2 border-b border-[#1ae854]/12 flex flex-col gap-1.5 bg-[#010301]/80">
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-zinc-500 font-mono">LLM Proxy Engine:</span>
          <div className="flex gap-2">
            <button
              onClick={() => onChangeConfig({ ...config, provider: "gemini" })}
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition ${
                config.provider === "gemini" ? "text-[#1ae854] bg-[#1ae854]/10 border border-[#1ae854]/30" : "text-zinc-300 hover:text-white"
              }`}
            >
              Gemini
            </button>
            <button
              onClick={() => onChangeConfig({ ...config, provider: "openai" })}
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition ${
                config.provider === "openai" ? "text-[#1ae854] bg-[#1ae854]/10 border border-[#1ae854]/30" : "text-zinc-300 hover:text-white"
              }`}
            >
              OpenAI
            </button>
            <button
              onClick={() => onChangeConfig({ ...config, provider: "ollama" })}
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition ${
                config.provider === "ollama" ? "text-[#1ae854] bg-[#1ae854]/10 border border-[#1ae854]/30" : "text-zinc-300 hover:text-white"
              }`}
            >
              Ollama
            </button>
          </div>
        </div>

        {/* Custom Session System Prompt input field */}
        <div className="mt-1 border-t border-[#1ae854]/10 pt-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-zinc-500 font-mono">Session System Prompt:</span>
            {customSystemPrompt.trim() && (
              <span className="text-[8px] bg-[#1ae854]/10 text-[#1ae854] px-1 rounded font-bold border border-[#1ae854]/20 uppercase">Active</span>
            )}
          </div>
          <textarea
            value={customSystemPrompt}
            onChange={(e) => setCustomSystemPrompt(e.target.value)}
            placeholder="Instruct the agent on custom behaviors, style preferences, or custom guidelines..."
            className="w-full bg-black/60 border border-[#1ae854]/15 rounded p-1.5 text-[10px] font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-[#1ae854]/40 h-10 resize-none"
          />
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 bg-[#020402]/60 scrollbar-none">
        {activeMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col space-y-1 ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <span className="text-[8px] text-zinc-600 font-mono tracking-wider uppercase">
              {msg.role === "user" ? "You" : `${activeStage.toUpperCase()} Agent`} • {msg.timestamp}
            </span>

            <div
              className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[90%] font-sans ${
                msg.role === "user"
                  ? "bg-[#1ae854]/10 text-emerald-100 border border-[#1ae854]/25 font-semibold"
                  : "bg-[#010301] text-zinc-300 border border-[#1ae854]/10 green-glow"
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.message}</p>

              {/* Suggestions / Pending Files */}
              {msg.pendingFiles && msg.pendingFiles.length > 0 && (
                <div className="mt-3 border-t border-[#1ae854]/12 pt-2.5 space-y-2">
                  <span className="text-[9px] font-bold text-[#1ae854] block tracking-wider uppercase">
                    PROPOSED COMPILER ADJUSTMENTS ({msg.pendingFiles.length})
                  </span>
                  <div className="flex flex-wrap gap-1 pb-1">
                    {msg.pendingFiles.map((pf) => (
                      <span
                        key={pf.path}
                        className="text-[9px] font-mono bg-black border border-[#1ae854]/15 text-zinc-400 px-1.5 py-0.5 rounded"
                      >
                        {pf.path}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => onOpenCompare(msg)}
                      className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-[9px] font-black uppercase text-zinc-300 py-1.5 rounded transition cursor-pointer border border-[#1ae854]/12 text-center"
                    >
                      Compare Diffs
                    </button>
                    <button
                      onClick={() => handleApplySingleMessage(msg)}
                      disabled={msg.applied}
                      className={`flex-1 text-[9px] font-black uppercase text-center py-1.5 rounded transition cursor-pointer border ${
                        msg.applied
                          ? "bg-emerald-950/10 text-emerald-500 border-emerald-950/30"
                          : "bg-[#1ae854]/20 text-[#1ae854] border-[#1ae854]/30 hover:bg-[#1ae854]/35"
                      }`}
                    >
                      {msg.applied ? "✓ Applied" : "Apply Merge"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Loading State */}
        {loading && (
          <div className="flex flex-col space-y-1 items-start">
            <span className="text-[8px] text-zinc-600 font-mono tracking-wider uppercase">
              {activeStage.toUpperCase()} AGENT • Thinking...
            </span>
            <div className="bg-[#010301] border border-[#1ae854]/15 p-2.5 rounded-xl flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-[#1ae854] animate-spin" />
              <span className="text-[10px] text-[#1ae854]/80 font-mono tracking-widest animate-pulse">
                synthesizing app logic...
              </span>
            </div>
          </div>
        )}

        {/* Error Flag bar */}
        {error && (
          <div className="p-3 bg-red-950/10 border border-red-900/20 text-red-400 rounded-xl text-xs flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold uppercase tracking-wider block text-[9px]">AI Pipeline Error</span>
              <p className="leading-relaxed text-[11px]">{error}</p>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSendMessage} className="p-2.5 bg-[#020402] border-t border-[#1ae854]/12 flex gap-1.5">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask the ${activeStage} agent to build...`}
          disabled={loading}
          className="flex-1 bg-black border border-[#1ae854]/15 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-[#1ae854]"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="p-1.5 bg-[#1ae854] hover:bg-[#16d14b] disabled:opacity-30 rounded-lg text-black transition flex items-center justify-center cursor-pointer shadow-lg shadow-[#1ae854]/10"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
