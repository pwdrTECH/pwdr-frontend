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
import { cn } from "@/lib/utils";
import * as React from "react";
import DeleteService from "./deleteService";
import EditService from "./editService";

export interface Service {
  id: string;
  name: string;
  scheme: string;
  category: string;
  cost: string;
  lastUpdated: string;
  status: "Approved" | "Pending";
}

interface ServicesTableProps {
  services: Service[];
}

export function ServicesTable({ services }: ServicesTableProps) {
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  const totalItems = services.length;
  const start = (page - 1) * pageSize;
  const slice = services.slice(start, start + pageSize);
  const controlsId = "services-table-body";

  return (
    <div className="w-full border border-[#EAECF0] shadow-[0px_1px_2px_0px_#1018280D] rounded-[12px]">
      <TableContainer className="rounded-[12px]">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Services</TableHead>
              <TableHead className="w-[15%]">Scheme</TableHead>
              <TableHead className="w-[15%]">Category</TableHead>
              <TableHead className="w-[15%]">Cost</TableHead>
              <TableHead className="w-[15%]">Last Updated</TableHead>
              <TableHead className="w-[10%]">Status</TableHead>
              <TableHead className="w-[10%] text-right"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody id={controlsId}>
            {slice.map((service) => (
              <TableRow key={service.id} className="hover:bg-[#F9FAFB]">
                <TableCell className="pl-6">
                  <div className="truncate text-[14px]/[20px] font-medium text-[#101828]">
                    {service.name}
                  </div>
                </TableCell>

                <TableCell className="align-middle text-[14px]/[20px] text-[#475467]">
                  {service.scheme}
                </TableCell>

                <TableCell className="align-middle text-[14px]/[20px] text-[#475467]">
                  {service.category}
                </TableCell>

                <TableCell className="align-middle text-[14px]/[20px] font-medium text-[#101828]">
                  {service.cost}
                </TableCell>

                <TableCell className="align-middle text-[14px]/[20px] text-[#475467]">
                  {service.lastUpdated}
                </TableCell>

                <TableCell className="align-middle">
                  <span
                    className={cn(
                      "inline-flex px-2 py-1 rounded-[6px] text-[12px]/[18px] font-bold",
                      service.status === "Approved"
                        ? "bg-[#1671D91A] text-[#1671D9]"
                        : "bg-white border border-[#979797] text-[#979797]",
                    )}
                  >
                    {service.status}
                  </span>
                </TableCell>

                <TableCell>
                  <RowMenu
                    items={[
                      {
                        type: "button",
                        button: <EditService />,
                      },
                      "separator",
                      {
                        type: "button",
                        button: <DeleteService serviceId={service.id} />,
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}

            {slice.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  No services found.
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
