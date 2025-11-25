"use client";

import Loader from "@/components/loader/lottie/loader";
import { TableTitle } from "@/components/table";
import { Card, CardHeader } from "@/components/ui/card";
import { useBeneficiaries } from "@/lib/api/beneficiaries";
import * as React from "react";
import { EmptyState } from "../_components/EmptyState";
import { AddEnrolleeForm } from "./_components/add";
import Filters from "./_components/filters";
import EnrolleesTable from "./_components/table";

type StatusValue = "active" | "pending" | "suspended" | "inactive";

export type EnrolleeRow = {
  id: number | string;
  email: string;
  first_name: string;
  surname: string;
  other_names: string;
  gender: string;
  dob: string;
  passport: string;
  address: string;
  city: string;
  state: number;
  phone: string;
  marital_status: string;
  origin_state: number;
  origin_lga: number;
  employment_status: string;
  occupation: string;
  active: number;
  date_created: string;
  enrolee_id: string;
  user_role: string;
  principal_id?: string | null;
  hmo_id: number;
  plan_id: number;
  next_of_kin: string;
  next_of_kin_relationship: string;
  next_of_kin_phone: string;
  next_of_kin_address: string;
  plan_name: string;
  state_name: string;
  scheme: string;
  plan: number | string;
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

  const queryFilters = React.useMemo(
    () => ({
      search,
      statuses: filters.statuses,
      plans: filters.plans,
    }),
    [search, filters.statuses, filters.plans],
  );

  const { data, isLoading, isError, error } = useBeneficiaries(queryFilters);

  const beneficiaries: EnrolleeRow[] = React.useMemo(() => {
    if (!data) return [];

    const rawList: any[] = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
        ? data
        : [];

    return rawList.map((item: any): EnrolleeRow => {
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
        id: item.id,
        email: item.email || "",
        first_name: item.first_name || "",
        surname: item.surname || "",
        other_names: item.other_names || "",
        gender: item.gender || "",
        dob: item.dob || "",
        passport: item.passport || "",
        address: item.address || "",
        city: item.city || "",
        state: item.state || 0,
        phone: item.phone || "",
        marital_status: item.marital_status || "",
        origin_state: item.origin_state || 0,
        origin_lga: item.origin_lga || 0,
        employment_status: item.employment_status || "",
        occupation: item.occupation || "",
        active: item.active,
        date_created: String(item.date_created),
        enrolee_id: item.enrolee_id,
        user_role: item.user_role,
        principal_id: item.principal_id,
        hmo_id: item.hmo_id,
        plan_id: item.plan_id,
        next_of_kin: item.next_of_kin,
        next_of_kin_relationship: item.next_of_kin_relationship,
        next_of_kin_phone: item.next_of_kin_phone,
        next_of_kin_address: item.next_of_kin_address,
        plan_name: item.plan_name,
        state_name: item.state_name,
        utilization,
        scheme,
        plan,
        role,
        balance,
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
            .map((e) => e.plan_name)
            .filter((p) => p && typeof p === "string"),
        ),
      ),
    [beneficiaries],
  );

  // === 4) Client-side filtering (search + plans + statuses) ===
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return beneficiaries.filter((e) => {
      const combined = `${e.first_name} ${e.surname} ${e.other_names}`.trim();
      const matchesSearch =
        !q ||
        combined.toLowerCase().includes(q) ||
        e.enrolee_id.toLowerCase().includes(q);

      const matchesPlans =
        filters.plans.length === 0 || filters.plans.includes(e.plan_name);

      const matchesStatuses =
        filters.statuses.length === 0 ||
        (e.status != null && filters.statuses.includes(e.status));

      return matchesSearch && matchesPlans && matchesStatuses;
    });
  }, [beneficiaries, search, filters.plans, filters.statuses]);

  const hasAny = filtered?.length > 0;

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
        {hasAny ? (
          <TableTitle>
            You have {totalCount.toLocaleString() || 0} Enrollees
          </TableTitle>
        ) : (
          <div />
        )}

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
      {isLoading ? (
        <Loader message="Loading your enrollees. Please wait..." />
      ) : !hasAny ? (
        <div className="py-12">
          <EmptyState message="No claim data available" />
        </div>
      ) : isError ? (
        <div className="py-12">
          <span className="px-6 py-8 text-sm text-red-500">
            Failed to load enrollees:{" "}
            {error instanceof Error ? error?.message : "Unknown error"}
          </span>
        </div>
      ) : hasAny ? (
        <span>
          <EnrolleesTable enrollees={filtered} />
        </span>
      ) : null}
    </Card>
  );
}
