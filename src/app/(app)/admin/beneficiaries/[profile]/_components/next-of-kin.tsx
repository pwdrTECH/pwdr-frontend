"use client";

import type { EnrolleeDetail } from "@/lib/api/beneficiaries";

interface NextOfKinSectionProps {
  enrollee?: EnrolleeDetail | null;
}

export function NextOfKinSection({ enrollee }: NextOfKinSectionProps) {
  const name = enrollee?.next_of_kin || "—";
  const relationship = enrollee?.next_of_kin_relationship || "";
  const phone = enrollee?.next_of_kin_phone || "—";
  const address = enrollee?.next_of_kin_address || "—";

  // If absolutely nothing is set, you can optionally hide the entire block:
  const hasAnyNOK =
    enrollee &&
    (enrollee.next_of_kin ||
      enrollee.next_of_kin_phone ||
      enrollee.next_of_kin_address ||
      enrollee.next_of_kin_relationship);

  if (!hasAnyNOK) {
    return (
      <div className="flex flex-col gap-[19px] rounded-3xl border border-[#EAECF0] pb-4">
        <div className="bg-[#EFEFEF59] h-[58px] gap-2 border-b py-[19px] px-4">
          <h3 className="text-[16px]/[20px] font-hnd font-bold text-[#5F656B] tracking-normal">
            Next of Kin
          </h3>
        </div>
        <div className="px-4 py-3 text-[14px]/[18px] text-[#667085] font-hnd">
          No next of kin details provided.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[19px] rounded-3xl border border-[#EAECF0] pb-4">
      <div className="bg-[#EFEFEF59] h-[58px] gap-2 border-b py-[19px] px-4">
        <h3 className="text-[16px]/[20px] font-hnd font-bold text-[#5F656B] tracking-normal">
          Next of Kin
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4 px-4">
        <div className="flex flex-col">
          <p className="text-[#515151] font-hnd text-[14px]/[18px] tracking-normal">
            {name}
          </p>
          {relationship && (
            <p className="text-[#667085] font-hnd text-[13px]/[18px] tracking-normal">
              {relationship}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <p className="font-medium text-[16px]/[20px] text-[#3D4449] tracking-normal">
            {phone}
          </p>
          <p className="text-[#515151] font-hnd text-[14px]/[18px] tracking-normal">
            {address}
          </p>
        </div>
      </div>
    </div>
  );
}
