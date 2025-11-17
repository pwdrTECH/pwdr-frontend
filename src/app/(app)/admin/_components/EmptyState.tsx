"use client";

import EmptyFileIcon from "@/components/svgs/nodata";
import AddPlan from "../schemes/_components/Add";

export interface EmptyStateProps {
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({
  message = "No data available",
  action,
}: EmptyStateProps) {
  return (
    <div className="w-full flex justify-center items-center">
      <div
        className="sm:w-[471.56px] sm:h-[471.56px] relative flex flex-col items-center justify-center gap-[19.65px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/empty-state-ring.svg')" }}
      >
        <div className="relative top-33 h-[220px]">
          <EmptyFileIcon className="z-10" />
        </div>
        <div className="sm:w-[345.8px] flex flex-col gap-2 font-hnd tracking-normal text-center">
          <div className="text-[17.68px]/[27.51px] font-medium text-[#344054]">
            Feels empty here
          </div>
          <p className="text-[13.75px]/[19.65px] text-[#6B7280]">{message}</p>
        </div>

        <div className="z-10">{action && <AddPlan />}</div>
      </div>
    </div>
  );
}
