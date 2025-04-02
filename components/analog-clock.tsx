"use client"

import { useEffect, useRef } from "react"

export default function AnalogClock() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const size = Math.min(canvas.offsetWidth, canvas.offsetHeight)
    canvas.width = size
    canvas.height = size

    // Clock drawing function
    const drawClock = () => {
      const now = new Date()
      const hours = now.getHours() % 12
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      const milliseconds = now.getMilliseconds()

      // Clear canvas
      ctx.clearRect(0, 0, size, size)

      // Draw clock face
      const centerX = size / 2
      const centerY = size / 2
      const radius = size * 0.4

      // Draw outer circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(0, 255, 128, 0.8)"
      ctx.lineWidth = 3
      ctx.stroke()

      // Add glow effect
      ctx.shadowColor = "rgba(0, 255, 128, 0.8)"
      ctx.shadowBlur = 15

      // Draw hour markers
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        const markerLength = i % 3 === 0 ? 15 : 10

        const innerX = centerX + (radius - markerLength) * Math.cos(angle)
        const innerY = centerY + (radius - markerLength) * Math.sin(angle)
        const outerX = centerX + radius * Math.cos(angle)
        const outerY = centerY + radius * Math.sin(angle)

        ctx.beginPath()
        ctx.moveTo(innerX, innerY)
        ctx.lineTo(outerX, outerY)
        ctx.strokeStyle = i % 3 === 0 ? "rgba(0, 255, 255, 0.8)" : "rgba(0, 255, 128, 0.6)"
        ctx.lineWidth = i % 3 === 0 ? 3 : 2
        ctx.stroke()
      }

      // Draw digital time
      ctx.font = "16px monospace"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.shadowBlur = 0
      ctx.fillText(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        centerX,
        centerY - radius / 2,
      )

      // Draw deadlock status
      ctx.font = "14px monospace"
      ctx.fillStyle = "#00ffff"
      ctx.fillText("SYSTEM STATUS", centerX, centerY + radius / 2 - 20)

      // Simulate deadlock status (changes every 5 seconds)
      const isDeadlocked = Math.floor(seconds / 5) % 2 === 0
      ctx.fillStyle = isDeadlocked ? "#ff0080" : "#00ff80"
      ctx.fillText(isDeadlocked ? "DEADLOCKED" : "OPERATIONAL", centerX, centerY + radius / 2)

      // Draw hour hand
      const hourAngle = ((hours + minutes / 60) / 12) * Math.PI * 2
      drawHand(ctx, centerX, centerY, hourAngle, radius * 0.5, 6, "rgba(255, 255, 255, 0.8)")

      // Draw minute hand
      const minuteAngle = ((minutes + seconds / 60) / 60) * Math.PI * 2
      drawHand(ctx, centerX, centerY, minuteAngle, radius * 0.7, 4, "rgba(0, 255, 255, 0.8)")

      // Draw second hand
      const secondAngle = ((seconds + milliseconds / 1000) / 60) * Math.PI * 2
      drawHand(ctx, centerX, centerY, secondAngle, radius * 0.8, 2, "rgba(255, 0, 128, 0.8)")

      // Draw center circle
      ctx.beginPath()
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(0, 255, 128, 0.8)"
      ctx.fill()

      // Draw outer ring with circuit pattern
      drawCircuitRing(ctx, centerX, centerY, radius + 20)
    }

    const drawHand = (
      ctx: CanvasRenderingContext2D,
      centerX: number,
      centerY: number,
      angle: number,
      length: number,
      width: number,
      color: string,
    ) => {
      ctx.beginPath()
      ctx.lineWidth = width
      ctx.lineCap = "round"
      ctx.strokeStyle = color

      // Add glow effect
      ctx.shadowColor = color
      ctx.shadowBlur = 10

      const targetX = centerX + Math.sin(angle) * length
      const targetY = centerY - Math.cos(angle) * length

      ctx.moveTo(centerX, centerY)
      ctx.lineTo(targetX, targetY)
      ctx.stroke()

      // Reset shadow
      ctx.shadowBlur = 0
    }

    const drawCircuitRing = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
      // Draw circuit segments
      const segments = 24
      const now = new Date()
      const seconds = now.getSeconds()
      const milliseconds = now.getMilliseconds()

      for (let i = 0; i < segments; i++) {
        const startAngle = (i / segments) * Math.PI * 2
        const endAngle = ((i + 0.8) / segments) * Math.PI * 2

        // Animate segments
        const isActive = (i + Math.floor(seconds / 2)) % 8 === 0
        const pulseIntensity = isActive ? 0.5 + 0.5 * Math.sin(milliseconds / 200) : 0.3

        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.strokeStyle = isActive
          ? `rgba(0, 255, 255, ${pulseIntensity})`
          : `rgba(0, 255, 128, ${0.2 + 0.1 * Math.sin((i + seconds) / 2)})`
        ctx.lineWidth = isActive ? 3 : 2
        ctx.stroke()

        // Draw connection nodes at certain points
        if (i % 4 === 0) {
          ctx.beginPath()
          ctx.arc(centerX + radius * Math.cos(startAngle), centerY + radius * Math.sin(startAngle), 4, 0, Math.PI * 2)
          ctx.fillStyle = isActive ? "rgba(0, 255, 255, 0.8)" : "rgba(0, 255, 128, 0.6)"
          ctx.fill()
        }
      }
    }

    // Animation loop
    const animate = () => {
      drawClock()
      requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      const size = Math.min(canvas.offsetWidth, canvas.offsetHeight)
      canvas.width = size
      canvas.height = size
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

