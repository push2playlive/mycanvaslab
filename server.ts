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

// GitHub OAuth URL Endpoint
app.get("/api/auth/github/url", (req, res) => {
  const queryClientId = req.query.client_id as string;
  const queryClientSecret = req.query.client_secret as string;

  const clientId = queryClientId || process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID;
  if (!clientId) {
    return res.status(400).json({ 
      error: "GitHub Client ID is not configured. Please add GITHUB_CLIENT_ID to Secrets or enter in Settings." 
    });
  }

  // Use APP_URL environment variable or fallback to requested host
  const host = process.env.APP_URL || req.protocol + "://" + req.get("host");
  const redirectUri = `${host}/auth/callback`;

  // Encode the keys in the state if they are provided
  const stateObj = {
    cid: queryClientId || "",
    csec: queryClientSecret || ""
  };
  const state = Buffer.from(JSON.stringify(stateObj)).toString("base64");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo,user",
    state: state
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  res.json({ url: authUrl });
});

// GitHub OAuth Callback Handle
app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  const { code, state } = req.query;
  try {
    let clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID;
    let clientSecret = process.env.GITHUB_CLIENT_SECRET || process.env.CLIENT_SECRET;

    if (state) {
      try {
        const stateStr = Buffer.from(state as string, "base64").toString("utf-8");
        const stateObj = JSON.parse(stateStr);
        if (stateObj.cid) clientId = stateObj.cid;
        if (stateObj.csec) clientSecret = stateObj.csec;
      } catch (stateErr) {
        console.error("Error parsing OAuth state:", stateErr);
      }
    }

    if (!clientId || !clientSecret) {
      throw new Error("GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing. Please set them in Settings or Environment Secrets.");
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    const tokenData: any = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error(tokenData.error_description || "Failed to obtain access token from GitHub.");
    }

    // Fetch user details from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "MyCanvasLab-IDE"
      }
    });
    const userData = await userResponse.json();

    res.send(`
      <html>
        <head>
          <title>Connecting GitHub - MyCanvasLab</title>
          <style>
            body {
              background: #0d0d0d;
              color: #ccc;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: #141414;
              border: 1px solid #2a2a2a;
              padding: 2.5rem;
              border-radius: 16px;
              text-align: center;
              box-shadow: 0 10px 30px rgba(0,0,0,0.7);
              max-width: 320px;
            }
            .spinner {
              border: 3px solid rgba(255,255,255,0.05);
              width: 44px;
              height: 44px;
              border-radius: 50%;
              border-left-color: #079C3C;
              animation: spin 0.8s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
              margin: 1.5rem auto;
            }
            h2 {
              color: #fff;
              font-size: 1.25rem;
              margin: 0 0 0.5rem 0;
              font-weight: 600;
            }
            p {
              color: #71717a;
              font-size: 13px;
              margin: 0;
              line-height: 1.5;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="spinner"></div>
            <h2>Connecting GitHub</h2>
            <p>We are finishing your authentication. This window will close automatically.</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_SUCCESS',
                token: '${accessToken}',
                user: ${JSON.stringify(userData)}
              }, '*');
              setTimeout(() => {
                window.close();
              }, 400);
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("OAuth Exchange Error:", err);
    res.status(500).send(`
      <html>
        <head><title>Connection Failed - MyCanvasLab</title></head>
        <body style="background: #0d0d0d; color: #f43f5e; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="background: #141414; border: 1px solid #e11d48; padding: 2.5rem; border-radius: 16px; text-align: center; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.7);">
            <h2 style="color: #fff; margin: 0 0 0.75rem 0; font-size: 1.25rem;">Connection Failed</h2>
            <p style="color: #a1a1aa; font-size: 13px; line-height: 1.6; margin-bottom: 1.5rem;">${err.message || 'An error occurred during authentication.'}</p>
            <p style="color: #52525b; font-size: 11px; margin-bottom: 1.5rem;">Verify that your GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are correctly populated in Secrets settings.</p>
            <button onclick="window.close()" style="background: #ef4444; color: white; border: none; padding: 8px 18px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: background 0.15s;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }
});

