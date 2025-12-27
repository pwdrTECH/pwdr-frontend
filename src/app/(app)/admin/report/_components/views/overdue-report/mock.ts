export type OverdueRow = {
  id: string
  requestId: string
  enrolleeName: string
  provider: string
  scheme: string
  schemeLabel: string
  submittedDate: string
  submittedTime: string
  daysOverdue: number
  totalCost: number
  service?: string
  location?: string
  plan?: string
  costRange?: string
}

export const MOCK_OVERDUE_ROWS: OverdueRow[] = Array.from({ length: 26 }).map(
  (_, i) => {
    const isPhis = i % 2 === 0
    return {
      id: String(i + 1),
      requestId: "13/O/W7E27O",
      enrolleeName: "Muhammad Sahab",
      provider: "Cedar Crest Hospital",
      scheme: isPhis ? "phis" : "nhis",
      schemeLabel: isPhis ? "PHIS" : "NHIS",
      submittedDate: "10/09/25",
      submittedTime: "7:32 am",
      daysOverdue: 12,
      totalCost: isPhis ? 4_384_277 : 3_283_484,

      service: "consultation",
      location: ["abuja", "lagos", "kano"][i % 3],
      plan: "platinum",
      costRange: "100k-500k",
    }
  }
)
