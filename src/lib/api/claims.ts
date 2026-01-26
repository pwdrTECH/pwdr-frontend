"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "./client"

/* ============================
   Shared types
============================ */

export interface ClaimsPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface ClaimListItem {
  id: number
  tracking_number: string
  provider_id: number
  plan_id: number
  channel: string
  encounter_date: string
  status: string
  diagnosis: string | null
  prescription: string | null
  lab: string | null
  radiology: string | null
  // plus any extra fields (scoring, total_amount, etc)
  [key: string]: any
}

/* ============================
   Claim list
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

export interface ClaimsApiResponse {
  status: string
  data: ClaimListItem[]
  pagination?: ClaimsPagination
  message?: string
  [key: string]: any
}

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
        body,
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
          status: "success",
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
   Claim details
============================ */

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

export interface EnrolleeClaimHistoryFilters {
  enrolee_id: string // HMO code e.g. "AXA17640612936446"
  page?: number
  limit?: number
}

export interface EnrolleeClaimHistoryEnrollee {
  id: number
  enrolee_id: string
  full_name: string
}

export interface EnrolleeClaimHistoryData {
  enrolee: EnrolleeClaimHistoryEnrollee
  claims: ClaimListItem[]
  pagination: ClaimsPagination
}

export interface EnrolleeClaimHistoryApiResponse {
  status: string
  data?: EnrolleeClaimHistoryData
  message?: string
  [key: string]: any
}

export type NewClaimServiceLine = {
  item_id: number
  item_type: string // "consultation" | "laboratory" | "pharmacy" | "radiology" | ...
  quantity: number
  cost: number
}

export type NewClaimPayload = {
  provider_id: number
  enrolee_id: string | number
  plan_id: number
  channel: string
  encounter_date: string
  diagnosis: string
  prescription?: string
  radiology?: string
  lab?: string
  services: NewClaimServiceLine[]
}

export type NewClaimApiResponse = {
  status: "success" | "error" | string
  message?: string
  data?: any
  [k: string]: any
}

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
        body,
      )

      const payload = res.data

      if (!payload) {
        throw new Error("Failed to fetch claim details")
      }

      if (payload.status === "success") {
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
   New claim
============================ */

export function useCreateNewClaim() {
  const qc = useQueryClient()

  return useMutation({
    mutationKey: ["new-claim"],
    mutationFn: async (
      payload: NewClaimPayload,
    ): Promise<NewClaimApiResponse> => {
      const res = await apiClient.post<NewClaimApiResponse>(
        "/new-claim.php",
        payload,
      )
      const body = res.data
      if (!body) throw new Error("No response from server")

      if (String(body.status).toLowerCase() !== "success") {
        throw new Error(body.message || "Failed to submit claim")
      }
      return body
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["claims"] })
      await qc.invalidateQueries({ queryKey: ["claim-details"] })
      await qc.invalidateQueries({ queryKey: ["request-details"] })
    },
  })
}
/* ============================
   Enrollee claim history
============================ */

export function useEnrolleeClaimHistory(filters?: EnrolleeClaimHistoryFilters) {
  const enabled = !!filters?.enrolee_id

  return useQuery({
    enabled,
    queryKey: [
      "enrollee-claim-history",
      filters?.enrolee_id,
      filters?.page ?? 1,
      filters?.limit ?? 20,
    ],
    queryFn: async (): Promise<EnrolleeClaimHistoryApiResponse> => {
      if (!filters?.enrolee_id) {
        throw new Error("Missing enrolee_id")
      }

      const baseRequest = {
        enrolee_id: filters.enrolee_id,
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
      }

      const res = await apiClient.post<EnrolleeClaimHistoryApiResponse>(
        "/fetch-enrolee-claim-history.php",
        baseRequest,
      )

      const payload = res.data

      if (!payload) {
        throw new Error("Failed to fetch enrollee claim history")
      }

      const defaultPagination: ClaimsPagination = {
        current_page: baseRequest.page,
        per_page: baseRequest.limit,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      }

      const baseData: EnrolleeClaimHistoryData = {
        enrolee: {
          id: 0,
          enrolee_id: filters.enrolee_id,
          full_name: "",
        },
        claims: [],
        pagination: defaultPagination,
      }

      if (payload.status === "success") {
        const incoming = payload.data

        return {
          ...payload,
          data: {
            enrolee: incoming?.enrolee ?? baseData.enrolee,
            claims: Array.isArray(incoming?.claims) ? incoming.claims : [],
            pagination: incoming?.pagination ?? defaultPagination,
          },
        }
      }

      if (payload.status === "empty") {
        const incoming = payload.data

        return {
          ...payload,
          data: {
            ...baseData,
            pagination: incoming?.pagination ?? defaultPagination,
          },
        }
      }

      throw new Error(
        payload.message || "Failed to fetch enrollee claim history",
      )
    },
  })
}
