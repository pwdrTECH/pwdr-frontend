"use client"

import { apiClient } from "@/lib/api/client"
import type { SimpleApiResponse, Scheme } from "@/lib/api/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "../auth/hooks"

export interface ToggleEnrolleePayload {
  enrolee_id: string
}

export type CreatePlanServicePayload = {
  hmo_id: number
  name: string
  cost: string
  utilization_limit: string
  frequency_limit: string
  status?: string
  active?: number
  deleted?: number
}

export type UpdatePlanPayload = {
  plan_id: number
  name: string
  premium: string
  utilization_threshold: string
  days_to_activate: string | number
  active: number
}
export type CreatePlanPayload = {
  scheme_id: number
  name: string
  premium: string
  utilization_threshold: string
  days_to_activate: string
  services: CreatePlanServicePayload[]
}
type FetchSchemesResponse = {
  status: string
  data?: Scheme[]
  message?: string
}

export type Plan = {
  id: number
  name: string
  scheme_id?: number | string
  // add more fields from backend if you need them later
}

type FetchPlansEnvelope = {
  status: string
  data?: Plan[]
  message?: string
}

export interface PlanDetailsRequest {
  id: string | number
  show_services?: 0 | 1
}

export interface PlanDetailsResponse {
  status: string
  data: any
  message?: string
  [key: string]: any
}

/* ============================
    Fetch Schemes
============================ */

export function useSchemes() {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ["schemes"],
    queryFn: async (): Promise<Scheme[]> => {
      const response = await apiClient.get<FetchSchemesResponse>(
        "/fetch-scheme.php"
      )

      const apiResponse = response.data

      if (
        !apiResponse ||
        apiResponse.status !== "success" ||
        !apiResponse.data
      ) {
        throw new Error(apiResponse?.message || "Failed to fetch schemes")
      }

      return apiResponse.data
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })
}

/* ============================
    GET PLANS
============================ */

export function usePlansByScheme(schemeId?: number) {
  return useQuery({
    queryKey: ["plans", schemeId ?? "all"],
    queryFn: async (): Promise<Plan[]> => {
      const body = {
        page: 1,
        limit: 20,
        scheme_id: schemeId ? String(schemeId) : "",
      }

      const response = await apiClient.post<FetchPlansEnvelope>(
        "/fetch-plans.php",
        body
      )

      const apiResponse = response.data

      if (
        !apiResponse ||
        apiResponse.status !== "success" ||
        !apiResponse.data
      ) {
        throw new Error(apiResponse?.message || "Failed to fetch plans")
      }

      return apiResponse.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

/* ============================
    Create Plan
============================ */

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: CreatePlanPayload
    ): Promise<SimpleApiResponse> => {
      const body = {
        scheme_id: payload.scheme_id,
        name: payload.name,
        premium: payload.premium,
        utilization_threshold: payload.utilization_threshold,
        days_to_activate: payload.days_to_activate,
        services: payload.services.map((s) => ({
          status: "active",
          active: 1,
          deleted: 0,
          ...s,
        })),
      }

      const response = await apiClient.post<SimpleApiResponse>(
        "/new-plan.php",
        body
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
    Update Plan
============================ */

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: UpdatePlanPayload
    ): Promise<SimpleApiResponse> => {
      const response = await apiClient.post<SimpleApiResponse>(
        "/edit-plan.php",
        payload
      )

      const apiResponse = response.data

      if (!apiResponse || apiResponse.status !== "success") {
        throw new Error(apiResponse?.message || "Failed to update plan")
      }

      return apiResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })
      queryClient.invalidateQueries({ queryKey: ["plan-details"] })
      queryClient.invalidateQueries({ queryKey: ["schemes"] })
    },
  })
}
export function usePlanDetails(filters: PlanDetailsRequest) {
  return useQuery({
    queryKey: ["plan-details", filters],
    enabled: !!filters.id,
    queryFn: async (): Promise<PlanDetailsResponse> => {
      const body = {
        id: filters.id,
        show_services: filters.show_services ?? 1,
      }
      const res = await apiClient.post<PlanDetailsResponse>(
        "/fetch-plan-details.php",
        body
      )
      const payload = res.data

      if (!payload) throw new Error("Failed to fetch plan details")

      if (payload.status === "success") return payload

      throw new Error(payload.message || "Failed to fetch plan details")
    },
  })
}

export function useDeactivateEnrollee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      payload: ToggleEnrolleePayload
    ): Promise<SimpleApiResponse> => {
      const res = await apiClient.post<SimpleApiResponse>(
        "/deactivate-enrolee.php",
        payload
      )

      const apiResponse = res.data

      if (!apiResponse || apiResponse.status !== "success") {
        throw new Error(apiResponse?.message || "Failed to deactivate enrollee")
      }

      return apiResponse
    },
    onSuccess: (_data, variables) => {
      // refresh list
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] })
      // refresh details for this enrollee if you use this key shape
      if (variables.enrolee_id) {
        queryClient.invalidateQueries({
          queryKey: ["enrollee-details", { enrolee_id: variables.enrolee_id }],
        })
      }
    },
  })
}
