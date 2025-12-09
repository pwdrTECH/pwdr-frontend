"use client"

import * as React from "react"

export type CallStatus =
  | "idle"
  | "ringing"
  | "active"
  | "transferring"
  | "ended"

export type TranscriptLine = {
  id: string
  who: "ai" | "caller"
  text: string
  at: number
}

export type QueueItem = {
  id: string
  hospital: string
  by: string
  stamp: string
  status: "Ongoing" | "Transferred" | "Ended"
}

type State = {
  callId: string | null
  status: CallStatus
  seconds: number
  transcript: TranscriptLine[]
  queue: QueueItem[]
}

type Action =
  | { type: "SET_QUEUE"; payload: QueueItem[] }
  | { type: "SELECT_CALL"; id: string }
  | { type: "SET_STATUS"; status: CallStatus }
  | { type: "TICK" }
  | { type: "PUSH_LINE"; line: TranscriptLine }
  | { type: "RESET_CALL" }

const initialState: State = {
  callId: null,
  status: "idle",
  seconds: 0,
  transcript: [],
  queue: [],
}

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const WS_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_CALL_WS_BASE) ||
  "wss://powder-va.onrender.com"

const ACTIVE_CALLS_WS = `${WS_BASE}/active-calls`

// -----------------------------------------------------------------------------
// Reducer
// -----------------------------------------------------------------------------

function callAgentReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_QUEUE":
      return { ...state, queue: action.payload }

    case "SELECT_CALL":
      return {
        ...state,
        callId: action.id,
        // don't force status here; let actions / WS control it
        seconds: 0,
        transcript: [],
      }

    case "SET_STATUS":
      return { ...state, status: action.status }

    case "TICK":
      if (state.status !== "active") return state
      return { ...state, seconds: state.seconds + 1 }

    case "PUSH_LINE":
      return {
        ...state,
        transcript: [...state.transcript, action.line],
      }

    case "RESET_CALL":
      return {
        ...state,
        callId: null,
        status: "idle",
        seconds: 0,
        transcript: [],
      }

    default:
      return state
  }
}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

type CallAgentContextValue = {
  state: State
  selectCall: (id: string) => void
  answer: () => void
  end: () => void
  transfer: (agentId: string) => void
  schedule: (whenIso: string) => void
}

const CallAgentContext = React.createContext<CallAgentContextValue | undefined>(
  undefined
)

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

