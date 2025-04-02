import { Button } from "@/components/ui/button"
import { GithubIcon, InfoIcon, Settings } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import BackendStatus from "@/components/backend-status"

export default function Header() {
  return (
    <header className="border-b border-green-500/30 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <Image src="/logo.svg" alt="NeoLock Logo" fill className="object-contain animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              NeoLock
            </h1>
            <p className="text-xs text-green-500/70 font-mono">AI-Powered Deadlock Detection</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-green-500 hover:text-green-400 transition-colors">
            Home
          </Link>
          <Link href="/playground" className="text-green-500 hover:text-green-400 transition-colors">
            Playground
          </Link>
          <Link href="/#learn" className="text-green-500 hover:text-green-400 transition-colors">
            Learn
          </Link>
          <Link href="/dashboard" className="text-green-500 hover:text-green-400 transition-colors">
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <BackendStatus />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-green-500 hover:bg-green-900/20 hover:text-green-400">
              <InfoIcon size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-green-500 hover:bg-green-900/20 hover:text-green-400">
              <Settings size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-green-500 hover:bg-green-900/20 hover:text-green-400">
              <GithubIcon size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

