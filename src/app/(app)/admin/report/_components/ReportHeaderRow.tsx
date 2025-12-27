"use client"

import * as React from "react"
import { DownloadIcon } from "@/components/svgs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search, SlidersHorizontal } from "lucide-react"
import { exportToCsv, exportToXlsx } from "../export/exporters"
import { useReportExport } from "./reports/ReportExportContext"
import { useReportQuery } from "./reports/ReportQueryContext"

type Props = { title: string }

export function ReportHeaderRow({ title }: Props) {
  const { q, setQ } = useReportQuery()
  const { config } = useReportExport()
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
    <div className="w-full border-b border-[#EEF0F5]">
      <div
        className={cn(
          "w-full flex items-center gap-4",
          "px-6 pt-5",
          "h-[84px]"
        )}
      >
        <h2 className="font-hnd font-bold text-[18px]/[28px] text-[#344054]">
          {title}
        </h2>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative w-[308px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Patient ID/Name"
              className={cn(
                "h-[40px] rounded-[12px] bg-[#F8F8F8] border border-[#0000001A]",
                "pl-9 shadow-[0px_1px_2px_0px_#1018280D]"
              )}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-[40px] rounded-[12px] border-[#D0D5DD] text-[#344054] gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>

          <Button
            type="button"
            className="h-[40px] rounded-[12px] bg-[#1671D9] hover:bg-[#125DBF] gap-2 disabled:opacity-50 disabled:pointer-events-none"
            onClick={onExport}
            disabled={!config || exporting}
          >
            <DownloadIcon />
            {exporting ? "Exporting..." : "Export Report"}
          </Button>
        </div>
      </div>
    </div>
  )
}
