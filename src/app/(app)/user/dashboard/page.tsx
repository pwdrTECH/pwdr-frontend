"use client"

import {
  ArrowRight,
  ArrowUp,
  BlueDot,
  CircledApprovedIcon,
  CircledCancelIcon,
  FirstAidBox,
  HealthRecords,
  TimeIcon,
  WarningIcon,
} from "@/components/svgs"
import Link from "next/link"
import { ChartCard } from "../_components/chart"
import { KpiCard } from "../_components/KpiCard"
import { SegmentedStatsCard } from "../_components/SegmentedStatsCard"

export default function DashboardPage() {
  return (
    <div className="w-full flex flex-col gap-[12px]">
      <div className="bg-[#FAFAFA] flex justify-between py-1 pr-1 pl-3 rounded-[10px] border border-[#0000001A]">
        <div className="h-5 flex gap-2 items-center">
          <BlueDot />{" "}
          <span className="text-[#101928] font-medium font-hnd text-[14px]/[20px] tracking-normal">
            Looks like you&apos;ve not finished your onboarding. Setup{" "}
            <span className="font-bold">HMOs</span>, Patients then start
            requesting <span className="font-bold">PA</span> Codes so you can
            start analyzing your data.
          </span>
        </div>
        <Link
          href="#"
          className="w-fit h-[28px] flex justify-between items-center gap-1 border border-[#0000001A] rounded-[8px] text-[#101928] font-hnd font-medium text-[14px]/[20px] tracking-normal bg-[#FAFAFA] py-1 pr-2 pl-[10px]"
        >
          Finish Setup <ArrowRight />
        </Link>
      </div>
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <KpiCard title="Total Claims" value="35,985" icon={<FirstAidBox />} />
        <KpiCard title="HMOs" value="17" icon={<HealthRecords />} />
        <KpiCard
          title="Average Response Time"
          value="2.5 mins"
          sub={
            <span className="h-5 w-fit rounded-[14.12px] bg-[#027FA31A] text-[12px] text-[#027FA3] px-[5.65px] flex items-center gap-2 font-hnd text-center font-medium tracking-[-0.005em] align-middle">
              <ArrowUp className="h-[18px] w-[18px]" /> 3%
            </span>
          }
          icon={<TimeIcon />}
        />
        <KpiCard
          title="Approved Claims"
          value="29,761"
          icon={<CircledApprovedIcon />}
        />
        <KpiCard
          title="Queried Claims"
          value="5,429"
          icon={<CircledCancelIcon />}
        />
        <KpiCard
          title="Unattended Claims"
          value="109"
          sub={
            <span className="w-fit font-hnd font-medium bg-[#FF60581A] rounded-[14.12px] flex gap-[12px] px-[6px] h-[20px] text-[#FF6058] text-[14px]/[145%] tracking-[-0.005em] align-middle">
              18 overdue
            </span>
          }
          icon={<WarningIcon />}
        />
      </section>
      {/* Enrollees + Schemes */}
      <section className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <SegmentedStatsCard
          title="Total numbers of enrollees"
          total="375,633"
          segments={[
            { bg: "#B6B0FB", color: "#978FED", width: "34%" },
            { bg: "#BBEEED", color: "#A4DDDC", width: "28%" },
            { bg: "#95A1FC", color: "#697BE9", width: "20%" },
            { bg: "#FBDE9D", color: "#F6CF7D", width: "18%" },
          ]}
          items={[
            { dot: "#B6B0FB", label: "Individual", value: "110,090" },
            { dot: "#BBEEED", label: "Family", value: "90,901" },
            { dot: "#95A1FC", label: "Corporate", value: "21,700" },
            { dot: "#FBDE9D", label: "Customized", value: "6,112" },
          ]}
        />
        <SegmentedStatsCard
          title="Schemes"
          total=""
          segments={[
            { bg: "#B6B0FB", color: "#978FED", width: "25%" },
            { bg: "#BBEEED", color: "#A4DDDC", width: "25%" },
            { bg: "#FBDE9D", color: "#F6CF7D", width: "25%" },
            { bg: "#95A1FC", color: "#697BE9", width: "25%" },
          ]}
          items={[
            { dot: "#B6B0FB", label: "NHIA", value: "900" },
            { dot: "#BBEEED", label: "PHIS", value: "602" },
            { dot: "#FBDE9D", label: "NYSC", value: "221" },
            { dot: "#95A1FC", label: "TSHIP", value: "67" },
          ]}
        />
      </section>
      <ChartCard />
    </div>
  )
}
