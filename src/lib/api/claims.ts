"use client"

import { getSession } from "@/lib/auth/session"
import { useQuery } from "@tanstack/react-query"
import apiClient from "./client"

/* ------------------ Types ------------------ */

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
  // extra fields if backend adds more
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

/* ------------------ Hook ------------------ */

export function useClaims(filters: ClaimFilters = {}) {
  return useQuery({
    queryKey: ["claims", filters],
    queryFn: async (): Promise<ClaimsApiResponse> => {
      const token = getSession()?.access_token

      const body = {
        ...(token ? { token } : {}),
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

      if (!payload || payload.status !== "success") {
        throw new Error(payload?.message || "Failed to fetch claims")
      }

      return payload
    },
  })
}
