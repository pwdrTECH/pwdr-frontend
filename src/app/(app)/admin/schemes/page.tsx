"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import * as React from "react";
import AddPlan from "./_components/Add";
import { EmptyState } from "../_components/EmptyState";
import { SchemesList } from "./_components/SchemesList";
import type { SchemeGroup, SchemeCode, PlanItem } from "./_components/types";
import { useSchemes } from "@/lib/api/schemes";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import Loader from "@/components/loader/lottie/loader";

/* ---------------- Helper hook: build SchemeGroup[] from APIs ---------------- */

type RawPlan = {
  id: number;
  scheme_id: number;
  name: string;
  premium: string | number;
  utilization_threshold?: string | number;
  days_to_activate?: string | number;
  services?: {
    name: string;
    cost: string | number;
    utilization_limit?: string | number;
    frequency_limit?: string;
    status?: string;
  }[];
  status?: string;
};

type FetchPlansResponse = {
  status: string;
  data?: RawPlan[];
};

function useSchemeGroups() {
  const {
    data: schemes,
    isLoading: schemesLoading,
    isError: schemesError,
  } = useSchemes();

  // Fetch plans for each scheme
  const {
    data: plansByScheme,
    isLoading: plansLoading,
    isError: plansError,
  } = useQuery({
    queryKey: ["plans-by-scheme", (schemes ?? []).map((s: any) => s.id)],
    enabled: !!schemes && schemes.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        (schemes ?? []).map(async (scheme: any) => {
          const res = await apiClient.post<FetchPlansResponse>(
            "/fetch-plans.php",
            {
              page: 1,
              limit: 100,
              scheme_id: scheme.id,
            },
          );

          const rawPlans: RawPlan[] = res.data?.data ?? [];
          return {
            scheme,
            plans: rawPlans,
          };
        }),
      );

      return results;
    },
  });

  const groups: SchemeGroup[] = React.useMemo(() => {
    if (!schemes || !plansByScheme) return [];

    // Allowed scheme codes from your type
    const ALLOWED_CODES: SchemeCode[] = ["NHIS", "PHIS", "TSHIP", "NYSC"];

    const normalizeSchemeCode = (raw: string): SchemeCode => {
      const upper = raw.toUpperCase().trim();

      if (ALLOWED_CODES.includes(upper as SchemeCode)) {
        return upper as SchemeCode;
      }

      // Fallback if backend sends something unexpected
      return "PHIS";
    };

    return plansByScheme.map(({ scheme, plans }) => {
      const rawCode: string =
        (scheme.code as string) ?? (scheme.short_code as string) ?? scheme.name;

      const schemeCode: SchemeCode = normalizeSchemeCode(rawCode);
      const schemeTitle: string = scheme.name;
      const schemeSubtitle: string =
        scheme.description ?? "Private Health Insurance Scheme";

      const mappedPlans: PlanItem[] = plans.map((p) => {
        const premium = Number(p.premium ?? 0);
        const waitDays = p.days_to_activate ? Number(p.days_to_activate) : 0;
        const utilization = p.utilization_threshold
          ? Number(p.utilization_threshold)
          : 0;
        const servicesArray = Array.isArray(p.services) ? p.services : [];

        return {
          id: String(p.id),
          name: p.name ?? "Unnamed Plan",
          premium,
          servicesCount: servicesArray.length,
          waitDays,
          utilization,
          schemes: [schemeCode],
          serviceItems: servicesArray.map((s) => s.name ?? "").filter(Boolean),
          status: (p.status as any) ?? "active",
        };
      });

      return {
        code: schemeCode,
        title: schemeTitle,
        subtitle: schemeSubtitle,
        active:
          scheme.status === "active" ||
          scheme.active === 1 ||
          scheme.is_active === 1,
        plans: mappedPlans,
      };
    });
  }, [schemes, plansByScheme]);

  return {
    groups,
    isLoading: schemesLoading || plansLoading,
    isError: schemesError || plansError,
  };
}

/* ---------------- Page ---------------- */

export default function SchemesPage() {
  const [q, setQ] = React.useState("");
  const { groups, isLoading } = useSchemeGroups();

  const filteredGroups = React.useMemo(() => {
    if (!q.trim()) return groups;
    const lower = q.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        plans: g.plans.filter(
          (p) =>
            p.name.toLowerCase().includes(lower) ||
            p.serviceItems.some((s) => s.toLowerCase().includes(lower)),
        ),
      }))
      .filter((g) => g.plans.length > 0);
  }, [groups, q]);

  const totalPlans = React.useMemo(
    () => groups.reduce((n, g) => n + g.plans.length, 0),
    [groups],
  );
  const countSchemes = groups.length;
  const hasAny = totalPlans > 0;

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Header */}
      <div className="pb-0 pt-5 px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[18px]/[28px] tracking-normal font-hnd font-bold text-[#344054]">
          {/* Summary */}
          {hasAny && (
            <>
              You have <b>{countSchemes}</b> Scheme
              {countSchemes !== 1 ? "s" : ""} + <b>{totalPlans}</b> Plan
              {totalPlans !== 1 ? "s" : ""}
            </>
          )}
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative w-full sm:w-[284px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#B4B4B4]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Scheme/ Plans"
              className="h-10 w-full rounded-[12px] pl-9 py-2.5 pr-4 bg-[#F8F8F8] shadow-[0px_1px_2px_0px_#1018280D] border-[#0000000F]"
            />
          </div>
          <div className="w-fit">
            <AddPlan />
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading && !hasAny ? (
        <Loader message="Loading your schemes and plans. Please wait..." />
      ) : !hasAny ? (
        <EmptyState
          message="  Get started by adding a plan to your schemes. You can further customize it to your taste."
          action={<AddPlan />}
        />
      ) : (
        <SchemesList groups={filteredGroups} />
      )}
    </div>
  );
}
