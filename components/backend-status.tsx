"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Server, ServerCrash, ServerOff } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type BackendStatus = "checking" | "online" | "offline" | "error"

export default function BackendStatus() {
  const [status, setStatus] = useState<BackendStatus>("checking")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)

  const checkBackendStatus = async () => {
    setStatus("checking")
    const startTime = performance.now()

    try {
      // In a real application, this would be your actual backend API endpoint
      // For demo purposes, we'll simulate a response with a timeout
      const response = (await Promise.race([
        fetch("/api/status").then((res) => res.json()),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3000)),
      ])) as any

      const endTime = performance.now()
      setResponseTime(Math.round(endTime - startTime))

      if (response && response.status === "ok") {
        setStatus("online")
      } else {
        setStatus("error")
      }
    } catch (error) {
      console.error("Backend check failed:", error)
      setStatus("offline")
      setResponseTime(null)
    }

    setLastChecked(new Date())
  }

  useEffect(() => {
    // Check backend status on component mount
    checkBackendStatus()

    // Set up interval to check status periodically
    const interval = setInterval(checkBackendStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const getStatusDisplay = () => {
    switch (status) {
      case "checking":
        return (
          <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-500/50">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Checking...
          </Badge>
        )
      case "online":
        return (
          <Badge className="bg-green-900/30 text-green-400 border-green-500/50">
            <Server className="h-3 w-3 mr-1" />
            Online {responseTime && `(${responseTime}ms)`}
          </Badge>
        )
      case "offline":
        return (
          <Badge className="bg-red-900/30 text-red-400 border-red-500/50">
            <ServerOff className="h-3 w-3 mr-1" />
            Offline
          </Badge>
        )
      case "error":
        return (
          <Badge className="bg-orange-900/30 text-orange-400 border-orange-500/50">
            <ServerCrash className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {getStatusDisplay()}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-green-500 hover:bg-green-900/20 hover:text-green-400"
              onClick={() => checkBackendStatus()}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-xs">
            <p>
              Backend API Status: <span className="font-bold">{status.toUpperCase()}</span>
            </p>
            {lastChecked && <p className="text-gray-400">Last checked: {lastChecked.toLocaleTimeString()}</p>}
            {responseTime && <p className="text-gray-400">Response time: {responseTime}ms</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

