"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import * as React from "react"
import AddPlan from "./_components/Add"
import { EmptyState } from "./_components/EmptyState"
import { SchemesList } from "./_components/SchemesList"
import type { SchemeGroup } from "./_components/types"

export default function SchemesPage() {
  const [q, setQ] = React.useState("")
  const [groups, setGroups] = React.useState<SchemeGroup[]>(MOCK)

  const filteredGroups = React.useMemo(() => {
    if (!q.trim()) return groups
    const lower = q.toLowerCase()
    return groups
      .map((g) => ({
        ...g,
        plans: g.plans.filter(
          (p) =>
            p.name.toLowerCase().includes(lower) ||
            p.serviceItems.some((s) => s.toLowerCase().includes(lower))
        ),
      }))
      .filter((g) => g.plans.length > 0)
  }, [groups, q])

  const totalPlans = React.useMemo(
    () => groups.reduce((n, g) => n + g.plans.length, 0),
    [groups]
  )
  const countSchemes = groups.length
  const hasAny = totalPlans > 0

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Header */}
      <div className="pb-0 pt-5 px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[18px]/[28px] tracking-normal font-hnd font-bold text-[#344054]">
          {/* Summary */}
          {hasAny ? (
            <>
              You have <b>{countSchemes}</b> Scheme
              {countSchemes !== 1 ? "s" : ""} + <b>{totalPlans}</b> Plan
              {totalPlans !== 1 ? "s" : ""}
            </>
          ) : (
            <>You have No Plan</>
          )}
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative w-full sm:w-[284px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B4B4B4]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Scheme/ Plans"
              className="h-10 w-full rounded-[12px] pl-9 py-2.5 pr-4 bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]"
            />
          </div>
          <div className="w-fit">
            <AddPlan />
          </div>
        </div>
      </div>

      {/* Content */}
      {!hasAny ? <EmptyState /> : <SchemesList groups={filteredGroups} />}
    </div>
  )
}

/* ---------------- Mock ---------------- */

const MOCK: SchemeGroup[] = [
  {
    code: "PHIS",
    title: "PHIS",
    subtitle: "Private Health Insurance Scheme",
    active: true,
    plans: [
      {
        id: "p1",
        name: "Pearl Plan",
        premium: 50_000,
        servicesCount: 23,
        waitDays: 7,
        utilization: 365_000,
        schemes: ["PHIS", "NHIS", "TSHIP", "NYSC"],
        serviceItems: [
          "Accommodation (including Feeding) General Ward (7 Days/Annum)",
          "GP Consultations (Physical & Virtual), Specialist Consultation (1/quarter), Ultrasounds and laboratory tests",
        ],
        status: "active",
      },
      {
        id: "p2",
        name: "Gold Plan",
        premium: 100_000,
        servicesCount: 32,
        waitDays: 7,
        utilization: 780_000,
        schemes: ["PHIS"],
        serviceItems: [
          "Accommodation (including Feeding) General Ward (7 Days/Annum)",
          "Diagnostics and Specialist reviews",
        ],
      },
      {
        id: "p3",
        name: "Emerald Plan",
        premium: 200_000,
        servicesCount: 40,
        waitDays: 7,
        utilization: 1_250_000,
        schemes: ["PHIS"],
        serviceItems: [
          "Accommodation (including Feeding) General Ward (7 Days/Annum)",
          "Advanced diagnostics and procedures",
        ],
      },
    ],
  },
  {
    code: "NHIS",
    title: "NHIS",
    subtitle: "Private Health Insurance Scheme",
    active: true,
    plans: [
      {
        id: "p4",
        name: "Pearl Plan",
        premium: 50_000,
        servicesCount: 23,
        waitDays: 7,
        utilization: 365_000,
        schemes: ["NHIS"],
        serviceItems: [
          "Accommodation (including Feeding) General Ward (7 Days/Annum)",
          "GP Consultations (Physical & Virtual), Specialist Consultation (1/quarter), Ultrasounds and laboratory tests",
        ],
      },
      {
        id: "p5",
        name: "Gold Plan",
        premium: 50_000,
        servicesCount: 23,
        waitDays: 7,
        utilization: 365_000,
        schemes: ["NHIS"],
        serviceItems: [
          "Accommodation (including Feeding) General Ward (7 Days/Annum)",
          "Diagnostics and Specialist reviews",
        ],
      },
    ],
  },
]
