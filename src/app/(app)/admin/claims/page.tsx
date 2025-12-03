"use client";

import { DateRangePicker } from "@/components/filters/date-range";
import Loader from "@/components/loader/lottie/loader";
import { TableTitle } from "@/components/table";
import TablePagination from "@/components/table/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClaims } from "@/lib/api/claims";
import { useMemo, useState } from "react";
import { EmptyState } from "../_components/EmptyState";
import ClaimDetailModal from "./_components/detail";
import ClaimFilters from "./_components/filter";

export type Status = "pending" | "completed";

interface Claim {
  id: string;
  date: string;
  claimId: string;
  enrolleeName: string;
  enrolleeId: string;
  providerName: string;
  serviceCount: number;
  submittedCost: string;
  totalCost: string;
  status: Status;
  utilizationUsed?: number;
}

// --- helpers ---
const parseNaira = (v: string) => Number(v.replace(/[^\d.]/g, "")) || 0;

type CostBand = "all" | "lt50" | "50to100" | "100to500" | "gt500";
type UtilBand = "all" | "u0_25" | "u25_50" | "u50_75" | "u75_100";

const providerUtilFallback: Record<string, number> = {
  "Hospital XYZ": 35,
  "Cedar Crest Hospital": 72,
  "Evalchi Hospitals": 58,
};

const getUtilization = (c: Claim) =>
  typeof c.utilizationUsed === "number"
    ? c.utilizationUsed
    : (providerUtilFallback[c.providerName] ?? 40);

const getClaimDate = (dateStr: string): Date | null => {
  const now = new Date();
  if (dateStr.includes("ago")) {
    const [amountRaw, unit] = dateStr.split(" ");
    const amount = parseInt(amountRaw, 10);
    if (unit.startsWith("Sec")) return new Date(now.getTime() - amount * 1000);
    if (unit.startsWith("min"))
      return new Date(now.getTime() - amount * 60_000);
    if (unit.startsWith("hrs"))
      return new Date(now.getTime() - amount * 3_600_000);
    return null;
  }
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
};

const costInRange = (naira: number, band: CostBand) => {
  switch (band) {
    case "lt50":
      return naira < 50_000;
    case "50to100":
      return naira >= 50_000 && naira <= 100_000;
    case "100to500":
      return naira > 100_000 && naira <= 500_000;
    case "gt500":
      return naira > 500_000;
    default:
      return true;
  }
};

const utilInRange = (pct: number, band: UtilBand) => {
  switch (band) {
    case "u0_25":
      return pct >= 0 && pct < 25;
    case "u25_50":
      return pct >= 25 && pct < 50;
    case "u50_75":
      return pct >= 50 && pct < 75;
    case "u75_100":
      return pct >= 75 && pct <= 100;
    default:
      return true;
  }
};

