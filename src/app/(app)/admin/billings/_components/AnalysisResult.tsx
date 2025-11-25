"use client";

import { CancelButton } from "@/components/form/button";
import { CustomSheet } from "@/components/overlays/SideDialog";
import {
  ArrowRight,
  FilledAltApprovedIcon,
  FilledApprovedIcon,
  MagicPenIcon,
} from "@/components/svgs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ClaimAnalysisResultSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClaimAnalysisResultSheet({
  open,
  onOpenChange,
}: ClaimAnalysisResultSheetProps) {
  return (
    <CustomSheet
      title="Analysis Result"
      subtitle="View claim analysis result"
      open={open}
      trigger={
        <Button
          type="button"
          onClick={() => {
            console.log("View Result clicked");
          }}
          className="relative z-10 h-[44px] rounded-full bg-white text-base font-semibold text-[#1671D9] hover:bg-white/80 border-0"
        >
          View Result
        </Button>
      }
      onOpenChange={onOpenChange}
      contentClassName="px-8 py-6 space-y-6"
      footer={
        <div className="flex w-full items-center justify-between">
          <CancelButton onClick={() => onOpenChange(false)} text="Cancel" />
          <Button
            type="button"
            className="h-9 bg-[#2563EB] px-5 text-sm text-white hover:bg-[#1D4ED8]"
          >
            View Claim <ArrowRight />
          </Button>
        </div>
      }
    >
      <div className="w-[522px]">
        <div className="w-full sm-[477px] flex flex-col gap-5 rounded-3xl border border-[#EAECF0] pb-4">
          {/* Header row */}
          <div className="bg-[#F9FAFB] border-b border-[#EAECF0] w-full h-[58px] px-4 flex items-center gap-2 rounded-tl-3xl rounded-tr-3xl text-[13px] font-semibold text-[#111827]">
            <MagicPenIcon /> AI Summary
          </div>
          <div className="px-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              {/* Status pill */}
              <div className="h-6 flex items-center gap-2 text-[11px]/[16px] text-[#30C647] bg-[#DFF7E2]/80 font-hnd font-medium tracking-normal py-1 pl-[4.5px] pr-2 rounded-full">
                <FilledApprovedIcon />
                <span>Analysis Complete</span>
              </div>
              <Badge className="h-6 rounded-full bg-[#27CA40] pl-[4.5px] pr-2 py-1 text-[11px]/[16px] tracking-normal font-medium text-[#FFFFFF] border-none flex justify-between items-center gap-1">
                <FilledAltApprovedIcon /> Approved
              </Badge>
            </div>

            {/* Bill info */}
            <div className="text-sm text-[#101928] tracking-normal font-hnd space-y-[10px]">
              <div className="h-[20px] text-sm tracking-normal font-medium font-hnd">
                Bill Information
              </div>
              <div>Provider: Hospital Name</div>
              <div>Provider ID: CLM-043-LAG</div>
              <div>Bill ID: CK-20384</div>
            </div>

            {/* Metrics grid */}
            <div className="border border-[#EAECF0] grid grid-cols-2 md:grid-cols-4 gap-2 text-[12px]/[18px] text-[#7A7A7A] tracking-normal font-hnd px-4 pt-4 pb-8 rounded-2xl">
              <Metric label="Total Cost" value="₦3,300,000" />
              <Metric label="No. of claims" value="85" />
              <Metric label="Enrollees involved" value="53" />
              <Metric label="No. of flagged claims" value="28" />
            </div>
          </div>
        </div>
      </div>
    </CustomSheet>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 h-[46px]">
      <span className="text-[13px]/[20px] text-[#475467] tracking-normal font-normal font-hnd ">
        {label}
      </span>
      <span className="text-[#3F3F3F] text-[16px]/[20px] font-hnd font-medium tracking-normal">
        {value}
      </span>
    </div>
  );
}
