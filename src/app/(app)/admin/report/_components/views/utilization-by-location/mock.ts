export type UtilizationLocationRow = {
  id: string
  location: string
  scheme: string
  provider: string
  plan: string
  claimsCount: number
  enrolleeCount: number
  approvedClaim: number

  // filter helpers
  f_service: string
  f_location: string
  f_scheme: string
  f_plan: string
  f_costRange: string
}

export const MOCK_UTILIZATION_LOCATION_ROWS: UtilizationLocationRow[] =
  Array.from({ length: 20 }, (_, i) => {
    const locations = [
      "Abuja",
      "Abia",
      "Anambra",
      "Adamawa",
      "Akwa Ibom",
      "Bauchi",
      "Lagos",
      "Rivers",
      "Kano",
      "Kaduna",
    ]
    const schemes = ["PHIS", "NHIS", "TSHIP", "NYSC"]
    const plans = ["Platinum Plan", "Gold Plan", "Silver Plan"]
    const services = ["inpatient", "outpatient", "labs", "pharmacy"]

    const location = locations[i % locations.length]
    const scheme = schemes[i % schemes.length]
    const plan = plans[i % plans.length]
    const provider = "Cedar Creast Hospital"

    const approvedClaim = [4_384_277, 3_283_484, 2_104_120, 1_775_000][i % 4]
    const claimsCount = [500, 369, 732, 292, 64, 729][i % 6]
    const enrolleeCount = [300, 250, 502, 1664, 47, 397][i % 6]
    const service = services[i % services.length]

    const f_costRange =
      approvedClaim <= 100_000
        ? "0-100k"
        : approvedClaim <= 500_000
        ? "100k-500k"
        : approvedClaim <= 1_000_000
        ? "500k-1m"
        : "1m+"

    const f_plan = plan.toLowerCase().includes("platinum")
      ? "platinum"
      : plan.toLowerCase().includes("gold")
      ? "gold"
      : "silver"

    return {
      id: String(i + 1),
      location,
      scheme,
      provider,
      plan,
      claimsCount,
      enrolleeCount,
      approvedClaim,

      f_service: service,
      f_location: location.toLowerCase().replace(/\s+/g, "-"),
      f_scheme: scheme.toLowerCase(),
      f_plan,
      f_costRange,
    }
  })

export type PerfLocationDatum = {
  id: string
  location: string
  providers: number
  enrollees: number
  utilization: number
}

export const MOCK_LOCATION_PERFORMANCE: PerfLocationDatum[] = [
  {
    id: "abuja",
    location: "Abuja",
    providers: 23,
    enrollees: 23483,
    utilization: 234_394_394,
  },
  {
    id: "ph",
    location: "Port harcourt",
    providers: 12,
    enrollees: 23483,
    utilization: 234_394_394,
  },
  {
    id: "abia",
    location: "Abia",
    providers: 12,
    enrollees: 23483,
    utilization: 234_394_394,
  },
  {
    id: "adamawa",
    location: "Adamawa",
    providers: 12,
    enrollees: 23483,
    utilization: 234_394_394,
  },
  {
    id: "akwa",
    location: "Akwa Ibom",
    providers: 12,
    enrollees: 23483,
    utilization: 234_394_394,
  },
  {
    id: "anambra",
    location: "Anambra",
    providers: 12,
    enrollees: 23483,
    utilization: 234_394_394,
  },
  {
    id: "bauchi",
    location: "Bauchi",
    providers: 12,
    enrollees: 23483,
    utilization: 234_394_394,
  },
  {
    id: "bayelsa",
    location: "Bayelsa",
    providers: 12,
    enrollees: 23483,
    utilization: 234_394_394,
  },
  {
    id: "benue",
    location: "Benue",
    providers: 12,
    enrollees: 23483,
    utilization: 234_394_394,
  },
  {
    id: "borno",
    location: "Borno",
    providers: 12,
    enrollees: 23483,
    utilization: 234_394_394,
  },
]
