"use client";

import TablePagination from "@/components/table/pagination";
import { RowMenu } from "@/components/table/pagination/callout";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, slugify } from "@/lib/utils";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { EnrolleeRow } from "../page";

interface EnrolleesTableProps {
  enrollees: EnrolleeRow[];
}

function getUtilizationColor(utilization: number): string {
  if (utilization <= 30) return "text-[#53AF70]";
  if (utilization <= 60) return "text-[#E99536]";
  return "text-[#DE5242]";
}

function getUtilizationDotColor(utilization: number): string {
  if (utilization <= 30) return "bg-[#53AF70]";
  if (utilization <= 60) return "bg-[#E99536]";
  return "bg-[#DE5242]";
}

export default function EnrolleesTable({ enrollees }: EnrolleesTableProps) {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const totalItems = enrollees?.length;
  const start = (page - 1) * pageSize;
  const slice = enrollees?.slice(start, start + pageSize);
  const controlsId = "enrollees-table-body";

  const handleViewBeneficiary = (enrollee: EnrolleeRow) => {
    if (!enrollee.enrolee_id) return;
    const name =
      `${enrollee.first_name} ${enrollee.other_names} ${enrollee.surname}`.trim() ||
      "beneficiary";

    // Use enrolleeId (code) as the dynamic route segment,
    const encoded = encodeURIComponent(enrollee.enrolee_id);
    router.push(`/admin/beneficiaries/${slugify(name)}?enid=${encoded}`);
  };
  return (
    <div className="w-full border-t border-[#EAECF0]">
      <TableContainer>
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-[25%]">Enrollee name</TableHead>
              <TableHead className="w-[15%]">Scheme</TableHead>
              <TableHead className="w-[15%]">Plan</TableHead>
              <TableHead className="w-[15%]">Role</TableHead>
              <TableHead className="w-[15%]">Balance</TableHead>
              <TableHead className="w-[15%]">Utilization</TableHead>
              <TableHead className="w-[10%] text-right"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody id={controlsId}>
            {slice?.map((enrollee) => (
              <TableRow
                key={enrollee.id}
                className="hover:bg-gray-50 border-b border-gray-100"
              >
                <TableCell className="pl-6">
                  <div className="flex flex-col">
                    <div className="font-hnd font-medium text-[16px]/[24px] text-[#293347]">
                      {`${enrollee?.first_name} ${enrollee.other_names} ${enrollee.surname}`.trim() ||
                        "—"}
                    </div>
                    <div className="text-[14px]/[16px] font-hnd font-normal tracking-normal text-[#636E7D] flex items-center">
                      <span className="h-[6px] w-[6px] text-[#E3E3E3]">
                        &#183;
                      </span>
                      {enrollee.enrolee_id}
                    </div>
                  </div>
                </TableCell>

                <TableCell>{enrollee.scheme}</TableCell>

                <TableCell>{enrollee.plan_name}</TableCell>

                <TableCell>{enrollee.user_role}</TableCell>

                <TableCell>{enrollee.balance}</TableCell>

                <TableCell className="align-middle">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-[4px]",
                        getUtilizationDotColor(enrollee.utilization),
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        getUtilizationColor(enrollee.utilization),
                      )}
                    >
                      {enrollee.utilization}%
                    </span>
                  </div>
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
                            onClick={() => handleViewBeneficiary(enrollee)}
                          >
                            View Beneficiary
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
            ))}

            {slice?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-gray-500"
                >
                  No enrollees found.
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
    </div>
  );
}
