"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EnrolleeDetail } from "@/lib/api/beneficiaries";
import { format } from "date-fns";

interface PlanSchemeSectionProps {
  enrollee?: EnrolleeDetail | null;
}

export function PlanSchemeSection({ enrollee }: PlanSchemeSectionProps) {
  // We don't have scheme_name in EnrolleeDetail,
  // so for now we just show a placeholder or derive from user_role/HMO if you want.
  const scheme =
    enrollee?.user_role === "principal"
      ? "Principal"
      : enrollee?.user_role === "dependent"
        ? "Dependent"
        : "—";

  const plan = enrollee?.plan_name || "—";

  const premium = enrollee?.plan_premium
    ? `₦${Number(enrollee.plan_premium).toLocaleString()}`
    : "—";

  const utilizationThreshold = enrollee?.plan_utilization_threshold
    ? `${enrollee.plan_utilization_threshold}%`
    : "—";

  const daysToActivate = enrollee?.plan_days_to_activate
    ? `${enrollee.plan_days_to_activate} days`
    : "—";

  // If backend later adds plan_history, this stays TS-safe:
  const history: any[] = Array.isArray((enrollee as any)?.plan_history)
    ? ((enrollee as any).plan_history as any[])
    : [];

  return (
    <div className="flex flex-col gap-[19px] rounded-3xl border border-[#EAECF0] pb-4">
      {/* Header */}
      <div className="bg-[#EFEFEF59] h-[58px] gap-2 border-b py-[19px] px-4">
        <h3 className="text-[16px]/[20px] font-hnd font-bold text-[#5F656B] tracking-normal">
          Plan & Scheme
        </h3>
      </div>

      {/* Scheme + Plan + a few key fields */}
      <div className="grid grid-cols-2 gap-4 px-4">
        <div>
          <p className="text-[#656565] font-hnd text-[14px]/[18px]">Scheme:</p>
          <p className="font-medium text-[16px]/[20px] text-[#3D4449]">
            {scheme}
          </p>
        </div>

        <div>
          <p className="text-[#656565] font-hnd text-[14px]/[18px]">Plan:</p>
          <p className="font-medium text-[16px]/[20px] text-[#3D4449]">
            {plan}
          </p>
        </div>

        <div>
          <p className="text-[#656565] font-hnd text-[14px]/[18px]">Premium:</p>
          <p className="font-medium text-[16px]/[20px] text-[#3D4449]">
            {premium}
          </p>
        </div>

        <div>
          <p className="text-[#656565] font-hnd text-[14px]/[18px]">
            Utilization threshold:
          </p>
          <p className="font-medium text-[16px]/[20px] text-[#3D4449]">
            {utilizationThreshold}
          </p>
        </div>

        <div>
          <p className="text-[#656565] font-hnd text-[14px]/[18px]">
            Days to activate:
          </p>
          <p className="font-medium text-[16px]/[20px] text-[#3D4449]">
            {daysToActivate}
          </p>
        </div>
      </div>

      {/* Plan History */}
      <div className="flex flex-col gap-[19px] px-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[14px]/[18px] font-hnd font-medium text-[#656565]">
            Plan History
          </h4>
          <Button
            variant="link"
            className="text-[#726E75] font-bold hover:bg-transparent text-sm p-0 h-auto"
          >
            View All
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {history.length === 0 && (
            <p className="text-sm text-[#667085] py-2">
              No previous plan history found.
            </p>
          )}

          {history.map((item, i) => {
            const status = item.status || "Unknown";
            const amount = item.amount
              ? `₦${Number(item.amount).toLocaleString()}`
              : "—";
            const date = item.date
              ? format(new Date(item.date), "MMMM d, yyyy")
              : "—";

            const badgeColor =
              status.toLowerCase() === "active"
                ? "bg-[#E7EFFC] text-[#0F5FD9]"
                : "bg-[#F8D4D4] text-[#D90F0F]";

            return (
              <div
                key={`plan-history-item-${i + 1}`}
                className="flex flex-col gap-[14px] py-2 px-[14px] border border-[#EAECF0] rounded-2xl"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-hnd font-medium text-[#474747]">
                    {item.plan_name || plan}
                  </p>
                  <Badge
                    className={`text-[14px]/[14px] border-0 py-1 px-2 rounded-2xl ${badgeColor}`}
                  >
                    {status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#474747] font-hnd font-medium">
                    {amount}
                  </p>
                  <p className="text-sm text-[#474747] font-hnd font-medium">
                    {date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
