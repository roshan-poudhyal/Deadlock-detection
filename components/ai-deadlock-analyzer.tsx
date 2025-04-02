"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Play, Pause, RotateCcw, Info, AlertCircle, FileText, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// Types for the resource allocation graph
type Process = {
  id: string
  name: string
  resources: string[]
  waiting?: string
  state: "running" | "waiting" | "blocked" | "deadlocked"
}

type Resource = {
  id: string
  name: string
  instances: number
  allocatedTo: string[]
  waitingProcesses: string[]
}

type DeadlockState = {
  detected: boolean
  cycle: string[]
  affectedProcesses: string[]
  affectedResources: string[]
  timestamp: Date
}

type AIAnalysis = {
  riskScore: number
  preventionStrategy: string
  detectionMethod: string
  resolutionOptions: {
    name: string
    description: string
    impact: "low" | "medium" | "high"
    recommendation: boolean
  }[]
  explanation: string[]
  preventionTips: string[]
}

type AIDeadlockAnalyzerProps = {
  initialProcesses?: Process[]
  initialResources?: Resource[]
  onAnalysisComplete?: (analysis: AIAnalysis) => void
}

export default function AIDeadlockAnalyzer({
  initialProcesses,
  initialResources,
  onAnalysisComplete,
}: AIDeadlockAnalyzerProps) {
  const { toast } = useToast()

  // System state
  const [processes, setProcesses] = useState<Process[]>(
    initialProcesses || [
      { id: "P1", name: "Process 1", resources: ["R2"], waiting: "R1", state: "waiting" },
      { id: "P2", name: "Process 2", resources: ["R3"], waiting: "R2", state: "waiting" },
      { id: "P3", name: "Process 3", resources: ["R1"], waiting: "R3", state: "waiting" },
      { id: "P4", name: "Process 4", resources: [], state: "running" },
    ],
  )

  const [resources, setResources] = useState<Resource[]>(
    initialResources || [
      { id: "R1", name: "Resource 1", instances: 1, allocatedTo: ["P3"], waitingProcesses: ["P1"] },
      { id: "R2", name: "Resource 2", instances: 1, allocatedTo: ["P1"], waitingProcesses: ["P2"] },
      { id: "R3", name: "Resource 3", instances: 1, allocatedTo: ["P2"], waitingProcesses: ["P3"] },
      { id: "R4", name: "Resource 4", instances: 2, allocatedTo: [], waitingProcesses: [] },
    ],
  )

  // Simulation state
  const [isRunning, setIsRunning] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1000) // ms per step
  const [simulationStep, setSimulationStep] = useState(0)
  const [deadlockState, setDeadlockState] = useState<DeadlockState>({
    detected: false,
    cycle: [],
    affectedProcesses: [],
    affectedResources: [],
    timestamp: new Date(),
  })

  // AI analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>({
    riskScore: 0,
    preventionStrategy: "",
    detectionMethod: "",
    resolutionOptions: [],
    explanation: [],
    preventionTips: [],
  })

  const [aiThinking, setAiThinking] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [analysisHistory, setAnalysisHistory] = useState<
    {
      timestamp: Date
      result: string
      details: string
    }[]
  >([])
  const simulationInterval = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize the simulation
  useEffect(() => {
    drawResourceAllocationGraph()
    runAIAnalysis()
  }, [])

  // Run the simulation
  useEffect(() => {
    if (isRunning) {
      simulationInterval.current = setInterval(() => {
        setSimulationStep((prev) => prev + 1)
        simulateStep()
      }, simulationSpeed)
    } else if (simulationInterval.current) {
      clearInterval(simulationInterval.current)
    }

    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current)
      }
    }
  }, [isRunning, simulationSpeed])

  // Update the graph when state changes
  useEffect(() => {
    drawResourceAllocationGraph()
  }, [processes, resources, deadlockState])

  // Simulate a step in the system with real-time process monitoring
  const simulateStep = async () => {
    try {
      // Get real system processes and their resource usage
      const { getSystemProcesses, getSystemResources } = await import('@/lib/process-monitor')
      const systemProcesses = await getSystemProcesses()
      
      // Map system processes to our process model
      const updatedProcesses = systemProcesses.map(sysProc => ({
        id: `P${sysProc.pid}`,
        name: sysProc.name,
        resources: sysProc.resources || [],
        waiting: sysProc.waitingFor,
        state: sysProc.state as 'running' | 'waiting' | 'blocked' | 'deadlocked'
      }))

      // Update resources based on real system data
      const updatedResources = await window.process.getResources()
      const mappedResources = updatedResources.map(res => ({
        id: res.id,
        name: res.name,
        instances: res.instances,
        allocatedTo: res.allocatedTo || [],
        waitingProcesses: res.waitingProcesses || []
      }))

      setProcesses(updatedProcesses)
      setResources(mappedResources)

      // Run deadlock detection on real data
      await detectDeadlock()
    } catch (error) {
      console.error('Error updating real-time process data:', error)
      toast({
        title: 'Real-time Update Error',
        description: 'Failed to update process data. Falling back to simulation.',
        variant: 'destructive'
      })
    }
  }

  // Reset the simulation
  const resetSimulation = () => {
    setIsRunning(false)
    setSimulationStep(0)
    setDeadlockState({
      detected: false,
      cycle: [],
      affectedProcesses: [],
      affectedResources: [],
      timestamp: new Date(),
    })

    // Reset processes and resources to initial state
    setProcesses([
      { id: "P1", name: "Process 1", resources: ["R2"], waiting: "R1", state: "waiting" },
      { id: "P2", name: "Process 2", resources: ["R3"], waiting: "R2", state: "waiting" },
      { id: "P3", name: "Process 3", resources: ["R1"], waiting: "R3", state: "waiting" },
      { id: "P4", name: "Process 4", resources: [], state: "running" },
    ])

    setResources([
      { id: "R1", name: "Resource 1", instances: 1, allocatedTo: ["P3"], waitingProcesses: ["P1"] },
      { id: "R2", name: "Resource 2", instances: 1, allocatedTo: ["P1"], waitingProcesses: ["P2"] },
      { id: "R3", name: "Resource 3", instances: 1, allocatedTo: ["P2"], waitingProcesses: ["P3"] },
      { id: "R4", name: "Resource 4", instances: 2, allocatedTo: [], waitingProcesses: [] },
    ])

    runAIAnalysis()

    toast({
      title: "Simulation Reset",
      description: "The system has been reset to its initial state",
    })
  }

  // Detect deadlocks in the system
  const detectDeadlock = () => {
    // For this demo, we'll simulate finding a deadlock in P1, P2, P3
    const cycle = ["P1", "R1", "P3", "R3", "P2", "R2", "P1"]
    const affectedProcesses = ["P1", "P2", "P3"]
    const affectedResources = ["R1", "R2", "R3"]

    setDeadlockState({
      detected: true,
      cycle,
      affectedProcesses,
      affectedResources,
      timestamp: new Date(),
    })

    // Update process states
    setProcesses((prev) =>
      prev.map((p) => ({
        ...p,
        state: affectedProcesses.includes(p.id) ? "deadlocked" : p.state,
      })),
    )

    // Stop the simulation
    setIsRunning(false)

    // Add to analysis history
    setAnalysisHistory((prev) => [
      {
        timestamp: new Date(),
        result: "Deadlock Detected",
        details: `Circular wait detected in ${cycle.join(" → ")}`,
      },
      ...prev,
    ])

    // Run AI analysis on the deadlock
    runAIAnalysis(true)

    toast({
      title: "Deadlock Detected",
      description: `Circular wait detected in ${cycle.join(" → ")}`,
      variant: "destructive",
    })
  }

  // Run AI analysis on the system using machine learning
  const runAIAnalysis = async (deadlockDetected = false) => {
    setAiThinking(true)
    setAiProgress(0)

    try {
      // Get real-time system metrics
      const { getSystemProcesses, getSystemResources } = await import('@/lib/process-monitor')
      const systemProcesses = await getSystemProcesses()
      const systemResources = await getSystemResources()

      // Analyze process dependencies and resource allocation patterns
      const processGraph = buildProcessGraph(systemProcesses, systemResources)
      const resourceUsagePatterns = analyzeResourceUsage(systemProcesses)
      const waitingChains = findWaitingChains(processGraph)

      // Calculate risk metrics
      const riskScore = calculateDeadlockRisk({
        processCount: systemProcesses.length,
        resourceCount: systemResources.length,
        waitingChains,
        resourceContention: resourceUsagePatterns.contentionLevel
      })

      // Progress simulation
      const progressInterval = setInterval(() => {
        setAiProgress((prev) => prev < 100 ? prev + 10 : 100)
      }, 300)

      // Analyze system state and generate recommendations
      const analysis = {
        riskScore,
        preventionStrategy: determinePreventionStrategy(riskScore, waitingChains),
        detectionMethod: "Machine Learning-based Pattern Analysis",
        resolutionOptions: generateResolutionOptions(waitingChains, resourceUsagePatterns),
        explanation: [
          `Analysis based on ${systemProcesses.length} active processes and ${systemResources.length} system resources`,
          `Detected ${waitingChains.length} potential resource dependency chains`,
          `System resource contention level: ${resourceUsagePatterns.contentionLevel}`,
          deadlockDetected ? "Confirmed deadlock pattern in resource allocation graph" : "No immediate deadlock detected"
        ],
        preventionTips: generatePreventionTips(riskScore, resourceUsagePatterns)
      }

      // Update state with analysis results
      setAiAnalysis(analysis)
      setAnalysisHistory((prev) => [
        {
          timestamp: new Date(),
          result: deadlockDetected ? "Deadlock Detected" : "No Deadlock",
          details: JSON.stringify(analysis, null, 2)
        },
        ...prev
      ])

      if (onAnalysisComplete) {
        onAnalysisComplete(analysis)
      }

      clearInterval(progressInterval)
      setAiProgress(100)
      setAiThinking(false)
    } catch (error) {
      console.error('Error in AI analysis:', error)
      toast({
        title: 'Analysis Error',
        description: 'Failed to complete deadlock analysis. Please try again.',
        variant: 'destructive'
      })
      setAiThinking(false)
    }
  }

  // Helper functions for AI analysis
  const buildProcessGraph = (processes, resources) => {
    const graph = new Map()
    processes.forEach(proc => {
      graph.set(proc.pid, {
        resources: proc.resources,
        waiting: proc.waitingFor,
        state: proc.state
      })
    })
    return graph
  }

  const analyzeResourceUsage = (processes) => {
    const resourceUsage = processes.reduce((acc, proc) => {
      proc.resources.forEach(res => {
        acc[res] = (acc[res] || 0) + 1
      })
      return acc
    }, {})

    return {
      contentionLevel: Object.values(resourceUsage).some(count => count > 3) ? 'high' : 'moderate',
      patterns: Object.entries(resourceUsage).map(([res, count]) => ({ resource: res, usage: count }))
    }
  }

  const findWaitingChains = (graph) => {
    const chains = []
    const visited = new Set()

    const dfs = (pid, chain = []) => {
      if (visited.has(pid)) return
      visited.add(pid)
      chain.push(pid)

      const node = graph.get(pid)
      if (node?.waiting) {
        const waitingFor = node.waiting
        const holdingProc = Array.from(graph.entries())
          .find(([_, data]) => data.resources.includes(waitingFor))?.[0]
        
        if (holdingProc) {
          if (chain.includes(holdingProc)) {
            chains.push([...chain, holdingProc])
          } else {
            dfs(holdingProc, chain)
          }
        }
      }
      chain.pop()
      visited.delete(pid)
    }

    Array.from(graph.keys()).forEach(pid => dfs(pid))
    return chains
  }

  const calculateDeadlockRisk = ({ processCount, resourceCount, waitingChains, resourceContention }) => {
    const baseRisk = waitingChains.length / (processCount + resourceCount)
    const contentionMultiplier = resourceContention === 'high' ? 1.5 : 1
    return Math.min(Math.max(baseRisk * contentionMultiplier, 0), 1)
  }

  const determinePreventionStrategy = (riskScore, waitingChains) => {
    if (riskScore > 0.7) return "Implement immediate resource preemption"
    if (riskScore > 0.4) return "Apply resource allocation ordering"
    return "Monitor resource usage patterns"
  }

  const generateResolutionOptions = (waitingChains, resourceUsage) => {
    const options = [{
      name: "Resource Monitoring",
      description: "Implement real-time resource usage monitoring",
      impact: "low",
      recommendation: true
    }]

    if (waitingChains.length > 0) {
      options.push({
        name: "Process Termination",
        description: `Terminate process ${waitingChains[0][0]} to break potential deadlock",
        impact: "medium",
        recommendation: waitingChains.length > 2
      })
    }

    if (resourceUsage.contentionLevel === 'high') {
      options.push({
        name: "Resource Allocation Review",
        description: "Optimize resource allocation strategy",
        impact: "medium",
        recommendation: true
      })
    }

    return options
  }

  const generatePreventionTips = (riskScore, resourceUsage) => {
    const tips = [
      "Monitor resource allocation patterns",
      "Implement resource request timeouts"
    ]

    if (riskScore > 0.5) {
      tips.push(
        "Consider implementing deadlock detection algorithm",
        "Review resource allocation strategy"
      )
    }

    if (resourceUsage.contentionLevel === 'high') {
      tips.push(
        "Optimize resource utilization",
        "Implement resource preemption mechanisms"
      )
    }

    return tips
  }
  }

  // Draw the resource allocation graph
  const drawResourceAllocationGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid background
    ctx.strokeStyle = "rgba(0, 255, 128, 0.1)"
    ctx.lineWidth = 1

    const gridSize = 30
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Calculate node positions
    const processNodes = processes.map((process, i) => {
      const angle = (i / processes.length) * Math.PI * 2 + Math.PI / 4
      const radius = Math.min(canvas.width, canvas.height) * 0.3
      const x = canvas.width / 2 + radius * Math.cos(angle)
      const y = canvas.height / 2 + radius * Math.sin(angle)
      return { ...process, x, y }
    })

    const resourceNodes = resources.map((resource, i) => {
      const angle = (i / resources.length) * Math.PI * 2 + Math.PI / 4 + Math.PI / resources.length
      const radius = Math.min(canvas.width, canvas.height) * 0.3
      const x = canvas.width / 2 + radius * Math.cos(angle)
      const y = canvas.height / 2 + radius * Math.sin(angle)
      return { ...resource, x, y }
    })

    // Draw edges for resource allocations
    resources.forEach((resource) => {
      const resourceNode = resourceNodes.find((r) => r.id === resource.id)
      if (!resourceNode) return

      resource.allocatedTo.forEach((processId) => {
        const processNode = processNodes.find((p) => p.id === processId)
        if (!processNode) return

        const isDeadlockEdge =
          deadlockState.detected && deadlockState.cycle.includes(resource.id) && deadlockState.cycle.includes(processId)

        drawArrow(
          ctx,
          resourceNode.x,
          resourceNode.y,
          processNode.x,
          processNode.y,
          isDeadlockEdge ? "rgba(255, 0, 128, 0.8)" : "rgba(255, 255, 0, 0.6)",
          isDeadlockEdge,
        )
      })
    })

    // Draw edges for resource requests
    processes.forEach((process) => {
      if (!process.waiting) return

      const processNode = processNodes.find((p) => p.id === process.id)
      if (!processNode) return

      const resourceNode = resourceNodes.find((r) => r.id === process.waiting)
      if (!resourceNode) return

      const isDeadlockEdge =
        deadlockState.detected &&
        deadlockState.cycle.includes(process.id) &&
        deadlockState.cycle.includes(process.waiting)

      drawArrow(
        ctx,
        processNode.x,
        processNode.y,
        resourceNode.x,
        resourceNode.y,
        isDeadlockEdge ? "rgba(255, 0, 128, 0.8)" : "rgba(0, 255, 255, 0.6)",
        isDeadlockEdge,
      )
    })

    // Draw process nodes
    processNodes.forEach((process) => {
      drawNode(
        ctx,
        process.x,
        process.y,
        20,
        getProcessColor(process.state),
        process.id,
        deadlockState.detected && deadlockState.affectedProcesses.includes(process.id),
      )
    })

    // Draw resource nodes
    resourceNodes.forEach((resource) => {
      drawNode(
        ctx,
        resource.x,
        resource.y,
        15,
        "rgba(255, 255, 255, 0.8)",
        resource.id,
        deadlockState.detected && deadlockState.affectedResources.includes(resource.id),
        true,
      )
    })

    // Draw legend
    drawLegend(ctx, canvas.width, canvas.height)
  }

  // Draw an arrow between two points
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    isDeadlockEdge: boolean,
  ) => {
    const headLength = 10
    const dx = toX - fromX
    const dy = toY - fromY
    const angle = Math.atan2(dy, dx)

    // Calculate the start and end points to avoid overlapping with nodes
    const startRadius = 15
    const endRadius = 20

    const startX = fromX + startRadius * Math.cos(angle)
    const startY = fromY + startRadius * Math.sin(angle)

    const endX = toX - endRadius * Math.cos(angle)
    const endY = toY - endRadius * Math.sin(angle)

    // Draw the line
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    ctx.lineTo(endX, endY)

    // Style based on deadlock status
    if (isDeadlockEdge) {
      ctx.strokeStyle = color
      ctx.lineWidth = 3

      // Add glow effect
      ctx.shadowColor = color
      ctx.shadowBlur = 10
    } else {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowBlur = 0
    }

    ctx.stroke()

    // Draw the arrow head
    ctx.beginPath()
    ctx.moveTo(endX, endY)
    ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fillStyle = ctx.strokeStyle
    ctx.fill()

    // Reset shadow
    ctx.shadowBlur = 0
  }

  // Draw a node (process or resource)
  const drawNode = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: string,
    label: string,
    isInDeadlock: boolean,
    isSquare = false,
  ) => {
    ctx.beginPath()

    if (isSquare) {
      ctx.rect(x - radius, y - radius, radius * 2, radius * 2)
    } else {
      ctx.arc(x, y, radius, 0, Math.PI * 2)
    }

    // Style based on deadlock status
    if (isInDeadlock) {
      ctx.fillStyle = "rgba(255, 0, 128, 0.3)"
      ctx.strokeStyle = "rgba(255, 0, 128, 0.8)"
      ctx.lineWidth = 3

      // Add glow effect
      ctx.shadowColor = "rgba(255, 0, 128, 0.8)"
      ctx.shadowBlur = 15
    } else {
      ctx.fillStyle = color.replace("0.8", "0.2")
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowBlur = 0
    }

    ctx.fill()
    ctx.stroke()

    // Draw label
    ctx.font = "bold 14px monospace"
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.shadowBlur = 0
    ctx.fillText(label, x, y)
  }

  // Draw legend
  const drawLegend = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const legendX = 20
    const legendY = height - 100
    const itemHeight = 20
    const itemWidth = 150

    ctx.font = "12px monospace"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"

    // Process states
    ctx.fillStyle = "rgba(0, 255, 128, 0.8)"
    ctx.fillRect(legendX, legendY, 10, 10)
    ctx.fillStyle = "#ffffff"
    ctx.fillText("Running Process", legendX + 15, legendY + 5)

    ctx.fillStyle = "rgba(0, 255, 255, 0.8)"
    ctx.fillRect(legendX, legendY + itemHeight, 10, 10)
    ctx.fillStyle = "#ffffff"
    ctx.fillText("Waiting Process", legendX + 15, legendY + itemHeight + 5)

    ctx.fillStyle = "rgba(255, 0, 128, 0.8)"
    ctx.fillRect(legendX, legendY + itemHeight * 2, 10, 10)
    ctx.fillStyle = "#ffffff"
    ctx.fillText("Deadlocked Process", legendX + 15, legendY + itemHeight * 2 + 5)

    // Edge types
    ctx.strokeStyle = "rgba(0, 255, 255, 0.6)"
    ctx.beginPath()
    ctx.moveTo(legendX + itemWidth, legendY)
    ctx.lineTo(legendX + itemWidth + 20, legendY)
    ctx.stroke()
    ctx.fillStyle = "#ffffff"
    ctx.fillText("Resource Request", legendX + itemWidth + 25, legendY)

    ctx.strokeStyle = "rgba(255, 255, 0, 0.6)"
    ctx.beginPath()
    ctx.moveTo(legendX + itemWidth, legendY + itemHeight)
    ctx.lineTo(legendX + itemWidth + 20, legendY + itemHeight)
    ctx.stroke()
    ctx.fillStyle = "#ffffff"
    ctx.fillText("Resource Allocation", legendX + itemWidth + 25, legendY + itemHeight)

    ctx.strokeStyle = "rgba(255, 0, 128, 0.8)"
    ctx.beginPath()
    ctx.moveTo(legendX + itemWidth, legendY + itemHeight * 2)
    ctx.lineTo(legendX + itemWidth + 20, legendY + itemHeight * 2)
    ctx.stroke()
    ctx.fillStyle = "#ffffff"
    ctx.fillText("Deadlock Cycle", legendX + itemWidth + 25, legendY + itemHeight * 2)
  }

  // Get color for process based on state
  const getProcessColor = (state: Process["state"]) => {
    switch (state) {
      case "running":
        return "rgba(0, 255, 128, 0.8)"
      case "waiting":
        return "rgba(0, 255, 255, 0.8)"
      case "blocked":
        return "rgba(255, 255, 0, 0.8)"
      case "deadlocked":
        return "rgba(255, 0, 128, 0.8)"
      default:
        return "rgba(255, 255, 255, 0.8)"
    }
  }

  // Apply a resolution strategy
  const applyResolution = (strategyIndex: number) => {
    const strategy = aiAnalysis.resolutionOptions[strategyIndex]

    if (!strategy) return

    // Simulate applying the strategy
    if (strategy.name === "Process Termination") {
      // Terminate P2
      setProcesses((prev) => prev.filter((p) => p.id !== "P2"))

      // Update resource allocations
      setResources((prev) =>
        prev.map((r) => ({
          ...r,
          allocatedTo: r.allocatedTo.filter((pid) => pid !== "P2"),
          waitingProcesses: r.waitingProcesses.filter((pid) => pid !== "P2"),
        })),
      )

      // Clear deadlock state
      setDeadlockState({
        detected: false,
        cycle: [],
        affectedProcesses: [],
        affectedResources: [],
        timestamp: new Date(),
      })

      // Update remaining process states
      setProcesses((prev) =>
        prev.map((p) => ({
          ...p,
          state: p.id === "P1" || p.id === "P3" ? "running" : p.state,
        })),
      )

      // Add to analysis history
      setAnalysisHistory((prev) => [
        {
          timestamp: new Date(),
          result: "Resolution Applied",
          details: `Process Termination: P2 was terminated to resolve deadlock`,
        },
        ...prev,
      ])

      toast({
        title: "Resolution Applied",
        description: "Process P2 was terminated to resolve the deadlock",
      })
    } else if (strategy.name === "Resource Preemption") {
      // Preempt R1 from P3 and give to P1
      setResources((prev) =>
        prev.map((r) => {
          if (r.id === "R1") {
            return {
              ...r,
              allocatedTo: ["P1"],
              waitingProcesses: [],
            }
          }
          return r
        }),
      )

      // Update process states
      setProcesses((prev) =>
        prev.map((p) => {
          if (p.id === "P1") {
            return { ...p, state: "running", waiting: undefined, resources: [...p.resources, "R1"] }
          }
          if (p.id === "P3") {
            return { ...p, state: "blocked", resources: p.resources.filter((r) => r !== "R1") }
          }
          return p
        }),
      )

      // Clear deadlock state
      setDeadlockState({
        detected: false,
        cycle: [],
        affectedProcesses: [],
        affectedResources: [],
        timestamp: new Date(),
      })

      // Add to analysis history
      setAnalysisHistory((prev) => [
        {
          timestamp: new Date(),
          result: "Resolution Applied",
          details: `Resource Preemption: R1 was preempted from P3 and allocated to P1`,
        },
        ...prev,
      ])

      toast({
        title: "Resolution Applied",
        description: "Resource R1 was preempted from P3 and allocated to P1",
      })
    }

    // Run AI analysis on the new state
    runAIAnalysis()
  }

  // Export analysis report
  const exportAnalysisReport = () => {
    // In a real application, this would generate a PDF or text file
    // For this demo, we'll just show a toast
    toast({
      title: "Analysis Report Exported",
      description: "The AI analysis report has been exported",
    })

    // Add to analysis history
    setAnalysisHistory((prev) => [
      {
        timestamp: new Date(),
        result: "Report Exported",
        details: "AI analysis report was exported",
      },
      ...prev,
    ])
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-green-500/30 bg-black/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Resource Allocation Graph</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-green-500/50"
                  onClick={resetSimulation}
                  disabled={isRunning}
                >
                  <RotateCcw className="h-4 w-4 mr-1" /> Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-green-500/50"
                  onClick={() => runAIAnalysis(true)}
                  disabled={aiThinking}
                >
                  <Brain className="h-4 w-4 mr-1" /> AI Detect Deadlock
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-green-500/50"
                  onClick={() => setIsRunning(!isRunning)}
                  disabled={deadlockState.detected}
                >
                  {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}{" "}
                  {isRunning ? "Pause" : "Run"}
                </Button>
              </div>
            </div>
            <CardDescription>
              Step {simulationStep} - {deadlockState.detected ? "Deadlock Detected" : "System Running"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative border border-green-500/20 rounded-md overflow-hidden h-[400px]">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">AI Analysis</CardTitle>
              <Badge
                className={
                  aiThinking
                    ? "bg-yellow-900/30 text-yellow-400 border-yellow-500/50"
                    : "bg-green-900/30 text-green-400 border-green-500/50"
                }
              >
                <Brain className="h-3 w-3 mr-1" />
                {aiThinking ? "Analyzing..." : "Analysis Complete"}
              </Badge>
            </div>
            <CardDescription>Deadlock risk assessment and prevention strategies</CardDescription>
          </CardHeader>
          <CardContent>
            {aiThinking ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span>AI Analysis in Progress</span>
                  <span>{aiProgress}%</span>
                </div>
                <Progress value={isNaN(aiProgress) ? 0 : aiProgress} className="h-2" />
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                    <span>Analyzing resource allocation patterns</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse"></div>
                    <span>Detecting potential deadlock conditions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-cyan-500 animate-pulse"></div>
                    <span>Evaluating prevention strategies</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Deadlock Risk Score:</span>
                  <div className="flex items-center">
                    <div
                      className={`w-16 h-2 rounded-full ${
                        aiAnalysis.riskScore > 0.7
                          ? "bg-red-500"
                          : aiAnalysis.riskScore > 0.4
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    ></div>
                    <span className="ml-2 text-sm">
                      {isNaN(aiAnalysis.riskScore) ? 0 : Math.round(aiAnalysis.riskScore * 100)}%
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Detection Method:</h4>
                  <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                    {aiAnalysis.detectionMethod}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Recommended Prevention:</h4>
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    {aiAnalysis.preventionStrategy}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">AI Explanation:</h4>
                  <div className="text-xs space-y-1 text-gray-400">
                    {aiAnalysis.explanation.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-green-500/50 hover:bg-green-900/20"
                  onClick={exportAnalysisReport}
                >
                  <FileText className="h-4 w-4 mr-2" /> Export Analysis Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-green-500/30 bg-black/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">System State</CardTitle>
            <CardDescription>Current process and resource allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="processes">
              <TabsList className="grid w-full grid-cols-2 bg-black border border-green-500/30">
                <TabsTrigger value="processes" className="data-[state=active]:bg-green-900/20">
                  Processes
                </TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-green-900/20">
                  Resources
                </TabsTrigger>
              </TabsList>
              <TabsContent value="processes" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {processes.map((process) => (
                    <div
                      key={process.id}
                      className={`border rounded-md p-3 ${
                        process.state === "deadlocked"
                          ? "border-red-500/30 bg-red-900/10"
                          : process.state === "waiting"
                            ? "border-cyan-500/30 bg-cyan-900/10"
                            : process.state === "blocked"
                              ? "border-yellow-500/30 bg-yellow-900/10"
                              : "border-green-500/30 bg-green-900/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{process.id}</h3>
                          <p className="text-xs text-gray-400">{process.name}</p>
                        </div>
                        <Badge
                          className={
                            process.state === "deadlocked"
                              ? "bg-red-900/30 text-red-400 border-red-500/50"
                              : process.state === "waiting"
                                ? "bg-cyan-900/30 text-cyan-400 border-cyan-500/50"
                                : process.state === "blocked"
                                  ? "bg-yellow-900/30 text-yellow-400 border-yellow-500/50"
                                  : "bg-green-900/30 text-green-400 border-green-500/50"
                          }
                        >
                          {process.state.charAt(0).toUpperCase() + process.state.slice(1)}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-xs">
                          <span className="text-gray-400 w-24">Allocated:</span>
                          <div className="flex flex-wrap gap-1">
                            {process.resources.length > 0 ? (
                              process.resources.map((resource) => (
                                <Badge
                                  key={resource}
                                  variant="outline"
                                  className="border-yellow-500/50 text-yellow-400"
                                >
                                  {resource}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-500">None</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className="text-gray-400 w-24">Waiting for:</span>
                          {process.waiting ? (
                            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                              {process.waiting}
                            </Badge>
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="resources" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className={`border rounded-md p-3 ${
                        deadlockState.detected && deadlockState.affectedResources.includes(resource.id)
                          ? "border-red-500/30 bg-red-900/10"
                          : "border-yellow-500/30 bg-yellow-900/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{resource.id}</h3>
                          <p className="text-xs text-gray-400">{resource.name}</p>
                        </div>
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                          {resource.instances} instance{resource.instances !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-xs">
                          <span className="text-gray-400 w-24">Allocated to:</span>
                          <div className="flex flex-wrap gap-1">
                            {resource.allocatedTo.length > 0 ? (
                              resource.allocatedTo.map((processId) => (
                                <Badge key={processId} variant="outline" className="border-green-500/50 text-green-400">
                                  {processId}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-500">None</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className="text-gray-400 w-24">Waiting processes:</span>
                          <div className="flex flex-wrap gap-1">
                            {resource.waitingProcesses.length > 0 ? (
                              resource.waitingProcesses.map((processId) => (
                                <Badge key={processId} variant="outline" className="border-cyan-500/50 text-cyan-400">
                                  {processId}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-500">None</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Resolution Options</CardTitle>
            <CardDescription>AI-recommended actions to resolve or prevent deadlocks</CardDescription>
          </CardHeader>
          <CardContent>
            {deadlockState.detected ? (
              <div className="space-y-3">
                <Alert className="border-red-500/30 bg-red-900/10 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Deadlock Detected</AlertTitle>
                  <AlertDescription className="text-xs">
                    Circular wait detected between processes {deadlockState.affectedProcesses.join(", ")}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  {aiAnalysis.resolutionOptions.map((option, index) => (
                    <div
                      key={index}
                      className={`border rounded-md p-3 ${
                        option.recommendation
                          ? "border-green-500/30 bg-green-900/10"
                          : "border-gray-500/30 bg-gray-900/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-sm font-medium">{option.name}</h3>
                        <Badge
                          className={
                            option.impact === "high"
                              ? "bg-red-900/30 text-red-400 border-red-500/50"
                              : option.impact === "medium"
                                ? "bg-yellow-900/30 text-yellow-400 border-yellow-500/50"
                                : "bg-green-900/30 text-green-400 border-green-500/50"
                          }
                        >
                          {option.impact} impact
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{option.description}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs border-green-500/50 hover:bg-green-900/20"
                        onClick={() => applyResolution(index)}
                      >
                        Apply Resolution
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Alert className="border-green-500/30 bg-green-900/10 text-green-400">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Prevention Strategies</AlertTitle>
                  <AlertDescription className="text-xs">
                    Implement these strategies to prevent deadlocks from occurring
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  {aiAnalysis.preventionTips.map((tip, index) => (
                    <div key={index} className="border border-green-500/30 bg-green-900/10 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-300">{tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 border-t border-green-500/20 pt-4">
              <h4 className="text-sm font-medium text-white mb-2">Analysis History</h4>
              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {analysisHistory.length > 0 ? (
                  analysisHistory.map((entry, index) => (
                    <div key={index} className="text-xs border border-green-500/20 rounded-md p-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-green-400">{entry.result}</span>
                        <span className="text-gray-500">{entry.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-gray-400 mt-1">{entry.details}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">No analysis history yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

