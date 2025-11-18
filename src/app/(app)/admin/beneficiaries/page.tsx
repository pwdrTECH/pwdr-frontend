"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import * as React from "react";
import { AddEnrolleeForm } from "./_components/add";
import Filters from "./_components/filters";
import EnrolleesTable from "./_components/table";
import { useBeneficiaries } from "@/lib/api/beneficiaries";

type StatusValue = "active" | "pending" | "suspended" | "inactive";

type EnrolleeRow = {
  id: string;
  name: string;
  enrolleeId: string;
  scheme: string;
  plan: string;
  role: string;
  balance: string;
  utilization: number;
  status?: StatusValue;
};

export default function BeneficiariesPage() {
  const [search, setSearch] = React.useState("");
  const [filters, setFilters] = React.useState<{
    statuses: StatusValue[];
    plans: string[];
  }>({ statuses: [], plans: [] });

  // Build a stable filters object for the query key (so React Query
  // doesn't think it's a new object on every render)
  const queryFilters = React.useMemo(
    () => ({
      search,
      statuses: filters.statuses,
      plans: filters.plans,
      // you can add page / limit here later if backend supports it
    }),
    [search, filters.statuses, filters.plans],
  );

  // === 1) Fetch beneficiaries from backend ===
  const { data, isLoading, isError, error } = useBeneficiaries(queryFilters);

  // === 2) Map API payload -> UI-friendly rows ===
  const beneficiaries: EnrolleeRow[] = React.useMemo(() => {
    if (!data) return [];

    // Support both shapes: { data: [...] } or just [...]
    const rawList: any[] = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];

    return rawList.map((item: any): EnrolleeRow => {
      // Name: either single `name` or first+surname
      const firstName = item.enrolee_first_name ?? item.first_name ?? "";
      const surname = item.enrolee_surname ?? item.last_name ?? "";
      const combined =
        `${firstName} ${surname}`.trim() || item.name || "Unknown Enrollee";

      // Enrollee ID/code
      const enrolleeId =
        item.enrolee_code ??
        item.enrolee_id ??
        item.enrollee_code ??
        item.enrolleeId ??
        "";

      // Scheme & plan labels
      const scheme =
        item.scheme ??
        item.scheme_name ??
        item.schemeCode ??
        item.scheme_code ??
        "-";

      const plan =
        item.plan ?? item.plan_name ?? item.planCode ?? item.plan_code ?? "-";

      // Role/relationship
      const role =
        item.role ?? item.relationship ?? item.enrollee_type ?? "Principal";

      // Balance formatting
      const rawBalance =
        typeof item.balance === "number"
          ? item.balance
          : typeof item.wallet_balance === "number"
            ? item.wallet_balance
            : 0;

      const balance =
        typeof rawBalance === "number"
          ? `₦${rawBalance.toLocaleString("en-NG", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`
          : typeof item.balance === "string"
            ? item.balance
            : "₦0";

      // Utilization %
      const utilization =
        Number(
          item.utilization ?? item.utilization_percent ?? item.utilization_used,
        ) || 0;

      // Status (normalize to our StatusValue if possible)
      const statusRaw = String(item.status ?? "").toLowerCase();
      const statusMap: Record<string, StatusValue> = {
        active: "active",
        pending: "pending",
        suspended: "suspended",
        inactive: "inactive",
      };
      const status = statusMap[statusRaw];

      return {
        id: String(item.id ?? enrolleeId ?? Math.random()),
        name: combined,
        enrolleeId: String(enrolleeId),
        scheme,
        plan,
        role,
        balance,
        utilization,
        status,
      };
    });
  }, [data]);

  // === 3) Plan options for the filter popover ===
  const planOptions = React.useMemo(
    () =>
      Array.from(
        new Set(
          beneficiaries
            .map((e) => e.plan)
            .filter((p) => p && typeof p === "string"),
        ),
      ),
    [beneficiaries],
  );

  // === 4) Client-side filtering (search + plans + statuses) ===
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return beneficiaries.filter((e) => {
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.enrolleeId.toLowerCase().includes(q);

      const matchesPlans =
        filters.plans.length === 0 || filters.plans.includes(e.plan);

      const matchesStatuses =
        filters.statuses.length === 0 ||
        (e.status != null && filters.statuses.includes(e.status));

      return matchesSearch && matchesPlans && matchesStatuses;
    });
  }, [beneficiaries, search, filters.plans, filters.statuses]);

  // Total count: prefer server pagination total if available
  const totalCount: number = React.useMemo(() => {
    if (data?.pagination?.total != null) {
      return Number(data.pagination.total) || 0;
    }
    return beneficiaries.length;
  }, [data, beneficiaries.length]);

  return (
    <Card className="p-0">
      <CardHeader className="pb-0 pt-5 px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-[18px]/[28px] tracking-normal font-hnd font-bold text-[#344054]">
          {isLoading ? (
            <>Loading enrollees…</>
          ) : (
            <>
              You have{" "}
              <span className="font-semibold">
                {totalCount.toLocaleString()}
              </span>{" "}
              Enrollees
            </>
          )}
        </CardTitle>

        <div className="flex items-center gap-4">
          <Filters
            search={search}
            onSearchChange={setSearch}
            statuses={filters.statuses}
            plans={filters.plans}
            onChangeFilters={(f) => setFilters(f)}
            planOptions={planOptions}
          />

          <AddEnrolleeForm />
        </div>
      </CardHeader>

      {/* Error / Empty / Table */}
      {isError ? (
        <div className="px-6 py-8 text-sm text-red-500">
          Failed to load enrollees:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      ) : (
        <EnrolleesTable
          enrollees={filtered}
          isLoading={isLoading}
          // if your table accepts these extra props, otherwise
          // just pass `enrollees={filtered}`
        />
      )}
    </Card>
  );
}
