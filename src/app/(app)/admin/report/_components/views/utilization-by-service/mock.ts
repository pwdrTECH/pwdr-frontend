export type UtilServiceRow = {
  id: string
  service: string
  enrolleeName: string
  requestId: string
  provider: string
  location: string
  cost: number

  // filter fields
  f_service?: string
  f_location?: string
  f_scheme?: string
  f_plan?: string
  f_costRange?: string
}

export const MOCK_UTIL_SERVICE_ROWS: UtilServiceRow[] = Array.from(
  { length: 20 },
  (_, i) => {
    const services = [
      "Inpatient",
      "Outpatient",
      "Labs",
      "Pharmacy",
      "Consultation",
      "Test",
    ]
    const locations = ["Abuja", "Lagos", "Anambra", "Kaduna", "Kano", "Rivers"]
    const schemes = ["NHIS", "PHIS", "TSHIP", "NYSC"]
    const plans = ["Platinum", "Gold", "Silver"]

    const service = services[i % services.length]
    const location = locations[i % locations.length]
    const scheme = schemes[i % schemes.length]
    const plan = plans[i % plans.length]
    const cost = [4_384_277, 3_283_484, 2_104_120, 1_775_000, 850_000][i % 5]

    const costRange =
      cost <= 100_000
        ? "0-100k"
        : cost <= 500_000
        ? "100k-500k"
        : cost <= 1_000_000
        ? "500k-1m"
        : "1m+"

    return {
      id: String(i + 1),
      service,
      enrolleeName: i % 2 === 0 ? "Muhammad Sahab" : "Chidinma Isaac",
      requestId: `13/O/W7E27${String(i).padStart(2, "0")}`,
      provider: "Cedar Creast Hospital",
      location,
      cost,

      f_service: service.toLowerCase(),
      f_location: location.toLowerCase(),
      f_scheme: scheme.toLowerCase(),
      f_plan: plan.toLowerCase(),
      f_costRange: costRange,
    }
  }
)

export type TopServiceDatum = {
  key: string
  label: string
  value: number
  percent: number
  color: string
}

export const MOCK_TOP_SERVICES: TopServiceDatum[] = [
  {
    key: "inpatient",
    label: "Inpatient",
    value: 2394,
    percent: 25,
    color: "#1671D9",
  },
  {
    key: "outpatient",
    label: "Outpatient",
    value: 2394,
    percent: 18,
    color: "#AAB511",
  },
  {
    key: "pharmacy",
    label: "Pharmacy",
    value: 2894,
    percent: 6,
    color: "#D5314D",
  },
  {
    key: "others",
    label: "Others",
    value: 8384,
    percent: 32,
    color: "#EAEAEA",
  },
]

export type MonthlyServiceCostPoint = {
  m: string
  s1: number
  s2: number
  s3: number
  s4: number
}

export const MOCK_SERVICE_MONTHLY: MonthlyServiceCostPoint[] = [
  { m: "Jul", s1: 21000, s2: 17000, s3: 10000, s4: 15000 },
  { m: "Aug", s1: 22000, s2: 17500, s3: 9800, s4: 14500 },
  { m: "Sep", s1: 22500, s2: 18000, s3: 10200, s4: 14800 },
  { m: "Oct", s1: 23000, s2: 17800, s3: 9900, s4: 14600 },
  { m: "Nov", s1: 22500, s2: 17600, s3: 10100, s4: 14400 },
  { m: "Dec", s1: 22800, s2: 17900, s3: 10300, s4: 14700 },
  { m: "Jan", s1: 23200, s2: 18100, s3: 10400, s4: 14900 },
  { m: "Feb", s1: 23500, s2: 18250, s3: 10500, s4: 15000 },
  { m: "Mar", s1: 29000, s2: 23000, s3: 14000, s4: 20000 },
  { m: "Apr", s1: 16000, s2: 12000, s3: 8000, s4: 11000 },
  { m: "May", s1: 33000, s2: 26000, s3: 16000, s4: 22000 },
  { m: "Jun", s1: 19000, s2: 14000, s3: 9000, s4: 12500 },
]
