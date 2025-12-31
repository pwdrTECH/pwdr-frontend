"use client"

import { cn } from "@/lib/utils"
import { ReportAside } from "./ReportAside"
import { ReportHeaderRow } from "./ReportHeaderRow"
import { REPORT_LABELS, type ReportKey } from "./report-config"
import { ReportQueryProvider } from "./reports/ReportQueryContext"
import { ReportExportProvider } from "./reports/ReportExportContext"

import { OverdueReportView } from "./views/overdue-report/OverdueReportView"
import { RequestsByEnrolleeView } from "./views/requests-by-enrollee/RequestsByEnrolleeView"
import { RequestsByProviderView } from "./views/requests-by-provider/RequestsByProviderView"
import { UtilizationBySchemeView } from "./views/requests-by-scheme/UtilizationBySchemeView"
import { UtilizationByDiagnosisView } from "./views/utilization-by-diagnosis/UtilizationByDiagnosisView"
import { UtilizationByEnrolleeView } from "./views/utilization-by-enrollee/UtilizationByEnrolleeView"
import { UtilizationByLocationView } from "./views/utilization-by-location/UtilizationByLocationView"
import { UtilizationByOrganizationView } from "./views/utilization-by-organization/UtilizationByOrganizationView"
import { UtilizationByProviderView } from "./views/utilization-by-providers/UtilizationByProviderView"
import { UtilizationByServiceView } from "./views/utilization-by-service/UtilizationByServicesView"

type Props = {
  active: ReportKey
  onActiveChange: (key: ReportKey) => void
}

export function ReportShell({ active, onActiveChange }: Props) {
  const title = REPORT_LABELS[active]

  return (
    <ReportQueryProvider>
      <ReportExportProvider>
        <section
          className={cn(
            "w-full bg-white border border-[#EAECF0] rounded-[12px] overflow-hidden",
            "h-[960px]"
          )}
        >
          <div className="flex w-full h-full">
            <ReportAside active={active} onActiveChange={onActiveChange} />

            <div className="flex-1 bg-white flex flex-col min-w-0">
              <ReportHeaderRow title={title} />

              <div className="flex-1 overflow-y-auto">
                {active === "requests_by_enrollee" && (
                  <RequestsByEnrolleeView />
                )}
                {active === "requests_by_provider" && (
                  <RequestsByProviderView />
                )}
                {active === "util_by_enrollee" && <UtilizationByEnrolleeView />}
                {active === "util_by_diagnosis" && (
                  <UtilizationByDiagnosisView />
                )}
                {active === "util_by_services" && <UtilizationByServiceView />}
                {active === "util_by_location" && <UtilizationByLocationView />}
                {active === "util_by_organization" && (
                  <UtilizationByOrganizationView />
                )}
                {active === "util_by_provider" && <UtilizationByProviderView />}
                {active === "util_by_scheme" && <UtilizationBySchemeView />}
                {active === "overdue_report" && <OverdueReportView />}
              </div>
            </div>
          </div>
        </section>
      </ReportExportProvider>
    </ReportQueryProvider>
  )
}
