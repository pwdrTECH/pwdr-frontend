"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import * as React from "react"
import AddProvider from "./_components/add"
import { ProvidersTable } from "./_components/table"
import { TableTitle } from "@/components/table"

export default function ProvidersPage() {
  const [q, setQ] = React.useState("")

  return (
    <Card className="p-0">
      <CardHeader className="pb-0 pt-5 px-6 flex flex-col gap-4 border-b border-[#EEF1F6] sm:flex-row sm:items-center sm:justify-between">
        <TableTitle>
          You have <span className="font-semibold">17</span> partner Providers
        </TableTitle>

        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative w-full sm:w-[284px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B4B4B4]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search HMOs"
              className="h-10 w-full rounded-[12px] pl-9 py-2.5 pr-4 bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]"
            />
          </div>
          <div className="w-fit">
            <AddProvider />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ProvidersTable query={q} />
      </CardContent>
    </Card>
  )
}
