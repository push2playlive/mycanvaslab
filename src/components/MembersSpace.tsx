import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  User, CreditCard, TrendingUp, History, Sparkles, Zap, Award, Check, 
  CheckCircle2, DollarSign, Flame, Shield, BarChart3, Activity, 
  ChevronRight, ArrowUpRight, HelpCircle, Mail, Briefcase, Info, RefreshCw,
  Camera, Cpu, Image as ImageIcon, Link as LinkIcon, Video, VideoOff, AlertCircle
} from "lucide-react";
import { VirtualFile } from "../types";

interface MembersSpaceProps {
  files: VirtualFile[];
}

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  company: string;
  avatar: string;
  streak: number;
  joinDate: string;
}

interface CreditLog {
  id: string;
  task: string;
  model: string;
  credits: number;
  time: string;
  status: "success" | "cached" | "failed";
}

interface PaymentSimState {
  isOpen: boolean;
  tierName: string;
  price: string;
  creditsToAdd: number;
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
  isProcessing: boolean;
  isSuccess: boolean;
}

export const MembersSpace: React.FC<MembersSpaceProps> = ({ files }) => {
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "credits" | "pricing">("profile");
  
  // Profile state with local persistence
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem("members_profile");
    if (saved) return JSON.parse(saved);
    return {
      name: "Cyber Alchemist",
      email: "push2playlive@gmail.com",
      bio: "Crafting modern full-stack canvas applications with Gemini and React. Obsessed with high-performance layouts.",
      company: "MyCanvasLab Studios",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
      streak: 7,
      joinDate: "July 2026",
    };
  });

  // Tier State (Free / Pro / Elite)
  const [currentTier, setCurrentTier] = useState<"free" | "pro" | "elite">(() => {
    return (localStorage.getItem("members_tier") as "free" | "pro" | "elite") || "pro";
  });

  // Credit balance tracking
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem("members_credits_balance");
    if (saved) return parseInt(saved);
    return currentTier === "free" ? 150 : currentTier === "pro" ? 750 : 2500;
  });

  // Keep starting credits based on tier
  const maxCredits = useMemo(() => {
    return currentTier === "free" ? 200 : currentTier === "pro" ? 1000 : 3000;
  }, [currentTier]);

  // Credit Log History
  const [creditLogs, setCreditLogs] = useState<CreditLog[]>(() => {
    const saved = localStorage.getItem("members_credit_logs");
    if (saved) return JSON.parse(saved);
    return [
      { id: "log-1", task: "Generate full-stack router blueprint", model: "Gemini 3.5 Flash", credits: 12, time: "10 mins ago", status: "success" },
      { id: "log-2", task: "TypeScript compiler linter audit", model: "Gemini 3.5 Flash", credits: 4, time: "25 mins ago", status: "success" },
      { id: "log-3", task: "Optimize Resizable Panel constraints", model: "Gemini 3.5 Flash", credits: 8, time: "1 hour ago", status: "success" },
      { id: "log-4", task: "Verify Local Storage hydration safety", model: "Local Model", credits: 0, time: "2 hours ago", status: "cached" },
      { id: "log-5", task: "Interactive custom theme generator", model: "Gemini 3.5 Flash", credits: 15, time: "Yesterday", status: "success" },
      { id: "log-6", task: "Vite build system configuration", model: "Gemini 3.5 Flash", credits: 10, time: "Yesterday", status: "success" },
      { id: "log-7", task: "Layout CSS fix for absolute container", model: "Gemini 3.5 Flash", credits: 5, time: "3 days ago", status: "success" },
    ];
  });

  // Checkout modal simulator state
  const [paymentState, setPaymentState] = useState<PaymentSimState>({
    isOpen: false,
    tierName: "",
    price: "",
    creditsToAdd: 0,
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    isProcessing: false,
    isSuccess: false,
  });

  // Feedback notifications
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Camera and AI Generation States
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [aiPrompt, setAiPrompt] = useState("cyberpunk hacker owl with neon goggles");
  const [selectedStyle, setSelectedStyle] = useState("Neon Synthwave");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // AI Generated Options State
  const [aiOptions, setAiOptions] = useState<string[]>(() => {
    const saved = localStorage.getItem("members_ai_options");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);

  // Active sub-method for Profile Avatar Studio: "presets" | "ai" | "camera" | "url"
  const [avatarMethod, setAvatarMethod] = useState<"presets" | "ai" | "camera" | "url">("ai");

  const styleSuffixes: Record<string, string> = {
    "Neon Synthwave": ", futuristic synthwave theme, vibrant neon glow, dark background",
    "Cyberpunk Hologram": ", glowing hologram cyber tech icon, digital grid, matrix style",
    "Retro Pixel Art": ", high quality game-art style pixel art, 8-bit stylized character, dark aesthetic",
    "Minimal Abstract": ", clean minimalist vector logo design, geometric lines, flat colors",
    "Organic Biotech": ", bio-luminescent alien botanical illustration, deep forest green and glowing gold"
  };

  // Stop camera helper
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start camera helper
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 300, height: 300, facingMode: "user" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(err.name === "NotAllowedError" 
        ? "Permission denied. Please grant camera access in your browser or metadata.json configuration." 
        : err.message || "Could not access webcam. Please check permissions."
      );
    }
  };

  // Capture frame
  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL("image/png");
        setProfile(prev => ({ ...prev, avatar: dataUrl }));
        stopCamera();
      }
    }
  };

  const handleGenerateAIAvatar = async () => {
    setIsGenerating(true);
    setAiError(null);
    setSelectedOptionIdx(null);

    // deduct credits
    if (credits < 15) {
      setAiError("Insufficient credits. Upgrade your plan or replenish quota in the Credit Tracking tab!");
      setIsGenerating(false);
      return;
    }

    try {
      const baseStyle = styleSuffixes[selectedStyle] || "";
      const prompt1 = `${aiPrompt}${baseStyle}, bold details, option 1`;
      const prompt2 = `${aiPrompt}${baseStyle}, subtle neon highlights, option 2`;
      const prompt3 = `${aiPrompt}${baseStyle}, stylized modern aesthetic, option 3`;

      const fetchOption = async (promptText: string) => {
        const response = await fetch("/api/ai/generate-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: promptText })
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || "Failed to generate SVG avatar option.");
        }

        const data = await response.json();
        if (!data.svg || !data.svg.includes("<svg")) {
          throw new Error("Invalid SVG response from avatar generator model.");
        }
        return data.svg;
      };

      // Fetch 3 options in parallel
      const results = await Promise.all([
        fetchOption(prompt1),
        fetchOption(prompt2),
        fetchOption(prompt3)
      ]);

      setAiOptions(results);
      // Automatically select the first generated option as active
      setProfile(prev => ({ ...prev, avatar: results[0] }));
      setSelectedOptionIdx(0);
      setCredits(prev => Math.max(0, prev - 15));

      // Add transaction history log
      const newLog: CreditLog = {
        id: `ai-avatar-${Date.now()}`,
        task: `AI Avatar Suite: "${aiPrompt}" (3 Custom Options Synthesized)`,
        model: "Gemini 2.5 Flash",
        credits: 15,
        time: "Just now",
        status: "success",
      };
      setCreditLogs(prev => [newLog, ...prev]);

    } catch (err: any) {
      console.error("AI Avatar Error:", err);
      setAiError(err.message || "An error occurred during synthesis. Please verify your settings or bring your own API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Clean up camera stream on unmount or tab switch
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Save changes automatically to local storage
  useEffect(() => {
    localStorage.setItem("members_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("members_tier", currentTier);
  }, [currentTier]);

  useEffect(() => {
    localStorage.setItem("members_credits_balance", credits.toString());
  }, [credits]);

  useEffect(() => {
    localStorage.setItem("members_credit_logs", JSON.stringify(creditLogs));
  }, [creditLogs]);

  useEffect(() => {
    localStorage.setItem("members_ai_options", JSON.stringify(aiOptions));
  }, [aiOptions]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Saving changes...");
    setTimeout(() => {
      setSaveStatus("Profile successfully updated!");
      setTimeout(() => setSaveStatus(null), 2500);
    }, 800);
  };

  const handleOpenCheckout = (tier: "free" | "pro" | "elite", price: string, creditsAmount: number) => {
    if (tier === "free") {
      setCurrentTier("free");
      setCredits(Math.min(credits, 200));
      return;
    }
    setPaymentState({
      isOpen: true,
      tierName: tier.toUpperCase(),
      price,
      creditsToAdd: creditsAmount,
      cardNumber: "",
      cardName: profile.name,
      expiry: "",
      cvv: "",
      isProcessing: false,
      isSuccess: false,
    });
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentState(prev => ({ ...prev, isProcessing: true }));
    
    setTimeout(() => {
      setPaymentState(prev => ({ ...prev, isProcessing: false, isSuccess: true }));
      
      // Update balance & tier
      const selectedTier = paymentState.tierName.toLowerCase() as "free" | "pro" | "elite";
      setCurrentTier(selectedTier);
      
      const addedCredits = paymentState.creditsToAdd;
      setCredits(prev => Math.min(prev + addedCredits, selectedTier === "pro" ? 1000 : 3000));
      
      // Add transaction history log
      const newLog: CreditLog = {
        id: `purchase-${Date.now()}`,
        task: `Purchased ${paymentState.tierName} Plan upgrade`,
        model: "Transaction",
        credits: -addedCredits, // represents deposit visually or credit injection
        time: "Just now",
        status: "success",
      };
      setCreditLogs(prev => [newLog, ...prev]);
    }, 1500);
  };

  // Static stats computed on files list
  const codeStats = useMemo(() => {
    let size = 0;
    files.forEach(f => {
      size += (f.content || "").length;
    });
    return {
      filesCount: files.length,
      approxSizeKb: (size / 1024).toFixed(1)
    };
  }, [files]);

  return (
    <div className="space-y-6 text-[#ecfdf5]">
      {/* Dynamic Header */}
      <div className="bg-[#020502]/80 backdrop-blur border border-[#1ae854]/12 p-6 rounded-2xl green-glow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/25">
              MEMBERS PORTAL
            </span>
            <div className="flex items-center text-xs text-amber-400 font-bold gap-1">
              <Flame className="h-4 w-4 fill-amber-500 animate-pulse" />
              <span>{profile.streak} Day Streak!</span>
            </div>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
            <User className="h-5 w-5 text-[#1ae854]" />
            WELCOME BACK, {profile.name.toUpperCase()}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage your account profiles, live credit telemetry, and cloud developer pricing plans.
          </p>
        </div>

        {/* Real-time credits ticker */}
        <div className="bg-black/40 border border-[#1ae854]/10 rounded-xl p-3 flex items-center gap-4">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Credits Remaining</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white font-mono">{credits}</span>
              <span className="text-xs text-zinc-500 font-mono">/ {maxCredits}</span>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-[#1ae854]/12" />
          <div className="space-y-1">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
              currentTier === "elite" 
                ? "bg-purple-950/40 text-purple-400 border border-purple-900/40"
                : currentTier === "pro" 
                  ? "bg-cyan-950/40 text-cyan-400 border border-cyan-900/40"
                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}>
              {currentTier} tier
            </span>
            <button 
              onClick={() => setActiveSubTab("pricing")}
              className="block text-[9px] text-[#1ae854] hover:underline font-bold text-left cursor-pointer"
            >
              Upgrade Plan →
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex border-b border-[#1ae854]/12 pb-px">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
              activeSubTab === "profile"
                ? "border-[#1ae854] text-[#1ae854] bg-[#1ae854]/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Dashboard & Profile
          </button>
          <button
            onClick={() => setActiveSubTab("credits")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
              activeSubTab === "credits"
                ? "border-[#1ae854] text-[#1ae854] bg-[#1ae854]/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Credit Tracking
          </button>
          <button
            onClick={() => setActiveSubTab("pricing")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
              activeSubTab === "pricing"
                ? "border-[#1ae854] text-[#1ae854] bg-[#1ae854]/5"
                : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Pricing & Upgrade
          </button>
        </div>
      </div>

      {/* Main Sections */}
      {activeSubTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Left Column: Stats Cards & Badges */}
          <div className="lg:col-span-4 space-y-6">
            {/* User Avatar Card */}
            <div className="bg-[#020502]/60 border border-[#1ae854]/12 p-5 rounded-2xl flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#1ae854] to-emerald-500 opacity-60 blur-md group-hover:opacity-85 transition-opacity" />
                {profile.avatar.startsWith("<svg") ? (
                  <div 
                    className="w-24 h-24 rounded-full overflow-hidden border-2 border-black relative bg-[#010a03] flex items-center justify-center p-1.5 [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:text-[#1ae854]"
                    dangerouslySetInnerHTML={{ __html: profile.avatar }}
                  />
                ) : (
                  <img 
                    src={profile.avatar} 
                    alt="Avatar" 
                    className="w-24 h-24 rounded-full object-cover relative border-2 border-black bg-zinc-900"
                  />
                )}
                <span className="absolute bottom-1 right-1 p-1 bg-black rounded-full border border-[#1ae854]/40 text-[#1ae854]" title="Verified Active Account">
                  <Award className="h-4 w-4" />
                </span>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">{profile.name}</h3>
                <p className="text-xs text-[#1ae854] font-mono">{profile.company}</p>
                <p className="text-[11px] text-zinc-500 font-mono">Member since {profile.joinDate}</p>
              </div>

              <div className="w-full h-[1px] bg-[#1ae854]/10" />

              <div className="w-full grid grid-cols-2 gap-2 text-left">
                <div className="bg-black/30 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">Active Plan</span>
                  <span className="text-xs font-bold text-white uppercase">{currentTier}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">Workspace Files</span>
                  <span className="text-xs font-bold text-white font-mono">{codeStats.filesCount}</span>
                </div>
              </div>
            </div>

            {/* Platform Security Status */}
            <div className="bg-[#020502]/60 border border-[#1ae854]/12 p-5 rounded-2xl space-y-3">
              <h4 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" /> Account Security
              </h4>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Your workspace is isolated within an encrypted sandbox container. API communication keys are routed securely on host servers.
              </p>
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs p-2 bg-black/40 rounded-lg border border-zinc-900">
                  <span className="text-zinc-400">Sandbox Isolation</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> High
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 bg-black/40 rounded-lg border border-zinc-900">
                  <span className="text-zinc-400">Session Keys</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Encrypted
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editable Profile Settings */}
          <div className="lg:col-span-8 bg-[#020502]/60 border border-[#1ae854]/12 rounded-2xl p-6">
            <h3 className="text-xs font-black text-white tracking-widest uppercase border-b border-[#1ae854]/10 pb-3 mb-5 flex items-center justify-between">
              <span>MEMBER PROFILE DETAILS</span>
              <span className="text-[9px] font-mono text-zinc-500">Edit and Update</span>
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Developer Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-[#1ae854]/40" />
                    <input 
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Contact Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#1ae854]/40" />
                    <input 
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile({...profile, email: e.target.value})}
                      className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Company / Studio</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-[#1ae854]/40" />
                    <input 
                      type="text"
                      value={profile.company}
                      onChange={e => setProfile({...profile, company: e.target.value})}
                      className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Developer Biography</label>
                <textarea 
                  rows={4}
                  value={profile.bio}
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  className="w-full bg-[#050705] border border-[#1ae854]/15 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Profile Avatar Studio Card */}
              <div className="bg-black/50 border border-[#1ae854]/15 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1ae854]/10 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#1ae854] animate-pulse" />
                      PROFILE AVATAR STUDIO
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Configure your custom image or vector representation</p>
                  </div>

                  {/* Avatar Method Toggles */}
                  <div className="flex bg-black/60 p-0.5 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => { stopCamera(); setAvatarMethod("ai"); }}
                      className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1 ${
                        avatarMethod === "ai"
                          ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/20"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Cpu className="h-2.5 w-2.5" /> AI Gen
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAvatarMethod("camera"); startCamera(); }}
                      className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1 ${
                        avatarMethod === "camera"
                          ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/20"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Camera className="h-2.5 w-2.5" /> Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => { stopCamera(); setAvatarMethod("presets"); }}
                      className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1 ${
                        avatarMethod === "presets"
                          ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/20"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <ImageIcon className="h-2.5 w-2.5" /> Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => { stopCamera(); setAvatarMethod("url"); }}
                      className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1 ${
                        avatarMethod === "url"
                          ? "bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/20"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <LinkIcon className="h-2.5 w-2.5" /> Link
                    </button>
                  </div>
                </div>

                {/* Sub-Panels */}
                {avatarMethod === "ai" && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">AI Prompts (e.g., owl, cat, avatar)</label>
                        <input 
                          type="text"
                          value={aiPrompt}
                          onChange={e => setAiPrompt(e.target.value)}
                          className="w-full bg-[#050705] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors"
                          placeholder="e.g. steampunk developer cyber owl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Creative Visual Style</label>
                        <select 
                          value={selectedStyle}
                          onChange={e => setSelectedStyle(e.target.value)}
                          className="w-full bg-[#050705] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors cursor-pointer"
                        >
                          <option value="Neon Synthwave">Neon Synthwave (Glowing Cyber)</option>
                          <option value="Cyberpunk Hologram">Cyberpunk Hologram (Matrix Grid)</option>
                          <option value="Retro Pixel Art">Retro Pixel Art (8-bit Classic)</option>
                          <option value="Minimal Abstract">Minimal Abstract (Geometric Vector)</option>
                          <option value="Organic Biotech">Organic Biotech (Bioluminescence)</option>
                        </select>
                      </div>
                    </div>

                    {aiError && (
                      <div className="bg-red-950/40 border border-red-900/40 p-3 rounded-lg text-xs text-red-400 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{aiError}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="text-[10px] text-zinc-500 font-mono">
                        ⚡ AI Query cost: <span className="text-amber-400 font-bold">15 credits</span> (will deduct from balance)
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateAIAvatar}
                        disabled={isGenerating || !aiPrompt.trim()}
                        className="px-4 py-2 bg-[#1ae854] hover:bg-[#15cf4a] disabled:opacity-40 text-black text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 cursor-pointer transition"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            SYNTHESIZING OPTIONS...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" />
                            GENERATE MULTIPLE OPTIONS
                          </>
                        )}
                      </button>
                    </div>

                    {aiOptions.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-[#1ae854]/10 animate-fadeIn">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                          Select from generated options
                        </span>
                        <div className="grid grid-cols-3 gap-3">
                          {aiOptions.map((svg, idx) => {
                            const isSelected = profile.avatar === svg || selectedOptionIdx === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedOptionIdx(idx);
                                  setProfile(prev => ({ ...prev, avatar: svg }));
                                }}
                                className={`aspect-square rounded-2xl overflow-hidden border-2 p-2 relative bg-[#010a03] flex items-center justify-center cursor-pointer transition-all hover:scale-105 duration-250 ${
                                  isSelected
                                    ? "border-[#1ae854] ring-2 ring-[#1ae854]/20 shadow-lg shadow-[#1ae854]/10"
                                    : "border-zinc-800 hover:border-zinc-750"
                                }`}
                              >
                                <div 
                                  className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:text-[#1ae854]"
                                  dangerouslySetInnerHTML={{ __html: svg }}
                                />
                                {isSelected && (
                                  <div className="absolute top-1.5 right-1.5 bg-[#1ae854] text-black rounded-full p-0.5">
                                    <Check className="h-2.5 w-2.5 stroke-[4]" />
                                  </div>
                                )}
                                <span className="absolute bottom-1.5 left-1.5 text-[8px] font-bold text-zinc-500 font-mono bg-black/80 px-1 py-0.5 rounded border border-zinc-800">
                                  OPTION {idx + 1}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {avatarMethod === "camera" && (
                  <div className="space-y-4 text-center animate-fadeIn py-2">
                    {isCameraActive ? (
                      <div className="space-y-4">
                        <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden border-2 border-[#1ae854]/40 bg-black">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {cameraError && (
                          <div className="bg-red-950/40 border border-red-900/40 p-3 rounded-lg text-xs text-red-400 flex items-start justify-center gap-2 max-w-sm mx-auto">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{cameraError}</span>
                          </div>
                        )}

                        <div className="flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
                          >
                            Close Camera
                          </button>
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-4 py-1.5 bg-[#1ae854] hover:bg-[#15cf4a] text-black text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-lg"
                          >
                            <Camera className="h-3.5 w-3.5" /> CAPTURE SNAPSHOT
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#1ae854]/10 flex items-center justify-center text-[#1ae854] border border-[#1ae854]/20 animate-pulse">
                          <Video className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-white uppercase">REALT-TIME WEBCAM SNAP</h5>
                          <p className="text-[10px] text-zinc-500 max-w-sm">Capture and frame a fresh portrait instantly within your local sandbox environment.</p>
                        </div>
                        {cameraError && (
                          <div className="bg-red-950/40 border border-red-900/40 p-3 rounded-lg text-xs text-red-400 flex items-start justify-center gap-2 max-w-sm mx-auto">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{cameraError}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-2 bg-[#1ae854]/15 hover:bg-[#1ae854]/25 border border-[#1ae854]/30 text-[#1ae854] text-[10px] font-black uppercase tracking-widest rounded-lg transition cursor-pointer"
                        >
                          ACTIVATE CAMERA STREAM
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {avatarMethod === "presets" && (
                  <div className="space-y-3 animate-fadeIn">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Select Developer Preset</span>
                    <div className="flex gap-4">
                      {[
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
                        "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&w=150&q=80",
                        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=150&q=80",
                        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=150&q=80"
                      ].map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProfile({...profile, avatar: url})}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition hover:scale-105 cursor-pointer bg-zinc-900 ${
                            profile.avatar === url ? "border-[#1ae854] scale-105 shadow-md shadow-[#1ae854]/10" : "border-zinc-850"
                          }`}
                        >
                          <img src={url} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {avatarMethod === "url" && (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Custom Image Link</label>
                    <input 
                      type="text"
                      value={profile.avatar.startsWith("<svg") ? "" : profile.avatar}
                      onChange={e => setProfile({...profile, avatar: e.target.value})}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full bg-[#050705] border border-zinc-850 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-[#1ae854]/10">
                <div className="text-[10px] text-zinc-500 font-mono">
                  Saved automatically to sandbox local cache
                </div>
                <div className="flex items-center gap-3">
                  {saveStatus && (
                    <span className="text-xs text-[#1ae854] font-bold animate-pulse">{saveStatus}</span>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1ae854] hover:bg-[#15cf4a] text-black font-black uppercase text-[10px] tracking-wider rounded-lg shadow-md transition-transform hover:scale-[1.02] active:scale-100 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSubTab === "credits" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Real-time Meter & SVG Chart (5/12 width) */}
          <div className="lg:col-span-5 bg-[#020502]/60 border border-[#1ae854]/12 rounded-2xl p-5 space-y-6">
            <h3 className="text-xs font-black text-white tracking-widest uppercase border-b border-[#1ae854]/10 pb-3 flex items-center justify-between">
              <span>CREDIT USAGE BREAKDOWN</span>
              <Activity className="h-4 w-4 text-[#1ae854]" />
            </h3>

            {/* Custom SVG Credit Gauge */}
            <div className="flex flex-col items-center justify-center py-4 relative">
              <svg className="w-44 h-44 transform -rotate-90">
                <circle 
                  cx="88" 
                  cy="88" 
                  r="74" 
                  stroke="rgba(26, 232, 84, 0.05)" 
                  strokeWidth="10" 
                  fill="none" 
                />
                <circle 
                  cx="88" 
                  cy="88" 
                  r="74" 
                  stroke="#1ae854" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray={2 * Math.PI * 74}
                  strokeDashoffset={2 * Math.PI * 74 * (1 - credits / maxCredits)}
                  className="transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-white font-mono leading-none">{credits}</span>
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1.5">Credits Left</span>
                <span className="text-[10px] text-[#1ae854] font-mono mt-0.5">
                  {((credits / maxCredits) * 100).toFixed(0)}% quota
                </span>
              </div>
            </div>

            {/* Simulated Model Allocations */}
            <div className="space-y-3">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Model Allocation Ratio</span>
              
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Gemini 3.5 Flash (Editor AI)</span>
                    <span className="text-white font-bold">85% (620 credits)</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1ae854] rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Localhost Ollama Node</span>
                    <span className="text-white font-bold">15% (110 credits)</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: "15%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Fast Quick Top-Up Banner */}
            <div className="bg-black/40 border border-zinc-900 rounded-xl p-4 space-y-2.5">
              <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider block">Need Extra Credits?</span>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Replenish credits instantly. Get +500 credits to continue long-form software generation tasks.
              </p>
              <button 
                onClick={() => setActiveSubTab("pricing")}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#1ae854]/10 hover:bg-[#1ae854]/20 border border-[#1ae854]/20 text-[#1ae854] text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
              >
                Purchase Add-ons <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Detailed Generation Log table (7/12 width) */}
          <div className="lg:col-span-7 bg-[#020502]/60 border border-[#1ae854]/12 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1ae854]/10 pb-3">
              <h3 className="text-xs font-black text-white tracking-widest uppercase flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-[#1ae854]" />
                TELEMETRY RECENT ACTIVITY LOGS
              </h3>
              <button 
                onClick={() => {
                  setCredits(maxCredits);
                  const clearLog: CreditLog = {
                    id: `reset-${Date.now()}`,
                    task: "Reset and Replenished default credits quota",
                    model: "System",
                    credits: 0,
                    time: "Just now",
                    status: "success",
                  };
                  setCreditLogs(prev => [clearLog, ...prev]);
                }}
                className="p-1 bg-[#1ae854]/5 hover:bg-[#1ae854]/15 text-[#1ae854] border border-[#1ae854]/15 rounded"
                title="Reset Credit Simulator Data"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1ae854]/5 text-zinc-500 uppercase tracking-wider text-[9px] font-bold">
                    <th className="pb-2.5">Pipeline Task</th>
                    <th className="pb-2.5">LLM Model</th>
                    <th className="pb-2.5 text-center">Cost</th>
                    <th className="pb-2.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {creditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-950/20 transition-colors">
                      <td className="py-2.5 pr-2">
                        <div className="flex items-start gap-1.5 min-w-[150px]">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            log.credits > 10 ? "bg-amber-400" : log.credits === 0 ? "bg-cyan-400" : "bg-[#1ae854]"
                          }`} />
                          <span className="text-zinc-200 font-bold truncate block max-w-[200px]" title={log.task}>
                            {log.task}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-[10px] text-zinc-400">
                        {log.model}
                      </td>
                      <td className="py-2.5 text-center font-mono font-bold">
                        {log.credits === 0 ? (
                          <span className="text-cyan-400 px-1 bg-cyan-950/20 rounded border border-cyan-900/30">Free</span>
                        ) : log.credits < 0 ? (
                          <span className="text-emerald-400">+{Math.abs(log.credits)}</span>
                        ) : (
                          <span className="text-amber-400">-{log.credits} cr</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-mono text-[10px] text-zinc-500">
                        {log.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-black/20 p-3 rounded-lg border border-zinc-900 flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <p className="text-[10px] text-zinc-500">
                AI requests trigger Gemini API queries. A complex code synthesis takes approx. 10-15 credits, while small edits consume 3-5 credits.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "pricing" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Simple Interactive Slider for Volume Calculator */}
          <div className="bg-[#020502]/60 border border-[#1ae854]/12 p-5 rounded-2xl space-y-4">
            <h4 className="text-xs font-black tracking-widest text-white uppercase flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#1ae854]" /> Interactive Credit Calculator
            </h4>
            <p className="text-xs text-zinc-400">
              Adjust the slider to simulate custom quota needs and see direct pricing configurations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-2">
                <input 
                  type="range" 
                  min="200" 
                  max="5000" 
                  step="100" 
                  defaultValue="1500" 
                  id="credits-range"
                  className="w-full accent-[#1ae854] bg-zinc-900 h-2 rounded-lg cursor-pointer"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    const cost = (val * 0.01).toFixed(2);
                    const sliderValueEl = document.getElementById("slider-value");
                    const sliderCostEl = document.getElementById("slider-cost");
                    if (sliderValueEl) sliderValueEl.innerText = val.toLocaleString();
                    if (sliderCostEl) sliderCostEl.innerText = `$${cost}`;
                  }}
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>200 credits</span>
                  <span>2,500 credits</span>
                  <span>5,000 credits</span>
                </div>
              </div>
              <div className="md:col-span-4 bg-black/50 p-4 rounded-xl border border-zinc-900 text-center">
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Simulated Estimate</p>
                <p className="text-2xl font-black text-white font-mono mt-1" id="slider-value">1,500</p>
                <p className="text-xs text-[#1ae854] font-mono mt-0.5 font-bold" id="slider-cost">$15.00/mo</p>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Tier */}
            <div className="bg-[#020502]/60 border border-[#1ae854]/12 hover:border-[#1ae854]/30 rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-white">Starter</h3>
                    <p className="text-xs text-zinc-500 mt-1">For hobbyists and explorers</p>
                  </div>
                  {currentTier === "free" && (
                    <span className="bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/20 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">$0</span>
                  <span className="text-zinc-500 text-xs">/ forever</span>
                </div>

                <div className="w-full h-[1px] bg-zinc-900" />

                <ul className="space-y-2 text-xs">
                  {[
                    "200 Monthly Credits Quota",
                    "Standard Gemini 3.5 Flash Model access",
                    "Standard 3-Column workspace editor",
                    "Local host Ollama proxy orchestration",
                    "Single-session code preview"
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-zinc-400">
                      <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  disabled={currentTier === "free"}
                  onClick={() => handleOpenCheckout("free", "0", 200)}
                  className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition border ${
                    currentTier === "free"
                      ? "bg-transparent border-zinc-800 text-zinc-500 cursor-default"
                      : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  }`}
                >
                  {currentTier === "free" ? "Active Plan" : "Downgrade to Free"}
                </button>
              </div>
            </div>

            {/* Pro Tier (Recommended) */}
            <div className="bg-[#020502]/80 border-2 border-[#1ae854] rounded-2xl p-6 flex flex-col justify-between relative shadow-xl shadow-[#1ae854]/5 transition-all duration-300">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1ae854] text-black text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                Recommended Choice
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start mt-2">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#1ae854]">PRO BLUEPRINT</h3>
                    <p className="text-xs text-zinc-400 mt-1">For active developers and builders</p>
                  </div>
                  {currentTier === "pro" && (
                    <span className="bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/25 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">$15</span>
                  <span className="text-zinc-500 text-xs">/ month</span>
                </div>

                <div className="w-full h-[1px] bg-[#1ae854]/12" />

                <ul className="space-y-2 text-xs">
                  {[
                    "1,000 High-Speed Monthly Credits",
                    "Advanced Gemini 3.5 Flash Model capabilities",
                    "High-performance custom code search & replace",
                    "Git Version Control Sandbox",
                    "Local Storage persistent cache engine",
                    "Priority support queue with 1-hr SLAs"
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-zinc-300">
                      <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0 animate-pulse-soft" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  disabled={currentTier === "pro"}
                  onClick={() => handleOpenCheckout("pro", "15.00", 1000)}
                  className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                    currentTier === "pro"
                      ? "bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/25 cursor-default"
                      : "bg-[#1ae854] hover:bg-[#15cf4a] text-black shadow-lg shadow-[#1ae854]/15 cursor-pointer"
                  }`}
                >
                  {currentTier === "pro" ? "Active Plan" : "Upgrade to Pro"}
                </button>
              </div>
            </div>

            {/* Elite / Enterprise Tier */}
            <div className="bg-[#020502]/60 border border-[#1ae854]/12 hover:border-[#1ae854]/30 rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-purple-400">ELITE CORE</h3>
                    <p className="text-xs text-zinc-500 mt-1">For heavy code synthesis operations</p>
                  </div>
                  {currentTier === "elite" && (
                    <span className="bg-purple-950/40 text-purple-400 border border-purple-900/40 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">$29</span>
                  <span className="text-zinc-500 text-xs">/ month</span>
                </div>

                <div className="w-full h-[1px] bg-zinc-900" />

                <ul className="space-y-2 text-xs">
                  {[
                    "3,000 High-Speed Monthly Credits",
                    "Premium model configurations",
                    "Unlimited background tests and build checks",
                    "Custom team sync channels and dashboards",
                    "Dedicated engineering partner SLAs",
                    "Exclusive preview access to features"
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-zinc-400">
                      <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <button
                  disabled={currentTier === "elite"}
                  onClick={() => handleOpenCheckout("elite", "29.00", 3000)}
                  className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition border ${
                    currentTier === "elite"
                      ? "bg-transparent border-purple-950 text-purple-400 cursor-default"
                      : "bg-[#020502] hover:bg-zinc-950 text-[#1ae854] border border-[#1ae854]/25 cursor-pointer"
                  }`}
                >
                  {currentTier === "elite" ? "Active Plan" : "Upgrade to Elite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Payment Checkout Dialog Simulator */}
      {paymentState.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#020502] border border-[#1ae854]/25 rounded-2xl w-full max-w-md p-6 relative shadow-2xl shadow-black">
            <button
              onClick={() => setPaymentState(prev => ({ ...prev, isOpen: false }))}
              className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-200 cursor-pointer"
            >
              ✕
            </button>

            {!paymentState.isSuccess ? (
              <form onSubmit={handleProcessPayment} className="space-y-5">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1ae854] bg-[#1ae854]/10 border border-[#1ae854]/20 px-2.5 py-0.5 rounded-full">
                    STRIPE SECURE SANDBOX
                  </span>
                  <h3 className="text-lg font-black text-white mt-2">
                    Upgrade to {paymentState.tierName}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Entering a mock transaction. No real billing credentials needed.
                  </p>
                </div>

                <div className="bg-black/50 p-3 rounded-lg border border-zinc-900 text-xs font-mono flex justify-between items-center">
                  <span className="text-zinc-400">Total charge:</span>
                  <span className="text-[#1ae854] font-bold font-sans text-sm">${paymentState.price}/mo</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Cardholder Name</label>
                    <input 
                      type="text"
                      value={paymentState.cardName}
                      onChange={e => setPaymentState({...paymentState, cardName: e.target.value})}
                      className="w-full bg-[#050705] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Credit Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                      <input 
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={paymentState.cardNumber}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, "");
                          setPaymentState({...paymentState, cardNumber: digits.slice(0, 16)});
                        }}
                        className="w-full bg-[#050705] border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">Expiration Date</label>
                      <input 
                        type="text"
                        placeholder="MM/YY"
                        value={paymentState.expiry}
                        onChange={e => setPaymentState({...paymentState, expiry: e.target.value})}
                        className="w-full bg-[#050705] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">CVC / CVV</label>
                      <input 
                        type="password"
                        placeholder="•••"
                        value={paymentState.cvv}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, "");
                          setPaymentState({...paymentState, cvv: digits.slice(0, 3)});
                        }}
                        className="w-full bg-[#050705] border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#1ae854] transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentState(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 py-2 bg-transparent border border-zinc-800 hover:bg-zinc-900 text-zinc-400 text-xs font-bold uppercase rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentState.isProcessing}
                    className="flex-1 py-2 bg-[#1ae854] hover:bg-[#15cf4a] text-black text-xs font-black uppercase rounded-lg shadow-lg shadow-[#1ae854]/10 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {paymentState.isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        PROCESSING...
                      </>
                    ) : (
                      "PAY & UPGRADE"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4 animate-scaleUp">
                <div className="w-16 h-16 bg-[#1ae854]/10 text-[#1ae854] rounded-full flex items-center justify-center mx-auto border border-[#1ae854]/30 animate-bounce">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-white">UPGRADE SUCCESSFUL!</h3>
                  <p className="text-xs text-zinc-400">
                    Your account has been promoted to the <span className="text-[#1ae854] font-bold">{paymentState.tierName}</span> plan.
                  </p>
                  <p className="text-xs text-[#1ae854] font-mono">
                    +{paymentState.creditsToAdd} Credits successfully injected into quota metrics!
                  </p>
                </div>

                <button
                  onClick={() => setPaymentState(prev => ({ ...prev, isOpen: false }))}
                  className="w-full py-2 bg-[#1ae854] hover:bg-[#15cf4a] text-black text-xs font-black uppercase rounded-lg shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                >
                  Go Back to Members Portal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