// Atomic GitHub Push Endpoint
app.post("/api/github/push", async (req, res) => {
  const { token, repo, branch, files, commitMessage } = req.body;

  if (!token || !repo || !branch || !files || !Array.isArray(files)) {
    return res.status(400).json({ error: "Missing required fields: token, repo, branch, files" });
  }

  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) {
    return res.status(400).json({ error: "Invalid repository format. Must be 'owner/repo'" });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "MyCanvasLab-IDE",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json"
  };

  try {
    // 1. Get the latest commit of the branch
    const refResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${branch}`, { headers });
    
    let baseTreeSha = "";
    let parentCommitSha = "";

    if (refResponse.ok) {
      const refData: any = await refResponse.json();
      parentCommitSha = refData.object.sha;

      // Get the base commit details to find the tree SHA
      const commitResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits/${parentCommitSha}`, { headers });
      if (commitResponse.ok) {
        const commitData: any = await commitResponse.json();
        baseTreeSha = commitData.tree.sha;
      }
    } else {
      // Branch does not exist. We can try to see if repo is completely empty, or if we need to initialize it.
      // For empty repos, we might not have a base tree. We will try to create a commit without parents.
    }

    // 2. Create blobs for each file
    const treeItems = [];
    for (const file of files) {
      const blobResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/blobs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: file.content,
          encoding: "utf-8"
        })
      });

      if (!blobResponse.ok) {
        const errText = await blobResponse.text();
        throw new Error(`Failed to create blob for file '${file.path}': ${errText}`);
      }

      const blobData: any = await blobResponse.json();

      treeItems.push({
        path: file.path,
        mode: "100644", // standard file
        type: "blob",
        sha: blobData.sha
      });
    }

    // 3. Create the tree
    const treeBody: any = {
      tree: treeItems
    };
    if (baseTreeSha) {
      treeBody.base_tree = baseTreeSha;
    }

    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees`, {
      method: "POST",
      headers,
      body: JSON.stringify(treeBody)
    });

    if (!treeResponse.ok) {
      const errText = await treeResponse.text();
      throw new Error(`Failed to create tree structure: ${errText}`);
    }

    const treeData: any = await treeResponse.json();
    const newTreeSha = treeData.sha;

    // 4. Create commit
    const commitBody: any = {
      message: commitMessage || "Updates from MyCanvasLab IDE",
      tree: newTreeSha
    };
    if (parentCommitSha) {
      commitBody.parents = [parentCommitSha];
    }

    const createCommitResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits`, {
      method: "POST",
      headers,
      body: JSON.stringify(commitBody)
    });

    if (!createCommitResponse.ok) {
      const errText = await createCommitResponse.text();
      throw new Error(`Failed to commit: ${errText}`);
    }

    const createdCommitData: any = await createCommitResponse.json();
    const newCommitSha = createdCommitData.sha;

    // 5. Update ref or create it if not existed
    let updateRefUrl = `https://api.github.com/repos/${owner}/${repoName}/git/refs/heads/${branch}`;
    let updateMethod = "PATCH";
    let updateBody: any = { sha: newCommitSha, force: true };

    if (!parentCommitSha) {
      // Create new ref
      updateRefUrl = `https://api.github.com/repos/${owner}/${repoName}/git/refs`;
      updateMethod = "POST";
      updateBody = { ref: `refs/heads/${branch}`, sha: newCommitSha };
    }

    const updateRefResponse = await fetch(updateRefUrl, {
      method: updateMethod,
      headers,
      body: JSON.stringify(updateBody)
    });

    if (!updateRefResponse.ok) {
      const errText = await updateRefResponse.text();
      throw new Error(`Failed to update branch reference '${branch}': ${errText}`);
    }

    res.json({
      success: true,
      commitSha: newCommitSha,
      url: `https://github.com/${owner}/${repoName}/commit/${newCommitSha}`
    });

  } catch (error: any) {
    console.error("GitHub Push Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during Git push." });
  }
});

// Recursive GitHub Pull Endpoint
app.post("/api/github/pull", async (req, res) => {
  const { token, repo, branch } = req.body;

  if (!token || !repo || !branch) {
    return res.status(400).json({ error: "Missing required fields: token, repo, branch" });
  }

  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) {
    return res.status(400).json({ error: "Invalid repository format. Must be 'owner/repo'" });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "MyCanvasLab-IDE",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  try {
    // 1. Get the latest commit of the branch to get its tree SHA
    const refResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${branch}`, { headers });
    if (!refResponse.ok) {
      const errText = await refResponse.text();
      throw new Error(`Failed to load branch '${branch}': ${errText}`);
    }

    const refData: any = await refResponse.json();
    const commitSha = refData.object.sha;

    // Get the commit to find the tree SHA
    const commitResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/commits/${commitSha}`, { headers });
    if (!commitResponse.ok) {
      throw new Error(`Failed to fetch commit metadata for SHA ${commitSha}`);
    }
    const commitData: any = await commitResponse.json();
    const treeSha = commitData.tree.sha;

    // 2. Fetch the tree recursively
    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/${treeSha}?recursive=1`, { headers });
    if (!treeResponse.ok) {
      throw new Error(`Failed to fetch tree structure for SHA ${treeSha}`);
    }

    const treeData: any = await treeResponse.json();
    const items = treeData.tree || [];

    // Filter to files (type is "blob")
    const fileItems = items.filter((item: any) => item.type === "blob");

    const pulledFiles = [];
    for (const item of fileItems) {
      const blobResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/blobs/${item.sha}`, { headers });
      if (blobResponse.ok) {
        const blobData: any = await blobResponse.json();
        const content = Buffer.from(blobData.content, "base64").toString("utf-8");
        pulledFiles.push({
          path: item.path,
          content
        });
      }
    }

    res.json({
      success: true,
      branch,
      commitSha,
      files: pulledFiles
    });

  } catch (error: any) {
    console.error("GitHub Pull Error:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred during Git pull." });
  }
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
