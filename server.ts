import express from "express";
import cors from "cors";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

// AI Code Generation API Endpoint (Secure server-side proxy)
app.post("/api/ai/generate", async (req, res) => {
  try {
    const {
      prompt,
      files,
      chatHistory,
      provider = "gemini",
      customGeminiKey,
      customOpenaiKey,
      geminiModel = "gemini-3.5-flash",
      openaiModel = "gpt-4o-mini"
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    // Build files context for the AI model
    let filesContext = "Current files in the virtual workspace:\n\n";
    if (files && files.length > 0) {
      files.forEach((f: any) => {
        filesContext += `--- File Path: ${f.path} ---\n${f.content}\n\n`;
      });
    } else {
      filesContext += "(No files present in workspace yet.)\n";
    }

    // Build chat history context
    let historyContext = "Recent chat conversation history:\n\n";
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach((h: any) => {
        historyContext += `${h.role === "user" ? "User" : "Assistant"}: ${h.message}\n`;
      });
    } else {
      historyContext += "(No previous conversation context.)\n";
    }

    const systemInstruction = `You are MyCanvasLab AI, an expert React/TypeScript software engineer.
You write fully working, production-ready frontend code within an in-browser sandbox.
You will be given:
- The current files in the workspace (HTML, CSS, JS, Markdown, etc.).
- The conversational history.
- The user's new request/prompt.

Your output must always be a valid, strict JSON object. Do not output raw markdown blocks or explanation text outside of the JSON schema.
The JSON schema MUST exactly match:
{
  "explanation": "A friendly summary of what changes you have generated or your answer to the user.",
  "files": [
    {
      "path": "Relative file path from the workspace root (e.g. index.html or style.css)",
      "content": "The COMPLETE new text content of the file. You must always return the full, complete file content. No truncated snippets or comments like '// rest of code stays same'."
    }
  ]
}

Strictly follow these rules:
1. Keep the HTML/CSS visually spectacular, utilizing modern spacing, padding, balanced grids, and beautiful negative space.
2. Only return files that are created or modified.
3. If the user asks a general question, explain inside the "explanation" field and leave "files" empty.`;

    const fullPrompt = `${filesContext}\n\n${historyContext}\n\nUser Prompt: ${prompt}`;

    if (provider === "openai") {
      const apiKeyToUse = customOpenaiKey || process.env.OPENAI_API_KEY;
      if (!apiKeyToUse) {
        throw new Error(
          "OpenAI API Key is missing. Please add a valid key in Settings (Bring Your Own Key) or set OPENAI_API_KEY on the server."
        );
      }

      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKeyToUse}`,
        },
        body: JSON.stringify({
          model: openaiModel,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `${systemInstruction}\n\nIMPORTANT: You must return a valid JSON object matching the schema: { "explanation": "friendly string", "files": [ { "path": "path/string", "content": "file content string" } ] }`,
            },
            { role: "user", content: fullPrompt },
          ],
        }),
      });

      if (!openaiResponse.ok) {
        const errData = await openaiResponse.json().catch(() => ({}));
        const errMsg = errData.error?.message || `OpenAI returned status ${openaiResponse.status}`;
        throw new Error(errMsg);
      }

      const openaidata: any = await openaiResponse.json();
      const content = openaidata.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("No response generated from OpenAI.");
      }

      const parsedResult = JSON.parse(content);
      return res.json(parsedResult);
    } else {
      // GEMINI PROVIDER
      const apiKeyToUse = customGeminiKey || process.env.GEMINI_API_KEY;
      if (!apiKeyToUse) {
        throw new Error(
          "Gemini API Key is missing. Please add a valid key in Settings (Bring Your Own Key) or set GEMINI_API_KEY on the server."
        );
      }

      const ai = new GoogleGenAI({
        apiKey: apiKeyToUse,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: geminiModel,
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
                      description: "Relative path of the file, e.g. index.html",
                    },
                    content: {
                      type: Type.STRING,
                      description: "Full text content of the file. Must be complete.",
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
        throw new Error("No response generated from the Gemini model.");
      }

      const parsedResult = JSON.parse(resultText);
      return res.json(parsedResult);
    }
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred while generating code. Please verify your API key in Settings.",
    });
  }
});

// Secure server-side endpoint for AI Avatar generation
app.post("/api/ai/generate-avatar", async (req, res) => {
  try {
    const { prompt, customGeminiKey } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const apiKeyToUse = customGeminiKey || process.env.GEMINI_API_KEY;
    if (!apiKeyToUse) {
      throw new Error(
        "Gemini API Key is missing. Please add a valid key in Settings (Bring Your Own Key) or set GEMINI_API_KEY on the server."
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKeyToUse,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemInstruction = `You are a creative modern SVG designer specializing in avatars, gaming icons, and developer profile graphics.
Your task is to generate a beautiful, valid, self-contained SVG element that matches the user's prompt.
Strictly follow these guidelines:
1. Output MUST be valid, complete SVG code, beginning with '<svg' and ending with '</svg>'.
2. The SVG MUST be responsive using viewBox="0 0 100 100", with rounded/circular styling suitable for a circular avatar profile (e.g., background circle, centered characters, modern abstract elements, neon glow, cyber, tech, organic).
3. Do NOT include any markdown code blocks, backticks, or comments (no \`\`\`xml or \`\`\`svg wrapper). Just return the direct SVG string.
4. Output MUST be clean, high quality, and visually spectacular, using modern gradients, glows, shadows, and clean geometry.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a gorgeous, colorful, highly detailed vector SVG avatar based on this theme: ${prompt}`,
      config: {
        systemInstruction,
      },
    });

    let svgText = response.text || "";
    svgText = svgText.trim();
    if (svgText.startsWith("```")) {
      svgText = svgText.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
    }
    svgText = svgText.trim();

    return res.json({ svg: svgText });
  } catch (error: any) {
    console.error("Avatar AI Generation Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate SVG avatar using AI. Please check your API key.",
    });
  }
});

  // Vite middleware for development or fallback for production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve client assets in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Redirect wildcard routes to client index index.html for SPA consistency
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running dynamically on port ${PORT}`);
  });
}

startServer();
