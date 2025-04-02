"use client"

import { useState, useEffect } from "react"
import { ForceGraph2D } from "react-force-graph"
import Card from "/workspaces/AI-Powered-Deadlock-Detection-System/frontend/deadlock-ui/src/components/card.js"

export default function DeadlockVisualizer() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [deadlockDetected, setDeadlockDetected] = useState(false)

  useEffect(() => {
    fetch("http://localhost:5000/get-graph")
      .then((res) => res.json())
      .then((data) => {
        setGraphData(data.graph)
        setDeadlockDetected(data.deadlock)
      })
  }, [])

  return (
    <div className="p-4">
      <Card className="p-4">
        <h2 className="text-xl font-bold">Deadlock Detection System</h2>
        {deadlockDetected && <p className="text-red-500 font-semibold">Deadlock Detected!</p>}
        <ForceGraph2D graphData={graphData} nodeAutoColorBy="id" linkDirectionalArrowLength={6} />
      </Card>
    </div>
  )
}

