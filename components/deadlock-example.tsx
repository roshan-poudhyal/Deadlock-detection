"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

export default function DeadlockExample() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [step, setStep] = useState(0)
  const [isDeadlocked, setIsDeadlocked] = useState(false)
  const animationRef = useRef<number | null>(null)

  // Define animation steps
  const steps = [
    // Step 0: Initial state
    {
      allocations: [
        { from: "R4", to: "P1" },
        { from: "R1", to: "P2" },
        { from: "R2", to: "P3" },
        { from: "R3", to: "P4" },
      ],
      requests: [],
    },
    // Step 1: P1 requests R1
    {
      allocations: [
        { from: "R4", to: "P1" },
        { from: "R1", to: "P2" },
        { from: "R2", to: "P3" },
        { from: "R3", to: "P4" },
      ],
      requests: [{ from: "P1", to: "R1" }],
    },
    // Step 2: P2 requests R2
    {
      allocations: [
        { from: "R4", to: "P1" },
        { from: "R1", to: "P2" },
        { from: "R2", to: "P3" },
        { from: "R3", to: "P4" },
      ],
      requests: [
        { from: "P1", to: "R1" },
        { from: "P2", to: "R2" },
      ],
    },
    // Step 3: P3 requests R3
    {
      allocations: [
        { from: "R4", to: "P1" },
        { from: "R1", to: "P2" },
        { from: "R2", to: "P3" },
        { from: "R3", to: "P4" },
      ],
      requests: [
        { from: "P1", to: "R1" },
        { from: "P2", to: "R2" },
        { from: "P3", to: "R3" },
      ],
    },
    // Step 4: P4 requests R4 - Deadlock!
    {
      allocations: [
        { from: "R4", to: "P1" },
        { from: "R1", to: "P2" },
        { from: "R2", to: "P3" },
        { from: "R3", to: "P4" },
      ],
      requests: [
        { from: "P1", to: "R1" },
        { from: "P2", to: "R2" },
        { from: "P3", to: "R3" },
        { from: "P4", to: "R4" },
      ],
    },
  ]

  // Reset animation
  const resetAnimation = () => {
    setIsPlaying(false)
    setStep(0)
    setIsDeadlocked(false)
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying((prev) => {
      if (!prev && step === steps.length - 1) {
        // If we're at the end, reset to beginning when pressing play
        setStep(0)
        setIsDeadlocked(false)
      }
      return !prev
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Define processes and resources
    const processes = [
      { id: "P1", x: canvas.width * 0.25, y: canvas.height * 0.25, color: "rgba(0, 255, 128, 0.8)" },
      { id: "P2", x: canvas.width * 0.75, y: canvas.height * 0.25, color: "rgba(0, 255, 255, 0.8)" },
      { id: "P3", x: canvas.width * 0.75, y: canvas.height * 0.75, color: "rgba(255, 255, 0, 0.8)" },
      { id: "P4", x: canvas.width * 0.25, y: canvas.height * 0.75, color: "rgba(255, 0, 128, 0.8)" },
    ]

    const resources = [
      { id: "R1", x: canvas.width * 0.5, y: canvas.height * 0.15, color: "rgba(255, 255, 255, 0.8)" },
      { id: "R2", x: canvas.width * 0.85, y: canvas.height * 0.5, color: "rgba(255, 255, 255, 0.8)" },
      { id: "R3", x: canvas.width * 0.5, y: canvas.height * 0.85, color: "rgba(255, 255, 255, 0.8)" },
      { id: "R4", x: canvas.width * 0.15, y: canvas.height * 0.5, color: "rgba(255, 255, 255, 0.8)" },
    ]

    // Draw the current step
    const drawStep = (stepIndex: number) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid background
      ctx.strokeStyle = "rgba(0, 255, 128, 0.1)"
      ctx.lineWidth = 1

      const gridSize = 20
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

      const currentStep = steps[stepIndex]
      const isDeadlocked = stepIndex === steps.length - 1

      // Draw allocations
      currentStep.allocations.forEach((allocation) => {
        const source = resources.find((r) => r.id === allocation.from)
        const target = processes.find((p) => p.id === allocation.to)

        if (source && target) {
          drawArrow(ctx, source.x, source.y, target.x, target.y, "rgba(255, 255, 0, 0.6)", isDeadlocked)
        }
      })

      // Draw requests
      currentStep.requests.forEach((request) => {
        const source = processes.find((p) => p.id === request.from)
        const target = resources.find((r) => r.id === request.to)

        if (source && target) {
          drawArrow(ctx, source.x, source.y, target.x, target.y, "rgba(0, 255, 255, 0.6)", isDeadlocked)
        }
      })

      // Draw processes
      processes.forEach((process) => {
        drawNode(ctx, process.x, process.y, 20, process.color, process.id, isDeadlocked)
      })

      // Draw resources
      resources.forEach((resource) => {
        drawNode(ctx, resource.x, resource.y, 15, resource.color, resource.id, isDeadlocked, true)
      })

      // Draw step indicator
      ctx.font = "14px monospace"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "left"
      ctx.fillText(`Step ${stepIndex + 1}/${steps.length}`, 10, 20)

      // Draw deadlock indicator
      if (isDeadlocked) {
        ctx.font = "bold 16px monospace"
        ctx.fillStyle = "rgba(255, 0, 128, 0.8)"
        ctx.textAlign = "center"
        ctx.fillText("DEADLOCK DETECTED!", canvas.width / 2, 20)
      }
    }

    // Draw an arrow between two points
    const drawArrow = (
      ctx: CanvasRenderingContext2D,
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      color: string,
      isDeadlocked: boolean,
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
      if (isDeadlocked) {
        ctx.strokeStyle = "rgba(255, 0, 128, 0.8)"
        ctx.lineWidth = 3

        // Add glow effect
        ctx.shadowColor = "rgba(255, 0, 128, 0.8)"
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
      isDeadlocked: boolean,
      isSquare = false,
    ) => {
      ctx.beginPath()

      if (isSquare) {
        ctx.rect(x - radius, y - radius, radius * 2, radius * 2)
      } else {
        ctx.arc(x, y, radius, 0, Math.PI * 2)
      }

      // Style based on deadlock status
      if (isDeadlocked) {
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

    // Initial draw
    drawStep(step)

    // Animation loop
    let lastTimestamp = 0
    const animationDuration = 1500 // 1.5 seconds per step

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp

      if (isPlaying) {
        const elapsed = timestamp - lastTimestamp

        if (elapsed > animationDuration) {
          // Change step every 1.5 seconds
          const nextStep = step + 1

          if (nextStep < steps.length) {
            setStep(nextStep)
            drawStep(nextStep)

            // Check if we've reached the deadlock state
            if (nextStep === steps.length - 1) {
              setIsDeadlocked(true)
              setIsPlaying(false)
            }
          } else {
            setIsPlaying(false)
          }

          lastTimestamp = timestamp
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    // Handle window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drawStep(step)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [step, isPlaying])

  // Update canvas when step changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Redraw with new step
    const drawStep = () => {
      // Implementation would be the same as in the main useEffect
      // This is just to trigger a redraw when step changes
    }

    drawStep()
  }, [step])

  return (
    <div className="space-y-4">
      <div className="border border-green-500/30 rounded-md overflow-hidden bg-black/50 h-[300px]">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm font-mono">
          {isDeadlocked ? (
            <span className="text-red-400">Circular wait detected!</span>
          ) : (
            <span className="text-green-400">
              Step {step + 1}: {step === 0 ? "Initial state" : `P${step} requests R${step}`}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 border-green-500/50" onClick={resetAnimation}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-green-500/50"
            onClick={togglePlay}
            disabled={step === steps.length - 1}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

