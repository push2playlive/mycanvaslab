import { GalleryTemplate } from "../types";

export const DEFAULT_FILES = [
  {
    path: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MyCanvasLab Sandbox</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              brand: {
                50: "#fff7ed",
                100: "#ffedd5",
                500: "#f97316",
                600: "#ea580c",
                900: "#7c2d12",
              }
            }
          }
        }
      }
    </script>
    <!-- Lucide Icons for icons in sandbox -->
    <script src="https://unpkg.com/lucide@latest"></script>
  </head>
  <body class="bg-zinc-950 text-zinc-100 antialiased selection:bg-orange-500 selection:text-white">
    <div id="root"></div>
  </body>
</html>`
  },
  {
    path: "src/App.tsx",
    content: `import React, { useState, useEffect } from "react";
import { Rocket, Shield, Activity, Users, Radio, Cpu, RefreshCw, Terminal } from "lucide-react";

export default function App() {
  const [isLaunched, setIsLaunched] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [launchLogs, setLaunchLogs] = useState<string[]>([]);
  const [selectedCore, setSelectedCore] = useState("Alpha Core");
  const [telemetry, setTelemetry] = useState({
    oxygen: 98,
    fuel: 100,
    velocity: 0,
    altitude: 0,
  });

  useEffect(() => {
    let interval: any;
    if (isLaunched && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setLaunchLogs((logs) => [...logs, "🚀 BOOSTER IGNITION: SUCCESSFUL LIFTOFF!"]);
            return 0;
          }
          const events = [
            "Initiating core compression...",
            "Liquid fuel flow stabilized.",
            "Pre-launch sequence check complete.",
            "Aerodynamics calculations ready.",
          ];
          const randomEvent = events[Math.floor(Math.random() * events.length)];
          setLaunchLogs((logs) => [...logs, \`T-minus \${prev - 1}s: \${randomEvent}\`]);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLaunched, countdown]);

  useEffect(() => {
    let interval: any;
    if (isLaunched && countdown === 0) {
      interval = setInterval(() => {
        setTelemetry((prev) => ({
          oxygen: Math.max(70, prev.oxygen - Math.random() * 0.2),
          fuel: Math.max(0, prev.fuel - Math.random() * 0.8),
          velocity: prev.velocity + Math.floor(Math.random() * 150) + 100,
          altitude: prev.altitude + Math.floor(Math.random() * 200) + 50,
        }));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isLaunched, countdown]);

  const handleLaunch = () => {
    if (isLaunched) {
      // reset
      setIsLaunched(false);
      setCountdown(10);
      setLaunchLogs(["System diagnostics: OK. Ready for terminal countdown."]);
      setTelemetry({ oxygen: 98, fuel: 100, velocity: 0, altitude: 0 });
    } else {
      setIsLaunched(true);
      setLaunchLogs(["T-10s: Launch command authorized by Commander.", "T-10s: Commencing terminal guidance cycle."]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket className="h-6 w-6 text-orange-500 animate-pulse" />
          <span className="font-bold tracking-wider text-lg uppercase bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            Nova Command
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-zinc-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            SYS STATUS: ONLINE
          </span>
        </div>
      </header>

      {/* Hero Control */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Ignition Unit */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-orange-500" /> Terminal Flight Panel
            </h2>
            <p className="text-sm text-zinc-400 mb-6">Authorize launch credentials and ignite the chemical heavy-lift boosters.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl text-center">
                <p className="text-xs text-zinc-500 uppercase font-semibold">Booster Temp</p>
                <p className="text-lg font-bold text-orange-400">{isLaunched ? "1,450°C" : "42°C"}</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl text-center">
                <p className="text-xs text-zinc-500 uppercase font-semibold">Reactor Core</p>
                <p className="text-lg font-bold text-zinc-100">{selectedCore}</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl text-center">
                <p className="text-xs text-zinc-500 uppercase font-semibold">T-Minus</p>
                <p className="text-2xl font-black text-orange-500">{countdown}s</p>
              </div>
              <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl text-center">
                <p className="text-xs text-zinc-500 uppercase font-semibold">Mission Code</p>
                <p className="text-lg font-bold text-amber-300">NV-889</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={handleLaunch}
                className={\`w-full sm:w-auto px-8 py-4 rounded-xl font-bold tracking-wider uppercase transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-3 \${
                  isLaunched
                    ? "bg-red-600 hover:bg-red-500 text-white shadow-red-900/30 border border-red-500"
                    : "bg-orange-500 hover:bg-orange-400 text-zinc-950 hover:scale-[1.02] shadow-orange-500/20"
                }\`}
              >
                {isLaunched ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" /> Abort Launch
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5" /> Ignite Engines
                  </>
                )}
              </button>

              <div className="flex gap-2">
                {["Alpha Core", "Beta Core", "Nuke Core"].map((core) => (
                  <button
                    key={core}
                    disabled={isLaunched}
                    onClick={() => setSelectedCore(core)}
                    className={\`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all \${
                      selectedCore === core
                        ? "bg-orange-500/10 border-orange-500/50 text-orange-400"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    } \${isLaunched ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}\`}
                  >
                    {core}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Telemetry Real-time Data */}
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" /> Live Flight Telemetry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Liquid Oxygen Fuel</span>
                    <span className="text-zinc-200 font-semibold">{telemetry.fuel.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                    <div
                      className="h-full bg-orange-500 transition-all duration-300"
                      style={{ width: \`\${telemetry.fuel}%\` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-zinc-400 mb-1">
                    <span>Life Support Pressure</span>
                    <span className="text-zinc-200 font-semibold">{telemetry.oxygen.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-300"
                      style={{ width: \`\${telemetry.oxygen}%\` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900 border border-zinc-800/80 p-3 rounded-xl">
                  <p className="text-xs text-zinc-500">Altitude</p>
                  <p className="text-lg font-black text-emerald-400">
                    {telemetry.altitude.toLocaleString()} km
                  </p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800/80 p-3 rounded-xl">
                  <p className="text-xs text-zinc-500">Current Velocity</p>
                  <p className="text-lg font-black text-cyan-400">
                    {telemetry.velocity.toLocaleString()} km/h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Telemetry Logs Console */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col h-[500px] lg:h-auto">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Terminal className="h-5 w-5 text-orange-500" /> Mission Log Deck
            </h3>
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-xs text-zinc-300 space-y-2 pr-2 scrollbar-thin">
            {launchLogs.length === 0 ? (
              <p className="text-zinc-500 italic">No mission telemetry records available yet.</p>
            ) : (
              launchLogs.map((log, index) => (
                <div
                  key={index}
                  className={\`p-2 rounded border border-zinc-800/50 bg-zinc-950/40 \${
                    log.includes("Liftoff") || log.includes("SUCCESSFUL")
                      ? "text-emerald-400 border-emerald-950"
                      : ""
                  }\`}
                >
                  <span className="text-zinc-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
`
  }
];

export const GALLERY_TEMPLATES: GalleryTemplate[] = [
  {
    id: "nova-dashboard",
    title: "Nova Launch Dashboard",
    description: "Futuristic flight command console with live-updating charts, simulated launch cycle, booster indicators, and core temperature checks.",
    category: "Dashboards",
    files: [
      ...DEFAULT_FILES
    ]
  },
  {
    id: "cyber-synth",
    title: "Synthwave Player Layout",
    description: "Cyberpunk music visualizer interface featuring beautiful vinyl/album rotation, customized retro playlists, and custom theme switches.",
    category: "Entertainment",
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Retro Cyberpunk Player</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              neonPink: "#ff007f",
              neonBlue: "#00f0ff",
            }
          }
        }
      }
    </script>
    <script src="https://unpkg.com/lucide@latest"></script>
  </head>
  <body class="bg-slate-950 text-pink-100 antialiased font-sans">
    <div id="root"></div>
  </body>
</html>`
      },
      {
        path: "src/App.tsx",
        content: `import React, { useState } from "react";
import { Play, Pause, SkipForward, SkipBack, Heart, Music, Disc, Volume2, Search } from "lucide-react";

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(70);

  const tracks = [
    { title: "Neon Horizon", artist: "Laserhawk", duration: "4:20", genre: "Synthwave" },
    { title: "Midnight Cruiser", artist: "Kavinsky", duration: "3:45", genre: "Outrun" },
    { title: "Cybernetic City", artist: "Perturbator", duration: "5:12", genre: "Darksynth" },
    { title: "Analog dreams", artist: "Gunship", duration: "4:01", genre: "Retrowave" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      <header className="flex justify-between items-center border-b border-pink-900/40 pb-4">
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-pink-500 animate-pulse" />
          <h1 className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            RETROWAVE FM
          </h1>
        </div>
        <div className="flex items-center gap-4 bg-slate-900 border border-pink-900/30 px-3 py-1.5 rounded-full">
          <span className="h-2.5 w-2.5 rounded-full bg-pink-500 animate-ping"></span>
          <span className="text-xs uppercase tracking-widest text-pink-400 font-bold">STATION: LIVE</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-8 items-center max-w-4xl mx-auto w-full my-8">
        {/* Left: Hologram Vinyl */}
        <div className="flex-1 flex flex-col items-center">
          <div className={\`relative bg-gradient-to-br from-pink-500/20 to-cyan-500/20 p-8 rounded-full border border-pink-500/50 shadow-[0_0_50px_rgba(244,63,94,0.15)] transition-transform duration-1000 \${
            isPlaying ? "animate-[spin_10s_linear_infinite]" : ""
          }\`}>
            <div className="bg-slate-900 rounded-full h-56 w-56 flex items-center justify-center border-4 border-slate-950">
              <Disc className="h-44 w-44 text-cyan-400/80" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 bg-pink-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
              <div className="h-3 w-3 bg-slate-950 rounded-full"></div>
            </div>
          </div>

          <div className="text-center mt-6">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 uppercase tracking-widest">
              {tracks[currentTrackIndex].title}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{tracks[currentTrackIndex].artist}</p>
          </div>
        </div>

        {/* Right: Controller Deck */}
        <div className="w-full md:w-96 space-y-6">
          <div className="bg-slate-900/70 border border-pink-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs text-pink-400 font-bold uppercase tracking-widest">
                {tracks[currentTrackIndex].genre}
              </span>
              <Heart className="h-5 w-5 text-pink-500 hover:scale-110 transition cursor-pointer" />
            </div>

            {/* Slider */}
            <div className="space-y-1 mb-6">
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all"
                  style={{ width: isPlaying ? "40%" : "0%" }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{isPlaying ? "01:42" : "00:00"}</span>
                <span>{tracks[currentTrackIndex].duration}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setCurrentTrackIndex((prev) => (prev === 0 ? tracks.length - 1 : prev - 1))}
                className="p-3 bg-slate-950 rounded-full border border-pink-500/20 hover:border-pink-500/60 transition text-slate-300 hover:text-pink-400 cursor-pointer"
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-slate-950 font-black shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] transition cursor-pointer"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>

              <button
                onClick={() => setCurrentTrackIndex((prev) => (prev === tracks.length - 1 ? 0 : prev + 1))}
                className="p-3 bg-slate-950 rounded-full border border-pink-500/20 hover:border-pink-500/60 transition text-slate-300 hover:text-pink-400 cursor-pointer"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 mt-6 border-t border-pink-900/30 pt-4">
              <Volume2 className="h-4 w-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-pink-500 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Tracklist */}
          <div className="bg-slate-950 border border-pink-900/30 p-4 rounded-xl space-y-2">
            {tracks.map((track, i) => (
              <div
                key={i}
                onClick={() => {
                  setCurrentTrackIndex(i);
                  setIsPlaying(true);
                }}
                className={\`flex justify-between items-center p-2.5 rounded-lg text-sm cursor-pointer border transition \${
                  currentTrackIndex === i
                    ? "bg-gradient-to-r from-pink-500/10 to-cyan-500/10 border-pink-500/40 text-pink-400 font-semibold"
                    : "border-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }\`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">0{i+1}</span>
                  <div>
                    <p>{track.title}</p>
                    <p className="text-xs text-slate-500">{track.artist}</p>
                  </div>
                </div>
                <span>{track.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-pink-900/60 uppercase tracking-widest mt-4">
        © 1988 LaserLab Technologies, INC. All rights reserved.
      </footer>
    </div>
  );
}
`
      }
    ]
  },
  {
    id: "glowing-calculator",
    title: "Quantum Glass Calculator",
    description: "Beautiful calculator featuring interactive physics-based calculations, futuristic digital readouts, historical formulas panel, and beautiful design.",
    category: "Tools",
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quantum Glass Calculator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
  </head>
  <body class="bg-[#030712] text-zinc-100 antialiased font-sans">
    <div id="root"></div>
  </body>
</html>`
      },
      {
        path: "src/App.tsx",
        content: `import React, { useState } from "react";
import { Sparkles, History, Trash2, Shield, Settings, Info } from "lucide-react";

export default function App() {
  const [display, setDisplay] = useState("0");
  const [history, setHistory] = useState<string[]>([]);
  const [equation, setEquation] = useState("");

  const handleNum = (num: string) => {
    if (display === "0" || display === "Error") {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (op: string) => {
    setEquation(display + " " + op + " ");
    setDisplay("0");
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
  };

  const handleCalc = () => {
    try {
      if (!equation) return;
      const fullEq = equation + display;
      // Simple safe evaluation
      const cleanEq = fullEq.replace(/[^0-9+\\-*/.]/g, "");
      const res = Function(\`return \${cleanEq}\`)();
      setDisplay(String(res));
      setHistory((prev) => [fullEq + " = " + res, ...prev.slice(0, 4)]);
      setEquation("");
    } catch {
      setDisplay("Error");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Calc Dashboard */}
        <div className="md:col-span-2 bg-zinc-900/60 border border-zinc-800 p-6 rounded-3xl flex flex-col justify-between backdrop-blur shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-500"></div>
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500 animate-pulse" />
              <span className="text-xs uppercase font-bold tracking-widest text-orange-400">Quantum Glass Core</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>

          <div className="space-y-2 text-right mb-6">
            <p className="text-sm text-zinc-500 font-mono h-5 overflow-hidden">{equation}</p>
            <p className="text-4xl md:text-5xl font-black text-zinc-100 font-mono tracking-tight overflow-x-auto select-all">
              {display}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <button onClick={handleClear} className="p-4 bg-zinc-800 hover:bg-zinc-700 text-orange-400 font-bold rounded-2xl cursor-pointer transition">C</button>
            <button onClick={() => handleOp("/")} className="p-4 bg-zinc-800 hover:bg-zinc-700 text-orange-400 font-bold rounded-2xl cursor-pointer transition">÷</button>
            <button onClick={() => handleOp("*")} className="p-4 bg-zinc-800 hover:bg-zinc-700 text-orange-400 font-bold rounded-2xl cursor-pointer transition">×</button>
            <button onClick={() => handleOp("-")} className="p-4 bg-zinc-800 hover:bg-zinc-700 text-orange-400 font-bold rounded-2xl cursor-pointer transition">-</button>

            <button onClick={() => handleNum("7")} className="p-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-2xl cursor-pointer transition">7</button>
            <button onClick={() => handleNum("8")} className="p-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-2xl cursor-pointer transition">8</button>
            <button onClick={() => handleNum("9")} className="p-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-2xl cursor-pointer transition">9</button>
            <button onClick={() => handleOp("+")} className="p-4 bg-zinc-800 hover:bg-zinc-700 text-orange-400 font-bold rounded-2xl cursor-pointer transition">+</button>

            <button onClick={() => handleNum("4")} className="p-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-2xl cursor-pointer transition">4</button>
            <button onClick={() => handleNum("5")} className="p-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-2xl cursor-pointer transition">5</button>
            <button onClick={() => handleNum("6")} className="p-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-2xl cursor-pointer transition">6</button>
            <button onClick={handleCalc} className="row-span-2 p-4 bg-gradient-to-br from-orange-500 to-amber-500 text-zinc-950 font-black rounded-2xl cursor-pointer hover:opacity-90 transition flex items-center justify-center text-lg">=</button>

            <button onClick={() => handleNum("1")} className="p-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-2xl cursor-pointer transition">1</button>
            <button onClick={() => handleNum("2")} className="p-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-2xl cursor-pointer transition">2</button>
            <button onClick={() => handleNum("3")} className="p-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-2xl cursor-pointer transition">3</button>

            <button onClick={() => handleNum("0")} className="col-span-2 p-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-2xl cursor-pointer transition">0</button>
            <button onClick={() => handleNum(".")} className="p-4 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-2xl cursor-pointer transition">.</button>
          </div>
        </div>

        {/* History / Info Sidebar */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-4 text-zinc-300">
              <History className="h-4 w-4 text-orange-400" /> Quantum Records
            </h3>
            <div className="space-y-2 font-mono text-xs text-zinc-400">
              {history.length === 0 ? (
                <p className="italic text-zinc-600">No formula transactions calculated.</p>
              ) : (
                history.map((h, idx) => (
                  <div key={idx} className="p-2 border border-zinc-800 bg-zinc-950/60 rounded-xl">
                    {h}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 mt-6 text-xs text-zinc-500 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-500" />
              <span>Full Precision Engine</span>
            </div>
            <p>Quantum Glass runs on direct Javascript evaluation pipelines, optimized for near-instant execution feedback loops.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
`
      }
    ]
  },
  {
    id: "utube-media",
    title: "Utube Media Platform",
    description: "Ultimate glassmorphic video streaming center featuring a custom HTML5 player, fluid vertical shorts, integrated synced lyrics music deck, and streaming creator boards.",
    category: "Streaming",
    files: [
      {
        path: "index.html",
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Utube Media - Beyond Streaming</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              accent: "#ef4444",
              brandBlack: "#050505",
              neonCyan: "#00f0ff",
              neonPurple: "#a855f7"
            }
          }
        }
      }
    </script>
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
  </head>
  <body class="bg-[#050505] text-zinc-100 antialiased font-sans select-none overflow-hidden">
    <div id="root"></div>
  </body>
</html>`
      },
      {
        path: "src/App.tsx",
        content: `import React, { useState, useEffect, useRef } from "react";
import { 
  Home, 
  Tv, 
  Radio, 
  Music, 
  ShoppingBag, 
  TrendingUp, 
  Megaphone, 
  LayoutDashboard, 
  Bell, 
  Search, 
  User, 
  Gift, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Download, 
  Plus, 
  Check, 
  Sparkles, 
  Send, 
  Disc, 
  Heart, 
  RotateCcw, 
  Award,
  ShoppingCart,
  DollarSign,
  Tv2
} from "lucide-react";

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  time: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "player" | "shorts" | "music" | "live" | "store" | "ads" | "dashboard">("home");
  const [accentColor, setAccentColor] = useState("#ef4444"); // Customizable
  const [coinBalance, setCoinBalance] = useState(1250);
  const [subscriberCount, setSubscriberCount] = useState(145000);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Custom video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(24);
  const [isTheatreMode, setIsTheatreMode] = useState(false);
  const [activeQuality, setActiveQuality] = useState("1080p");
  const [videoChapters] = useState([
    { title: "Intro Check", start: 0, end: 15 },
    { title: "Core Gameplay Demo", start: 15, end: 55 },
    { title: "Tech Architecture Breakdown", start: 55, end: 100 }
  ]);

  // Sync lyrics for Music Section
  const [musicProgress, setMusicProgress] = useState(15);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const musicList = [
    { title: "Metropolitan Nights", artist: "Hyperion Core", album: "Glass City Soundtracks", duration: "3:42", lyrics: [
      { time: 0, text: "🎵 [Ambient Intro Synthesizer]" },
      { time: 10, text: "Drifting through the fluorescent skyline..." },
      { time: 20, text: "Neon shadows reflect in your eyes..." },
      { time: 30, text: "We are the bytes in this organic system..." }
    ]},
    { title: "Solar Wind Overdrive", artist: "Kozmic Drift", album: "Helios Spheres", duration: "4:05", lyrics: [
      { time: 0, text: "🎵 [Heavy Bassline Intro]" },
      { time: 10, text: "Ignite the solar flares, booster check..." },
      { time: 20, text: "Riding waves beyond the heliosphere..." },
      { time: 30, text: "Time compression activated..." }
    ]}
  ];

  // Gift Floating Animations state
  const [floatingGifts, setFloatingGifts] = useState<{ id: string; label: string; x: number; size: number }[]>([]);
  const [giftPickerOpen, setGiftPickerOpen] = useState(false);
  const [giftFeed, setGiftFeed] = useState<{ id: string; user: string; gift: string; value: number }[]>([]);

  // Simulated Comments State
  const [comments, setComments] = useState<Comment[]>([
    { id: "1", author: "CyborgViper", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80", text: "The editing on this video is mindbending! YouTube feels like a legacy system from 2005 now.", likes: 412, time: "2 hours ago" },
    { id: "2", author: "NeonSavant", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80", text: "That chapter on modular state rendering is pure gold. Appreciate the speed selector going up to 4K too!", likes: 184, time: "4 hours ago" }
  ]);
  const [newCommentText, setNewCommentText] = useState("");

  // Shorts carousel state
  const [activeShortIndex, setActiveShortIndex] = useState(0);
  const shortsList = [
    { id: "s1", channel: "NovaLabs", desc: "Building a PWA with zero latency rendering pipeline. #webdev #pwa #typescript", likes: "128K", comments: "1.4K", src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
    { id: "s2", channel: "AeroMechanics", desc: "Booster alignment simulation checks 🚀 #spacecraft #aerospace #engineering", likes: "340K", comments: "4.2K", src: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=400&q=80" },
    { id: "s3", channel: "Synthetix", desc: "Live ambient sound synthesis using Web Audio APIs. Synth wave vibes only.", likes: "89K", comments: "982", src: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80" }
  ];

  // Ad campaign manager state
  const [adCampaigns, setAdCampaigns] = useState([
    { id: "ad1", name: "Cyberpunk Apparel Banner", budget: 1500, active: true, impressions: 245090, clicks: 12450 },
    { id: "ad2", name: "TypeScript Bootcamps Pre-Roll", budget: 3500, active: false, impressions: 590400, clicks: 23100 }
  ]);
  const [newAdName, setNewAdName] = useState("");
  const [newAdBudget, setNewAdBudget] = useState(500);

  // Store products
  const storeItems = [
    { id: "p1", name: "Exclusive Cyber Badge (Digital)", price: 150, type: "badge", image: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=150&q=80" },
    { id: "p2", name: "Utube Neon Mech Jacket (Physical)", price: 850, type: "merch", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=150&q=80" },
    { id: "p3", name: "Ultra Creator membership (1 Month)", price: 450, type: "pass", image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=150&q=80" }
  ];

  // Simulated live socket chat for player
  useEffect(() => {
    let interval: any;
    if (activeTab === "player" || activeTab === "live") {
      const userNames = ["ApexQuantum", "VoltStriker", "LuminaDev", "ZeroEntropy", "SpectraCoder"];
      const messages = [
        "Sending positive energy from Tokyo! 🌸",
        "Can we get a speed check on module 3?",
        "Sending a Neon Crown! Absolutely gorgeous content.",
        "That CSS overlay effect is crazy smooth.",
        "Is this streaming on the PWA background playback too? Yes it does!"
      ];
      interval = setInterval(() => {
        const randomUser = userNames[Math.floor(Math.random() * userNames.length)];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        
        // Add random comments to bottom of feed
        if (Math.random() > 0.4) {
          const newChat = {
            id: String(Date.now()),
            author: randomUser,
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
            text: randomMsg,
            likes: Math.floor(Math.random() * 5),
            time: "Just now"
          };
          setComments(prev => [...prev, newChat].slice(-10));
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  // Periodic Music lyrics update
  useEffect(() => {
    let interval: any;
    if (activeTab === "music") {
      interval = setInterval(() => {
        setMusicProgress(prev => (prev >= 100 ? 0 : prev + 2));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const triggerGift = (giftName: string, coinCost: number) => {
    if (coinBalance < coinCost) {
      alert("Insufficient coin balance! Complete tasks or top up wallet.");
      return;
    }
    setCoinBalance(prev => prev - coinCost);
    
    // Push floating animation instance
    const id = String(Date.now());
    const xPos = 20 + Math.random() * 60; // Random horizontal placement percentage
    const scale = 30 + Math.random() * 30; // Random particle size
    setFloatingGifts(prev => [...prev, { id, label: giftName, x: xPos, size: scale }]);
    
    // Add record to simulated stream gift feed
    setGiftFeed(prev => [
      { id, user: "You", gift: giftName, value: coinCost },
      ...prev
    ].slice(0, 5));

    // Clear particle after 3s
    setTimeout(() => {
      setFloatingGifts(prev => prev.filter(g => g.id !== id));
    }, 3000);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const commentObj: Comment = {
      id: String(Date.now()),
      author: "LocalMember_AI",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
      text: newCommentText,
      likes: 1,
      time: "Just now"
    };
    setComments(prev => [commentObj, ...prev]);
    setNewCommentText("");
  };

  const addAdCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdName.trim()) return;
    const newAd = {
      id: "ad-" + Date.now(),
      name: newAdName,
      budget: newAdBudget,
      active: true,
      impressions: 0,
      clicks: 0
    };
    setAdCampaigns(prev => [...prev, newAd]);
    setNewAdName("");
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-zinc-100 font-sans select-none overflow-hidden">
      
      {/* GLOWING AMBIENT BACKGROUNDS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ef4444]/5 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/3 rounded-full blur-[200px] pointer-events-none"></div>

      {/* TOP HEADER GLASS NAVIGATION */}
      <header className="h-14 bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-900 px-4 flex items-center justify-between z-50 flex-shrink-0 relative">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => setActiveTab("home")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] group-hover:scale-105 transition-all">
              <Tv className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-white text-base tracking-tighter">
              UTUBE <span className="text-red-500">MEDIA</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 bg-zinc-900/60 border border-zinc-800 rounded-full px-3.5 py-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-zinc-400 font-mono">PWA-ENABLED ENGINE</span>
          </div>
        </div>

        {/* Search & Customisation bar */}
        <div className="flex-1 max-w-md mx-6 hidden sm:block">
          <div className="relative flex items-center bg-zinc-900/80 border border-zinc-800 focus-within:border-red-500/40 rounded-full py-1.5 px-4 transition">
            <Search className="h-4 w-4 text-zinc-500 mr-2.5" />
            <input 
              type="text" 
              placeholder="AI Semantic video search..." 
              className="bg-transparent outline-none border-none text-xs text-zinc-200 placeholder-zinc-600 w-full"
            />
            <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono border border-zinc-800 px-1.5 py-0.5 rounded-md bg-zinc-950">CMD+K</span>
          </div>
        </div>

        {/* User, wallet and actions */}
        <div className="flex items-center space-x-4">
          
          {/* Accent Color Configurator */}
          <div className="flex space-x-1.5 bg-zinc-900/80 px-2 py-1.5 rounded-full border border-zinc-800">
            {["#ef4444", "#00f0ff", "#a855f7", "#10b981"].map(c => (
              <button 
                key={c}
                onClick={() => setAccentColor(c)}
                className="w-3.5 h-3.5 rounded-full border border-black/40 hover:scale-110 transition cursor-pointer"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 flex items-center space-x-2 text-xs">
            <Award className="h-4 w-4 text-amber-500 animate-pulse" />
            <span className="text-zinc-400 font-medium">Coins:</span>
            <span className="font-bold text-white font-mono">{coinBalance}</span>
          </div>

          <button 
            onClick={() => {
              alert("Utube Media is fully cached and installed on local standalone storage!");
            }}
            className="hidden lg:flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-full transition shadow-[0_0_15px_rgba(239,68,68,0.25)]"
          >
            <Check className="h-3.5 w-3.5" />
            <span>PWA Installed</span>
          </button>

          <div className="relative cursor-pointer">
            <Bell className="h-4 w-4 text-zinc-400 hover:text-white transition" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </div>

          <div className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center hover:border-red-500 transition cursor-pointer">
            <User className="h-4 w-4 text-zinc-300" />
          </div>
        </div>
      </header>

      {/* BODY PLATFORM VIEWPORTS */}
      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* COLLAPSIBLE SIDEBAR */}
        <aside className="w-16 md:w-56 bg-zinc-950/40 border-r border-zinc-900 flex flex-col justify-between py-4 flex-shrink-0 z-40 transition-all duration-300">
          <div className="space-y-1 px-2">
            
            {[
              { id: "home", label: "Explore Home", icon: Home },
              { id: "player", label: "Cinematic Player", icon: Tv2 },
              { id: "shorts", label: "Infinite Shorts", icon: Radio, animate: true },
              { id: "music", label: "Media Music App", icon: Music },
              { id: "live", label: "Live Broadcast", icon: Radio },
              { id: "store", label: "Members Store", icon: ShoppingBag },
              { id: "ads", label: "Advertising Center", icon: Megaphone },
              { id: "dashboard", label: "Creator Board", icon: LayoutDashboard }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={\`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer \${
                    isActive 
                      ? "bg-zinc-900 text-white font-semibold" 
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/30"
                  }\`}
                  style={{ borderLeft: isActive ? \`3px solid \${accentColor}\` : 'none' }}
                >
                  <Icon className={\`h-4.5 w-4.5 \${isActive ? "text-white" : "text-zinc-500"} \${tab.animate && isPlaying ? "animate-spin" : ""}\`} style={{ color: isActive ? accentColor : undefined }} />
                  <span className="hidden md:inline text-xs tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Channels info */}
          <div className="px-3 py-4 border-t border-zinc-900 hidden md:block">
            <div className="bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/40">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">UTUBE SUBSCRIBERS</span>
              </div>
              <p className="text-sm font-black text-white mt-1">{(subscriberCount / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </aside>

        {/* MAIN VIEWPORT PANELS */}
        <main className="flex-1 bg-[#050505] p-6 overflow-y-auto scrollbar-thin relative flex flex-col justify-between min-h-0">
          
          {/* EXPLORE HOME VIEW */}
          {activeTab === "home" && (
            <div className="space-y-6">
              
              {/* CATEGORY HORIZONTAL PILLS */}
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
                {["Trending All", "Synthetic Audio", "TypeScript PWA", "Space Launch Telemetry", "NextJS", "Retro Synthwave", "Vite Compiler Tools", "3D Web Animations"].map((cat, idx) => (
                  <button 
                    key={idx}
                    className={\`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition border \${
                      idx === 0 
                        ? "bg-white text-zinc-950 border-white" 
                        : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                    }\`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* MASONRY HERO AND GRID OF VIDEOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Hero Feature Card */}
                <div 
                  className="md:col-span-2 relative h-[320px] rounded-3xl overflow-hidden border border-zinc-800 group cursor-pointer bg-zinc-900"
                  onClick={() => setActiveTab("player")}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-102 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  
                  {/* Status Overlay */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-widest flex items-center space-x-1 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    <span>LIVE FEATURED</span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-xl md:text-2xl font-black text-white leading-tight uppercase tracking-tight group-hover:text-red-400 transition">
                      High-Performance Modular PWA Development: Crafting Utube Media in React 18
                    </h2>
                    <p className="text-xs text-zinc-400 mt-2 line-clamp-2 max-w-2xl">
                      Deep-dive into full-stack browser compiling, dynamic iframe commonJS module loading, synchronized web lyric engines, and real-time socket emulation architectures.
                    </p>
                    <div className="flex items-center space-x-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center font-bold text-xs">U</div>
                        <span className="text-xs font-semibold text-zinc-300">Utube Official Channels</span>
                      </div>
                      <span className="text-zinc-500 font-mono text-[11px]">42,501 watching now</span>
                    </div>
                  </div>
                </div>

                {/* Sub-featured Dynamic Cards */}
                {[
                  {
                    title: "Synthwave Sound Design: Web Audio API Synthesis",
                    thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
                    views: "185K views",
                    time: "2 days ago",
                    author: "Synthetix Audio"
                  },
                  {
                    title: "Interactive D3 Visualization Modules: Coding Command Flight Telemetries",
                    thumbnail: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80",
                    views: "94K views",
                    time: "1 week ago",
                    author: "Quantum Devs"
                  },
                  {
                    title: "Advanced Framer Motion Spring Dynamics: Crafting 60fps Mobile Web Layouts",
                    thumbnail: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80",
                    views: "340K views",
                    time: "3 days ago",
                    author: "MotionLab"
                  }
                ].map((vid, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setActiveTab("player")}
                    className="bg-zinc-900/50 hover:bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-3 flex flex-col justify-between group cursor-pointer hover:border-zinc-700 transition"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950">
                      <img src={vid.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300" />
                      <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded font-mono text-[10px] text-zinc-300">12:45</span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 flex items-center justify-center font-bold text-xs">{vid.author[0]}</div>
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed group-hover:text-red-400 transition">
                          {vid.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-1 font-semibold">{vid.author}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">{vid.views} • {vid.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CINEMATIC HTML5 VIDEO PLAYER VIEW */}
          {activeTab === "player" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
              
              {/* FLOAT GIFTS STAGE OVERLAY OVER PLAYER */}
              <div className="absolute inset-0 pointer-events-none z-30">
                {floatingGifts.map(gift => (
                  <div 
                    key={gift.id}
                    className="absolute bottom-24 animate-bounce text-center flex flex-col items-center"
                    style={{ 
                      left: \`\${gift.x}%\`, 
                      animation: 'floatUp 3s ease-out forwards',
                    }}
                  >
                    <div className="p-3 bg-gradient-to-tr from-amber-500 to-red-500 rounded-full border border-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.6)] text-white font-extrabold text-sm scale-110">
                      🎁 {gift.label}
                    </div>
                    <span className="text-[9px] uppercase font-bold text-yellow-300 tracking-wider bg-black/60 px-1.5 py-0.5 rounded border border-yellow-300/30 mt-1">GIFTED!</span>
                  </div>
                ))}
              </div>

              {/* Left Column: Player & Metadata */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* VIDEO CANVAS BOX */}
                <div className={\`relative rounded-3xl overflow-hidden border border-zinc-800 bg-black \${isTheatreMode ? "aspect-video" : "aspect-video"}\`}>
                  
                  {/* Backdrop Dummy Video Image spacer */}
                  <img 
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80" 
                    className="absolute inset-0 w-full h-full object-cover opacity-65"
                  />

                  {/* Playback animation spinner when compiling */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <button 
                        onClick={() => setIsPlaying(true)}
                        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white cursor-pointer shadow-[0_0_30px_rgba(239,68,68,0.5)] transform hover:scale-105 transition"
                      >
                        <Play className="h-8 w-8 fill-white ml-1" />
                      </button>
                    </div>
                  )}

                  {/* CUSTOM CONTROLS OVERLAY BAR */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 flex flex-col justify-end space-y-3 z-20">
                    
                    {/* Scrub bar with chapter markers */}
                    <div className="relative h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer">
                      <div className="absolute inset-y-0 left-0 bg-red-600 rounded-full transition-all" style={{ width: \`\${progress}%\` }}></div>
                      
                      {/* Chapter Markers */}
                      <div className="absolute inset-0 flex justify-between pointer-events-none">
                        <div className="w-[1px] h-full bg-black"></div>
                        <div className="w-[1px] h-full bg-black"></div>
                        <div className="w-[1px] h-full bg-black"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-4">
                        <button onClick={() => setIsPlaying(!isPlaying)} className="text-white hover:text-red-500 transition cursor-pointer">
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-red-500 transition cursor-pointer">
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </button>
                          <input 
                            type="range" 
                            min="0" max="100" 
                            value={isMuted ? 0 : volume} 
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="w-16 h-1 accent-red-600 bg-zinc-800 rounded-lg cursor-pointer"
                          />
                        </div>

                        <span className="font-mono text-zinc-400">03:45 / 15:00</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* Quality indicator */}
                        <select 
                          value={activeQuality} 
                          onChange={(e) => setActiveQuality(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] px-2 py-1 rounded cursor-pointer"
                        >
                          <option value="4K">4K UHD</option>
                          <option value="1080p">1080p HD</option>
                          <option value="720p">720p</option>
                        </select>

                        {/* Speeds */}
                        <select 
                          value={playbackSpeed} 
                          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] px-2 py-1 rounded cursor-pointer"
                        >
                          <option value="0.5">0.5x</option>
                          <option value="1">1.0x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2.0x</option>
                        </select>

                        <button onClick={() => setIsTheatreMode(!isTheatreMode)} className="text-zinc-400 hover:text-white transition cursor-pointer">
                          <Plus className="h-4 w-4" />
                        </button>

                        <button className="text-zinc-400 hover:text-white transition cursor-pointer">
                          <Maximize className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Below Player Area */}
                <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-3xl space-y-4">
                  <div>
                    <h1 className="text-lg font-black text-white leading-snug">
                      High-Performance Modular PWA Development: Crafting Utube Media in React 18
                    </h1>
                    <div className="flex items-center justify-between flex-wrap gap-4 mt-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-extrabold text-sm">U</div>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-1">
                            Utube Official <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-[8px] flex items-center justify-center text-white font-bold">✓</span>
                          </h3>
                          <p className="text-[10px] text-zinc-500 font-mono">145K subscribers</p>
                        </div>

                        <button 
                          onClick={() => {
                            setIsSubscribed(!isSubscribed);
                            setSubscriberCount(prev => isSubscribed ? prev - 1 : prev + 1);
                          }}
                          className={\`ml-4 px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer \${
                            isSubscribed ? "bg-zinc-800 text-zinc-400" : "bg-red-600 hover:bg-red-500 text-white"
                          }\`}
                        >
                          {isSubscribed ? "Subscribed" : "Subscribe"}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-full hover:border-zinc-700 transition cursor-pointer text-xs">
                          <ThumbsUp className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-bold text-zinc-300">4.1K</span>
                        </button>
                        <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-full hover:border-zinc-700 transition cursor-pointer text-xs">
                          <Share2 className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-bold text-zinc-300">Share</span>
                        </button>
                        <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-full hover:border-zinc-700 transition cursor-pointer text-xs">
                          <Download className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-bold text-zinc-300">Store Offline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expandable description box */}
                  <div className="bg-zinc-950/60 p-4 border border-zinc-800/80 rounded-2xl text-xs text-zinc-400 leading-relaxed font-sans">
                    <p className="font-bold text-zinc-200">12,501 views • Streamed live on Jul 2, 2026</p>
                    <p className="mt-1">
                      In this masterclass lesson, we explore how to configure state-of-the-art streaming layouts, setup custom HTML5 media element scrub points, map UMD dependencies dynamically to frame scopes, and enable persistent SQLite store bindings in Node.
                    </p>
                  </div>
                </div>

                {/* COMMENTS MODULE */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <MessageSquare className="h-4.5 w-4.5 text-red-500" /> Conversation Thread ({comments.length})
                  </h3>

                  <form onSubmit={handlePostComment} className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Share your thoughts about this lesson..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500/40"
                    />
                    <button type="submit" className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1">
                      <Send className="h-3.5 w-3.5" /> Post
                    </button>
                  </form>

                  <div className="space-y-3">
                    {comments.map(c => (
                      <div key={c.id} className="p-3 bg-zinc-900/30 border border-zinc-800/40 rounded-2xl flex gap-3">
                        <img src={c.avatar} className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-zinc-200">{c.author}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">{c.time}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">{c.text}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <button className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300">
                              <ThumbsUp className="h-3 w-3" /> {c.likes}
                            </button>
                            <span className="text-[9px] uppercase font-bold text-red-500 bg-red-950/30 px-1.5 py-0.5 rounded border border-red-900/20">CREATOR LOVED</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Gifting & Live Stream Chat Widgets */}
              <div className="space-y-6">
                
                {/* ADVANCED UNIQUE GIFTING BOX */}
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-xl"></div>
                  
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                    <h3 className="font-black text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Gift className="h-4.5 w-4.5 text-amber-500 animate-pulse" /> Platform Gifting Studio
                    </h3>
                    <span className="text-[10px] text-zinc-500 font-mono">1 Coin = $0.01</span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    Send animated virtual gifts directly to the stream. Each gift produces active floating particle simulations on the screen real-time!
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { name: "Super Love", cost: 10, icon: "❤️" },
                      { name: "Neon Cupcake", cost: 50, icon: "🧁" },
                      { name: "Gold Rocket", cost: 100, icon: "🚀" },
                      { name: "Neon Crown", cost: 500, icon: "👑" }
                    ].map(gift => (
                      <button 
                        key={gift.name}
                        onClick={() => triggerGift(gift.name, gift.cost)}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 p-3 rounded-2xl flex flex-col items-center justify-between transition cursor-pointer"
                      >
                        <span className="text-2xl">{gift.icon}</span>
                        <span className="text-[11px] font-bold text-white mt-1.5">{gift.name}</span>
                        <span className="text-[9px] text-zinc-500 font-mono mt-0.5">{gift.cost} Coins</span>
                      </button>
                    ))}
                  </div>

                  {/* Top Gifters Leaderboard */}
                  <div className="border-t border-zinc-800 pt-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Supreme Stream Gifters</h4>
                    <div className="space-y-2">
                      {[
                        { rank: "#1", name: "AlphaCyborg", value: "2,500 Coins" },
                        { rank: "#2", name: "QuantumDev", value: "1,850 Coins" },
                        { rank: "#3", name: "You", value: \`\${1250 - coinBalance} Coins\` }
                      ].map((gif, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 bg-zinc-950/60 border border-zinc-800 rounded-xl">
                          <span className="font-bold text-red-500 font-mono">{gif.rank}</span>
                          <span className="text-zinc-300 font-medium">{gif.name}</span>
                          <span className="font-mono text-zinc-500">{gif.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* LIVE BROADCAST CHAT STREAM SIMULATOR */}
                <div className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
                      <h3 className="font-mono text-xs uppercase font-bold text-white">Broadcast Live Chat</h3>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-mono">SLOW MODE: ON</span>
                  </div>

                  <div className="h-48 overflow-y-auto space-y-2 scrollbar-thin">
                    {comments.slice(0, 5).map((chat, idx) => (
                      <p key={idx} className="text-xs leading-relaxed">
                        <span className="font-bold text-red-500 font-mono mr-1.5">{chat.author}:</span>
                        <span className="text-zinc-300 font-sans">{chat.text}</span>
                      </p>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* INFINITE SHORTS PANEL */}
          {activeTab === "shorts" && (
            <div className="max-w-md mx-auto aspect-[9/16] h-[650px] bg-black border border-zinc-800 rounded-[32px] overflow-hidden relative shadow-2xl">
              
              {/* Vertical cover image simulating Shorts stream */}
              <img 
                src={shortsList[activeShortIndex].src} 
                className="absolute inset-0 w-full h-full object-cover opacity-75"
              />

              {/* Progress bar at the top */}
              <div className="absolute top-4 left-4 right-4 h-1 bg-zinc-800 rounded-full overflow-hidden z-20">
                <div className="h-full bg-red-600 transition-all" style={{ width: "42%" }}></div>
              </div>

              {/* Content overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-between p-6 z-10">
                <div className="flex justify-between items-start">
                  <div className="bg-red-600/30 border border-red-500/40 text-red-400 font-mono font-bold text-[9px] px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    VERTICAL SHORTS
                  </div>
                  
                  <button 
                    onClick={() => setActiveShortIndex(prev => (prev + 1) % shortsList.length)}
                    className="p-1.5 bg-zinc-950/80 border border-zinc-800 rounded-full text-xs font-bold text-white hover:border-red-500 transition cursor-pointer"
                  >
                    Next Short →
                  </button>
                </div>

                {/* Bottom descriptor and interaction buttons */}
                <div className="flex justify-between items-end gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs text-white">U</div>
                      <div>
                        <h4 className="text-xs font-bold text-white">@{shortsList[activeShortIndex].channel}</h4>
                        <span className="text-[9px] uppercase font-mono font-bold text-emerald-400 bg-emerald-950/20 px-1 py-0.5 rounded border border-emerald-900/10">Creator verified</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-300 leading-relaxed font-sans line-clamp-2">
                      {shortsList[activeShortIndex].desc}
                    </p>

                    <div className="flex items-center space-x-1.5 text-zinc-500 text-[10px] font-mono font-semibold">
                      <Disc className="h-3 w-3 text-red-500 animate-spin" />
                      <span>Original sound synthesis deck - 24K remixes</span>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex flex-col items-center space-y-4 flex-shrink-0">
                    <button className="flex flex-col items-center group">
                      <div className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-white group-hover:border-red-500 transition cursor-pointer">
                        <Heart className="h-4.5 w-4.5 text-red-500 fill-red-500" />
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold font-mono mt-1">{shortsList[activeShortIndex].likes}</span>
                    </button>

                    <button className="flex flex-col items-center group">
                      <div className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-white group-hover:border-red-500 transition cursor-pointer">
                        <MessageSquare className="h-4.5 w-4.5 text-zinc-400" />
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold font-mono mt-1">{shortsList[activeShortIndex].comments}</span>
                    </button>

                    <button className="flex flex-col items-center group">
                      <div className="w-10 h-10 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-white group-hover:border-red-500 transition cursor-pointer">
                        <Gift className="h-4.5 w-4.5 text-amber-500" />
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold font-mono mt-1">Gift Coin</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* MEDIA MUSIC PLAYER TAKEOVER */}
          {activeTab === "music" && (
            <div className="max-w-2xl mx-auto bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[500px]">
              
              <div className="absolute top-0 right-0 w-44 h-44 bg-purple-600/10 rounded-full blur-3xl"></div>
              
              <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                <div className="flex items-center space-x-2.5">
                  <Music className="h-5.5 w-5.5 text-purple-400 animate-pulse" />
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">UTUBE GLASS MUSIC</h2>
                    <p className="text-[10px] text-zinc-500 font-mono">PWA background playback enabled</p>
                  </div>
                </div>

                <div className="flex space-x-1">
                  <button 
                    onClick={() => setCurrentSongIndex(0)}
                    className={\`px-3 py-1 rounded-md text-[10px] font-bold font-mono uppercase \${currentSongIndex === 0 ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"}\`}
                  >
                    Track 1
                  </button>
                  <button 
                    onClick={() => setCurrentSongIndex(1)}
                    className={\`px-3 py-1 rounded-md text-[10px] font-bold font-mono uppercase \${currentSongIndex === 1 ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400"}\`}
                  >
                    Track 2
                  </button>
                </div>
              </div>

              {/* Center Vinyl & Synced Lyrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center my-6">
                
                {/* 3D Vinyl animation */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 p-6 rounded-full border border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                    <div className="w-44 h-44 bg-zinc-950 rounded-full border-4 border-zinc-900 flex items-center justify-center animate-[spin_8s_linear_infinite]">
                      <Disc className="w-32 h-32 text-purple-400/80" />
                    </div>
                    <div className="absolute inset-0 m-auto w-10 h-10 bg-purple-500 rounded-full border-4 border-[#050505]"></div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-base font-black text-white">{musicList[currentSongIndex].title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{musicList[currentSongIndex].artist}</p>
                  </div>
                </div>

                {/* Synced scrolling lyrics viewer */}
                <div className="bg-zinc-950/60 border border-zinc-850 p-4 h-56 rounded-2xl flex flex-col justify-center space-y-4 font-mono text-xs overflow-y-auto scrollbar-thin">
                  {musicList[currentSongIndex].lyrics.map((lyr, index) => {
                    const isPassed = musicProgress >= lyr.time;
                    return (
                      <p 
                        key={index}
                        className={\`transition duration-300 \${
                          isPassed ? "text-purple-400 font-bold opacity-100" : "text-zinc-600 opacity-60"
                        }\`}
                      >
                        {lyr.text}
                      </p>
                    );
                  })}
                </div>

              </div>

              {/* Music scrubbing controller deck */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: \`\${musicProgress}%\` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>{musicProgress < 30 ? "00:45" : musicProgress < 60 ? "01:22" : "02:40"}</span>
                    <span>{musicList[currentSongIndex].duration}</span>
                  </div>
                </div>

                <div className="flex justify-center items-center space-x-6">
                  <button className="text-zinc-500 hover:text-white transition cursor-pointer"><RotateCcw className="h-4.5 w-4.5" /></button>
                  <button 
                    onClick={() => setMusicProgress(prev => Math.max(0, prev - 10))}
                    className="text-zinc-400 hover:text-white transition cursor-pointer font-bold"
                  >
                    ◀◀ Seek
                  </button>
                  
                  <button 
                    onClick={() => setMusicProgress(prev => (prev >= 100 ? 0 : prev + 15))}
                    className="w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-full text-white flex items-center justify-center shadow-lg transition cursor-pointer"
                  >
                    <Play className="h-5 w-5 fill-white ml-0.5" />
                  </button>

                  <button 
                    onClick={() => setMusicProgress(prev => Math.min(100, prev + 10))}
                    className="text-zinc-400 hover:text-white transition cursor-pointer font-bold"
                  >
                    Seek ▶▶
                  </button>
                  <button className="text-zinc-500 hover:text-white transition cursor-pointer"><Heart className="h-4.5 w-4.5" /></button>
                </div>
              </div>

            </div>
          )}

          {/* STREAMER BROADCAST LIVE STREAM BOARD */}
          {activeTab === "live" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-4">
                <div className="relative aspect-video bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex items-center justify-center">
                  
                  <div className="absolute top-4 left-4 bg-red-600 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    <span>BROADCAST CONSOLE</span>
                  </div>

                  <div className="text-center space-y-3 p-6 z-10">
                    <Radio className="h-10 w-10 text-red-500 mx-auto animate-pulse" />
                    <h3 className="text-base font-black text-white">READY FOR STREAM TRANSMISSION</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                      Sync your local web camera, set up server-side RTMP endpoint channels, and trigger live sessions instantly.
                    </p>
                    <button 
                      onClick={() => alert("Simulated streaming live: Broadcast camera feed initialized.")}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Initialize Camera Stream
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-3xl">
                  <h4 className="text-xs uppercase font-bold text-white font-mono mb-3">Simulated Broadcast Health</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase">Viewer count</p>
                      <p className="text-lg font-black text-emerald-400 mt-1 font-mono">2,400</p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase">Network health</p>
                      <p className="text-lg font-black text-emerald-400 mt-1 font-mono">Excellent</p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase">Stream Quality</p>
                      <p className="text-lg font-black text-emerald-400 mt-1 font-mono">1080p</p>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800">
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase">Frame Latency</p>
                      <p className="text-lg font-black text-amber-500 mt-1 font-mono">42ms</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat replay right dashboard */}
              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl flex flex-col h-[400px] justify-between">
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-white border-b border-zinc-800 pb-3 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Streamer Chat Deck
                  </h3>
                  <div className="space-y-3 overflow-y-auto max-h-64 scrollbar-thin">
                    <p className="text-xs text-zinc-400 font-sans"><span className="font-bold text-red-400 font-mono">System:</span> Broadcast channels successfully preloaded.</p>
                    <p className="text-xs text-zinc-400 font-sans"><span className="font-bold text-purple-400 font-mono">DevLumina:</span> Iframe transpilers running successfully!</p>
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-3">
                  <p className="text-[10px] text-zinc-500 italic leading-relaxed">
                    Note: Simulated stream utilizes mock WebSocket protocols inside the sandbox iframe for live analytics and chat telemetry logs.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* STORE TAB VIEW */}
          {activeTab === "store" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <div>
                  <h2 className="text-base font-black text-white">CREATOR COMMERCE STORE</h2>
                  <p className="text-xs text-zinc-500">Buy exclusive merchandise, emotes, badges, and unlock exclusive channel membership passes.</p>
                </div>
                
                <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full hover:border-red-500 transition cursor-pointer text-xs flex items-center gap-1.5 font-bold">
                  <ShoppingCart className="h-4 w-4 text-red-500" /> Checkout Cart
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {storeItems.map(item => (
                  <div 
                    key={item.id}
                    className="bg-zinc-900/40 hover:bg-zinc-900/90 border border-zinc-800 rounded-3xl p-4 flex flex-col justify-between group transition"
                  >
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/80">
                      <img src={item.image} className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition duration-300" />
                      <span className="absolute bottom-3 left-3 bg-red-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">
                        {item.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <h4 className="text-xs font-black text-zinc-100 group-hover:text-red-400 transition">{item.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Secure payment with Stripe & Crypto</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-zinc-850 pt-3">
                        <span className="font-mono text-white text-sm font-bold">{item.price} Coins</span>
                        
                        <button 
                          onClick={() => {
                            if (coinBalance < item.price) {
                              alert("Insufficient coin balance to purchase this item! Trade or purchase coin packages.");
                              return;
                            }
                            setCoinBalance(prev => prev - item.price);
                            alert(\`Success! Purchased \${item.name}. Coins debited successfully!\`);
                          }}
                          className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-lg"
                        >
                          Unlock Item
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ADVERTISING SPONSORSHIP MANAGER */}
          {activeTab === "ads" && (
            <div className="space-y-6">
              
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 shadow-2xl">
                <h3 className="font-black text-xs uppercase tracking-wider text-white border-b border-zinc-800 pb-3 mb-4 flex items-center gap-1.5">
                  <Megaphone className="h-4.5 w-4.5 text-red-500 animate-pulse" /> Create New Advertising Campaign
                </h3>

                <form onSubmit={addAdCampaign} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Campaign Banner Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. NextJS Interactive UI Workshop"
                      value={newAdName}
                      onChange={(e) => setNewAdName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-red-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 font-mono">Daily Coin Budget</label>
                    <input 
                      type="number" 
                      value={newAdBudget}
                      onChange={(e) => setNewAdBudget(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-red-500/40 font-mono"
                    />
                  </div>

                  <button type="submit" className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer shadow-lg">
                    <Plus className="h-4 w-4" /> Initialize Campaign
                  </button>
                </form>
              </div>

              {/* Active Campaigns list */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider font-mono">
                  <TrendingUp className="h-4.5 w-4.5 text-red-500" /> Active Campaigns & Analytics
                </h3>

                <div className="space-y-3">
                  {adCampaigns.map(camp => (
                    <div key={camp.id} className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={\`w-2 h-2 rounded-full \${camp.active ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"}\`}></span>
                          <span className="text-xs font-black text-white">{camp.name}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">Budget: {camp.budget} Coins/day • Active and scheduling</p>
                      </div>

                      <div className="flex gap-4 font-mono text-center">
                        <div className="bg-zinc-950/60 border border-zinc-850 px-3 py-1.5 rounded-xl">
                          <p className="text-[9px] text-zinc-500 font-semibold uppercase">Impressions</p>
                          <p className="text-xs font-black text-white mt-0.5">{camp.impressions.toLocaleString()}</p>
                        </div>
                        <div className="bg-zinc-950/60 border border-zinc-850 px-3 py-1.5 rounded-xl">
                          <p className="text-[9px] text-zinc-500 font-semibold uppercase">Clicks</p>
                          <p className="text-xs font-black text-red-400 mt-0.5">{camp.clicks.toLocaleString()}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setAdCampaigns(prev => prev.map(a => a.id === camp.id ? { ...a, active: !a.active } : a));
                          }}
                          className={\`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition \${
                            camp.active ? "bg-zinc-800 text-zinc-400 border border-zinc-750" : "bg-red-600 text-white"
                          }\`}
                        >
                          {camp.active ? "Pause" : "Resume"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* MEMBER DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-tr from-zinc-900 to-zinc-950 p-6 rounded-3xl border border-zinc-800 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl"></div>
                
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Welcome back, Streamer Dev!</h2>
                <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                  Your channel and video dashboards are initialized and synced perfectly with local caching service worker pipelines.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Earnings</p>
                    <p className="text-xl font-black text-white mt-1.5 font-mono">$1,245.90</p>
                    <span className="text-[9px] text-emerald-400 font-mono font-bold">▲ +12% this month</span>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Platform Coins Balance</p>
                    <p className="text-xl font-black text-yellow-400 mt-1.5 font-mono">{coinBalance} Coins</p>
                    <span className="text-[9px] text-zinc-500 font-mono">Value approx $12.50</span>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subscribers Count</p>
                    <p className="text-xl font-black text-red-500 mt-1.5 font-mono">{(subscriberCount / 1000).toFixed(0)}K</p>
                    <span className="text-[9px] text-zinc-500 font-mono">Steady growth telemetry</span>
                  </div>
                </div>
              </div>

              {/* Creator Analytics charts mock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-3xl">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">Revenue Streams (7 Days)</h4>
                  <div className="h-32 flex items-end justify-between gap-1.5 px-4 font-mono text-[9px] text-zinc-500">
                    {[
                      { day: "Mon", rev: 45 },
                      { day: "Tue", rev: 62 },
                      { day: "Wed", rev: 80 },
                      { day: "Thu", rev: 55 },
                      { day: "Fri", rev: 94 },
                      { day: "Sat", rev: 110 },
                      { day: "Sun", rev: 132 }
                    ].map(day => (
                      <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="w-full bg-red-600 rounded-t-md transition-all duration-500" style={{ height: \`\${day.rev}px\` }}></div>
                        <span>{day.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-3xl">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3">Creator Tasks Checklist</h4>
                  <div className="space-y-2.5 text-xs text-zinc-400">
                    <div className="flex items-center space-x-2 p-2 bg-zinc-950/60 rounded-xl border border-zinc-800">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Setup Web App caching service workers</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-zinc-950/60 rounded-xl border border-zinc-800">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Configure UMD lucide-react module fallback binders</span>
                    </div>
                    <div className="flex items-center space-x-2 p-2 bg-zinc-950/60 rounded-xl border border-zinc-800">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Transpile dynamic templates through standalone Babel</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
`
      }
    ]
  }
];

