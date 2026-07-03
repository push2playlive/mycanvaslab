import { Template } from "../types";

export const TEMPLATES: Template[] = [
  {
    name: "Interactive Canvas Sketchpad",
    description: "A complete HTML5 painting canvas with custom brush size, color presets, undo/redo capabilities, and dark neon styling.",
    icon: "Palette",
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canvas Sketchpad</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background: #09090b;
      color: #fafafa;
    }
    .neon-border {
      box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);
    }
  </style>
</head>
<body class="p-6 flex flex-col items-center justify-center min-h-screen">
  <div class="max-w-4xl w-full bg-[#121214] border border-zinc-800 rounded-xl p-6 neon-border">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-zinc-800 pb-4">
      <div>
        <h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-tight">NEON BRUSH LAB</h1>
        <p class="text-xs text-zinc-500">Draw with glow presets & clean canvas physics</p>
      </div>
      <div class="flex gap-2 items-center flex-wrap">
        <input type="color" id="brushColor" value="#a855f7" class="w-8 h-8 rounded border-none bg-transparent cursor-pointer">
        <select id="brushSize" class="bg-zinc-900 border border-zinc-800 text-xs px-3 py-1.5 rounded text-zinc-300">
          <option value="2">2px (Thin)</option>
          <option value="5" selected>5px (Medium)</option>
          <option value="12">12px (Bold)</option>
          <option value="24">24px (Heavy)</option>
        </select>
        <button id="clearBtn" class="bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs px-3 py-1.5 rounded transition font-semibold">Clear</button>
        <button id="downloadBtn" class="bg-purple-950/40 hover:bg-purple-900/60 text-purple-400 text-xs px-3 py-1.5 rounded transition font-semibold">Save PNG</button>
      </div>
    </div>

    <div class="relative bg-black rounded-lg border border-zinc-850 overflow-hidden cursor-crosshair">
      <canvas id="sketchCanvas" class="w-full block" height="400" width="800"></canvas>
    </div>

    <div class="flex gap-4 justify-between items-center mt-4 text-[11px] text-zinc-500">
      <span>Hold shift for straight lines</span>
      <span id="coordDisplay">Coordinates: (0, 0)</span>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('sketchCanvas');
    const ctx = canvas.getContext('2d');
    const brushColor = document.getElementById('brushColor');
    const brushSize = document.getElementById('brushSize');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const coordDisplay = document.getElementById('coordDisplay');

    // Setup canvas resolution and background
    function initCanvas() {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    initCanvas();

    let drawing = false;
    let lastX = 0;
    let lastY = 0;

    function getMousePos(e) {
      const rect = canvas.getBoundingClientRect();
      // Handle potential scaling
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    canvas.addEventListener('mousedown', (e) => {
      drawing = true;
      const pos = getMousePos(e);
      lastX = pos.x;
      lastY = pos.y;
    });

    canvas.addEventListener('mousemove', (e) => {
      const pos = getMousePos(e);
      coordDisplay.textContent = \`Coordinates: (\${Math.round(pos.x)}, \${Math.round(pos.y)})\`;

      if (!drawing) return;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = brushColor.value;
      ctx.lineWidth = brushSize.value;
      
      // Neon glow effect if glowing color selected
      ctx.shadowBlur = brushSize.value * 1.5;
      ctx.shadowColor = brushColor.value;
      
      ctx.stroke();
      
      lastX = pos.x;
      lastY = pos.y;
    });

    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);

    clearBtn.addEventListener('click', () => {
      if (confirm('Clear entire sketchpad?')) {
        ctx.shadowBlur = 0;
        initCanvas();
      }
    });

    downloadBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'sketchpad.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  </script>
</body>
</html>`
      }
    ]
  },
  {
    name: "Cosmic Scientific Calculator",
    description: "A visually stunning dark retro math utility with floating decimals, physics transition button triggers, and continuous sum computation.",
    icon: "Calculator",
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cosmic Calculator</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background: #030712;
    }
    .neon-button:hover {
      box-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
    }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center p-4">
  <div class="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
    <div class="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/10 rounded-full blur-xl"></div>
    <div class="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>

    <div class="mb-6">
      <div class="text-right text-xs text-zinc-500 font-mono tracking-widest uppercase mb-1">Cosmic computing v1.0</div>
      <div id="equationDisplay" class="text-right text-sm text-zinc-400 font-mono min-h-[20px] overflow-x-auto truncate"></div>
      <div id="resultDisplay" class="text-right text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500 font-mono tracking-tight overflow-x-auto py-1">0</div>
    </div>

    <div class="grid grid-cols-4 gap-3">
      <!-- Row 1 -->
      <button class="col-span-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 p-4 rounded-2xl text-center text-xs text-red-400 font-bold tracking-wider" onclick="clearCalc()">CLEAR</button>
      <button class="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 p-4 rounded-2xl text-center text-zinc-300 font-bold" onclick="backspace()">⌫</button>
      <button class="bg-zinc-900 hover:bg-[#111c2e] border border-sky-950 p-4 rounded-2xl text-center text-sky-400 font-bold neon-button" onclick="appendOp('/')">/</button>

      <!-- Row 2 -->
      <button class="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl text-center text-zinc-100 font-medium font-mono" onclick="appendNum('7')">7</button>
      <button class="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl text-center text-zinc-100 font-medium font-mono" onclick="appendNum('8')">8</button>
      <button class="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl text-center text-zinc-100 font-medium font-mono" onclick="appendNum('9')">9</button>
      <button class="bg-zinc-900 hover:bg-[#111c2e] border border-sky-950 p-4 rounded-2xl text-center text-sky-400 font-bold neon-button" onclick="appendOp('*')">×</button>

      <!-- Row 3 -->
      <button class="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl text-center text-zinc-100 font-medium font-mono" onclick="appendNum('4')">4</button>
      <button class="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl text-center text-zinc-100 font-medium font-mono" onclick="appendNum('5')">5</button>
      <button class="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl text-center text-zinc-100 font-medium font-mono" onclick="appendNum('6')">6</button>
      <button class="bg-zinc-900 hover:bg-[#111c2e] border border-sky-950 p-4 rounded-2xl text-center text-sky-400 font-bold neon-button" onclick="appendOp('-')">-</button>

      <!-- Row 4 -->
      <button class="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl text-center text-zinc-100 font-medium font-mono" onclick="appendNum('1')">1</button>
      <button class="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl text-center text-zinc-100 font-medium font-mono" onclick="appendNum('2')">2</button>
      <button class="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl text-center text-zinc-100 font-medium font-mono" onclick="appendNum('3')">3</button>
      <button class="bg-zinc-900 hover:bg-[#111c2e] border border-sky-950 p-4 rounded-2xl text-center text-sky-400 font-bold neon-button" onclick="appendOp('+')">+</button>

      <!-- Row 5 -->
      <button class="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl text-center text-zinc-100 font-medium font-mono" onclick="appendNum('0')">0</button>
      <button class="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-2xl text-center text-zinc-100 font-medium font-mono font-bold" onclick="appendNum('.')">.</button>
      <button class="col-span-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 active:scale-[0.98] transition-all p-4 rounded-2xl text-center text-white font-black tracking-wider shadow-lg shadow-sky-500/20" onclick="calculate()">=</button>
    </div>
  </div>

  <script>
    let currentInput = "";
    let equation = "";

    const equationDisplay = document.getElementById("equationDisplay");
    const resultDisplay = document.getElementById("resultDisplay");

    function updateUI() {
      equationDisplay.textContent = equation;
      resultDisplay.textContent = currentInput || "0";
    }

    function appendNum(num) {
      if (num === "." && currentInput.includes(".")) return;
      currentInput += num;
      equation += num;
      updateUI();
    }

    function appendOp(op) {
      if (!equation) return;
      const lastChar = equation.trim().slice(-1);
      if (["+", "-", "*", "/"].includes(lastChar)) {
        equation = equation.slice(0, -1) + op;
      } else {
        equation += " " + op + " ";
      }
      currentInput = "";
      updateUI();
    }

    function clearCalc() {
      currentInput = "";
      equation = "";
      updateUI();
    }

    function backspace() {
      if (currentInput) {
        currentInput = currentInput.slice(0, -1);
        equation = equation.slice(0, -1);
      } else if (equation) {
        equation = equation.trim().slice(0, -1).trim();
      }
      updateUI();
    }

    function calculate() {
      if (!equation) return;
      try {
        // Safe evaluation
        const result = Function('"use strict";return (' + equation + ')')();
        currentInput = String(result);
        equation = String(result);
        updateUI();
      } catch (err) {
        resultDisplay.textContent = "Error";
        setTimeout(() => clearCalc(), 1000);
      }
    }
  </script>
</body>
</html>`
      }
    ]
  },
  {
    name: "Elegant Markdown Document Editor",
    description: "A split-screen active documentation previewer that compiles headings, lists, bold accents, and code block formatting live.",
    icon: "FileText",
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elegant Markdown Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col">
  <header class="border-b border-zinc-900 py-3.5 px-6 flex justify-between items-center bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
    <div class="flex items-center gap-2">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
      <h1 class="text-sm font-bold uppercase tracking-widest text-zinc-300">Live MD Documenter</h1>
    </div>
    <button id="resetBtn" class="text-zinc-500 hover:text-zinc-300 text-xs transition border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded bg-zinc-900/40">Reset Sample</button>
  </header>

  <main class="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden h-[calc(100vh-53px)]">
    <!-- Editor side -->
    <div class="border-r border-zinc-900 flex flex-col h-full bg-[#0d0d0e]">
      <div class="bg-[#121214] py-1.5 px-4 border-b border-zinc-900 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Editor</div>
      <textarea id="editor" class="flex-1 w-full p-6 bg-[#0a0a0b] text-zinc-300 font-mono text-sm leading-relaxed outline-none resize-none focus:ring-1 focus:ring-emerald-500/20"></textarea>
    </div>

    <!-- Live Preview side -->
    <div class="flex flex-col h-full bg-[#0a0a0b]">
      <div class="bg-[#121214] py-1.5 px-4 border-b border-zinc-900 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Live Rich Compile</div>
      <div id="preview" class="flex-1 p-8 overflow-y-auto prose prose-invert prose-emerald text-zinc-300 max-w-none text-sm space-y-4"></div>
    </div>
  </main>

  <script>
    const sampleText = \`# Cosmic Playground Guide

This is an interactive split-screen **Markdown Document Editor** compiled live inside the playground container!

## Feature Stack
1. **Interactive Render**: Standard Markdown elements compile automatically on change
2. **Typography System**: Sleek grid layout featuring Tailwind fluid spacing
3. **Responsive Grid**: Automatically shifts to a single column vertical array on mobile screens

### Sample Code Block
\\\`\\\`\\\`javascript
// Live updating state is rendered below
function computeCosmicState(planet) {
  console.log("Orbiting " + planet);
}
\\\`\\\`\\\`

> "Simplification is the ultimate key to magnificent craftsmanship." — Traditional Design Principle
\`;

    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const resetBtn = document.getElementById('resetBtn');

    function renderMarkdown(md) {
      // Extremely basic MD rendering for demo sandbox
      let html = md
        .replace(/# (.*?)\\n/g, '<h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-4 tracking-tight border-b border-zinc-900 pb-2">$1</h1>')
        .replace(/## (.*?)\\n/g, '<h2 class="text-xl font-bold text-zinc-100 mt-6 mb-2 tracking-tight border-b border-zinc-900/50 pb-1">$1</h2>')
        .replace(/### (.*?)\\n/g, '<h3 class="text-md font-semibold text-zinc-300 mt-4 mb-2">$1</h3>')
        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong class="font-bold text-emerald-400">$1</strong>')
        .replace(/\\*(.*?)\\*/g, '<em class="italic text-zinc-300">$1</em>')
        .replace(/- (.*?)\\n/g, '<li class="ml-4 list-disc text-zinc-400 py-0.5">$1</li>')
        .replace(/\\d+\\. (.*?)\\n/g, '<li class="ml-4 list-decimal text-zinc-400 py-0.5">$1</li>')
        .replace(/\\n\\n/g, '</p><p class="text-zinc-400 leading-relaxed">')
        .replace(/> (.*?)\\n/g, '<blockquote class="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-emerald-950/20 text-zinc-300 rounded italic">$1</blockquote>')
        .replace(/\\\`\\\`\\\`([\\s\\S]*?)\\\`\\\`\\\`/g, '<pre class="bg-zinc-900 border border-zinc-850 p-4 rounded-xl font-mono text-xs overflow-x-auto text-emerald-300">$1</pre>')
        .replace(/\\\`(.*?)\\\`/g, '<code class="bg-zinc-900 border border-zinc-800 text-xs px-1.5 py-0.5 rounded font-mono text-emerald-400">$1</code>');

      preview.innerHTML = '<p class="text-zinc-400 leading-relaxed">' + html + '</p>';
    }

    editor.addEventListener('input', (e) => {
      renderMarkdown(e.target.value);
    });

    resetBtn.addEventListener('click', () => {
      editor.value = sampleText;
      renderMarkdown(sampleText);
    });

    // Seed preview on load
    editor.value = sampleText;
    renderMarkdown(sampleText);
  </script>
</body>
</html>`
      }
    ]
  },
  {
    name: "MyCanvasLab & utube.media Hub",
    description: "The legendary first build of MyCanvasLab. A cinematic rich media dashboard integrated with live simulated audio visualizers, stream canvas processors, and real-time subscriber widgets for utube.media creators.",
    icon: "Code",
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MyCanvasLab First Build - utube.media</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');
    body {
      background-color: #020402;
      font-family: 'Space Grotesk', sans-serif;
    }
    .neon-glow {
      box-shadow: 0 0 15px rgba(26, 232, 84, 0.15);
    }
    .neon-border {
      border-color: rgba(26, 232, 84, 0.25);
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body class="text-[#ecfdf5] min-h-screen p-4 sm:p-6 flex items-center justify-center">

  <div class="max-w-5xl w-full bg-[#050905]/90 border border-[#1ae854]/20 rounded-2xl p-6 neon-glow flex flex-col gap-6 relative overflow-hidden">
    <!-- Grid overlay background -->
    <div class="absolute inset-0 bg-[radial-gradient(#1ae854_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none"></div>

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center pb-5 border-b border-[#1ae854]/15 gap-4 relative z-10">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 text-[9px] font-mono bg-[#1ae854]/10 border border-[#1ae854]/30 rounded text-[#1ae854] font-black">
            MYCANVASLAB V1.0 OFFICIAL BUILD
          </span>
          <span class="w-2 h-2 rounded-full bg-[#1ae854] animate-pulse"></span>
        </div>
        <h1 class="text-2xl font-black text-white tracking-tight uppercase">
          MyCanvasLab <span class="text-[#1ae854]">First Build</span>
        </h1>
        <p class="text-xs text-zinc-500 font-mono">Stream ecosystem sandbox integrated with utube.media</p>
      </div>

      <div class="flex items-center gap-3 font-mono">
        <div class="text-right">
          <span class="text-[9px] text-zinc-500 block uppercase">Ecosystem Ingress</span>
          <span class="text-xs text-white font-bold">utube.media active</span>
        </div>
        <div class="p-2.5 bg-[#1ae854]/10 border border-[#1ae854]/20 rounded-xl">
          🎥
        </div>
      </div>
    </div>

    <!-- Stats Panel -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
      <div class="bg-black/40 border border-[#1ae854]/10 p-3.5 rounded-xl">
        <span class="text-[9px] text-zinc-500 uppercase tracking-widest font-mono block">LIVE STREAM STATUS</span>
        <span class="text-sm font-black text-white block mt-1" id="streamStatus">IDLE</span>
      </div>
      <div class="bg-black/40 border border-[#1ae854]/10 p-3.5 rounded-xl">
        <span class="text-[9px] text-zinc-500 uppercase tracking-widest font-mono block">SUBSCRIBERS (UTUBE)</span>
        <span class="text-sm font-black text-[#1ae854] block mt-1" id="subCount">142,850</span>
      </div>
      <div class="bg-black/40 border border-[#1ae854]/10 p-3.5 rounded-xl">
        <span class="text-[9px] text-zinc-500 uppercase tracking-widest font-mono block">SIMULATED VIEWERS</span>
        <span class="text-sm font-black text-white block mt-1" id="viewerCount">0</span>
      </div>
      <div class="bg-black/40 border border-[#1ae854]/10 p-3.5 rounded-xl">
        <span class="text-[9px] text-zinc-500 uppercase tracking-widest font-mono block">COMPILATION STATE</span>
        <span class="text-sm font-black text-[#1ae854] block mt-1">98.9% STABLE</span>
      </div>
    </div>

    <!-- Main Sandbox Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
      
      <!-- Video Visualizer Canvas Section -->
      <div class="lg:col-span-7 bg-black/60 border border-zinc-900 rounded-xl p-4 flex flex-col gap-4">
        <div class="flex items-center justify-between border-b border-zinc-900 pb-2">
          <span class="text-xs font-bold text-zinc-200">UTUBE.MEDIA LIVE BROADCAST COMPILER</span>
          <button id="togglePlayBtn" class="px-3 py-1 bg-[#1ae854]/10 border border-[#1ae854]/30 hover:bg-[#1ae854]/20 text-[#1ae854] rounded font-mono text-[10px] font-bold transition">
            START STREAM MIX
          </button>
        </div>

        <div class="relative aspect-video w-full bg-zinc-950 rounded-lg overflow-hidden border border-zinc-900 flex flex-col items-center justify-center">
          <canvas id="visualizerCanvas" class="absolute inset-0 w-full h-full pointer-events-none opacity-80"></canvas>
          
          <div class="z-10 text-center p-4 select-none" id="playOverlay">
            <span class="text-4xl block mb-2">📡</span>
            <h3 class="text-xs font-bold tracking-widest uppercase text-zinc-400">Broadcasting Feed Standby</h3>
            <p class="text-[10px] text-zinc-600 mt-1">Click 'START STREAM MIX' above to launch neural audio canvas signals</p>
          </div>
        </div>

        <div class="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>Framerate: <strong class="text-zinc-300">60 fps</strong></span>
          <span>Buffer depth: <strong id="bufferDepth">0 bytes</strong></span>
        </div>
      </div>

      <!-- Controls & Live Feed Stream Chat -->
      <div class="lg:col-span-5 flex flex-col gap-4">
        
        <!-- Interactive Trigger Board -->
        <div class="bg-[#050905] border border-[#1ae854]/15 rounded-xl p-4 space-y-3">
          <span class="text-[10px] font-black tracking-widest uppercase text-[#1ae854] font-mono block">SIMULATOR CONTROLS</span>
          
          <div class="grid grid-cols-2 gap-2">
            <button onclick="triggerSubAlert()" class="py-2 px-3 bg-[#1ae854]/10 hover:bg-[#1ae854]/20 border border-[#1ae854]/25 text-white hover:text-[#1ae854] text-xs font-bold rounded-lg transition text-center">
              +1 Sub Alert
            </button>
            <button onclick="changeEcosystemTheme()" class="py-2 px-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-lg transition text-center">
              🎨 Switch Hue
            </button>
          </div>
        </div>

        <!-- Chat Stream Box -->
        <div class="bg-black/50 border border-zinc-900 rounded-xl p-4 flex flex-col gap-3 flex-1 min-h-[220px]">
          <span class="text-xs font-bold text-zinc-400 border-b border-zinc-900 pb-2">UTUBE.MEDIA STREAM CHAT</span>
          
          <!-- Message log -->
          <div id="chatLog" class="flex-1 overflow-y-auto space-y-2.5 max-h-[160px] text-[11px] font-mono">
            <div class="text-zinc-600"><span class="text-[#1ae854]">System:</span> Connection to utube.media live server initialized...</div>
          </div>

          <!-- Send box -->
          <form id="chatForm" onsubmit="sendChatMessage(event)" class="flex gap-2 border-t border-zinc-900 pt-2">
            <input type="text" id="chatInput" placeholder="Send a message..." class="flex-1 bg-zinc-900/60 border border-zinc-800 focus:border-[#1ae854]/45 rounded px-2.5 py-1.5 text-[11px] font-mono outline-none text-white">
            <button type="submit" class="px-3 bg-[#1ae854] hover:bg-[#1ae854]/80 text-black font-black text-[10px] rounded transition uppercase">SEND</button>
          </form>
        </div>

      </div>

    </div>

    {/* Alert Modal Overlay */}
    <div id="alertToast" class="fixed bottom-6 left-6 bg-[#020502] border border-[#1ae854] px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 transform translate-y-20 opacity-0 pointer-events-none flex items-center gap-3 z-50">
      <div class="p-2 bg-[#1ae854]/10 rounded-lg">🎉</div>
      <div>
        <span class="text-[9px] text-[#1ae854] font-black block font-mono">UTUBE.MEDIA NEW MEMBER DETECTED</span>
        <span class="text-xs font-bold text-white font-mono" id="alertText">Developer subscribed to MyCanvasLab!</span>
      </div>
    </div>

  </div>

  <script>
    const canvas = document.getElementById('visualizerCanvas');
    const ctx = canvas.getContext('2d');
    const togglePlayBtn = document.getElementById('togglePlayBtn');
    const playOverlay = document.getElementById('playOverlay');
    const streamStatus = document.getElementById('streamStatus');
    const viewerCountDisplay = document.getElementById('viewerCount');
    const subCountDisplay = document.getElementById('subCount');
    const bufferDepthDisplay = document.getElementById('bufferDepth');
    const chatLog = document.getElementById('chatLog');
    const alertToast = document.getElementById('alertToast');
    const alertText = document.getElementById('alertText');

    let streaming = false;
    let animationId = null;
    let subscribers = 142850;
    let viewers = 0;
    let themeHue = 138; // Default MyCanvasLab Green

    // Set canvas resolution
    function resize() {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    window.addEventListener('resize', resize);
    resize();

    // Sine wave data and animation
    let phase = 0;
    function drawVisualizer() {
      if (!streaming) return;
      ctx.fillStyle = 'rgba(2, 4, 2, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.strokeStyle = \`hsl(\${themeHue}, 90%, 55%)\`;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = \`hsl(\${themeHue}, 90%, 55%)\`;

      const numPoints = canvas.width;
      for (let i = 0; i < numPoints; i++) {
        const x = i;
        const normX = i / numPoints;
        const amp = Math.sin(normX * Math.PI) * 45; // taper at ends
        const y = canvas.height / 2 + Math.sin(normX * 8 * Math.PI + phase) * amp * Math.cos(phase * 0.4);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Second harmonic line
      ctx.beginPath();
      ctx.strokeStyle = \`rgba(255, 255, 255, 0.15)\`;
      ctx.lineWidth = 1;
      for (let i = 0; i < numPoints; i++) {
        const x = i;
        const normX = i / numPoints;
        const amp = Math.sin(normX * Math.PI) * 25;
        const y = canvas.height / 2 + Math.sin(normX * 14 * Math.PI - phase * 1.5) * amp;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      phase += 0.08;
      animationId = requestAnimationFrame(drawVisualizer);
    }

    togglePlayBtn.addEventListener('click', () => {
      streaming = !streaming;
      if (streaming) {
        togglePlayBtn.textContent = 'STOP STREAM MIX';
        togglePlayBtn.classList.remove('bg-[#1ae854]/10');
        togglePlayBtn.classList.add('bg-red-500/15', 'text-red-400', 'border-red-500/30');
        playOverlay.classList.add('hidden');
        streamStatus.textContent = 'LIVE';
        streamStatus.className = 'text-sm font-black text-[#1ae854] block mt-1 animate-pulse';
        viewers = Math.floor(Math.random() * 240) + 120;
        viewerCountDisplay.textContent = viewers.toLocaleString();
        bufferDepthDisplay.textContent = '4.12 MB/s';
        drawVisualizer();
        addSystemChatMessage("Broadcasting feed successfully connected to servers.");
      } else {
        togglePlayBtn.textContent = 'START STREAM MIX';
        togglePlayBtn.classList.add('bg-[#1ae854]/10');
        togglePlayBtn.classList.remove('bg-red-500/15', 'text-red-400', 'border-red-500/30');
        playOverlay.classList.remove('hidden');
        streamStatus.textContent = 'IDLE';
        streamStatus.className = 'text-sm font-black text-white block mt-1';
        viewerCountDisplay.textContent = '0';
        bufferDepthDisplay.textContent = '0 bytes';
        cancelAnimationFrame(animationId);
        addSystemChatMessage("Ecosystem channel disconnected.");
      }
    });

    // Alert toast trigger
    function triggerSubAlert() {
      subscribers += 1;
      subCountDisplay.textContent = subscribers.toLocaleString();
      
      const names = ["PixelCrafter", "StreamQueen", "utube_user_99", "CanvasNinja", "AI_Studio_Gen", "PushToPlay"];
      const randName = names[Math.floor(Math.random() * names.length)];
      
      alertText.textContent = \`\${randName} subscribed to MyCanvasLab & utube.media!\`;
      
      alertToast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
      
      setTimeout(() => {
        alertToast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
      }, 4000);

      const div = document.createElement('div');
      div.className = 'text-[#1ae854]';
      div.innerHTML = \`<span class="text-[#1ae854]/60">Alert:</span> 🔔 \${randName} has joined the subscriber community!\`;
      chatLog.appendChild(div);
      chatLog.scrollTop = chatLog.scrollHeight;
    }

    function changeEcosystemTheme() {
      // Rotate hue
      themeHue = (themeHue + 60) % 360;
      addSystemChatMessage(\`Visual hue updated to: HSL \${themeHue}°\`);
    }

    function sendChatMessage(e) {
      e.preventDefault();
      const input = document.getElementById('chatInput');
      if (!input.value.trim()) return;

      const div = document.createElement('div');
      div.innerHTML = \`<span class="text-white font-bold">You:</span> \${escapeHTML(input.value)}\`;
      chatLog.appendChild(div);
      chatLog.scrollTop = chatLog.scrollHeight;

      input.value = '';

      // Simulate a fast chatbot response
      setTimeout(() => {
        const replies = [
          "That visualizer is buttery smooth!",
          "Legendary first build on MyCanvasLab!",
          "Loving the cyber green HUD theme",
          "Is this build using custom canvases?",
          "Yes! This is gorgeous coding",
          "UTUBE.MEDIA represent!"
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const systemNames = ["TechieGuy", "CodeStar", "FlowWeaver", "CyberScribe"];
        const randName = systemNames[Math.floor(Math.random() * systemNames.length)];

        const replyDiv = document.createElement('div');
        replyDiv.innerHTML = \`<span class="text-zinc-400 font-bold">\${randName}:</span> \${randomReply}\`;
        chatLog.appendChild(replyDiv);
        chatLog.scrollTop = chatLog.scrollHeight;
      }, 1000);
    }

    function addSystemChatMessage(msg) {
      const div = document.createElement('div');
      div.className = 'text-zinc-500';
      div.innerHTML = \`<span class="text-[#1ae854]/40">System:</span> \${msg}\`;
      chatLog.appendChild(div);
      chatLog.scrollTop = chatLog.scrollHeight;
    }

    function escapeHTML(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Auto load a few chat messages after some time
    setInterval(() => {
      if (!streaming) return;
      const comments = [
        "This performance metrics monitor is insane",
        "utube.media first build looks neat!",
        "Is MyCanvasLab a game-changer? Absolutely",
        "I need this template loaded into my workspace immediately!",
        "Double-clicking code files works so well"
      ];
      const comment = comments[Math.floor(Math.random() * comments.length)];
      const names = ["EcosystemWatcher", "SlickCoder", "AntigravityFan", "GeminiLover"];
      const name = names[Math.floor(Math.random() * names.length)];

      const div = document.createElement('div');
      div.innerHTML = \`<span class="text-zinc-400 font-bold">\${name}:</span> \${comment}\`;
      chatLog.appendChild(div);
      chatLog.scrollTop = chatLog.scrollHeight;
    }, 4500);

  </script>
</body>
</html>`
      }
    ]
  }
];

