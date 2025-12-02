"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

/* ========= Types ========= */

export type RequestChannel = "all" | "email" | "whatsapp" | "chat"
export type RequestStatusFilter = "all" | "unread" | "overdue" | "resolved"

export interface RequestFilters {
  page?: number
  limit?: number
  search?: string
  channel?: RequestChannel
  status?: RequestStatusFilter
}

export interface RequestListApiItem {
  id: string | number
  name?: string
  full_name?: string
  organisation?: string
  organization?: string
  company?: string
  provider?: string
  channel?: string
  status?: string
  read_status?: string
  timestamp?: string
  created_at?: string
  request_status?: string
  [key: string]: any
}

export interface RequestsPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface RequestFilters {
  search?: string
  channel?: RequestChannel
  status?: RequestStatusFilter
  page?: number
  limit?: number
}

export interface RequestsPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface RequestFilters {
  search?: string
  channel?: RequestChannel
  status?: RequestStatusFilter
  page?: number
  limit?: number
}
export interface RawRequestItem {
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
  diagnosis: string
  prescription: string | null
  radiology: string | null
  lab: string | null
  enrolee_first_name: string
  enrolee_surname: string
  enrolee_code: string
  enrolee_phone: string
  enrolee_email: string
  provider_name: string
  plan_name: string
  [key: string]: any
}

export interface RequestsPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface RequestsApiResponse {
  status: string // "success"
  data?: RawRequestItem[]
  pagination?: RequestsPagination
  message?: string
  [key: string]: any
}

/* ============================
    POST /fetch-requests.php
============================ */

export function useRequests(filters: RequestFilters = {}) {
  return useQuery({
    queryKey: ["requests", filters],
    queryFn: async (): Promise<RequestsApiResponse> => {
      const body = {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        search: filters.search ?? "",
        // backend may ignore these for now, but we send them anyway
        channel:
          !filters.channel || filters.channel === "all"
            ? ""
            : String(filters.channel),
        status:
          !filters.status || filters.status === "all"
            ? ""
            : String(filters.status),
      }

      const res = await apiClient.post<RequestsApiResponse>(
        "/fetch-requests.php",
        body
      )

      const payload = res.data
      if (!payload) {
        throw new Error("Failed to fetch requests")
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
/* ========= Detail: POST /fetch-request-details.php ========= */

export interface RequestDetailsApiResponse {
  status: string
  data?: any
  message?: string
  [key: string]: any
}
interface RequestDetailParams {
  claim_id?: number
  tracking_number?: string
}

export function useRequestDetails(params?: RequestDetailParams) {
  const enabled = Boolean(params?.claim_id || params?.tracking_number)

  return useQuery({
    enabled,
    queryKey: ["request-detail", params?.claim_id, params?.tracking_number],
    queryFn: async () => {
      const res = await apiClient.post("/fetch-request-details.php", params)
      return res.data
    },
  })
}
