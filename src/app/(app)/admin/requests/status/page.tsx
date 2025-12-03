"use client";

import { DateRangePicker } from "@/components/filters/date-range";
import {
  CircledApprovedIconAlt,
  IdCardIcon,
  RecyledIcon,
  RejectIcon,
} from "@/components/svgs";
import TablePagination from "@/components/table/pagination";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ClaimListItem } from "@/lib/api/claims";
import { useRequests } from "@/lib/api/requests";
import { Search } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";

type RequestStatus = "Approved" | "Rejected" | "Pending";

interface Request {
  id: string;
  enrolleeName: string;
  enrolleeId: string;
  diagnosis: string;
  services: string;
  drug: string;
  cost: string;
  status: RequestStatus;
  date: string; // "dd/mm/yy"
}

/* -------------------------------------------------------------------------- */
/*                         MAPPING: API → TABLE ROW                           */
/* -------------------------------------------------------------------------- */

function mapApiStatusToRequestStatus(
  apiStatus: string | null | undefined,
): RequestStatus {
  const s = (apiStatus ?? "").toLowerCase();
  if (s === "approved" || s === "processed") return "Approved";
  if (s === "pending") return "Pending";
  if (s === "rejected" || s === "queried") return "Rejected";
  return "Pending";
}

// Format date from ISO / timestamp to "dd/mm/yy"
function formatDateToDMY(value: string | number | null | undefined): string {
  if (!value && value !== 0) return "";
  let dt: Date;

  if (typeof value === "number") {
    // assume unix seconds if short
    if (value.toString().length <= 10) {
      dt = new Date(value * 1000);
    } else {
      dt = new Date(value);
    }
  } else {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    dt = parsed;
  }

  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yy = String(dt.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

function mapClaimToRequestRow(c: ClaimListItem): Request {
  const enrolleeName =
    [c.enrolee_first_name ?? "", c.enrolee_surname ?? ""].join(" ").trim() ||
    (c.enrolee_code ?? "");

  const diagnosis = c.diagnosis ?? "-";
  const services = c.lab ?? c.radiology ?? c.channel ?? c.plan_name ?? "—";
  const drug = c.prescription ?? "—";
  const cost = "—"; // no explicit cost in ClaimListItem yet

  const status = mapApiStatusToRequestStatus(c.status);
  const date = formatDateToDMY(c.encounter_date || c.date_created);

  return {
    id: c.tracking_number || String(c.id),
    enrolleeName,
    enrolleeId: c.enrolee_code || String(c.enrolee_id ?? ""),
    diagnosis,
    services,
    drug,
    cost,
    status,
    date,
  };
}

/* -------------------------------------------------------------------------- */
/*                          HELPERS: DATE PARSING                             */
/* -------------------------------------------------------------------------- */

function parseDMY(d: string): Date | null {
  const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    let yy = Number(m[3]);
    if (yy < 100) yy += 2000;
    const dt = new Date(yy, mm - 1, dd);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

const getStatusColor = (status: RequestStatus) => {
  switch (status) {
    case "Approved":
      return "bg-[#1671D91A] text-[#1671D9] border-[#0000001A]";
    case "Rejected":
      return "bg-[#FEF3F2] text-red-700 border-[#FECDCA]";
    case "Pending":
      return "bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]";
    default:
      return "bg-gray-50 text-gray-700 border-[#EAECF0]";
  }
};

/* -------------------------------------------------------------------------- */
/*                                 STAT CARD                                  */
/* -------------------------------------------------------------------------- */

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <div className="h-[124px] bg-white rounded-[12px] border border-[#EAECF0] p-4 flex items-start justify-between">
    <div className="h-[80px] flex flex-col gap-8">
      <p className="text-[14px]/[20px] text-[#7A7A7A] font-semibold font-hnd tracking-normal">
        {title}
      </p>
      <p className="text-[24px]/[40px] font-hnd font-bold text-[#101928] tracking-[-0.02em]">
        {value}
      </p>
    </div>
    <div>{icon}</div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function RequestStatusPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<
    "all" | "approved" | "pending" | "rejected"
  >("all");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const pageSize = 10;
  const controlsId = "request-status-table-body";

  /* ---------------------- FETCH CLAIMS FROM BACKEND ---------------------- */

  const { data, isLoading, error } = useRequests({
    page: 1,
    limit: 500,
    status: statusTab,
  });

  const claims = (data?.data as ClaimListItem[]) ?? [];

  const allRequests: Request[] = useMemo(
    () => claims.map((c) => mapClaimToRequestRow(c)),
    [claims],
  );

  /* ------------------------------ 1) SEARCH ------------------------------ */

  const searchFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allRequests;
    return allRequests.filter((r) => {
      const hay = [
        r.enrolleeName,
        r.enrolleeId,
        r.diagnosis,
        r.services,
        r.drug,
        r.id,
        r.cost,
        r.status,
        r.date,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [searchQuery, allRequests]);

  /* ----------------------------- 2) DATE RANGE --------------------------- */

  const dateFiltered = useMemo(() => {
    if (!dateFrom && !dateTo) return searchFiltered;

    return searchFiltered.filter((r) => {
      const d = parseDMY(r.date);
      if (!d) return false;

      if (dateFrom) {
        const start = new Date(
          dateFrom.getFullYear(),
          dateFrom.getMonth(),
          dateFrom.getDate(),
          0,
          0,
          0,
          0,
        );
        if (d < start) return false;
      }

      if (dateTo) {
        const end = new Date(
          dateTo.getFullYear(),
          dateTo.getMonth(),
          dateTo.getDate(),
          23,
          59,
          59,
          999,
        );
        if (d > end) return false;
      }

      return true;
    });
  }, [searchFiltered, dateFrom, dateTo]);

  /* ---------------------------- 3) STATUS TAB --------------------------- */

  const tableFiltered = useMemo(() => {
    switch (statusTab) {
      case "approved":
        return dateFiltered.filter((r) => r.status === "Approved");
      case "pending":
        return dateFiltered.filter((r) => r.status === "Pending");
      case "rejected":
        return dateFiltered.filter((r) => r.status === "Rejected");
      default:
        return dateFiltered;
    }
  }, [dateFiltered, statusTab]);

  /* -------------------------- STATS (CARDS) ----------------------------- */

  const statTotal = dateFiltered.length;
  const statApproved = dateFiltered.filter(
    (r) => r.status === "Approved",
  ).length;
  const statRejected = dateFiltered.filter(
    (r) => r.status === "Rejected",
  ).length;
  const statPending = dateFiltered.filter((r) => r.status === "Pending").length;

  /* ----------------------------- PAGINATION ----------------------------- */

  const totalItems = tableFiltered.length;
  const start = (page - 1) * pageSize;
  const slice = tableFiltered.slice(start, start + pageSize);

  useEffect(() => {
    setPage(1);
  }, []);

  /* ---------------------------------------------------------------------- */
  /*                                 RENDER                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="w-full">
      <Tabs
        value={statusTab}
        onValueChange={(v) => setStatusTab(v as any)}
        className="w-full border border-[#EAECF0] rounded-[12px]"
      >
        <div className="rounded-t-[12px] border border-b-0 border-[#EAECF0]">
          <div className="w-full pt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-b-2 border-[#FFFFFF] ">
            <div className="w-full flex justify-between pr-2 pl-6">
              {/* Tabs (Status filter) */}
              <TabsList className="bg-white w-auto rounded-none h-auto flex gap-4 items-center">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="approved">Approved Requests</TabsTrigger>
                <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                <TabsTrigger value="rejected">Rejected Requests</TabsTrigger>
              </TabsList>

              {/* Search + Date range filter */}
              <div className="flex gap-4 items-center px-[6px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search Requests"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-50 border-[#EAECF0] rounded-md"
                  />
                </div>

                <div className="flex gap-2">
                  <DateRangePicker
                    onChange={(start, end) => {
                      setDateFrom(start ? new Date(start) : undefined);
                      setDateTo(end ? new Date(end) : undefined);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stat Cards (reflect search + date range) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 py-6 px-8">
            <StatCard
              title="Total Request"
              value={String(statTotal)}
              icon={<IdCardIcon />}
            />
            <StatCard
              title="Approved Request"
              value={String(statApproved)}
              icon={<CircledApprovedIconAlt />}
            />
            <StatCard
              title="Rejected Request"
              value={String(statRejected)}
              icon={<RejectIcon />}
            />
            <StatCard
              title="Pending Request"
              value={String(statPending)}
              icon={<RecyledIcon />}
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white border border-t-0 border-[#EAECF0] rounded-b-lg overflow-hidden">
          <TableContainer>
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Enrollee name</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Drug</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody id={controlsId}>
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-sm text-gray-500"
                    >
                      Loading requests…
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && error && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-sm text-red-500"
                    >
                      Failed to load requests.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  !error &&
                  slice.map((request) => (
                    <TableRow
                      key={request.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.id}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {request.enrolleeName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {request.enrolleeId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {request.diagnosis}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {request.services}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {request.drug}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.cost}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`font-medium ${getStatusColor(
                            request.status,
                          )}`}
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {request.date}
                      </TableCell>
                    </TableRow>
                  ))}

                {!isLoading && !error && slice.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-sm text-gray-500"
                    >
                      No requests match your filters.
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
      </Tabs>
    </main>
  );
}
