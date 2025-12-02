"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "./client"
import type { SimpleApiResponse } from "./types"

/* ============================
   Filters & List Types
============================ */

export interface ClaimFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  enrolee_id?: string | number
  provider_id?: string | number
  plan_id?: string | number
}

export interface ClaimListItem {
  id: number
  provider_id: number
  enrolee_id: number
  tracking_number: string
  plan_id: number
  channel: string
  encounter_date: string
  status: string
  date_created: number
  created_by: number
  assigned_to: number | null
  invoice_id: number | null
  queried: number
  processed: number
  diagnosis: string | null
  prescription: string | null
  radiology: string | null
  lab: string | null
  enrolee_first_name: string | null
  enrolee_surname: string | null
  enrolee_code: string | null
  enrolee_phone: string | null
  enrolee_email: string | null
  plan_name: string | null
  [key: string]: any
}

export interface ClaimsPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface ClaimsApiResponse {
  status: string
  data: ClaimListItem[]
  pagination?: ClaimsPagination
  message?: string
  [key: string]: any
}

/* ============================
   Detail Types
============================ */

/** Single claim line item – aligned to what you use in the modal */
export interface ClaimItem {
  diagnosis: string | null
  services: string | null
  service_code: string | null
  category: string | null
  qty: string | number | null
  submitted_bill: string | null
  status: string | null
  payable_bill: string | null
  [key: string]: any
}

/** Claim header + items – includes all fields the UI currently reads */
export interface ClaimDetail {
  id?: number
  tracking_number?: string

  provider_id?: number
  provider_name?: string | null

  enrollee_id?: string | null
  enrollee_name?: string | null
  enrollee_age?: number | string | null
  enrollee_gender?: string | null

  encounter_date?: string | null
  approved_date?: string | null
  total_cost?: string | null

  bank_account_number?: string | null
  bank_name?: string | null
  bank_account_name?: string | null

  approver_name?: string | null
  approver_role?: string | null

  items?: ClaimItem[]

  [key: string]: any
}

export interface ClaimDetailsApiResponse {
  status: "success" | "empty" | "error" | string
  data?: ClaimDetail
  message?: string
}

export interface ClaimDetailsRequest {
  claim_id?: number
  tracking_number?: string
}

export type ProcessClaimPayload = {
  claim_id: number
  service_id: number
  status: string
  note: string
}
/* ============================
   List Claims
============================ */

export function useClaims(filters: ClaimFilters = {}) {
  return useQuery({
    queryKey: ["claims", filters],
    queryFn: async (): Promise<ClaimsApiResponse> => {
      const body = {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        search: filters.search ?? "",
        status: filters.status ?? "pending",
        enrolee_id: filters.enrolee_id ?? "",
        provider_id: filters.provider_id ?? "",
        plan_id: filters.plan_id ?? "",
      }

      const res = await apiClient.post<ClaimsApiResponse>(
        "/fetch-claims.php",
        body
      )

      const payload = res.data

      if (!payload) {
        throw new Error("Failed to fetch claims")
      }

      if (payload.status === "success") {
        return {
          ...payload,
          data: Array.isArray(payload.data) ? payload.data : [],
        }
      }

      if (payload.status === "empty") {
        return {
          ...payload,
          status: "success", // ✅ same trick as beneficiaries
          data: [],
          pagination: payload.pagination ?? {
            current_page: body.page,
            per_page: body.limit,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false,
          },
        }
      }

      throw new Error(payload.message || "Failed to fetch claims")
    },
  })
}

/* ============================
   Claim Details
   POST /fetch-claim-details.php
============================ */

export function useClaimDetails(params: ClaimDetailsRequest) {
  return useQuery({
    queryKey: ["claim-details", params],
    enabled: !!(params.claim_id || params.tracking_number),
    queryFn: async (): Promise<ClaimDetail | null> => {
      const body = {
        claim_id: params.claim_id ?? "",
        tracking_number: params.tracking_number ?? "",
      }

      const res = await apiClient.post<ClaimDetailsApiResponse>(
        "/fetch-claim-details.php",
        body
      )

      const payload = res.data

      if (!payload) {
        throw new Error("Failed to fetch claim details")
      }

      if (payload.status === "success") {
        // normalize missing data to null instead of undefined
        return payload.data ?? null
      }

      if (payload.status === "empty") {
        return null
      }

      throw new Error(payload.message || "Failed to fetch claim details")
    },
  })
}
/* ============================
    Create Plan (existing)
============================ */

export function useProcessClaim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: ProcessClaimPayload
    ): Promise<SimpleApiResponse> => {
      const response = await apiClient.post<SimpleApiResponse>(
        "/process-claim-service.php",
        payload
      )

      const apiResponse = response.data

      if (!apiResponse || apiResponse.status !== "success") {
        if (apiResponse?.status === "exist") {
          // match backend "exist" semantics but with claim wording
          throw new Error("This claim service has already been processed")
        }
        throw new Error(apiResponse?.message || "Failed to process claim")
      }

      return apiResponse
    },
    onSuccess: () => {
      // Invalidate claims and claim-details caches so UI refreshes
      queryClient.invalidateQueries({ queryKey: ["claims"] })
      queryClient.invalidateQueries({ queryKey: ["claim-details"] })
    },
  })
}
