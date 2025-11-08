"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import TablePagination from "@/components/table-pagination"
import { RowMenu } from "@/components/table-pagination/callout"

interface Claim {
  claimId: string
  diagnosis: string
  service: string
  drug: string
  cost: string
  status: "Approved" | "Rejected" | "Pending"
  date: string
}

interface ClaimsTableProps {
  claims?: Claim[]
}

function getStatusBadgeStyles(status: string) {
  switch (status) {
    case "Approved":
      return "bg-[#E7EFFC] text-primary"
    case "Rejected":
      return "bg-[#F8D4D4] text-[#D90F0F]"
    case "Pending":
      return "bg-amber-50 text-amber-600"
    default:
      return "bg-gray-50 text-gray-600"
  }
}

export default function ClaimsTable({ claims = claimsData }: ClaimsTableProps) {
  const [activeTab, setActiveTab] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const pageSize = 10

  const filteredClaims = React.useMemo(() => {
    if (activeTab === "all") return claims
    if (activeTab === "approved")
      return claims.filter((c) => c.status === "Approved")
    if (activeTab === "rejected")
      return claims.filter((c) => c.status === "Rejected")
    if (activeTab === "pending")
      return claims.filter((c) => c.status === "Pending")
    return claims
  }, [activeTab, claims])

  const totalItems = filteredClaims?.length || 0
  const start = (page - 1) * pageSize
  const slice = filteredClaims?.slice(start, start + pageSize)
  const controlsId = "claims-table-body"

  return (
    <div className="w-full border border-[#EAECF0] rounded-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-[#EAECF0] px-6 pt-6">
          <TabsList className="gap-8 bg-transparent p-0 h-auto border-b-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="m-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="w-[15%]">Claim ID</TableHead>
                  <TableHead className="w-[20%]">Diagnosis</TableHead>
                  <TableHead className="w-[18%]">Services</TableHead>
                  <TableHead className="w-[15%]">Drug</TableHead>
                  <TableHead className="w-[12%]">Cost</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className="w-[12%]">Date</TableHead>
                  <TableHead className="w-[10%] text-right"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody id={controlsId}>
                {slice?.map((claim) => (
                  <TableRow
                    key={claim.claimId}
                    className="hover:bg-gray-50 border-b border-gray-100"
                  >
                    <TableCell className="pl-6">
                      <div className="font-medium text-[14px] text-[#293347]">
                        {claim.claimId}
                      </div>
                    </TableCell>

                    <TableCell className="text-[14px] text-[#636E7D]">
                      {claim.diagnosis}
                    </TableCell>

                    <TableCell className="text-[14px] text-[#636E7D]">
                      {claim.service}
                    </TableCell>

                    <TableCell className="text-[14px] text-[#636E7D]">
                      {claim.drug}
                    </TableCell>

                    <TableCell className="text-[14px] text-[#636E7D]">
                      {claim.cost}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={cn(
                          "text-xs border-0",
                          getStatusBadgeStyles(claim.status)
                        )}
                      >
                        {claim.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-[14px] text-[#636E7D]">
                      {claim.date}
                    </TableCell>

                    <TableCell>
                      <RowMenu
                        items={[
                          {
                            type: "button",
                            button: (
                              <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                                View Details
                              </button>
                            ),
                          },
                          "separator",
                          {
                            type: "button",
                            button: (
                              <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                                Edit
                              </button>
                            ),
                          },
                          "separator",
                          {
                            type: "button",
                            button: (
                              <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                                Delete
                              </button>
                            ),
                          },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}

                {slice?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-sm text-gray-500"
                    >
                      No claims found.
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

const claimsData: Claim[] = [
  {
    claimId: "SHTL/CAC/11081",
    diagnosis: "Allergic conjunctivitis",
    service: "General Consultation",
    drug: "Amoxicillin",
    cost: "N29090",
    status: "Approved",
    date: "12/10/23",
  },
  {
    claimId: "SHTL/CBC/11082",
    diagnosis: "Hypertension",
    service: "Dermatology",
    drug: "Paracetamol",
    cost: "N21877",
    status: "Rejected",
    date: "12/10/23",
  },
  {
    claimId: "CSTL/CAC/11083",
    diagnosis: "Asthma",
    service: "Cardiology",
    drug: "Omeprazole",
    cost: "N500,000",
    status: "Approved",
    date: "12/10/23",
  },
  {
    claimId: "BZTL/CBC/11084",
    diagnosis: "Major Depressive Disorder",
    service: "Radiology",
    drug: "Paracetamol",
    cost: "N877789",
    status: "Approved",
    date: "12/10/23",
  },
  {
    claimId: "SHTL/CAD/11085",
    diagnosis: "Malaria",
    service: "General Consultation",
    drug: "Omeprazole",
    cost: "N90,997",
    status: "Pending",
    date: "12/10/23",
  },
  {
    claimId: "CHTL/CBC/11086",
    diagnosis: "Osteoarthritis",
    service: "Cardiology",
    drug: "Atorvastatin",
    cost: "N76,000",
    status: "Approved",
    date: "12/10/23",
  },
  {
    claimId: "CBTL/CBC/11087",
    diagnosis: "Catarh",
    service: "Radiology",
    drug: "Paracetamol",
    cost: "N66,000",
    status: "Approved",
    date: "12/10/23",
  },
  {
    claimId: "SHTL/CBC/11088",
    diagnosis: "Malaria",
    service: "General Consultation",
    drug: "Omeprazole",
    cost: "N91,000",
    status: "Approved",
    date: "12/10/23",
  },
]
