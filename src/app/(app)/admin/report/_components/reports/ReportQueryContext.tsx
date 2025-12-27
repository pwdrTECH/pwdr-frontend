"use client"

import * as React from "react"

type Ctx = {
  q: string
  setQ: (v: string) => void
}

const ReportQueryContext = React.createContext<Ctx | null>(null)

export function ReportQueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [q, setQ] = React.useState("")
  return (
    <ReportQueryContext.Provider value={{ q, setQ }}>
      {children}
    </ReportQueryContext.Provider>
  )
}

export function useReportQuery() {
  const ctx = React.useContext(ReportQueryContext)
  if (!ctx)
    throw new Error("useReportQuery must be used within ReportQueryProvider")
  return ctx
}
