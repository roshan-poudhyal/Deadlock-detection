import Header from "@/components/header"
import ThreadAnimation from "@/components/thread-animation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, Clock, Database, Server, Shield, Zap } from "lucide-react"
import SystemMetrics from "@/components/system-metrics"
import DeadlockHistory from "@/components/deadlock-history"
import ResourceMonitor from "@/components/resource-monitor"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-green-500 flex flex-col relative overflow-hidden">
      <Header />

      {/* Background thread animations */}
      <ThreadAnimation density={0.3} />

      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                System Dashboard
              </span>
            </h1>
            <p className="text-gray-400">Monitor system performance and deadlock statistics</p>
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <div className="flex items-center gap-1 text-sm text-green-400">
              <Clock className="h-4 w-4" />
              <span>Last updated: 2 minutes ago</span>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              title: "System Status",
              value: "Operational",
              description: "All systems running normally",
              icon: <Server className="h-5 w-5" />,
              color: "green",
            },
            {
              title: "Active Processes",
              value: "24",
              description: "8 system, 16 user processes",
              icon: <Activity className="h-5 w-5" />,
              color: "blue",
            },
            {
              title: "Resource Utilization",
              value: "68%",
              description: "32/47 resources allocated",
              icon: <Database className="h-5 w-5" />,
              color: "yellow",
            },
            {
              title: "Deadlock Risk",
              value: "Low",
              description: "No potential deadlocks detected",
              icon: <Shield className="h-5 w-5" />,
              color: "green",
            },
          ].map((card, index) => (
            <Card key={index} className={`border-${card.color}-500/30 bg-black/80 backdrop-blur-sm`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">{card.title}</CardTitle>
                <div className={`text-${card.color}-400`}>{card.icon}</div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold text-${card.color}-400`}>{card.value}</div>
                <p className="text-xs text-gray-400 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">System Performance</CardTitle>
                <CardDescription>Resource allocation and process metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <SystemMetrics />
              </CardContent>
            </Card>

            <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm flex-1">
              <CardHeader>
                <CardTitle className="text-white">Deadlock History</CardTitle>
                <CardDescription>Recent deadlock events and resolutions</CardDescription>
              </CardHeader>
              <CardContent>
                <DeadlockHistory />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">System Alerts</CardTitle>
                <CardDescription>Recent warnings and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Potential Deadlock Warning",
                      description: "Circular wait condition detected in process group P4-P7",
                      time: "10 minutes ago",
                      severity: "warning",
                    },
                    {
                      title: "Resource Allocation Spike",
                      description: "Unusual resource allocation pattern detected",
                      time: "1 hour ago",
                      severity: "info",
                    },
                    {
                      title: "Deadlock Resolved",
                      description: "Automatic resolution applied to deadlock in P1-P3",
                      time: "3 hours ago",
                      severity: "success",
                    },
                  ].map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md border ${
                        alert.severity === "warning"
                          ? "border-yellow-500/30 bg-yellow-900/10"
                          : alert.severity === "info"
                            ? "border-blue-500/30 bg-blue-900/10"
                            : "border-green-500/30 bg-green-900/10"
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="mr-2 mt-0.5">
                          {alert.severity === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          ) : alert.severity === "info" ? (
                            <Zap className="h-4 w-4 text-blue-400" />
                          ) : (
                            <Shield className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">{alert.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">{alert.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm flex-1">
              <CardHeader>
                <CardTitle className="text-white">Resource Monitor</CardTitle>
                <CardDescription>Current resource allocation status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceMonitor />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

