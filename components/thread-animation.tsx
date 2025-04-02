"use client"

import { useEffect, useRef } from "react"

type ThreadAnimationProps = {
  density?: number
}

export default function ThreadAnimation({ density = 1 }: ThreadAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Thread properties
    const threadCount = Math.floor(20 * density)
    const threads: Thread[] = []

    // Create threads
    for (let i = 0; i < threadCount; i++) {
      threads.push(createThread(canvas.width, canvas.height))
    }

    // Animation loop
    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw threads
      threads.forEach((thread) => {
        // Update position
        thread.x += thread.vx
        thread.y += thread.vy

        // Bounce off edges
        if (thread.x < 0 || thread.x > canvas.width) {
          thread.vx *= -1
        }
        if (thread.y < 0 || thread.y > canvas.height) {
          thread.vy *= -1
        }

        // Draw thread
        drawThread(ctx, thread)
      })

      // Draw connections between nearby threads
      drawConnections(ctx, threads)

      requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [density])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}

// Thread type
type Thread = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  pulse: number
  pulseSpeed: number
  trail: { x: number; y: number }[]
}

// Create a new thread
const createThread = (width: number, height: number): Thread => {
  const colors = [
    "rgba(0, 255, 128, 0.8)",
    "rgba(0, 255, 255, 0.8)",
    "rgba(255, 0, 128, 0.8)",
    "rgba(255, 255, 0, 0.8)",
  ]

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    size: Math.random() * 3 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    pulse: 0,
    pulseSpeed: Math.random() * 0.1 + 0.05,
    trail: [],
  }
}

// Draw a thread
const drawThread = (ctx: CanvasRenderingContext2D, thread: Thread) => {
  // Update pulse
  thread.pulse += thread.pulseSpeed
  if (thread.pulse > Math.PI * 2) {
    thread.pulse = 0
  }

  // Add current position to trail
  thread.trail.push({ x: thread.x, y: thread.y })

  // Limit trail length
  if (thread.trail.length > 20) {
    thread.trail.shift()
  }

  // Draw trail
  if (thread.trail.length > 1) {
    ctx.beginPath()
    ctx.moveTo(thread.trail[0].x, thread.trail[0].y)

    for (let i = 1; i < thread.trail.length; i++) {
      ctx.lineTo(thread.trail[i].x, thread.trail[i].y)
    }

    ctx.strokeStyle = thread.color.replace("0.8", `${0.1 + 0.1 * Math.sin(thread.pulse)}`)
    ctx.lineWidth = thread.size * (0.3 + 0.2 * Math.sin(thread.pulse))
    ctx.stroke()
  }

  // Draw thread node
  ctx.beginPath()
  ctx.arc(thread.x, thread.y, thread.size * (0.8 + 0.2 * Math.sin(thread.pulse)), 0, Math.PI * 2)
  ctx.fillStyle = thread.color
  ctx.fill()

  // Add glow effect
  ctx.shadowColor = thread.color
  ctx.shadowBlur = 10 * (0.5 + 0.5 * Math.sin(thread.pulse))
  ctx.beginPath()
  ctx.arc(thread.x, thread.y, thread.size * 0.5, 0, Math.PI * 2)
  ctx.fill()

  // Reset shadow
  ctx.shadowBlur = 0
}

// Draw connections between nearby threads
const drawConnections = (ctx: CanvasRenderingContext2D, threads: Thread[]) => {
  const maxDistance = 150

  for (let i = 0; i < threads.length; i++) {
    for (let j = i + 1; j < threads.length; j++) {
      const dx = threads[i].x - threads[j].x
      const dy = threads[i].y - threads[j].y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < maxDistance) {
        const opacity = 1 - distance / maxDistance

        ctx.beginPath()
        ctx.moveTo(threads[i].x, threads[i].y)
        ctx.lineTo(threads[j].x, threads[j].y)
        ctx.strokeStyle = `rgba(0, 255, 128, ${opacity * 0.2})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }
}

