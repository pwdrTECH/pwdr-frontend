"use client"

import { useState } from "react"
import { ChanneledRequestDetails } from "./_components/request-details"
import { ChanneledRequestList } from "./_components/request-list"
import type { RequestItem } from "./_components/types"

export default function ChanneledRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null
  )

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      {/* Left: list */}
      <ChanneledRequestList
        onSelectRequest={(r) => setSelectedRequest(r)}
        selectedRequestId={selectedRequest?.id}
      />

      {/* Right: details or empty state */}
      {selectedRequest ? (
        <ChanneledRequestDetails
          requestId={selectedRequest.id}
          selected={selectedRequest}
        />
      ) : (
        <div className="flex-1 p-6 rounded-3xl border border-[#E4E7EC] bg-white flex items-center justify-center text-center">
          <div className="max-w-sm space-y-2">
            <p className="text-[18px]/[24px] font-hnd font-semibold text-[#101828]">
              No request selected
            </p>
            <p className="text-[14px]/[20px] text-[#667085] font-hnd">
              Select a request on the left to view its details, activity logs,
              and treatment items.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
