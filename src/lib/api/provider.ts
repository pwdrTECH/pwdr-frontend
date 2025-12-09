"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"
import type { SimpleApiResponse } from "./types"

export interface DeleteProviderPayload {
  provider_id: string
}
export interface EditProviderPayload {
  provider_id: string
  phone?: string
  address?: string
  plan_id?: number
  active?: number | 0 | 1
  [key: string]: any
}

export interface EditSimpleApiResponse {
  status: string
  message?: string
  data?: any
}

export interface ProviderFilters {
  page?: number
  limit?: number
  search?: string
  state?: string
  active?: 0 | 1 | number
}

export interface ProviderListItem {
  id: number
  name: string
  state?: string
  state_name?: string
  code?: string
  provider_code?: string
  external_id?: string
  channels?: string[] | null
  tariff_updated_at?: string | null
  [key: string]: any
}

export interface ProvidersPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface ProvidersApiResponse {
  status: string
  data?: ProviderListItem[]
  pagination?: ProvidersPagination
  message?: string
  [key: string]: any
}

export type UpdateProviderPayload = {
  plan_id: number
  name: string
  premium: string
  utilization_threshold: string
  days_to_activate: string | number
  active: number
}

export type CreateProviderPayload = {
  scheme_id: number
  name: string
  premium: string
  utilization_threshold: string
  days_to_activate: string
}

/* ========= Types ========= */

export interface HmoFilters {
  page?: number
  limit?: number
  search?: string
}

export interface HmoListItem {
  id: number | string
  name: string
  code?: string
  email?: string
  phone?: string
  address?: string
  status?: string
  [key: string]: any // allow backend extras
}

export interface HmoPagination {
  current_page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface HmoApiResponse {
  status: string // "success" | "empty" | "error" | ...
  data?: HmoListItem[]
  pagination?: HmoPagination
  message?: string
  [key: string]: any
}

export interface NewProviderPayload {
  name: string
  admin_email: string
  admin_phone: string
  street: string
  state_id: number
  state_name: string
  lga: string
  schemes: string[]
}

/* ------------------ List Providers ------------------ */

export function useProviders(filters: ProviderFilters = {}) {
  return useQuery({
    queryKey: ["providers", filters],
    queryFn: async (): Promise<ProvidersApiResponse> => {
      const body = {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        search: filters.search ?? "",
        state: filters.state ?? "",
        active:
          typeof filters.active === "number" ? Number(filters.active) : "",
      }

      const res = await apiClient.post<ProvidersApiResponse>(
        "/fetch-providers.php",
        body
      )

      const payload = res.data

      if (!payload) {
        throw new Error("Failed to fetch providers")
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
            } as ProvidersPagination),
        }
      }

      throw new Error(payload.message || "Failed to fetch providers")
    },
  })
}

/* ============================
    Create Plan (existing)
============================ */

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: CreateProviderPayload
    ): Promise<SimpleApiResponse> => {
      const response = await apiClient.post<SimpleApiResponse>(
        "/new-provider.php",
        payload
      )

      const apiResponse = response.data

      if (!apiResponse || apiResponse.status !== "success") {
        if (apiResponse?.status === "exist") {
          throw new Error("Plan already exists for this scheme")
        }
        throw new Error(apiResponse?.message || "Failed to create plan")
      }

      return apiResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] })
    },
  })
}

/* ============================
    NEW: POST /new-provider.php (Add Provider)
============================ */

export function useCreateProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: NewProviderPayload
    ): Promise<SimpleApiResponse> => {
      const res = await apiClient.post<SimpleApiResponse>(
        "/new-provider.php",
        payload
      )

      const apiResponse = res.data

      if (!apiResponse || apiResponse.status !== "success") {
        if (apiResponse?.status === "exist") {
          throw new Error(apiResponse?.message || "Provider already exists")
        }
        throw new Error(apiResponse?.message || "Failed to create provider")
      }

      return apiResponse
    },
    onSuccess: () => {
      // Refresh provider list so the new one appears
      queryClient.invalidateQueries({ queryKey: ["providers"] })
    },
  })
}

/* ============================
    POST /edit-provider.php
============================ */

export function useEditProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: EditProviderPayload
    ): Promise<EditSimpleApiResponse> => {
      const res = await apiClient.post<EditSimpleApiResponse>(
        "/edit-provider.php",
        payload
      )
      const apiResponse = res.data

      if (!apiResponse || apiResponse.status !== "success") {
        throw new Error(apiResponse?.message || "Failed to edit provider")
      }

      return apiResponse
    },
    onSuccess: (_data, variables) => {
      // Refresh provider list
      queryClient.invalidateQueries({ queryKey: ["providers"] })
      if (variables.provider_id) {
        queryClient.invalidateQueries({
          queryKey: [
            "provider-details",
            { provider_id: variables.provider_id },
          ],
        })
      }
    },
  })
}

/* ============================
    POST /delete-provider.php
============================ */

export function useDeleteProvider() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: DeleteProviderPayload
    ): Promise<SimpleApiResponse> => {
      const res = await apiClient.post<SimpleApiResponse>(
        "/delete-provider.php",
        payload
      )

      const apiResponse = res.data

      if (!apiResponse || apiResponse.status !== "success") {
        throw new Error(apiResponse?.message || "Failed to delete provider")
      }

      return apiResponse
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["providers"] })

      if (variables.provider_id) {
        queryClient.invalidateQueries({
          queryKey: [
            "provider-details",
            { provider_id: variables.provider_id },
          ],
        })
      }
    },
  })
}

/* ========= Hook ========= */

export function useHmos(filters: HmoFilters = {}) {
  return useQuery({
    queryKey: ["hmos", filters],
    queryFn: async (): Promise<HmoApiResponse> => {
      const body = {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        search: filters.search ?? "",
      }

      const res = await apiClient.post<HmoApiResponse>("/fetch-hmo.php", body)

      const payload = res.data

      if (!payload) {
        throw new Error("Failed to fetch HMOs")
      }

      const defaultPagination: HmoPagination = {
        current_page: body.page,
        per_page: body.limit,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      }

      if (payload.status === "success") {
        return {
          ...payload,
          data: Array.isArray(payload.data) ? payload.data : [],
          pagination: payload.pagination ?? defaultPagination,
        }
      }

      if (payload.status === "empty") {
        return {
          ...payload,
          status: "success",
          data: [],
          pagination: payload.pagination ?? defaultPagination,
        }
      }

      throw new Error(payload.message || "Failed to fetch HMOs")
    },
  })
}
