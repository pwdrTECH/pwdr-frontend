"use client"

import * as React from "react"
import { createBackend, type CallBackend } from "../_components/CallBackend"

export type CallState = {
  callId: string | null
  status: "idle" | "ringing" | "active" | "transferring" | "ended"
  seconds: number
  transcript: Array<{
    id: string
    at: number
    who: "ai" | "caller"
    text: string
  }>
}

type Ctx = {
  backend: CallBackend
  state: CallState
  selectCall: (id: string) => void
  answer: () => void
  end: () => void
  transfer: (agentId: string) => void
  schedule: (when: Date | string) => void
}

const CallAgentContext = React.createContext<Ctx | null>(null)

export const useCallAgent = () => {
  const ctx = React.useContext(CallAgentContext)
  if (!ctx) throw new Error("useCallAgent must be inside <CallAgentProvider>")
  return ctx
}

export function CallAgentProvider({ children }: { children: React.ReactNode }) {
  const backend = React.useMemo<CallBackend>(() => createBackend(), [])
  const [state, setState] = React.useState<CallState>({
    callId: null,
    status: "idle",
    seconds: 0,
    transcript: [],
  })

  React.useEffect(() => {
    const onRing = ({ callId }: any) =>
      setState(() => ({
        callId,
        status: "ringing",
        seconds: 0,
        transcript: [],
      }))

    const onAnswered = ({ callId }: any) =>
      setState((s) => ({
        ...s,
        callId: s.callId ?? callId ?? s.callId,
        status: "active",
      }))

    const onTransferring = () =>
      setState((s) => ({ ...s, status: "transferring" }))
    const onEnded = () => setState((s) => ({ ...s, status: "ended" }))
    const onTick = ({ seconds }: any) => setState((s) => ({ ...s, seconds }))
    const onText = (t: any) =>
      setState((s) => ({ ...s, transcript: [...s.transcript, t] }))
    const onScheduled = ({ whenISO }: any) => {
      console.log("[CallAgent] scheduled:", whenISO)
    }

    backend.on("call:ringing", onRing)
    backend.on("call:answered", onAnswered)
    backend.on("call:transferring", onTransferring as any)
    backend.on("call:ended", onEnded)
    backend.on("call:timer", onTick)
    backend.on("call:transcript", onText)
    backend.on("call:scheduled", onScheduled as any)

    return () => {
      backend.off("call:ringing", onRing)
      backend.off("call:answered", onAnswered)
      backend.off("call:transferring", onTransferring as any)
      backend.off("call:ended", onEnded)
      backend.off("call:timer", onTick)
      backend.off("call:transcript", onText)
      backend.off("call:scheduled", onScheduled as any)
    }
  }, [backend])

  const selectCall = (id: string) => {
    ;(backend as any).ring?.(id)
  }
  const answer = () => state.callId && backend.answer(state.callId)
  const end = () => state.callId && backend.end(state.callId)
  const transfer = (agentId: string) =>
    state.callId && backend.transfer(state.callId, agentId)
  const schedule = (when: Date | string) => {
    if (!state.callId) {
      console.warn("[CallAgent] schedule ignored: no callId")
      return
    }
    const whenISO =
      typeof when === "string" ? when : new Date(when).toISOString()
    backend.schedule(state.callId, whenISO)
  }

  const value: Ctx = {
    backend,
    state,
    selectCall,
    answer,
    end,
    transfer,
    schedule,
  }
  return (
    <CallAgentContext.Provider value={value}>
      {children}
    </CallAgentContext.Provider>
  )
}
