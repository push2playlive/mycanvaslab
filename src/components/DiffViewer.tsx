import React from "react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  leftLineNum?: number;
  rightLineNum?: number;
}

interface DiffViewerProps {
  filename: string;
  oldContent: string;
  newContent: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ filename, oldContent, newContent }) => {
  const getDiffLines = (): DiffLine[] => {
    const oldLines = oldContent.split("\n");
    const newLines = newContent.split("\n");
    const diff: DiffLine[] = [];

    let oIdx = 0;
    let nIdx = 0;

    while (oIdx < oldLines.length || nIdx < newLines.length) {
      if (oIdx < oldLines.length && nIdx < newLines.length) {
        if (oldLines[oIdx] === newLines[nIdx]) {
          diff.push({
            type: "unchanged",
            content: oldLines[oIdx],
            leftLineNum: oIdx + 1,
            rightLineNum: nIdx + 1,
          });
          oIdx++;
          nIdx++;
        } else {
          // Look ahead to see if there's a match
          let matched = false;
          for (let look = 1; look < 6; look++) {
            if (oIdx + look < oldLines.length && oldLines[oIdx + look] === newLines[nIdx]) {
              // oldLines has deletions
              for (let i = 0; i < look; i++) {
                diff.push({
                  type: "removed",
                  content: oldLines[oIdx + i],
                  leftLineNum: oIdx + i + 1,
                });
              }
              oIdx += look;
              matched = true;
              break;
            } else if (nIdx + look < newLines.length && oldLines[oIdx] === newLines[nIdx + look]) {
              // newLines has insertions
              for (let i = 0; i < look; i++) {
                diff.push({
                  type: "added",
                  content: newLines[nIdx + i],
                  rightLineNum: nIdx + i + 1,
                });
              }
              nIdx += look;
              matched = true;
              break;
            }
          }

          if (!matched) {
            // Replacement: remove old line, add new line
            diff.push({
              type: "removed",
              content: oldLines[oIdx],
              leftLineNum: oIdx + 1,
            });
            diff.push({
              type: "added",
              content: newLines[nIdx],
              rightLineNum: nIdx + 1,
            });
            oIdx++;
            nIdx++;
          }
        }
      } else if (oIdx < oldLines.length) {
        diff.push({
          type: "removed",
          content: oldLines[oIdx],
          leftLineNum: oIdx + 1,
        });
        oIdx++;
      } else {
        diff.push({
          type: "added",
          content: newLines[nIdx],
          rightLineNum: nIdx + 1,
        });
        nIdx++;
      }
    }

    return diff;
  };

  const diffLines = getDiffLines();

  return (
    <div className="border border-zinc-850 rounded-xl overflow-hidden bg-zinc-950/40 text-[11px] font-mono leading-relaxed max-h-[450px] flex flex-col">
      {/* Diff Header */}
      <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-850 flex items-center justify-between text-zinc-400">
        <span className="font-bold text-zinc-300">{filename}</span>
        <div className="flex gap-4 text-[9px] uppercase tracking-wider">
          <span className="text-emerald-500">+{diffLines.filter((l) => l.type === "added").length} Additions</span>
          <span className="text-red-500">-{diffLines.filter((l) => l.type === "removed").length} Deletions</span>
        </div>
      </div>

      {/* Lines Grid */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <tbody>
            {diffLines.map((line, idx) => {
              let rowBg = "hover:bg-zinc-900/30";
              let sign = " ";
              let textColor = "text-zinc-400";
              let gutterBg = "bg-zinc-950 text-zinc-600";

              if (line.type === "added") {
                rowBg = "bg-emerald-950/15 hover:bg-emerald-950/25";
                sign = "+";
                textColor = "text-emerald-300";
                gutterBg = "bg-emerald-950/30 text-emerald-500 border-r border-emerald-900/20";
              } else if (line.type === "removed") {
                rowBg = "bg-red-950/15 hover:bg-red-950/25";
                sign = "-";
                textColor = "text-red-400 line-through";
                gutterBg = "bg-red-950/30 text-red-500 border-r border-red-900/20";
              }

              return (
                <tr key={idx} className={`${rowBg} transition-colors border-none`}>
                  {/* Left Line Number Gutter */}
                  <td className={`w-10 text-right pr-2 select-none py-0.5 text-[10px] ${gutterBg}`}>
                    {line.leftLineNum || ""}
                  </td>
                  {/* Right Line Number Gutter */}
                  <td className={`w-10 text-right pr-2 select-none py-0.5 text-[10px] ${gutterBg}`}>
                    {line.rightLineNum || ""}
                  </td>
                  {/* Plus/Minus Indicator */}
                  <td className={`w-6 text-center select-none py-0.5 font-bold ${textColor}`}>
                    {sign}
                  </td>
                  {/* Content line */}
                  <td className={`pl-2 pr-4 py-0.5 whitespace-pre break-all ${textColor}`}>
                    {line.content}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
