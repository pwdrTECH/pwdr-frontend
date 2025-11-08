"use client"

import { WarningAlt } from "@/components/svgs"
import TablePagination from "@/components/table-pagination"
import { RowMenu } from "@/components/table-pagination/callout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { slugify } from "@/lib/utils"
import { Archive, FileText, Pencil, Trash2, User } from "lucide-react"
import Link from "next/link"
import * as React from "react"

function RowLink({
  href,
  icon,
  children,
}: {
  href: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-primary font-semibold hover:underline"
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}

// ---------------- Mock Data ----------------
type Provider = {
  id: string
  providerId: string
  name: string
  city?: string
  state: string
  logo?: string
  tariffUpdatedAt: string
  channels: string[]
  needsTariff?: boolean
  needsChannels?: boolean
}

const ROWS: Provider[] = [
  {
    id: "1",
    providerId: "EU/3931S",
    name: "Trust Charitos Hospital",
    state: "Abuja",
    tariffUpdatedAt: "24 hours ago",
    channels: ["Email", "SMS", "Whatsapp"],
  },
  {
    id: "2",
    providerId: "EU/3931S",
    name: "Trust Charitos Hospital",
    state: "Kano",
    tariffUpdatedAt: "1 month ago",
    channels: ["Web Portal", "WhatsApp"],
  },
  {
    id: "3",
    providerId: "EU/3931S",
    name: "Elvachi Hospital",
    state: "Abuja",
    tariffUpdatedAt: "—",
    channels: [],
    needsTariff: true,
    needsChannels: true,
  },
  {
    id: "4",
    providerId: "EU/3931S",
    name: "Cedar Crest Hospital",
    state: "Kano",
    tariffUpdatedAt: "1 month ago",
    channels: ["Email", "WhatsApp"],
  },
  {
    id: "5",
    providerId: "EU/3931S",
    name: "Cedar Crest Hospital",
    state: "Abuja",
    tariffUpdatedAt: "2 months ago",
    channels: ["Email", "SMS", "Web Portal", "WhatsApp"],
  },
  {
    id: "6",
    providerId: "EU/3931S",
    name: "Elvachi Hospital",
    state: "Kano",
    tariffUpdatedAt: "1 month ago",
    channels: ["Email"],
  },
  {
    id: "7",
    providerId: "EU/3931S",
    name: "Elvachi Hospital",
    state: "Abuja",
    tariffUpdatedAt: "2 months ago",
    channels: ["SMS", "Web Portal", "WhatsApp"],
  },
  {
    id: "8",
    providerId: "EU/3931S",
    name: "Trust Charitos Hospital",
    state: "Abuja",
    tariffUpdatedAt: "2 days ago",
    channels: ["Web Portal", "WhatsApp"],
  },
  {
    id: "9",
    providerId: "EU/3931S",
    name: "Trust Charitos Hospital",
    state: "Kano",
    tariffUpdatedAt: "2 months ago",
    channels: ["Email", "WhatsApp"],
  },
  {
    id: "10",
    providerId: "EU/3931S",
    name: "Trust Charitos Hospital",
    state: "Kano",
    tariffUpdatedAt: "1 month ago",
    channels: ["Web Portal"],
  },
]

// ---------------- Component ----------------
export function ProvidersTable({ query }: { query: string }) {
  const [page, setPage] = React.useState(1)
  const pageSize = 10

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ROWS
    return ROWS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.channels.join(",").toLowerCase().includes(q)
    )
  }, [query])

  const totalItems = filtered.length
  const start = (page - 1) * pageSize
  const slice = filtered.slice(start, start + pageSize)
  const controlsId = "providers-table-body"

  React.useEffect(() => setPage(1), [query])

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Provider</TableHead>
              <TableHead className="w-[10%]">Provider ID</TableHead>
              <TableHead className="w-[20%]">Tariff Update</TableHead>
              <TableHead className="w-[10%]">State</TableHead>
              <TableHead className="w-[30%]">Channels</TableHead>
              <TableHead className="w-[10%] text-right"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody id={controlsId}>
            {slice.map((row) => (
              <TableRow key={row.id} className="hover:bg-[#F9FAFB]">
                {/* Provider cell */}
                <TableCell className="pl-6">
                  <div className="truncate text-[14px]/[20px] font-medium text-[#101828]">
                    {row.name}
                  </div>
                </TableCell>

                {/* Provider ID cell */}
                <TableCell className="pl-6">
                  <div className="truncate text-[14px]/[20px] font-medium text-[#101828]">
                    {row.providerId}
                  </div>
                </TableCell>

                {/* Tariff */}
                <TableCell className="align-middle">
                  {row.needsTariff ? (
                    <InlineAlert>Set up tariff</InlineAlert>
                  ) : (
                    row.tariffUpdatedAt
                  )}
                </TableCell>

                {/* State */}
                <TableCell className="align-middle">{row.state}</TableCell>

                {/* Channels */}
                <TableCell className="align-middle">
                  {row.needsChannels ? (
                    <InlineAlert>Set up channels</InlineAlert>
                  ) : row.channels.length ? (
                    row.channels.join(", ")
                  ) : (
                    "—"
                  )}
                </TableCell>

                {/* Action */}
                <TableCell className="text-right pr-6">
                  <RowMenu
                    items={[
                      {
                        type: "button",
                        button: (
                          <RowLink
                            href={`/user/providers/${slugify(row.name)}`}
                            icon={<FileText className="h-4 w-4" />}
                          >
                            Tariff Plans
                          </RowLink>
                        ),
                      },
                      {
                        type: "button",
                        button: (
                          <RowLink
                            href={`/providers/${row.id}/edit`}
                            icon={<Pencil className="h-4 w-4" />}
                          >
                            Edit
                          </RowLink>
                        ),
                      },
                      "separator",
                      {
                        type: "action",
                        label: (
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            View profile
                          </span>
                        ),
                        onSelect: () => alert(`Viewing ${row.name}`),
                      },
                      {
                        type: "action",
                        label: (
                          <span className="flex items-center gap-2">
                            <Archive className="h-4 w-4" />
                            Archive
                          </span>
                        ),
                        onSelect: () => alert(`Archived ${row.name}`),
                      },
                      {
                        type: "action",
                        label: (
                          <span className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </span>
                        ),
                        onSelect: () => alert(`Deleted ${row.name}`),
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}

            {slice.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No providers match “{query}”.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        page={page}
        onPageChange={setPage}
        totalItems={totalItems}
        pageSize={pageSize}
        boundaryCount={1}
        siblingCount={1}
        controlsId={controlsId}
      />
    </div>
  )
}

/* -------- Helpers -------- */
function InlineAlert({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-start gap-2 rounded-full text-[14px]/[20px] font-hnd font-medium text-[#FF6058]">
      <WarningAlt />
      {children}
    </span>
  )
}
