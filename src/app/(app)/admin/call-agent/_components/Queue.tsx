"use client";

import {
  EndCallIcon,
  HalfLogoIcon,
  OngoingCallIcon,
  TransferredAltIcon,
} from "@/components/svgs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import * as React from "react";
import { useCallAgent, type QueueItem } from "../_state";

export function QueueColumn() {
  const [tab, setTab] = React.useState<"pending" | "resolved" | "all">(
    "pending",
  );
  const [q, setQ] = React.useState("");
  const { selectCall, state } = useCallAgent();

  const list = React.useMemo(() => {
    const pool = state.queue;

    const filteredByTab =
      tab === "pending"
        ? pool.filter((c) => c.status !== "Ended")
        : tab === "resolved"
          ? pool.filter((c) => c.status === "Ended")
          : pool;

    return filteredByTab.filter((r) =>
      [r.hospital, r.by].join(" ").toLowerCase().includes(q.toLowerCase()),
    );
  }, [tab, q, state.queue]);

  return (
    <section className="flex flex-col gap-[11px]">
      <div className="flex flex-col gap-[12px]">
        <div className="h-[54px]">
          <h2 className="text-[21.33px]/[32px] font-hnd font-bold tracking-normal text-[#101828]">
            Voice Agent Queue
          </h2>
          <p className="text-[14.93px]/[21.33px] font-hnd font-normal tracking-normal text-[#475467]">
            Real time management
          </p>
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <Input
            placeholder="Search call logs"
            className="placeholder-[#66666699] h-[48px] py-[10px] pr-4 pl-9 flex gap-2 rounded-[12px] bg-[#F8F8F8] border border-[#0000000F] shadow-[0px_1px_2px_0px_#1018280D]"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="h-[31px] flex gap-6">
        <Tab active={tab === "pending"} onClick={() => setTab("pending")}>
          Pending
        </Tab>
        <Tab active={tab === "resolved"} onClick={() => setTab("resolved")}>
          Resolved
        </Tab>
        <Tab active={tab === "all"} onClick={() => setTab("all")}>
          All Logs
        </Tab>
      </div>

      <div className="w-[284px] pr-[13px] max-height-[752px] overflow-y-auto flex flex-col gap-[16px]">
        {list.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => selectCall(item.id)}
            className={cn(
              "w-[271px] h-[82px] flex gap-3 py-[18px] px-4 rounded-[12px] border text-left transition",
              state.callId === item.id
                ? "border-[#1671D91A] bg-[#1671D912]"
                : "border-[#EAECF0] bg-[#F9F9F9] hover:bg-[#FFFFFF1A]",
            )}
          >
            <div className="w-[239px] h-[46px] flex flex-col items-center justify-between gap-2">
              <div className="w-full h-[20px] flex justify-between gap-4">
                <div className="font-medium font-hnd text-[14px]/[20px] tracking-normal text-[#344054]">
                  {item.hospital}
                </div>
                <Pill kind={item.status} />
              </div>
              <div className="w-full h-[20px] flex items-start justify-between gap-2 text-[12px] text-[#6B7280]">
                <div className="flex items-center gap-2">
                  <HalfLogoIcon />
                  <span className="font-hnd font-normal text-[12px]/[18px] tracking-normal text-[#344054]">
                    {item.by}
                  </span>
                </div>
                <span className="font-hnd font-normal text-[12px]/[18px] tracking-normal text-[#7D8185]">
                  {item.stamp}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-fit h-[23px] rounded-[6px] flex items-center gap-2 py-[6px] px-2 font-hnd font-medium text-[14px] leading-[100%] align-middle cursor-pointer",
        active
          ? "bg-[#1671D91A] text-[#1671D9] font-medium"
          : "text-[#475467] hover:bg-[#1671D91A] hover:text-[#1671D9] font-normal tracking-normal",
      )}
    >
      {children}
    </button>
  );
}

function Pill({ kind }: { kind: QueueItem["status"] }) {
  const map = {
    Ongoing: {
      bg: "bg-[#CDF2E3]",
      text: "text-[#27CA40]",
      icon: <OngoingCallIcon />,
    },
    Transferred: {
      bg: "bg-[#2773FF1A]",
      text: "text-[#2773FF]",
      icon: <TransferredAltIcon />,
    },
    Ended: {
      bg: "bg-[#F2F4F7]",
      text: "text-[#475467]",
      icon: <EndCallIcon />,
    },
  }[kind];
  return (
    <span
      className={cn(
        "w-fit h-[20px] py-1 px-[6px] flex items-center gap-[3px] rounded-[16px] text-[12px]",
        map.bg,
        map.text,
      )}
    >
      {map.icon}
      <span>{kind}</span>
    </span>
  );
}
