"use client"

function fmtInt(n: number) {
  return Number(n || 0).toLocaleString("en-NG")
}
function fmtNaira(n: number) {
  return `₦ ${Number(n || 0).toLocaleString("en-NG")}`
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-7">
      <div className="text-[12px] text-[#667085]">{label}</div>
      <div className="text-[20px] font-semibold text-[#101828]">{value}</div>
    </div>
  )
}

type ApiSummary = {
  total_number_of_services: number
  total_claims_amount: number
  average_service_cost: number
  most_used_service: string
}

export function ServiceStatsRow({
  rows,
  summary,
}: {
  rows: any[]
  summary?: ApiSummary
}) {
  // fallback if summary not provided
  const fallbackTotal = rows.length
  const fallbackTotalCost = rows.reduce(
    (a: number, b: any) => a + (Number(b?.cost) || 0),
    0
  )
  const fallbackAvg = fallbackTotal ? fallbackTotalCost / fallbackTotal : 0

  const totalServices = summary?.total_number_of_services ?? fallbackTotal
  const totalAmount = summary?.total_claims_amount ?? fallbackTotalCost
  const avgCost = summary?.average_service_cost ?? fallbackAvg
  const mostUsed = summary?.most_used_service ?? "—"

  return (
    <div className="w-full border-b border-[#EEF0F5]">
      <div className="grid grid-cols-4 px-6">
        <Stat label="Total Services" value={fmtInt(totalServices)} />
        <Stat label="Total Claims Amount" value={fmtNaira(totalAmount)} />
        <Stat label="Average Service Cost" value={fmtNaira(avgCost)} />
        <Stat label="Most Used Service" value={mostUsed} />
      </div>
    </div>
  )
}
