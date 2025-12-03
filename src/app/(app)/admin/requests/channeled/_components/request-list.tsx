"use client";

import { GmailIcon, WhatsAppIcon } from "@/components/svgs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import * as React from "react";
import type { RequestItem } from "./types";
import { STATUS_BADGE, STATUS_LABEL } from "./types";
import { useRequests } from "@/lib/api/requests";

interface RequestListProps {
  onSelectRequest?: (request: RequestItem) => void;
  selectedRequestId?: string;
}

export function RequestList({
  onSelectRequest,
  selectedRequestId,
}: RequestListProps) {
  const [activeTab, setActiveTab] = React.useState<
    "all" | "unread" | "overdue" | "resolved"
  >("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [channel, setChannel] = React.useState<
    "all" | "email" | "whatsapp" | "chat"
  >("all");

  const { data, isLoading, error } = useRequests({
    search: searchTerm,
    channel,
    status: activeTab,
    page: 1,
    limit: 20,
  });
  const baseRequests: RequestItem[] = React.useMemo(() => {
    const apiItems = data?.data ?? [];
    return apiItems.map((r: any) => {
      const provider: RequestItem["provider"] =
        (r.channel ?? "").toLowerCase() === "whatsapp"
          ? "whatsapp"
          : (r.channel ?? "").toLowerCase() === "chat"
            ? "chat"
            : "email"; // fallback

      const status: RequestItem["status"] =
        Number(r.processed) === 1 ? "read" : "new";

      const requestStatus: RequestItem["requestStatus"] =
        (r.status?.toLowerCase() as RequestItem["requestStatus"]) || "pending";

      const name = `${r.enrolee_first_name ?? ""} ${
        r.enrolee_surname ?? ""
      }`.trim();

      const organization = r.provider_name || r.plan_name || r.channel || "—";
      const timestamp = r.encounter_date || "";

      return {
        id: String(r.id),
        name: name || "Unknown Enrollee",
        organization,
        provider,
        status,
        timestamp,
        requestStatus,
      };
    });
  }, [data]);
  const filteredRequests = React.useMemo(() => {
    let filtered = baseRequests;

    // Tab filters are purely client-side for now
    if (activeTab === "unread") {
      filtered = filtered.filter((r) => r.status === "new");
    }
    if (activeTab === "overdue") {
      filtered = filtered.filter((r) => r.requestStatus === "overdue");
    }
    if (activeTab === "resolved") {
      filtered = filtered.filter((r) => r.requestStatus === "resolved");
    }

    // Channel filter is also client-side for now (all API items are "email" in UI)
    if (channel !== "all") {
      filtered = filtered.filter((r) => r.provider === channel);
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.organization.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [activeTab, channel, searchTerm, baseRequests]);

  return (
    <div className="w-[284px] bg-white h-screen overflow-y-auto flex flex-col gap-3">
      {/* Search & Filter */}
      <div className="w-full p-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <Input
            placeholder="Search Interactions"
            className="placeholder-[#66666699] h-[48px] py-[10px] pr-4 pl-9 rounded-[12px] bg-[#F8F8F8] border border-[#0000000F] shadow-[0px_1px_2px_0px_#1018280D]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <Select value={channel} onValueChange={(v) => setChannel(v as any)}>
            <SelectTrigger className="data-[size=default]:h-[44px] w-full py-3 px-[14px] border border-[#D0D5DD] rounded-[12px] shadow-none">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <p className="text-xs text-[#98A2B3]">Loading requests…</p>
        )}
        {error && !isLoading && (
          <p className="text-xs text-red-600">Failed to load requests</p>
        )}
      </div>

      {/* Tabs */}
      <div className="h-[31px] px-4 pb-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <TabsList className="gap-6 bg-transparent p-0 h-auto border-0 w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Items */}
      <div className="w-full overflow-y-auto flex flex-col gap-[16px]">
        {filteredRequests.length === 0 && !isLoading && (
          <p className="px-4 pb-4 text-xs text-[#98A2B3]">
            No requests found for current filters.
          </p>
        )}

        {filteredRequests.map((request) => (
          <button
            key={request.id}
            type="button"
            onClick={() => onSelectRequest?.(request)}
            className={cn(
              "flex gap-3 pl-2 pr-4 py-[18px] rounded-[16px] border text-left transition cursor-pointer",
              selectedRequestId === request.id
                ? "border-[#1671D91A] bg-[#1671D912]"
                : "border-[#EAECF0] bg-[#F9F9F9] hover:bg-[#F9F9F9]/50",
            )}
          >
            <div className="h-[64px] w-[252px] flex items-start gap-[15px]">
              <div className="w-8 h-8 rounded-full flex items-center text-primary justify-center shrink-0 font-semibold capitalize text-xl">
                {/* All are 'email' for now, to match UI */}
                {request.provider === "whatsapp" ? (
                  <WhatsAppIcon className="w-4 h-4" />
                ) : request.provider === "email" ? (
                  <GmailIcon className="w-4 h-4" />
                ) : (
                  request.provider.charAt(0)
                )}
              </div>

              <div className="w-[220px] h-[64px] flex flex-col gap-2">
                <div className="w-full flex justify-between gap-2">
                  <span className="flex flex-col">
                    <h3 className="font-hnd font-medium text-[14px]/[20px] text-[#293347] truncate">
                      {request.name}
                    </h3>
                    <p className="max-w-[136px] text-[12px]/[18px] text-[#979797] truncate">
                      {request.organization}
                    </p>
                  </span>

                  <Badge
                    className={cn(
                      "w-fit border-0 flex-shrink-0 h-5 gap-3 rounded-[14.12px] px-1.5",
                      STATUS_BADGE[request.requestStatus],
                    )}
                  >
                    {STATUS_LABEL[request.requestStatus]}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      "text-[12px]/[18px]",
                      request.status === "new"
                        ? "text-primary"
                        : "text-[#5F6368]",
                    )}
                  >
                    {request.status === "new" ? "New" : "Read"}
                  </span>
                  <span className="font-hnd text-[12px]/[18px] text-[#979797] ml-auto">
                    {request.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
