"use client";

import React from "react";
import { CustomSheet } from "@/components/overlays/SideDialog";
import { AngleRight } from "@/components/svgs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EditPlanForm from "./EditPlan";
import type { PlanItem } from "./types";
import { usePlanDetails } from "@/lib/api/schemes";

function formatNaira(value: number | string | null | undefined): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "N 0";
  return `N ${n.toLocaleString("en-NG")}`;
}

type PlanDetailsSheetProps = {
  plan: PlanItem;
};

export function PlanDetailsSheet({ plan }: PlanDetailsSheetProps) {
  const [open, setOpen] = React.useState(false);

  // Fetch full plan details from PHP API
  const { data, isLoading, isError, error } = usePlanDetails({
    id: plan.id,
    show_services: 1,
  });

  const apiData = data?.data ?? {};

  // Core fields with fallbacks to the original plan card
  const name: string = apiData.name ?? plan.name;
  const premium = apiData.premium ?? apiData.plan_premium ?? plan.premium;
  const utilization =
    apiData.utilization ??
    apiData.plan_utilization_threshold ??
    plan.utilization;
  const waitDays =
    apiData.days_to_activate ??
    apiData.wait_days ??
    apiData.plan_days_to_activate ??
    plan.waitDays;

  const schemesRaw =
    apiData.schemes ??
    apiData.scheme_names ??
    apiData.scheme_list ??
    plan.schemes ??
    [];

  const schemes: string[] = Array.isArray(schemesRaw)
    ? schemesRaw.map((s: any) => String(s))
    : [];

  //  Normalize services
  const rawServices =
    apiData.services ??
    apiData.service_items ??
    apiData.plan_services ??
    plan.serviceItems ??
    [];

  const services: string[] = Array.isArray(rawServices)
    ? rawServices.map((svc: any) => {
        // Already a string → keep as is
        if (typeof svc === "string") return svc;

        if (svc && typeof svc === "object") {
          const title = svc.name ?? svc.service_name ?? svc.code ?? "Service";

          const cost = svc.cost ?? svc.amount ?? svc.price;

          if (cost != null && !Number.isNaN(Number(cost))) {
            return `${title} - ${formatNaira(cost)}`;
          }

          return String(title);
        }

        return String(svc);
      })
    : [];

  return (
    <CustomSheet
      title="Plan Details"
      subtitle=""
      trigger={
        <Button
          variant="outline"
          className="h-9 rounded-xl hover:bg-primary/90 hover:text-white text-[14px]/[20px] text-[#344054] bg-transparent"
        >
          View Plan <AngleRight />
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button
            onClick={() => setOpen(false)}
            variant="outline"
            className="hover:bg-primary/10 hover:border-primary/10 hover:text-[#344054] text-[13.08px]/[18.63px] text-[#344054] font-hnd font-semibold tracking-normal"
          >
            Close
          </Button>
          <EditPlanForm plan={plan} />
        </div>
      }
      contentClassName="px-0"
    >
      <div className="w-full sm:w-[522px] flex flex-col gap-8 px-6 py-4">
        {isLoading && (
          <div className="py-6 text-center text-sm text-[#6B7280]">
            Loading plan details…
          </div>
        )}

        {isError && (
          <div className="py-6 text-center text-sm text-red-600">
            {(error as Error)?.message ||
              data?.message ||
              "Failed to load plan details."}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Plan Name */}
            <h3 className="text-[24px]/[32px] text-[#101828] font-bold font-hnd tracking-normal">
              {name}
            </h3>

            {/* Stats grid */}
            <div className="flex flex-wrap items-center gap-4">
              <Stat title="Premium" value={formatNaira(premium)} />
              <Stat title="Services" value={String(services.length)} />
              <Stat title="Activation Days" value={`${waitDays ?? 0} Days`} />
            </div>

            {/* Utilization Bandwidth */}
            <div className="w-full flex flex-col items-center justify-center gap-1 rounded-2xl border border-[#EAECF0] bg-white h-20 py-4 px-2 font-hnd tracking-normal">
              <div className="text-[14px]/[16px] text-[#7B7B7B] font-medium">
                Utilization Bandwidth
              </div>
              <div className="text-[16px]/[16px] font-bold text-[#344054]">
                {formatNaira(utilization)}
              </div>
            </div>

            {/* Schemes */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="scheme"
                className="mb-2 text-[16px]/[24px] font-medium text-[#344054] block tracking-normal"
              >
                Schemes
              </label>
              <div className="flex flex-wrap gap-4">
                {schemes.length === 0 && (
                  <span className="text-sm text-[#98A2B3]">
                    No schemes linked to this plan.
                  </span>
                )}
                {schemes.map((scheme, idx) => (
                  <Badge
                    key={`${scheme}-${idx + 1}`}
                    variant="secondary"
                    className="rounded-[6px] bg-white border border-[#D0D5DD] pl-2 pr-1 py-0.5 text-[14px]/[20px] font-medium text-[#344054] font-hnd tracking-normal"
                  >
                    {scheme}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Service Items */}
            <div className="h-[70px] flex flex-col gap-8 pt-4 border-t border-[#EAECF0]">
              <div className="w-full flex flex-col gap-0.5">
                <label
                  htmlFor="service"
                  className="mb-1 text-[18px]/[28px] font-bold text-[#101828] tracking-normal font-hnd"
                >
                  Service Items ({services.length})
                </label>
                <p className="text-[16px]/[24px] text-[#475467] font-normal font-hnd tracking-normal">
                  Services included in Plan
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {services.length === 0 && (
                  <div className="text-sm text-[#98A2B3]">
                    No services configured for this plan.
                  </div>
                )}
                {services.map((item, index) => (
                  <div
                    key={`plan-service-${index + 1}`}
                    className="min-h-16 rounded-xl border border-[#EAECF0] bg-white px-4 py-2 text-[16px]/[24px] text-[#344054] font-normal font-hnd tracking-normal"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </CustomSheet>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="w-[147.33px] flex flex-col items-center justify-center gap-1 rounded-4 border border-[#EAECF0] bg-white h-20 py-4 px-2 font-hnd tracking-normal">
      <div className="text-[14px]/[16px] text-[#7B7B7B] font-medium">
        {title}
      </div>
      <div className="text-[16px]/[16px] font-bold text-[#344054]">{value}</div>
    </div>
  );
}
