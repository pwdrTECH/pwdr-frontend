// lib/channels.tsx
"use client"

import * as React from "react"
import type { ComponentType } from "react"
import { Globe } from "lucide-react"
import type { SelectOption } from "@/components/form"
import { GmailIcon, SMSIcon, WhatsAppIcon } from "@/components/svgs"

// ids & type
export const CHANNELS = ["WhatsApp", "Email", "SMS", "Web Portal"] as const
export type Channel = (typeof CHANNELS)[number]

// Accept both Lucide icons and custom SVG components
type IconComp = ComponentType<{ className?: string }>

type ChannelMeta = {
  icon: IconComp
  /** If provided, renders the icon inside a circular badge with this bg color. */
  badgeBg?: string
}

// Pick badge backgrounds only for mono icons;
// your custom SVGs are already colored, so no badge needed.
export const CHANNEL_META: Record<Channel, ChannelMeta> = {
  WhatsApp: { icon: WhatsAppIcon }, // colored svg
  Email: { icon: GmailIcon }, // colored svg
  SMS: { icon: SMSIcon }, // colored svg
  "Web Portal": { icon: Globe, badgeBg: "#64748B" }, // lucide mono + badge
}

function IconBadge({ Icon, badgeBg }: { Icon: IconComp; badgeBg?: string }) {
  if (!badgeBg) {
    // Render icon as-is (already colored)
    return <Icon className="h-4 w-4" />
  }
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full"
      style={{ backgroundColor: badgeBg }}
      aria-hidden
    >
      <Icon className="h-3.5 w-3.5 text-white" />
    </span>
  )
}

export function ChannelLabel({ channel }: { channel: Channel }) {
  const { icon: Icon, badgeBg } = CHANNEL_META[channel]
  return (
    <span className="inline-flex items-center gap-2">
      <IconBadge Icon={Icon} badgeBg={badgeBg} />
      <span>{channel}</span>
    </span>
  )
}

// SelectField-ready options with icon + name label
export const CHANNEL_OPTS: ReadonlyArray<SelectOption> = CHANNELS.map((c) => ({
  value: c,
  label: <ChannelLabel channel={c} />,
}))