export default function ClaimsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [costRange, setCostRange] = useState<CostBand>("all");
  const [utilRange, setUtilRange] = useState<UtilBand>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const defaultPageSize = 10;

  // === 1) Fetch from backend ===
  const {
    data: claimsResponse,
    isLoading,
    isError,
    error,
  } = useClaims({
    page: currentPage,
    limit: defaultPageSize,
    search: searchTerm,
    status: statusFilter === "all" ? "" : statusFilter.toLowerCase(),
    enrolee_id: "",
    provider_id: "",
    plan_id: "",
  });

  // === 2) Map API payload -> UI Claim[] ===
  const baseClaims: Claim[] = useMemo(() => {
    if (
      !claimsResponse ||
      claimsResponse.status !== "success" ||
      !Array.isArray(claimsResponse.data)
    ) {
      return [];
    }

    const formatNaira = (v: number) =>
      `₦${v.toLocaleString("en-NG", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;

    return claimsResponse.data.map((c: any): Claim => {
      const enrolleeFirst = c.enrolee_first_name ?? "";
      const enrolleeSurname = c.enrolee_surname ?? "";
      const enrolleeFullName =
        `${enrolleeFirst} ${enrolleeSurname}`.trim() || "Unknown Enrollee";

      const providerName = c.provider_name
        ? c.provider_name
        : c.provider_id
          ? `Provider #${c.provider_id}`
          : "Unknown Provider";

      // backend doesn’t expose monetary fields yet in your sample – default to 0
      const submitted = 0;
      const total = 0;

      return {
        id: String(c.id),
        date: c.encounter_date ?? "",
        claimId: String(c.tracking_number ?? ""),
        enrolleeName: enrolleeFullName,
        enrolleeId: c.enrolee_code ?? String(c.enrolee_id ?? ""),
        providerName,
        serviceCount: 0, // adjust if API later exposes services count
        submittedCost: formatNaira(submitted),
        totalCost: formatNaira(total),
        status: c.status ?? "",
        utilizationUsed: undefined,
      };
    });
  }, [claimsResponse]);

  // current page size & total items from server pagination
  const serverPageSize =
    claimsResponse?.pagination?.per_page ?? defaultPageSize;
  const totalItems = claimsResponse?.pagination?.total ?? baseClaims.length;

  // === 3) Apply client-side filters ===
  const filteredClaims = useMemo(() => {
    return baseClaims.filter((claim) => {
      // extra client search
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        claim.claimId.toLowerCase().includes(q) ||
        claim.enrolleeId.toLowerCase().includes(q) ||
        claim.enrolleeName.toLowerCase().includes(q) ||
        claim.providerName.toLowerCase().includes(q);

      // status
      const matchesStatus =
        statusFilter === "all" || claim.status === statusFilter;

      // date range
      let matchesDateRange = true;
      if (startDate || endDate) {
        const cd = getClaimDate(claim.date);
        if (cd) {
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          if (start && cd < start) matchesDateRange = false;
          if (end) {
            const eod = new Date(end);
            eod.setHours(23, 59, 59, 999);
            if (cd > eod) matchesDateRange = false;
          }
        }
      }

      // cost band
      const cost = parseNaira(claim.totalCost || claim.submittedCost);
      const matchesCost = costInRange(cost, costRange);

      // utilization band
      const util = getUtilization(claim);
      const matchesUtil = utilInRange(util, utilRange);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDateRange &&
        matchesCost &&
        matchesUtil
      );
    });
  }, [
    baseClaims,
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    costRange,
    utilRange,
  ]);

  const paginated = filteredClaims;
  const controlsId = "claims-table-body";
  const hasAny = paginated.length > 0;
  console.log({ isLoading, isError, hasAny }, error);
  return (
    <div className="w-full rounded-[12px] border border-[#EAECF0]">
      {/* Header + Filters */}
      <div className="border-b-2 border-[#EAECF0] flex flex-col gap-4 pb-4">
        <div className="flex items-center justify-between gap-4 pt-5 px-6">
          {hasAny && (
            <TableTitle>{totalItems.toLocaleString()} Claims</TableTitle>
          )}{" "}
          <ClaimFilters
            search={searchTerm}
            onSearchChange={(v) => {
              setSearchTerm(v);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filter Row */}
        <div className="w-full flex justify-end items-end gap-4 px-6 border-t pt-4 border-[#EAECF0]">
          <div className="flex gap-3 flex-wrap">
            {/* Status */}
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as any);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-fit max-h-10 text-sm rounded-[12px] py-2.5 px-2 text-[#667085] bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
              </SelectContent>
            </Select>

            {/* Date range */}
            <DateRangePicker
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
                setCurrentPage(1);
              }}
            />

            {/* Cost Range */}
            <Select
              value={costRange}
              onValueChange={(v) => {
                setCostRange(v as CostBand);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-fit max-h-10 text-sm rounded-[12px] py-2.5 px-2 text-[#667085] bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]">
                <SelectValue placeholder="Cost Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Costs</SelectItem>
                <SelectItem value="lt50">&lt; ₦50k</SelectItem>
                <SelectItem value="50to100">₦50k – ₦100k</SelectItem>
                <SelectItem value="100to500">₦100k – ₦500k</SelectItem>
                <SelectItem value="gt500">&gt; ₦500k</SelectItem>
              </SelectContent>
            </Select>

            {/* Utilization Range */}
            <Select
              value={utilRange}
              onValueChange={(v) => {
                setUtilRange(v as UtilBand);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-fit max-h-10 text-sm rounded-[12px] py-2.5 px-2 text-[#667085] bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]">
                <SelectValue placeholder="Utilization Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranges</SelectItem>
                <SelectItem value="u0_25">0–25%</SelectItem>
                <SelectItem value="u25_50">25–50%</SelectItem>
                <SelectItem value="u50_75">50–75%</SelectItem>
                <SelectItem value="u75_100">75–100%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content area – mirror SchemesPage empty state behaviour */}
      {isLoading ? (
        <Loader message="Loading your claims. Please wait..." />
      ) : isError ? (
        <p className="w-full flex flex-col justify-center items-center py-10">
          <span className="px-6 py-8 text-sm text-red-500">
            Failed to load enrollees:{" "}
            {error instanceof Error ? error?.message : "Unknown error"}
          </span>
        </p>
      ) : !hasAny ? (
        <div className="w-full flex flex-col justify-center items-center py-10">
          <EmptyState message="No claim data available" />
        </div>
      ) : hasAny ? (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Claims ID</TableHead>
                  <TableHead>Enrollee name</TableHead>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Service Count</TableHead>
                  <TableHead>Submitted Cost</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody id={controlsId}>
                {paginated.map((claim) => (
                  <TableRow
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className="cursor-pointer hover:bg-muted"
                  >
                    <TableCell>{claim.date}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {claim.claimId}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {claim.enrolleeName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {claim.enrolleeId}
                      </div>
                    </TableCell>
                    <TableCell>{claim.providerName}</TableCell>
                    <TableCell className="text-center text-sm">
                      {claim.serviceCount}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {claim.submittedCost}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {claim.totalCost}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          claim.status?.toLowerCase() === "approved" ||
                          claim.status?.toLowerCase() === "completed"
                            ? "default"
                            : "secondary"
                        }
                        className={`capitalize ${
                          claim.status?.toLowerCase() === "approved" ||
                          claim.status?.toLowerCase() === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {claim.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <TablePagination
            page={currentPage}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            pageSize={serverPageSize}
            boundaryCount={1}
            siblingCount={1}
            controlsId={controlsId}
          />
        </>
      ) : null}

      {/* Detail Sheet */}
      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          open={!!selectedClaim}
          onClose={() => setSelectedClaim(null)}
        />
      )}
    </div>
  );
}
