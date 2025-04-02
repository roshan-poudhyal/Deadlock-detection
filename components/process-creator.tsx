"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Process = {
  id: string
  name: string
  priority: number
  resources: string[]
}

type ProcessCreatorProps = {
  onProcessesChange?: (processes: Process[]) => void
  availableResources?: string[]
  systemResources?: { id: string; instances: number; allocatedTo: string[] }[]
}

export default function ProcessCreator({
  onProcessesChange,
  availableResources = ["R1", "R2", "R3", "R4"],
  systemResources = [],
}: ProcessCreatorProps) {
  const { toast } = useToast()
  const [processes, setProcesses] = useState<Process[]>([
    { id: "P1", name: "Process 1", priority: 1, resources: ["R2"] },
    { id: "P2", name: "Process 2", priority: 2, resources: ["R3"] },
    { id: "P3", name: "Process 3", priority: 1, resources: ["R1"] },
  ])

  const [newProcess, setNewProcess] = useState<Process>({
    id: `P${processes.length + 1}`,
    name: `Process ${processes.length + 1}`,
    priority: 1,
    resources: [],
  })

  const [selectedResource, setSelectedResource] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  // Notify parent component when processes change
  useEffect(() => {
    if (onProcessesChange) {
      onProcessesChange(processes)
    }
  }, [processes, onProcessesChange])

  // Update new process ID when processes change
  useEffect(() => {
    // Find the highest process number
    const highestNum = processes.reduce((max, process) => {
      const num = Number.parseInt(process.id.replace("P", ""))
      return isNaN(num) ? max : Math.max(max, num)
    }, 0)

    setNewProcess((prev) => ({
      ...prev,
      id: `P${highestNum + 1}`,
      name: `Process ${highestNum + 1}`,
    }))
  }, [processes])

  const addProcess = () => {
    // Validate process ID
    if (!newProcess.id.match(/^P\d+$/)) {
      setError("Process ID must be in format 'P' followed by a number (e.g., P1, P2)")
      return
    }

    // Check if process ID already exists
    if (processes.some((p) => p.id === newProcess.id)) {
      setError(`Process ID ${newProcess.id} already exists`)
      return
    }

    setProcesses([...processes, { ...newProcess, resources: [...newProcess.resources] }])

    // Reset selected resource
    setSelectedResource("")
    setError(null)

    toast({
      title: "Process Added",
      description: `${newProcess.id} has been added to the system`,
    })
  }

  const removeProcess = (id: string) => {
    setProcesses(processes.filter((p) => p.id !== id))
    toast({
      title: "Process Removed",
      description: `${id} has been removed from the system`,
      variant: "destructive",
    })
  }

  const addResourceToProcess = () => {
    if (!selectedResource) return

    // Check if resource is already allocated to this process
    if (newProcess.resources.includes(selectedResource)) {
      setError(`Resource ${selectedResource} is already allocated to this process`)
      return
    }

    // Check if resource is available (not fully allocated)
    const resourceInfo = systemResources.find((r) => r.id === selectedResource)
    if (resourceInfo && resourceInfo.instances <= resourceInfo.allocatedTo.length) {
      setError(`Resource ${selectedResource} has no available instances`)
      return
    }

    setNewProcess({
      ...newProcess,
      resources: [...newProcess.resources, selectedResource],
    })
    setSelectedResource("")
    setError(null)
  }

  const removeResourceFromProcess = (resource: string) => {
    setNewProcess({
      ...newProcess,
      resources: newProcess.resources.filter((r) => r !== resource),
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="process-id" className="text-xs text-green-400">
              Process ID
            </Label>
            <Input
              id="process-id"
              value={newProcess.id}
              onChange={(e) => setNewProcess({ ...newProcess, id: e.target.value })}
              className="bg-black border-green-500/30 text-green-400 h-8"
            />
          </div>
          <div>
            <Label htmlFor="process-name" className="text-xs text-green-400">
              Name
            </Label>
            <Input
              id="process-name"
              value={newProcess.name}
              onChange={(e) => setNewProcess({ ...newProcess, name: e.target.value })}
              className="bg-black border-green-500/30 text-green-400 h-8"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="process-priority" className="text-xs text-green-400">
            Priority
          </Label>
          <Input
            id="process-priority"
            type="number"
            min="1"
            max="10"
            value={newProcess.priority}
            onChange={(e) => setNewProcess({ ...newProcess, priority: Number.parseInt(e.target.value) || 1 })}
            className="bg-black border-green-500/30 text-green-400 h-8"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-green-400">Resources</Label>
          <div className="flex gap-2">
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="flex-1 h-8 rounded-md bg-black border border-green-500/30 text-green-400 text-sm px-2"
            >
              <option value="">Select a resource</option>
              {availableResources.map((resource) => (
                <option key={resource} value={resource}>
                  {resource}
                </option>
              ))}
            </select>
            <Button
              onClick={addResourceToProcess}
              disabled={!selectedResource}
              className="h-8 bg-green-900/20 hover:bg-green-900/40 text-green-500 border border-green-500/50"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {newProcess.resources.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {newProcess.resources.map((resource) => (
                <div
                  key={resource}
                  className="bg-green-900/20 text-green-400 text-xs px-2 py-1 rounded-md flex items-center"
                >
                  {resource}
                  <button
                    onClick={() => removeResourceFromProcess(resource)}
                    className="ml-1 text-red-400 hover:text-red-300"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="py-2 mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={addProcess}
          className="w-full bg-green-900/20 hover:bg-green-900/40 text-green-500 border border-green-500/50 h-8"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Process
        </Button>
      </div>

      <div className="border border-green-500/20 rounded-md p-2 max-h-[200px] overflow-y-auto">
        <h3 className="text-sm font-mono mb-2 text-green-400">Active Processes</h3>

        {processes.length === 0 ? (
          <div className="text-xs text-gray-500 italic">No processes created</div>
        ) : (
          <div className="space-y-2">
            {processes.map((process) => (
              <div
                key={process.id}
                className="flex items-center justify-between bg-green-900/10 p-2 rounded-md border border-green-500/20"
              >
                <div>
                  <div className="text-sm font-bold text-green-400">{process.id}</div>
                  <div className="text-xs text-gray-400">{process.name}</div>
                  <div className="text-xs text-gray-500">Priority: {process.priority}</div>
                  {process.resources.length > 0 && (
                    <div className="text-xs text-gray-500 flex gap-1 mt-1">
                      Resources:
                      <div className="flex flex-wrap gap-1">
                        {process.resources.map((r) => (
                          <span key={r} className="bg-green-900/20 text-green-400 px-1 rounded">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={() => removeProcess(process.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

