import React, { useState, useEffect } from "react";
import { 
  Github, 
  GitBranch, 
  GitCommit, 
  GitPullRequest, 
  Upload, 
  Download, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Lock, 
  RotateCw, 
  FileCode, 
  Terminal as TerminalIcon,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Eye
} from "lucide-react";
import { VirtualFile } from "../types";

interface VersionControlProps {
  files: VirtualFile[];
  onApplyFiles: (explanation: string, generatedFiles: VirtualFile[]) => void;
  accentColor?: string;
}

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string;
  bio: string;
}

export default function VersionControl({ files, onApplyFiles, accentColor = "green" }: VersionControlProps) {
  // Authentication & Configuration State
  const [token, setToken] = useState<string | null>(localStorage.getItem("gh_token"));
  const [user, setUser] = useState<GitHubUser | null>(
    localStorage.getItem("gh_user") ? JSON.parse(localStorage.getItem("gh_user")!) : null
  );
  
  // Custom GITHUB keys
  const [clientIdInput, setClientIdInput] = useState<string>(localStorage.getItem("gh_client_id") || "");
  const [clientSecretInput, setClientSecretInput] = useState<string>(localStorage.getItem("gh_client_secret") || "");

  // Repo Settings State
  const [repo, setRepo] = useState<string>(localStorage.getItem("gh_repo") || "username/my-canvas-app");
  const [branch, setBranch] = useState<string>(localStorage.getItem("gh_branch") || "main");
  const [commitMessage, setCommitMessage] = useState<string>("feat: upgrade canvas module");
  
  // UI & Mode State
  const [activeAction, setActiveAction] = useState<"push" | "pull">("push");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ commitSha?: string; url?: string } | null>(null);
  
  // Sandbox / Demo Simulation State
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!localStorage.getItem("gh_token"));
  const [showConfigGuide, setShowConfigGuide] = useState<boolean>(false);

  // Dynamically build the redirect URI for user reference
  const devCallbackUrl = `${window.location.origin}/auth/callback`;

  // Sync state to local storage
  useEffect(() => {
    if (token) {
      localStorage.setItem("gh_token", token);
    } else {
      localStorage.removeItem("gh_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("gh_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("gh_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("gh_client_id", clientIdInput);
  }, [clientIdInput]);

  useEffect(() => {
    localStorage.setItem("gh_client_secret", clientSecretInput);
  }, [clientSecretInput]);

  useEffect(() => {
    localStorage.setItem("gh_repo", repo);
  }, [repo]);

  useEffect(() => {
    localStorage.setItem("gh_branch", branch);
  }, [branch]);

  // Setup Popup listener for OAuth callback
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate origin is from AI Studio or localhost
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }

      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const { token: receivedToken, user: receivedUser } = event.data;
        if (receivedToken) {
          setToken(receivedToken);
          setUser(receivedUser || null);
          setIsDemoMode(false);
          setError(null);
          setLogs((prev) => [...prev, `Successfully authenticated as ${receivedUser?.login || "GitHub user"}`]);
        }
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  // Trigger GitHub Authentication flow
  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (clientIdInput) queryParams.append("client_id", clientIdInput);
      if (clientSecretInput) queryParams.append("client_secret", clientSecretInput);

      const urlSuffix = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await fetch(`/api/auth/github/url${urlSuffix}`);
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to fetch authorization URL.");
      }
      const { url } = await response.json();

      // Open OAuth login popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        url,
        "github_oauth",
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
      );

      if (!popup) {
        throw new Error("Popup blocked. Please authorize popups for this app to login via GitHub.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not launch OAuth sequence.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setToken(null);
    setUser(null);
    setIsDemoMode(true);
    setSuccessData(null);
    setLogs([]);
    setError(null);
  };

  // Perform Commit & Push (Real or Simulation)
  const handlePush = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessData(null);
    setLogs([]);

    const pushLogs = [
      "Starting Version Control Push Transaction...",
      `Checking status of remote repository '${repo}'...`,
      `Verified target branch: '${branch}'`
    ];

    if (isDemoMode) {
      // Simulated sandbox git operation
      setLogs(pushLogs);
      
      setTimeout(() => {
        setLogs((prev) => [...prev, `Analyzing staged changed files...`]);
      }, 500);

      setTimeout(() => {
        files.forEach((f) => {
          setLogs((prev) => [...prev, `-> Packaged blob for ${f.path} (${f.content.length} characters)`]);
        });
      }, 1000);

      setTimeout(() => {
        setLogs((prev) => [...prev, "Compiling atomic virtual trees...", "Creating tree transaction commit node..."]);
      }, 1800);

      setTimeout(() => {
        setLogs((prev) => [...prev, "Simulating secure handshake with remote endpoint..."]);
      }, 2500);

      setTimeout(() => {
        const mockSha = "sha256_" + Math.random().toString(16).substr(2, 40);
        setLogs((prev) => [
          ...prev,
          `Push Transaction Complete!`,
          `Mock Commit SHA: ${mockSha}`,
          `Target branch ${branch} successfully updated on origin.`
        ]);
        setSuccessData({
          commitSha: mockSha,
          url: `https://github.com/demo/sandbox/commit/${mockSha}`
        });
        setIsLoading(false);
      }, 3200);

    } else {
      // Real API push call
      try {
        setLogs(pushLogs);
        setLogs((prev) => [...prev, "Assembling and uploading files to workspace git server..."]);
        
        const response = await fetch("/api/github/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token,
            repo,
            branch,
            files,
            commitMessage
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to commit and push files.");
        }

        setLogs((prev) => [
          ...prev,
          "Blobs uploaded successfully.",
          "Constructed atomic virtual tree transaction.",
          `Created Git commit on remote.`,
          `Success! Remote reference updated to commit ${data.commitSha}`
        ]);
        setSuccessData({
          commitSha: data.commitSha,
          url: data.url
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An unexpected error occurred during Git push.");
        setLogs((prev) => [...prev, "⚠️ Git push transaction aborted due to error."]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Perform Git Pull (Real or Simulation)
  const handlePull = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessData(null);
    setLogs([]);

    const pullLogs = [
      "Initiating Pull & Sync Operation...",
      `Connecting to repository server: github.com/${repo}`,
      `Fetching latest commit reference on branch '${branch}'...`
    ];

    if (isDemoMode) {
      setLogs(pullLogs);
      
      setTimeout(() => {
        setLogs((prev) => [...prev, "Remote reference found: HEAD at master branch (commit 9fa8b12)"]);
      }, 600);

      setTimeout(() => {
        setLogs((prev) => [...prev, "Analyzing tree files and generating local diff comparison...", "Found 2 files modified on remote:"]);
      }, 1200);

      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          "-> index.html (Remote updates detected)",
          "-> src/App.tsx (Visual layout refinement)"
        ]);
      }, 1800);

      setTimeout(() => {
        setLogs((prev) => [...prev, "Merging remote changes with workspace database...", "Compiling Virtual Applet Workspace..."]);
      }, 2500);

      setTimeout(() => {
        // Mock files pulled
        const mockPulledFiles: VirtualFile[] = files.map(f => {
          if (f.path === "src/App.tsx") {
            return {
              ...f,
              content: f.content + "\n// Synchronized with Remote Repository Branch: " + branch
            };
          }
          return f;
        });

        onApplyFiles("Synced with mock repository files on Git Pull", mockPulledFiles);

        setLogs((prev) => [
          ...prev,
          "Merge conflict resolver: Clean auto-merge completed successfully.",
          "Workspace synchronized. Dev environment hot-reloaded!"
        ]);
        setSuccessData({
          commitSha: "9fa8b12e3e56a42207bdaee7e89abce224a1b021",
          url: `https://github.com/demo/sandbox/commit/9fa8b12e3e56a42207bdaee7e89abce224a1b021`
        });
        setIsLoading(false);
      }, 3300);

    } else {
      try {
        setLogs(pullLogs);
        setLogs((prev) => [...prev, "Downloading repository tree structure recursively..."]);

        const response = await fetch("/api/github/pull", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token,
            repo,
            branch
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch files from remote repository.");
        }

        if (data.files && Array.isArray(data.files) && data.files.length > 0) {
          setLogs((prev) => [
            ...prev,
            `Successfully pulled ${data.files.length} blobs from branch '${branch}'.`,
            "Auto-merging files into MyCanvasLab workspace...",
            "Overwriting files cleanly..."
          ]);
          
          onApplyFiles(`Git pulled from ${repo} [${branch}]`, data.files);

          setLogs((prev) => [...prev, "Workspace successfully refreshed!"]);
          setSuccessData({
            commitSha: data.commitSha,
            url: `https://github.com/${repo}/commit/${data.commitSha}`
          });
        } else {
          setLogs((prev) => [...prev, "Remote tree was empty or returned no files."]);
        }

      } catch (err: any) {
        console.error(err);
        setError(err.message || "Could not complete Pull Operation. Please verify repo access and configuration.");
        setLogs((prev) => [...prev, "⚠️ Git pull transaction aborted due to error."]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#141414] text-gray-300 select-none">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#141414]/90 backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-[#1e1e1e] border border-[#2a2a2a] text-[var(--accent)] rounded-lg">
            <Github className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Version Control</h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">GitHub Integration</p>
          </div>
        </div>

        {/* Demo Indicator */}
        {isDemoMode && (
          <div className="px-2 py-0.5 bg-amber-950/40 border border-amber-500/30 text-amber-400 rounded text-[9px] font-mono font-semibold uppercase tracking-wider flex items-center space-x-1 animate-pulse">
            <Sparkles className="h-2.5 w-2.5" />
            <span>Sandbox Mode</span>
          </div>
        )}
      </div>

      {/* Main Panel Content (Scrollable Container) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        
        {/* Authentication State Card */}
        {!token ? (
          <div className="space-y-4">
            {/* Not connected layout */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 text-center space-y-4 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-xl"></div>
              
              <div className="w-12 h-12 bg-zinc-900 border border-[#333] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <Github className="h-6 w-6" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">Connect GitHub Account</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                  Push your workspace code directly to a repository or pull remote branches into your sandbox applet atomically.
                </p>
              </div>

              {/* Dynamic Key Configuration Fields */}
              <div className="border border-[#2a2a2a] rounded-lg p-3 bg-black/30 text-left space-y-2.5">
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Custom OAuth Credentials (Optional)</div>
                
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-semibold block">GitHub Client ID</label>
                  <input
                    type="text"
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    placeholder="e.g. Ov23ctXp8..."
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--accent)] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 font-semibold block">GitHub Client Secret</label>
                  <input
                    type="password"
                    value={clientSecretInput}
                    onChange={(e) => setClientSecretInput(e.target.value)}
                    placeholder="e.g. 5d7e63b..."
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--accent)] font-mono"
                  />
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="w-full py-2.5 bg-white text-zinc-950 hover:bg-zinc-200 font-bold text-xs rounded-lg transition duration-150 flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <RotateCw className="h-3.5 w-3.5 animate-spin text-zinc-950" />
                  ) : (
                    <Github className="h-4 w-4" />
                  )}
                  <span>Authenticate with GitHub</span>
                </button>

                <button
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className={`w-full py-2 border rounded-lg text-xs font-bold transition duration-150 ${
                    isDemoMode 
                      ? "bg-amber-950/20 border-amber-500/30 text-amber-400" 
                      : "bg-[#222]/30 border-[#333] text-gray-400 hover:text-white"
                  }`}
                >
                  {isDemoMode ? "Disable Sandbox Simulation" : "Enable Sandbox Simulation"}
                </button>
              </div>
            </div>

            {/* Instruction Guide Toggle Card */}
            <div className="border border-[#2a2a2a] bg-[#1a1a1a]/40 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowConfigGuide(!showConfigGuide)}
                className="w-full p-4 flex items-center justify-between hover:bg-[#1a1a1a]/80 transition duration-150 text-left cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <HelpCircle className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-semibold text-white">OAuth Setup Instructions</span>
                </div>
                <div className="text-[10px] text-[var(--accent)] font-semibold uppercase tracking-wider">
                  {showConfigGuide ? "Hide" : "Show"}
                </div>
              </button>

              {showConfigGuide && (
                <div className="p-4 border-t border-[#2a2a2a] bg-[#111] space-y-4 font-mono text-[11px] leading-relaxed select-text">
                  <p className="text-gray-400 text-xs">
                    Configure GitHub Client details to connect real repositories:
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-zinc-500 block uppercase text-[9px] font-bold tracking-wider mb-1">1. Create OAuth App</span>
                      <a 
                        href="https://github.com/settings/developers" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[var(--accent)] hover:underline inline-flex items-center"
                      >
                        github.com/settings/developers <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>

                    <div>
                      <span className="text-zinc-500 block uppercase text-[9px] font-bold tracking-wider mb-1">2. Register Callback URL</span>
                      <div className="bg-[#1a1a1a] p-2 border border-[#2a2a2a] rounded select-all font-mono text-[10px] text-zinc-300 break-all leading-normal">
                        {devCallbackUrl}
                      </div>
                    </div>

                    <div>
                      <span className="text-zinc-500 block uppercase text-[9px] font-bold tracking-wider mb-1">3. Set Environment Secrets</span>
                      <div className="space-y-1 text-[10px] text-zinc-400">
                        <p><span className="text-orange-400">GITHUB_CLIENT_ID</span> = Your Client ID</p>
                        <p><span className="text-orange-400">GITHUB_CLIENT_SECRET</span> = Your Client Secret</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Connected State User Card */
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={user?.avatar_url} 
                  alt={user?.login} 
                  className="w-10 h-10 rounded-full border border-[#333] bg-zinc-900"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{user?.name || user?.login}</h4>
                  <a 
                    href={user?.html_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[10px] text-gray-500 hover:text-[var(--accent)] hover:underline inline-flex items-center"
                  >
                    @{user?.login} <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                  </a>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-2.5 py-1.5 bg-[#222] border border-[#333] hover:border-rose-500/30 hover:bg-rose-950/20 hover:text-rose-400 text-[10px] font-semibold rounded-lg transition duration-150 cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Git Operation Mode Selector (Requires connection or Sandbox active) */}
        {(token || isDemoMode) && (
          <div className="space-y-4">
            {/* Repository Input Form */}
            <div className="bg-[#1a1a1a]/70 border border-[#2a2a2a] rounded-xl p-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Repository (owner/repo)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      placeholder="username/my-app"
                      className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--accent)] font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Branch Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--accent)] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="flex border border-[#2b2b2b] rounded-lg bg-[#111] p-0.5">
                <button
                  onClick={() => {
                    setActiveAction("push");
                    setSuccessData(null);
                    setLogs([]);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center space-x-1.5 transition ${
                    activeAction === "push" 
                      ? "bg-[var(--accent)] text-white shadow-sm" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Push Files</span>
                </button>
                <button
                  onClick={() => {
                    setActiveAction("pull");
                    setSuccessData(null);
                    setLogs([]);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center space-x-1.5 transition ${
                    activeAction === "pull" 
                      ? "bg-[var(--accent)] text-white shadow-sm" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Pull Code</span>
                </button>
              </div>
            </div>

            {/* Action Details Card */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 space-y-4">
              {activeAction === "push" ? (
                /* PUSH MODE */
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Commit Message</label>
                    <input 
                      type="text" 
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="feat: add search replace panel"
                      className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Workspace Changes ({files.length})</span>
                      <span className="text-[10px] text-[var(--accent)] font-semibold uppercase tracking-wider">All Auto-staged</span>
                    </div>

                    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg max-h-[140px] overflow-y-auto divide-y divide-[#202020] scrollbar-thin">
                      {files.map((f) => (
                        <div key={f.path} className="px-3 py-2 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center space-x-2 text-gray-300">
                            <FileCode className="h-3.5 w-3.5 text-zinc-500" />
                            <span className="truncate max-w-[200px]">{f.path}</span>
                          </div>
                          <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 border border-emerald-500/20 rounded font-bold">Staged</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handlePush}
                    disabled={isLoading || !repo || !branch || !commitMessage}
                    className="w-full py-2.5 bg-[var(--accent)] hover:opacity-95 text-white font-bold text-xs rounded-lg transition duration-150 flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-40"
                  >
                    {isLoading ? (
                      <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <GitCommit className="h-4 w-4" />
                    )}
                    <span>Commit and Push Files</span>
                  </button>
                </div>
              ) : (
                /* PULL MODE */
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#111] border border-[#2a2a2a] rounded-lg text-xs leading-relaxed text-gray-400 space-y-2">
                    <p className="font-semibold text-white flex items-center">
                      <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                      Important: Overwrite Notice
                    </p>
                    <p>
                      Pulling from the remote repository will sync and <span className="text-white font-semibold underline">overwrite</span> your local MyCanvasLab workspace files. Keep a backup of custom changes before executing!
                    </p>
                  </div>

                  <button
                    onClick={handlePull}
                    disabled={isLoading || !repo || !branch}
                    className="w-full py-2.5 bg-[var(--accent)] hover:opacity-95 text-white font-bold text-xs rounded-lg transition duration-150 flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-40"
                  >
                    {isLoading ? (
                      <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <GitPullRequest className="h-4 w-4" />
                    )}
                    <span>Sync & Pull Repository</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="bg-red-950/20 border border-red-500/30 text-red-400 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs">
                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Transaction Failed</p>
                  <p className="text-zinc-400 leading-normal">{error}</p>
                </div>
              </div>
            )}

            {/* Git Logs Terminal Console */}
            {logs.length > 0 && (
              <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden shadow-inner">
                <div className="px-3 py-2 bg-[#171717] border-b border-[#2a2a2a] flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono">
                    <TerminalIcon className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Transaction Console</span>
                  </div>
                  <div className="flex space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                  </div>
                </div>

                <div className="p-3.5 font-mono text-[10px] space-y-2 max-h-[160px] overflow-y-auto leading-relaxed select-text scrollbar-thin">
                  {logs.map((log, index) => (
                    <div key={index} className={log.startsWith("⚠️") ? "text-rose-400" : log.startsWith("->") ? "text-gray-400 pl-3" : log.includes("Complete") || log.includes("Success") ? "text-emerald-400 font-bold" : "text-zinc-400"}>
                      {log}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-2 text-zinc-500 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-ping"></span>
                      <span>Execution in progress...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success URL Banner */}
            {successData && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 rounded-xl p-4 flex items-start space-x-3 shadow-sm">
                <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20" />
                <div className="space-y-2 flex-1">
                  <div>
                    <h5 className="text-xs font-bold text-white">Synchronization Successful</h5>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      All files have been cleanly synchronized. You can review the commit node directly on GitHub origin server.
                    </p>
                  </div>
                  {successData.url && (
                    <a 
                      href={successData.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center text-xs font-bold text-[var(--accent)] hover:underline"
                    >
                      <span>View Commit on GitHub</span>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
