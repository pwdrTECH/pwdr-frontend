"use client";

import type { EnrolleeDetail } from "@/lib/api/beneficiaries";

interface ProfileStatsProps {
  enrollee?: EnrolleeDetail | null;
}

export function ProfileStats({ enrollee }: ProfileStatsProps) {
  // Format premium
  const premium = enrollee?.plan_premium
    ? `₦${Number(enrollee.plan_premium).toLocaleString()}`
    : "—";

  // Placeholder — API doesn't return benefit yet
  const benefit = enrollee?.plan_utilization_threshold
    ? `₦${Number(enrollee.plan_utilization_threshold).toLocaleString()}`
    : "—";

  // Utilization - until backend provides real numbers
  const utilizationRaw = 0;
  const utilization = `${utilizationRaw}%`;

  const utilizationIsGreen = utilizationRaw <= 30;

  // Balance left (placeholder logic)
  const balance =
    enrollee?.plan_premium && utilizationRaw > 0
      ? `₦${(
          Number(enrollee.plan_premium) -
            (utilizationRaw / 100) * Number(enrollee.plan_premium)
        ).toLocaleString()}`
      : "—";

  const stats = [
    { label: "Premium:", value: premium },
    { label: "Benefit", value: benefit },
    {
      label: "Utilization",
      value: utilization,
      isGreen: utilizationIsGreen,
    },
    { label: "Balance left", value: balance },
  ];

  return (
    <div className="w-full max-w-[768px] flex gap-2 rounded-3xl p-2 border border-[#EAECF0]">
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={`stat-${i + 1}`}
            className="flex flex-col gap-3 w-[182px] h-[82px] py-[15px] px-[17px] font-hnd font-normal"
          >
            <p className="text-[#475467] text-[14px]/[20px]">{stat.label}</p>
            <p
              className={`text-[20px]/[20px] font-bold ${
                stat.isGreen ? "text-[#4AA802]" : "text-[#3F3F3F]"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
