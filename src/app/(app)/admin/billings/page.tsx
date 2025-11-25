"use client";

import { DateRangePicker } from "@/components/filters/date-range";
import { SearchField } from "@/components/filters/search";
import { FilterSelect } from "@/components/filters/select";
import TablePagination from "@/components/table/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { useMemo, useState } from "react";
import { BulkClaimAnalysisSheet } from "./_components/BulkClaimAnalysis";
import { BillDetailSheet } from "./_components/detail";
import { UploadBulkClaimSheet } from "./_components/UploadBulkClaimSheet";

export type BillStatus = "all" | "paid" | "unpaid";

export interface BillingRow {
  id: string;
  dueDate: string;
  billId: string;
  provider: string;
  claimsCount: number;
  totalCost: number;
  status: BillStatus;
}

// TODO: replace with real API
const MOCK_BILLS: BillingRow[] = [
  {
    id: "1",
    dueDate: "12 Dec 2024",
    billId: "CEG-28YN-2H",
    provider: "Reliance HMO",
    claimsCount: 4871,
    totalCost: 5_000_000,
    status: "unpaid",
  },
  {
    id: "2",
    dueDate: "12 Dec 2024",
    billId: "CEG-28YN-2H",
    provider: "Ally Healthcare",
    claimsCount: 2572,
    totalCost: 2_500_000,
    status: "paid",
  },
  {
    id: "3",
    dueDate: "12 Dec 2024",
    billId: "CEG-28YN-2H",
    provider: "Reliance HMO",
    claimsCount: 4871,
    totalCost: 5_000_000,
    status: "unpaid",
  },
  {
    id: "4",
    dueDate: "12 Dec 2024",
    billId: "CEG-28YN-2H",
    provider: "Ally Healthcare",
    claimsCount: 2572,
    totalCost: 2_500_000,
    status: "paid",
  },
];

const formatNaira = (v: number) =>
  `₦${v.toLocaleString("en-NG", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}`;
