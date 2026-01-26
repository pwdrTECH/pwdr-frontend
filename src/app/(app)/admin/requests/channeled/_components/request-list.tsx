"use client"

import { GmailIcon, WhatsAppIcon } from "@/components/svgs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChannelsRequests } from "@/lib/api/requests"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import { Search } from "lucide-react"
import * as React from "react"
import type { RequestItem } from "./types"
/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface RequestListProps {
  onSelectRequest?: (request: RequestItem) => void
  selectedRequestId?: string
}

/* -------------------------------------------------------------------------- */
/*                                 Helpers                                    */
/* -------------------------------------------------------------------------- */

function lower(x: any) {
  return String(x ?? "")
    .trim()
    .toLowerCase()
}

function pickStr(...vals: any[]) {
  for (const v of vals) {
    const s = String(v ?? "").trim()
    if (s) return s
  }
  return ""
}

function formatTimestamp(input: any): string {
  if (input == null) return ""

  // unix seconds (e.g. 1697103120)
  const n = Number(input)
  const d = Number.isFinite(n) && n > 0 ? dayjs.unix(n) : dayjs(input)

  if (!d.isValid()) return ""

  // "12/10/23 · 9:32AM"
  return `${d.format("DD/MM/YY")} · ${d.format("h:mma").toUpperCase()}`
}

function mapChannelsApiToItem(r: any): RequestItem {
  const ch = lower(r?.channel) || "whatsapp"
  const provider: RequestItem["provider"] =
    ch === "email" ? "email" : ch === "chat" ? "chat" : "whatsapp"

  // ✅ 0 = new, 1 = seen
  const status: RequestItem["status"] =
    r?.read_status != null
      ? Number(r.read_status) === 0
        ? "new"
        : "read"
      : "new"

  const raw = lower(r?.status)
  const requestStatus: RequestItem["requestStatus"] =
    raw === "queried"
      ? "overdue"
      : raw === "processed" || raw === "approved"
        ? "resolved"
        : raw === "completed"
          ? "completed"
          : "pending"

  const name =
    pickStr(
      r?.provider_name,
      r?.organisation,
      r?.organization,
      r?.company,
      r?.provider,
    ) || "—"

  const phone = pickStr(
    r?.provider_phone,
    r?.hospital_phone,
    r?.phone,
    r?.enrolee_phone,
    r?.enrollee_phone,
  )

  const organization = phone || "—"

  const timestamp =
    pickStr(
      formatTimestamp(r?.date_created),
      formatTimestamp(r?.created_at),
      formatTimestamp(r?.timestamp),
      formatTimestamp(r?.encounter_date),
    ) || ""

  return {
    id: String(r?.id ?? r?.claim_id ?? r?.tracking_number ?? ""),
    name,
    organization,
    provider,
    status,
    timestamp,
    requestStatus,
  }
}

/**
 * Handles common shapes:
 * A) payload: { status, data: [...] }
 * B) axios-like: { data: { status, data: [...] } }
 */
function extractRows(result: any): any[] {
  if (!result) return []
  if (Array.isArray(result?.data)) return result.data
  if (Array.isArray(result?.data?.data)) return result.data.data
  return []
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export function ChanneledRequestList({
  onSelectRequest,
  selectedRequestId,
}: RequestListProps) {
  // New UI tabs: Pending | All Logs | Resolved
  const [activeTab, setActiveTab] = React.useState<
    "pending" | "all" | "resolved"
  >("pending")

  const [searchTerm, setSearchTerm] = React.useState("")
  const [channel, setChannel] = React.useState<
    "all" | "email" | "whatsapp" | "chat"
  >("all")

  const page = 1
  const limit = 20

  const channelsQuery = useChannelsRequests({
    page,
    limit,
    hospital_id: "",
    enrolee_id: "",
  })

  const isLoading = channelsQuery.isLoading
  const error = channelsQuery.error

  const baseRequests: RequestItem[] = React.useMemo(() => {
    const rows = extractRows(channelsQuery.data)
    return rows.map((r: any) => mapChannelsApiToItem(r))
  }, [channelsQuery.data])

  const filteredRequests = React.useMemo(() => {
    let list = baseRequests
    console.log(list, "list")
    // Tabs
    if (activeTab === "pending") {
      list = list.filter(
        (r) => r.requestStatus === "pending" || r.requestStatus === "overdue",
      )
    }
    if (activeTab === "resolved") {
      list = list.filter(
        (r) =>
          r.requestStatus === "resolved" || r.requestStatus === "completed",
      )
    }

    // Channel filter
    if (channel !== "all") list = list.filter((r) => r.provider === channel)

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.organization.toLowerCase().includes(q) ||
          r.timestamp.toLowerCase().includes(q),
      )
    }

    return list
  }, [activeTab, channel, searchTerm, baseRequests])

  return (
    <div className="w-[284px] bg-white h-screen overflow-y-auto flex flex-col">
      {/* Search + Select */}
      <div className="w-full p-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <Input
            placeholder="Search Message"
            className="placeholder-[#667085] h-[44px] py-3 pr-4 pl-9 rounded-[12px] bg-white border border-[#E4E7EC] shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={channel} onValueChange={(v) => setChannel(v as any)}>
          <SelectTrigger className="data-[size=default]:h-[44px] w-full py-3 px-[14px] border border-[#E4E7EC] rounded-[12px] shadow-none">
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs (NEW UI) */}
      <div className="px-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <TabsList className="gap-6 bg-transparent p-0 h-auto border-0 w-full justify-start">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="all">All Logs</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* List */}
      <div className="w-full py-4 flex flex-col gap-3">
        {isLoading ? (
          <p className="text-xs text-[#98A2B3]">Loading requests…</p>
        ) : error && !isLoading ? (
          <p className="text-xs text-red-600">Failed to load requests</p>
        ) : filteredRequests.length === 0 && !isLoading ? (
          <p className="text-xs text-[#98A2B3]">No requests found.</p>
        ) : null}

        {filteredRequests.map((request) => {
          return (
            <button
              key={request.id}
              type="button"
              onClick={() => onSelectRequest?.(request)}
              className={cn(
                "w-full rounded-[14px] border p-3 text-left transition",
                selectedRequestId === request.id
                  ? "border-[#B2DDFF] bg-[#EDF5FF]"
                  : request.status === "new"
                    ? "bg-[#F9F9F9]"
                    : "border-[#E4E7EC] bg-white hover:bg-[#F9FAFB]",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 rounded-full flex items-center justify-center shrink-0">
                  {request.provider === "whatsapp" ? (
                    <WhatsAppIcon className="w-4 h-4" />
                  ) : request.provider === "email" ? (
                    <GmailIcon className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-semibold">
                      {request.provider.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col items-start justify-between gap-2">
                    <div className="w-full flex justify-between gap-1">
                      <p className="flex-1 text-[14px]/[20px] font-hnd font-medium text-[#344054] truncate">
                        {request.name}
                      </p>
                      {request.status === "new" && (
                        <Badge className="bg-transparent text-[#1671D9] font-bold border-0 rounded-full px-2 py-0.5">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="w-full flex justify-between gap-4">
                      <p className="flex-1 font-inter font-normal text-[12px]/[18px] text-[#7D8185] truncate">
                        {request.organization}
                      </p>

                      {!!request.timestamp && (
                        <p className="font-normal font-hnd text-[12px]/[18px] text-[#7D8185] tracking-normal whitespace-nowrap">
                          {request.timestamp}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
