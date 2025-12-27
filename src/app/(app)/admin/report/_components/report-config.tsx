export type ReportKey =
  | "requests_by_enrollee"
  | "requests_by_provider"
  | "util_by_enrollee"
  | "util_by_diagnosis"
  | "util_by_services"
  | "util_by_location"
  | "util_by_organization"
  | "util_by_provider"
  | "util_by_scheme"
  | "overdue_report"

export type ReportNavItem =
  | { type: "link"; key: ReportKey; label: string }
  | {
      type: "group"
      label: string
      children: Array<{ key: ReportKey; label: string }>
    }
  | { type: "divider" }
  | { type: "spacer" }

export const REPORT_LABELS: Record<ReportKey, string> = {
  requests_by_enrollee: "Requests by enrollee",
  requests_by_provider: "Requests by Provider",
  util_by_enrollee: "Utilization by Enrollee",
  util_by_diagnosis: "Utilization by Diagnosis",
  util_by_services: "Utilization by Services",
  util_by_location: "Utilization by Location",
  util_by_organization: "Utilization by Organization",
  util_by_provider: "Utilization by Provider",
  util_by_scheme: "Utilization by Scheme",
  overdue_report: "Overdue Report",
}

export const REPORT_NAV: ReportNavItem[] = [
  { type: "link", key: "requests_by_enrollee", label: "Requests by enrollee" },
  { type: "link", key: "requests_by_provider", label: "Requests by provider" },
  { type: "divider" },
  {
    type: "group",
    label: "Report by Utilization",
    children: [
      { key: "util_by_enrollee", label: "By enrollee" },
      { key: "util_by_diagnosis", label: "By Diagnosis" },
      { key: "util_by_services", label: "By Services" },
      { key: "util_by_location", label: "By Location" },
      { key: "util_by_organization", label: "By Organization" },
      { key: "util_by_provider", label: "By Provider" },
      { key: "util_by_scheme", label: "By Scheme" },
    ],
  },
  { type: "link", key: "overdue_report", label: "Overdue Report" },
  { type: "spacer" },
]
