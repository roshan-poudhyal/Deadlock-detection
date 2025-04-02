"use client"

import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

type LogEntry = {
  timestamp: string
  message: string
  type: "info" | "warning" | "error" | "success"
}

const initialLogs: LogEntry[] = [
  {
    timestamp: "08:42:13",
    message: "System initialized",
    type: "info",
  },
  {
    timestamp: "08:42:14",
    message: "Loading resource allocation matrix...",
    type: "info",
  },
  {
    timestamp: "08:42:15",
    message: "Scanning process states...",
    type: "info",
  },
]

export default function TerminalOutput() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate log entries being added
    const timers = [
      setTimeout(() => {
        addLogEntry("Analyzing resource allocation graph...", "info")
      }, 1000),
      setTimeout(() => {
        addLogEntry("Detecting potential deadlocks...", "info")
      }, 2000),
      setTimeout(() => {
        addLogEntry("WARNING: Circular wait condition detected", "warning")
      }, 3000),
      setTimeout(() => {
        addLogEntry("DEADLOCK DETECTED in processes P1, P2, P3", "error")
      }, 4000),
      setTimeout(() => {
        addLogEntry("Generating deadlock resolution strategies...", "info")
      }, 5000),
      setTimeout(() => {
        addLogEntry("Recommended action: Terminate process P2", "success")
      }, 6000),
    ]

    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [logs])

  const addLogEntry = (message: string, type: LogEntry["type"]) => {
    const now = new Date()
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`

    setLogs((prev) => [...prev, { timestamp, message, type }])
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 h-[300px] font-mono text-sm border border-green-500/20 rounded-md bg-black p-2">
        <div className="space-y-1" ref={scrollAreaRef}>
          {logs.map((log, index) => (
            <div key={index} className="flex">
              <span className="text-gray-500 mr-2">[{log.timestamp}]</span>
              <span
                className={
                  log.type === "error"
                    ? "text-red-400"
                    : log.type === "warning"
                      ? "text-yellow-400"
                      : log.type === "success"
                        ? "text-green-400"
                        : "text-green-500"
                }
              >
                {log.message}
              </span>
            </div>
          ))}
          <div className="h-4 w-full animate-pulse">
            <span className="inline-block w-2 h-4 bg-green-500 animate-blink"></span>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

