"use client"

import { useQuery } from "@tanstack/react-query"
import apiClient from "./client"

/* ============================
   Shared types (reuse)
============================ */

export interface BillingPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

/* ============================
   Billing list
============================ */

export type BillingStatus =
  | "pending"
  | "approved"
  | "paid"
  | "rejected"
  | "flagged"
  | "queried"
  | string

export interface BillListItem {
  id: number
  bill_id?: string | number
  provider_id?: number | string
  provider_name?: string | null

  total_cost?: number | string | null
  created_at?: string | null
  start_date?: string | null
  end_date?: string | null

  status?: BillingStatus
  remark?: string | null

  // allow extra backend fields
  [key: string]: any
}

export interface BillingFilters {
  page?: number
  limit?: number
  start_date?: string // "YYYY-MM-DD" (or what your API expects)
  end_date?: string
  provider_id?: string | number
  min_cost?: string | number
  max_cost?: string | number
  status?: string
}

export interface BillingApiResponse {
  status: "success" | "empty" | "error" | string
  data: BillListItem[]
  pagination?: BillingPagination
  message?: string
  [key: string]: any
}

export function useBilling(filters: BillingFilters = {}) {
  return useQuery({
    queryKey: ["billing", filters],
    queryFn: async (): Promise<BillingApiResponse> => {
      const body = {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        start_date: filters.start_date ?? "",
        end_date: filters.end_date ?? "",
        provider_id: filters.provider_id ?? "",
        min_cost: filters.min_cost ?? "",
        max_cost: filters.max_cost ?? "",
        status: filters.status ?? "",
      }

      const res = await apiClient.post<BillingApiResponse>(
        "/fetch-billing.php",
        body
      )

      const payload = res.data

      if (!payload) {
        throw new Error("Failed to fetch billing")
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

      throw new Error(payload.message || "Failed to fetch billing")
    },
  })
}

/* ============================
   Billing details (optional)
   Only include if you have an endpoint for it.
============================ */

export interface BillDetail {
  id?: number
  bill_id?: string | number

  provider_id?: number | string
  provider_name?: string | null

  start_date?: string | null
  end_date?: string | null

  status?: BillingStatus
  total_cost?: string | number | null

  // e.g. claim list, items, etc.
  items?: any[]

  [key: string]: any
}

export interface BillingDetailsApiResponse {
  status: "success" | "empty" | "error" | string
  data?: BillDetail
  message?: string
}

export interface BillingDetailsRequest {
  bill_id?: number | string
  id?: number
}

export function useBillingDetails(params: BillingDetailsRequest) {
  return useQuery({
    queryKey: ["billing-details", params],
    enabled: !!(params?.bill_id || params?.id),
    queryFn: async (): Promise<BillDetail | null> => {
      // change endpoint/body to your real details API if it exists
      const body = {
        bill_id: params.bill_id ?? "",
        id: params.id ?? "",
      }

      const res = await apiClient.post<BillingDetailsApiResponse>(
        "/fetch-billing-details.php",
        body
      )

      const payload = res.data

      if (!payload) throw new Error("Failed to fetch billing details")

      if (payload.status === "success") return payload.data ?? null
      if (payload.status === "empty") return null

      throw new Error(payload.message || "Failed to fetch billing details")
    },
  })
}
