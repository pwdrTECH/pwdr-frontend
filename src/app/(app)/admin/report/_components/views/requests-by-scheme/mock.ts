export type UtilSchemeRow = {
  id: string
  scheme: string
  schemeLabel: string
  plan: string
  planLabel: string
  enrolleeName: string
  totalRequests: number
  totalCost: number
  avgCostPerEnrollee: number
  approvalRateLabel: string

  // optional filters
  service?: string
  location?: string
  costRange?: string
}

export const MOCK_SCHEME_ROWS: UtilSchemeRow[] = Array.from({ length: 24 }).map(
  (_, i) => ({
    id: String(i + 1),
    scheme: "nhis",
    schemeLabel: "NHIS",
    plan: "platinum",
    planLabel: "Platinum Plan",
    enrolleeName: "Muhammad Sahab",
    totalRequests: [327, 300, 286][i % 3],
    totalCost: [4384277, 3283484][i % 2],
    avgCostPerEnrollee: [4384277, 3283484][i % 2],
    approvalRateLabel: "₦ 4,384,277",

    service: "consultation",
    location: ["abuja", "lagos", "kano"][i % 3],
    costRange: "100k-500k",
  })
)

export const MOCK_TOP_SCHEMES_SERIES = [
  { m: "Jul", tship: 12000, nhis: 11000 },
  { m: "Aug", tship: 22000, nhis: 17000 },
  { m: "Sep", tship: 24000, nhis: 26000 },
  { m: "Oct", tship: 21000, nhis: 20000 },
  { m: "Nov", tship: 15000, nhis: 16000 },
  { m: "Dec", tship: 11000, nhis: 8000 },
  { m: "Jan", tship: 14000, nhis: 12000 },
  { m: "Feb", tship: 17000, nhis: 24000 },
  { m: "Mar", tship: 10000, nhis: 9000 },
  { m: "Apr", tship: 18000, nhis: 22000 },
  { m: "May", tship: 9000, nhis: 12000 },
  { m: "Jun", tship: 19000, nhis: 18000 },
]
