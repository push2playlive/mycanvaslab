import React, { useState } from "react";
import { VirtualFile, TestCase } from "../types";
import { Play, CheckCircle2, XCircle, RefreshCw, Terminal as TermIcon, Plus, Trash2 } from "lucide-react";

interface TestingTabProps {
  files: VirtualFile[];
}

export const TestingTab: React.FC<TestingTabProps> = ({ files }) => {
  const [testCases, setTestCases] = useState<TestCase[]>([
    {
      id: "1",
      name: "Check applet entry point exists",
      filePath: "src/App.tsx",
      assertionType: "no-empty",
      expectedValue: "",
      status: "idle",
    },
    {
      id: "2",
      name: "Verify main application title loads",
      filePath: "src/App.tsx",
      assertionType: "contains",
      expectedValue: "MyCanvasLab",
      status: "idle",
    },
    {
      id: "3",
      name: "Check index styling inclusion",
      filePath: "src/index.css",
      assertionType: "contains",
      expectedValue: "@import",
      status: "idle",
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  
  // Form state for creating custom test case
  const [newTestName, setNewTestName] = useState("");
  const [newTestFilePath, setNewTestFilePath] = useState("");
  const [newTestAssertion, setNewTestAssertion] = useState<TestCase["assertionType"]>("contains");
  const [newTestExpected, setNewTestExpected] = useState("");

  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setConsoleLogs([]);
    addLog("Initializing test runner suite...");
    addLog(`Found ${testCases.length} active test assertions to execute.`);

    // Delay run slightly to look like a real pipeline running
    await new Promise((r) => setTimeout(r, 1000));

    const updated = testCases.map((tc) => {
      addLog(`Running assertion [${tc.name}] on "${tc.filePath}"...`);
      const file = files.find((f) => f.path === tc.filePath);

      if (!file) {
        addLog(`❌ FAILED: File "${tc.filePath}" was not found in current workspace.`);
        return {
          ...tc,
          status: "failed" as const,
          message: `File "${tc.filePath}" not found in workspace.`,
        };
      }

      const content = file.content || "";

      if (tc.assertionType === "no-empty") {
        if (content.trim().length > 0) {
          addLog(`✓ PASSED: "${tc.filePath}" content is valid and not empty.`);
          return { ...tc, status: "passed" as const };
        } else {
          addLog(`❌ FAILED: "${tc.filePath}" content is empty.`);
          return { ...tc, status: "failed" as const, message: "File is completely empty." };
        }
      }

      if (tc.assertionType === "contains") {
        if (content.includes(tc.expectedValue)) {
          addLog(`✓ PASSED: Contains expected string "${tc.expectedValue}".`);
          return { ...tc, status: "passed" as const };
        } else {
          addLog(`❌ FAILED: Expected string "${tc.expectedValue}" was missing.`);
          return {
            ...tc,
            status: "failed" as const,
            message: `Could not locate "${tc.expectedValue}" inside the file.`,
          };
        }
      }

      if (tc.assertionType === "not-contains") {
        if (!content.includes(tc.expectedValue)) {
          addLog(`✓ PASSED: Correctly does not contain forbidden string "${tc.expectedValue}".`);
          return { ...tc, status: "passed" as const };
        } else {
          addLog(`❌ FAILED: Found forbidden string "${tc.expectedValue}".`);
          return {
            ...tc,
            status: "failed" as const,
            message: `Found forbidden "${tc.expectedValue}" inside the file.`,
          };
        }
      }

      return tc;
    });

    setTestCases(updated);
    setIsRunning(false);
    addLog("Testing execution complete.");
  };

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName.trim() || !newTestFilePath.trim()) return;

    const newCase: TestCase = {
      id: Math.random().toString(),
      name: newTestName.trim(),
      filePath: newTestFilePath.trim(),
      assertionType: newTestAssertion,
      expectedValue: newTestExpected,
      status: "idle",
    };

    setTestCases((prev) => [...prev, newCase]);
    setNewTestName("");
    setNewTestFilePath("");
    setNewTestExpected("");
    addLog(`Added custom test case: [${newCase.name}]`);
  };

  const handleDeleteTest = (id: string) => {
    setTestCases((prev) => prev.filter((tc) => tc.id !== id));
  };

  const passedCount = testCases.filter((tc) => tc.status === "passed").length;
  const failedCount = testCases.filter((tc) => tc.status === "failed").length;

  return (
    <div className="space-y-6 text-zinc-300">
      
      {/* Run bar & Stats Header */}
      <div className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-purple-400" />
            VIRTUAL TEST RUNNER
          </h3>
          <p className="text-[10px] text-zinc-500">Run client-side test assertions against workspace files.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-3 text-xs">
            <span className="text-emerald-400 font-bold">{passedCount} Passed</span>
            <span className="text-zinc-600">•</span>
            <span className="text-red-400 font-bold">{failedCount} Failed</span>
          </div>

          <button
            onClick={handleRunTests}
            disabled={isRunning || testCases.length === 0}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-2 transition-colors ${
              isRunning || testCases.length === 0
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Executing Pipeline...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Test Suite
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Test assertions table */}
        <div className="md:col-span-2 space-y-4">
          
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-850 bg-zinc-950 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                Active Test Assertions
              </span>
            </div>

            {testCases.length === 0 ? (
              <p className="p-6 text-xs text-zinc-500 text-center">No tests defined. Create one below!</p>
            ) : (
              <div className="divide-y divide-zinc-850">
                {testCases.map((tc) => (
                  <div key={tc.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {tc.status === "passed" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}
                      {tc.status === "failed" && <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />}
                      {tc.status === "idle" && <div className="h-4 w-4 border-2 border-zinc-700 rounded-full shrink-0 mt-0.5" />}

                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-zinc-200">{tc.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          Target: {tc.filePath} • {tc.assertionType} {tc.expectedValue ? `"${tc.expectedValue}"` : ""}
                        </p>
                        {tc.message && (
                          <p className="text-[10px] text-red-400 font-medium bg-red-950/20 px-2 py-0.5 rounded border border-red-900/10 mt-1 inline-block">
                            {tc.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTest(tc.id)}
                      className="p-1.5 rounded hover:bg-zinc-850 text-zinc-500 hover:text-zinc-400 transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form to add custom test assertion */}
          <form onSubmit={handleAddTest} className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-xl space-y-4">
            <h4 className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-purple-400" />
              ADD CUSTOM ASSERTION
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500">Test Case Title</label>
                <input
                  type="text"
                  required
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  placeholder="e.g., Validate footer is present"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500">Target File Path</label>
                <input
                  type="text"
                  required
                  value={newTestFilePath}
                  onChange={(e) => setNewTestFilePath(e.target.value)}
                  placeholder="e.g., src/App.tsx"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500">Assertion Logic</label>
                <select
                  value={newTestAssertion}
                  onChange={(e) => setNewTestAssertion(e.target.value as TestCase["assertionType"])}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="contains">Contains substring</option>
                  <option value="not-contains">Does not contain substring</option>
                  <option value="no-empty">File is not empty</option>
                </select>
              </div>

              {newTestAssertion !== "no-empty" && (
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500">Expected Value</label>
                  <input
                    type="text"
                    required
                    value={newTestExpected}
                    onChange={(e) => setNewTestExpected(e.target.value)}
                    placeholder="e.g., Copyright 2026"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 hover:border-zinc-650 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Assertion
            </button>
          </form>

        </div>

        {/* Terminal Reporter logs */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden flex flex-col min-h-[300px]">
          <div className="px-5 py-3 border-b border-zinc-850 bg-zinc-950 flex items-center gap-2">
            <TermIcon className="h-4 w-4 text-emerald-500" />
            <span className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              Pipeline Output Logs
            </span>
          </div>

          <div className="flex-1 p-4 font-mono text-[10px] leading-relaxed text-zinc-400 bg-black/50 overflow-y-auto space-y-1.5 select-all">
            {consoleLogs.length === 0 ? (
              <p className="text-zinc-600 italic">Logs are empty. Run tests to display execution logs.</p>
            ) : (
              consoleLogs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap break-all">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
