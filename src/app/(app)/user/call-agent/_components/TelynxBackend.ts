"use client"

import type { CallBackend, CallBackendEvents } from "./CallBackend"

export class TelnyxBackend implements CallBackend {
  private socket: WebSocket
  // Note: using `any` inside the Set avoids the intersection issue at the storage layer,
  // while the public `on/off` methods remain strongly typed.
  private listeners = new Map<
    keyof CallBackendEvents,
    Set<(payload: any) => void>
  >()

  constructor(token: string) {
    this.socket = new WebSocket(
      "wss://api.telynx.com/your-endpoint?token=" + token
    )

    this.socket.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        this.handleMsg(msg)
      } catch (e) {
        console.error("Telnyx message parse error", e)
      }
    }
    this.socket.onopen = () => {
      console.log("Telnyx socket connected")
    }
    this.socket.onerror = (err) => {
      console.error("Telnyx socket error", err)
    }
  }

  private handleMsg(msg: any) {
    const { event, payload } = msg as {
      event: keyof CallBackendEvents
      payload: unknown
    }
    const set = this.listeners.get(event)
    if (set) for (const cb of set) cb(payload)
  }

  on<E extends keyof CallBackendEvents>(
    evt: E,
    cb: (payload: CallBackendEvents[E]) => void
  ) {
    if (!this.listeners.has(evt)) this.listeners.set(evt, new Set())
    this.listeners.get(evt)!.add(cb as any)
  }

  off<E extends keyof CallBackendEvents>(
    evt: E,
    cb: (payload: CallBackendEvents[E]) => void
  ) {
    this.listeners.get(evt)?.delete(cb as any)
  }

  async answer(callId: string): Promise<void> {
    this.socket.send(JSON.stringify({ action: "answer", callId }))
  }
  async end(callId: string): Promise<void> {
    this.socket.send(JSON.stringify({ action: "end", callId }))
  }
  async transfer(callId: string, agentId: string): Promise<void> {
    this.socket.send(JSON.stringify({ action: "transfer", callId, agentId }))
  }
  async schedule(callId: string, whenISO: string): Promise<void> {
    this.socket.send(JSON.stringify({ action: "schedule", callId, whenISO }))
  }
}
