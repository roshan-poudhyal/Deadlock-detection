import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { ArrowRight, BookOpen, Code, Cpu, Database, Lock, Play, Server } from "lucide-react"
import AnalogClock from "@/components/analog-clock"
import ThreadAnimation from "@/components/thread-animation"
import DeadlockExample from "@/components/deadlock-example"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-green-500 flex flex-col relative overflow-hidden">
      <Header />

      {/* Background thread animations */}
      <ThreadAnimation />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center gap-8 relative z-10">
        <div className="lg:w-1/2 space-y-6">
          <div className="inline-block bg-green-900/20 px-4 py-1 rounded-full border border-green-500/30 text-sm font-mono">
            AI-Powered System
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Deadlock Detection
            </span>{" "}
            <br />
            <span className="text-white">& Prevention System</span>
          </h1>
          <p className="text-lg text-gray-300">
            Visualize, understand, and solve complex deadlock scenarios with our advanced AI-powered detection system.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="bg-green-500 hover:bg-green-600 text-black font-medium">
              <Link href="/playground">
                Try Simulator <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-green-500/50 hover:bg-green-900/20">
              <Link href="#learn">
                Learn About Deadlocks <BookOpen className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
            <AnalogClock />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="text-3xl font-bold mb-12 text-center">
          <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Key Features
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Lock className="h-10 w-10 text-green-400" />,
              title: "Deadlock Detection",
              description:
                "Advanced algorithms to detect circular wait conditions and resource conflicts in real-time.",
            },
            {
              icon: <Cpu className="h-10 w-10 text-cyan-400" />,
              title: "Process Simulation",
              description: "Create and simulate process interactions with resources to understand deadlock scenarios.",
            },
            {
              icon: <Database className="h-10 w-10 text-purple-400" />,
              title: "Resource Allocation",
              description: "Visualize how resources are allocated and requested in complex systems.",
            },
            {
              icon: <Server className="h-10 w-10 text-yellow-400" />,
              title: "System Analysis",
              description: "Get detailed insights into system states and potential deadlock resolutions.",
            },
            {
              icon: <Code className="h-10 w-10 text-pink-400" />,
              title: "Educational Tools",
              description: "Learn about deadlocks through interactive examples and visualizations.",
            },
            {
              icon: <Play className="h-10 w-10 text-blue-400" />,
              title: "Interactive Playground",
              description: "Experiment with different scenarios to understand deadlock conditions and prevention.",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="border border-green-500/30 rounded-lg p-6 bg-black/80 backdrop-blur-sm hover:border-green-400/50 transition-all hover:shadow-[0_0_15px_rgba(0,255,128,0.3)] group"
            >
              <div className="mb-4 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learn About Deadlocks Section */}
      <section id="learn" className="container mx-auto px-4 py-16 relative z-10">
        <h2 className="text-3xl font-bold mb-12 text-center">
          <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Understanding Deadlocks
          </span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-2xl font-bold text-white mb-2">What is a Deadlock?</h3>
              <p className="text-gray-300">
                A deadlock is a situation in computing where two or more processes are unable to proceed because each is
                waiting for resources held by another, resulting in a circular dependency.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-bold text-white">Four Necessary Conditions:</h4>
              <ul className="space-y-3">
                {[
                  {
                    title: "Mutual Exclusion",
                    description: "Resources cannot be shared simultaneously between processes.",
                  },
                  {
                    title: "Hold and Wait",
                    description: "Processes hold resources while waiting for additional ones.",
                  },
                  {
                    title: "No Preemption",
                    description: "Resources cannot be forcibly taken from processes.",
                  },
                  {
                    title: "Circular Wait",
                    description: "A circular chain of processes, each waiting for a resource held by the next.",
                  },
                ].map((condition, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-green-500 text-black rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-bold text-white">{condition.title}:</span> {condition.description}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border border-green-500/30 rounded-lg p-6 bg-black/80 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-white mb-4">Interactive Example</h3>
            <DeadlockExample />
          </div>
        </div>

        <div className="mt-16 space-y-8">
          <h3 className="text-2xl font-bold text-white">Deadlock Prevention Strategies</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Prevention",
                description:
                  "Design the system to ensure at least one of the necessary conditions for deadlock cannot occur.",
                techniques: ["Resource ordering", "Complete allocation", "No resource holding while waiting"],
              },
              {
                title: "Avoidance",
                description:
                  "Make careful resource allocation decisions to ensure the system never enters an unsafe state.",
                techniques: ["Banker's Algorithm", "Resource trajectory approach", "Safe state verification"],
              },
              {
                title: "Detection",
                description: "Allow deadlocks to occur, but have mechanisms to detect and recover from them.",
                techniques: ["Resource allocation graph", "Wait-for graph", "Cycle detection algorithms"],
              },
              {
                title: "Recovery",
                description: "Take action to break deadlocks after they have been detected.",
                techniques: ["Process termination", "Resource preemption", "Checkpoint and rollback"],
              },
            ].map((strategy, index) => (
              <div
                key={index}
                className="border border-green-500/30 rounded-lg p-6 bg-black/80 backdrop-blur-sm hover:border-green-400/50 transition-all"
              >
                <h4 className="text-xl font-bold text-white mb-2">{strategy.title}</h4>
                <p className="text-gray-300 mb-4">{strategy.description}</p>
                <div>
                  <h5 className="text-sm font-bold text-green-400 mb-2">Techniques:</h5>
                  <ul className="space-y-1">
                    {strategy.techniques.map((technique, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-gray-300 text-sm">{technique}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button asChild className="bg-green-500 hover:bg-green-600 text-black font-medium">
            <Link href="/playground">
              Try Our Interactive Simulator <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

