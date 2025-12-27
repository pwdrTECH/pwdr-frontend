export type UtilProviderRow = {
  id: string
  providerName: string
  providerCode: string
  avatarUrl?: string

  location: string
  locationLabel: string

  scheme?: string
  plan?: string
  costRange?: string

  patientsCount: number
  requests: number
  totalCost: number
  avgCostPerEnrollee: number
}

export const MOCK_PROVIDER_ROWS: UtilProviderRow[] = Array.from({
  length: 20,
}).map((_, i) => {
  const isA = i % 2 === 0
  return {
    id: String(i + 1),
    providerName: isA ? "Hospital XYZ" : "Elvachi Hospital",
    providerCode: "13/O/W7E270",
    avatarUrl: "",

    location: isA ? "abuja" : "bauchi",
    locationLabel: isA ? "Abuja" : "Bauchi",

    scheme: "nhis",
    plan: "platinum",
    costRange: "100k-500k",

    patientsCount: isA ? 327 : 300,
    requests: isA ? 1938 : 2834,
    totalCost: isA ? 4384277 : 3283484,
    avgCostPerEnrollee: isA ? 4384277 : 3283484,
  }
})

export const MOCK_PROVIDER_REQUESTS_SERIES = [
  { m: "Jul", requests: 900 },
  { m: "Aug", requests: 1400 },
  { m: "Sep", requests: 1600 },
  { m: "Oct", requests: 2100 },
  { m: "Nov", requests: 1900 },
  { m: "Dec", requests: 2400 },
  { m: "Jan", requests: 1390 },
  { m: "Feb", requests: 1100 },
  { m: "Mar", requests: 1750 },
  { m: "Apr", requests: 2250 },
  { m: "May", requests: 2200 },
  { m: "Jun", requests: 3600 },
]

export const MOCK_PROVIDER_SERVICES_BARS = [
  {
    id: "1",
    provider: "Hospital XYZ",
    value: 55,
  },
  { id: "2", provider: "Elvachi", value: 45 },
  {
    id: "3",
    provider: "Cedar Creast",
    value: 30,
  },
  { id: "4", provider: "H - Medix", value: 20 },
  { id: "5", provider: "Gov. Hosp.", value: 15 },
]

export const MOCK_TOP7_PROVIDERS_BY_COST = [
  {
    id: "1",
    label: "Hospital XYZ",
    code: "13/O/W7E270",
    amount: "₦ 42,484,492.02",
    percent: 25,
    color: "#B3A289",
    logoUrl: "/images/org-1.png",
  },
  {
    id: "2",
    label: "HEMI",
    code: "13/O/W7E270",
    amount: "₦ 42,484,492.02",
    percent: 16,
    color: "#FF6B01",
    logoUrl: "/images/org-2.png",
  },
  {
    id: "3",
    label: "Cookie Labs",
    code: "13/O/W7E270",
    amount: "₦ 42,484,492.02",
    percent: 11,
    color: "#B9F7CE",
    logoUrl: "/images/org-3.png",
  },
  {
    id: "4",
    label: "Crestal",
    code: "13/O/W7E270",
    amount: "₦ 42,484,492.02",
    percent: 6,
    color: "#97B91A",
    logoUrl: "/images/org-4.png",
  },
  {
    id: "5",
    label: "Quick Swap",
    code: "13/O/W7E270",
    amount: "₦ 42,484,492.02",
    percent: 4,
    color: "#2088C5",
    logoUrl: "/images/org-5.png",
  },
  {
    id: "6",
    label: "Others",
    code: "",
    amount: "₦ 42,484,492.02",
    percent: 62,
    color: "#EAEAEA",
  },
]
