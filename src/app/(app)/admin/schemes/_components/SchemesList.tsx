"use client";

import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/utils";
import EditPlanForm from "./EditPlan";
import { PlanDetailsSheet } from "./PlanDetailsSheet";
import type { SchemeGroup } from "./types";

export function SchemesList({
  groups,
}: {
  groups: SchemeGroup[];
  onEditGroup?: (code: SchemeGroup["code"]) => void;
}) {
  return (
    <div className=" w-full flex flex-col gap-8">
      {groups.map((g, index) => (
        <section
          key={`${index + 1}`}
          className="bg-[#FBFBFB] rounded-4xl border border-[#00000012] pb-[30px]"
        >
          <div className="w-full flex flex-col p-[30px]">
            <div className="flex items-end justify-end gap-2">
              {g.active && (
                <Badge className="w-fit h-[20.74px] rounded-[14.94px] bg-[#ECFDF3] border border-[#027A4833] pl-[5.6px] pr-[7.47px] py-[1.87px] text-[12px] text-[#027A48] flex items-center justify-center gap-[5.6px]">
                  <span className="text-[#027A48]">&#x25cf;</span> Active
                </Badge>
              )}
            </div>
            <div className="w-full h-14 flex items-center justify-between gap-2 pt-[30px]">
              <span className="w-full flex flex-col font-hnd  tracking-normal">
                <h3 className="text-[30px]/[36px] font-semibold text-[#474747]">
                  {g.code}
                </h3>
                <span className="text-[14px]/[20px] font-medium text-[#6B7280]">
                  {g.subtitle}
                </span>
              </span>

              <EditPlanForm />
            </div>
          </div>

          <div className="h-[308px] flex gap-[22px] overflow-y-auto pl-[30px]">
            {g.plans.map((p) => (
              <article
                key={p.id}
                className="sm:w-[336px] border border-[#E4E7EC] bg-white p-4 flex flex-col justify-between gap-4 rounded-2xl"
              >
                <div className="w-full flex flex-col gap-4 justify-between">
                  <h4 className="text-[16px] font-semibold text-[#0F172A]">
                    {p.name}
                  </h4>
                  <div className="flex items-center gap-3 text-[14px]/[16px] font-hnd font-medium text-[#696969] tracking-normal pb-3 border-b border-[#E4E7EC]">
                    <span>{formatNaira(p.premium)}</span>

                    <span>{`${p.servicesCount} services`}</span>
                    <span>{`${p.waitDays} Days Wait`}</span>
                  </div>
                </div>

                <div className="w-full flex flex-col gap-3 font-hnd">
                  <div className="w-full text-[14px]/[16px] font-medium text-[#101928] text-left tracking-normal">
                    Service Items
                  </div>
                  <ul className="space-y-1 text-[14px]/[20px] text-[#696969] pl-4">
                    {p.serviceItems.slice(0, 2).map((s, i) => (
                      <li key={`${i + 2}`} className="list-disc">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="h-12 flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-3 font-hnd tracking-normal">
                    <div className="text-[14px]/[16px] font-medium text-[#101928]">
                      Utilization
                    </div>
                    <div className="font-normal text-[14px]/[20px] text-[#696969]">
                      {formatNaira(p.utilization)}
                    </div>
                  </div>
                  {/* Details Sheet */}
                  <PlanDetailsSheet plan={p} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
