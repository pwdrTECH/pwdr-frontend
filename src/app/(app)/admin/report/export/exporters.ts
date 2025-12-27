export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function escapeCsv(v: any) {
  if (v === null || v === undefined) return ""
  const s = String(v)
  // wrap if contains commas, quotes, or newlines
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export function exportToCsv<T>(args: {
  fileName: string
  columns: { header: string; value: (row: T) => any }[]
  rows: T[]
}) {
  const { fileName, columns, rows } = args
  const header = columns.map((c) => escapeCsv(c.header)).join(",")
  const lines = rows.map((r) =>
    columns.map((c) => escapeCsv(c.value(r))).join(",")
  )
  const csv = [header, ...lines].join("\n")
  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    fileName.endsWith(".csv") ? fileName : `${fileName}.csv`
  )
}

export async function exportToXlsx<T>(args: {
  fileName: string
  sheetName?: string
  columns: { header: string; value: (row: T) => any }[]
  rows: T[]
}) {
  // Lazy import to keep bundle light
  const XLSX = await import("xlsx")

  const { fileName, sheetName = "Report", columns, rows } = args

  const data = rows.map((r) => {
    const o: Record<string, any> = {}
    for (const c of columns) o[c.header] = c.value(r)
    return o
  })

  const ws = XLSX.utils.json_to_sheet(data, { skipHeader: false })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  downloadBlob(
    new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`
  )
}
