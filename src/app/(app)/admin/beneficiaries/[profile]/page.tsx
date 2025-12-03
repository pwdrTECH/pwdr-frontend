"use client";

import { useParams, useSearchParams } from "next/navigation";
import * as React from "react";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Card } from "@/components/ui/card";

import ClaimsTable, { type Claim } from "./_components/claim-table";
import { DependentsSection } from "./_components/dependent";
import { ProfileHeader } from "./_components/header";
import { NextOfKinSection } from "./_components/next-of-kin";
import { PlanSchemeSection } from "./_components/plan-scheme";
import { ProfileStats } from "./_components/stats";

import { useEnrolleeDetails } from "@/lib/api/beneficiaries";
import type { ClaimListItem } from "@/lib/api/claims";
import { useEnrolleeClaimHistory } from "@/lib/api/claims";
import { EditEnrolleeForm } from "../_components/edit";
import RestrictProfile from "../_components/restrict";
import { UpgradePlan } from "../_components/upgrade";

function unslug(str: string) {
  return decodeURIComponent(str.replace(/-/g, " "));
}

// 🔹 Map backend ClaimListItem → UI Claim
function mapClaimListItemToClaim(item: ClaimListItem): Claim {
  // Try to be defensive with fields that might not always exist
  const rawStatus = (item.status || "").toLowerCase();

  let status: Claim["status"];
  if (rawStatus === "completed") status = "Completed";
  else if (rawStatus === "rejected" || rawStatus === "declined")
    status = "Rejected";
  else status = "Pending";

  // If your backend has a total/amount field use it here instead of [key: string]: any
  const rawAmount = (item as any).total_amount ?? (item as any).amount ?? null;
  const cost =
    rawAmount != null && !Number.isNaN(Number(rawAmount))
      ? `₦${Number(rawAmount).toLocaleString("en-NG")}`
      : "—";

  return {
    claimId: item.tracking_number || String(item.id),
    diagnosis: item.diagnosis || "—",
    service: item.channel || "—",
    drug: item.prescription || "—",
    cost,
    status,
    date: item.encounter_date || "—",
  };
}

export default function BeneficiaryProfile() {
  const params = useParams<{ beneficiary: string }>();
  const searchParams = useSearchParams();

  const beneficiarySlug = params?.beneficiary ?? "";
  const enrolleeCodeFromQuery = searchParams.get("enid") ?? "";

  // Use the query param as the real enrollee_id for the API
  const enrolleeIdForApi = enrolleeCodeFromQuery || beneficiarySlug;

  const {
    data: enrollee,
    isLoading,
    isError,
    error,
  } = useEnrolleeDetails({
    enrolee_id: enrolleeIdForApi,
  });

  const fallbackName = React.useMemo(
    () => unslug(beneficiarySlug),
    [beneficiarySlug],
  );

  const beneficiaryName =
    enrollee &&
    (enrollee.first_name ||
      enrollee.other_names ||
      enrollee.surname ||
      enrollee.enrolee_id)
      ? [enrollee.first_name, enrollee.other_names, enrollee.surname]
          .filter(Boolean)
          .join(" ")
      : fallbackName;
  const enrolleeIdForHistory = enrollee?.enrolee_id ?? "";
  // Fetch claims for this enrollee using their internal id
  const {
    data: claimsResponse,
    isLoading: claimsLoading,
    isError: claimsError,
    error: claimsErrorObj,
  } = useEnrolleeClaimHistory({
    enrolee_id: enrolleeIdForHistory,
    page: 1,
    limit: 20,
  });
  const rawClaims: ClaimListItem[] = claimsResponse?.data?.claims ?? [];
  const uiClaims: Claim[] = React.useMemo(
    () => rawClaims.map(mapClaimListItemToClaim),
    [rawClaims],
  );

  return (
    <div className="w-full flex flex-col gap-4">
      <Breadcrumbs />

      <div className="w-full flex justify-end">
        {/* Action buttons */}
        <div className="h-10 flex gap-4 py-1">
          <UpgradePlan enrollee={enrollee ?? null} />
          <RestrictProfile />
          <EditEnrolleeForm enrollee={enrollee ?? null} />
        </div>
      </div>
      <Card className="px-8 rounded-2xl flex flex-col gap-6">
        {/* Loading / Error states */}
        {isLoading && (
          <div className="py-10 text-center text-sm text-[#6B7280]">
            Loading enrollee profile…
          </div>
        )}

        {isError && (
          <div className="py-10 text-center text-sm text-red-600">
            {(error as Error)?.message || "Failed to load enrollee profile."}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Left column: profile + stats + dependents */}
              <div className="w-full sm:w-[70%] flex flex-col gap-9">
                <ProfileHeader
                  name={beneficiaryName}
                  enrollee={enrollee ?? undefined}
                />
                <ProfileStats enrollee={enrollee ?? undefined} />
                <DependentsSection enrollee={enrollee ?? undefined} />
              </div>

              {/* Right column: plan/scheme + next of kin */}
              <div className="w-full sm:w-[30%] flex flex-col gap-6">
                <PlanSchemeSection enrollee={enrollee ?? undefined} />
                <NextOfKinSection enrollee={enrollee ?? undefined} />
              </div>
            </div>

            {/* Claims */}
            {claimsLoading && (
              <div className="py-6 text-sm text-[#6B7280]">Loading claims…</div>
            )}

            {claimsError && (
              <div className="py-6 text-sm text-red-600">
                {(claimsErrorObj as Error)?.message ||
                  "Failed to load claims for this enrollee."}
              </div>
            )}

            {!claimsLoading && !claimsError && (
              <ClaimsTable claims={uiClaims} />
            )}
          </>
        )}
      </Card>
    </div>
  );
}
