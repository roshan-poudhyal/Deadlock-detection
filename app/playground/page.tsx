"use client"

import Header from "@/components/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DeadlockSimulator from "@/components/deadlock-simulator"
import ProcessCreator from "@/components/process-creator"
import ResourceManager from "@/components/resource-manager"
import AnalysisPanel from "@/components/analysis-panel"
import ThreadAnimation from "@/components/thread-animation"
import AIDeadlockAnalyzer from "@/components/ai-deadlock-analyzer"
import { useState, useEffect } from "react"

export default function PlaygroundPage() {
  const [processes, setProcesses] = useState([
    { id: "P1", name: "Process 1", priority: 1, resources: ["R2"] },
    { id: "P2", name: "Process 2", priority: 2, resources: ["R3"] },
    { id: "P3", name: "Process 3", priority: 1, resources: ["R1"] },
  ])

  const [resources, setResources] = useState([
    { id: "R1", name: "Resource 1", type: "exclusive", instances: 1, allocatedTo: ["P3"] },
    { id: "R2", name: "Resource 2", type: "exclusive", instances: 1, allocatedTo: ["P1"] },
    { id: "R3", name: "Resource 3", type: "exclusive", instances: 1, allocatedTo: ["P2"] },
  ])

  const [graphData, setGraphData] = useState({
    nodes: [
      { id: "P1", type: "process", label: "Process 1" },
      { id: "P2", type: "process", label: "Process 2" },
      { id: "P3", type: "process", label: "Process 3" },
      { id: "R1", type: "resource", label: "Resource 1" },
      { id: "R2", type: "resource", label: "Resource 2" },
      { id: "R3", type: "resource", label: "Resource 3" },
    ],
    links: [
      { source: "P1", target: "R1", type: "request" },
      { source: "R2", target: "P1", type: "allocation" },
      { source: "P2", target: "R2", type: "request" },
      { source: "R3", target: "P2", type: "allocation" },
      { source: "P3", target: "R3", type: "request" },
      { source: "R1", target: "P3", type: "allocation" },
    ],
  })

  // Update graph data when processes or resources change
  useEffect(() => {
    // Build new graph data based on processes and resources
    const nodes = [
      ...processes.map((p) => ({ id: p.id, type: "process", label: p.name })),
      ...resources.map((r) => ({ id: r.id, type: "resource", label: r.name })),
    ]

    const links = []

    // Add allocation links
    resources.forEach((resource) => {
      resource.allocatedTo.forEach((processId) => {
        links.push({
          source: resource.id,
          target: processId,
          type: "allocation",
        })
      })
    })

    // Add request links (simplified for demo)
    // In a real app, you would track which processes are waiting for which resources
    if (processes.length >= 3 && resources.length >= 3) {
      links.push({ source: "P1", target: "R1", type: "request" })
      links.push({ source: "P2", target: "R2", type: "request" })
      links.push({ source: "P3", target: "R3", type: "request" })
    }

    setGraphData({ nodes, links })
  }, [processes, resources])

  const handleProcessesChange = (newProcesses) => {
    setProcesses(newProcesses)
  }

  const handleResourcesChange = (newResources) => {
    setResources(newResources)
  }

  return (
    <main className="min-h-screen bg-black text-green-500 flex flex-col relative overflow-hidden">
      <Header />

      {/* Background thread animations */}
      <ThreadAnimation density={0.5} />

      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col relative z-10">
        <h1 className="text-3xl font-bold mb-6">
          <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Interactive Deadlock Playground
          </span>
        </h1>

        <Tabs defaultValue="ai-analyzer" className="flex-1">
          <TabsList className="grid w-full grid-cols-2 bg-black border border-green-500/30 mb-6">
            <TabsTrigger value="ai-analyzer" className="data-[state=active]:bg-green-900/20">
              AI Deadlock Analyzer
            </TabsTrigger>
            <TabsTrigger value="manual-simulator" className="data-[state=active]:bg-green-900/20">
              Manual Simulator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-analyzer" className="flex-1">
            <AIDeadlockAnalyzer />
          </TabsContent>

          <TabsContent value="manual-simulator" className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              <div className="lg:col-span-2 flex flex-col">
                <div className="border border-green-500/30 rounded-lg p-4 bg-black/80 backdrop-blur-sm flex-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
                  <h2 className="text-xl font-mono mb-4 flex items-center">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    System Visualization
                  </h2>
                  <DeadlockSimulator initialData={graphData} />
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="border border-green-500/30 rounded-lg p-4 bg-black/80 backdrop-blur-sm">
                  <h2 className="text-xl font-mono mb-4 flex items-center">
                    <span className="inline-block w-3 h-3 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
                    System Configuration
                  </h2>

                  <Tabs defaultValue="processes" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-black border border-green-500/30">
                      <TabsTrigger value="processes" className="data-[state=active]:bg-green-900/20">
                        Processes
                      </TabsTrigger>
                      <TabsTrigger value="resources" className="data-[state=active]:bg-green-900/20">
                        Resources
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="processes" className="mt-4">
                      <ProcessCreator
                        onProcessesChange={handleProcessesChange}
                        availableResources={resources.map((r) => r.id)}
                      />
                    </TabsContent>
                    <TabsContent value="resources" className="mt-4">
                      <ResourceManager
                        onResourcesChange={handleResourcesChange}
                        processes={processes.map((p) => p.id)}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="border border-green-500/30 rounded-lg p-4 bg-black/80 backdrop-blur-sm flex-1">
                  <h2 className="text-xl font-mono mb-4 flex items-center">
                    <span className="inline-block w-3 h-3 bg-magenta-500 rounded-full mr-2 animate-pulse"></span>
                    Analysis & Solutions
                  </h2>
                  <AnalysisPanel />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

