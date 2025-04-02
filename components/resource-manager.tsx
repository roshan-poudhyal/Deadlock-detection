"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Resource = {
  id: string
  name: string
  type: "sharable" | "exclusive"
  instances: number
  allocatedTo: string[]
}

type ResourceManagerProps = {
  onResourcesChange?: (resources: Resource[]) => void
  processes?: string[]
}

export default function ResourceManager({
  onResourcesChange,
  processes = ["P1", "P2", "P3", "P4"],
}: ResourceManagerProps) {
  const { toast } = useToast()
  const [resources, setResources] = useState<Resource[]>([
    { id: "R1", name: "Resource 1", type: "exclusive", instances: 1, allocatedTo: ["P3"] },
    { id: "R2", name: "Resource 2", type: "exclusive", instances: 1, allocatedTo: ["P1"] },
    { id: "R3", name: "Resource 3", type: "exclusive", instances: 1, allocatedTo: ["P2"] },
  ])

  const [newResource, setNewResource] = useState<Resource>({
    id: `R${resources.length + 1}`,
    name: `Resource ${resources.length + 1}`,
    type: "exclusive",
    instances: 1,
    allocatedTo: [],
  })

  const [selectedProcess, setSelectedProcess] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  // Notify parent component when resources change
  useEffect(() => {
    if (onResourcesChange) {
      onResourcesChange(resources)
    }
  }, [resources, onResourcesChange])

  // Update new resource ID when resources change
  useEffect(() => {
    // Find the highest resource number
    const highestNum = resources.reduce((max, resource) => {
      const num = Number.parseInt(resource.id.replace("R", ""))
      return isNaN(num) ? max : Math.max(max, num)
    }, 0)

    setNewResource((prev) => ({
      ...prev,
      id: `R${highestNum + 1}`,
      name: `Resource ${highestNum + 1}`,
    }))
  }, [resources])

  const addResource = () => {
    // Validate resource ID
    if (!newResource.id.match(/^R\d+$/)) {
      setError("Resource ID must be in format 'R' followed by a number (e.g., R1, R2)")
      return
    }

    // Check if resource ID already exists
    if (resources.some((r) => r.id === newResource.id)) {
      setError(`Resource ID ${newResource.id} already exists`)
      return
    }

    // Validate instances
    if (newResource.instances < 1) {
      setError("Resource must have at least 1 instance")
      return
    }

    // Validate allocation
    if (newResource.type === "exclusive" && newResource.allocatedTo.length > newResource.instances) {
      setError(`Exclusive resource can only be allocated to ${newResource.instances} process(es)`)
      return
    }

    setResources([...resources, { ...newResource, allocatedTo: [...newResource.allocatedTo] }])

    // Reset selected process
    setSelectedProcess("")
    setError(null)

    toast({
      title: "Resource Added",
      description: `${newResource.id} has been added to the system`,
    })
  }

  const removeResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id))
    toast({
      title: "Resource Removed",
      description: `${id} has been removed from the system`,
      variant: "destructive",
    })
  }

  const addProcessToResource = () => {
    if (!selectedProcess) return

    // Check if process is already allocated to this resource
    if (newResource.allocatedTo.includes(selectedProcess)) {
      setError(`Process ${selectedProcess} is already allocated to this resource`)
      return
    }

    // Check if allocation limit is reached for exclusive resources
    if (newResource.type === "exclusive" && newResource.allocatedTo.length >= newResource.instances) {
      setError(`Cannot allocate more than ${newResource.instances} process(es) to this exclusive resource`)
      return
    }

    setNewResource({
      ...newResource,
      allocatedTo: [...newResource.allocatedTo, selectedProcess],
    })
    setSelectedProcess("")
    setError(null)
  }

  const removeProcessFromResource = (process: string) => {
    setNewResource({
      ...newResource,
      allocatedTo: newResource.allocatedTo.filter((p) => p !== process),
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="resource-id" className="text-xs text-green-400">
              Resource ID
            </Label>
            <Input
              id="resource-id"
              value={newResource.id}
              onChange={(e) => setNewResource({ ...newResource, id: e.target.value })}
              className="bg-black border-green-500/30 text-green-400 h-8"
            />
          </div>
          <div>
            <Label htmlFor="resource-name" className="text-xs text-green-400">
              Name
            </Label>
            <Input
              id="resource-name"
              value={newResource.name}
              onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
              className="bg-black border-green-500/30 text-green-400 h-8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="resource-type" className="text-xs text-green-400">
              Type
            </Label>
            <Select
              value={newResource.type}
              onValueChange={(value: "sharable" | "exclusive") => setNewResource({ ...newResource, type: value })}
            >
              <SelectTrigger className="bg-black border-green-500/30 text-green-400 h-8">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-500/30">
                <SelectItem value="exclusive">Exclusive</SelectItem>
                <SelectItem value="sharable">Sharable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="resource-instances" className="text-xs text-green-400">
              Instances
            </Label>
            <Input
              id="resource-instances"
              type="number"
              min="1"
              value={newResource.instances}
              onChange={(e) => setNewResource({ ...newResource, instances: Number.parseInt(e.target.value) || 1 })}
              className="bg-black border-green-500/30 text-green-400 h-8"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-green-400">Allocated To</Label>
          <div className="flex gap-2">
            <select
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(e.target.value)}
              className="flex-1 h-8 rounded-md bg-black border border-green-500/30 text-green-400 text-sm px-2"
            >
              <option value="">Select a process</option>
              {processes.map((process) => (
                <option key={process} value={process}>
                  {process}
                </option>
              ))}
            </select>
            <Button
              onClick={addProcessToResource}
              disabled={!selectedProcess}
              className="h-8 bg-green-900/20 hover:bg-green-900/40 text-green-500 border border-green-500/50"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {newResource.allocatedTo.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {newResource.allocatedTo.map((process) => (
                <div
                  key={process}
                  className="bg-yellow-900/20 text-yellow-400 text-xs px-2 py-1 rounded-md flex items-center"
                >
                  {process}
                  <button
                    onClick={() => removeProcessFromResource(process)}
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
          onClick={addResource}
          className="w-full bg-green-900/20 hover:bg-green-900/40 text-green-500 border border-green-500/50 h-8"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Resource
        </Button>
      </div>

      <div className="border border-green-500/20 rounded-md p-2 max-h-[200px] overflow-y-auto">
        <h3 className="text-sm font-mono mb-2 text-green-400">Available Resources</h3>

        {resources.length === 0 ? (
          <div className="text-xs text-gray-500 italic">No resources created</div>
        ) : (
          <div className="space-y-2">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between bg-yellow-900/10 p-2 rounded-md border border-yellow-500/20"
              >
                <div>
                  <div className="text-sm font-bold text-yellow-400">{resource.id}</div>
                  <div className="text-xs text-gray-400">{resource.name}</div>
                  <div className="text-xs text-gray-500">
                    {resource.type === "exclusive" ? "Exclusive" : "Sharable"} • {resource.instances} instance(s)
                  </div>
                  {resource.allocatedTo.length > 0 && (
                    <div className="text-xs text-gray-500 flex gap-1 mt-1">
                      Allocated to:
                      <div className="flex flex-wrap gap-1">
                        {resource.allocatedTo.map((p) => (
                          <span key={p} className="bg-yellow-900/20 text-yellow-400 px-1 rounded">
                            {p}
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
                  onClick={() => removeResource(resource.id)}
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