export function CallAgentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(callAgentReducer, initialState)

  // used to compute "at" timestamps for transcript lines
  const callStartRef = React.useRef<number | null>(null)

  // ---------------------------------------------------------------------------
  // ACTIVE CALLS QUEUE SOCKET
  // ---------------------------------------------------------------------------

  React.useEffect(() => {
    let ws: WebSocket | null = null
    let stopped = false
    const retryDelay = 2000

    const connect = () => {
      if (stopped) return

      try {
        ws = new WebSocket(ACTIVE_CALLS_WS)
      } catch (e) {
        console.error("[CallAgent] Failed to create ACTIVE_CALLS WebSocket", e)
        setTimeout(connect, retryDelay)
        return
      }

      ws.onopen = () => {
        console.info("[CallAgent] ACTIVE_CALLS_WS connected")
      }

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          let callsArray: any[] = []

          if (
            payload?.event === "active_calls" &&
            Array.isArray(payload.data)
          ) {
            callsArray = payload.data
          } else if (Array.isArray(payload)) {
            callsArray = payload
          } else if (Array.isArray(payload.calls)) {
            callsArray = payload.calls
          } else {
            console.warn(
              "[CallAgent] Unknown active-calls payload shape:",
              payload
            )
          }

          const mapped: QueueItem[] = callsArray.map((c, idx) => ({
            id: String(c.call_control_id ?? c.id ?? idx),

            // For now show phone_number as "hospital" label in the UI
            hospital: c.phone_number ?? "Unknown caller",

            by: "Powder AI",

            // If backend later sends a timestamp (e.g. c.created_at),
            // we can use that. For now we use "now" so it's not empty.
            stamp: c.created_at ?? new Date().toLocaleString(),

            // This event is literally "active_calls", so treat as ongoing.
            status: "Ongoing",
          }))

          console.info("[CallAgent] active queue size:", mapped.length)
          dispatch({ type: "SET_QUEUE", payload: mapped })
        } catch (err) {
          console.error(
            "[CallAgent] Failed to parse active calls message",
            err,
            event.data
          )
        }
      }

      ws.onerror = (err) => {
        console.error("[CallAgent] Active calls WebSocket error", err)
      }

      ws.onclose = (ev) => {
        console.warn(
          "[CallAgent] ACTIVE_CALLS_WS closed",
          ev.code,
          ev.reason || "(no reason)"
        )
        if (!stopped && ev.code !== 1000) {
          setTimeout(connect, retryDelay)
        }
      }
    }

    connect()

    return () => {
      stopped = true
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        ws.close(1000, "component unmount")
      }
    }
  }, [])

  // ---------------------------------------------------------------------------
  // PER-CALL TRANSCRIPT SOCKET
  // ---------------------------------------------------------------------------

  React.useEffect(() => {
    if (!state.callId) return

    let ws: WebSocket | null = null

    try {
      ws = new WebSocket(`${WS_BASE}/transcripts/${state.callId}`)
    } catch (e) {
      console.error("[CallAgent] Failed to create CALL WebSocket", e)
      return
    }

    ws.onopen = () => {
      callStartRef.current = Date.now()
      console.info("[CallAgent] Call WS connected for", state.callId)
    }

    ws.onmessage = (event) => {
      try {
        // Uncomment this if you want to inspect raw messages:
        // console.log("[CallAgent] RAW transcript message:", event.data)

        const payload = JSON.parse(event.data)

        // status updates
        if (payload.type === "status" && payload.status) {
          const s = (payload.status as string).toLowerCase()
          if (s === "active" || s === "in_progress") {
            dispatch({ type: "SET_STATUS", status: "active" })
          } else if (s === "ringing") {
            dispatch({ type: "SET_STATUS", status: "ringing" })
          } else if (s === "transferring") {
            dispatch({ type: "SET_STATUS", status: "transferring" })
          } else if (s === "ended" || s === "completed") {
            dispatch({ type: "SET_STATUS", status: "ended" })
          }
        }

        // transcript updates
        if (payload.type === "transcript" && payload.text) {
          let atSeconds = 0
          if (typeof payload.at === "number") {
            atSeconds = payload.at
          } else if (callStartRef.current != null) {
            atSeconds = Math.floor((Date.now() - callStartRef.current) / 1000)
          }

          dispatch({
            type: "PUSH_LINE",
            line: {
              id: payload.id ?? `${Date.now()}-${Math.random()}`,
              who: payload.from === "ai" ? "ai" : "caller",
              text: payload.text,
              at: atSeconds,
            },
          })
        }
      } catch (err) {
        console.error(
          "[CallAgent] Failed to parse call message",
          err,
          event.data
        )
      }
    }

    ws.onerror = (err) => {
      console.error("[CallAgent] Call WebSocket error", err)
    }

    ws.onclose = (ev) => {
      console.warn(
        "[CallAgent] Call WS closed",
        ev.code,
        ev.reason || "(no reason)"
      )
      callStartRef.current = null
    }

    return () => {
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        ws.close(1000, "component unmount")
      }
    }
  }, [state.callId])

  // ---------------------------------------------------------------------------
  // TIMER (MM:SS) – increments when status === "active"
  // ---------------------------------------------------------------------------

  React.useEffect(() => {
    if (state.status !== "active") return

    const id = window.setInterval(() => {
      dispatch({ type: "TICK" })
    }, 1000)

    return () => window.clearInterval(id)
  }, [state.status])

  // ---------------------------------------------------------------------------
  // Actions API
  // ---------------------------------------------------------------------------

  const selectCall = React.useCallback((id: string) => {
    // set current call + reset timer/transcript
    dispatch({ type: "SELECT_CALL", id })
    // treat it as active immediately for UI (since /active-calls are ongoing)
    dispatch({ type: "SET_STATUS", status: "active" })
  }, [])

  const answer = React.useCallback(() => {
    // if you ever have a true "ringing" state, this will move it to active
    dispatch({ type: "SET_STATUS", status: "active" })
  }, [])

  const end = React.useCallback(() => {
    dispatch({ type: "SET_STATUS", status: "ended" })
  }, [])

  const transfer = React.useCallback((agentId: string) => {
    console.log("Transfer to", agentId)
    dispatch({ type: "SET_STATUS", status: "transferring" })
  }, [])

  const schedule = React.useCallback((whenIso: string) => {
    console.log("Schedule call at", whenIso)
  }, [])

  const value = React.useMemo(
    () => ({
      state,
      selectCall,
      answer,
      end,
      transfer,
      schedule,
    }),
    [state, selectCall, answer, end, transfer, schedule]
  )

  return (
    <CallAgentContext.Provider value={value}>
      {children}
    </CallAgentContext.Provider>
  )
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

export function useCallAgent() {
  const ctx = React.useContext(CallAgentContext)
  if (!ctx) {
    throw new Error("useCallAgent must be used within a CallAgentProvider")
  }
  return ctx
}
