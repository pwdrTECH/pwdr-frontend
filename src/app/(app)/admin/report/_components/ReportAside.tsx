"use client"

import { AngleUp, ClipboardIcon } from "@/components/svgs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import * as React from "react"
import type { ReportKey } from "./report-config"

type Props = {
  active: ReportKey
  onActiveChange: (key: ReportKey) => void
}

const UTIL_KEYS: ReportKey[] = [
  "util_by_enrollee",
  "util_by_diagnosis",
  "util_by_services",
  "util_by_location",
  "util_by_organization",
  "util_by_provider",
  "util_by_scheme",
]

export function ReportAside({ active, onActiveChange }: Props) {
  const isUtilActive = UTIL_KEYS.includes(active)

  // Accordion open state
  const [utilOpen, setUtilOpen] = React.useState<boolean>(isUtilActive)

  // Keep accordion open if user navigates into utilization pages
  React.useEffect(() => {
    if (isUtilActive) setUtilOpen(true)
  }, [isUtilActive])

  const tabBase =
    "w-[201px] h-[44px] rounded-[12px] px-4 py-3 text-left font-hnd text-[14px]/[20px] font-normal tracking-normal"
  const tabActive = "bg-[#1671D91A] text-[#1671D9] font-bold"
  const tabInactive = "bg-white text-[#344054] hover:bg-[#F7FAFF]"

  return (
    <aside className="w-[233px] h-auto max-h-[929px] bg-white border border-[#EAECF0] p-4 flex flex-col justify-between gap-8">
      {/* Aside content wrapper */}
      <div className="flex flex-col gap-8 justify-between">
        {/* Tabs wrapper */}
        <div className="w-full flex flex-col gap-1">
          {/* Requests by enrollee */}
          <button
            type="button"
            onClick={() => onActiveChange("requests_by_enrollee")}
            className={cn(
              tabBase,
              active === "requests_by_enrollee" ? tabActive : tabInactive
            )}
          >
            Requests by enrollee
          </button>

          {/* Requests by provider */}
          <button
            type="button"
            onClick={() => onActiveChange("requests_by_provider")}
            className={cn(
              tabBase,
              active === "requests_by_provider" ? tabActive : tabInactive
            )}
          >
            Requests by provider
          </button>
          <div className="w-[201px]">
            <button
              type="button"
              onClick={() => setUtilOpen((v) => !v)}
              className={cn(
                "w-full h-[44px] rounded-[12px] px-4 py-3",
                "flex items-center justify-between",
                "bg-white text-[#344054] hover:bg-[#F7FAFF]",
                "font-hnd text-[14px]/[20px] font-normal tracking-normal",
                utilOpen ? "text-[#101828] font-bold" : ""
              )}
              aria-expanded={utilOpen}
            >
              <span>Report by Utilization</span>
              <span
                className={cn(
                  "text-[#98A2B3] transition-transform rotate-180",
                  utilOpen ? "rotate-0" : "rotate-180"
                )}
              >
                <AngleUp />
              </span>
            </button>

            {utilOpen && (
              <div className="mt-1 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => onActiveChange("util_by_enrollee")}
                  className={cn(
                    tabBase,
                    active === "util_by_enrollee" ? tabActive : tabInactive
                  )}
                >
                  By enrollee
                </button>

                <button
                  type="button"
                  onClick={() => onActiveChange("util_by_diagnosis")}
                  className={cn(
                    tabBase,
                    active === "util_by_diagnosis" ? tabActive : tabInactive
                  )}
                >
                  By Diagnosis
                </button>

                <button
                  type="button"
                  onClick={() => onActiveChange("util_by_services")}
                  className={cn(
                    tabBase,
                    active === "util_by_services" ? tabActive : tabInactive
                  )}
                >
                  By Services
                </button>

                <button
                  type="button"
                  onClick={() => onActiveChange("util_by_location")}
                  className={cn(
                    tabBase,
                    active === "util_by_location" ? tabActive : tabInactive
                  )}
                >
                  By Location
                </button>

                <button
                  type="button"
                  onClick={() => onActiveChange("util_by_organization")}
                  className={cn(
                    tabBase,
                    active === "util_by_organization" ? tabActive : tabInactive
                  )}
                >
                  By Organization
                </button>

                <button
                  type="button"
                  onClick={() => onActiveChange("util_by_provider")}
                  className={cn(
                    tabBase,
                    active === "util_by_provider" ? tabActive : tabInactive
                  )}
                >
                  By Provider
                </button>

                <button
                  type="button"
                  onClick={() => onActiveChange("util_by_scheme")}
                  className={cn(
                    tabBase,
                    active === "util_by_scheme" ? tabActive : tabInactive
                  )}
                >
                  By Scheme
                </button>
              </div>
            )}
          </div>

          {/* Overdue Report */}
          <button
            type="button"
            onClick={() => onActiveChange("overdue_report")}
            className={cn(
              tabBase,
              active === "overdue_report" ? tabActive : tabInactive,
              "mt-2"
            )}
          >
            Overdue Report
          </button>
        </div>

        <div className="h-px w-full bg-[#EAECF0]" />

        {/* Aside bottom */}
        <div className="w-full flex flex-col justify-between gap-8">
          <p className="font-hnd text-[14px]/[20px] font-normal text-[#67768C]">
            Customized reports
          </p>

          <div className="w-full h-[160px] flex flex-col gap-8 items-center text-center">
            <ClipboardIcon />
            <p className="h-10 w-[111px] text-[14px]/[20px] text-[#344054]">
              No custom report created
            </p>
          </div>
        </div>
      </div>
      <Button className="w-full h-10 rounded-[10px] bg-primary hover:bg-[#125DBF]">
        Create new Report
      </Button>
    </aside>
  )
}
