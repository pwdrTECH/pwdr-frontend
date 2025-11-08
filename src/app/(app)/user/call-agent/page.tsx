"use client"

import { AISummary } from "./_components/AISummary"
import { CallPanel } from "./_components/CallPanel"
import { ClaimsInfo } from "./_components/ClaimsInfo"
import { QueueColumn } from "./_components/Queue"
import { TranscriptBox } from "./_components/Transcript"
import { CallAgentProvider, useCallAgent } from "./_state"

export default function CallAgentPage() {
  return (
    <CallAgentProvider>
      <CallAgentContent />
    </CallAgentProvider>
  )
}

function CallAgentContent() {
  const { state } = useCallAgent()

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[284px_1fr_360px]">
      <QueueColumn />
      <section className="flex flex-col gap-4">
        <CallPanel />
        {!state.callId ? null : <TranscriptBox />}
      </section>
      {!state.callId ? null : (
        <aside className="flex flex-col gap-4">
          <ClaimsInfo />
          <AISummary />
        </aside>
      )}
    </div>
  )
}
