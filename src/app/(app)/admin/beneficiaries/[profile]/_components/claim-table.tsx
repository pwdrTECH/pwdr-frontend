"use client";

import TablePagination from "@/components/table/pagination";
import { RowMenu } from "@/components/table/pagination/callout";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import * as React from "react";

// 🔹 Export this so we can reuse it in BeneficiaryProfile
export type ClaimStatus = "pending" | "completed" | "approved" | "rejected";

export interface Claim {
  claimId: string;
  diagnosis: string;
  service: string;
  drug: string;
  cost: string;
  status: ClaimStatus | string; // keep flexible in case API gives lowercase
  date: string;
}

interface ClaimsTableProps {
  claims?: Claim[];
}

function getStatusBadgeStyles(status: Claim["status"]) {
  const s = String(status).toLowerCase();
  if (s === "pending") {
    return "bg-amber-50 text-amber-600";
  }
  if (s === "completed") {
    return "bg-[#ECFDF3] text-[#166534]";
  }
  if (s === "approved") {
    return "bg-[#E7EFFC] text-primary";
  }
  if (s === "rejected") {
    return "bg-[#F8D4D4] text-[#D90F0F]";
  }
  return "bg-gray-50 text-gray-600";
}

type TabValue = "all" | "pending" | "completed";

export default function ClaimsTable({ claims = [] }: ClaimsTableProps) {
  const [activeTab, setActiveTab] = React.useState<TabValue>("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const filteredClaims = React.useMemo(() => {
    const normalize = (s: Claim["status"]) => String(s).toLowerCase();

    switch (activeTab) {
      case "pending":
        return claims.filter((c) => normalize(c.status) === "pending");
      case "completed":
        return claims.filter((c) => normalize(c.status) === "completed");
      default:
        return claims;
    }
  }, [activeTab, claims]);

  const totalItems = filteredClaims.length;
  const start = (page - 1) * pageSize;
  const slice = filteredClaims.slice(start, start + pageSize);
  const controlsId = "claims-table-body";

  return (
    <div className="w-full border border-[#EAECF0] rounded-lg">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="w-full"
      >
        <div className="border-b border-[#EAECF0] px-6 pt-6">
          <TabsList className="gap-8 bg-transparent p-0 h-auto border-b-0">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="m-0">
          <TableContainer>
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
                {slice.map((claim) => {
                  return (
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
                            getStatusBadgeStyles(claim.status),
                          )}
                        >
                          {String(claim.status).charAt(0).toUpperCase() +
                            String(claim.status).slice(1).toLowerCase()}
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
                                <button
                                  type="button"
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                  View Details
                                </button>
                              ),
                            },
                            "separator",
                            {
                              type: "button",
                              button: (
                                <button
                                  type="button"
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                  Edit
                                </button>
                              ),
                            },
                            "separator",
                            {
                              type: "button",
                              button: (
                                <button
                                  type="button"
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                  Delete
                                </button>
                              ),
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

                {slice.length === 0 && (
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
          </TableContainer>

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
  );
}
