"use client"

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data for the graph
const initialGraphData = {
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

export default function DeadlockDetector() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [deadlockDetected, setDeadlockDetected] = useState(false)
  const [cycle, setCycle] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw the graph
    drawGraph(ctx, canvas.width, canvas.height)

    // Simulate deadlock detection
    simulateDeadlockDetection()

    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drawGraph(ctx, canvas.width, canvas.height)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

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

    // Calculate node positions
    const nodes = initialGraphData.nodes.map((node, i) => {
      const angle = (i / initialGraphData.nodes.length) * Math.PI * 2
      const radius = Math.min(width, height) * 0.35
      const x = width / 2 + radius * Math.cos(angle)
      const y = height / 2 + radius * Math.sin(angle)
      return { ...node, x, y }
    })

    // Draw links
    initialGraphData.links.forEach((link) => {
      const source = nodes.find((n) => n.id === link.source)
      const target = nodes.find((n) => n.id === link.target)

      if (!source || !target) return

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
    nodes.forEach((node) => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, 20, 0, Math.PI * 2)

      // Style based on node type and deadlock status
      const isInDeadlock = deadlockDetected && cycle.includes(node.id)

      if (isInDeadlock) {
        ctx.fillStyle = node.type === "process" ? "rgba(255, 0, 128, 0.8)" : "rgba(255, 0, 128, 0.8)"
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
        ctx.lineWidth = 3

        // Add glow effect
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

  const simulateDeadlockDetection = () => {
    setIsAnalyzing(true)

    // Simulate analysis time
    setTimeout(() => {
      setIsAnalyzing(false)
      setDeadlockDetected(true)
      setCycle(["P1", "R1", "P3", "R3", "P2", "R2"])

      // Update the graph with deadlock information
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      drawGraph(ctx, canvas.width || 0, canvas.height || 0)
    }, 3000)
  }

  return (
    <div className="relative h-full min-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            Nodes: {initialGraphData.nodes.length}
          </Badge>
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            Edges: {initialGraphData.links.length}
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

        <div className="absolute bottom-2 right-2 text-xs text-green-500/70 font-mono">AI-powered analysis active</div>
      </div>
    </div>
  )
}

