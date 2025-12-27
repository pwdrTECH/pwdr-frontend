export const MOCK_UTIL_ENROLLEE_ROWS = Array.from({ length: 20 }).map(
  (_, i) => {
    const isAlt = i % 2 === 0
    const name = isAlt ? "Muhammad Sahab" : "Chidinma Isaac"
    const code = "13/O/W7E270"
    const scheme = isAlt ? "PHIS" : "NHIS"
    const plan = "Platinum"
    const provider = "Cedar Creast H..."
    const providerCount = 2
    const location = isAlt ? "Abuja" : "Lagos"

    // amounts
    const premium = 250_000
    const utilization = isAlt ? 4_384_277 : 3_283_484
    const usedPct = 18
    const balance = utilization

    return {
      id: String(i + 1),
      enrolleeName: name,
      enrolleeId: code,
      scheme,
      plan,
      provider,
      providerExtraCount: providerCount,
      location,
      premium,
      utilization,
      usedPct,
      balance,
      service: isAlt ? "inpatient" : "outpatient",
    }
  }
)

export const MOCK_TOP7_UTIL = [
  {
    id: "u1",
    name: "Muhammad Sahab",
    code: "13/O/W7E270",
    total: 42_484_492.02,
    percent: 25,
    color: "#1671D9",
    avatarUrl: "/images/sahab.jpg",
  },
  {
    id: "u2",
    name: "Muhammad Sahab",
    code: "13/O/W7E270",
    total: 42_484_492.02,
    percent: 16,
    color: "#1671D9CC",
    avatarUrl: "/images/profile.jpg",
  },
  {
    id: "u3",
    name: "Muhammad Sahab",
    code: "13/O/W7E270",
    total: 42_484_492.02,
    percent: 11,
    color: "#1671D999",
    avatarUrl: "/images/sahab.jpg",
  },
  {
    id: "u4",
    name: "Muhammad Sahab",
    code: "13/O/W7E270",
    total: 42_484_492.02,
    percent: 6,
    color: "#1671D980",
    avatarUrl: "/images/profile.jpg",
  },
  {
    id: "u5",
    name: "Muhammad Sahab",
    code: "13/O/W7E270",
    total: 42_484_492.02,
    percent: 4,
    color: "#1671D94D",
    avatarUrl: "/images/sahab.jpg",
  },
  {
    id: "others",
    name: "Others",
    code: "",
    total: 42_484_492.02,
    percent: 62,
    color: "#EAEAEA",
  },
]
