"use client"

import { Progress } from "@/components/ui/progress"

// Sample resource data
const resourceData = [
  { id: "CPU", usage: 68, limit: 100, unit: "%" },
  { id: "Memory", usage: 4.2, limit: 8, unit: "GB" },
  { id: "Disk I/O", usage: 35, limit: 100, unit: "%" },
  { id: "Network", usage: 42, limit: 100, unit: "Mbps" },
  { id: "Threads", usage: 24, limit: 32, unit: "" },
  { id: "Locks", usage: 12, limit: 20, unit: "" },
]

export default function ResourceMonitor() {
  return (
    <div className="space-y-4">
      {resourceData.map((resource) => (
        <div key={resource.id} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-400">{resource.id}</span>
            <span className="text-xs text-gray-400">
              {resource.usage} / {resource.limit} {resource.unit}
            </span>
          </div>
          <Progress
            value={isNaN((resource.usage / resource.limit) * 100) ? 0 : (resource.usage / resource.limit) * 100}
            className="h-2 bg-gray-800"
            indicatorClassName={
              resource.usage / resource.limit > 0.8
                ? "bg-red-500"
                : resource.usage / resource.limit > 0.6
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }
          />
        </div>
      ))}

      <div className="mt-6 pt-4 border-t border-green-500/20">
        <h4 className="text-sm font-medium text-white mb-3">Resource Allocation</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "R1", allocated: true, process: "P3" },
            { name: "R2", allocated: true, process: "P1" },
            { name: "R3", allocated: true, process: "P2" },
            { name: "R4", allocated: false, process: null },
            { name: "R5", allocated: true, process: "P7" },
            { name: "R6", allocated: false, process: null },
          ].map((resource) => (
            <div
              key={resource.name}
              className={`text-xs p-2 rounded border ${
                resource.allocated ? "border-yellow-500/30 bg-yellow-900/10" : "border-green-500/30 bg-green-900/10"
              }`}
            >
              <div className="font-bold">{resource.name}</div>
              <div className={resource.allocated ? "text-yellow-400" : "text-green-400"}>
                {resource.allocated ? `Allocated to ${resource.process}` : "Available"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

