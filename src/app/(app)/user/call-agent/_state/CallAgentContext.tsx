export type CallStatus =
  | "idle"
  | "ringing"
  | "active"
  | "transferring"
  | "ended"

export type QueueItem = {
  id: string
  hospital: string
  by: string
  stamp: string
  status: "Ongoing" | "Transferred" | "Ended"
}

export type TranscriptTurn = {
  id: string
  at: number // seconds
  who: "ai" | "caller"
  text: string
}
