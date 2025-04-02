import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

type SystemProcess = {
  pid: number
  name: string
  resources: string[]
  waitingFor?: string
  state: 'running' | 'waiting' | 'blocked' | 'deadlocked'
}

type SystemResource = {
  id: string
  name: string
  instances: number
  allocatedTo: string[]
  waitingProcesses: string[]
}

export async function getSystemProcesses(): Promise<SystemProcess[]> {
  try {
    // Get process info including CPU usage
    const { stdout: processInfo } = await execAsync('powershell "Get-Process | Select-Object Id,ProcessName,WorkingSet,Threads,CPU,@{Name=\'ThreadState\';Expression={$_.Threads | % ThreadState}} | ConvertTo-Json"')
    const processes = JSON.parse(processInfo)

    return processes.map(proc => {
      // Analyze thread states to determine process state
      const threadStates = proc.ThreadState || []
      const waitingThreads = threadStates.filter(state => state === 'Wait')
      const blockedThreads = threadStates.filter(state => state === 'Stopped')
      
      let state: SystemProcess['state'] = 'running'
      let waitingFor: string | undefined

      if (blockedThreads.length > 0) {
        state = 'blocked'
      } else if (waitingThreads.length > proc.Threads / 2) {
        state = 'waiting'
        waitingFor = 'CPU'
      }

      // Check for potential deadlock conditions
      if (proc.CPU < 0.1 && waitingThreads.length > 0 && blockedThreads.length > 0) {
        state = 'deadlocked'
        waitingFor = 'Resource'
      }

      return {
        pid: proc.Id,
        name: proc.ProcessName,
        resources: [
          `MEM:${Math.round(proc.WorkingSet / 1024 / 1024)}MB`,
          `CPU:${proc.CPU?.toFixed(1)}%`,
          `THR:${proc.Threads}`
        ],
        state,
        waitingFor
      }
    })
  } catch (error) {
    console.error('Error getting system processes:', error)
    return []
  }
}

export async function getSystemResources(): Promise<SystemResource[]> {
  try {
    // Get CPU usage
    const { stdout: cpuData } = await execAsync('powershell Get-Counter "\\Processor(_Total)\\% Processor Time"')
    const cpuUsage = parseFloat(cpuData.match(/\d+\.\d+/)?.[0] || '0')
    
    // Get memory usage
    const { stdout: memData } = await execAsync('powershell Get-CimInstance Win32_OperatingSystem | Select-Object TotalVisibleMemorySize,FreePhysicalMemory')
    const [total, free] = memData.match(/\d+/g)?.map(Number) || [0, 0]
    
    return [
      {
        id: 'CPU',
        name: 'CPU Resource',
        instances: navigator.hardwareConcurrency || 4,
        allocatedTo: [],
        waitingProcesses: cpuUsage > 80 ? ['System'] : []
      },
      {
        id: 'MEM',
        name: 'Memory Resource',
        instances: Math.round(total / 1024), // Convert to MB
        allocatedTo: [],
        waitingProcesses: (free / total) < 0.2 ? ['System'] : []
      }
    ]
  } catch (error) {
    console.error('Error getting system resources:', error)
    return []
  }
}