"use client"

import type { ColumnDef } from "../_components/reports/ReportExportContext"

// ---------- CSV ----------
function escapeCsv(v: any) {
  const s = String(v ?? "")
  // wrap if contains comma/quote/newline
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function exportToCsv<T>({
  fileName,
  columns,
  rows,
}: {
  fileName: string
  columns: ColumnDef<T>[]
  rows: T[]
}) {
  const headers = columns.map((c) => escapeCsv(c.header)).join(",")
  const lines = rows.map((r) =>
    columns.map((c) => escapeCsv(c.value(r))).join(",")
  )

  const csv = [headers, ...lines].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })

  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = fileName.toLowerCase().endsWith(".csv")
    ? fileName
    : `${fileName}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}

// ---------- XLSX (ExcelJS) ----------
export async function exportToXlsx<T>({
  fileName,
  sheetName = "Report",
  columns,
  rows,
}: {
  fileName: string
  sheetName?: string
  columns: ColumnDef<T>[]
  rows: T[]
}) {
  const ExcelJS = (await import("exceljs")).default
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet(sheetName)

  // Header row
  ws.addRow(columns.map((c) => c.header))
  ws.getRow(1).font = { bold: true }

  // Data rows
  rows.forEach((r) => {
    ws.addRow(columns.map((c) => c.value(r)))
  })

  // Optional: reasonable column widths
  ws.columns = columns.map((c) => ({
    header: c.header,
    key: c.header,
    width: Math.min(Math.max(c.header.length + 6, 14), 40),
  }))

  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = fileName.toLowerCase().endsWith(".xlsx")
    ? fileName
    : `${fileName}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
}
