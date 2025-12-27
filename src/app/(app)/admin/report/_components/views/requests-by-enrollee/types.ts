export type Status = "Approved" | "Rejected" | "Pending"

export type EnrolleeRow = {
  id: string
  enrolleeName: string
  enrolleeId: string
  plan: string
  scheme: string
  provider: string
  requestDate: string
  requestTime: string
  status: Status
  amount: string
}

export type MonthSeries = {
  m: string
  approved: number
  pending: number
  rejected: number

  approvedAmount?: number | string
  pendingAmount?: number | string
  rejectedAmount?: number | string
}
