"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle2, Terminal, FileText, Brain } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function AnalysisPanel() {
  const { toast } = useToast()
  const [analysisResults, setAnalysisResults] = useState({
    deadlockDetected: true,
    cycle: ["P1", "R1", "P3", "R3", "P2", "R2", "P1"],
    waitingTime: {
      P1: 120,
      P2: 85,
      P3: 150,
    },
    resourceUtilization: 0.65,
    suggestedActions: [
      "Terminate process P3 to break the deadlock",
      "Implement resource preemption for R1",
      "Increase timeout for resource requests",
    ],
  })

  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    "> Initializing deadlock detection algorithm...",
    "> Analyzing resource allocation graph...",
    "> Building wait-for graph...",
    "> Checking for cycles in wait-for graph...",
    "> ALERT: Cycle detected in wait-for graph!",
    "> Cycle: P1 → R1 → P3 → R3 → P2 → R2 → P1",
    "> Calculating process statistics...",
    "> Generating resolution strategies...",
    "> Analysis complete. Deadlock detected.",
  ])

  const [aiAnalysis, setAiAnalysis] = useState({
    riskScore: 0.85,
    preventionStrategy: "Resource Hierarchy",
    detectionMethod: "Wait-For Graph Cycle Detection",
    explanation: [
      "The system has a high risk of deadlock due to circular wait conditions",
      "Processes P1, P2, and P3 form a circular dependency through resources R1, R2, and R3",
      "Each process is holding a resource needed by another process in the cycle",
      "This creates a situation where no process can proceed without intervention",
      "The deadlock meets all four necessary conditions: mutual exclusion, hold and wait, no preemption, and circular wait",
    ],
    preventionTips: [
      "Implement resource ordering to prevent circular wait",
      "Use timeouts for resource acquisition to prevent indefinite waiting",
      "Consider implementing the Banker's Algorithm for safe resource allocation",
      "Design processes to request all resources at once when possible",
      "Implement a deadlock detection algorithm that runs periodically",
    ],
  })

  const runAnalysis = () => {
    setConsoleOutput([
      ...consoleOutput,
      "> Re-running deadlock detection algorithm...",
      "> Analyzing current system state...",
    ])

    // Simulate analysis
    setTimeout(() => {
      setConsoleOutput((prev) => [
        ...prev,
        "> Detecting potential circular wait conditions...",
        "> Analyzing resource allocation matrix...",
        "> Checking for safe state using Banker's Algorithm...",
        "> ALERT: System is in an unsafe state!",
        "> Analysis complete. Deadlock detected.",
      ])

      toast({
        title: "Analysis Complete",
        description: "Deadlock detected in the system",
        variant: "destructive",
      })
    }, 1500)
  }

  const exportReport = () => {
    toast({
      title: "Report Exported",
      description: "Deadlock analysis report has been exported",
    })
  }

  const applyResolution = (action: string) => {
    toast({
      title: "Resolution Applied",
      description: action,
    })

    // In a real app, this would update the system state
    setConsoleOutput((prev) => [
      ...prev,
      `> Applying resolution: ${action}`,
      "> Updating system state...",
      "> Resolution applied successfully.",
      "> System is now in a safe state.",
    ])

    setAnalysisResults({
      ...analysisResults,
      deadlockDetected: false,
    })
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="ai-analysis" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-black border border-green-500/30">
          <TabsTrigger value="ai-analysis" className="data-[state=active]:bg-green-900/20">
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="console" className="data-[state=active]:bg-green-900/20">
            Console
          </TabsTrigger>
          <TabsTrigger value="solutions" className="data-[state=active]:bg-green-900/20">
            Solutions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-analysis" className="flex-1 flex flex-col">
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-green-400" />
                <span className="font-medium">AI Deadlock Analysis</span>
              </div>
              <Badge className="bg-red-900/30 text-red-400 border-red-500/50">
                Risk Score: {Math.round(aiAnalysis.riskScore * 100)}%
              </Badge>
            </div>

            <Alert className="border-cyan-500/30 bg-cyan-900/10 text-cyan-400">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Detection Method</AlertTitle>
              <AlertDescription className="text-xs">{aiAnalysis.detectionMethod}</AlertDescription>
            </Alert>

            <div>
              <h4 className="text-sm font-medium mb-2">AI Explanation:</h4>
              <div className="space-y-1 text-sm text-gray-400">
                {aiAnalysis.explanation.map((line, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                    <p>{line}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Prevention Tips:</h4>
              <div className="space-y-1 text-sm text-gray-400">
                {aiAnalysis.preventionTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={exportReport}
              className="w-full bg-green-900/20 hover:bg-green-900/40 text-green-500 border border-green-500/50"
            >
              <FileText className="h-4 w-4 mr-2" /> Export Detailed Analysis Report
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="console" className="flex-1 flex flex-col">
          <div className="flex-1 font-mono text-sm border border-green-500/20 rounded-md bg-black p-2 overflow-y-auto h-[300px]">
            <div className="space-y-1">
              {consoleOutput.map((line, index) => (
                <div
                  key={index}
                  className={
                    line.includes("ALERT")
                      ? "text-red-400"
                      : line.includes("Cycle:")
                        ? "text-yellow-400"
                        : line.includes("complete")
                          ? "text-green-400"
                          : "text-green-500"
                  }
                >
                  {line}
                </div>
              ))}
              <div className="h-4 w-full animate-pulse">
                <span className="inline-block w-2 h-4 bg-green-500 animate-blink"></span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Button
              onClick={runAnalysis}
              className="bg-green-900/20 hover:bg-green-900/40 text-green-500 border border-green-500/50"
            >
              <Terminal className="h-4 w-4 mr-2" /> Run Analysis
            </Button>

            <Button
              variant="outline"
              className="border-green-500/50 hover:bg-green-900/20"
              onClick={() => setConsoleOutput([])}
            >
              Clear Console
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="solutions" className="flex-1">
          <div className="border border-green-500/20 rounded-md bg-black p-4 h-[300px] overflow-y-auto">
            <div className="flex items-center mb-4">
              <div className="mr-2">
                {analysisResults.deadlockDetected ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                )}
              </div>
              <h3 className="text-lg font-bold">
                {analysisResults.deadlockDetected ? (
                  <span className="text-red-400">Deadlock Detected</span>
                ) : (
                  <span className="text-green-400">No Deadlock</span>
                )}
              </h3>
            </div>

            {analysisResults.deadlockDetected && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-white mb-1">Deadlock Cycle:</h4>
                <div className="bg-red-900/20 border border-red-500/30 rounded-md p-2 font-mono text-sm">
                  {analysisResults.cycle.join(" → ")}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Process Wait Times:</h4>
                <div className="space-y-2">
                  {Object.entries(analysisResults.waitingTime).map(([process, time]) => (
                    <div key={process} className="flex justify-between items-center">
                      <span className="text-sm">{process}:</span>
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-cyan-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, time / 2)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400">{time}ms</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">Resource Utilization:</h4>
                <div className="flex flex-col items-center">
                  <div className="relative w-20 h-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="10" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#0891b2"
                        strokeWidth="10"
                        strokeDasharray={`${analysisResults.resourceUtilization * 283} 283`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                      {Math.round(analysisResults.resourceUtilization * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-white mb-2">Recommended Actions:</h4>
            <div className="space-y-2">
              {analysisResults.suggestedActions.map((action, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border border-green-500/30 bg-green-900/10 rounded-md p-3"
                >
                  <span className="text-sm">{action}</span>
                  <Button
                    size="sm"
                    className="bg-green-900/20 hover:bg-green-900/40 text-green-500 border border-green-500/50"
                    onClick={() => applyResolution(action)}
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

