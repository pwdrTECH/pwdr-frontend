"use client"

import { useQuery } from "@tanstack/react-query"
import apiClient from "./client"

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiClient.get("/dashboard/summary"),
  })
}
