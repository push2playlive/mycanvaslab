import React, { useState, useEffect, useRef } from "react";
import { 
  BarChart2, 
  Layers, 
  Maximize2, 
  Minimize2, 
  Activity, 
  FileText, 
  GitCommit, 
  GitPullRequest, 
  Folder, 
  Cpu, 
  HelpCircle,
  FileCode,
  Sparkles,
  RefreshCw,
  Clock
} from "lucide-react";
import { VirtualFile } from "../types";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";

interface DashboardProps {
  files: VirtualFile[];
  onSelectFile?: (path: string) => void;
  onClose?: () => void;
}

interface FileMetric {
  path: string;
  name: string;
  lines: number;
  sizeBytes: number;
  extension: string;
}

export default function Dashboard({ files, onSelectFile, onClose }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"tree" | "dependencies">("tree");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    totalFiles: number;
    totalLines: number;
    avgLines: number;
    largestFile: FileMetric | null;
    byExtension: Record<string, { count: number; lines: number; size: number }>;
  }>({
    totalFiles: 0,
    totalLines: 0,
    avgLines: 0,
    largestFile: null,
    byExtension: {},
  });

  const treeContainerRef = useRef<HTMLDivElement>(null);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  // Re-calculate statistics on files list change
  useEffect(() => {
    if (!files || files.length === 0) return;

    let totalLines = 0;
    let largestFile: FileMetric | null = null;
    const byExtension: Record<string, { count: number; lines: number; size: number }> = {};

    const list: FileMetric[] = files.map(file => {
      const lines = file.content.split("\n").length;
      const sizeBytes = new Blob([file.content]).size;
      const extension = file.path.split(".").pop() || "unknown";

      const metric: FileMetric = {
        path: file.path,
        name: file.path.split("/").pop() || file.path,
        lines,
        sizeBytes,
        extension,
      };

      totalLines += lines;

      if (!largestFile || lines > largestFile.lines) {
        largestFile = metric;
      }

      if (!byExtension[extension]) {
        byExtension[extension] = { count: 0, lines: 0, size: 0 };
      }
      byExtension[extension].count += 1;
      byExtension[extension].lines += lines;
      byExtension[extension].size += sizeBytes;

      return metric;
    });

    setMetrics({
      totalFiles: files.length,
      totalLines,
      avgLines: Math.round(totalLines / files.length),
      largestFile,
      byExtension,
    });
  }, [files]);

  // --- D3 VISUALIZATION 1: COLLAPSIBLE DIRECTORY COMPONENT TREE ---
  useEffect(() => {
    if (activeTab !== "tree" || !treeContainerRef.current || files.length === 0) return;

    // Clear previous SVG
    d3.select(treeContainerRef.current).selectAll("*").remove();

    const width = treeContainerRef.current.clientWidth || 400;
    const height = treeContainerRef.current.clientHeight || 500;
    const margin = { top: 20, right: 80, bottom: 20, left: 30 };

    // Build hierarchical JSON data
    const buildHierarchyData = () => {
      const rootNode: any = { name: "Workspace Root", path: "root", children: [] };
      
      files.forEach(file => {
        const parts = file.path.split("/");
        let current = rootNode;

        parts.forEach((part, index) => {
          const isFile = index === parts.length - 1;
          const currentPath = parts.slice(0, index + 1).join("/");
          let existing = current.children.find((c: any) => c.name === part);

          if (!existing) {
            existing = { 
              name: part, 
              path: currentPath, 
              children: isFile ? undefined : [],
              isFile,
              lines: isFile ? file.content.split("\n").length : undefined
            };
            current.children.push(existing);
          }
          if (!isFile) {
            current = existing;
          }
        });
      });
      return rootNode;
    };

    const data = buildHierarchyData();
    const root: any = d3.hierarchy(data);

    // Dynamic sizing based on data nodes count
    const dx = 38;
    const dy = width / (root.height + 1.2);
    const tree = d3.tree().nodeSize([dx, dy]);

    const svg = d3.select(treeContainerRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto; font-family: monospace; font-size: 10px; overflow: visible;");

    const gLink = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.06)")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1.5);

    const gNode = svg.append("g")
      .attr("cursor", "pointer")
      .attr("pointer-events", "all");

    // Add Zoom and Pan behavior
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        gLink.attr("transform", event.transform);
        gNode.attr("transform", event.transform);
      });

    svg.call(zoomBehavior as any);

    // Initialize root position
    root.x0 = height / 2;
    root.y0 = 0;

    // Helper to toggle children Collapse/Expand
    const toggleCollapse = (d: any) => {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    };

    const update = (source: any) => {
      const nodes: any[] = root.descendants().reverse();
      const links: any[] = root.links();

      // Compute the new tree layout
      tree(root as any);

      let left = root;
      let right = root;
      root.eachBefore(node => {
        if (node.x < left.x) left = node;
        if (node.x > right.x) right = node;
      });

      const transition = svg.transition()
        .duration(450)
        .attr("viewBox", `0 0 ${width} ${height}`);

      // Render Nodes
      const node = gNode.selectAll("g")
        .data(nodes, (d: any) => d.data.path);

      // Enter any new nodes at the parent's previous position
      const nodeEnter = node.enter().append("g")
        .attr("transform", d => `translate(${source.y0 + margin.left},${source.x0})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .on("click", (event, d: any) => {
          if (d.children || d._children) {
            toggleCollapse(d);
            update(d);
          } else {
            // Click file to select or highlight
            setSelectedNode(d.data.path);
          }
        });

      // Node Circles (with custom pulsing/glow accents depending on folder vs file)
      nodeEnter.append("circle")
        .attr("r", d => d.data.isFile ? 5 : 7)
        .attr("fill", d => d.data.isFile 
          ? "var(--accent)" 
          : (d._children ? "#1f1f23" : "rgba(255,255,255,0.06)")
        )
        .attr("stroke", d => d.data.isFile ? "transparent" : "var(--accent)")
        .attr("stroke-width", d => d.data.isFile ? 0 : 1.5)
        .attr("filter", d => d.data.isFile ? "drop-shadow(0 0 4px var(--accent))" : "none");

      // Node Labels
      nodeEnter.append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.children || d._children ? -12 : 12)
        .attr("text-anchor", d => d.children || d._children ? "end" : "start")
        .text(d => d.data.name)
        .attr("fill", d => d.data.isFile ? "#e4e4e7" : "#a1a1aa")
        .attr("font-size", d => d.data.isFile ? "11px" : "10px")
        .attr("font-weight", d => d.data.isFile ? "bold" : "normal")
        .clone(true).lower()
        .attr("stroke", "#0d0d0d")
        .attr("stroke-width", 3);

      // Add file line indicator badge if file
      nodeEnter.filter(d => !!d.data.isFile)
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", d => 20 + (d.data.name.length * 5.5))
        .attr("fill", "#52525b")
        .attr("font-size", "8px")
        .text(d => `(${d.data.lines} LOC)`);

      // Transition nodes to their new position
      const nodeUpdate = node.merge(nodeEnter as any).transition(transition as any)
        .attr("transform", d => `translate(${d.y + margin.left},${d.x})`)
        .attr("fill-opacity", 1)
        .attr("stroke-opacity", 1);

      nodeUpdate.select("circle")
        .attr("fill", d => d.data.isFile 
          ? "var(--accent)" 
          : (d._children ? "var(--accent-glow)" : "#141416")
        )
        .attr("stroke", d => d.data.isFile ? "transparent" : "var(--accent)")
        .attr("filter", d => d.data.isFile || d._children ? "drop-shadow(0 0 5px var(--accent))" : "none");

      // Transition exiting nodes to the parent's new position
      const nodeExit = node.exit().transition(transition as any).remove()
        .attr("transform", d => `translate(${source.y + margin.left},${source.x})`)
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0);

      // Update the links
      const link = gLink.selectAll("path")
        .data(links, (d: any) => d.target.id);

      // Enter any new links at the parent's previous position
      const linkEnter = link.enter().append("path")
        .attr("d", d => {
          const o = { x: source.x0, y: source.y0 };
          return d3.linkHorizontal()({ source: [o.y, o.x], target: [o.y, o.x] } as any);
        });

      // Transition links to their new position
      link.merge(linkEnter as any).transition(transition as any)
        .attr("stroke", d => {
          // Highlight links to selected file node
          if (selectedNode && d.target.data.path === selectedNode) {
            return "var(--accent)";
          }
          return "rgba(255, 255, 255, 0.12)";
        })
        .attr("stroke-width", d => (selectedNode && d.target.data.path === selectedNode) ? 2.5 : 1.2)
        .attr("d", d3.linkHorizontal()
          .x((d: any) => d.y + margin.left)
          .y((d: any) => d.x) as any
        );

      // Transition exiting nodes to the parent's new position
      link.exit().transition(transition as any).remove()
        .attr("d", d => {
          const o = { x: source.x, y: source.y };
          return d3.linkHorizontal()({ source: [o.y, o.x], target: [o.y, o.x] } as any);
        });

      // Stash the old positions for transitions
      root.eachBefore(d => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    };

    // Collapse some branches initially (like components folder or helper folders if any)
    root.children?.forEach(child => {
      if (child.data.name === "components" || child.children && child.children.length > 5) {
        toggleCollapse(child);
      }
    });

    // Run initial rendering centering in SVG viewport
    update(root);
    
    // Auto-center Zoom slightly
    const initTransform = d3.zoomIdentity.translate(width * 0.1, height * 0.12).scale(0.85);
    svg.call(zoomBehavior.transform as any, initTransform);

  }, [activeTab, files, selectedNode]);


  // --- D3 VISUALIZATION 2: FILE DEPENDENCY FORCE-DIRECTED GRAPH ---
  useEffect(() => {
    if (activeTab !== "dependencies" || !graphContainerRef.current || files.length === 0) return;

    // Clear previous elements
    d3.select(graphContainerRef.current).selectAll("*").remove();

    const width = graphContainerRef.current.clientWidth || 400;
    const height = graphContainerRef.current.clientHeight || 500;

    // 1. Resolve relative imports regex to build node-link dataset
    const resolveRelativePath = (currPath: string, relPath: string): string | null => {
      const currentParts = currPath.split("/");
      currentParts.pop(); // remove file name

      const relParts = relPath.split("/");
      for (const part of relParts) {
        if (part === "." || part === "") {
          continue;
        } else if (part === "..") {
          currentParts.pop();
        } else {
          currentParts.push(part);
        }
      }

      const resolvedBase = currentParts.join("/");
      
      // Look for match with standard extensions
      const candidates = [
        resolvedBase,
        resolvedBase + ".tsx",
        resolvedBase + ".ts",
        resolvedBase + ".jsx",
        resolvedBase + ".js",
        resolvedBase + ".html",
        resolvedBase + ".css"
      ];

      for (const cand of candidates) {
        if (files.some(f => f.path === cand)) {
          return cand;
        }
      }
      return null;
    };

    const buildGraphData = () => {
      const nodes = files.map(f => ({
        id: f.path,
        name: f.path.split("/").pop() || f.path,
        lines: f.content.split("\n").length,
        extension: f.path.split(".").pop() || "unknown",
      }));

      const links: { source: string; target: string }[] = [];

      files.forEach(file => {
        // Match import lines like: import something from "./components/CodeEditor";
        // Also captures: import "./index.css";
        const importRegex = /import\s+(?:[\w\s{},*]+from\s+)?['"](\.\/|\.\.\/)(.*?)['"]/g;
        let match;
        while ((match = importRegex.exec(file.content)) !== null) {
          const relPath = match[1] + match[2];
          const resolved = resolveRelativePath(file.path, relPath);
          if (resolved && resolved !== file.path) {
            links.push({ source: file.path, target: resolved });
          }
        }
      });

      return { nodes, links };
    };

    const { nodes, links } = buildGraphData();

    // Setup SVG
    const svg = d3.select(graphContainerRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto; font-family: monospace; overflow: visible;");

    // Arrow marker for link direction
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 18) // position offset from node circle edge
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "rgba(255,255,255,0.18)");

    const gLink = svg.append("g");
    const gNode = svg.append("g");

    // Zoom and Pan behaviors
    const zoomBehavior = d3.zoom()
      .scaleExtent([0.3, 4])
      .on("zoom", (event) => {
        gLink.attr("transform", event.transform);
        gNode.attr("transform", event.transform);
      });

    svg.call(zoomBehavior as any);

    // Setup D3 Force Simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(110))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(28));

    // Render Links
    const link = gLink.selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke", "rgba(255,255,255,0.08)")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrowhead)");

    // Render Nodes Group
    const node = gNode.selectAll("g")
      .data(nodes)
      .enter().append("g")
      .attr("cursor", "move")
      .on("click", (event, d: any) => {
        setSelectedNode(d.id === selectedNode ? null : d.id);
      })
      .on("mouseover", (event, d: any) => {
        // Highlight active dependencies on hover
        node.style("opacity", (n: any) => {
          if (n.id === d.id) return 1;
          const isRelated = links.some(l => 
            (l.source as any).id === d.id && (l.target as any).id === n.id ||
            (l.target as any).id === d.id && (l.source as any).id === n.id
          );
          return isRelated ? 0.95 : 0.25;
        });

        link.attr("stroke", (l: any) => {
          const isSource = (l.source as any).id === d.id;
          const isTarget = (l.target as any).id === d.id;
          if (isSource) return "var(--accent)";
          if (isTarget) return "#38bdf8"; // blue for inbound
          return "rgba(255, 255, 255, 0.03)";
        }).attr("stroke-width", (l: any) => {
          return ((l.source as any).id === d.id || (l.target as any).id === d.id) ? 2.5 : 1;
        });
      })
      .on("mouseout", () => {
        node.style("opacity", 1);
        link.attr("stroke", "rgba(255, 255, 255, 0.08)").attr("stroke-width", 1.5);
      });

    // Node Circle
    node.append("circle")
      .attr("r", d => Math.max(7, Math.min(16, 6 + d.lines / 75))) // scale circle by LOC
      .attr("fill", d => {
        if (d.extension === "tsx") return "var(--accent)";
        if (d.extension === "ts") return "#38bdf8";
        if (d.extension === "html") return "#f97316";
        if (d.extension === "css") return "#ec4899";
        return "#71717a";
      })
      .attr("filter", d => d.extension === "tsx" ? "drop-shadow(0 0 4px var(--accent))" : "none")
      .attr("stroke", "#09090b")
      .attr("stroke-width", 1.5);

    // Node Text Label
    node.append("text")
      .attr("dy", -12)
      .attr("text-anchor", "middle")
      .attr("fill", "#e4e4e7")
      .attr("font-size", "9px")
      .attr("font-weight", "600")
      .text(d => d.name)
      .clone(true).lower()
      .attr("stroke", "#09090b")
      .attr("stroke-width", 3);

    // Drag behavior definition
    const drag = d3.drag()
      .on("start", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

    // Simulation Tick Updates
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Auto fit visual graph bounds
    const initTransform = d3.zoomIdentity.translate(0, 0).scale(1);
    svg.call(zoomBehavior.transform as any, initTransform);

    return () => {
      simulation.stop();
    };

  }, [activeTab, files, selectedNode]);

  // Handle double clicking a node or clicking file listing to load in IDE
  const handleNodeDoubleClicked = (path: string) => {
    if (onSelectFile) {
      onSelectFile(path);
      if (onClose) onClose();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] text-zinc-300 overflow-hidden select-none relative">
      
      {/* 1. Header Toolbar */}
      <div className="p-4 border-b border-[#2a2a2a] bg-[#141414] flex-shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-[var(--accent)]" />
            <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Project Statistics</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Real-time static code analysis, d3 file charts, and graph visualization.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Toggle Full Screen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded bg-[#0d0d0d] hover:bg-zinc-800 border border-[#2a2a2a] hover:border-zinc-700 transition cursor-pointer"
            title={isFullscreen ? "Minimize Window" : "Cinematic Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5 text-zinc-400" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5 text-zinc-400" />
            )}
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1 text-[10px] bg-zinc-900 border border-[#2a2a2a] hover:border-red-900/40 text-zinc-400 hover:text-red-400 font-bold rounded uppercase transition"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* 2. Left Sidebar Mini Stats Drawer Layout */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-[#0d0d0d]/10 flex flex-col">
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-[#0d0d0d]/70 rounded border border-[#2a2a2a] relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-12 w-12 bg-[var(--accent-glow)] rounded-full blur-xl opacity-30 pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
            <span className="text-[9px] font-mono uppercase text-zinc-500 flex items-center gap-1">
              <FileText className="h-3 w-3 text-sky-400" /> Files Count
            </span>
            <div className="text-xl font-bold tracking-tight text-white mt-1">
              {metrics.totalFiles}
            </div>
          </div>

          <div className="p-3 bg-[#0d0d0d]/70 rounded border border-[#2a2a2a] relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-12 w-12 bg-[var(--accent-glow)] rounded-full blur-xl opacity-30 pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
            <span className="text-[9px] font-mono uppercase text-zinc-500 flex items-center gap-1">
              <Activity className="h-3 w-3 text-[var(--accent)]" /> Total Lines
            </span>
            <div className="text-xl font-bold tracking-tight text-white mt-1">
              {metrics.totalLines}
            </div>
          </div>

          <div className="p-3 bg-[#0d0d0d]/70 rounded border border-[#2a2a2a] relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-12 w-12 bg-[var(--accent-glow)] rounded-full blur-xl opacity-30 pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
            <span className="text-[9px] font-mono uppercase text-zinc-500 flex items-center gap-1">
              <RefreshCw className="h-3 w-3 text-purple-400" /> Avg lines/file
            </span>
            <div className="text-xl font-bold tracking-tight text-white mt-1">
              {metrics.avgLines}
            </div>
          </div>

          <div className="p-3 bg-[#0d0d0d]/70 rounded border border-[#2a2a2a] relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-12 w-12 bg-[var(--accent-glow)] rounded-full blur-xl opacity-30 pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
            <span className="text-[9px] font-mono uppercase text-zinc-500 flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" /> Build status
            </span>
            <div className="text-xs font-bold font-mono tracking-tight text-green-500 flex items-center gap-1 mt-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
              <span>DEPLOYED</span>
            </div>
          </div>
        </div>

        {/* Extensions Breakdown Progress Bars */}
        <div className="p-4 bg-[#0d0d0d]/70 rounded border border-[#2a2a2a] space-y-3">
          <h4 className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-[var(--accent)]" /> Extension Breakdown
          </h4>
          <div className="space-y-2">
            {Object.entries(metrics.byExtension).map(([ext, data]: [string, any]) => {
              const pct = Math.round((data.lines / (metrics.totalLines || 1)) * 100);
              const barColors: Record<string, string> = {
                tsx: "bg-[var(--accent)]",
                ts: "bg-sky-450",
                html: "bg-orange-500",
                css: "bg-pink-500",
              };
              const color = barColors[ext] || "bg-zinc-500";

              return (
                <div key={ext} className="text-[10px] font-mono">
                  <div className="flex justify-between text-zinc-400 mb-0.5">
                    <span className="font-bold uppercase text-zinc-300">.{ext}</span>
                    <span>{data.count} {data.count === 1 ? 'file' : 'files'} • {pct}% lines</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a1c] rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected or Largest File Panel Card */}
        {metrics.largestFile && (
          <div className="p-3 bg-[#0d0d0d]/70 rounded border border-[#2a2a2a] relative">
            <h4 className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
              🏆 Code Density Leader
            </h4>
            <div className="flex items-start gap-2.5">
              <FileCode className="h-7 w-7 text-[var(--accent)] flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate font-mono">
                  {metrics.largestFile.name}
                </p>
                <p className="text-[9px] text-zinc-500 truncate font-mono">
                  {metrics.largestFile.path}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[9px] font-mono">
                  <span className="text-[var(--accent)] font-bold">
                    {metrics.largestFile.lines} Lines of Code
                  </span>
                  <span className="text-zinc-500">
                    {Math.round(metrics.largestFile.sizeBytes / 1024 * 10) / 10} KB
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visualizers Toggle Tabs */}
        <div className="flex flex-col flex-1 min-h-[300px] bg-[#0c0c0e] rounded-lg border border-[#2a2a2a]/60 p-2.5">
          <div className="flex items-center justify-between border-b border-[#222] pb-2 mb-2">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("tree")}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-md transition cursor-pointer ${
                  activeTab === "tree"
                    ? "bg-[var(--accent)] text-[var(--accent-text)]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                File Tree
              </button>
              <button
                onClick={() => setActiveTab("dependencies")}
                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-md transition cursor-pointer ${
                  activeTab === "dependencies"
                    ? "bg-[var(--accent)] text-[var(--accent-text)]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Imports Graph
              </button>
            </div>
            
            <span className="text-[8px] font-mono text-zinc-650 uppercase tracking-widest animate-pulse">
              Interactive D3 Live
            </span>
          </div>

          {/* D3 Canvas Containers */}
          <div className="flex-1 relative min-h-[220px] bg-black/40 rounded border border-[#1b1b1d] overflow-hidden">
            {activeTab === "tree" ? (
              <div ref={treeContainerRef} className="w-full h-full min-h-[220px]" />
            ) : (
              <div ref={graphContainerRef} className="w-full h-full min-h-[220px]" />
            )}
            
            {/* Guide overlay indicator */}
            <div className="absolute bottom-2 left-2 pointer-events-none text-[8px] font-mono text-zinc-600 bg-black/80 px-2 py-1 rounded border border-[#222]">
              🖱️ Drag / Scroll Wheel Zoom & Pan
            </div>
          </div>
        </div>

      </div>

      {/* --- CINEMATIC FULLSCREEN CANVAS PANEL VIEW (GLASSMORPHIC OVERLAY) --- */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 bg-[#060608]/98 backdrop-blur-md z-[9999] flex flex-col p-6 text-zinc-200 overflow-hidden"
          >
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between border-b border-[#222] pb-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-[var(--accent-glow)] border border-[var(--accent)]/30">
                  <Activity className="h-5 w-5 text-[var(--accent)] animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    UTube Media Visualization Engine
                    <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/40 text-green-400 rounded text-[9px] font-mono tracking-wider font-bold">
                      ACTIVE
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono">
                    High-performance D3.js vector rendering pipelines mapping components and modules.
                  </p>
                </div>
              </div>

              {/* Close and actions */}
              <div className="flex items-center space-x-3">
                {/* Visual Tab controller in fullscreen */}
                <div className="flex items-center space-x-1.5 bg-[#141416] p-1 rounded-lg border border-[#222]">
                  <button
                    onClick={() => setActiveTab("tree")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-md transition cursor-pointer ${
                      activeTab === "tree"
                        ? "bg-[var(--accent)] text-[var(--accent-text)]"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Directory Component Tree
                  </button>
                  <button
                    onClick={() => setActiveTab("dependencies")}
                    className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-md transition cursor-pointer ${
                      activeTab === "dependencies"
                        ? "bg-[var(--accent)] text-[var(--accent-text)]"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    File Dependency Topology
                  </button>
                </div>

                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded bg-zinc-900 border border-[#2a2a2a] hover:border-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs"
                >
                  <Minimize2 className="h-4 w-4" />
                  <span>Exit Cinematic</span>
                </button>
              </div>
            </div>

            {/* Fullscreen Bento Grid Area */}
            <div className="flex-1 grid grid-cols-4 gap-6 mt-6 overflow-hidden min-h-0">
              
              {/* Left Column stats details (1 of 4 cols) */}
              <div className="col-span-1 flex flex-col space-y-4 overflow-y-auto pr-2 scrollbar-thin">
                
                {/* Global Metrics Box */}
                <div className="p-4 bg-[#141418]/60 border border-[#222] rounded-xl space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase text-zinc-400 border-b border-[#222] pb-2 flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-[var(--accent)]" /> Codebase Metrics
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-zinc-500 text-xs">Total Files:</span>
                      <span className="text-white font-bold">{metrics.totalFiles}</span>
                    </div>
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-zinc-500 text-xs">Total Lines (LOC):</span>
                      <span className="text-[var(--accent)] font-bold">{metrics.totalLines}</span>
                    </div>
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-zinc-500 text-xs">Avg LOC / File:</span>
                      <span className="text-white font-bold">{metrics.avgLines}</span>
                    </div>
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-zinc-500 text-xs">Density Leader:</span>
                      <span className="text-zinc-300 truncate font-bold text-right max-w-[130px]" title={metrics.largestFile?.path}>
                        {metrics.largestFile?.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expansion of Extensions Bar */}
                <div className="p-4 bg-[#141418]/60 border border-[#222] rounded-xl space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase text-zinc-400 border-b border-[#222] pb-2">
                    🎨 Language Distribution
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(metrics.byExtension).map(([ext, data]: [string, any]) => {
                      const pct = Math.round((data.lines / (metrics.totalLines || 1)) * 100);
                      const barColorMap: Record<string, string> = {
                        tsx: "bg-[var(--accent)]",
                        ts: "bg-sky-400",
                        html: "bg-orange-500",
                        css: "bg-pink-500",
                      };
                      const barBg = barColorMap[ext] || "bg-zinc-500";

                      return (
                        <div key={ext} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono text-zinc-400">
                            <span className="font-bold text-zinc-200">.{ext.toUpperCase()}</span>
                            <span>{pct}% ({data.lines} LOC)</span>
                          </div>
                          <div className="h-2 bg-[#1b1b1d] rounded-full overflow-hidden">
                            <div className={`h-full ${barBg}`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* File Explorer Direct Linkage */}
                <div className="p-4 bg-[#141418]/60 border border-[#222] rounded-xl flex-1 flex flex-col min-h-[180px]">
                  <h3 className="text-xs font-mono font-bold uppercase text-zinc-400 border-b border-[#222] pb-2 flex items-center justify-between">
                    <span>📂 Codebase Files</span>
                    <span className="text-[9px] text-zinc-600">Double click to load</span>
                  </h3>
                  <div className="flex-1 overflow-y-auto space-y-1 mt-3 scrollbar-thin pr-1 text-xs">
                    {files.map(f => {
                      const isSelected = selectedNode === f.path;
                      return (
                        <div
                          key={f.path}
                          onClick={() => setSelectedNode(f.path)}
                          onDoubleClick={() => handleNodeDoubleClicked(f.path)}
                          className={`p-2 rounded font-mono cursor-pointer transition flex items-center justify-between ${
                            isSelected 
                              ? "bg-[var(--accent-glow)] border border-[var(--accent)]/30 text-white" 
                              : "hover:bg-zinc-800/40 border border-transparent text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <span className="truncate">{f.path}</span>
                          <span className="text-[10px] text-zinc-600 flex-shrink-0 ml-1">
                            {f.content.split("\n").length} LOC
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Central Vector Canvas (3 of 4 cols) */}
              <div className="col-span-3 flex flex-col bg-black/50 border border-[#222] rounded-2xl overflow-hidden relative">
                
                {/* Visual Mode Label Indicator */}
                <div className="absolute top-4 left-4 z-10 bg-[#141416]/90 border border-[#222] px-3 py-1.5 rounded-lg flex items-center space-x-2 text-xs font-mono shadow-xl pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping"></span>
                  <span className="text-zinc-400">Rendering Mode:</span>
                  <span className="text-white font-bold uppercase">
                    {activeTab === "tree" ? "Collapsible Folder Tree" : "Interactive Topology Mesh"}
                  </span>
                </div>

                {/* Render Canvas */}
                <div className="flex-1 w-full h-full relative">
                  {activeTab === "tree" ? (
                    <div ref={treeContainerRef} className="absolute inset-0 w-full h-full" />
                  ) : (
                    <div ref={graphContainerRef} className="absolute inset-0 w-full h-full" />
                  )}
                </div>

                {/* Bottom Instruction guide bar */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between font-mono text-[10px] text-zinc-500 bg-[#09090b]/80 border border-[#222] px-4 py-2 rounded-lg pointer-events-none">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                    <span>Scroll Wheel/Pinch to zoom • Drag to pan</span>
                  </span>
                  <span>Double click any file node to load code in workspace editor</span>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
