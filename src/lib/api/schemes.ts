"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api/client"

type RawScheme = {
  id: number
  name: string
}

type FetchSchemesResponse = {
  status: string // "success"
  data: RawScheme[]
}

export function useSchemes() {
  return useQuery({
    queryKey: ["schemes"],
    queryFn: async () => {
      const res = await apiClient.get<FetchSchemesResponse>("/fetch-scheme.php")

      const body = res.data

      if (!body || body.status !== "success" || !Array.isArray(body.data)) {
        throw new Error("Failed to fetch schemes")
      }

      return body.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