const parseDate = (value: string): Date | null => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};
export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState<string>("all");
  const [price, setPrice] = useState<string>("all");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [status, setStatus] = useState<"all" | BillStatus>("all");
  const [page, setPage] = useState(1);
  const [selectedBill, setSelectedBill] = useState<BillingRow | null>(null);
  const [detailVariant, setDetailVariant] = useState<"single" | "multi">(
    "single",
  );
  const [showBulkSheet, setShowBulkSheet] = useState(false);
  const [showResultSheet, setShowResultSheet] = useState(false);

  const pageSize = 10;

  const billsDue = 21_400_000;
  const billsPaid = 4_600_000;
  const totalBills = 23;
  const totalCost = 26_000_000;

  const filteredBills = useMemo(() => {
    const q = search.trim().toLowerCase();

    return MOCK_BILLS.filter((b) => {
      const matchesSearch =
        !q ||
        b.billId.toLowerCase().includes(q) ||
        b.provider.toLowerCase().includes(q);

      const matchesProvider = provider === "all" || b.provider === provider;

      const matchesStatus = status === "all" || b.status === status;

      // date range
      let matchesDate = true;
      if (startDate || endDate) {
        const billDate = parseDate(b.dueDate);
        if (billDate) {
          if (startDate) {
            const s = parseDate(startDate);
            if (s && billDate < s) matchesDate = false;
          }
          if (endDate) {
            const e = parseDate(endDate);
            if (e) {
              const eod = new Date(e);
              eod.setHours(23, 59, 59, 999);
              if (billDate > eod) matchesDate = false;
            }
          }
        }
      }

      return matchesSearch && matchesProvider && matchesStatus && matchesDate;
    });
  }, [search, provider, status, startDate, endDate]);
  const paged = filteredBills.slice((page - 1) * pageSize, page * pageSize);
  const controlsId = "billing-table-body";

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div />

        <div className="w-full max-w-[575px] bg-white h-18.5 flex justify-between rounded-[12px] border pt-3.5 pb-4 pl-3.5 pr-5 items-center">
          <div
            className="h-11 w-full flex flex-col
          "
          >
            <span className="text-sm font-hnd font-medium font-base tracking-normal text-[#101928]">
              Analyze Bulk Claim
            </span>
            <span className="text-sm text-[#5E697B] font-hnd font-normal tracking-normal">
              Upload bulk request for AI Analytics and processing
            </span>
          </div>
          <UploadBulkClaimSheet
            openResultSheet={showResultSheet}
            onOpenResultChange={setShowResultSheet}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <SummaryCard
          label="Bills due"
          value={formatNaira(billsDue)}
          valueClass="text-[#FF6058]"
        />
        <SummaryCard label="Bills paid" value={formatNaira(billsPaid)} />
        <SummaryCard label="Total number of bills" value={String(totalBills)} />
        <SummaryCard
          label="Total amount of bills"
          value={formatNaira(totalCost)}
        />
      </div>

      {/* Table card */}
      <Card className="border border-[#EAECF0] rounded-[16px] shadow-none">
        <CardHeader className="border-b border-[#EAECF0] pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}

              <SearchField
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
              />
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 justify-end">
                <FilterSelect
                  value={provider}
                  onChange={(v) => {
                    setProvider(v);
                    setPage(1);
                  }}
                  placeholder="All Providers"
                  options={[
                    { value: "all", label: "All Providers" },
                    { value: "Reliance HMO", label: "Reliance HMO" },
                    { value: "Ally Healthcare", label: "Ally Healthcare" },
                  ]}
                />
                <FilterSelect
                  value={price}
                  onChange={(v) => {
                    setPrice(v);
                    setPage(1);
                  }}
                  placeholder="₦0 - ₦999999999"
                  options={[
                    { value: "all", label: "All Prices" },
                    { value: "0-999999999", label: "₦0 - ₦999999999" },
                    {
                      value: "1000000-5000000",
                      label: "₦1,000,000 - ₦5,000,000",
                    },
                    { value: "5000000+", label: "₦5,000,000+" },
                  ]}
                />
                <FilterSelect
                  value={status}
                  onChange={(v) => {
                    setStatus(v as BillStatus);
                    setPage(1);
                  }}
                  placeholder="Any status"
                  options={[
                    { value: "all", label: "Any Prices" },
                    { value: "unpaid", label: "Unpaid" },
                    {
                      value: "paid",
                      label: "paid",
                    },
                  ]}
                />
                <DateRangePicker
                  onChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Table */}
          <TableContainer>
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Bill ID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>No. of Claims</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody id={controlsId}>
                {paged.map((row, idx) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.dueDate}</TableCell>
                    <TableCell>{row.billId}</TableCell>
                    <TableCell>{row.provider}</TableCell>
                    <TableCell>{row.claimsCount.toLocaleString()}</TableCell>
                    <TableCell>{formatNaira(row.totalCost)}</TableCell>
                    <TableCell>
                      {row.status === "paid" ? (
                        <Badge className="w-fit h-[21px] rounded-[6px] bg-[#1671D91A] text-[#1671D9] text-[12px]/[18px] font-bold tracking-normal border border-[#0000001A] text-[11px] shadow-[0px_1px_2px_0px_#1018280D] p-1.5">
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="w-fit h-[21px] rounded-[6px] bg-transparent text-[#979797] text-[12px]/[18px] font-bold tracking-normal border border-[#979797] text-[11px] shadow-[0px_1px_2px_0px_#1018280D] p-1.5">
                          Unpaid
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-4">
                      <button
                        type="button"
                        className="text-[#1671D9] text-sm font-bold font-hnd tracking-normal cursor-pointer hover:underline"
                        onClick={() => {
                          setSelectedBill(row);
                          setDetailVariant(idx % 2 === 0 ? "single" : "multi");
                        }}
                      >
                        Review
                      </button>
                      {row.status === "unpaid" ? (
                        <button
                          type="button"
                          className="text-[#1671D9] text-sm font-bold font-hnd tracking-normal cursor-pointer hover:underline"
                        >
                          Mark As Paid
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="text-[#1671D9] text-sm font-bold font-hnd tracking-normal cursor-pointer hover:underline"
                        >
                          View
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {paged.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-sm text-[#9CA3AF]"
                    >
                      No bills found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div className="border-t border-[#EAECF0]">
            <TablePagination
              page={page}
              onPageChange={setPage}
              totalItems={filteredBills.length}
              pageSize={pageSize}
              boundaryCount={1}
              siblingCount={1}
              controlsId={controlsId}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detail sheet */}
      {selectedBill && (
        <BillDetailSheet
          open={!!selectedBill}
          onOpenChange={(open) => {
            if (!open) setSelectedBill(null);
          }}
          bill={selectedBill}
          variant={detailVariant}
        />
      )}

      {/* Bulk claim analysis */}
      <BulkClaimAnalysisSheet
        open={showBulkSheet}
        onOpenChange={setShowBulkSheet}
        onShowResult={() => {
          setShowBulkSheet(false);
          setShowResultSheet(true);
        }}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <Card className="h-31 rounded-[12px] border border-[#EAECF0] shadow-none p-4">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-5">
          <span className="font-hnd font-medium text-sm tracking-tight text-[#7A7A7A]">
            {label}
          </span>
          <span
            className={cn(
              "font-hnd font-bold text-[24px]/[40px] tracking-[-0.02em] text-[#101928]",
              valueClass,
            )}
          >
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
