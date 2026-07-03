import React, { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { 
  Check, Shield, Sparkles, TrendingUp, Zap, HelpCircle, ArrowUpRight, 
  CreditCard, Award, ChevronRight, RefreshCw, Cpu, Activity,
  Info, CheckCircle2, DollarSign, Terminal as TermIcon, Package, ShoppingBag, Flame, AlertCircle
} from "lucide-react";

interface CreditLog {
  id: string;
  task: string;
  model: string;
  credits: number;
  time: string;
  status: "success" | "cached" | "failed";
}

interface SimulatedAction {
  id: string;
  name: string;
  credits: number;
  description: string;
  icon: React.ReactNode;
  durationMs: number;
}

export default function PricingPage() {
  // Synchronized States from LocalStorage
  const [currentTier, setCurrentTier] = useState<"free" | "pro" | "elite" | "enterprise">(() => {
    const saved = localStorage.getItem("members_tier");
    if (saved === "elite") return "elite";
    if (saved === "free") return "free";
    return "pro"; // Default to pro
  });

  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem("members_credits_balance");
    if (saved) return parseInt(saved);
    return currentTier === "free" ? 150 : currentTier === "pro" ? 750 : 2500;
  });

  const [creditLogs, setCreditLogs] = useState<CreditLog[]>(() => {
    const saved = localStorage.getItem("members_credit_logs");
    if (saved) return JSON.parse(saved);
    return [
      { id: "pricing-log-1", task: "Interactive custom theme generator", model: "Gemini 3.5 Flash", credits: 15, time: "Yesterday", status: "success" },
      { id: "pricing-log-2", task: "Optimize Resizable Panel constraints", model: "Gemini 3.5 Flash", credits: 8, time: "Yesterday", status: "success" },
    ];
  });

  // Local Component States
  const [customTopupAmount, setCustomTopupAmount] = useState<number>(500);
  const [simulatedLog, setSimulatedLog] = useState<string[]>(["[SYSTEM] Standing by for usage simulation..."]);
  const [simulatingActionId, setSimulatingActionId] = useState<string | null>(null);
  
  // Checkout Modal State
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    type: "tier" | "topup";
    targetId: string;
    displayName: string;
    price: string;
    creditsToAdd: number;
    isProcessing: boolean;
    isSuccess: boolean;
    cardNumber: string;
    cardName: string;
    expiry: string;
    cvv: string;
    terminalLogs: string[];
  }>({
    isOpen: false,
    type: "tier",
    targetId: "",
    displayName: "",
    price: "",
    creditsToAdd: 0,
    isProcessing: false,
    isSuccess: false,
    cardNumber: "4242 •••• •••• 4242",
    cardName: "NEXUS DEVELOPER",
    expiry: "12/28",
    cvv: "137",
    terminalLogs: [],
  });

  // Synchronization with other tabs via standard LocalStorage
  useEffect(() => {
    localStorage.setItem("members_tier", currentTier === "elite" ? "elite" : currentTier);
    localStorage.setItem("members_credits_balance", credits.toString());
    localStorage.setItem("members_credit_logs", JSON.stringify(creditLogs));
  }, [currentTier, credits, creditLogs]);

  // Max Quota Tracker
  const maxCredits = useMemo(() => {
    if (currentTier === "free") return 200;
    if (currentTier === "pro") return 1000;
    return 3000;
  }, [currentTier]);

  // Credit Usage Simulation Actions List
  const simulationActions: SimulatedAction[] = [
    { id: "sim-1", name: "AI Avatar Synthesis", credits: 15, description: "Synthesize high-fidelity vector graphics using Gemini models", icon: <Sparkles className="h-4 w-4 text-emerald-400" />, durationMs: 1400 },
    { id: "sim-2", name: "TypeScript Compiler Linter Audit", credits: 4, description: "Scan workspace files for type completeness and imports", icon: <Cpu className="h-4 w-4 text-cyan-400" />, durationMs: 600 },
    { id: "sim-3", name: "Boilerplate App Scaffold Generator", credits: 12, description: "Deploy a ready-to-test starter repository with active routes", icon: <Package className="h-4 w-4 text-yellow-400" />, durationMs: 1800 },
    { id: "sim-4", name: "High Priority Queue Build", credits: 8, description: "Compile custom server routes and trigger hot-reload sandbox", icon: <Activity className="h-4 w-4 text-red-400" />, durationMs: 900 },
  ];

  // Simulator Engine
  const handleSimulateAction = async (action: SimulatedAction) => {
    if (credits < action.credits) {
      setSimulatedLog(prev => [
        ...prev,
        `[ERROR] Insufficient credit balance! Required: ${action.credits}, Available: ${credits}. Please purchase credit packages.`
      ]);
      return;
    }

    setSimulatingActionId(action.id);
    setSimulatedLog(prev => [
      ...prev,
      `[SIMULATION START] Initiating job: "${action.name}"`,
      `[PROCESSING] Allocating virtual pipeline resources...`,
    ]);

    await new Promise(resolve => setTimeout(resolve, action.durationMs));

    setCredits(prev => Math.max(0, prev - action.credits));
    
    const newLog: CreditLog = {
      id: `sim-log-${Date.now()}`,
      task: `[Simulation] Run "${action.name}"`,
      model: "Simulated Model",
      credits: action.credits,
      time: "Just now",
      status: "success"
    };

    setCreditLogs(prev => [newLog, ...prev]);
    setSimulatingActionId(null);
    setSimulatedLog(prev => [
      ...prev,
      `[SUCCESS] Job completed in ${(action.durationMs / 1000).toFixed(1)}s.`,
      `[BALANCING] Deducted ${action.credits} credits. Current balance: ${credits - action.credits} credits.`,
      `----------------------------------------`
    ]);
  };

  // Open Checkout Simulator helper
  const openCheckout = (
    type: "tier" | "topup",
    targetId: string,
    displayName: string,
    price: string,
    creditsToAdd: number
  ) => {
    setCheckoutModal({
      isOpen: true,
      type,
      targetId,
      displayName,
      price,
      creditsToAdd,
      isProcessing: false,
      isSuccess: false,
      cardNumber: "4242 8412 9003 4242",
      cardName: "NEXUS DEVELOPER",
      expiry: "12/28",
      cvv: "137",
      terminalLogs: [
        `[GATEWAY] Preparing terminal connection...`,
        `[READY] Standing by to securely authenticate payment for "${displayName}".`
      ]
    });
  };

  // Run terminal purchase sequence
  const handleProcessCheckout = async () => {
    setCheckoutModal(prev => ({ ...prev, isProcessing: true }));

    const steps = [
      `[TERMINAL] Initiating secure transaction pipeline via Stripe proxy...`,
      `[ENCRYPTION] Generating ephemeral public keys (AES-256 GCM)...`,
      `[CARD-ISSUER] Validating card credentials for "${checkoutModal.cardName}"...`,
      `[APPROVAL] Funds captured successfully. Authorized token: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      `[DATABASE] Injecting quota credits into persistent account container...`,
      `[COMPLETED] Handshake finalized. Ready to update state.`
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      setCheckoutModal(prev => ({
        ...prev,
        terminalLogs: [...prev.terminalLogs, steps[i]]
      }));
    }

    // Apply state changes on completion
    if (checkoutModal.type === "tier") {
      setCurrentTier(checkoutModal.targetId as any);
      // Give initial credits for switching plans
      setCredits(prev => prev + checkoutModal.creditsToAdd);
      
      const newLog: CreditLog = {
        id: `tier-change-${Date.now()}`,
        task: `Subscription Upgrade to: "${checkoutModal.displayName}" Plan`,
        model: "System Quota",
        credits: -checkoutModal.creditsToAdd, // positive addition shown differently or logs
        time: "Just now",
        status: "success"
      };
      setCreditLogs(prev => [newLog, ...prev]);

    } else {
      // Credit Package Topup
      setCredits(prev => prev + checkoutModal.creditsToAdd);
      
      const newLog: CreditLog = {
        id: `credit-topup-${Date.now()}`,
        task: `Purchased Credit Quota Topup (+${checkoutModal.creditsToAdd} Credits)`,
        model: "System Refill",
        credits: -checkoutModal.creditsToAdd,
        time: "Just now",
        status: "success"
      };
      setCreditLogs(prev => [newLog, ...prev]);
    }

    setCheckoutModal(prev => ({ ...prev, isProcessing: false, isSuccess: true }));
  };

  const currentPercent = Math.min(100, Math.round((credits / maxCredits) * 100));

  return (
    <div className="space-y-12">
      {/* Dynamic Quota Usage Banner (Bento-styled Header) */}
      <div className="bg-[#020502]/60 border border-[#1ae854]/15 rounded-3xl p-6 md:p-8 shadow-xl shadow-black relative overflow-hidden backdrop-blur">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#1ae854]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#1ae854]/10 text-[#1ae854] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#1ae854]/30">
                ACTIVE PIPELINE ACCOUNT
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1ae854] animate-ping" />
                Live Sync Active
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              CREDIT USAGE & SUBSCRIPTIONS
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Track your credit allocation, test the resource consumption via our interactive sandbox simulator, or switch between development tiers to increase priority compilation speeds.
            </p>
          </div>

          {/* Current Quota Indicator Grid */}
          <div className="w-full lg:w-auto bg-black/60 rounded-2xl border border-zinc-800 p-5 flex flex-col sm:flex-row items-center gap-6 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
            {/* Tier */}
            <div className="w-full sm:w-auto text-center sm:text-left sm:pr-6 space-y-1">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">CURRENT PLAN</span>
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <Award className={`h-4.5 w-4.5 ${currentTier === "elite" ? "text-purple-400" : currentTier === "pro" ? "text-cyan-400" : "text-zinc-500"}`} />
                <span className={`text-sm font-black uppercase tracking-wider ${
                  currentTier === "elite" ? "text-purple-400" : currentTier === "pro" ? "text-cyan-400" : "text-zinc-400"
                }`}>
                  {currentTier === "elite" ? "Enterprise Elite" : currentTier === "pro" ? "Pro Developer" : "Free Tier"}
                </span>
              </div>
              <span className="text-[9px] text-zinc-600 block">Renews in 24 days</span>
            </div>

            {/* Quota Gauge */}
            <div className="w-full sm:w-auto text-center sm:text-left sm:pl-6 space-y-2 pt-4 sm:pt-0">
              <div className="flex items-center justify-between gap-12">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">AVAILABLE PIPELINE CREDITS</span>
                <span className="text-xs font-mono font-bold text-[#1ae854]">{credits} / {maxCredits}</span>
              </div>
              
              <div className="w-full sm:w-64 h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-850 p-px relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${currentPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${
                    currentPercent > 70 
                      ? "from-emerald-500 to-[#1ae854]" 
                      : currentPercent > 30 
                        ? "from-amber-500 to-yellow-400" 
                        : "from-red-600 to-orange-500"
                  }`} 
                />
              </div>

              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-600">
                <span>0 Cr</span>
                <span>{currentPercent}% Capacity Quota</span>
                <span>{maxCredits} Cr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tier Cards Selection Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#1ae854]" />
            TIERED SUBSCRIPTION PLANS
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1">Scale up your resources instantly to access faster compile pipelines and more creative generative models</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FREE PLAN */}
          <div className={`rounded-3xl p-6 flex flex-col justify-between border relative transition hover:-translate-y-1 hover:shadow-lg duration-300 bg-black/40 ${
            currentTier === "free" ? "border-[#1ae854]/40 bg-[#1ae854]/5 shadow-xl shadow-[#1ae854]/5" : "border-zinc-800 hover:border-zinc-700"
          }`}>
            {currentTier === "free" && (
              <span className="absolute -top-3 left-6 px-3 py-1 bg-[#1ae854] text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-md">
                CURRENT ACTIVE PLAN
              </span>
            )}
            
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Sandbox Starter</span>
                <h4 className="text-xl font-black text-zinc-100 uppercase tracking-tight">Free Plan</h4>
                <p className="text-[10px] text-zinc-500 leading-normal min-h-[30px]">Perfect for exploring sandbox tools and testing basic components locally.</p>
              </div>

              <div className="flex items-baseline gap-1.5 border-t border-b border-zinc-800/60 py-4">
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">/ monthly</span>
              </div>

              {/* Resource Metrics badges */}
              <div className="space-y-2 bg-zinc-950/50 p-3.5 rounded-xl border border-zinc-900">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                  <span>Starter Credits:</span>
                  <span className="text-white font-bold">150 Credits</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                  <span>Quota Upper Limit:</span>
                  <span className="text-zinc-500">200 Credits</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                  <span>Pipeline Speed:</span>
                  <span className="text-zinc-500">Standard Queue</span>
                </div>
              </div>

              {/* Feature Checkpoints */}
              <ul className="space-y-2.5 text-[11px] text-zinc-400">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0" />
                  <span>Interactive Workspace Code Editor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0" />
                  <span>Webcam Portrait capture studio</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-600">
                  <span className="text-zinc-700 font-bold">×</span>
                  <span>AI Vector Avatar Generator (15 credits)</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-600">
                  <span className="text-zinc-700 font-bold">×</span>
                  <span>Custom theme palette builder</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {currentTier === "free" ? (
                <div className="w-full text-center py-2.5 bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/20 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  ACTIVE ON CONTAINER
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openCheckout("tier", "free", "Free Plan Switch", "$0", 0)}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer text-center"
                >
                  Downgrade to Free
                </button>
              )}
            </div>
          </div>

          {/* PRO PLAN - HERO VALUE */}
          <div className={`rounded-3xl p-6 flex flex-col justify-between border relative transition hover:-translate-y-1 hover:shadow-xl duration-300 bg-[#020502]/80 ${
            currentTier === "pro" 
              ? "border-[#1ae854] bg-[#1ae854]/5 shadow-xl shadow-[#1ae854]/10" 
              : "border-cyan-900/30 hover:border-cyan-500/30"
          }`}>
            <span className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-cyan-500 to-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
              POPULAR CHOICES
            </span>
            {currentTier === "pro" && (
              <span className="absolute -top-3 left-6 px-3 py-1 bg-[#1ae854] text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-md">
                CURRENT ACTIVE PLAN
              </span>
            )}

            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">NEXUS BUILDER</span>
                <h4 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  Pro Developer
                  <Flame className="h-4 w-4 text-orange-500" />
                </h4>
                <p className="text-[10px] text-zinc-400 leading-normal min-h-[30px]">Unlock rich creative assets, unlimited SVG generations and high capacity quotas.</p>
              </div>

              <div className="flex items-baseline gap-1.5 border-t border-b border-[#1ae854]/15 py-4">
                <span className="text-3xl font-black text-white">$29</span>
                <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">/ monthly</span>
              </div>

              {/* Resource Metrics badges */}
              <div className="space-y-2 bg-[#1ae854]/5 p-3.5 rounded-xl border border-[#1ae854]/12">
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-300">
                  <span>Plan Credits Quota:</span>
                  <span className="text-[#1ae854] font-bold">750 Credits</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-300">
                  <span>Quota Upper Limit:</span>
                  <span className="text-zinc-200">1,000 Credits</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-300">
                  <span>Pipeline Speed:</span>
                  <span className="text-cyan-400 font-bold">2x Accelerated</span>
                </div>
              </div>

              {/* Feature Checkpoints */}
              <ul className="space-y-2.5 text-[11px] text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0" />
                  <span>Interactive Workspace Code Editor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0" />
                  <span>Webcam Portrait capture studio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0" />
                  <span className="font-bold text-white">AI Avatar Generation Suite (3 options)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0" />
                  <span>Custom high-contrast theme editor</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {currentTier === "pro" ? (
                <div className="w-full text-center py-2.5 bg-[#1ae854]/10 text-[#1ae854] border border-[#1ae854]/20 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  ACTIVE ON CONTAINER
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openCheckout("tier", "pro", "Pro Developer Plan Upgrade", "$29.00", 750)}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer text-center shadow-lg shadow-cyan-500/5"
                >
                  Upgrade to Pro ($29/mo)
                </button>
              )}
            </div>
          </div>

          {/* ELITE PLAN */}
          <div className={`rounded-3xl p-6 flex flex-col justify-between border relative transition hover:-translate-y-1 hover:shadow-lg duration-300 bg-black/40 ${
            currentTier === "elite" ? "border-purple-500/40 bg-purple-950/5 shadow-xl shadow-purple-500/5" : "border-zinc-800 hover:border-zinc-700"
          }`}>
            {currentTier === "elite" && (
              <span className="absolute -top-3 left-6 px-3 py-1 bg-purple-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-md">
                CURRENT ACTIVE PLAN
              </span>
            )}

            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">ENTERPRISE SCALE</span>
                <h4 className="text-xl font-black text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  Enterprise Elite
                  <Sparkles className="h-4 w-4 text-purple-400" />
                </h4>
                <p className="text-[10px] text-zinc-500 leading-normal min-h-[30px]">Complete design control, unlimited serverless instances, dedicated priority queues.</p>
              </div>

              <div className="flex items-baseline gap-1.5 border-t border-b border-zinc-800/60 py-4">
                <span className="text-3xl font-black text-white">$99</span>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">/ monthly</span>
              </div>

              {/* Resource Metrics badges */}
              <div className="space-y-2 bg-purple-950/20 p-3.5 rounded-xl border border-purple-900/30">
                <div className="flex justify-between items-center text-[10px] font-mono text-purple-300">
                  <span>Plan Credits Quota:</span>
                  <span className="text-purple-400 font-bold">2,500 Credits</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-purple-300">
                  <span>Quota Upper Limit:</span>
                  <span className="text-zinc-200">3,000 Credits</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-purple-300">
                  <span>Pipeline Speed:</span>
                  <span className="text-purple-400 font-bold">Priority Execution Queue</span>
                </div>
              </div>

              {/* Feature Checkpoints */}
              <ul className="space-y-2.5 text-[11px] text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0" />
                  <span>Interactive Workspace Code Editor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0" />
                  <span>Webcam Portrait capture studio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0" />
                  <span className="font-bold text-white">Unlimited SVG Avatar options</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[#1ae854] shrink-0" />
                  <span>Exclusive developer visual models</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {currentTier === "elite" ? (
                <div className="w-full text-center py-2.5 bg-purple-950/20 text-purple-400 border border-purple-900/30 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  ACTIVE ON CONTAINER
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => openCheckout("tier", "elite", "Enterprise Elite Plan Upgrade", "$99.00", 2500)}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer text-center shadow-lg shadow-purple-600/5"
                >
                  Acquire Elite ($99/mo)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Credit Replenishment Panel with Custom Slider */}
      <div className="bg-[#020502]/60 border border-[#1ae854]/15 rounded-3xl p-6 shadow-xl relative backdrop-blur">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Slider Package Section */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#1ae854]" />
                CUSTOM CREDIT REPLENISHMENT SLIDER
              </h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">Choose a granular quota value to buy credit refills with microtransactions</p>
            </div>

            <div className="bg-black/40 border border-zinc-800 p-5 rounded-2xl space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">REFILL SLIDER VALUE:</span>
                <span className="text-lg font-black text-[#1ae854] font-mono">+{customTopupAmount} Cr</span>
              </div>

              <input 
                type="range" 
                min={100} 
                max={2000} 
                step={50}
                value={customTopupAmount}
                onChange={e => setCustomTopupAmount(parseInt(e.target.value))}
                className="w-full accent-[#1ae854] cursor-pointer h-1.5 bg-zinc-900 rounded-lg"
              />

              <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                <span>Min: 100 Cr</span>
                <span>Max: 2000 Cr</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-zinc-800/60">
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-mono">Estimated Refill Cost</span>
                  <span className="text-xl font-black text-white font-mono">${(customTopupAmount * 0.02).toFixed(2)} USD</span>
                </div>

                <button
                  type="button"
                  onClick={() => openCheckout(
                    "topup",
                    "custom",
                    `Custom Quota (+${customTopupAmount} Credits)`,
                    `$${(customTopupAmount * 0.02).toFixed(2)}`,
                    customTopupAmount
                  )}
                  className="px-4 py-2 bg-[#1ae854] hover:bg-[#15cf4a] text-black text-[10px] font-black uppercase tracking-widest rounded-lg transition cursor-pointer"
                >
                  SECURE REFILL
                </button>
              </div>
            </div>
          </div>

          {/* Quick Package options */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#1ae854]" />
                QUICK RECHARGE PACKS
              </h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">Quick selection of standardized pipeline credits refill containers</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "Starter Refill", credits: 100, price: "$2.99" },
                { name: "Pro Stack", credits: 500, price: "$9.99" },
                { name: "Vast Reservoir", credits: 2000, price: "$34.99" }
              ].map((pkg, idx) => (
                <button
                  key={idx}
                  onClick={() => openCheckout("topup", `pkg-${idx}`, pkg.name, pkg.price, pkg.credits)}
                  className="bg-black/50 hover:bg-[#1ae854]/5 border border-zinc-800 hover:border-[#1ae854]/40 p-4 rounded-2xl flex flex-col items-center text-center space-y-2 transition-all hover:scale-103 cursor-pointer relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-1 bg-[#1ae854]/10 text-[#1ae854] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                  <Package className="h-5 w-5 text-zinc-400 group-hover:text-[#1ae854] transition-colors" />
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">{pkg.name}</span>
                  <span className="text-base font-black text-white">+{pkg.credits} Cr</span>
                  <span className="text-[10px] font-mono font-bold text-[#1ae854]">{pkg.price}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Side-by-side interactive: Detailed Plan Comparison and Usage Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Usage Simulator Container */}
        <div className="bg-[#020502]/60 border border-[#1ae854]/15 rounded-3xl p-6 shadow-xl relative flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1ae854] animate-pulse" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  INTERACTIVE PIPELINE CREDIT SIMULATOR
                </h4>
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Simulate actual sandbox builds and SVG image generations to observe usage metrics.</p>
            </div>

            <div className="space-y-3">
              {simulationActions.map((action) => {
                const isProcessingThis = simulatingActionId === action.id;
                return (
                  <div 
                    key={action.id}
                    className="p-3.5 bg-black/40 border border-zinc-800 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-900">
                        {action.icon}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-100 block">{action.name}</span>
                        <span className="text-[10px] text-zinc-500 block">{action.description}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/30">
                        {action.credits} Cr
                      </span>
                      <button
                        type="button"
                        disabled={simulatingActionId !== null || credits < action.credits}
                        onClick={() => handleSimulateAction(action)}
                        className="px-3 py-1.5 bg-[#1ae854] disabled:opacity-30 hover:bg-[#15cf4a] text-black text-[9px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-1"
                      >
                        {isProcessingThis ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          "Trigger Job"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 mt-5 border-t border-zinc-800/80 pt-4">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <TermIcon className="h-3.5 w-3.5 text-[#1ae854]" />
              Simulator Terminal Outputs
            </span>
            <div className="bg-[#010501] border border-zinc-900 p-3 rounded-xl font-mono text-[9px] text-[#1ae854]/80 h-36 overflow-y-auto space-y-1">
              {simulatedLog.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix Grid */}
        <div className="bg-[#020502]/60 border border-[#1ae854]/15 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#1ae854]" />
              TECHNICAL SPECIFICATIONS & ROLES
            </h4>
            <p className="text-[10px] text-zinc-500 mt-0.5">Exhaustive matrix layout detailing computational support per active tier</p>
          </div>

          <div className="border border-zinc-800 rounded-2xl overflow-hidden text-xs bg-black/40">
            <div className="grid grid-cols-4 bg-zinc-950/80 p-3 border-b border-zinc-800 font-bold text-[9px] tracking-wider text-zinc-400 uppercase">
              <div>Features / Quota</div>
              <div className="text-center">Free</div>
              <div className="text-center text-[#1ae854]">Pro</div>
              <div className="text-center text-purple-400">Elite</div>
            </div>

            {[
              { label: "Credit Quota", free: "200/mo", pro: "1,000/mo", elite: "3,000/mo" },
              { label: "Compile Pipeline", free: "Standard", pro: "Fast 2x", elite: "Ultra Queue" },
              { label: "Linter Checks", free: "Local Cache", pro: "Fully Assisted", elite: "Full Coverage" },
              { label: "AI Avatar Studio", free: "Static Presets", pro: "3 Options Suite", elite: "Infinite Synth" },
              { label: "Theme Refinement", free: "Basic Mono", pro: "High Contrast", elite: "Exclusive Cyber" },
              { label: "Dev Instance Port", free: "Shared Ingress", pro: "Dedicated Proxy", elite: "Sandbox Isolation" },
              { label: "API Rate limits", free: "6 requests/m", pro: "60 requests/m", elite: "Unlimited Burst" }
            ].map((row, idx) => (
              <div 
                key={idx} 
                className="grid grid-cols-4 p-3 border-b border-zinc-850/60 hover:bg-[#1ae854]/3 items-center text-[10px] text-zinc-300"
              >
                <div className="font-semibold text-zinc-400">{row.label}</div>
                <div className="text-center text-zinc-500 font-mono">{row.free}</div>
                <div className="text-center text-zinc-200 font-mono font-semibold">{row.pro}</div>
                <div className="text-center text-purple-300 font-mono font-bold">{row.elite}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Cyberpunk Checkout Simulator Modal overlay */}
      {checkoutModal.isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#020502] border border-[#1ae854]/40 rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-black relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#1ae854]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-[#1ae854]" />
                <span className="text-xs font-black text-white uppercase tracking-wider">CYBER TERMINAL - CHECKOUT</span>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModal(prev => ({ ...prev, isOpen: false }))}
                className="text-zinc-500 hover:text-zinc-300 font-bold font-mono text-sm cursor-pointer"
              >
                [CLOSE ×]
              </button>
            </div>

            {checkoutModal.isSuccess ? (
              <div className="text-center py-8 space-y-4 animate-fadeIn">
                <div className="w-14 h-14 bg-[#1ae854]/10 rounded-full border-2 border-[#1ae854] flex items-center justify-center text-[#1ae854] mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-[#1ae854] animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h5 className="text-base font-black text-white uppercase tracking-wider">TRANSACTION ACCEPTED</h5>
                  <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">
                    The requested credits of <span className="text-[#1ae854] font-bold">+{checkoutModal.creditsToAdd} Cr</span> and plan details have been injected and synced locally!
                  </p>
                </div>

                <div className="bg-[#010501] border border-zinc-900 rounded-xl p-3 max-w-sm mx-auto text-left font-mono text-[9px] text-[#1ae854]/80">
                  <p>[COMPLETED] Handshake validated.</p>
                  <p>[INFO] State synchronized with local storage.</p>
                  <p>[INFO] Credit balance updated. Safe to run jobs!</p>
                </div>

                <button
                  type="button"
                  onClick={() => setCheckoutModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-6 py-2 bg-[#1ae854] hover:bg-[#15cf4a] text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer"
                >
                  RETURN TO CONSOLE
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Order Breakdown */}
                <div className="bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 space-y-2">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider font-mono">SELECTED PACKAGE</span>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white uppercase">{checkoutModal.displayName}</span>
                    <span className="text-xs font-mono font-black text-[#1ae854]">{checkoutModal.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 border-t border-zinc-900 pt-1.5">
                    <span>Includes credits:</span>
                    <span className="text-zinc-300">+{checkoutModal.creditsToAdd} Cr</span>
                  </div>
                </div>

                {/* Simulated fields */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider block">Credit Card Number</label>
                    <input 
                      type="text"
                      value={checkoutModal.cardNumber}
                      onChange={e => setCheckoutModal({ ...checkoutModal, cardNumber: e.target.value })}
                      className="w-full bg-[#050705] border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#1ae854]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider block">Cardholder Name</label>
                      <input 
                        type="text"
                        value={checkoutModal.cardName}
                        onChange={e => setCheckoutModal({ ...checkoutModal, cardName: e.target.value })}
                        className="w-full bg-[#050705] border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#1ae854]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider block">CVV</label>
                      <input 
                        type="text"
                        value={checkoutModal.cvv}
                        onChange={e => setCheckoutModal({ ...checkoutModal, cvv: e.target.value })}
                        className="w-full bg-[#050705] border border-zinc-850 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#1ae854]"
                      />
                    </div>
                  </div>
                </div>

                {/* Gateway terminal logs */}
                <div className="space-y-1.5">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider font-mono flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-[#1ae854]" />
                    Gateway Handshake Streams
                  </span>
                  <div className="bg-[#010501] border border-zinc-950 p-2.5 h-24 overflow-y-auto rounded-lg font-mono text-[8px] text-[#1ae854]/75 space-y-1">
                    {checkoutModal.terminalLogs.map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition border border-zinc-800"
                  >
                    Abort Order
                  </button>
                  <button
                    type="button"
                    disabled={checkoutModal.isProcessing}
                    onClick={handleProcessCheckout}
                    className="flex-1 py-2 bg-[#1ae854] hover:bg-[#15cf4a] disabled:opacity-40 text-black text-[10px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {checkoutModal.isProcessing ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        <Shield className="h-3.5 w-3.5" />
                        SUBMIT PAYMENT
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
