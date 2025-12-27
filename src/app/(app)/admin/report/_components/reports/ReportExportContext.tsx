"use client"

import * as React from "react"

export type ExportFormat = "csv" | "xlsx"

export type ColumnDef<T> = {
  header: string
  // return the raw value you want exported (string/number/date)
  value: (row: T) => any
}

export type ExportConfig<T = any> = {
  fileName: string
  sheetName?: string
  format?: ExportFormat
  columns: ColumnDef<T>[]
  // IMPORTANT: should return ALL filtered rows (not paginated slice)
  rows: () => T[]
}

type Ctx = {
  config: ExportConfig | null
  setConfig: (c: ExportConfig | null) => void
}

const ReportExportContext = React.createContext<Ctx | null>(null)

export function ReportExportProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [config, setConfig] = React.useState<ExportConfig | null>(null)

  return (
    <ReportExportContext.Provider value={{ config, setConfig }}>
      {children}
    </ReportExportContext.Provider>
  )
}

export function useReportExport() {
  const ctx = React.useContext(ReportExportContext)
  if (!ctx)
    throw new Error("useReportExport must be used inside ReportExportProvider")
  return ctx
}
