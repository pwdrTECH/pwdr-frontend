"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search } from "lucide-react"
import { TransferredIcon } from "@/components/svgs"
import { AvatarWithStatus } from "./Avatar"

const AGENTS = [
  {
    id: "a1",
    name: "John Alex",
    role: "Customer support",
    state: "Active",
    ai: false,
  },
  {
    id: "a2",
    name: "Jane Lee",
    role: "Customer support",
    state: "Active",
    ai: false,
  },
  {
    id: "a3",
    name: "Ada Obi",
    role: "Customer support",
    state: "Active",
    ai: false,
  },
  { id: "ai", name: "Powder AI", role: "AI Agent", state: "On call", ai: true },
]

export function TransferPopover({
  onTransfer,
}: {
  onTransfer: (agentId: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState("")
  const [person, setPerson] = React.useState<string | null>(null)
  const items = React.useMemo(
    () => AGENTS.filter((a) => a.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 py-[10px] px-4 rounded-[16px] border-[#D0D5DD] shadow-[0px_1px_2px_0px_#1018280D] gap-1 text-[#344054] text-[14px]/[20px] hover:bg-white/90"
        >
          <TransferredIcon /> Transfer call
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-[284.02px] p-2 flex flex-col gap-4 rounded-[24px]"
      >
        <div className="pt-2 pl-2 h-[28px] text-[#344054] font-hnd font-semibold text-[16px]/[20px] tracking-normal">
          Transfer to
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <Input
            placeholder="Search Agents"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="py-[10px] h-[48px] pl-9 pr-4 rounded-[12px] border border-[#0000000F] shadow-[0px_1px_2px_0px_#1018280D] bg-[#F8F8F8]"
          />
        </div>

        <div className="w-[268px] max-h-[260px] flex flex-col gap-2 overflow-y-auto">
          {items.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                onTransfer(a.id)
                setPerson(a.id)
                // setOpen(false)
              }}
              className={`flex w-full items-center gap-[14px] justify-between rounded-[16px] p-2 ${
                person === a.id
                  ? "border border-[#1671D9] bg-[#1671D914] p-3 text-left hover:border-[#CFE8F3]"
                  : "border-[#E7ECF3] bg-white p-3 text-left hover:border-[#CFE8F3]"
              }`}
            >
              <div className="inline-flex items-center gap-2">
                <AvatarWithStatus ai={a.ai} />
                <div className="font-hnd tracking-normal">
                  <div className="text-[16px]/[20px] font-medium text-[#344054]">
                    {a.name}
                  </div>
                  <div className="text-[12px]/[16px] font-normal text-[#6B7280]">
                    {a.role}
                  </div>
                </div>
              </div>

              <span
                className={`w-fit h-[22px] rounded-[16px] py-1 px-2 text-[14px]/[14px] ${
                  a.state.toLowerCase() === "active"
                    ? "text-[#0F5FD9] bg-[#E7EFFC]"
                    : "text-[#08A820] bg-[#08A82029]"
                } font-normal font-hnd text-[14px]/[14px] tracking-normal`}
              >
                {a.state}
              </span>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          className="h-10 flex gap-4 py-[10px] px-4 w-full rounded-[16px] border border-[#D0D5DD] shadow-[0px_1px_2px_0px_#1018280D] hover:bg-white"
          onClick={() => {
            onTransfer(items[0]?.id ?? "a1")
            setOpen(false)
          }}
        >
          <TransferredIcon /> Transfer call
        </Button>
      </PopoverContent>
    </Popover>
  )
}
