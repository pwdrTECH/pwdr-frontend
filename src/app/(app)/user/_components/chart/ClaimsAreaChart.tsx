"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const data = [
  { month: "Jul", claims: 10_000 },
  { month: "Aug", claims: 24_000 },
  { month: "Sep", claims: 26_500 },
  { month: "Oct", claims: 23_000 },
  { month: "Nov", claims: 12_000 },
  { month: "Dec", claims: 12_200 },
  { month: "Jan", claims: 15_000 },
  { month: "Feb", claims: 11_000 },
  { month: "Mar", claims: 13_000 },
  { month: "Apr", claims: 22_000 },
  { month: "May", claims: 15_000 },
  { month: "Jun", claims: 21_500 },
]

export function ClaimsAreaChart() {
  return (
    <ChartContainer
      className="h-[260px] w-full font-hnd"
      config={{
        claims: { label: "Claims", color: "#027FA3" },
      }}
    >
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            {/* Area fill (vertical) */}
            <linearGradient id="fillClaims" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(2, 127, 163, 0.5)" />
              <stop offset="100%" stopColor="rgba(2, 127, 163, 0)" />
            </linearGradient>

            {/* Axis line gradient (horizontal fade) */}
            <linearGradient id="axisGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(2,127,163,0)" />
              <stop offset="17.5%" stopColor="rgba(2,127,163,0.2)" />
              <stop offset="50%" stopColor="rgba(2,127,163,0.2)" />
              <stop offset="84.5%" stopColor="rgba(2,127,163,0.2)" />
              <stop offset="100%" stopColor="rgba(2,127,163,0)" />
            </linearGradient>

            {/* Line stroke gradient (triangular look) */}
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(2,127,163,0)" />
              <stop offset="25%" stopColor="rgba(2,127,163,0.8)" />
              <stop offset="50%" stopColor="#027FA3" />
              <stop offset="74.5%" stopColor="rgba(2,127,163,0.8)" />
              <stop offset="100%" stopColor="rgba(2,127,163,0)" />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            className="stroke-muted"
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#027FA333", fontSize: 12, dy: 4 }}
            className="text-[#027FA333]"
          />

          <YAxis
            width={32}
            tickFormatter={(v) => `${Math.round((v as number) / 1000)}k`}
            axisLine={false}
            tickLine={false}
            className="text-[#979797]"
          />

          <ChartTooltip
            cursor={{
              stroke: "#212123",
              strokeDasharray: "4.5 4.5",
              strokeWidth: 1.57,
            }}
            content={
              <ChartTooltipContent
                labelKey="month"
                formatter={(value, _name, item) => {
                  const month = (item?.payload as any)?.month
                  const num = Number(value ?? 0)
                  return (
                    <div className="w-full grid gap-1.5 items-start bg-[#212123] px-[6.26px] py-[4.7px] rounded-tl-[6.26px] rounded-tr-[6.26px] rounded-br-[6.26px]  font-hnd leading-[100%] tracking-normal">
                      <span className="text-[#868686] text-[18.78px]">
                        {month}
                      </span>
                      <span className="text-[#FCFCFC] text-[12.52px]  font-normal">
                        {num.toLocaleString()}
                      </span>
                    </div>
                  )
                }}
              />
            }
          />

          <Area
            type="linear"
            dataKey="claims"
            stroke="url(#lineGradient)"
            fill="url(#fillClaims)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#027FA3" }}
            strokeLinecap="butt"
            strokeLinejoin="miter"
            style={{ shapeRendering: "crispEdges" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
