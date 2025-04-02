import { NextResponse } from "next/server"

export async function GET() {
  // In a real application, you would check your actual backend services
  // For demo purposes, we'll simulate a successful response

  // Simulate occasional errors or delays
  const random = Math.random()

  if (random < 0.1) {
    // Simulate an error 10% of the time
    return NextResponse.json({ status: "error", message: "Service unavailable" }, { status: 500 })
  } else if (random < 0.2) {
    // Simulate a delay 10% of the time
    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  return NextResponse.json({
    status: "ok",
    version: "1.0.0",
    services: {
      database: "online",
      analytics: "online",
      detection: "online",
    },
    uptime: "3d 12h 45m",
    lastDeadlockDetected: new Date(Date.now() - 3600000).toISOString(),
  })
}

