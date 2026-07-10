import React, { useRef, useEffect, useState } from "react";
import { Folder, FileCode, Check, Copy, Code, Cpu } from "lucide-react";
import { Template } from "../types";

interface FileStructureCanvasProps {
  template: Template;
}

interface CanvasNode {
  id: string;
  name: string;
  path: string;
  type: "root" | "folder" | "file";
  depth: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  parent?: CanvasNode;
  content?: string;
  lineCount?: number;
}

interface PulseParticle {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  speed: number;
  color: string;
}

export const FileStructureCanvas: React.FC<FileStructureCanvasProps> = ({ template }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<CanvasNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null);
  const [copied, setCopied] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 220, height: 130 });

  // Update dimensions based on container
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 180),
          height: Math.max(height, 120),
        });
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = dimensions.width;
    const height = dimensions.height;

    // 1. Build Node Trees with relaxation layouts
    const buildNodes = (): CanvasNode[] => {
      const list: CanvasNode[] = [];

      // Project Root Node
      const rootNode: CanvasNode = {
        id: "root",
        name: "project",
        path: "/",
        type: "root",
        depth: 0,
        x: 18,
        y: height / 2,
        targetX: 18,
        targetY: height / 2,
        size: 5.5,
        color: "#a855f7", // Neon Purple
      };
      list.push(rootNode);

      // Extract all directories
      const folders = new Set<string>();
      template.files.forEach((f) => {
        const parts = f.path.split("/");
        if (parts.length > 1) {
          for (let i = 0; i < parts.length - 1; i++) {
            folders.add(parts.slice(0, i + 1).join("/"));
          }
        }
      });

      const folderNodesMap = new Map<string, CanvasNode>();

      // Position Folders
      const folderList = Array.from(folders).sort();
      folderList.forEach((folderPath, index) => {
        const parts = folderPath.split("/");
        const name = parts[parts.length - 1];
        const depth = parts.length;

        // Spread folders proportionally
        const xPos = 18 + depth * 55;
        const yPos = (height / (folderList.length + 1)) * (index + 1);

        const folderNode: CanvasNode = {
          id: `folder-${folderPath}`,
          name,
          path: folderPath,
          type: "folder",
          depth,
          x: xPos - 15,
          y: yPos,
          targetX: xPos,
          targetY: yPos,
          size: 4.5,
          color: "#10b981", // Emerald Neon
        };

        if (parts.length > 1) {
          const parentPath = parts.slice(0, parts.length - 1).join("/");
          folderNode.parent = folderNodesMap.get(parentPath);
        } else {
          folderNode.parent = rootNode;
        }

        folderNodesMap.set(folderPath, folderNode);
        list.push(folderNode);
      });

      // Position Files
      template.files.forEach((file, index) => {
        const parts = file.path.split("/");
        const name = parts[parts.length - 1];
        const depth = parts.length;

        let parentNode: CanvasNode = rootNode;
        if (parts.length > 1) {
          const parentPath = parts.slice(0, parts.length - 1).join("/");
          parentNode = folderNodesMap.get(parentPath) || rootNode;
        }

        const xPos = 24 + depth * 55;
        const yPos = (height / (template.files.length + 1)) * (index + 1);

        const ext = name.split(".").pop()?.toLowerCase() || "";
        let color = "#3b82f6"; // Blue neon default
        if (ext === "html") color = "#f97316"; // Amber orange
        if (ext === "css") color = "#06b6d4"; // Cyan
        if (ext === "ts" || ext === "tsx") color = "#ca8a04"; // Rich Yellow
        if (ext === "json") color = "#ec4899"; // Pink

        const fileNode: CanvasNode = {
          id: `file-${file.path}`,
          name,
          path: file.path,
          type: "file",
          depth,
          x: xPos - 10,
          y: yPos,
          targetX: xPos,
          targetY: yPos,
          size: 3.5,
          color,
          parent: parentNode,
          content: file.content,
          lineCount: file.content.split("\n").length,
        };
        list.push(fileNode);
      });

      // Relax layout to avoid overlaps
      for (let step = 0; step < 12; step++) {
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const n1 = list[i];
            const n2 = list[j];
            if (n1.depth === n2.depth) {
              const dy = n1.targetY - n2.targetY;
              const minDist = 14;
              if (Math.abs(dy) < minDist) {
                const force = (minDist - Math.abs(dy)) / 2;
                const sign = dy >= 0 ? 1 : -1;
                n1.targetY += force * sign;
                n2.targetY -= force * sign;
                n1.targetY = Math.max(12, Math.min(height - 12, n1.targetY));
                n2.targetY = Math.max(12, Math.min(height - 12, n2.targetY));
              }
            }
          }
        }
      }

      return list;
    };

    const nodes = buildNodes();
    let particles: PulseParticle[] = [];

    // Spawns particles to simulate flow activity
    const spawnParticle = () => {
      const sourceNode = nodes[Math.floor(Math.random() * nodes.length)];
      if (sourceNode.parent) {
        particles.push({
          startX: sourceNode.parent.x,
          startY: sourceNode.parent.y,
          endX: sourceNode.x,
          endY: sourceNode.y,
          progress: 0,
          speed: 0.015 + Math.random() * 0.02,
          color: sourceNode.color,
        });
      }
    };

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw connections first (under nodes)
      ctx.lineWidth = 1;
      nodes.forEach((node) => {
        if (node.parent) {
          // Smooth step curves
          ctx.beginPath();
          ctx.strokeStyle = "rgba(40, 40, 45, 0.4)";
          ctx.moveTo(node.parent.x, node.parent.y);
          
          const midX = (node.parent.x + node.x) / 2;
          ctx.bezierCurveTo(
            midX, node.parent.y,
            midX, node.y,
            node.x, node.y
          );
          ctx.stroke();
        }
      });

      // 2. Animate and draw flowing activity particles
      if (Math.random() < 0.08 && particles.length < 12) {
        spawnParticle();
      }

      particles.forEach((p, idx) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          particles.splice(idx, 1);
          return;
        }

        // Interpolate bezier coordinates
        const midX = (p.startX + p.endX) / 2;
        const t = p.progress;
        const mt = 1 - t;
        
        // Quad/Cubic Bezier interpolation matching connections
        const x = mt * mt * mt * p.startX + 3 * mt * mt * t * midX + 3 * mt * t * t * midX + t * t * t * p.endX;
        const y = mt * mt * mt * p.startY + 3 * mt * mt * t * p.startY + 3 * mt * t * t * p.endY + t * t * t * p.endY;

        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // 3. Draw nodes
      nodes.forEach((node) => {
        // Linear interpolation for entry slide effects
        node.x += (node.targetX - node.x) * 0.12;
        node.y += (node.targetY - node.y) * 0.12;

        const isMouseOver = hoveredNode?.id === node.id;

        // Draw node aura/glow on hover
        if (isMouseOver) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size + 3, 0, Math.PI * 2);
          ctx.fillStyle = node.color + "1a"; // 10% opacity
          ctx.fill();
          ctx.strokeStyle = node.color + "33"; // 20% opacity
          ctx.stroke();
        }

        // Draw outer node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isMouseOver ? 6 : 0;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Label details for leaves or bigger folders
        if (isMouseOver || node.depth === 0 || (width > 200 && node.type === "folder")) {
          ctx.font = "bold 7px JetBrains Mono, monospace";
          ctx.fillStyle = isMouseOver ? "#f4f4f5" : "rgba(161, 161, 170, 0.75)";
          ctx.fillText(node.name, node.x + node.size + 4, node.y + 2.5);
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, hoveredNode, template]);

  // Mouse move detection inside canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mX = e.clientX - rect.left;
    const mY = e.clientY - rect.top;

    // Recalculate node hit collision
    let found: CanvasNode | null = null;
    const width = dimensions.width;
    const height = dimensions.height;

    // Use same algorithms to scan nodes
    const nodes: CanvasNode[] = [];
    const rootNode: CanvasNode = { id: "root", name: "project", path: "/", type: "root", depth: 0, x: 18, y: height / 2, targetX: 18, targetY: height / 2, size: 5.5, color: "#a855f7" };
    nodes.push(rootNode);

    const folders = new Set<string>();
    template.files.forEach((f) => {
      const parts = f.path.split("/");
      if (parts.length > 1) {
        for (let i = 0; i < parts.length - 1; i++) {
          folders.add(parts.slice(0, i + 1).join("/"));
        }
      }
    });

    const folderNodesMap = new Map<string, CanvasNode>();
    const folderList = Array.from(folders).sort();
    folderList.forEach((folderPath, index) => {
      const parts = folderPath.split("/");
      const name = parts[parts.length - 1];
      const depth = parts.length;
      const xPos = 18 + depth * 55;
      const yPos = (height / (folderList.length + 1)) * (index + 1);
      const node: CanvasNode = { id: `folder-${folderPath}`, name, path: folderPath, type: "folder", depth, x: xPos, y: yPos, targetX: xPos, targetY: yPos, size: 4.5, color: "#10b981", parent: parts.length > 1 ? folderNodesMap.get(parts.slice(0, parts.length - 1).join("/")) : rootNode };
      folderNodesMap.set(folderPath, node);
      nodes.push(node);
    });

    template.files.forEach((file, index) => {
      const parts = file.path.split("/");
      const name = parts[parts.length - 1];
      const depth = parts.length;
      const parentNode = parts.length > 1 ? folderNodesMap.get(parts.slice(0, parts.length - 1).join("/")) || rootNode : rootNode;
      const xPos = 24 + depth * 55;
      const yPos = (height / (template.files.length + 1)) * (index + 1);

      const ext = name.split(".").pop()?.toLowerCase() || "";
      let color = "#3b82f6";
      if (ext === "html") color = "#f97316";
      if (ext === "css") color = "#06b6d4";
      if (ext === "ts" || ext === "tsx") color = "#ca8a04";
      if (ext === "json") color = "#ec4899";

      nodes.push({ id: `file-${file.path}`, name, path: file.path, type: "file", depth, x: xPos, y: yPos, targetX: xPos, targetY: yPos, size: 3.5, color, parent: parentNode, content: file.content, lineCount: file.content.split("\n").length });
    });

    // Relayout positions matching the rendering math
    for (let step = 0; step < 12; step++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          if (n1.depth === n2.depth) {
            const dy = n1.targetY - n2.targetY;
            const minDist = 14;
            if (Math.abs(dy) < minDist) {
              const force = (minDist - Math.abs(dy)) / 2;
              const sign = dy >= 0 ? 1 : -1;
              n1.targetY += force * sign;
              n2.targetY -= force * sign;
              n1.targetY = Math.max(12, Math.min(height - 12, n1.targetY));
              n2.targetY = Math.max(12, Math.min(height - 12, n2.targetY));
            }
          }
        }
      }
    }

    nodes.forEach((node) => {
      const dx = mX - node.targetX;
      const dy = mY - node.targetY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 8) {
        found = node;
      }
    });

    setHoveredNode(found);
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
  };

  const handleCanvasClick = () => {
    if (hoveredNode) {
      setSelectedNode(hoveredNode);
    } else {
      setSelectedNode(null);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-black flex flex-col justify-between overflow-hidden select-none">
      {/* Visual Canvas Stage */}
      <div className="relative flex-1 w-full h-full">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleCanvasClick}
          className="w-full h-full block cursor-pointer"
        />

        {/* Dynamic Canvas Floating Tooltip */}
        {hoveredNode && (
          <div className="absolute top-1.5 left-1.5 right-1.5 p-1.5 bg-zinc-950/95 border border-zinc-850 rounded shadow-md pointer-events-none flex flex-col gap-0.5 animate-fadeIn z-10 select-none">
            <div className="flex items-center justify-between">
              <span className="text-[7.5px] font-mono text-zinc-400 truncate max-w-[130px]">
                {hoveredNode.path}
              </span>
              <span
                className="text-[6.5px] font-extrabold uppercase px-1 rounded font-sans"
                style={{ backgroundColor: hoveredNode.color + "22", color: hoveredNode.color }}
              >
                {hoveredNode.type}
              </span>
            </div>
            {hoveredNode.type === "file" && (
              <div className="flex items-center justify-between text-[6.5px] text-zinc-500 font-mono">
                <span>{hoveredNode.lineCount} Lines</span>
                <span className="text-[5.5px] uppercase bg-zinc-900 border border-zinc-800 px-1 py-0.2 rounded text-zinc-400">
                  Click to inspect
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tiny Status Indicator overlay */}
      <div className="absolute bottom-1 left-2 flex items-center gap-1.5 pointer-events-none select-none">
        <Cpu className="h-2.5 w-2.5 text-purple-400/80" />
        <span className="text-[6.5px] font-mono uppercase tracking-widest text-zinc-600 font-black">
          Architect Core V1
        </span>
      </div>

      {/* Popover/Drawer Code Inspector Modal */}
      {selectedNode && selectedNode.type === "file" && (
        <div className="absolute inset-0 bg-zinc-950/98 p-3 border-t border-zinc-900 flex flex-col justify-between animate-slideUp z-20 font-mono">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 select-none shrink-0">
            <div className="flex items-center gap-1.5">
              <Code className="h-3 w-3 text-purple-400" />
              <span className="text-[8.5px] font-bold text-zinc-200 truncate max-w-[110px]">
                {selectedNode.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCopyCode(selectedNode.content || "")}
                className="p-1 hover:bg-zinc-900 rounded text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
                title="Copy Source Code"
              >
                {copied ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
              </button>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[8px] font-bold text-zinc-500 hover:text-red-400 px-1 bg-zinc-900 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {/* Scrolled code snippet */}
          <div className="flex-1 overflow-auto my-1.5 text-[8px] leading-relaxed scrollbar-thin text-zinc-400 text-left">
            <pre className="whitespace-pre select-text font-mono">
              {selectedNode.content || "// Empty file"}
            </pre>
          </div>

          <div className="text-[6.5px] text-zinc-600 border-t border-zinc-900/60 pt-1 flex items-center justify-between select-none shrink-0">
            <span>Size: {selectedNode.lineCount} lines</span>
            <span className="text-purple-400">Playground Blueprint</span>
          </div>
        </div>
      )}
    </div>
  );
};
