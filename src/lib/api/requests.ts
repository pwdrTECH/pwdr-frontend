"use client"

import { apiClient } from "@/lib/api/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { SimpleApiResponse } from "./types"

/* ============================================================================
  TYPES
============================================================================ */

export type RequestChannel = "all" | "email" | "whatsapp" | "chat"

export type RequestStatusFilter =
  | "all"
  | "unread"
  | "overdue"
  | "resolved"
  | "approved"
  | "completed"
  | "pending"
  | "rejected"

export interface RequestFilters {
  page?: number
  limit?: number
  search?: string
  channel?: RequestChannel
  status?: RequestStatusFilter
}

export interface RequestsPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface RequestsApiResponse<T = any> {
  status: "success" | "empty" | string
  data?: T[]
  pagination?: RequestsPagination
  message?: string
  [key: string]: any
}

export interface RequestDetailsApiResponse {
  status: string
  data?: any
  message?: string
  [key: string]: any
}

export interface RequestDetailParams {
  claim_id?: number
  tracking_number?: string
}

export type ProcessClaimPayload = {
  claim_id: number
  service_id: number
  status: string
  notes: string
}

export type SubmitClaimRequestPayload = {
  claim_id: number
}

/* ============================================================================
  HELPERS
============================================================================ */

function normalizeFilterValue(v?: string) {
  const t = String(v ?? "").trim()
  if (!t || t === "all") return undefined // ✅ IMPORTANT: return undefined, not ""
  return t
}

/* ============================================================================
  HOOKS
============================================================================ */

/** =========================
 *  LIST: /fetch-requests.php
 *  ========================= */
export function useRequests(filters: RequestFilters = {}) {
  return useQuery({
    queryKey: ["requests", filters],
    queryFn: async (): Promise<RequestsApiResponse> => {
      const body = {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        search: filters.search ?? "",
        channel: normalizeFilterValue(filters.channel), // ✅ undefined when "all"
        status: normalizeFilterValue(filters.status), // ✅ undefined when "all"
      }

      const res = await apiClient.post<RequestsApiResponse>(
        "/fetch-requests.php",
        body
      )

      const payload = res?.data
      if (!payload) throw new Error("Failed to fetch requests")

      // Normalize payload
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
          pagination:
            payload.pagination ??
            ({
              current_page: body.page,
              per_page: body.limit,
              total: 0,
              total_pages: 0,
              has_next: false,
              has_prev: false,
            } as RequestsPagination),
        }
      }

      throw new Error(payload.message || "Failed to fetch requests")
    },
  })
}

/** =========================
 *  DETAILS: /fetch-request-details.php
 *  ========================= */
export function useRequestDetails(params?: RequestDetailParams) {
  const enabled = Boolean(params?.claim_id || params?.tracking_number)

  return useQuery<RequestDetailsApiResponse>({
    enabled,
    queryKey: ["request-detail", params?.claim_id, params?.tracking_number],
    queryFn: async (): Promise<RequestDetailsApiResponse> => {
      const res = await apiClient.post<RequestDetailsApiResponse>(
        "/fetch-request-details.php",
        params
      )

      // ✅ Fix TS: res.data can be typed as possibly undefined in some wrappers
      if (!res?.data) {
        throw new Error("Failed to fetch request details")
      }

      return res.data
    },
  })
}

/** =========================
 *  MUTATION: /process-claim-service.php
 *  ========================= */
export function useProcessClaim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ProcessClaimPayload) => {
      const response = await apiClient.post<SimpleApiResponse>(
        "/process-claim-service.php",
        payload
      )

      const apiResponse = response?.data
      if (!apiResponse) throw new Error("No response from server")

      if (apiResponse.status !== "success") {
        if ((apiResponse as any)?.status === "exist") {
          throw new Error("This claim service has already been processed")
        }
        throw new Error(apiResponse.message || "Failed to process claim")
      }

      return apiResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["request-detail"] })
      queryClient.invalidateQueries({ queryKey: ["whatsapp-requests"] })
    },
  })
}

/** =========================
 *  MUTATION: /complete-claim.php
 *  ========================= */
export function useSubmitRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SubmitClaimRequestPayload) => {
      const response = await apiClient.post<SimpleApiResponse>(
        "/complete-claim.php",
        payload
      )

      const apiResponse = response?.data
      if (!apiResponse) throw new Error("No response from server")

      if (apiResponse.status !== "success") {
        if ((apiResponse as any)?.status === "exist") {
          throw new Error("This claim request has already been processed")
        }
        throw new Error(apiResponse.message || "Failed to process claim")
      }

      return apiResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] })
      queryClient.invalidateQueries({ queryKey: ["request-detail"] })
      queryClient.invalidateQueries({ queryKey: ["whatsapp-requests"] })
    },
  })
}

/** =========================
 *  LIST: /fetch-claims-requests.php  (WhatsApp)
 *  ========================= */
export function useChannelsRequests(filters: {
  page: number
  limit: number
  hospital_id?: string
  enrolee_id?: string
}) {
  return useQuery({
    queryKey: ["whatsapp-requests", filters],
    queryFn: async (): Promise<RequestsApiResponse> => {
      const res = await apiClient.post<RequestsApiResponse>(
        "/fetch-claims-requests.php",
        {
          page: filters.page,
          limit: filters.limit,
          hospital_id: filters.hospital_id ?? "",
          enrolee_id: filters.enrolee_id ?? "",
        }
      )

      const payload = res?.data
      if (!payload) throw new Error("Failed to fetch WhatsApp requests")

      if (payload.status !== "success") {
        throw new Error(payload.message || "Failed to fetch WhatsApp requests")
      }

      return {
        ...payload,
        data: Array.isArray(payload.data) ? payload.data : [],
      }
    },
    staleTime: 30_000,
  })
}
