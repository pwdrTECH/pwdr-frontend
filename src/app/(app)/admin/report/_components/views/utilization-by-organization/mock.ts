export type OrgRow = {
  id: string
  organization: string
  enrolleeCount: number
  requests: number
  totalCost: number
  avgCostPerEnrollee: number
  premiumPool: number
  totalRequests: number
  approvedClaims?: number
  deniedClaims?: number
  utilizationCost?: number
  service?: string
  location?: string
  scheme?: string
  plan?: string
  costRange?: string
}

/** Claims comparison series (reuse your existing ClaimsComparisonCard shape if you already have it) */
export const MOCK_ORG_CLAIMS_SERIES = [
  {
    m: "Jul",
    approved: 14000,
    pending: 3000,
    rejected: 1200,
    approvedAmount: 18_390_283.29,
    pendingAmount: 2_390_283.29,
    rejectedAmount: 1_390_283.29,
  },
  {
    m: "Aug",
    approved: 21000,
    pending: 4200,
    rejected: 1500,
    approvedAmount: 28_390_283.29,
    pendingAmount: 3_390_283.29,
    rejectedAmount: 1_890_283.29,
  },
  {
    m: "Sep",
    approved: 16000,
    pending: 3800,
    rejected: 1100,
    approvedAmount: 20_390_283.29,
    pendingAmount: 2_990_283.29,
    rejectedAmount: 1_290_283.29,
  },
  {
    m: "Oct",
    approved: 26000,
    pending: 5200,
    rejected: 2100,
    approvedAmount: 32_390_283.29,
    pendingAmount: 4_190_283.29,
    rejectedAmount: 2_090_283.29,
  },
  {
    m: "Nov",
    approved: 12000,
    pending: 2600,
    rejected: 900,
    approvedAmount: 14_390_283.29,
    pendingAmount: 2_090_283.29,
    rejectedAmount: 990_283.29,
  },
  {
    m: "Dec",
    approved: 18000,
    pending: 3500,
    rejected: 1300,
    approvedAmount: 22_390_283.29,
    pendingAmount: 2_790_283.29,
    rejectedAmount: 1_390_283.29,
  },
]

export type TopOrgDatum = {
  key: string
  label: string
  value: number
  amount: string
  percent: number
  color: string
  code?: string
  logoUrl?: string
}

export const MOCK_TOP7_ORGS: TopOrgDatum[] = [
  {
    key: "kite",
    label: "Kite AI",
    value: 1394,
    amount: "₦ 42,484,492.02",
    percent: 25,
    color: "#1671D9",
    logoUrl: "/images/org-1.png",
  },
  {
    key: "hemi",
    label: "HEMI",
    value: 1394,
    amount: "₦ 42,484,492.02",
    percent: 16,
    color: "#1671D9CC",
    logoUrl: "/images/org-2.png",
  },
  {
    key: "cookie",
    label: "Cookie Labs",
    value: 1394,
    amount: "₦ 42,484,492.02",
    percent: 11,
    color: "#1671D999",
    logoUrl: "/images/org-3.png",
  },
  {
    key: "crestal",
    label: "Crestal",
    value: 1394,
    amount: "₦ 42,484,492.02",
    percent: 6,
    color: "#1671D980",
    logoUrl: "/images/org-4.png",
  },
  {
    key: "quick",
    label: "Quick Swap",
    value: 1394,
    amount: "₦ 42,484,492.02",
    percent: 4,
    color: "#1671D94D",
    logoUrl: "/images/org-5.png",
  },
  {
    key: "others",
    label: "Others",
    value: 28384,
    amount: "₦ 42,484,492.02",
    percent: 62,
    color: "#EAEAEA",
  },
]
