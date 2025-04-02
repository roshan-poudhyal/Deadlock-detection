"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Play, Pause, RotateCcw, Download, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

// Types for graph data
type Node = {
  id: string
  type: "process" | "resource"
  label: string
  x?: number
  y?: number
}

type Link = {
  source: string
  target: string
  type: "request" | "allocation"
}

type GraphData = {
  nodes: Node[]
  links: Link[]
}

type DeadlockSimulatorProps = {
  initialData?: GraphData
  onDeadlockDetected?: (cycle: string[], affectedProcesses: string[], affectedResources: string[]) => void
}

// Initial graph data
const defaultGraphData: GraphData = {
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
}

export default function DeadlockSimulator({ initialData, onDeadlockDetected }: DeadlockSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [graphData, setGraphData] = useState<GraphData>(initialData || defaultGraphData)
  const [deadlockDetected, setDeadlockDetected] = useState(false)
  const [cycle, setCycle] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [draggedNode, setDraggedNode] = useState<Node | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationStep, setSimulationStep] = useState(0)
  const simulationInterval = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Initialize the graph
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Calculate initial node positions if not set
    const nodes = graphData.nodes.map((node, i) => {
      if (node.x !== undefined && node.y !== undefined) {
        return node
      }

      const angle = (i / graphData.nodes.length) * Math.PI * 2
      const radius = Math.min(canvas.width, canvas.height) * 0.35
      const x = canvas.width / 2 + radius * Math.cos(angle)
      const y = canvas.height / 2 + radius * Math.sin(angle)

      return { ...node, x, y }
    })

    setGraphData({ ...graphData, nodes })

    // Draw the graph
    drawGraph(ctx, canvas.width, canvas.height)

    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drawGraph(ctx, canvas.width, canvas.height)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Update the graph when data changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    drawGraph(ctx, canvas.width, canvas.height)
  }, [graphData, deadlockDetected, cycle, selectedNode])

  // Handle simulation
  useEffect(() => {
    if (isSimulating) {
      simulationInterval.current = setInterval(() => {
        setSimulationStep((prev) => prev + 1)
        simulateStep()
      }, 1000)
    } else if (simulationInterval.current) {
      clearInterval(simulationInterval.current)
    }

    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current)
      }
    }
  }, [isSimulating])

  // Simulate a step in the system
  const simulateStep = () => {
    // In a real system, this would update process states, resource allocations, etc.
    // For this demo, we'll just detect deadlocks after a few steps
    if (simulationStep === 3 && !deadlockDetected) {
      detectDeadlock()
    }
  }

  // Draw the graph
  const drawGraph = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = "rgba(0, 255, 128, 0.1)"
    ctx.lineWidth = 1

    const gridSize = 30
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw links
    graphData.links.forEach((link) => {
      const source = graphData.nodes.find((n) => n.id === link.source)
      const target = graphData.nodes.find((n) => n.id === link.target)

      if (
        !source ||
        !target ||
        source.x === undefined ||
        source.y === undefined ||
        target.x === undefined ||
        target.y === undefined
      )
        return

      ctx.beginPath()
      ctx.moveTo(source.x, source.y)
      ctx.lineTo(target.x, target.y)

      // Style based on link type and deadlock status
      const isDeadlockLink = deadlockDetected && cycle.includes(source.id) && cycle.includes(target.id)

      if (isDeadlockLink) {
        ctx.strokeStyle = "rgba(255, 0, 128, 0.8)"
        ctx.lineWidth = 3

        // Add glow effect for deadlock links
        ctx.shadowColor = "rgba(255, 0, 128, 0.8)"
        ctx.shadowBlur = 10
      } else if (link.type === "request") {
        ctx.strokeStyle = "rgba(0, 255, 255, 0.6)"
        ctx.lineWidth = 2
        ctx.shadowBlur = 0
      } else {
        ctx.strokeStyle = "rgba(255, 255, 0, 0.6)"
        ctx.lineWidth = 2
        ctx.shadowBlur = 0
      }

      ctx.stroke()

      // Draw arrow
      const angle = Math.atan2(target.y - source.y, target.x - source.x)
      const arrowSize = 10

      ctx.beginPath()
      ctx.moveTo(
        target.x - arrowSize * Math.cos(angle) - arrowSize * Math.sin(angle),
        target.y - arrowSize * Math.sin(angle) + arrowSize * Math.cos(angle),
      )
      ctx.lineTo(target.x - arrowSize * Math.cos(angle), target.y - arrowSize * Math.sin(angle))
      ctx.lineTo(
        target.x - arrowSize * Math.cos(angle) + arrowSize * Math.sin(angle),
        target.y - arrowSize * Math.sin(angle) - arrowSize * Math.cos(angle),
      )
      ctx.closePath()
      ctx.fillStyle = ctx.strokeStyle
      ctx.fill()

      // Reset shadow
      ctx.shadowBlur = 0
    })

    // Draw nodes
    graphData.nodes.forEach((node) => {
      if (node.x === undefined || node.y === undefined) return

      ctx.beginPath()

      if (node.type === "resource") {
        // Draw resources as squares
        const size = 20
        ctx.rect(node.x - size / 2, node.y - size / 2, size, size)
      } else {
        // Draw processes as circles
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2)
      }

      // Style based on node type, selection state, and deadlock status
      const isInDeadlock = deadlockDetected && cycle.includes(node.id)
      const isSelected = selectedNode && selectedNode.id === node.id

      if (isSelected) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
        ctx.lineWidth = 3
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)"
        ctx.shadowBlur = 15
      } else if (isInDeadlock) {
        ctx.fillStyle = node.type === "process" ? "rgba(255, 0, 128, 0.3)" : "rgba(255, 0, 128, 0.3)"
        ctx.strokeStyle = "rgba(255, 0, 128, 0.8)"
        ctx.lineWidth = 3
        ctx.shadowColor = "rgba(255, 0, 128, 0.8)"
        ctx.shadowBlur = 15
      } else {
        ctx.fillStyle = node.type === "process" ? "rgba(0, 255, 128, 0.2)" : "rgba(255, 255, 0, 0.2)"
        ctx.strokeStyle = node.type === "process" ? "rgba(0, 255, 128, 0.8)" : "rgba(255, 255, 0, 0.8)"
        ctx.lineWidth = 2
        ctx.shadowBlur = 0
      }

      ctx.fill()
      ctx.stroke()

      // Draw node label
      ctx.font = "12px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#ffffff"
      ctx.fillText(node.id, node.x, node.y)

      // Reset shadow
      ctx.shadowBlur = 0
    })
  }

  // Detect deadlocks in the graph
  const detectDeadlock = () => {
    setIsAnalyzing(true)

    // Simulate analysis time
    setTimeout(() => {
      // Build adjacency list for processes
      const adjacencyList: Record<string, string[]> = {}
      const processNodes = graphData.nodes.filter((node) => node.type === "process").map((node) => node.id)

      processNodes.forEach((processId) => {
        adjacencyList[processId] = []
      })

      // Find all process-to-process dependencies through resources
      graphData.links.forEach((link) => {
        if (link.type === "request") {
          const process = link.source
          const resource = link.target

          // Find who holds this resource
          const allocationLink = graphData.links.find((l) => l.type === "allocation" && l.source === resource)

          if (allocationLink && processNodes.includes(allocationLink.target)) {
            adjacencyList[process].push(allocationLink.target)
          }
        }
      })

      // Detect cycle using DFS
      const visited: Record<string, boolean> = {}
      const recStack: Record<string, boolean> = {}
      let cycleDetected = false
      let detectedCycle: string[] = []

      const detectCycle = (node: string, path: string[] = []): boolean => {
        if (!visited[node]) {
          visited[node] = true
          recStack[node] = true
          path.push(node)

          for (const neighbor of adjacencyList[node]) {
            if (!visited[neighbor] && detectCycle(neighbor, [...path])) {
              return true
            } else if (recStack[neighbor]) {
              // Found cycle
              const cycleStart = path.indexOf(neighbor)
              detectedCycle = path.slice(cycleStart)
              detectedCycle.push(neighbor) // Complete the cycle
              return true
            }
          }
        }

        recStack[node] = false
        return false
      }

      // Check each process for cycles
      for (const process of processNodes) {
        if (!visited[process] && detectCycle(process)) {
          cycleDetected = true
          break
        }
      }

      // Expand the cycle to include resources
      if (cycleDetected) {
        const expandedCycle: string[] = []
        for (let i = 0; i < detectedCycle.length - 1; i++) {
          const currentProcess = detectedCycle[i]
          const nextProcess = detectedCycle[i + 1]

          expandedCycle.push(currentProcess)

          // Find the resource that current process is requesting and next process has allocated
          const requestLinks = graphData.links.filter((l) => l.type === "request" && l.source === currentProcess)

          for (const requestLink of requestLinks) {
            const resource = requestLink.target
            const allocationLink = graphData.links.find(
              (l) => l.type === "allocation" && l.source === resource && l.target === nextProcess,
            )

            if (allocationLink) {
              expandedCycle.push(resource)
              break
            }
          }
        }

        // Add the last process to complete the cycle
        expandedCycle.push(detectedCycle[detectedCycle.length - 1])

        // Extract affected processes and resources
        const affectedProcesses = expandedCycle.filter((id) => id.startsWith("P"))
        const affectedResources = expandedCycle.filter((id) => id.startsWith("R"))

        setDeadlockDetected(true)
        setCycle(expandedCycle)

        // Notify parent component if callback provided
        if (onDeadlockDetected) {
          onDeadlockDetected(expandedCycle, affectedProcesses, affectedResources)
        }

        toast({
          title: "Deadlock Detected",
          description: `Circular wait detected in ${expandedCycle.join(" → ")}`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "No Deadlock Detected",
          description: "The system is currently in a safe state",
        })
      }

      setIsAnalyzing(false)
      setIsSimulating(false)
    }, 2000)
  }

  // Reset the simulation
  const resetSimulation = () => {
    setDeadlockDetected(false)
    setCycle([])
    setIsAnalyzing(false)
    setIsSimulating(false)
    setSimulationStep(0)

    toast({
      title: "Simulation Reset",
      description: "The system has been reset to its initial state",
    })
  }

  // Export the graph as an image
  const exportGraph = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a temporary link element
    const link = document.createElement("a")
    link.download = "deadlock-graph.png"
    link.href = canvas.toDataURL("image/png")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Graph Exported",
      description: "The graph has been exported as an image",
    })
  }

  // Handle mouse events for node selection and dragging
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if a node was clicked
      const clickedNode = graphData.nodes.find((node) => {
        if (node.x === undefined || node.y === undefined) return false

        const dx = node.x - x
        const dy = node.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)

        return distance < 20 // Node radius
      })

      if (clickedNode) {
        setSelectedNode(clickedNode)
        setDraggedNode(clickedNode)
      } else {
        setSelectedNode(null)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (draggedNode) {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Update node position
        const updatedNodes = graphData.nodes.map((node) => {
          if (node.id === draggedNode.id) {
            return { ...node, x, y }
          }
          return node
        })

        setGraphData({ ...graphData, nodes: updatedNodes })
      }
    }

    const handleMouseUp = () => {
      setDraggedNode(null)
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mouseleave", handleMouseUp)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mouseleave", handleMouseUp)
    }
  }, [graphData, draggedNode])

  return (
    <div className="relative h-full min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            Processes: {graphData.nodes.filter((n) => n.type === "process").length}
          </Badge>
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            Resources: {graphData.nodes.filter((n) => n.type === "resource").length}
          </Badge>
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            Edges: {graphData.links.length}
          </Badge>
        </div>

        <div>
          {isAnalyzing ? (
            <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-500/50">Analyzing...</Badge>
          ) : deadlockDetected ? (
            <Badge className="bg-red-900/30 text-red-400 border-red-500/50">Deadlock Detected</Badge>
          ) : (
            <Badge className="bg-green-900/30 text-green-400 border-green-500/50">No Deadlock</Badge>
          )}
        </div>
      </div>

      {deadlockDetected && (
        <Alert className="mb-4 border-red-500/30 bg-red-900/10 text-red-400">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Deadlock Detected</AlertTitle>
          <AlertDescription className="font-mono text-sm">Cycle: {cycle.join(" → ")}</AlertDescription>
        </Alert>
      )}

      <div className="relative flex-1 border border-green-500/20 rounded-md overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full"></canvas>

        <div className="absolute bottom-4 right-4 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={resetSimulation}
                  disabled={isAnalyzing}
                  className="bg-green-900/20 hover:bg-green-900/40 text-green-500 border border-green-500/50"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset Simulation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsSimulating(!isSimulating)}
                  disabled={isAnalyzing || deadlockDetected}
                  className="bg-green-900/20 hover:bg-green-900/40 text-green-500 border border-green-500/50"
                >
                  {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSimulating ? "Pause Simulation" : "Run Simulation"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={detectDeadlock}
                  disabled={isAnalyzing}
                  className="bg-green-900/20 hover:bg-green-900/40 text-green-500 border border-green-500/50"
                >
                  Detect Deadlock
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Run deadlock detection algorithm</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={exportGraph}
                  className="bg-green-900/20 hover:bg-green-900/40 text-green-500 border border-green-500/50"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Graph as Image</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="absolute bottom-2 left-2 text-xs text-green-500/70 font-mono flex items-center gap-1">
          <Info className="h-3 w-3" />
          {selectedNode
            ? `Selected: ${selectedNode.id} (${selectedNode.type})`
            : "Click to select a node. Drag to move."}
        </div>
      </div>
    </div>
  )
}

