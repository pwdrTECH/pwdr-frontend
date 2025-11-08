import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log("Fax Webhook Event:", body)

  // Always respond quickly so Telnyx doesn’t retry
  return NextResponse.json({ received: true }, { status: 200 })
}
