"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import * as React from "react"
import { AddEnrolleeForm } from "./_components/add"
import Filters from "./_components/filters"
import EnrolleesTable from "./_components/table"

type StatusValue = "active" | "pending" | "suspended" | "inactive"

export default function BeneficiariesPage() {
  const [search, setSearch] = React.useState("")
  const [filters, setFilters] = React.useState<{
    statuses: StatusValue[]
    plans: string[]
  }>({ statuses: [], plans: [] })

  // derive unique plan options from data for the popover
  const planOptions = React.useMemo(
    () => Array.from(new Set(mockEnrollees.map((e) => e.plan))),
    []
  )

  // simple client filtering: search by name/enrolleeId + filter by plans (status left for future)
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return mockEnrollees.filter((e) => {
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.enrolleeId.toLowerCase().includes(q)

      const matchesPlans =
        filters.plans.length === 0 || filters.plans.includes(e.plan)

      // If you later add real "status" on the enrollee, also check it here.
      return matchesSearch && matchesPlans
    })
  }, [search, filters.plans])

  return (
    <Card className="p-0">
      <CardHeader className="pb-0 pt-5 px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-[18px]/[28px] tracking-normal font-hnd font-bold text-[#344054]">
          You have{" "}
          <span className="font-semibold">
            {mockEnrollees.length.toLocaleString()}
          </span>{" "}
          Enrollees
        </CardTitle>
        <div className="flex items-center gap-4">
          {/* Header actions: Search + Filter (popover) + Add */}
          <Filters
            search={search}
            onSearchChange={setSearch}
            statuses={filters.statuses}
            plans={filters.plans}
            onChangeFilters={(f) => setFilters(f)}
            planOptions={planOptions}
          />

          <AddEnrolleeForm />
        </div>
      </CardHeader>

      {/* Enrollees Table */}
      <EnrolleesTable enrollees={filtered} />
    </Card>
  )
}

/* ---------------- Mock Data ---------------- */
const mockEnrollees = [
  {
    id: "1",
    name: "Olarewaju Michael Saheed",
    enrolleeId: "13/OUJ9R42N",
    scheme: "NHIS",
    plan: "Basic",
    role: "Principal",
    balance: "₦ 259,030",
    utilization: 12,
  },
  {
    id: "2",
    name: "Austin Winfred Ebuka",
    enrolleeId: "13/OUJ9R42N",
    scheme: "PHIS",
    plan: "Family Plan",
    role: "Dependent",
    balance: "₦ 259,030",
    utilization: 16,
  },
  {
    id: "3",
    name: "Olarewaju Michael Saheed",
    enrolleeId: "13/OUJ9R42N",
    scheme: "NHIS",
    plan: "Basic",
    role: "Principal",
    balance: "₦ 259,030",
    utilization: 12,
  },
  {
    id: "4",
    name: "Austin Winfred Ebuka",
    enrolleeId: "13/OUJ9R42N",
    scheme: "PHIS",
    plan: "Family Plan",
    role: "Dependent",
    balance: "₦ 259,030",
    utilization: 12,
  },
  {
    id: "5",
    name: "Olarewaju Michael Saheed",
    enrolleeId: "13/OUJ9R42N",
    scheme: "NHIS",
    plan: "Basic",
    role: "Principal",
    balance: "₦ 259,030",
    utilization: 32,
  },
  {
    id: "6",
    name: "Austin Winfred Ebuka",
    enrolleeId: "13/OUJ9R42N",
    scheme: "PHIS",
    plan: "Family Plan",
    role: "Dependent",
    balance: "₦ 259,030",
    utilization: 82,
  },
  {
    id: "7",
    name: "Olarewaju Michael Saheed",
    enrolleeId: "13/OUJ9R42N",
    scheme: "NHIS",
    plan: "Basic",
    role: "Principal",
    balance: "₦ 259,030",
    utilization: 51,
  },
  {
    id: "8",
    name: "Austin Winfred Ebuka",
    enrolleeId: "13/OUJ9R42N",
    scheme: "PHIS",
    plan: "Family Plan",
    role: "Dependent",
    balance: "₦ 259,030",
    utilization: 39,
  },
  {
    id: "9",
    name: "Olarewaju Michael Saheed",
    enrolleeId: "13/OUJ9R42N",
    scheme: "PHIS",
    plan: "Basic",
    role: "Principal",
    balance: "₦ 259,030",
    utilization: 40,
  },
  {
    id: "10",
    name: "Austin Winfred Ebuka",
    enrolleeId: "13/OUJ9R42N",
    scheme: "PHIS",
    plan: "Family Plan",
    role: "Dependent",
    balance: "₦ 259,030",
    utilization: 58,
  },
]
