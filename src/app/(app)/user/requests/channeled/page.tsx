"use client"

import React, { useState } from "react"
import { RequestDetails } from "./_components/request-details"
import { RequestList } from "./_components/request-list"
import type { RequestItem } from "./_components/types"

export default function ChanneledRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null
  )

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      <RequestList
        onSelectRequest={(r) => setSelectedRequest(r)}
        selectedRequestId={selectedRequest?.id}
      />
      <RequestDetails
        requestId={selectedRequest?.id}
        selected={selectedRequest}
      />
    </div>
  )
}
