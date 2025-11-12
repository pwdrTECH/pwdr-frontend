"use client"

import { useQuery } from "@tanstack/react-query"
import apiClient from "./client"

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiClient.get("/dashboard/summary"),
  })
}

export function useClaims(filters?: any) {
  return useQuery({
    queryKey: ["claims", filters],
    queryFn: () =>
      apiClient.get("/claims", {
        method: "POST",
        body: JSON.stringify(filters || {}),
      }),
  })
}

export function useBeneficiaries(filters?: any) {
  return useQuery({
    queryKey: ["beneficiaries", filters],
    queryFn: () =>
      apiClient.get("/beneficiaries", {
        method: "POST",
        body: JSON.stringify(filters || {}),
      }),
  })
}
