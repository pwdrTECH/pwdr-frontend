"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { exportToCsv, exportToXlsx } from "../../../export/exporters"
import { useReportExport } from "../../reports/ReportExportContext"
import { DownloadIcon } from "@/components/svgs"
import { useReportQuery } from "../../reports/ReportQueryContext"

export function ProviderReportHeader() {
  const { config } = useReportExport()
  const { q, setQ } = useReportQuery()

  const [exporting, setExporting] = React.useState(false)

  async function onExport() {
    if (!config || exporting) return

    const rows = config.rows?.() ?? []
    if (!rows.length) return

    try {
      setExporting(true)

      const format = config.format ?? "csv"
      if (format === "xlsx") {
        await exportToXlsx({
          fileName: config.fileName,
          sheetName: config.sheetName,
          columns: config.columns,
          rows,
        })
      } else {
        exportToCsv({
          fileName: config.fileName,
          columns: config.columns,
          rows,
        })
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEF0F5]">
      <h1 className="text-[18px] font-medium text-[#212123]">
        Requests by Provider
      </h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 border border-[#EAECF0] rounded-[8px] bg-white">
          <Search className="h-4 w-4 text-[#7A7A7A]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Patient ID/Name"
            className="w-[220px] text-[14px] outline-none text-[#101828] placeholder:text-[#98A2B3] bg-transparent"
          />
        </div>

        {/* Filter (placeholder for now) */}
        <button
          type="button"
          className="px-3 py-2 border border-[#EAECF0] rounded-[8px] text-[14px] text-[#344054] bg-white"
        >
          Filter - All time
        </button>

        {/* Export */}
        <Button
          type="button"
          onClick={onExport}
          disabled={!config || exporting}
          className="h-[40px] rounded-[12px] bg-[#1671D9] hover:bg-[#125DBF] gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          <DownloadIcon />
          {exporting ? "Exporting..." : "Export Report"}
        </Button>
      </div>
    </div>
  )
}
