"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FiltersProps {
  onSearchChange: (value: string) => void
  onCostChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function Filters({
  onSearchChange,
  onCostChange,
  onStatusChange,
}: FiltersProps) {
  return (
    <div className="grid grid-cols-3 gap-4 bg-[#F9FAFB] border border-[#EAECF0] p-5">
      <div className="flex flex-col gap-2">
        <label className="block text-[14px]/[20px] font-hnd font-medium text-[#344054]">
          Search for tariff
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B4B4B4]" />
          <Input
            placeholder="Search"
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-[12px] pl-9 py-2.5 pr-4 bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="block text-[14px]/[20px] font-hnd font-medium text-[#344054]">
          Cost
        </label>
        <Select defaultValue="min-max" onValueChange={onCostChange}>
          <SelectTrigger className="w-full py-2.5 px-3.5 data-[size=default]:h-10">
            <SelectValue placeholder="Min-Max" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="min-max">Min-Max</SelectItem>
            <SelectItem value="0-10000">₦0 - ₦10,000</SelectItem>
            <SelectItem value="10000-30000">₦10,000 - ₦30,000</SelectItem>
            <SelectItem value="30000+">₦30,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="block text-[14px]/[20px] font-hnd font-medium text-[#344054]">
          Status
        </label>
        <Select defaultValue="approved" onValueChange={onStatusChange}>
          <SelectTrigger className="data-[size=default]:h-10 w-full py-2.5 px-3.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
