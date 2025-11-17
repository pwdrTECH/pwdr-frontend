export type Provider = "whatsapp" | "email" | "chat"
export type ReadStatus = "read" | "new"
export type RequestStatus = "pending" | "in_review" | "overdue" | "resolved"

export interface RequestItem {
  id: string
  name: string
  organization: string
  provider: Provider
  status: ReadStatus
  timestamp: string
  requestStatus: RequestStatus
}

/** Human-friendly labels */
export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  overdue: "Overdue",
  resolved: "Resolved",
}

/** Badge classes per status */
export const STATUS_BADGE: Record<RequestStatus, string> = {
  pending: "bg-[#FEF5E9] text-[#B47618]",
  in_review: "bg-primary/10 text-primary",
  overdue: "bg-[#FF60581A] text-[#FF6058]",
  resolved: "bg-green-100 text-green-600",
}

/** Convert various labels to the normalized code */
export function labelToCode(label?: string): RequestStatus | undefined {
  if (!label) return undefined
  const t = label.trim().toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ")
  if (t === "pending") return "pending"
  if (t === "in review") return "in_review"
  if (t === "overdue" || t === "overdue") return "overdue"
  if (t === "resolved") return "resolved"
  return undefined
}
