"use client";

import * as React from "react";

export type CallStatus =
  | "idle"
  | "ringing"
  | "active"
  | "transferring"
  | "ended";

export type TranscriptLine = {
  id: string;
  who: "ai" | "caller";
  text: string;
  at: number;
};

export type QueueItem = {
  id: string;
  hospital: string;
  by: string;
  stamp: string;
  status: "Ongoing" | "Transferred" | "Ended";
};

type State = {
  callId: string | null;
  status: CallStatus;
  seconds: number;
  transcript: TranscriptLine[];
  queue: QueueItem[];
};

type Action =
  | { type: "SET_QUEUE"; payload: QueueItem[] }
  | { type: "SELECT_CALL"; id: string }
  | { type: "SET_STATUS"; status: CallStatus }
  | { type: "TICK" }
  | { type: "PUSH_LINE"; line: TranscriptLine }
  | { type: "RESET_CALL" };

const initialState: State = {
  callId: null,
  status: "idle",
  seconds: 0,
  transcript: [],
  queue: [],
};

function callAgentReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_QUEUE":
      return { ...state, queue: action.payload };
    case "SELECT_CALL":
      return {
        ...state,
        callId: action.id,
        status: "ringing",
        seconds: 0,
        transcript: [],
      };
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "TICK":
      if (state.status !== "active") return state;
      return { ...state, seconds: state.seconds + 1 };
    case "PUSH_LINE":
      return {
        ...state,
        transcript: [...state.transcript, action.line],
      };
    case "RESET_CALL":
      return {
        ...state,
        callId: null,
        status: "idle",
        seconds: 0,
        transcript: [],
      };
    default:
      return state;
  }
}

type CallAgentContextValue = {
  state: State;
  selectCall: (id: string) => void;
  answer: () => void;
  end: () => void;
  transfer: (agentId: string) => void;
  schedule: (whenIso: string) => void;
};

const CallAgentContext = React.createContext<CallAgentContextValue | undefined>(
  undefined,
);

const ACTIVE_CALLS_WS = "wss://powder-va.onrender.com/active-calls";

export function CallAgentProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(callAgentReducer, initialState);

  // track per-call start time for transcript "at" fallback
  const callStartRef = React.useRef<number | null>(null);

  /* --------------------- WS: ACTIVE CALLS QUEUE STREAM -------------------- */

  React.useEffect(() => {
    const ws = new WebSocket(ACTIVE_CALLS_WS);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const callsArray: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.calls)
            ? payload.calls
            : [];

        const mapped: QueueItem[] = callsArray.map((c, idx) => ({
          id: String(c.call_control_id ?? c.id ?? idx),
          hospital: c.hospital ?? c.caller_name ?? "Hospital",
          by: c.agent_name ?? "Powder AI",
          stamp: c.started_at ?? new Date().toLocaleString(),
          status:
            (c.status ?? "").toLowerCase() === "active"
              ? "Ongoing"
              : (c.status ?? "").toLowerCase() === "transferred"
                ? "Transferred"
                : "Ended",
        }));

        dispatch({ type: "SET_QUEUE", payload: mapped });
      } catch (err) {
        console.error("Failed to parse active calls message", err);
      }
    };

    ws.onerror = (err) => {
      console.error("Active calls WebSocket error", err);
    };

    return () => {
      ws.close();
    };
  }, []);

  /* -------------------------- WS: SELECTED CALL --------------------------- */

  React.useEffect(() => {
    if (!state.callId) return;

    const ws = new WebSocket(`wss://powder-va.onrender.com/${state.callId}`);

    ws.onopen = () => {
      // set the start time for this call connection
      callStartRef.current = Date.now();
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        // status updates
        if (payload.type === "status" && payload.status) {
          const s = (payload.status as string).toLowerCase();
          if (s === "active" || s === "in_progress") {
            dispatch({ type: "SET_STATUS", status: "active" });
          } else if (s === "ringing") {
            dispatch({ type: "SET_STATUS", status: "ringing" });
          } else if (s === "transferring") {
            dispatch({ type: "SET_STATUS", status: "transferring" });
          } else if (s === "ended" || s === "completed") {
            dispatch({ type: "SET_STATUS", status: "ended" });
          }
        }

        // transcript updates
        if (payload.type === "transcript" && payload.text) {
          let atSeconds = 0;
          if (typeof payload.at === "number") {
            atSeconds = payload.at;
          } else if (callStartRef.current != null) {
            atSeconds = Math.floor((Date.now() - callStartRef.current) / 1000);
          }

          dispatch({
            type: "PUSH_LINE",
            line: {
              id: payload.id ?? `${Date.now()}-${Math.random()}`,
              who: payload.from === "ai" ? "ai" : "caller",
              text: payload.text,
              at: atSeconds,
            },
          });
        }
      } catch (err) {
        console.error("Failed to parse call message", err);
      }
    };

    ws.onerror = (err) => {
      console.error("Call WebSocket error", err);
    };

    ws.onclose = () => {
      // optionally reset start time here
      callStartRef.current = null;
    };

    return () => {
      ws.close();
    };
  }, [state.callId]);

  /* ----------------------------- TIMER (MM:SS) ---------------------------- */

  React.useEffect(() => {
    if (state.status !== "active") return;

    const id = window.setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000);

    return () => window.clearInterval(id);
  }, [state.status]);

  /* ------------------------------ ACTIONS API ----------------------------- */

  const selectCall = React.useCallback((id: string) => {
    dispatch({ type: "SELECT_CALL", id });
  }, []);

  const answer = React.useCallback(() => {
    dispatch({ type: "SET_STATUS", status: "active" });
  }, []);

  const end = React.useCallback(() => {
    dispatch({ type: "SET_STATUS", status: "ended" });
  }, []);

  const transfer = React.useCallback((agentId: string) => {
    console.log("Transfer to", agentId);
    dispatch({ type: "SET_STATUS", status: "transferring" });
  }, []);

  const schedule = React.useCallback((whenIso: string) => {
    console.log("Schedule call at", whenIso);
  }, []);

  const value = React.useMemo(
    () => ({
      state,
      selectCall,
      answer,
      end,
      transfer,
      schedule,
    }),
    [state, selectCall, answer, end, transfer, schedule],
  );

  return (
    <CallAgentContext.Provider value={value}>
      {children}
    </CallAgentContext.Provider>
  );
}

export function useCallAgent() {
  const ctx = React.useContext(CallAgentContext);
  if (!ctx) {
    throw new Error("useCallAgent must be used within a CallAgentProvider");
  }
  return ctx;
}
