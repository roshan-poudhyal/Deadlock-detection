"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Filter } from "lucide-react"

// Sample deadlock history data
const deadlockHistoryData = [
  {
    id: "DL-2023-06-15-001",
    timestamp: "2023-06-15 14:32:45",
    processes: ["P1", "P2", "P3"],
    resources: ["R1", "R2", "R3"],
    duration: "45s",
    resolution: "Automatic (Process Termination)",
    status: "resolved",
  },
  {
    id: "DL-2023-06-14-003",
    timestamp: "2023-06-14 09:17:22",
    processes: ["P5", "P8", "P12"],
    resources: ["R4", "R7", "R9"],
    duration: "128s",
    resolution: "Manual (Resource Preemption)",
    status: "resolved",
  },
  {
    id: "DL-2023-06-13-002",
    timestamp: "2023-06-13 18:05:11",
    processes: ["P4", "P7"],
    resources: ["R2", "R5"],
    duration: "67s",
    resolution: "Automatic (Wait Timeout)",
    status: "resolved",
  },
  {
    id: "DL-2023-06-12-005",
    timestamp: "2023-06-12 11:42:38",
    processes: ["P2", "P6", "P9", "P11"],
    resources: ["R1", "R3", "R6", "R8"],
    duration: "203s",
    resolution: "Manual (System Restart)",
    status: "resolved",
  },
  {
    id: "DL-2023-06-10-001",
    timestamp: "2023-06-10 15:23:59",
    processes: ["P3", "P5"],
    resources: ["R2", "R4"],
    duration: "31s",
    resolution: "Automatic (Process Termination)",
    status: "resolved",
  },
]

export default function DeadlockHistory() {
  const [filter, setFilter] = useState("all")

  const filteredData = deadlockHistoryData.filter((item) => {
    if (filter === "all") return true
    if (filter === "automatic") return item.resolution.includes("Automatic")
    if (filter === "manual") return item.resolution.includes("Manual")
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={`h-8 ${filter === "all" ? "bg-green-900/20 border-green-500/50" : "border-gray-700"}`}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`h-8 ${filter === "automatic" ? "bg-green-900/20 border-green-500/50" : "border-gray-700"}`}
            onClick={() => setFilter("automatic")}
          >
            Automatic
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`h-8 ${filter === "manual" ? "bg-green-900/20 border-green-500/50" : "border-gray-700"}`}
            onClick={() => setFilter("manual")}
          >
            Manual
          </Button>
        </div>

        <Button variant="outline" size="sm" className="h-8 border-gray-700">
          <Filter className="h-4 w-4 mr-1" /> Filter
        </Button>
      </div>

      <div className="border border-green-500/20 rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-green-500/20 hover:bg-green-900/10">
              <TableHead className="text-green-400">ID</TableHead>
              <TableHead className="text-green-400">Timestamp</TableHead>
              <TableHead className="text-green-400">Processes</TableHead>
              <TableHead className="text-green-400">Duration</TableHead>
              <TableHead className="text-green-400">Resolution</TableHead>
              <TableHead className="text-green-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id} className="border-green-500/20 hover:bg-green-900/10">
                <TableCell className="font-mono">{item.id}</TableCell>
                <TableCell>{item.timestamp}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.processes.map((process) => (
                      <Badge key={process} variant="outline" className="border-cyan-500/50 text-cyan-400">
                        {process}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{item.duration}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      item.resolution.includes("Automatic")
                        ? "bg-green-900/20 text-green-400 border-green-500/50"
                        : "bg-yellow-900/20 text-yellow-400 border-yellow-500/50"
                    }
                  >
                    {item.resolution}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

