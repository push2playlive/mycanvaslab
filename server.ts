import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initialize Gemini client to prevent crashing if the key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please add it via Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// AI Code Generation API Route
app.post("/api/ai/generate", async (req, res) => {
  try {
    const { prompt, files, chatHistory } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are MyCanvasLab AI, an expert React/TypeScript software engineer. 
You write fully working, production-ready frontend code within an in-browser sandbox.
You will be given:
1. The current files in the workspace.
2. A list of previous chat messages.
3. The user's new prompt / instructions.

Your goal is to build, modify, or update files to satisfy the user request.
You must output a JSON response containing:
- "explanation": A friendly, clear description of what you built or changed, or your answer to their question.
- "files": An array of updated or new files, where each file has:
  - "path": The file path (e.g. "src/App.tsx", "src/components/Calculator.tsx").
  - "content": The complete new content of the file. No truncations, comments like "// remaining code same", or placeholders. Always provide the complete file!

Guidelines:
1. Keep the workspace structure standard: Use "src/App.tsx" as the main entry point, "src/index.css" for styles, and modular files under "src/components/" or "src/utils/" if needed.
2. For styling, use Tailwind CSS utility classes. Avoid inline styles.
3. For icons, use "lucide-react" imports (e.g., import { Play, Pause } from 'lucide-react').
4. The React environment is React 18+ inside the sandbox. Do not use external libraries other than "lucide-react" unless absolutely necessary, or just stick to built-in hooks (useState, useEffect, useRef, useMemo, etc.) and React.
5. If the user's request is purely informational (e.g., "explain how the sandbox works"), explain it in the "explanation" field and return an empty array for "files".
6. If modifying an existing file, read its path and content from the provided current files list, and return the modified version.
7. Return ONLY valid, parseable JSON fitting the schema requested. No markdown block wrapper in the response body, just raw JSON.`;

    // Convert the files into a readable string for the AI context
    const filesContext = files && files.length > 0 
      ? "Current workspace files:\n" + files.map((f: any) => `--- File: ${f.path} ---\n${f.content}`).join("\n\n")
      : "The workspace is currently empty.";

    const historyContext = chatHistory && chatHistory.length > 0
      ? "Previous chat history:\n" + chatHistory.map((h: any) => `${h.role === "user" ? "User" : "AI"}: ${h.message}`).join("\n")
      : "";

    const fullPrompt = `${filesContext}\n\n${historyContext}\n\nUser Prompt: ${prompt}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "A friendly summary of changes or the chat reply.",
            },
            files: {
              type: Type.ARRAY,
              description: "The list of files created, modified, or updated.",
              items: {
                type: Type.OBJECT,
                properties: {
                  path: {
                    type: Type.STRING,
                    description: "Relative path of the file, e.g. src/App.tsx",
                  },
                  content: {
                    type: Type.STRING,
                    description: "Full text content of the file. Must be the complete file.",
                  },
                },
                required: ["path", "content"],
              },
            },
          },
          required: ["explanation", "files"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response generated from the model.");
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: error.message || "An error occurred while generating code. Please verify your GEMINI_API_KEY." 
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// Vite middleware configuration or Static serving
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite HMR integration...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MyCanvasLab IDE server running on http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
});
