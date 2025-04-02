"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Generate sample data
const generateData = () => {
  const data = []
  const now = new Date()

  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000)
    const hour = time.getHours()

    // Ensure all values are valid numbers
    const processes = Math.floor(Math.random() * 10) + 15
    const resources = Math.floor(Math.random() * 15) + 30
    const deadlockRisk = Math.random() * 0.8
    const deadlocks = i % 8 === 0 ? 1 : 0

    data.push({
      time: `${hour}:00`,
      processes: isNaN(processes) ? 0 : processes,
      resources: isNaN(resources) ? 0 : resources,
      deadlockRisk: isNaN(deadlockRisk) ? 0 : deadlockRisk,
      deadlocks: isNaN(deadlocks) ? 0 : deadlocks,
    })
  }

  return data
}

export default function SystemMetrics() {
  const [data, setData] = useState(generateData())

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 128, 0.1)" />
          <XAxis dataKey="time" stroke="#888888" tick={{ fill: "#888888" }} />
          <YAxis yAxisId="left" stroke="#888888" tick={{ fill: "#888888" }} />
          <YAxis yAxisId="right" orientation="right" stroke="#888888" tick={{ fill: "#888888" }} domain={[0, 1]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "1px solid rgba(0, 255, 128, 0.3)",
              borderRadius: "4px",
              color: "#ffffff",
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="processes"
            name="Active Processes"
            stroke="#00ffff"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="resources"
            name="Allocated Resources"
            stroke="#00ff80"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="deadlockRisk"
            name="Deadlock Risk"
            stroke="#ff0080"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="stepAfter"
            dataKey="deadlocks"
            name="Deadlocks"
            stroke="#ff00ff"
            strokeWidth={3}
            dot={{ r: 6, fill: "#ff00ff", stroke: "#ff00ff", strokeWidth: 1 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

