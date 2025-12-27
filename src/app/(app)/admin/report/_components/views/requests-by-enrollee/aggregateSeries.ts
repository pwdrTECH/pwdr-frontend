import type { MonthSeries } from "./types"

type RangeKey = "day" | "month" | "year" | "all"

function parseLabel(label: string) {
  // supports: "2025-09-03", "Sep", "Sep 2025", "2025", "03 Sep"
  return label.trim()
}

function keyYear(label: string) {
  const t = label.trim()
  const y = t.match(/\b(19|20)\d{2}\b/)
  return y ? y[0] : t
}

export function aggregateSeries(
  data: MonthSeries[],
  range: RangeKey
): MonthSeries[] {
  if (!data?.length) return []

  if (range === "month") return data // already monthly
  if (range === "day") return data // if your API already returns daily, keep it

  if (range === "all") {
    const sum = data.reduce(
      (acc, r) => {
        acc.approved += r.approved ?? 0
        acc.pending += r.pending ?? 0
        acc.rejected += r.rejected ?? 0
        return acc
      },
      { approved: 0, pending: 0, rejected: 0 }
    )

    return [{ m: "All", ...sum }]
  }

  // year
  const map = new Map<string, MonthSeries>()

  for (const row of data) {
    const year = keyYear(parseLabel(row.m))
    const existing = map.get(year)
    if (!existing) {
      map.set(year, {
        m: year,
        approved: row.approved ?? 0,
        pending: row.pending ?? 0,
        rejected: row.rejected ?? 0,
      })
    } else {
      existing.approved += row.approved ?? 0
      existing.pending += row.pending ?? 0
      existing.rejected += row.rejected ?? 0
    }
  }

  return Array.from(map.values())
}
