"use client"

import { EventEmitter } from "events"
import type { TranscriptTurn } from "../_state/CallAgentContext"
import { TelnyxBackend } from "./TelynxBackend"

export type CallBackendEvents = {
  "call:ringing": { callId: string }
  "call:answered": { callId: string }
  "call:ended": { callId: string; reason?: string }
  "call:transcript": TranscriptTurn
  "call:timer": { seconds: number }
  "call:transferring": { callId: string; agentId: string }
  "call:scheduled": { callId: string; whenISO: string } // <-- added
}

export type CallBackend = {
  on<E extends keyof CallBackendEvents>(
    evt: E,
    cb: (payload: CallBackendEvents[E]) => void
  ): void
  off<E extends keyof CallBackendEvents>(
    evt: E,
    cb: (payload: CallBackendEvents[E]) => void
  ): void

  // Actions
  answer(callId: string): Promise<void>
  end(callId: string): Promise<void>
  transfer(callId: string, agentId: string): Promise<void>
  schedule(callId: string, whenISO: string): Promise<void>

  // optional helper used by your queue mock
  ring?(callId: string): void
}

/**
 * Mock backend: simulates a call + transcript.
 * Replace with real provider implementation respecting CallBackend.
 */
export class MockBackend implements CallBackend {
  private bus = new EventEmitter()
  private t?: ReturnType<typeof setInterval>
  private s = 0

  // typed wrappers around EventEmitter
  on = <E extends keyof CallBackendEvents>(
    e: E,
    cb: (payload: CallBackendEvents[E]) => void
  ) => {
    this.bus.on(e as string, cb as any)
  }

  off = <E extends keyof CallBackendEvents>(
    e: E,
    cb: (payload: CallBackendEvents[E]) => void
  ) => {
    this.bus.off(e as string, cb as any)
  }

  ring(callId: string) {
    this.bus.emit("call:ringing", { callId })
  }

  answer = async (callId: string) => {
    this.bus.emit("call:answered", { callId })
    // timer
    this.clear()
    this.t = setInterval(() => {
      this.s += 1
      this.bus.emit("call:timer", { seconds: this.s })
      if (this.s % 8 === 0) {
        const msg: TranscriptTurn = {
          id: crypto.randomUUID(),
          at: this.s,
          who: "ai",
          text: "I am verifying your plan details, one moment please.",
        }
        this.bus.emit("call:transcript", msg)
      }
    }, 1000)
  }

  end = async (callId: string) => {
    this.clear()
    this.bus.emit("call:ended", { callId, reason: "agent_ended" })
  }

  transfer = async (callId: string, agentId: string) => {
    this.bus.emit("call:transferring", { callId, agentId })
    this.bus.emit("call:transcript", {
      id: crypto.randomUUID(),
      at: this.s,
      who: "ai",
      text: "Transferring you to a specialist…",
    })
    await new Promise((r) => setTimeout(r, 900))
    this.bus.emit("call:answered", { callId })
  }

  schedule = async (callId: string, whenISO: string) => {
    // 1) Optional transcript feedback (keep your current UX)
    this.bus.emit("call:transcript", {
      id: crypto.randomUUID(),
      at: this.s,
      who: "ai",
      text: `Follow-up scheduled for ${new Date(whenISO).toLocaleString()}`,
    })
    // 2) Dedicated scheduled event (typed)
    this.bus.emit("call:scheduled", { callId, whenISO })
  }

  private clear() {
    if (this.t) clearInterval(this.t)
    this.t = undefined
    this.s = 0
  }
}

/** Factory to swap implementations */
export function createBackend(): CallBackend {
  const TOKEN = process.env.NEXT_PUBLIC_TELYNX_TOKEN
  if (TOKEN) {
    return new TelnyxBackend(TOKEN)
  }
  return new MockBackend()
}
