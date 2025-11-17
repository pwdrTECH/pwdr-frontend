"use client"

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"

const miniData = [
  { x: 3, avg: 2.8, count: 10 },
  { x: 4, avg: 3.2, count: 6 },
  { x: 5, avg: 5.5, count: 10 },
  { x: 6, avg: 2.9, count: 7 },
  { x: 7, avg: 4.1, count: 9 },
  { x: 8, avg: 3.6, count: 8 },
  { x: 9, avg: 4.3, count: 10 },
]

const chartConfig = {
  count: { label: "Count", color: "#A7D6E3" },
  avg: { label: "Average", color: "#027FA3" },
} as const

export function AvgClaimsMiniChart() {
  return (
    <ChartContainer className="h-[140px] w-full" config={chartConfig}>
      <ResponsiveContainer>
        <ComposedChart
          data={miniData}
          margin={{ top: 10, right: 4, left: 4, bottom: 0 }}
        >
          <defs>
            {/* Bar gradient */}
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="3.57%" stopColor="rgba(2,127,163,0.3)" />
              <stop offset="83.93%" stopColor="rgba(2,127,163,0)" />
            </linearGradient>

            {/* Triangular line gradient */}
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(2,127,163,0)" />
              <stop offset="25%" stopColor="rgba(2,127,163,0.8)" />
              <stop offset="50%" stopColor="#027FA3" />
              <stop offset="74.5%" stopColor="rgba(2,127,163,0.8)" />
              <stop offset="100%" stopColor="rgba(2,127,163,0)" />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="x"
            axisLine={{
              stroke: "#027FA333",
              strokeWidth: 1,
            }}
            tickLine={false}
            tick={{
              fill: "#027FA333",
              fontSize: 12,
              fontWeight: 500,
              dy: 4,
            }}
          />
          <YAxis hide />

          {/* Bars */}
          <Bar
            dataKey="count"
            barSize={22.75}
            radius={[3.44, 3.44, 0, 0]}
            fill="url(#barGradient)"
          />

          {/* Triangular line (sharp joins) */}
          <Line
            type="linear" // straight lines between points
            dataKey="avg"
            stroke="url(#lineGradient)"
            strokeWidth={2.4}
            dot={false}
            activeDot={false}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            style={{
              shapeRendering: "crispEdges", // sharp corners
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
